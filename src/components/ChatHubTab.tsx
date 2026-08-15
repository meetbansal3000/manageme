import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { Send, Image as ImageIcon, MapPin, Mic, MicOff, Paperclip, X, Lock } from 'lucide-react';
import { ChatMessage, ChatUser } from '../types';
import { useUser } from '../context/UserContext';
import { ZoomableImage } from './ZoomableImage';

interface Props {
  userData: UserTrackerData;
  updateData: (d: Partial<UserTrackerData>) => void;
  pendingShare: any;
  clearPendingShare: () => void;
}

const GLOBAL_CHANNELS = [
  { id: 'general-discussion', name: '#general-discussion' },
  { id: 'finance-interviews', name: '#finance-interviews' },
  { id: 'travel-and-trips', name: '#travel-and-trips' },
  { id: 'trading-ideas', name: '#trading-ideas' }
];

const mockPeers: ChatUser[] = [
  { id: 'peer-1', name: 'Alex M.', isOnline: true, lastActive: Date.now() },
  { id: 'peer-2', name: 'Oliver K.', isOnline: true, lastActive: Date.now() },
  { id: 'peer-3', name: 'Chen W.', isOnline: false, lastActive: Date.now() - 3600000 },
  { id: 'peer-4', name: 'Amira H.', isOnline: true, lastActive: Date.now() }
];

