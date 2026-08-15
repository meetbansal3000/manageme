import React from 'react';
import { 
  ShieldAlert, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Monitor, 
  LogOut, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { DeviceSession } from '../utils/deviceFingerprint';

export const DeviceLimitModal: React.FC = () => {
  const { 
    isDeviceBlocked, 
    currentDevice, 
    activeSessions, 
    revokeSession, 
    revokeOtherSessions, 
    signOut 
  } = useAuth();

  if (!isDeviceBlocked) return null;

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'PHONE':
        return <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'TABLET':
        return <Tablet className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Laptop className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const formatLastActive = (timestamp: number) => {
    const diffMins = Math.floor((Date.now() - timestamp) / 60000);
    if (diffMins < 1) return 'Active just now';
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Active ${diffDays}d ago`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 dark:bg-black/85 backdrop-blur-md animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-6 p-6 sm:p-8"
      >
        {/* Top Warning Banner */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold uppercase mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Session Policy Guard</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Device Limit Reached (Max 2 Devices Allowed)
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
              Your account is currently registered on <strong>2 active devices</strong>. To authorize this device (<strong>{currentDevice.deviceName}</strong>), please revoke an existing session below:
            </p>
          </div>
        </div>

        {/* Current Pending Device Card */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              {getDeviceIcon(currentDevice.deviceType)}
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block font-sans">{currentDevice.deviceName}</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400">Current Device (Pending Authorization)</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">
            BLOCKED
          </span>
        </div>

        {/* Registered Active Devices List */}
        <div className="space-y-3">
          <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-400 font-bold tracking-wider">
            Active Registered Devices ({activeSessions.length} / 2)
          </div>

          <div className="space-y-2.5">
            {activeSessions.map((session, idx) => (
              <div 
                key={session.deviceId || idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shrink-0">
                    {getDeviceIcon(session.deviceType)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                        {session.deviceName}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 uppercase">
                        {session.deviceType}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatLastActive(session.lastActive)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => revokeSession(session.deviceId)}
                  className="px-3 py-1.5 min-h-[36px] rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                  title="Revoke session on this device"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke & Authorize</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => revokeOtherSessions()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer"
          >
            Revoke All Other Devices
          </button>

          <button
            onClick={() => signOut()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cancel & Sign Out</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};
