import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { triggerHaptic, IOS_SPRING } from '../utils/haptics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InterviewSimulatorDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  useScrollLock(isOpen);

  const [category, setCategory] = useState('Asset Management');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStart = async () => {
    setMessages([]);
    setIsLoading(true);
    try {
      const response = await fetch('/api/interview-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, history: [] })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.nextQuestion) {
        setMessages([{ role: 'ai', text: data.nextQuestion }]);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    const newHistory = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/interview-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, history: newHistory })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      const aiResponseText = `${data.feedback ? `**Feedback:** ${data.feedback}\n\n` : ''}${data.nextQuestion ? `**Next Question:** ${data.nextQuestion}` : ''}`;
      
      setMessages([...newHistory, { role: 'ai', text: aiResponseText }]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.8, right: 0 }}
        onDragEnd={(_: any, info: PanInfo) => {
          if (info.offset.x > 100 || info.velocity.x > 200) {
            triggerHaptic(15);
            onClose();
          }
        }}
        transition={IOS_SPRING}
        className="fixed inset-y-0 right-0 z-[90] w-full max-w-md glass-panel shadow-2xl flex flex-col border-l border-[var(--border)]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">AI Interviewer</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--border)] text-[var(--text-secondary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b border-[var(--border)] bg-[rgba(255,255,255,0.02)]">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Target Role</label>
          <div className="flex gap-2">
            <select value={category} onChange={e => setCategory(e.target.value)} className="apple-input bg-[var(--surface-solid)] text-sm p-2 flex-1 border-transparent">
              <option>Asset Management</option>
              <option>Investment Banking (M&A)</option>
              <option>Audit & Assurance</option>
              <option>Consulting</option>
            </select>
            <button onClick={handleStart} className="bg-[var(--text-primary)] text-[var(--bg)] px-4 py-2 rounded-lg text-sm font-bold">Start</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-[var(--text-secondary)] mt-10 text-sm">
              Select a role and click Start to begin the mock interview.
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-emerald-500/10 text-[var(--text-primary)]' : 'glass-panel border border-[var(--border)]'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl glass-panel border border-[var(--border)] flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-[var(--border)]">
          <div className="relative">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type your answer..."
              className="w-full apple-input bg-[var(--surface-solid)] border-transparent resize-none p-3 pr-12 h-20 text-sm"
              disabled={isLoading || messages.length === 0}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim() || messages.length === 0}
              className="absolute right-2 bottom-2 p-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg)] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
