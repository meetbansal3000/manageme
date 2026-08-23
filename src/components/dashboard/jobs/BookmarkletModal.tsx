// Component: 1-Click Job Ingestion Bookmarklet Setup Modal

import React, { useState } from 'react';
import { 
  Bookmark, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Info, 
  X, 
  Layers,
  ArrowRight,
  MousePointer
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { toast } from '../../ui/Toast';

export interface BookmarkletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BOOKMARKLET_CODE = `javascript:(function(){var t=encodeURIComponent(document.title);var u=encodeURIComponent(window.location.href);var s=encodeURIComponent(window.getSelection().toString()||document.body.innerText.substring(0,3500));window.open('https://manageme-three.vercel.app/#jobs?importTitle='+t+'&importUrl='+u+'&importText='+s,'_blank');})();`;

export const BookmarkletModal: React.FC<BookmarkletModalProps> = ({
  isOpen,
  onClose
}) => {
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(BOOKMARKLET_CODE);
    setHasCopied(true);
    toast.success('Bookmarklet JavaScript copied to clipboard!');
    setTimeout(() => setHasCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card 
        variant="glass" 
        padding="lg" 
        className="w-full max-w-xl border border-white/20 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-mono text-white flex items-center gap-1.5">
                <span>1-Click Job Ingestion Bookmarklet</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Instantly import job postings from LinkedIn, Indeed & career portals into ManageMe.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Draggable Button Section */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/30 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-mono font-semibold">
            <MousePointer className="w-3.5 h-3.5" />
            <span>Step 1: Drag to Bookmarks Bar</span>
          </div>

          <p className="text-xs font-mono text-slate-300 max-w-md mx-auto">
            Click and drag this button up directly into your browser's <strong>Bookmarks Toolbar</strong> (or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">Ctrl+Shift+B</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">Cmd+Shift+B</kbd> to show bookmarks bar):
          </p>

          <div className="pt-2 flex justify-center">
            <a
              href={BOOKMARKLET_CODE}
              onClick={(e) => {
                // If clicked instead of dragged, notify user
                e.preventDefault();
                toast.info('Drag this button to your Bookmarks Toolbar at the top of your browser!');
              }}
              draggable="true"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl cursor-grab active:cursor-grabbing font-mono font-bold text-sm shadow-xl shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 hover:scale-105 active:scale-95 transition-all select-none border border-white/20"
              title="Drag this button to your bookmarks toolbar"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>⚡ Save to ManageMe</span>
            </a>
          </div>

          <p className="text-[11px] font-mono text-slate-400 italic">
            Tip: You can also right-click and choose "Bookmark This Link".
          </p>
        </div>

        {/* How It Works Instructions */}
        <div className="space-y-3 font-mono text-xs">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>How to Ingest Jobs in 1 Click:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px]">
                1
              </span>
              <p className="font-bold text-white text-[11px]">Browse Any Job</p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Open any job page on LinkedIn, Indeed, eFinancialCareers, or GS/JPMorgan careers.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px]">
                2
              </span>
              <p className="font-bold text-white text-[11px]">Click Bookmarklet</p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Click <strong>"⚡ Save to ManageMe"</strong> on your bookmarks bar.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px]">
                3
              </span>
              <p className="font-bold text-white text-[11px]">AI Auto-Populates</p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                ManageMe extracts the firm, role, deadline, and salary into your Career Vault.
              </p>
            </div>
          </div>
        </div>

        {/* Manual Code Option */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3 font-mono text-xs">
          <div className="truncate text-slate-400 text-[11px]">
            <span className="text-white font-semibold block">Manual Setup:</span>
            <span className="truncate block opacity-60">{BOOKMARKLET_CODE.substring(0, 50)}...</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="text-xs shrink-0"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy Code
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-white/10">
          <Button variant="ghost" onClick={onClose} className="text-xs font-mono">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BookmarkletModal;
