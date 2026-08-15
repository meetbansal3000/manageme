import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Archive, Download, GripVertical, AlertTriangle } from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';

interface Props {
  items: any[];
  userData: UserTrackerData;
  updateData: (d: Partial<UserTrackerData>) => void;
}

export const ExtraItemsCard: React.FC<Props> = ({ items = [], userData, updateData }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !items || items.length === 0) return null;

  const dismissItem = (idx: number) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    updateData({ extraItems: newItems });
  };

  const exportAsNote = () => {
    const text = items.map(i => JSON.stringify(i)).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extra_items.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 left-4 z-40 w-[350px] max-h-[400px] flex flex-col glass-panel border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="bg-white/5 border-b border-[var(--border)] p-3 flex justify-between items-center cursor-move">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <Archive className="w-4 h-4 text-orange-400" />
          Uncategorized Extra Items ({items.length})
        </div>
        <div className="flex items-center gap-1">
          <button onClick={exportAsNote} className="p-1 hover:bg-white/10 rounded-md transition-colors" title="Export as standalone note">
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-white/10 rounded-md transition-colors" title="Hide (Exit)">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-black/20 border border-[var(--border)] group relative">
            <button 
              onClick={() => dismissItem(idx)}
              className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="text-xs font-mono text-gray-400 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-500" /> Unmapped Data
            </div>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans">
              {JSON.stringify(item, null, 2)}
            </pre>
            
            <div className="mt-2 pt-2 border-t border-[var(--border)] flex gap-2">
              <button className="text-[10px] font-semibold px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-[var(--border)] transition-colors">
                Map to Shifts
              </button>
              <button className="text-[10px] font-semibold px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-[var(--border)] transition-colors">
                Map to Expenses
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
