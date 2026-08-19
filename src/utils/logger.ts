import { LogEntry } from '../types';

/**
 * Recursively sanitizes messages and objects, replacing emails, passwords,
 * tokens, and credentials with [REDACTED].
 */
export function redactPII(input: any): any {
  if (input === null || input === undefined) return input;

  if (typeof input === 'string') {
    return input
      // Redact email addresses
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
      // Redact Bearer / auth tokens
      .replace(/Bearer\s+[A-Za-z0-9-_=.]+/gi, 'Bearer [TOKEN_REDACTED]')
      // Redact common API key patterns
      .replace(/AIza[0-9A-Za-z-_]{35}/g, '[KEY_REDACTED]')
      .replace(/sk-[0-9a-zA-Z]{20,}/g, '[KEY_REDACTED]')
      .replace(/sb_publishable_[0-9a-zA-Z_-]{20,}/g, '[KEY_REDACTED]')
      // Redact PIN / password field occurrences in strings
      .replace(/\b(pin|password|secret|apikey|token)\s*[:=]\s*["']?[^"'\s,]+["']?/gi, '$1=[REDACTED]');
  }

  if (typeof input === 'object') {
    try {
      if (Array.isArray(input)) {
        return input.map(item => redactPII(item));
      }
      const sanitized: Record<string, any> = {};
      const sensitiveKeySubstrings = [
        'password',
        'pin',
        'token',
        'accesstoken',
        'apikey',
        'secret',
        'email',
        'cardnumber',
        'cvv',
        'customapikey',
        'authorization'
      ];

      for (const [key, val] of Object.entries(input)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeySubstrings.some(s => lowerKey.includes(s))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof val === 'object' && val !== null) {
          sanitized[key] = redactPII(val);
        } else if (typeof val === 'string') {
          sanitized[key] = redactPII(val);
        } else {
          sanitized[key] = val;
        }
      }
      return sanitized;
    } catch {
      return '[REDACTED_OBJECT]';
    }
  }

  return input;
}

class Logger {
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  constructor() {
    this.addLog('info', 'Logger initialized');
  }

  private addLog(type: LogEntry['type'], message: string, details?: any) {
    const cleanMessage = redactPII(message);
    const cleanDetails = details ? redactPII(details) : details;

    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      type,
      message: cleanMessage,
      details: cleanDetails
    };
    this.logs = [entry, ...this.logs].slice(0, 200); // keep last 200 logs
    this.notify();
    
    if (type === 'error') {
      console.error('[Debug Console]', cleanMessage, cleanDetails || '');
    } else {
      console.log(`[Debug Console] ${cleanMessage}`, cleanDetails || '');
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
