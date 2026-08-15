import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  BookMarked, 
  Globe, 
  CheckCircle2, 
  ChevronDown, 
  Bookmark, 
  ExternalLink, 
  X, 
  Activity, 
  BrainCircuit, 
  MessageCircle, 
  RefreshCw,
  Sparkles,
  Search,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  BarChart3,
  HelpCircle,
  Layers,
  Filter
} from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { NewsArticle } from '../types';
import { TiltCard } from './TiltCard';
import { useScrollLock } from '../hooks/useScrollLock';

interface Props {
  userData: UserTrackerData;
  updateData: (d: Partial<UserTrackerData>) => void;
}

export interface LiveNewsItem extends NewsArticle {
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  readTime?: string;
  summary?: string;
  sectorTags?: string[];
}

export interface MarketImpactAnalysis {
  executiveSummary: string;
  marketSentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Mixed';
  affectedSectors: {
    sector: string;
    impactType: 'Direct' | 'Indirect';
    effect: 'Positive' | 'Negative' | 'Neutral';
    rationale: string;
  }[];
  riskMatrix: {
    risk: string;
    severity: 'High' | 'Medium' | 'Low';
    horizon: 'Immediate' | 'Medium-term' | 'Long-term';
  }[];
  valuationImpact: {
    dcfImplications: string;
    keyMetricsToWatch: string[];
  };
  interviewPrepQuestions: {
    question: string;
    modelAnswer: string;
  }[];
}

const CATEGORIES = [
  'All',
  'Macro & Central Banks',
  'M&A Deals & LBOs',
  'Big Tech & AI',
  'Equities & IPOs',
  'Commodities & FX'
];

const FALLBACK_NEWS: LiveNewsItem[] = [
  {
    id: 'news-1',
    title: 'Federal Reserve Signals Dovish Pivot as Core Inflation Cools to 2.4%',
    source: 'Global Financial Markets',
    category: 'Macro & Central Banks',
    sentiment: 'Bullish',
    date: new Date().toISOString(),
    readTime: '3 min read',
    url: 'https://ft.com',
    summary: 'FOMC minutes reveal broad consensus for interest rate cuts following consecutive months of easing PCE inflation and steady labor market figures.',
    sectorTags: ['Banking', 'Fixed Income', 'Equities', 'Real Estate']
  },
  {
    id: 'news-2',
    title: 'Major Tech Giant Closes $14.2B Megadeal to Acquire Autonomous AI Infrastructure Provider',
    source: 'Financial Times',
    category: 'M&A Deals & LBOs',
    sentiment: 'Bullish',
    date: new Date(Date.now() - 3600000).toISOString(),
    readTime: '4 min read',
    url: 'https://ft.com',
    summary: 'The all-cash transaction represents a 38% premium over the 30-day VWAP, signaling continued aggressive private equity and strategic M&A deployment in frontier AI compute.',
    sectorTags: ['Semiconductors', 'Cloud Computing', 'Private Equity', 'M&A Advisory']
  },
  {
    id: 'news-3',
    title: 'Bank of England Holds Base Rate at 4.75% Amid Persistent Services Wage Pressures',
    source: 'Reuters Finance',
    category: 'Macro & Central Banks',
    sentiment: 'Neutral',
    date: new Date(Date.now() - 7200000).toISOString(),
    readTime: '2 min read',
    url: 'https://reuters.com',
    summary: 'Monetary Policy Committee voted 7-2 to maintain rates, citing resilient UK services growth and sterling strength against the euro and yen.',
    sectorTags: ['Sterling FX', 'UK Gilts', 'Mortgages', 'Retail Banking']
  },
  {
    id: 'news-4',
    title: 'NVIDIA Expands Custom Silicon Blackwell Architecture to Enterprise Cloud Hyperscalers',
    source: 'Wall Street Journal',
    category: 'Big Tech & AI',
    sentiment: 'Bullish',
    date: new Date(Date.now() - 10800000).toISOString(),
    readTime: '5 min read',
    url: 'https://wsj.com',
    summary: 'Next-generation accelerated compute clusters demonstrate 4x inference throughput with 25x lower energy expenditure, sparking price target upgrades across Wall Street.',
    sectorTags: ['Semiconductors', 'Hardware', 'Generative AI', 'Datacenters']
  },
  {
    id: 'news-5',
    title: 'Gold Breaks All-Time Record High Surpassing $2,890/oz as Sovereign Reserves Surge',
    source: 'CNBC',
    category: 'Commodities & FX',
    sentiment: 'Bullish',
    date: new Date(Date.now() - 14400000).toISOString(),
    readTime: '3 min read',
    url: 'https://cnbc.com',
    summary: 'Central bank gold accumulation and structural de-dollarization flows drive unprecedented precious metal momentum despite higher real Treasury yields.',
    sectorTags: ['Precious Metals', 'Mining', 'Sovereign Debt', 'Commodities Trading']
  },
  {
    id: 'news-6',
    title: 'Leading Renewable Energy Operator Files for London Main Market IPO Seeking £4.5B Market Cap',
    source: 'CityAM',
    category: 'Equities & IPOs',
    sentiment: 'Bullish',
    date: new Date(Date.now() - 18000000).toISOString(),
    readTime: '4 min read',
    url: 'https://cityam.com',
    summary: 'The landmark listing represents London’s largest equity capital markets raise of the year, backed by cornerstone sovereign wealth fund commitments.',
    sectorTags: ['Equity Capital Markets', 'Clean Energy', 'Infrastructure', 'London Stock Exchange']
  }
];

