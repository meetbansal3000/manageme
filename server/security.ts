import { Request, Response, NextFunction } from 'express';

/**
 * 1. Environment Variable Validation on Server Boot
 */
export function validateEnvironment(): { isValid: boolean; warnings: string[]; errors: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical variables
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  if (!hasGeminiKey) {
    warnings.push('GEMINI_API_KEY is not configured in server environment. AI Copilot endpoints will require client-provided BYO keys.');
  }

  // Check Supabase URL / Key presence
  if (!process.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL.includes('placeholder')) {
    warnings.push('VITE_SUPABASE_URL is not set or using placeholder. Cloud database sync will use offline local storage.');
  }

  // Check optional news / financial keys
  const hasNewsKey = Boolean(process.env.MARKETAUX_API_KEY || process.env.FINNHUB_API_KEY || process.env.ALPHA_VANTAGE_API_KEY || process.env.GUARDIAN_API_KEY || process.env.RAPIDAPI_KEY);
  if (!hasNewsKey) {
    warnings.push('No external financial news API keys (Finnhub, Marketaux, Alpha Vantage, etc.) configured. News hub will utilize live Yahoo RSS stream.');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * 2. Security Headers Middleware (OWASP Compliant)
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');

  // HTTP Strict Transport Security (HSTS - 1 Year)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Cross-Site Scripting filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Hardware & feature access lockdown
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), payment=(), usb=()');

  // Content Security Policy (CSP)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.tfl.gov.uk https://api.geoapify.com https://finnhub.io https://api.marketaux.com https://www.alphavantage.co https://content.guardianapis.com https://*.rapidapi.com https://api.openai.com https://api.anthropic.com https://api.deepseek.com https://generativelanguage.googleapis.com",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'"
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  next();
}

/**
 * 3. Strict CORS Middleware
 */
export function strictCorsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const allowedOrigins = [
    process.env.APP_URL?.trim(),
    'https://manageme-three.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ].filter(Boolean) as string[];

  const origin = req.headers.origin;

  // Allow same-origin / non-browser requests
  if (!origin) {
    return next();
  }

  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-finnhub-token, x-marketaux-token, x-alphavantage-token, x-guardian-token, x-rapidapi-key');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    return next();
  }

  // Untrusted origin blocked
  res.status(403).json({ error: 'CORS policy: Access from this origin is restricted.' });
}

/**
 * 4. In-Memory Sliding Window Rate Limiter
 */
interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const ipHits = new Map<string, { count: number; resetTime: number }>();

  // Periodically clean up expired IP buckets
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipHits.entries()) {
      if (now > record.resetTime) {
        ipHits.delete(ip);
      }
    }
  }, options.windowMs);

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();
    const existing = ipHits.get(ip);

    if (!existing || now > existing.resetTime) {
      ipHits.set(ip, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    existing.count += 1;

    if (existing.count > options.maxRequests) {
      const retryAfterSec = Math.ceil((existing.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        error: options.message || 'Too many requests. Rate limit exceeded, please try again later.',
        retryAfterSeconds: retryAfterSec
      });
      return;
    }

    next();
  };
}

// 5 attempts per minute for auth / sensitive operations
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'Too many authentication attempts. Please wait 1 minute before trying again.'
});

// 25 heavy AI completions / minute
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25,
  message: 'AI request limit reached. Please wait a moment before sending more prompts.'
});

// 120 general requests / minute
export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'API rate limit exceeded. Please slow down your requests.'
});

/**
 * Helper to respond with safe, generic error message to client while logging detailed diagnostic to server
 */
export function sendSafeError(res: Response, statusCode: number, clientMessage: string, internalErr?: any): void {
  if (internalErr) {
    console.error(`[Server Error ${statusCode}]:`, internalErr?.message || internalErr);
  }
  res.status(statusCode).json({ error: clientMessage });
}

/**
 * 5. Safe Global Error Handler: Never Leaks Internal Stack Traces or Query Details
 */
export function safeErrorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  // Detailed diagnostic output goes to server console only
  console.error('[Server Internal Error]:', {
    method: req.method,
    path: req.path,
    message: err?.message || err,
    stack: err?.stack
  });

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: 'An internal server error occurred while processing your request. Please try again later.'
  });
}
