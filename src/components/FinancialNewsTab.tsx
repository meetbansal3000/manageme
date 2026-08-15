import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Settings, TrendingUp, TrendingDown, BookMarked, Globe, CheckCircle2, ChevronDown, Bookmark, ExternalLink, X, Activity, BrainCircuit, MessageCircle, RefreshCw } from 'lucide-react';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { NewsArticle } from '../types';
import { TickerSettingsModal, Region, TickerAsset, TICKER_CATALOG } from './TickerSettingsModal';
import { useScrollLock } from '../hooks/useScrollLock';

interface Props {
  userData: UserTrackerData;
  updateData: (d: Partial<UserTrackerData>) => void;
}

const TOPICS = [
  'Stock Prices & Market Movers', 'M&A Deals & LBOs', 'IPOs & Public Listings', 
  'Mutual Fund NFOs & Asset Management', 'Corporate Finance & Central Banking', 
  'Macroeconomics', 'Commodities & FX Rates'
];

const MOCK_NEWS: NewsArticle[] = [
  { id: '1', title: 'Global Markets Rally as Central Banks Hint at Rate Cuts', source: 'Bloomberg', category: 'Macroeconomics', url: '#', date: new Date().toISOString() },
  { id: '2', title: 'Tech Giant Announces $10B Acquisition of AI Startup', source: 'Financial Times', category: 'M&A Deals & LBOs', url: '#', date: new Date().toISOString() },
  { id: '3', title: 'Gold Prices Hit Record High Amid Geopolitical Tensions', source: 'Reuters', category: 'Commodities & FX Rates', url: '#', date: new Date().toISOString() },
  { id: '4', title: 'Major IPO: EV Maker Files for Public Listing Seeking $50B Valuation', source: 'WSJ', category: 'IPOs & Public Listings', url: '#', date: new Date().toISOString() },
];