export const FinancialNewsTab: React.FC<Props> = ({ userData, updateData }) => {
  const [newsArticles, setNewsArticles] = useState<LiveNewsItem[]>(FALLBACK_NEWS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // AI Market Impact Analysis Modal State
  const [analyzingArticle, setAnalyzingArticle] = useState<LiveNewsItem | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<MarketImpactAnalysis | null>(null);
  const [isAnalyzingImpact, setIsAnalyzingImpact] = useState(false);

  useScrollLock(!!analyzingArticle);

  // FX Quick Calc State
  const [fxAmount1, setFxAmount1] = useState<string>('1');
  const [fxCurrency1, setFxCurrency1] = useState<string>('GBP');
  const [fxAmount2, setFxAmount2] = useState<string>('1.28');
  const [fxCurrency2, setFxCurrency2] = useState<string>('USD');

  const [fxRates, setFxRates] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('fx_rates_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch(e) {}
    }
    return {
      'GBP': 1.285,
      'EUR': 1.090,
      'USD': 1.0,
      'INR': 1 / 86.00,
      'JPY': 1 / 150.0
    };
  });
  
  const [fxLastUpdated, setFxLastUpdated] = useState<number>(() => {
    const cached = localStorage.getItem('fx_rates_timestamp');
    return cached ? parseInt(cached) : Date.now();
  });
  const [isFetchingFx, setIsFetchingFx] = useState(false);

  const calculateFx = (val: string, fromCurr: string, toCurr: string, rates = fxRates) => {
    if (!val) return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    const inUSD = num * (rates[fromCurr] || 1);
    const final = inUSD / (rates[toCurr] || 1);
    return final.toFixed(2);
  };

  const fetchLiveFx = async () => {
    setIsFetchingFx(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data && data.rates) {
        const newRates: Record<string, number> = {};
        ['GBP', 'EUR', 'USD', 'INR', 'JPY'].forEach(curr => {
          if (data.rates[curr]) {
            newRates[curr] = 1 / data.rates[curr];
          }
        });
        setFxRates(newRates);
        const now = Date.now();
        setFxLastUpdated(now);
        localStorage.setItem('fx_rates_cache', JSON.stringify(newRates));
        localStorage.setItem('fx_rates_timestamp', now.toString());
        setFxAmount2(calculateFx(fxAmount1, fxCurrency1, fxCurrency2, newRates));
      }
    } catch (e) {
      console.error("FX Fetch Error", e);
    } finally {
      setIsFetchingFx(false);
    }
  };

  const fetchLiveNews = async () => {
    setIsLoadingNews(true);
    try {
      const res = await fetch('/api/news/live');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data?.articles) && data.articles.length > 0) {
          setNewsArticles(data.articles);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch live news from server, using cached news', e);
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchLiveNews();
    const age = Date.now() - fxLastUpdated;
    if (age > 3600000 || !localStorage.getItem('fx_rates_cache')) {
      fetchLiveFx();
    }
  }, []);

  const handleAnalyzeImpact = async (article: LiveNewsItem) => {
    setAnalyzingArticle(article);
    setImpactAnalysis(null);
    setIsAnalyzingImpact(true);

    try {
      const res = await fetch('/api/news/analyze-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          summary: article.summary,
          source: article.source,
          category: article.category,
          sectorTags: article.sectorTags
        })
      });

      const data = await res.json();
      if (res.ok && data.analysis) {
        setImpactAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Failed to generate impact analysis');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback structured impact analysis
      setImpactAnalysis({
        executiveSummary: `Strategic development from ${article.source}: ${article.title}. This catalyst introduces fundamental shifts in sector sentiment, capital allocation, and valuation discount rates across primary industry stakeholders.`,
        marketSentiment: article.sentiment || 'Bullish',
        affectedSectors: (article.sectorTags || ['General Finance', 'Equities']).map((sec, idx) => ({
          sector: sec,
          impactType: idx === 0 ? 'Direct' : 'Indirect',
          effect: 'Positive',
          rationale: `Strong revenue tailwinds and institutional flows expected into ${sec} infrastructure.`
        })),
        riskMatrix: [
          { risk: 'Macro Interest Rate Uncertainty & Yield Curve Volatility', severity: 'Medium', horizon: 'Immediate' },
          { risk: 'Regulatory Antitrust & Cross-Border Compliance Scrutiny', severity: 'High', horizon: 'Medium-term' }
        ],
        valuationImpact: {
          dcfImplications: 'Expansion of terminal growth rates and lower cost of capital expand modeled intrinsic fair value.',
          keyMetricsToWatch: ['EV/EBITDA Multiple', 'Weighted Average Cost of Capital (WACC)', 'Free Cash Flow Margin']
        },
        interviewPrepQuestions: [
          {
            question: `How would you evaluate the market impact of "${article.title}" in an investment banking deal pitch?`,
            modelAnswer: '1. Detail the macroeconomic catalyst and underlying supply/demand drivers. 2. Quantify the valuation multiple expansion vs historical peers. 3. Highlight strategic synergies and potential downside risk mitigation.'
          }
        ]
      });
    } finally {
      setIsAnalyzingImpact(false);
    }
  };

  const toggleBookmark = (article: LiveNewsItem) => {
    const saved = userData.savedArticles || [];
    if (saved.find(a => a.id === article.id)) {
      updateData({ savedArticles: saved.filter(a => a.id !== article.id) });
    } else {
      updateData({ savedArticles: [...saved, article] });
    }
  };

  const savedArticles = userData.savedArticles || [];

  const filteredNews = newsArticles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.summary && article.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      article.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSaved = !showSavedOnly || savedArticles.some(a => a.id === article.id);
    return matchesCategory && matchesSearch && matchesSaved;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-2xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Newspaper className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
              Financial Intelligence Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Live Financial News & Markets
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Macroeconomic news, market shifts, and AI impact analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showSavedOnly 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({savedArticles.length})</span>
          </button>

          <button
            onClick={fetchLiveNews}
            disabled={isLoadingNews}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNews ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news or tickers..."
            className="w-full bg-neutral-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Grid: Articles + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: News Articles with 3D Tilt */}
        <div className="lg:col-span-2 space-y-4">
          {filteredNews.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900/40 border border-white/10 rounded-3xl p-8 space-y-2">
              <Newspaper className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">No articles matched</h3>
              <p className="text-xs text-neutral-400">Try changing your category filter or search terms.</p>
            </div>
          ) : (
            filteredNews.map(article => {
              const isSaved = savedArticles.some(a => a.id === article.id);
              const isBullish = article.sentiment === 'Bullish';
              const isBearish = article.sentiment === 'Bearish';

              return (
                <TiltCard key={article.id} maxTilt={5} scale={1.01}>
                  <div className="bg-neutral-900/70 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-xl hover:border-white/20 transition-all flex flex-col justify-between space-y-4">
                    
                    {/* Top Row: Meta Tags & Bookmark */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-neutral-300 uppercase">
                          {article.source}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {article.category}
                        </span>
                        {article.sentiment && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isBullish ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            isBearish ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            'bg-neutral-500/20 text-neutral-300 border border-neutral-500/30'
                          }`}>
                            {article.sentiment}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => toggleBookmark(article)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                        title={isSaved ? 'Remove from Saved' : 'Save Article'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Headline & Summary */}
                    <div className="space-y-2">
                      <h2 className="text-base sm:text-lg font-bold text-white leading-snug tracking-tight hover:text-blue-300 transition-colors">
                        {article.title}
                      </h2>
                      {article.summary && (
                        <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
                          {article.summary}
                        </p>
                      )}
                    </div>

                    {/* Sector Tags */}
                    {article.sectorTags && article.sectorTags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">Sectors:</span>
                        {article.sectorTags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-neutral-400 font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Actions Bar */}
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-neutral-400">
                        {new Date(article.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {article.readTime && ` • ${article.readTime}`}
                      </span>

                      <div className="flex items-center gap-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          onClick={() => handleAnalyzeImpact(article)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Analyze Market Impact</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </TiltCard>
              );
            })
          )}
        </div>

        {/* Right 1 Col: FX Converter & IPO / Market Sandbox Widgets */}
        <div className="space-y-6">
          
          {/* FX Quick Calc */}
          <div className="bg-neutral-900/70 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>FX Spot Converter</span>
              </h3>
              <button 
                onClick={fetchLiveFx} 
                disabled={isFetchingFx}
                className="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                title="Refresh FX Rates"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFx ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={fxAmount1}
                  onChange={(e) => {
                    setFxAmount1(e.target.value);
                    setFxAmount2(calculateFx(e.target.value, fxCurrency1, fxCurrency2));
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500" 
                />
                <select 
                  value={fxCurrency1}
                  onChange={(e) => {
                    setFxCurrency1(e.target.value);
                    setFxAmount2(calculateFx(fxAmount1, e.target.value, fxCurrency2));
                  }}
                  className="bg-neutral-800 border border-white/10 rounded-xl px-2.5 py-2 text-white font-mono focus:outline-none"
                >
                  {Object.keys(fxRates).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  value={fxAmount2}
                  onChange={(e) => {
                    setFxAmount2(e.target.value);
                    setFxAmount1(calculateFx(e.target.value, fxCurrency2, fxCurrency1));
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-emerald-300 font-bold font-mono focus:outline-none focus:border-blue-500" 
                />
                <select 
                  value={fxCurrency2}
                  onChange={(e) => {
                    setFxCurrency2(e.target.value);
                    setFxAmount2(calculateFx(fxAmount1, fxCurrency1, e.target.value));
                  }}
                  className="bg-neutral-800 border border-white/10 rounded-xl px-2.5 py-2 text-white font-mono focus:outline-none"
                >
                  {Object.keys(fxRates).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-neutral-400">
              <span>1 {fxCurrency1} = {calculateFx('1', fxCurrency1, fxCurrency2)} {fxCurrency2}</span>
              <span>Updated {Math.floor((Date.now() - fxLastUpdated) / 60000)}m ago</span>
            </div>
          </div>

          {/* IPO & Catalyst Calendar */}
          <div className="bg-neutral-900/70 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Key Market Catalysts</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'FOMC Rate Decision', date: 'Next Wed, 19:00', type: 'Macro', impact: 'High' },
                { name: 'NVIDIA GTC AI Keynote', date: 'Oct 22, 2026', type: 'Tech', impact: 'High' },
                { name: 'London Clean Tech IPO', date: 'Nov 04, 2026', type: 'ECM', impact: 'Med' }
              ].map((cat, idx) => (
                <div key={idx} className="p-3 bg-black/30 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{cat.name}</span>
                    <span className="text-[10px] font-mono text-neutral-400">{cat.date}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    cat.impact === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {cat.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* AI Market Impact Modal */}
      <AnimatePresence>
        {analyzingArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.94, y: 20 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-neutral-950/95 border border-white/15 rounded-3xl p-6 sm:p-8 relative shadow-2xl text-white space-y-6 custom-scrollbar"
            >
              {/* Close Button */}
              <button 
                onClick={() => setAnalyzingArticle(null)} 
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-3.5 pr-10">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 shrink-0">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Gemini Market Agent
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {analyzingArticle.source}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 leading-snug">
                    {analyzingArticle.title}
                  </h2>
                </div>
              </div>

              {/* Loading State */}
              {isAnalyzingImpact ? (
                <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="text-sm font-bold text-blue-400 font-mono">Running Financial Market Impact Engine...</p>
                    <p className="text-xs text-neutral-400 mt-1">Evaluating affected sectors, DCF multiples, and IB interview points</p>
                  </div>
                </div>
              ) : impactAnalysis ? (
                <div className="space-y-6 text-xs sm:text-sm">
                  
                  {/* Executive Summary & Sentiment */}
                  <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                        <Zap className="w-4 h-4" />
                        <span>Executive Macro Context</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Sentiment: {impactAnalysis.marketSentiment}
                      </span>
                    </div>
                    <p className="text-neutral-200 leading-relaxed">
                      {impactAnalysis.executiveSummary}
                    </p>
                  </div>

                  {/* Affected Sectors Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4" />
                      <span>Affected Market Sectors & Multiples</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {impactAnalysis.affectedSectors.map((sec, sIdx) => (
                        <div key={sIdx} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{sec.sector}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-neutral-300">
                              {sec.impactType} Impact
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300 leading-relaxed">
                            {sec.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk & Opportunity Matrix */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Market Risk & Horizon Matrix</span>
                    </h3>
                    <div className="space-y-2">
                      {impactAnalysis.riskMatrix.map((risk, rIdx) => (
                        <div key={rIdx} className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-neutral-200 block">{risk.risk}</span>
                            <span className="text-[10px] font-mono text-neutral-400">Horizon: {risk.horizon}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                            {risk.severity} Severity
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Valuation Impact */}
                  {impactAnalysis.valuationImpact && (
                    <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 space-y-2">
                      <h4 className="text-xs font-bold uppercase font-mono text-blue-400">DCF & Multiples Implications</h4>
                      <p className="text-xs text-neutral-200 leading-relaxed">
                        {impactAnalysis.valuationImpact.dcfImplications}
                      </p>
                      {impactAnalysis.valuationImpact.keyMetricsToWatch && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] font-mono text-neutral-400">Watch:</span>
                          {impactAnalysis.valuationImpact.keyMetricsToWatch.map((m, mIdx) => (
                            <span key={mIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Investment Banking Interview Prep Q&A */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>Investment Banking Assessment Center Q&A</span>
                    </h3>
                    <div className="space-y-3">
                      {impactAnalysis.interviewPrepQuestions.map((qa, qIdx) => (
                        <div key={qIdx} className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-2">
                          <p className="text-xs font-bold text-purple-300">Q: {qa.question}</p>
                          <p className="text-xs text-neutral-300 border-l-2 border-purple-500 pl-3 py-1 leading-relaxed">
                            {qa.modelAnswer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : null}

              {/* Modal Footer */}
              <div className="pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setAnalyzingArticle(null)}
                  className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default FinancialNewsTab;
