import React, { useState, useEffect, useRef } from 'react';
import { MonitorPlay, Plus, Trash2, ChevronDown, Camera, Sparkles, CheckCircle2 } from 'lucide-react';
import { processAutoImport } from '../utils/autoImportPipeline';
import { ImportProgressBar } from './ImportProgressBar';

interface SubItem {
  id: string;
  name: string;
  price: number;
  billingDate?: string;
}

const DEFAULT_SUBS: SubItem[] = [
  { id: '1', name: 'Adobe Creative Cloud', price: 54.99, billingDate: '2026-09-01' },
  { id: '2', name: 'Spotify Premium', price: 10.99, billingDate: '2026-08-28' },
  { id: '3', name: 'Bloomberg Terminal / Pro', price: 29.99, billingDate: '2026-09-15' },
];

export const SubscriptionManager: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubItem[]>(() => {
    try {
      const saved = localStorage.getItem('manageme_subscriptions') || localStorage.getItem('manageme_subs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SUBS;
  });

  const [isExpanded, setIsExpanded] = useState(true);

  // Scan Invoice / Receipt State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepMsg, setScanStepMsg] = useState('');
  const [scanFileName, setScanFileName] = useState('');
  const [autofillNotice, setAutofillNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('manageme_subscriptions', JSON.stringify(subscriptions));
      localStorage.setItem('manageme_subs', JSON.stringify(subscriptions));
    } catch (e) {
      console.error(e);
    }
  }, [subscriptions]);

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanFileName(file.name);
    setIsScanning(true);
    setScanProgress(10);
    setScanStepMsg('Analyzing invoice / receipt layout...');

    try {
      const result = await processAutoImport(file, {
        mode: 'finance',
        onProgress: (percent, msg) => {
          setScanProgress(percent);
          setScanStepMsg(msg);
        }
      });

      const subData = result.subscription;
      const expenseData = result.expense;

      const detectedName = subData?.subscriptionName || expenseData?.merchant || 'Scanned Service Subscription';
      const detectedAmount = Number(subData?.monthlyAmount || expenseData?.amount || 19.99);
      const detectedDate = subData?.billingDate || expenseData?.date || new Date().toISOString().split('T')[0];

      // Automatically autofill & add to subscriptions
      const newSub: SubItem = {
        id: Date.now().toString(),
        name: detectedName,
        price: detectedAmount,
        billingDate: detectedDate
      };

      setSubscriptions(prev => [newSub, ...prev]);
      setAutofillNotice(`Autofilled "${detectedName}" (£${detectedAmount.toFixed(2)}/mo, billing ${detectedDate})`);
      setTimeout(() => setAutofillNotice(null), 6000);
    } catch (err: any) {
      console.error(err);
      alert('Failed to scan receipt/invoice: ' + err.message);
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddAsset = () => {
    const newSub: SubItem = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      billingDate: new Date().toISOString().split('T')[0]
    };
    setSubscriptions(prev => [...prev, newSub]);
  };

  const handleNameChange = (id: string, name: string) => {
    setSubscriptions(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, name } : sub))
    );
  };

  const handlePriceChange = (id: string, price: number) => {
    setSubscriptions(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, price } : sub))
    );
  };

  const handleDateChange = (id: string, billingDate: string) => {
    setSubscriptions(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, billingDate } : sub))
    );
  };

  const handleDelete = (id: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  const totalMonthly = subscriptions.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  return (
    <div className="glass-panel border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between relative">
      <div>
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--text-primary)]">
            <MonitorPlay className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Subscriptions & Tech Assets</span>
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleScanReceipt}
              accept="image/*,.pdf,.csv,.xlsx"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scan Receipt/Invoice</span>
            </button>
            <button
              onClick={handleAddAsset}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Asset</span>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        {/* Autofill Toast Banner */}
        {autofillNotice && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{autofillNotice}</span>
          </div>
        )}

        {/* Content */}
        {isExpanded && (
          <div className="space-y-3">
            <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
              {subscriptions.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No active subscriptions. Click "Scan Receipt/Invoice" or "+ Add Asset" to create one.
                </div>
              ) : (
                subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 border border-[var(--border)] bg-black/20 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <input
                      type="text"
                      placeholder="Asset / Subscription Name"
                      value={sub.name}
                      onChange={(e) => handleNameChange(sub.id, e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="date"
                        value={sub.billingDate || ''}
                        onChange={(e) => handleDateChange(sub.id, e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-gray-300 focus:outline-none focus:border-blue-500"
                        title="Billing / Renewal Date"
                      />
                      <span className="text-xs text-gray-400 font-mono">£</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={sub.price || ''}
                        onChange={(e) => handlePriceChange(sub.id, parseFloat(e.target.value) || 0)}
                        className="w-20 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-right focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Total Spend */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-[var(--border)] bg-black/30 p-3 rounded-xl flex justify-between items-center text-xs">
          <span className="font-medium text-gray-400">Total Monthly Spend:</span>
          <span className="font-mono font-bold text-sm text-purple-300">
            £{totalMonthly.toFixed(2)}/mo
          </span>
        </div>
      )}

      {/* Scanning Progress Bar */}
      <ImportProgressBar
        isProcessing={isScanning}
        progress={scanProgress}
        stepMessage={scanStepMsg}
        fileName={scanFileName}
        title="AI Receipt & Invoice OCR Parser"
        onCancel={() => setIsScanning(false)}
      />
    </div>
  );
};