export const ChatHubTab: React.FC<Props> = ({ userData, updateData, pendingShare, clearPendingShare }) => {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [activeChannelId, setActiveChannelId] = useState<string>('general-discussion');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>(mockPeers);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setCurrentUser(usr);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Messages for active channel
  useEffect(() => {
    if (!currentUser) {
      setMessages([
        {
          id: 'welcome-demo-msg',
          channelId: activeChannelId,
          senderId: 'system',
          senderName: `${user.degree || 'Academic'} Peer Community`,
          text: `Welcome to the #${activeChannelId} peer channel! Connect with ${user.degree || 'Degree Program'} classmates at ${user.university || 'University'}, share application strategies, and exchange interview insights.\n\nTip: Sign in with Google to participate in live cloud discussions.`,
          timestamp: Date.now() - 1800000
        }
      ]);
      return;
    }

    const q = query(
      collection(db, 'channels', activeChannelId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach(doc => {
          msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        setMessages(msgs);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      },
      (error) => {
        console.warn('Channel messages snapshot listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [activeChannelId, currentUser]);

  const handleSendMessage = async (e?: React.FormEvent, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio' | 'location', sharedCard?: any) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !mediaUrl && !sharedCard && !pendingShare) return;

    const user = auth.currentUser;
    if (!user) {
      // Local demo message fallback
      const demoMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        channelId: activeChannelId,
        senderId: 'local-guest',
        senderName: 'You (Guest)',
        text: newMessage,
        timestamp: Date.now(),
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        sharedCard: sharedCard || pendingShare || null
      };
      setMessages(prev => [...prev, demoMsg]);
      setNewMessage('');
      if (pendingShare) clearPendingShare();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }

    try {
      await addDoc(collection(db, 'channels', activeChannelId, 'messages'), {
        channelId: activeChannelId,
        senderId: user.uid,
        senderName: user.displayName || user.email?.split('@')[0] || 'Unknown',
        text: newMessage,
        timestamp: Date.now(),
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        sharedCard: sharedCard || pendingShare || null
      });
      setNewMessage('');
      if (pendingShare) clearPendingShare();
    } catch (err) {
      console.warn("Error sending message to channel", err);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('media', file);
    try {
      const res = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.url;
    } catch (e) {
      console.error("Upload failed", e);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) {
      const type = file.type.startsWith('video') ? 'video' : 'image';
      await handleSendMessage(undefined, url, type);
    }
  };

  const handleLocationShare = async () => {
    // Mocking location for speed, can use geolocation API
    const mockMapUrl = "https://www.mapquestapi.com/staticmap/v5/map?key=Gmjtd%7Cluur2q0z2g%2C2a%3Do5-lzy2h&center=54.7753,-1.5849&zoom=14&size=400,200";
    await handleSendMessage(undefined, mockMapUrl, 'location');
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        mediaRecorder.current = mr;
        audioChunks.current = [];
        mr.ondataavailable = e => audioChunks.current.push(e.data);
        mr.onstop = async () => {
          const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
          const file = new File([blob], 'audio.webm', { type: 'audio/webm' });
          const url = await uploadFile(file);
          if (url) {
            await handleSendMessage(undefined, url, 'audio');
          }
        };
        mr.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Could not start recording", err);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full rounded-2xl overflow-hidden glass-panel border border-[var(--border)]">
      {/* Sidebar */}
      <div className="w-1/3 max-w-[300px] border-r border-[var(--border)] bg-black/20 flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold">Peer Community</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Global Channels</h3>
            {GLOBAL_CHANNELS.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannelId(ch.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeChannelId === ch.id ? 'bg-[var(--accent)] text-white' : 'hover:bg-white/5 text-gray-300'}`}
              >
                <span>{ch.name}</span>
                {ch.id === 'general-discussion' && activeChannelId !== ch.id && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">2</span>
                )}
              </button>
            ))}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Direct Messages</h3>
            {users.map((u, i) => (
              <button
                key={u.id}
                onClick={() => setActiveChannelId(u.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeChannelId === u.id ? 'bg-[var(--accent)] text-white' : 'hover:bg-white/5 text-gray-300'}`}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px] text-white">
                      {u.name[0]}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black ${u.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                  <span>{u.name}</span>
                </div>
                {i === 0 && activeChannelId !== u.id && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">1</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black/40 relative">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-black/20">
          <h3 className="font-bold text-lg">
            {GLOBAL_CHANNELS.find(c => c.id === activeChannelId)?.name || users.find(u => u.id === activeChannelId)?.name || 'Chat'}
          </h3>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.senderId === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-gray-500 mb-1 mx-1">{msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <div className={`max-w-[75%] p-3 rounded-2xl ${msg.senderId === auth.currentUser?.uid ? 'bg-[var(--accent)] text-white rounded-tr-sm' : 'bg-white/10 text-gray-200 border border-[var(--border)] rounded-tl-sm'}`}>
                {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                
                {msg.mediaType === 'image' && msg.mediaUrl && (
                  <ZoomableImage src={msg.mediaUrl} alt="attachment" className="mt-2 rounded-xl max-h-60" />
                )}
                {msg.mediaType === 'video' && msg.mediaUrl && (
                  <video src={msg.mediaUrl} controls className="mt-2 rounded-xl max-h-60" />
                )}
                {msg.mediaType === 'audio' && msg.mediaUrl && (
                  <audio src={msg.mediaUrl} controls className="mt-2 h-8" />
                )}
                {msg.mediaType === 'location' && msg.mediaUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-white/20">
                    <img src={msg.mediaUrl} alt="Map location" className="w-full h-32 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 flex items-center gap-1 text-xs font-bold text-white">
                      <MapPin className="w-3 h-3 text-red-400" /> Shared Location
                    </div>
                  </div>
                )}
                
                {msg.sharedCard && (
                  <div className="mt-2 p-3 bg-black/40 rounded-xl border border-white/10 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">{msg.sharedCard.type} shared</span>
                    <strong className="text-sm">{msg.sharedCard.title}</strong>
                    <p className="text-xs text-gray-300 line-clamp-2">{msg.sharedCard.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Share Indicator */}
        {pendingShare && (
          <div className="mx-4 mb-2 p-3 bg-[var(--accent)]/20 border border-[var(--accent)] rounded-xl flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[var(--accent)]">Ready to Share: {pendingShare.type}</span>
              <span className="text-sm truncate">{pendingShare.title}</span>
            </div>
            <button onClick={clearPendingShare} className="p-1 hover:bg-black/20 rounded-md">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--border)] bg-black/20">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
            
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Attach Media">
              <Paperclip className="w-5 h-5" />
            </button>
            <button type="button" onClick={handleLocationShare} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Share Location">
              <MapPin className="w-5 h-5" />
            </button>
            <button type="button" onClick={toggleRecording} className={`p-2 rounded-full transition-colors ${isRecording ? 'text-red-500 bg-red-500/20 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Voice Note">
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input 
              type="text" 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 bg-black/40 border border-[var(--border)] rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
            
            <button type="submit" disabled={!newMessage.trim() && !pendingShare} className="p-2 bg-[var(--accent)] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
