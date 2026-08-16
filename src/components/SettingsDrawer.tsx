import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X, Check, ShieldCheck, Lock, Unlock, KeyRound, Copy, ShieldAlert, CheckCircle2, Moon, Sun, Smartphone, Sparkles, Download, Upload, RotateCcw, Share2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useOwnerSecurity, MASTER_OWNER_EMAIL, MASTER_OWNER_NAME } from '../context/OwnerSecurityContext';
import { UserTrackerData } from '../hooks/useFirestoreData';
import { useScrollLock } from '../hooks/useScrollLock';
import { useToast } from '../context/ToastContext';
import { triggerHaptic, IOS_SPRING } from '../utils/haptics';

interface SettingsDrawerProps {
  userData: UserTrackerData;
  updateData: (data: Partial<UserTrackerData>) => void;
  onResetDemoData?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose, userData, updateData, onResetDemoData }) => {
  useScrollLock(isOpen);
  const { showToast } = useToast();

  const { settings, updateSettings, resetData } = useSettings();
  const { 
    isOwnerVerified, 
    isProtectedMode, 
    copyProtectionActive, 
    watermarkActive, 
    toggleCopyProtection, 
    toggleWatermark, 
    lockOwnerMode, 
    updateMasterPin, 
    requireOwnerPermission 
  } = useOwnerSecurity();

  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeStatus, setPinChangeStatus] = useState<string | null>(null);
  const [showPinChange, setShowPinChange] = useState(false);

  const handleResetDemo = () => {
    requireOwnerPermission('Restore Demo Data', () => {
      if (confirm('Are you sure you want to restore default demo data? This will reset sample graduate schemes, skills, and tasks.')) {
        if (onResetDemoData) {
          onResetDemoData();
        }
        showToast('Demo data restored successfully!', 'success');
        onClose();
      }
    });
  };

  const handleDownloadBackup = () => {
    requireOwnerPermission('Export Personal Workspace JSON', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `manageme_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      showToast('Personal workspace exported as JSON', 'success');
    });
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    requireOwnerPermission('Import and Overwrite Workspace Profile', () => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (confirm('Warning: This will overwrite your current data. Proceed?')) {
            await updateData(data);
            showToast('Data restored successfully!', 'success');
          }
        } catch (err) {
          showToast('Invalid backup file format.', 'warning');
        }
      };
      reader.readAsText(file);
    });
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = updateMasterPin(currentPinInput, newPinInput);
    if (success) {
      setPinChangeStatus('Master PIN updated successfully!');
      showToast('Master PIN updated successfully!', 'success');
      setCurrentPinInput('');
      setNewPinInput('');
      setTimeout(() => {
        setShowPinChange(false);
        setPinChangeStatus(null);
      }, 2000);
    } else {
      setPinChangeStatus('Incorrect current PIN or invalid new PIN (minimum 4 digits).');
      showToast('PIN update failed. Check current PIN.', 'warning');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.8 }}
        onDragEnd={(_: any, info: PanInfo) => {
          if (info.offset.y > 100 || info.velocity.y > 200) {
            triggerHaptic(15);
            onClose();
          }
        }}
        transition={IOS_SPRING}
        className="fixed bottom-0 left-0 right-0 sm:top-0 sm:left-auto sm:right-0 sm:bottom-0 z-[70] w-full sm:max-w-sm shadow-2xl flex flex-col border-t sm:border-t-0 sm:border-l border-slate-200/50 dark:border-white/10 rounded-t-3xl sm:rounded-none max-h-[90vh] sm:max-h-full bg-white/80 dark:bg-slate-950/60 backdrop-blur-2xl text-slate-900 dark:text-white touch-none"
      >
        
        {/* Drag handle for mobile */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-white/20 rounded-full my-2 mx-auto cursor-grab active:cursor-grabbing sm:hidden shrink-0" />
        
        <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-slate-200/50 dark:border-white/10 shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Preferences</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          {/* iOS Inset Grouped List - Profile Settings */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 px-1">User & Profile</h3>
            <div className="bg-white/60 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/10 divide-y divide-slate-200/40 dark:divide-white/5 overflow-hidden">
              <div className="p-3.5 space-y-1">
                <label className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 block">Workspace Title</label>
                <input
                  type="text"
                  value={userData.userName || ''}
                  onChange={(e) => updateData({ userName: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:outline-none"
                />
              </div>
              <div className="p-3.5 space-y-1">
                <label className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 block">Degree / Program</label>
                <input
                  type="text"
                  value={userData.degreeName || ''}
                  onChange={(e) => updateData({ degreeName: e.target.value })}
                  placeholder="e.g. Finance & Data Analytics"
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:outline-none"
                />
              </div>
              <div className="p-3.5 space-y-1">
                <label className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 block">University</label>
                <input
                  type="text"
                  value={userData.universityName || ''}
                  onChange={(e) => updateData({ universityName: e.target.value })}
                  placeholder="e.g. London School of Economics"
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:outline-none"
                />
              </div>
              <div className="p-3.5 space-y-1">
                <label className="text-[11px] font-medium text-slate-500 dark:text-neutral-400 block">Location</label>
                <input
                  type="text"
                  value={userData.location || ''}
                  onChange={(e) => updateData({ location: e.target.value })}
                  placeholder="e.g. London, UK"
                  className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* iOS Inset Grouped List - Security & Controls */}
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" />
                Owner Security
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isOwnerVerified ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
              }`}>
                {isOwnerVerified ? 'Owner Verified' : 'Protected'}
              </span>
            </div>

            <div className="bg-white/60 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/10 divide-y divide-slate-200/40 dark:divide-white/5 overflow-hidden">
              {/* Lock/Unlock Switch */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Master Controls</h4>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                    {isOwnerVerified ? 'Administrative rights active' : 'View-Only state active'}
                  </p>
                </div>
                {isOwnerVerified ? (
                  <button
                    onClick={lockOwnerMode}
                    className="px-3 py-1.5 rounded-full bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>Lock</span>
                  </button>
                ) : (
                  <button
                    onClick={() => requireOwnerPermission('Unlock Full Owner Controls', () => {})}
                    className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <Unlock className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>Authorize</span>
                  </button>
                )}
              </div>

              {/* iOS Toggle - Anti-Copy Protection */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Anti-Theft Copy Guard</h4>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400">Block scraping & raw source inspection</p>
                </div>
                <button 
                  onClick={() => toggleCopyProtection(!copyProtectionActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                    copyProtectionActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-700'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition duration-300 ease-in-out ${
                    copyProtectionActive ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Master PIN Customization */}
              <div className="p-3.5">
                {!showPinChange ? (
                  <button
                    onClick={() => setShowPinChange(true)}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>Change Master Owner PIN</span>
                  </button>
                ) : (
                  <form onSubmit={handleSavePin} className="space-y-2 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">Update Master PIN</span>
                      <button 
                        type="button" 
                        onClick={() => setShowPinChange(false)}
                        className="text-[10px] text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <input
                      type="password"
                      maxLength={8}
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value)}
                      placeholder="Current Master PIN"
                      className="w-full px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/60 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
                    />

                    <input
                      type="password"
                      maxLength={8}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="New PIN (min 4 digits)"
                      className="w-full px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/60 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
                    />

                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all active:scale-95 cursor-pointer mt-1"
                    >
                      Update Master PIN
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* iOS Inset Grouped List - AI Engine & Model Routing */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
              AI Intelligence Engine
            </h3>
            <div className="bg-white/60 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/10 divide-y divide-slate-200/40 dark:divide-white/5 overflow-hidden">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Default Core Model</h4>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400">High-speed reasoning & multimodal analysis</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  gemini-2.5-flash
                </span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Live News Impact Agent</h4>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400">Sector exposure & DCF valuation impact</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Connected
                </span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Multimodal Study Engine</h4>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400">Snap & Solve, Mock Exams, Feynman Critique</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  Active
                </span>
              </div>
            </div>
          </section>

          {/* iOS Inset Grouped List - Display & Dock Toggles */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 px-1">Display & Controls</h3>
            <div className="bg-white/60 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/10 divide-y divide-slate-200/40 dark:divide-white/5 overflow-hidden">
              
              {/* Fluid Animations Toggle */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Fluid Animations</h4>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400">Enable Apple spring motion effects</p>
                </div>
                <button 
                  onClick={() => updateSettings({ animationsEnabled: !settings.animationsEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                    settings.animationsEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-700'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition duration-300 ease-in-out ${
                    settings.animationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Hide Dock Toggle */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Hide Dock</h4>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400">Hide floating action dock entirely</p>
                </div>
                <button 
                  onClick={() => updateSettings({ hideFloatingDock: !settings.hideFloatingDock })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                    settings.hideFloatingDock ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-700'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition duration-300 ease-in-out ${
                    settings.hideFloatingDock ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Auto Hide Dock Toggle */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Auto-hide when typing</h4>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400">Hide dock when typing in text fields</p>
                </div>
                <button 
                  onClick={() => updateSettings({ autoHideDockWhenTyping: !settings.autoHideDockWhenTyping })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                    settings.autoHideDockWhenTyping ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-neutral-700'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition duration-300 ease-in-out ${
                    settings.autoHideDockWhenTyping ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>
          </section>

          {/* iOS Inset Grouped List - Share & Invite */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-1 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 stroke-[1.5]" />
              Share & Invite
            </h3>
            <div className="bg-white/60 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/10 divide-y divide-slate-200/40 dark:divide-white/5 overflow-hidden">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openShareAppModal'));
                  onClose();
                }}
                className="w-full p-3.5 text-left text-xs font-semibold text-slate-800 dark:text-neutral-200 hover:bg-slate-100/80 dark:hover:bg-white/5 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400 stroke-[1.5]" />
                  <span>Share App & Invite Friends</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20">
                  Invite
                </span>
              </button>
            </div>
          </section>

          {/* iOS Inset Grouped List - Data Backup & Management */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 px-1">Workspace Data</h3>
            <div className="bg-white/60 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/10 divide-y divide-slate-200/40 dark:divide-white/5 overflow-hidden">
              <button
                onClick={handleDownloadBackup}
                className="w-full p-3.5 text-left text-xs font-semibold text-slate-800 dark:text-neutral-200 hover:bg-slate-100/80 dark:hover:bg-white/5 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-sky-600 dark:text-sky-400 stroke-[1.5]" />
                  <span>Export Personal Workspace (.json)</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500">Backup</span>
              </button>

              <label className="w-full p-3.5 text-left text-xs font-semibold text-slate-800 dark:text-neutral-200 hover:bg-slate-100/80 dark:hover:bg-white/5 flex items-center justify-between transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[1.5]" />
                  <span>Import Backup File</span>
                </div>
                <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                <span className="text-[10px] text-slate-400 dark:text-neutral-500">Restore</span>
              </label>

              <button
                onClick={handleResetDemo}
                className="w-full p-3.5 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400 stroke-[1.5]" />
                  <span>Reset Workspace to Demo Defaults</span>
                </div>
                <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80">Reset</span>
              </button>
            </div>
          </section>

        </div>
      </motion.div>
    </>
  );
};
