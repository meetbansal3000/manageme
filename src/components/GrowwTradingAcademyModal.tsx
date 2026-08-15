import React, { useState } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Calculator, 
  BookOpen, 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  BarChart2, 
  DollarSign, 
  Sparkles,
  HelpCircle,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface Props {
  moduleId: string;
  onClose: () => void;
  onComplete: () => void;
}

interface ModuleContent {
  title: string;
  badge: string;
  category: string;
  summary: string;
  sections: Array<{
    heading: string;
    description: string;
    keyTakeaway?: string;
    bulletPoints?: string[];
    example?: string;
  }>;
  calculatorType?: 'capm' | 'ratios' | 'dcf' | 'mna';
  quiz: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

const ACADEMY_MODULES: Record<string, ModuleContent> = {
  theory: {
    title: 'Core Trading Theory & Market Mechanics',
    badge: 'Module 1',
    category: 'Market Structure & Risk',
    summary: 'Master order book dynamics, slippage management, Capital Asset Pricing Model (CAPM), Beta calculation, and Modern Portfolio Theory.',
    sections: [
      {
        heading: '1. Bid-Ask Spread & Order Books',
        description: 'The bid is the highest price a buyer is willing to pay; the ask is the lowest price a seller is willing to accept. The difference is the spread, representing transaction cost and market liquidity.',
        keyTakeaway: 'High-liquidity mega-caps (e.g. AAPL, NVDA) have tight 1-cent spreads; illiquid small-caps have wider spreads prone to execution slippage.',
        bulletPoints: [
          'Market Order: Guarantees immediate execution at best available market price, but vulnerable to slippage during volatility.',
          'Limit Order: Guarantees execution price or better, but carries execution risk if the price is never touched.',
          'Slippage: Difference between expected execution price and actual executed price, amplified in fast-moving markets.'
        ],
        example: 'If AAPL Bid is $230.10 and Ask is $230.12, the spread is $0.02 (0.008%). A large market order of 50,000 shares will clear Level 2 ask orders up to $230.25, creating 13 cents of slippage.'
      },
      {
        heading: '2. CAPM, Beta & Modern Portfolio Theory (MPT)',
        description: 'The Capital Asset Pricing Model calculates expected return as a function of systematic non-diversifiable risk (Beta): E(R) = Rf + β * (Rm - Rf).',
        keyTakeaway: 'Beta measures volatility relative to the benchmark. A portfolio with uncorrelated assets shifts the efficient frontier to higher risk-adjusted returns (Sharpe Ratio).',
        bulletPoints: [
          'Risk-Free Rate (Rf): Typically the 10-Year US Treasury yield (~4.2%).',
          'Market Risk Premium (Rm - Rf): Historical excess equity return (~5.5%).',
          'Beta = 1.0 moves in tandem with market; Beta = 1.5 is 50% more volatile; Beta < 1.0 (defensive) dampens portfolio swings.'
        ]
      }
    ],
    calculatorType: 'capm',
    quiz: [
      {
        question: 'If the risk-free rate is 4.0%, the market return is 10.0%, and a stock has a Beta of 1.5, what is its expected return under CAPM?',
        options: ['10.0%', '13.0%', '15.0%', '19.0%'],
        correctIndex: 1,
        explanation: 'E(R) = 4.0% + 1.5 * (10.0% - 4.0%) = 4.0% + 9.0% = 13.0%.'
      },
      {
        question: 'Which order type completely prevents execution price slippage?',
        options: ['Market Order', 'Limit Order', 'Stop-Loss at Market', 'Trailing Stop with Market Fill'],
        correctIndex: 1,
        explanation: 'Limit orders guarantee your specified execution price or better, preventing slippage at the cost of execution certainty.'
      },
      {
        question: 'Under Modern Portfolio Theory (MPT), how is portfolio risk reduced without proportionally reducing expected return?',
        options: ['Concentrating all capital into the single highest-Beta stock', 'Holding non-correlated or negatively correlated assets', 'Trading exclusively with market orders', 'Hedging 100% of cash into short-term options'],
        correctIndex: 1,
        explanation: 'Combining non-correlated assets eliminates unsystematic firm-specific risk, pushing the portfolio toward the efficient frontier.'
      }
    ]
  },
  statements: {
    title: 'Financial Statement Analysis',
    badge: 'Module 2',
    category: 'Corporate Fundamentals',
    summary: 'Analyze the 3 interconnected financial statements: Income Statement, Balance Sheet, and Cash Flow Statement, alongside crucial profitability and leverage ratios.',
    sections: [
      {
        heading: '1. The Big Three Financial Statements',
        description: 'Every corporate valuation begins with understanding how revenues flow into retained earnings and cash balances across the 3 core statements.',
        keyTakeaway: 'Net income is an accounting construct subject to non-cash accruals (depreciation, stock comp); Operating Cash Flow (OCF) reflects actual cash collected.',
        bulletPoints: [
          'Income Statement: Revenue -> Gross Profit -> Operating Income (EBIT) -> Net Income.',
          'Balance Sheet: Assets = Liabilities + Shareholder Equity (Snapshot in time).',
          'Cash Flow Statement: CFO (Operating), CFI (CapEx/Investing), CFF (Debt/Equity Financing).'
        ],
        example: 'A company can report positive Net Income of $50M while burning -$20M in Cash Flow from Operations if receivables and unbilled inventory balloon.'
      },
      {
        heading: '2. High-Yield Financial Health Ratios',
        description: 'Evaluate corporate efficiency, solvency, and equity return using institutional-grade fundamental metrics.',
        bulletPoints: [
          'Return on Equity (ROE): Net Income / Average Equity (DuPont: Margin * Asset Turnover * Leverage).',
          'Return on Invested Capital (ROIC): NOPAT / (Total Debt + Equity - Cash). Measures value creation above WACC.',
          'Current Ratio: Current Assets / Current Liabilities (> 1.5x indicates healthy short-term solvency).',
          'Net Debt / EBITDA: (Total Debt - Cash) / EBITDA (< 2.5x indicates low default risk).'
        ]
      }
    ],
    calculatorType: 'ratios',
    quiz: [
      {
        question: 'Which line item bridges Net Income on the Income Statement to Operating Cash Flow on the Cash Flow Statement?',
        options: ['Dividends Paid', 'Non-Cash Depreciation & Amortization', 'Common Stock Issuance', 'Share Buybacks'],
        correctIndex: 1,
        explanation: 'Depreciation & Amortization are non-cash expenses subtracted on the Income Statement that get added back to calculate Cash from Operations.'
      },
      {
        question: 'What does an ROIC exceeding WACC signify for a corporation?',
        options: ['The company is destroying shareholder value', 'The company is generating economic value above its cost of capital', 'The company must immediately file for Chapter 11', 'The company has zero debt'],
        correctIndex: 1,
        explanation: 'When ROIC > WACC, each dollar reinvested into the business earns returns in excess of financing costs, creating net economic value.'
      },
      {
        question: 'What is the formula for the DuPont 3-part ROE breakdown?',
        options: ['Net Margin * Asset Turnover * Equity Multiplier', 'Gross Margin * WACC * Debt Ratio', 'EBITDA / Enterprise Value', 'Current Assets / Total Liabilities'],
        correctIndex: 0,
        explanation: 'DuPont breakdown: (Net Income / Sales) * (Sales / Assets) * (Assets / Equity) = ROE.'
      }
    ]
  },
  valuation: {
    title: 'Corporate Valuation & DCF Modeling',
    badge: 'Module 3',
    category: 'Discounted Cash Flows',
    summary: 'Build intrinsic valuation models by projecting Unlevered Free Cash Flow (FCFF), discounting at WACC, and calculating Terminal Value via Gordon Growth and Exit Multiples.',
    sections: [
      {
        heading: '1. Unlevered Free Cash Flow (FCFF) Formula',
        description: 'Unlevered Free Cash Flow represents cash generated by core operations available to both debt and equity providers after reinvestment needs.',
        keyTakeaway: 'FCFF = EBIT * (1 - Tax Rate) + Depreciation & Amortization - Capital Expenditures (CapEx) - Change in Net Working Capital (ΔNWC).',
        bulletPoints: [
          'EBIT * (1 - T) is NOPAT (Net Operating Profit After Tax).',
          'CapEx & ΔNWC represent necessary capital investments to sustain projected growth.',
          'Discount rate MUST be WACC because cash flow is unlevered.'
        ]
      },
      {
        heading: '2. WACC & Terminal Value Calculations',
        description: 'Weighted Average Cost of Capital blends the after-tax cost of debt and cost of equity based on target capital weights: WACC = (E/V * Re) + (D/V * Rd * (1 - Tc)).',
        bulletPoints: [
          'Gordon Growth Method: TV = [FCFF_n * (1 + g)] / (WACC - g), where g <= long-term GDP growth (2.0% - 2.5%).',
          'Exit Multiple Method: TV = Terminal Year EBITDA * Target EV/EBITDA Multiple.',
          'Enterprise Value = PV(Forecasted FCFF) + PV(Terminal Value).',
          'Equity Value = Enterprise Value - Net Debt.'
        ]
      }
    ],
    calculatorType: 'dcf',
    quiz: [
      {
        question: 'Why is the interest expense tax shield included in WACC (Rd * (1 - Tc)) rather than inside FCFF projections?',
        options: ['Because interest is paid only to equity holders', 'Because FCFF is unlevered (independent of capital structure), so financing tax benefits are captured in the discount rate', 'Because interest is not tax-deductible', 'Because terminal value ignores debt'],
        correctIndex: 1,
        explanation: 'FCFF measures unlevered operating performance; financing structure and interest tax shields are reflected entirely in the WACC discount rate.'
      },
      {
        question: 'If Enterprise Value is $1,000M, Total Debt is $300M, and Cash is $100M, what is the Equity Value?',
        options: ['Undefined', '$600M', '$800M', '$1,200M'],
        correctIndex: 2,
        explanation: 'Equity Value = Enterprise Value - Net Debt = $1,000M - ($300M - $100M) = $800M.'
      },
      {
        question: 'Under the Gordon Growth model, why must the perpetual growth rate (g) never exceed expected nominal GDP growth?',
        options: ['Because mathematical formulas break if g > 0', 'Because the company would mathematically grow to become larger than the entire global economy', 'Because WACC would turn negative', 'Because tax rates would rise to 100%'],
        correctIndex: 1,
        explanation: 'A company growing perpetually faster than GDP would eventually comprise 100%+ of world output, violating economic equilibrium.'
      }
    ]
  },
  mna: {
    title: 'Investment Banking & M&A / LBO Frameworks',
    badge: 'Module 4',
    category: 'Deals & Buyouts',
    summary: 'Master M&A accretion/dilution mechanics, valuation football fields (Comps, Precedents, DCF), Leveraged Buyout (LBO) debt sizing, and returns analysis (IRR / MoIC).',
    sections: [
      {
        heading: '1. M&A Accretion / Dilution Mechanics',
        description: 'An M&A transaction is EPS Accretive if the combined pro-forma EPS exceeds the standalone Acquirer EPS; it is Dilutive if pro-forma EPS decreases.',
        keyTakeaway: 'In 100% stock deals: If Acquirer P/E > Target P/E, the deal is accretive. In cash/debt deals: Compare after-tax cost of financing with Target Earnings Yield (E/P).',
        bulletPoints: [
          'Pre-Tax Cost of Debt vs Target P/E: Cost of Cash < Cost of Debt < Cost of Equity.',
          'Synergies: Cost synergies (headcount, software licenses) are higher confidence than revenue cross-sell synergies.'
        ]
      },
      {
        heading: '2. LBO Debt Sizing & Return Drivers (IRR & MoIC)',
        description: 'Private equity firms acquire cash-flow-rich targets using 60-70% debt leverage, pay down debt using target cash flows, and exit at 3-5 year horizons.',
        bulletPoints: [
          '3 Core Return Drivers: 1) Debt Paydown / De-leveraging, 2) Operational EBITDA Growth, 3) Multiple Expansion at exit.',
          'Return Targets: 20%+ Target IRR and 2.0x+ MoIC (Multiple on Invested Capital).'
        ]
      }
    ],
    calculatorType: 'mna',
    quiz: [
      {
        question: 'In an all-stock acquisition, when is the deal guaranteed to be EPS accretive (ignoring transaction fees)?',
        options: ['When Acquirer P/E is higher than Target P/E', 'When Target P/E is higher than Acquirer P/E', 'When both companies have the same revenue', 'When debt is 100% of purchase price'],
        correctIndex: 0,
        explanation: 'When the buyer trades at a higher P/E multiple than the seller, it issues fewer shares per dollar of acquired earnings, boosting pro-forma EPS.'
      },
      {
        question: 'Which of the following is NOT one of the 3 primary value creation drivers in a classic LBO?',
        options: ['Debt Paydown & De-leveraging', 'EBITDA Margin Expansion', 'Printing fiat currency for dividends', 'Multiple Expansion upon Exit'],
        correctIndex: 2,
        explanation: 'LBO value creation comes from debt paydown, EBITDA growth, and multiple expansion; private equity sponsors cannot print currency.'
      },
      {
        question: 'A private equity sponsor invests $100M of equity in an LBO and exits after 5 years for $250M of net equity proceeds. What is the MoIC?',
        options: ['1.5x', '2.5x', '3.5x', '25.0%'],
        correctIndex: 1,
        explanation: 'MoIC (Multiple on Invested Capital) = $250M / $100M = 2.5x.'
      }
    ]
  }
};

export const GrowwTradingAcademyModal: React.FC<Props> = ({ moduleId, onClose, onComplete }) => {
  useModalDismiss(true, onClose);

  const [activeStep, setActiveStep] = useState<'theory' | 'calculator' | 'quiz'>('theory');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qIdx: number]: number }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Interactive Calculator States
  // 1. CAPM State
  const [rf, setRf] = useState(4.25);
  const [beta, setBeta] = useState(1.20);
  const [mrp, setMrp] = useState(5.50);

  // 2. Ratios State
  const [netIncome, setNetIncome] = useState(120);
  const [sales, setSales] = useState(1000);
  const [assets, setAssets] = useState(1500);
  const [equity, setEquity] = useState(600);

  // 3. DCF State
  const [fcff1, setFcff1] = useState(50);
  const [waccRate, setWaccRate] = useState(8.5);
  const [termGrowth, setTermGrowth] = useState(2.5);

  // 4. M&A State
  const [acqPE, setAcqPE] = useState(22);
  const [tgtPE, setTgtPE] = useState(15);
  const [stockPct, setStockPct] = useState(100);

  const moduleData = ACADEMY_MODULES[moduleId] || ACADEMY_MODULES.theory;

  const handleAnswerSelect = (optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [currentQuizIndex]: optionIdx }));
    setShowExplanation(true);
  };

  const handleNextQuizQuestion = () => {
    setShowExplanation(false);
    if (currentQuizIndex < moduleData.quiz.length - 1) {
      setCurrentQuizIndex(i => i + 1);
    } else {
      setQuizSubmitted(true);
    }
  };

  const correctCount = Object.entries(userAnswers).filter(([idx, ans]) => {
    return moduleData.quiz[Number(idx)]?.correctIndex === ans;
  }).length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative max-h-[90vh]"
      >
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 uppercase">
                  {moduleData.badge}
                </span>
                <span className="text-xs text-slate-500 dark:text-neutral-400">• {moduleData.category}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {moduleData.title}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Step Tabs */}
        <div className="flex border-b border-slate-200 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveStep('theory')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStep === 'theory' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Core Concepts</span>
          </button>

          <button
            onClick={() => setActiveStep('calculator')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStep === 'calculator' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>2. Interactive Calculator</span>
          </button>

          <button
            onClick={() => setActiveStep('quiz')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStep === 'quiz' 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>3. Mastery Check ({moduleData.quiz.length} Questions)</span>
          </button>
        </div>
        
        {/* Modal Scrollable Body */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: THEORY CONTENT */}
            {activeStep === 'theory' && (
              <motion.div 
                key="theory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  <strong>Executive Summary:</strong> {moduleData.summary}
                </div>

                {moduleData.sections.map((sec, sIdx) => (
                  <div key={sIdx} className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-950/60 border border-slate-200 dark:border-white/10 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                      {sec.heading}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed font-sans">
                      {sec.description}
                    </p>

                    {sec.keyTakeaway && (
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-neutral-200">
                        <strong className="text-blue-600 dark:text-blue-400 font-mono text-[11px] block uppercase mb-0.5">Key Takeaway:</strong>
                        {sec.keyTakeaway}
                      </div>
                    )}

                    {sec.bulletPoints && (
                      <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-600 dark:text-neutral-400">
                        {sec.bulletPoints.map((bp, bIdx) => (
                          <li key={bIdx} className="leading-relaxed">{bp}</li>
                        ))}
                      </ul>
                    )}

                    {sec.example && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                        <span className="font-bold block mb-0.5 font-mono text-[11px] uppercase">Market Example:</span>
                        {sec.example}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveStep('calculator')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>Proceed to Interactive Calculator</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: INTERACTIVE CALCULATOR */}
            {activeStep === 'calculator' && (
              <motion.div
                key="calculator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* 1. CAPM CALCULATOR */}
                {moduleData.calculatorType === 'capm' && (
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-white/10 space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                        <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Interactive CAPM Expected Return Calculator</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1">
                        Formula: <code>E(R) = Risk-Free Rate + Beta * (Market Risk Premium)</code>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">Risk-Free Rate (Rf %)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={rf}
                          onChange={e => setRf(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">Asset Beta (β)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={beta}
                          onChange={e => setBeta(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">Market Risk Premium (Rm - Rf %)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={mrp}
                          onChange={e => setMrp(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-mono text-slate-600 dark:text-neutral-400 block uppercase">Calculated Expected Return E(R)</span>
                        <span className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                          {(rf + beta * mrp).toFixed(2)}%
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-neutral-400 max-w-[220px] text-right font-sans">
                        {beta > 1.0 ? 'Higher risk than market index' : beta < 1.0 ? 'Defensive lower risk profile' : 'Neutral market risk benchmark'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. RATIOS CALCULATOR */}
                {moduleData.calculatorType === 'ratios' && (
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-white/10 space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                        <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>DuPont 3-Step ROE Decomposition Sandbox</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1">
                        DuPont: <code>ROE = (Net Margin) * (Asset Turnover) * (Equity Multiplier)</code>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">Net Income ($M)</label>
                        <input
                          type="number"
                          value={netIncome}
                          onChange={e => setNetIncome(Number(e.target.value))}
                          className="w-full p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">Sales ($M)</label>
                        <input
                          type="number"
                          value={sales}
                          onChange={e => setSales(Number(e.target.value))}
                          className="w-full p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">Assets ($M)</label>
                        <input
                          type="number"
                          value={assets}
                          onChange={e => setAssets(Number(e.target.value))}
                          className="w-full p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">Equity ($M)</label>
                        <input
                          type="number"
                          value={equity}
                          onChange={e => setEquity(Number(e.target.value))}
                          className="w-full p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 font-mono text-center">
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10">
                        <span className="text-[10px] text-slate-500 block uppercase">Net Profit Margin</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{((netIncome / (sales || 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10">
                        <span className="text-[10px] text-slate-500 block uppercase">Asset Turnover</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{(sales / (assets || 1)).toFixed(2)}x</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-white/10">
                        <span className="text-[10px] text-slate-500 block uppercase">Equity Multiplier</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{(assets / (equity || 1)).toFixed(2)}x</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-neutral-300">Composite Return on Equity (ROE):</span>
                      <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                        {((netIncome / (equity || 1)) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. DCF CALCULATOR */}
                {moduleData.calculatorType === 'dcf' && (
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-white/10 space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                        <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Gordon Growth DCF Terminal Value Calculator</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1">
                        Formula: <code>Terminal Value = [FCFF_n * (1 + g)] / (WACC - g)</code>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">Terminal Year FCFF ($M)</label>
                        <input
                          type="number"
                          value={fcff1}
                          onChange={e => setFcff1(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">WACC Discount Rate (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={waccRate}
                          onChange={e => setWaccRate(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">Terminal Growth g (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={termGrowth}
                          onChange={e => setTermGrowth(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold"
                        />
                      </div>
                    </div>

                    {waccRate > termGrowth ? (
                      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-mono text-slate-600 dark:text-neutral-400 block uppercase">Implied Terminal Value (TV)</span>
                          <span className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                            ${((fcff1 * (1 + termGrowth / 100)) / ((waccRate - termGrowth) / 100)).toFixed(1)}M
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 dark:text-neutral-400 font-mono">
                          Discount Spread: {(waccRate - termGrowth).toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-mono">
                        Error: WACC must be strictly greater than perpetual growth rate (g).
                      </div>
                    )}
                  </div>
                )}

                {/* 4. M&A ACCRETION CALCULATOR */}
                {moduleData.calculatorType === 'mna' && (
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-white/10 space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                        <Calculator className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>M&A Accretion / Dilution Quick Evaluator</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">Acquirer P/E Multiple</label>
                        <input
                          type="number"
                          value={acqPE}
                          onChange={e => setAcqPE(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-neutral-400 mb-1">Target P/E Multiple</label>
                        <input
                          type="number"
                          value={tgtPE}
                          onChange={e => setTgtPE(Number(e.target.value))}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-300 dark:border-white/10 font-bold"
                        />
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                      acqPE > tgtPE 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' 
                        : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'
                    }`}>
                      <div>
                        <span className="text-[11px] font-mono uppercase block text-slate-600 dark:text-neutral-400">All-Stock Deal Impact</span>
                        <span className={`text-xl font-bold font-mono ${acqPE > tgtPE ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {acqPE > tgtPE ? '✅ EPS Accretive' : acqPE < tgtPE ? '⚠️ EPS Dilutive' : 'Neutral EPS Impact'}
                        </span>
                      </div>
                      <span className="text-xs font-sans text-slate-600 dark:text-neutral-400 max-w-[200px] text-right">
                        {acqPE > tgtPE ? 'Buyer P/E > Target P/E: Acquirer issues fewer shares than earnings purchased.' : 'Buyer P/E < Target P/E: Acquirer must issue excess shares, diluting pro-forma EPS.'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setActiveStep('theory')}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    ← Back to Theory
                  </button>

                  <button
                    onClick={() => setActiveStep('quiz')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>Start 3-Question Mastery Check</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: QUIZ & MASTERY CHECK */}
            {activeStep === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {!quizSubmitted ? (
                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-white/10 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                        Question {currentQuizIndex + 1} of {moduleData.quiz.length}
                      </span>
                      <div className="flex gap-1">
                        {moduleData.quiz.map((_, qIdx) => (
                          <div 
                            key={qIdx} 
                            className={`w-5 h-1.5 rounded-full ${
                              qIdx === currentQuizIndex ? 'bg-blue-600' :
                              userAnswers[qIdx] !== undefined ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {moduleData.quiz[currentQuizIndex].question}
                    </h3>

                    <div className="space-y-2.5">
                      {moduleData.quiz[currentQuizIndex].options.map((opt, oIdx) => {
                        const isSelected = userAnswers[currentQuizIndex] === oIdx;
                        const isCorrect = moduleData.quiz[currentQuizIndex].correctIndex === oIdx;
                        
                        let btnStyle = 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-white/10 hover:border-blue-400 text-slate-800 dark:text-neutral-200';
                        if (showExplanation) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-50 dark:bg-emerald-600/20 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-50 dark:bg-rose-600/20 border-rose-400 text-rose-800 dark:text-rose-300 font-bold';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-800 dark:text-blue-300 font-bold';
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleAnswerSelect(oIdx)}
                            className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {showExplanation && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>

                    {showExplanation && (
                      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-neutral-300 space-y-1 animate-fade-in">
                        <span className="font-bold text-slate-900 dark:text-white block font-mono text-[11px] uppercase">
                          {userAnswers[currentQuizIndex] === moduleData.quiz[currentQuizIndex].correctIndex ? '✅ Correct!' : '❌ Explanation:'}
                        </span>
                        <p>{moduleData.quiz[currentQuizIndex].explanation}</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNextQuizQuestion}
                        disabled={userAnswers[currentQuizIndex] === undefined}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        <span>{currentQuizIndex < moduleData.quiz.length - 1 ? 'Next Question' : 'Submit & Complete'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-slate-50 dark:bg-neutral-950/70 border border-slate-200 dark:border-white/10 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                      <Award className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Module Completed!
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-md mx-auto">
                      You scored <strong>{correctCount} / {moduleData.quiz.length}</strong> on the {moduleData.title} mastery assessment.
                    </p>

                    <div className="flex items-center justify-center gap-3 pt-3">
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setCurrentQuizIndex(0);
                          setUserAnswers({});
                          setShowExplanation(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        Retake Assessment
                      </button>

                      <button
                        onClick={() => {
                          onComplete();
                          onClose();
                        }}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                      >
                        Save & Return to Hub
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
export default GrowwTradingAcademyModal;
