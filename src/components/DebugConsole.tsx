import React, { useEffect, useState } from 'react';
import { Terminal, X, Trash2 } from 'lucide-react';
import { LogEntry } from '../types';
import { appLogger } from '../utils/logger';

export const DebugConsole: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    return appLogger.subscribe((newLogs) => {
      setLogs([...newLogs]);
    });
  }, []);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'api': return 'text-blue-400';
      case 'storage': return 'text-amber-400';
      default: return 'text-gray-300';
    }
  };

  if (!isOpen) {
    return (
      <button
        id="debugConsoleBtn"
        onClick={() => setIsOpen(true)}
        className="hidden"
      />
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md h-96 flex flex-col bg-[#161617]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs text-gray-300">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-white">Debug Console</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => appLogger.clearLogs()}
            className="p-1 hover:bg-[var(--surface-solid)]/10 rounded text-gray-400 hover:text-white transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-[var(--surface-solid)]/10 rounded text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 flex flex-col-reverse">
        {logs.map((log) => (
          <div key={log.id} className="break-words">
            <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
            <span className={`uppercase font-bold ${getLogColor(log.type)}`}>
              [{log.type}]
            </span>{' '}
            <span className="text-gray-200">{log.message}</span>
            {log.details && (
              <pre className="mt-1 pl-4 border-l-2 border-white/10 text-[10px] text-gray-400 overflow-x-auto whitespace-pre-wrap">
                {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : String(log.details)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