export const FinancialNewsTab: React.FC<Props> = ({ userData, updateData }) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(userData.newsPreferences || []);
  const [showArchive, setShowArchive] = useState(false);
  
  const [showTickerSettings, setShowTickerSettings] = useState(false);
  const [tickerRegion, setTickerRegion] = useState<Region>(() => {
    return (localStorage.getItem('tickerRegion') as Region) || 'Global / Multi-Region';
  });
  const [activeTickers, setActiveTickers] = useState<TickerAsset[]>(() => {
    const saved = localStorage.getItem('activeTickers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return TICKER_CATALOG.filter(t => t.region === 'Global / Multi-Region');
  });

  // FX Quick Calc State
  const [fxAmount1, setFxAmount1] = useState<string>('1');
  const [fxCurrency1, setFxCurrency1] = useState<string>('GBP');
  const [fxAmount2, setFxAmount2] = useState<string>('129.08');
  const [fxCurrency2, setFxCurrency2] = useState<string>('INR');

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
    const inUSD = num * rates[fromCurr];
    const final = inUSD / rates[toCurr];
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
            newRates[curr] = 1 / data.rates[curr]; // Convert from "USD to X" to "X to USD" multiplier
          }
        });
        setFxRates(newRates);
        const now = Date.now();
        setFxLastUpdated(now);
        localStorage.setItem('fx_rates_cache', JSON.stringify(newRates));
        localStorage.setItem('fx_rates_timestamp', now.toString());
        
        // Refresh current calculation based on new rates
        setFxAmount2(calculateFx(fxAmount1, fxCurrency1, fxCurrency2, newRates));
      }
    } catch (e) {
      console.error("FX Fetch Error", e);
    } finally {
      setIsFetchingFx(false);
    }
  };

  useEffect(() => {
    // Auto-fetch if older than 1 hour or missing cache
    const age = Date.now() - fxLastUpdated;
    if (age > 3600000 || !localStorage.getItem('fx_rates_cache')) {
      fetchLiveFx();
    }
  }, []);

  const handleFx1Change = (val: string) => {
    setFxAmount1(val);
    setFxAmount2(calculateFx(val, fxCurrency1, fxCurrency2));
  };

  const handleFx2Change = (val: string) => {
    setFxAmount2(val);
    setFxAmount1(calculateFx(val, fxCurrency2, fxCurrency1));
  };

  const handleCurr1Change = (curr: string) => {
    setFxCurrency1(curr);
    setFxAmount2(calculateFx(fxAmount1, curr, fxCurrency2));
  };

  const handleCurr2Change = (curr: string) => {
    setFxCurrency2(curr);
    setFxAmount2(calculateFx(fxAmount1, fxCurrency1, curr));
  };

  const handleSwapCurrencies = () => {
    const tempCurr = fxCurrency1;
    setFxCurrency1(fxCurrency2);
    setFxCurrency2(tempCurr);
    setFxAmount2(calculateFx(fxAmount1, fxCurrency2, tempCurr));
  };

  useEffect(() => {
    localStorage.setItem('tickerRegion', tickerRegion);
  }, [tickerRegion]);

  useEffect(() => {
    localStorage.setItem('activeTickers', JSON.stringify(activeTickers));
  }, [activeTickers]);

  const [contextModal, setContextModal] = useState<any>(null);
  const [isGeneratingContext, setIsGeneratingContext] = useState(false);

  useScrollLock(showPreferences || showArchive || showTickerSettings || !!contextModal);

  useEffect(() => {
    if (!userData?.newsPreferences || !Array.isArray(userData.newsPreferences) || userData.newsPreferences.length === 0) {
      setShowPreferences(true);
    }
  }, [userData?.newsPreferences]);

  const handleSavePreferences = () => {
    updateData({ newsPreferences: selectedTopics });
    setShowPreferences(false);
  };

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else if (selectedTopics.length < 5) {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const toggleBookmark = (article: NewsArticle) => {
    const saved = userData.savedArticles || [];
    if (saved.find(a => a.id === article.id)) {
      updateData({ savedArticles: saved.filter(a => a.id !== article.id) });
    } else {
      updateData({ savedArticles: [...saved, article] });
    }
  };

  const generateContext = async (article: NewsArticle) => {
    setIsGeneratingContext(true);
    setContextModal({ article, loading: true });
    try {
      const res = await fetch('/api/generate-news-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: article.title, source: article.source })
      });
      const data = await res.json();
      setContextModal({ article, data, loading: false });
    } catch (e) {
      console.error(e);
      setContextModal(null);
    } finally {
      setIsGeneratingContext(false);
    }
  };

  const displayNews = MOCK_NEWS.filter(n => selectedTopics.length === 0 || selectedTopics.includes(n.category));
  const savedArticles = userData.savedArticles || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-6">
      {/* Live Commodities & FX Ticker Bar */}
      <div className="w-full glass-panel border border-[var(--border)] rounded-xl p-3 flex items-center overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-2 border-r border-[var(--border)] pr-4 mr-4 z-10">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold text-gray-200">LIVE MARKETS</span>
          <button onClick={() => setShowTickerSettings(true)} className="p-1 hover:bg-white/10 rounded-md transition-colors" title="Ticker Settings">
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
          <div className="animate-marquee flex gap-8">
            {[...activeTickers, ...activeTickers].map((ticker, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-medium text-gray-300">{ticker.symbol}</span>
                <span className="text-sm font-bold">{ticker.price}</span>
                <span className={`text-xs ${ticker.up ? 'text-emerald-400' : 'text-red-400'} flex items-center`}>
                  {ticker.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {ticker.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Financial News & Intelligence</h1>
            <p className="text-[var(--text-secondary)] mt-1">Real-time market insights and interview prep engine.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowArchive(!showArchive)} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-sm font-medium hover:bg-white/5 transition-colors">
              <Bookmark className="w-4 h-4 text-[var(--accent)]" /> 
              Saved Deals ({savedArticles.length})
            </button>
            <button onClick={() => setShowPreferences(true)} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-sm font-medium hover:bg-white/5 transition-colors">
              <Settings className="w-4 h-4 text-gray-400" /> Edit Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* News Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-xl font-bold">Breaking News & Insights</h2>
          </div>
          
          <div className="grid gap-4">
            {displayNews.map(article => (
              <div key={article.id} className="glass-panel border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--accent)]/50 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300 uppercase tracking-wider">{article.source}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--accent)]/10 text-[var(--accent)] uppercase tracking-wider">{article.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{article.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{new Date(article.date).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => toggleBookmark(article)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <Bookmark className={`w-5 h-5 ${savedArticles.find(a => a.id === article.id) ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-gray-400'}`} />
                  </button>
                </div>
                
                <div className="mt-5 pt-4 border-t border-[var(--border)] flex flex-wrap gap-2">
                  <a href={article.url} className="flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
                    Read Full Article <ExternalLink className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('shareToChat', { 
                        detail: { type: 'news', title: article.title, description: article.source, url: article.url } 
                      }));
                    }}
                    className="flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-colors"
                  >
                    Share <MessageCircle className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => generateContext(article)}
                    disabled={isGeneratingContext}
                    className="flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:brightness-110 transition-colors"
                  >
                    <BrainCircuit className="w-4 h-4" /> Exec Context & Prep
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}

        {/* FX Calculator Widget */}
        <div className="space-y-6">
          <div className="glass-panel border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              FX Quick Calc
            </h3>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={fxAmount1}
                onChange={(e) => handleFx1Change(e.target.value)}
                placeholder="100" 
                className="w-full bg-black/20 border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" 
              />
              <select 
                value={fxCurrency1}
                onChange={(e) => handleCurr1Change(e.target.value)}
                className="bg-black/20 border border-[var(--border)] rounded-lg px-2 py-2 text-sm focus:outline-none"
              >
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
            
            <div className="flex items-center justify-center relative py-1">
              <div className="absolute w-full h-[1px] bg-[var(--border)]"></div>
              <button 
                onClick={handleSwapCurrencies} 
                className="relative z-10 bg-[var(--surface-solid)] border border-[var(--border)] rounded-full p-1 text-gray-400 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer"
                title="Swap Currencies"
              >
                <TrendingUp className="w-4 h-4 rotate-90" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="number"
                value={fxAmount2}
                onChange={(e) => handleFx2Change(e.target.value)}
                placeholder="128.50"
                className="w-full bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-bold text-gray-300 focus:outline-none focus:border-[var(--accent)] transition-colors" 
              />
              <select 
                value={fxCurrency2}
                onChange={(e) => handleCurr2Change(e.target.value)}
                className="bg-black/20 border border-[var(--border)] rounded-lg px-2 py-2 text-sm focus:outline-none"
              >
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
            
            <div className="pt-2 flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
              <span className="truncate flex-1 pr-2">
                Live Rate: 1 {fxCurrency1} = ~{calculateFx("1", fxCurrency1, fxCurrency2)} {fxCurrency2} &bull; Updated {Math.floor((Date.now() - fxLastUpdated) / 60000) < 1 ? "just now" : `${Math.floor((Date.now() - fxLastUpdated) / 60000)}m ago`}
              </span>
              <button 
                onClick={fetchLiveFx} 
                disabled={isFetchingFx}
                className={`p-1 rounded-md hover:bg-white/5 hover:text-[var(--text-primary)] transition-all ${isFetchingFx ? 'animate-spin' : ''}`}
                title="Refresh Live Rates"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* IPO Calendar Widget */}
          <div className="glass-panel border border-[var(--border)] rounded-2xl p-5 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              IPO & NFO Calendar
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Quantum AI Tech', date: 'Oct 15, 2026', size: '$1.2B', type: 'IPO' },
                { name: 'Global Infra Fund', date: 'Oct 18, 2026', size: '$500M', type: 'NFO' }
              ].map((ipo, idx) => (
                <div key={idx} className="p-3 bg-black/20 rounded-xl border border-[var(--border)] text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">{ipo.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">{ipo.type}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>{ipo.date}</span>
                    <span>Issue: {ipo.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md glass-panel border border-[var(--border)] rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2">Setup News Preferences</h2>
              <p className="text-sm text-gray-400 mb-6">Select up to 5 topics to customize your intelligence feed.</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {TOPICS.map(topic => (
                  <button 
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${selectedTopics.includes(topic) ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-transparent border-[var(--border)] text-gray-400 hover:border-gray-300'}`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleSavePreferences}
                disabled={selectedTopics.length === 0}
                className="w-full py-2.5 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Save Preferences
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Context Modal */}
      <AnimatePresence>
        {showTickerSettings && (
          <TickerSettingsModal 
            onClose={() => setShowTickerSettings(false)}
            activeTickers={activeTickers}
            setActiveTickers={setActiveTickers}
            selectedRegion={tickerRegion}
            setSelectedRegion={setTickerRegion}
          />
        )}
        
        {contextModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-full max-w-2xl max-h-[80vh] overflow-y-auto glass-panel border border-[var(--border)] rounded-2xl p-6 relative">
              <button onClick={() => setContextModal(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Executive Context & Prep</h2>
                  <p className="text-sm text-gray-400 truncate max-w-[300px] sm:max-w-md">{contextModal.article.title}</p>
                </div>
              </div>

              {contextModal.loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-[var(--accent)] animate-pulse">Analyzing article & generating insights...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-emerald-400">Executive Summary</h3>
                    <p className="text-sm text-gray-300 leading-relaxed bg-black/20 p-4 rounded-xl border border-[var(--border)]">{contextModal.data?.context}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-blue-400">Key Points to Remember</h3>
                    <ul className="space-y-2 text-sm text-gray-300 bg-black/20 p-4 rounded-xl border border-[var(--border)]">
                      {contextModal.data?.points?.map((p: string, i: number) => (
                        <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5"/> <span>{p}</span></li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-2 text-purple-400">Interview Q&A Prep</h3>
                    <div className="space-y-3">
                      {contextModal.data?.qa?.map((qa: any, i: number) => (
                        <div key={i} className="bg-black/20 p-4 rounded-xl border border-[var(--border)] space-y-2">
                          <p className="text-sm font-bold text-gray-200">Q: {qa.q}</p>
                          <p className="text-sm text-gray-400 border-l-2 border-purple-500 pl-3 py-1">{qa.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
