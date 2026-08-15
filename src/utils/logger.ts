import { LogEntry } from '../types';

class Logger {
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  constructor() {
    this.addLog('info', 'Logger initialized');
  }

  private addLog(type: LogEntry['type'], message: string, details?: any) {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    };
    this.logs = [entry, ...this.logs].slice(0, 200); // keep last 200 logs
    this.notify();
    
    if (type === 'error') {
      console.error('[Debug Console]', message, details || '');
    } else {
      console.log(`[Debug Console] ${message}`, details || '');
    }
  }

  public info(message: string, details?: any) {
    this.addLog('info', message, details);
  }

  public error(message: string, details?: any) {
    this.addLog('error', message, details);
  }

  public api(message: string, details?: any) {
    this.addLog('api', message, details);
  }

  public storage(message: string, details?: any) {
    this.addLog('storage', message, details);
  }

  public getLogs() {
    return this.logs;
  }

  public clearLogs() {
    this.logs = [];
    this.addLog('info', 'Logs cleared');
  }

  public subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    listener(this.logs);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.logs));
  }
}

export const appLogger = new Logger();

// Create safe execution wrappers
export async function withSafeExecution<T>(
  operationName: string, 
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    appLogger.api(`Starting: ${operationName}`);
    const result = await operation();
    appLogger.api(`Success: ${operationName}`);
    return result;
  } catch (err: any) {
    appLogger.error(`Failed: ${operationName}`, err.message || err);
    if (fallback !== undefined) return fallback;
    return undefined;
  }
}

// Wrapper for localStorage
export const safeStorage = {
  getItem: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
      return defaultValue;
    } catch (err) {
      appLogger.error(`Error reading ${key} from storage`, err);
      return defaultValue;
    }
  },
  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      appLogger.storage(`Saved ${key} to local storage`);
    } catch (err) {
      appLogger.error(`Error saving ${key} to storage`, err);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      appLogger.storage(`Removed ${key} from local storage`);
    } catch (err) {
      appLogger.error(`Error removing ${key}`, err);
    }
  }
};
