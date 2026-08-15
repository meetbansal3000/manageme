import React, { useState } from 'react';
import { X, Search, CheckCircle, ChevronRight, ChevronLeft, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface Props {
  moduleId: string;
  onClose: () => void;
  onComplete: () => void;
}

const LESSONS: Record<string, { title: string; content: React.ReactNode[]; quiz: any[] }> = {
  theory: {
    title: 'Core Trading Theory',
    content: [
      <div key="1" className="space-y-4">
        <h3 className="text-xl font-bold">Bid-Ask Spreads & Liquidity</h3>
        <p className="text-gray-300">The spread is the difference between the highest price a buyer is willing to pay (bid) and the lowest price a seller is willing to accept (ask).</p>
        <p className="text-gray-300">Highly liquid markets (like AAPL) have narrow spreads (1-2 cents). Illiquid markets have wide spreads, causing <strong>slippage</strong>.</p>
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <strong>Pro Tip:</strong> Avoid market orders on illiquid stocks to prevent massive slippage.
        </div>
      </div>,
      <div key="2" className="space-y-4">
        <h3 className="text-xl font-bold">CAPM & Beta</h3>
        <p className="text-gray-300">CAPM Formula: <code>E(R) = Rf + β(Rm - Rf)</code></p>
        <p className="text-gray-300">Beta (β) measures volatility compared to the market. β=1 means it moves with the market. β=2 means it is twice as volatile.</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-500/30">
          <Search className="w-4 h-4" /> Fetch Live AAPL Beta
        </button>
      </div>
    ],
    quiz: [
      { q: 'What does a Beta of 1.5 indicate?', options: ['50% less volatile than market', '50% more volatile than market', 'No correlation'], ans: 1 }
    ]
  },
  statements: {
    title: 'Financial Statements',
    content: [
      <div key="1" className="space-y-4">
        <h3 className="text-xl font-bold">The Big Three</h3>
        <ul className="list-disc pl-5 text-gray-300 space-y-2">
          <li><strong>Income Statement:</strong> Shows profitability over a period (Revenues - Expenses = Net Income).</li>
          <li><strong>Balance Sheet:</strong> Snapshot of financial position (Assets = Liabilities + Equity).</li>
          <li><strong>Cash Flow Statement:</strong> Shows actual cash generated or used (Operating, Investing, Financing).</li>
        </ul>
      </div>,
      <div key="2" className="space-y-4">
        <h3 className="text-xl font-bold">Key Metrics Matrix</h3>
        <ul className="list-disc pl-5 text-gray-300 space-y-2">
          <li><strong>ROE (Return on Equity):</strong> Net Income / Shareholder's Equity. How effectively management uses capital.</li>
          <li><strong>Current Ratio:</strong> Current Assets / Current Liabilities. Short-term liquidity.</li>
        </ul>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-500/30">
          <Search className="w-4 h-4" /> Fetch Latest SEC Filings Case Study
        </button>
      </div>
    ],
    quiz: [
      { q: 'Which statement shows a snapshot at a specific point in time?', options: ['Income Statement', 'Balance Sheet', 'Cash Flow Statement'], ans: 1 }
    ]
  },
  valuation: {
    title: 'Valuation Sandbox',
    content: [
      <div key="1" className="space-y-4">
        <h3 className="text-xl font-bold">Relative Valuation</h3>
        <p className="text-gray-300">Using multiples to value companies against peers.</p>
        <ul className="list-disc pl-5 text-gray-300 space-y-2">
          <li><strong>P/E Ratio:</strong> Price per Share / Earnings per Share. Used for companies with positive earnings.</li>
          <li><strong>EV/EBITDA:</strong> Enterprise Value / EBITDA. Capital structure neutral, good for M&A.</li>
        </ul>
      </div>,
      <div key="2" className="space-y-4">
        <h3 className="text-xl font-bold">DCF Sandbox</h3>
        <p className="text-gray-300">Discounted Cash Flow: Value = Sum of PV of Future Cash Flows + PV of Terminal Value.</p>
        <div className="bg-gray-800 p-4 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between"><span>WACC:</span> <input type="number" defaultValue="8" className="w-16 bg-black p-1 rounded" />%</div>
          <div className="flex justify-between"><span>Growth (g):</span> <input type="number" defaultValue="2" className="w-16 bg-black p-1 rounded" />%</div>
          <div className="flex justify-between font-bold"><span>Implied Value:</span> <span>$145.20</span></div>
        </div>
      </div>
    ],
    quiz: [
      { q: 'Which multiple is capital structure neutral?', options: ['P/E Ratio', 'EV/EBITDA', 'Price to Book'], ans: 1 }
    ]
  }
};

export const GrowwTradingAcademyModal: React.FC<Props> = ({ moduleId, onClose, onComplete }) => {
  useModalDismiss(true, onClose);

  const [step, setStep] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  
  const moduleData = LESSONS[moduleId];
  if (!moduleData || !moduleData.content || !moduleData.quiz) return null;

  const totalSteps = moduleData.content?.length || 0;
  const isQuiz = step === totalSteps;

  const handleNext = () => {
    if (isQuiz) {
      if (selectedAns === moduleData.quiz[0].ans) {
        onComplete();
        onClose();
      } else {
        alert("Incorrect answer. Please review the material.");
        setStep(0);
        setSelectedAns(null);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-[#111114] border border-[#2A2A2D] rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-[#18181B] border border-[#2A2A2D] shadow text-gray-400 hover:text-white rounded-full z-20">
          <X className="w-5 h-5" />
        </button>
        <div className="p-4 border-b border-[#2A2A2D] flex justify-between items-center bg-[#18181B]">
          <h2 className="text-xl font-bold text-white pr-10">{moduleData.title}</h2>
        </div>
        
        <div className="p-6 flex-1 min-h-[300px] max-h-[70vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {!isQuiz ? (
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {moduleData.content[step]}
              </motion.div>
            ) : (
              <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2"><CheckCircle className="w-6 h-6" /> Knowledge Check</h3>
                <p className="text-gray-200 text-lg">{moduleData.quiz[0].q}</p>
                <div className="space-y-3">
                  {moduleData.quiz[0].options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedAns(i)}
                      className={`w-full text-left p-4 rounded-xl border ${selectedAns === i ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-[#2A2A2D] hover:bg-[#2A2A2D] text-gray-300'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="p-4 border-t border-[#2A2A2D] bg-[#18181B] flex justify-between items-center">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps + 1 }).map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full ${i === step ? 'w-6 bg-emerald-500' : i < step ? 'w-4 bg-emerald-500/50' : 'w-4 bg-gray-700'} transition-all`} />
            ))}
          </div>
          <button 
            onClick={handleNext} 
            disabled={isQuiz && selectedAns === null}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50"
          >
            {isQuiz ? 'Submit & Complete' : 'Next'} {isQuiz ? <CheckCircle className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
