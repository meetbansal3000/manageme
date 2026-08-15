import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, Loader2 } from 'lucide-react';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: any) => void;
}

export const SmartTextarea: React.FC<Props> = ({ value, onChange, className, ...props }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [suggestion, setSuggestion] = useState<{ corrected: string, hasTypos: boolean } | null>(null);

  useEffect(() => {
    // Reset suggestion if user types
    if (suggestion && suggestion.corrected !== value) {
      setSuggestion(null);
    }
  }, [value]);

  const handleCheck = async () => {
    if (!value.trim()) return;
    setIsChecking(true);
    setSuggestion(null);
    try {
      const res = await fetch('/api/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: value })
      });
      const data = await res.json();
      if (data.corrected && data.corrected !== value) {
        setSuggestion(data);
      } else {
        // No major corrections
        setSuggestion({ corrected: value, hasTypos: false });
        setTimeout(() => setSuggestion(null), 3000); // clear after 3s
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsChecking(false);
    }
  };

  const applyCorrection = () => {
    if (suggestion) {
      onChange({ target: { value: suggestion.corrected } });
      setSuggestion(null);
    }
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={onChange}
        className={`w-full bg-black/20 border border-[var(--border)] rounded-xl p-3 text-sm focus:border-[var(--accent)] transition-colors resize-none ${className || ''}`}
        {...props}
      />
      <div className="absolute bottom-2 right-2">
        <button
          onClick={handleCheck}
          disabled={isChecking || !value}
          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-[var(--accent)] transition-colors disabled:opacity-50"
          title="AI Spellcheck & Refine"
        >
          {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        </button>
      </div>
      
      {suggestion && suggestion.corrected !== value && (
        <div className="absolute top-full left-0 mt-2 z-10 w-full bg-black/80 backdrop-blur-md border border-[var(--accent)] rounded-lg p-3 shadow-xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-[var(--accent)] flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Suggestion</span>
            <div className="flex items-center gap-1">
              <button onClick={applyCorrection} className="p-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded"><Check className="w-3 h-3"/></button>
              <button onClick={() => setSuggestion(null)} className="p-1 bg-white/5 text-gray-400 hover:text-white rounded"><X className="w-3 h-3"/></button>
            </div>
          </div>
          <p className="text-sm text-gray-200">{suggestion.corrected}</p>
        </div>
      )}
    </div>
  );
};
