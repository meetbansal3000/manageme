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

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="flex h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] w-full rounded-2xl overflow-hidden glass-panel border border-[var(--border)] relative">
      {/* Sidebar (Desktop permanent, Mobile off-canvas / overlay) */}
      <div className={`
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        fixed md:static inset-y-0 left-0 z-30 md:z-auto w-72 sm:w-80 max-w-[85vw]
        border-r border-[var(--border)] bg-slate-900/95 dark:bg-slate-950/95 md:bg-black/20
        backdrop-blur-2xl md:backdrop-blur-none flex flex-col transition-transform duration-300 ease-out shadow-2xl md:shadow-none
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Peer Community
          </h2>
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Channel List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
          <div>
            <h3 className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
              Global Channels
            </h3>
            <div className="space-y-1">
              {GLOBAL_CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChannelId(ch.id);
                    setShowMobileSidebar(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    activeChannelId === ch.id 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold' 
                      : 'hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate">{ch.name}</span>
                  {ch.id === 'general-discussion' && activeChannelId !== ch.id && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold shrink-0">2</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
              Direct Messages
            </h3>
            <div className="space-y-1">
              {users.map((u, i) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setActiveChannelId(u.id);
                    setShowMobileSidebar(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    activeChannelId === u.id 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold' 
                      : 'hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-[10px] font-bold">
                        {u.name[0]}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-1 ring-slate-900 ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    </div>
                    <span className="truncate">{u.name}</span>
                  </div>
                  {i === 0 && activeChannelId !== u.id && (
                    <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold shrink-0">1</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop for Sidebar */}
      {showMobileSidebar && (
        <div
          onClick={() => setShowMobileSidebar(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-20 md:hidden"
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black/40 min-w-0 w-full relative">
        {/* Chat Header */}
        <div className="p-3 sm:p-4 border-b border-[var(--border)] flex justify-between items-center bg-black/20 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile Channel Sidebar Toggle */}
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
              title="View Channels & Peers"
            >
              <span># Channels</span>
            </button>
            <h3 className="font-bold text-sm sm:text-base text-white truncate">
              {GLOBAL_CHANNELS.find(c => c.id === activeChannelId)?.name || users.find(u => u.id === activeChannelId)?.name || 'Chat'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline font-mono">Live Sync Active</span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.senderId === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-slate-400 mb-1 mx-1 font-mono">
                {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className={`max-w-[88%] sm:max-w-[75%] p-3 rounded-2xl break-words ${
                msg.senderId === auth.currentUser?.uid 
                  ? 'bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-500/10' 
                  : 'bg-white/10 text-slate-200 border border-[var(--border)] rounded-tl-xs backdrop-blur-md'
              }`}>
                {msg.text && <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                
                {msg.mediaType === 'image' && msg.mediaUrl && (
                  <ZoomableImage src={msg.mediaUrl} alt="attachment" className="mt-2 rounded-xl max-h-60 object-cover" />
                )}
                {msg.mediaType === 'video' && msg.mediaUrl && (
                  <video src={msg.mediaUrl} controls className="mt-2 rounded-xl max-h-60 w-full" />
                )}
                {msg.mediaType === 'audio' && msg.mediaUrl && (
                  <audio src={msg.mediaUrl} controls className="mt-2 h-8 w-full max-w-full" />
                )}
                {msg.mediaType === 'location' && msg.mediaUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-white/20">
                    <img src={msg.mediaUrl} alt="Map location" className="w-full h-32 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 flex items-center gap-1 text-xs font-bold text-white">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" /> Shared Location
                    </div>
                  </div>
                )}
                
                {msg.sharedCard && (
                  <div className="mt-2 p-3 bg-black/40 rounded-xl border border-white/10 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{msg.sharedCard.type} shared</span>
                    <strong className="text-xs sm:text-sm text-white">{msg.sharedCard.title}</strong>
                    <p className="text-xs text-slate-300 line-clamp-2">{msg.sharedCard.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Share Indicator */}
        {pendingShare && (
          <div className="mx-3 sm:mx-4 mb-2 p-2.5 sm:p-3 bg-blue-500/20 border border-blue-500/40 rounded-xl flex justify-between items-center backdrop-blur-md">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold text-blue-400">Ready to Share: {pendingShare.type}</span>
              <span className="text-xs text-slate-200 truncate">{pendingShare.title}</span>
            </div>
            <button onClick={clearPendingShare} className="p-1 hover:bg-white/10 rounded-md text-slate-300 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Area (Fully flex-fitted, never clips on mobile) */}
        <div className="p-2.5 sm:p-4 border-t border-[var(--border)] bg-black/20 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-1.5 sm:gap-2 items-center">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
            
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer" 
                title="Attach Media"
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                type="button" 
                onClick={handleLocationShare} 
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer" 
                title="Share Location"
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                type="button" 
                onClick={toggleRecording} 
                className={`p-2 rounded-full transition-colors cursor-pointer ${isRecording ? 'text-red-500 bg-red-500/20 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-white/10'}`} 
                title="Voice Note"
              >
                {isRecording ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>

            <input 
              type="text" 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 min-w-0 bg-black/40 border border-[var(--border)] rounded-full px-3.5 sm:px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
            />
            
            <button 
              type="submit" 
              disabled={!newMessage.trim() && !pendingShare} 
              className="p-2 sm:p-2.5 bg-blue-600 text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors shrink-0 cursor-pointer shadow-md shadow-blue-500/20"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
