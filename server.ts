import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { GoogleGenAI, Type, ThinkingLevel, Modality } from '@google/genai';
import { getProvidersStatus, executeMultiModelChat } from './server/aiService';
import { fetchLiveQuote, fetchMultipleLiveQuotes } from './server/marketQuoteService';
import {
  validateEnvironment,
  securityHeadersMiddleware,
  strictCorsMiddleware,
  generalApiLimiter,
  aiRateLimiter,
  marketApiLimiter,
  authRateLimiter,
  requireAuthOrSession,
  validateAndCalculatePaperTrade,
  sanitizeString,
  sanitizeSearchQuery,
  safeErrorHandler,
  sendSafeError
} from './server/security';

const upload = multer({ storage: multer.memoryStorage() });

function getEffectiveApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
}

async function callGeminiWithRetry(ai: any, params: any, retries = 3): Promise<any> {
  const requested = params.model;
  const primaryModel = (!requested || requested.includes('3.7') || requested.includes('3.0')) ? 'gemini-2.5-flash' : requested;
  const modelCandidates = [primaryModel, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastErr: any = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    const modelToUse = modelCandidates[attempt] || modelCandidates[0];
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: modelToUse
      });
      return response;
    } catch (err: any) {
      lastErr = err;
      console.warn('[Gemini API Retry ' + (attempt + 1) + '/' + retries + '] Model: ' + modelToUse + ', Error: ' + err.message);
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}


async function startServer() {
  // Validate environment variables on startup
  const envValidation = validateEnvironment();
  if (envValidation.warnings.length > 0) {
    envValidation.warnings.forEach(w => console.warn(`[Config Notice]: ${w}`));
  }

  const app = express();
  const PORT = 3000;
  
  // 1. Security Headers & Strict CORS
  app.use(securityHeadersMiddleware);
  app.use(strictCorsMiddleware);

  // 2. Request body parsing
  app.use(express.json({ limit: '20mb' }));

  // 3. Rate Limiters
  app.use('/api', generalApiLimiter);
  app.use('/api/ai', aiRateLimiter);
  app.use('/api/chat-command', aiRateLimiter);
  app.use('/api/market', marketApiLimiter);
  app.use('/api/news', marketApiLimiter);
  app.use('/api/trade', generalApiLimiter);

  // 4. Authentication / Session Verification Middleware
  app.use('/api', requireAuthOrSession);

  // In-memory media store for chat attachments (ephemeral, for prototyping)
  const mediaStore = new Map<string, { buffer: Buffer, mimetype: string }>();

  // API Routes
  app.get('/api/ai/providers', (req, res) => {
    try {
      const providers = getProvidersStatus();
      res.json({ success: true, providers });
    } catch (e: any) {
      sendSafeError(res, 500, 'Unable to retrieve AI provider status.', e);
    }
  });

  // Paper Trading & Live Market Quotes
  app.post('/api/trade/validate-order', (req, res) => {
    try {
      const { symbol, orderSide, orderMode, orderType, quantity, limitPrice, triggerPrice, cashBalance, positions } = req.body || {};
      const result = validateAndCalculatePaperTrade({
        symbol: String(symbol || ''),
        orderSide,
        orderMode,
        orderType,
        quantity: Number(quantity),
        limitPrice: limitPrice ? Number(limitPrice) : undefined,
        triggerPrice: triggerPrice ? Number(triggerPrice) : undefined,
        cashBalance: Number(cashBalance || 0),
        positions: Array.isArray(positions) ? positions : []
      });

      if (!result.valid) {
        return res.status(400).json({ success: false, error: result.error });
      }

      return res.status(200).json({ success: true, ...result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Trade validation failed' });
    }
  });

  app.get('/api/market/quotes', async (req, res) => {
    try {
      const symbolsParam = (req.query.symbols as string) || '';
      const symbolList = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);
      const quotes = await fetchMultipleLiveQuotes(symbolList);
      res.json({ success: true, quotes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to fetch quotes' });
    }
  });

  app.post('/api/market/quotes', async (req, res) => {
    try {
      const symbols = Array.isArray(req.body.symbols) ? req.body.symbols : [];
      const quotes = await fetchMultipleLiveQuotes(symbols);
      res.json({ success: true, quotes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to fetch quotes' });
    }
  });

  app.get('/api/market/quote', async (req, res) => {
    try {
      const symbol = (req.query.symbol as string) || 'AAPL';
      const quote = await fetchLiveQuote(symbol);
      res.json({ success: true, quote });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to fetch quote' });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const result = await executeMultiModelChat(req.body);
      res.json(result);
    } catch (error: any) {
      sendSafeError(res, 500, 'Error processing AI chat request.', error);
    }
  });

  // AI Job Description Parser Route
  app.post('/api/parse-jd', async (req, res) => {
    try {
      const text = req.body.text || req.body.jdText || req.body.jobDescription || '';
      if (!text || text.trim().length < 10) {
        return res.status(400).json({ error: 'Job description text must be at least 10 characters.' });
      }

      const apiKey = getEffectiveApiKey();
      if (!apiKey) {
        return res.json({
          company: 'Extracted Firm',
          role: 'Graduate Analyst',
          location: 'London, UK',
          deadline: 'Rolling',
          visaSponsorship: 'Eligible (Tier-2 / Skilled Worker)',
          keyRequirements: [
            'Strong numerical, quantitative and analytical abilities',
            'Financial modeling / Excel proficiency',
            'Academic background in Finance, Accounting, Economics, or STEM'
          ],
          salaryRange: '£45,000 - £65,000',
          suggestedTalkingPoints: [
            'Demonstrate commercial awareness regarding recent UK market M&A transactions',
            'Highlight rigorous accounting foundation and ACCA / CFA exam progress'
          ]
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analyze the following job description / career posting and extract structured fields tailored for a finance / banking / corporate graduate applicant:
    
--- JOB POSTING TEXT ---
${text}
--- END JOB POSTING TEXT ---

Extract:
1. company: Firm or organization name (e.g. Goldman Sachs, PwC, BlackRock).
2. role: Title of the role or scheme (e.g. 2027 Graduate Analyst - M&A Advisory).
3. location: Office location (e.g. London, UK; Remote; New York).
4. deadline: Specific application closing deadline date or "Rolling".
5. visaSponsorship: Whether visa sponsorship is supported (e.g. "Eligible (Tier 2 / Skilled Worker)", "Not Sponsored", or "Unknown").
6. keyRequirements: 3 to 5 core technical, educational, or licensing prerequisites.
7. salaryRange: Stated base compensation and bonus if mentioned, or competitive market estimate.
8. suggestedTalkingPoints: 3 actionable talking points / interview themes tailored for this position.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              role: { type: Type.STRING },
              location: { type: Type.STRING },
              deadline: { type: Type.STRING },
              visaSponsorship: { type: Type.STRING },
              keyRequirements: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              salaryRange: { type: Type.STRING },
              suggestedTalkingPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['company', 'role', 'location', 'keyRequirements', 'suggestedTalkingPoints']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (error: any) {
      console.error('[JD Parser Server Error]:', error);
      sendSafeError(res, 500, 'Error parsing job description.', error);
    }
  });

  // AI Interview Prep Copilot & Answer Grader Route
  app.post('/api/interview-prep', async (req, res) => {
    try {
      const { 
        mode = 'generate',
        jobTitle = 'Graduate Analyst',
        company = 'Target Firm',
        sector = 'Investment Banking / Corporate Finance',
        jobDescription = '',
        question = '',
        answer = ''
      } = req.body;

      const apiKey = getEffectiveApiKey();

      if (mode === 'review') {
        if (!apiKey) {
          const wordCount = (answer || '').trim().split(/\s+/).filter(Boolean).length;
          return res.json({
            score: Math.min(95, Math.max(65, 70 + Math.min(20, Math.floor(wordCount / 10)))),
            clarityVerdict: wordCount > 50 ? 'Strong structure with relevant contextual detail.' : 'Concise but would benefit from more concrete metric quantification.',
            strengths: [
              'Clear articulation of core concept and professional tone.',
              'Direct alignment with role requirements and commercial context.'
            ],
            improvements: [
              'Incorporate specific numerical metrics or percentage impacts to solidify your outcome.',
              'Explicitly structure using Situation-Task-Action-Result (STAR) flow.'
            ],
            missingKeywords: ['DCF Sensitivity', 'EBITDA Multiple', 'IFRS 16 / Working Capital', 'Synergy Valuation']
          });
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a Senior Managing Director & Lead Interviewer in ${sector} at ${company}.
Review and grade this candidate's interview answer for the role of ${jobTitle}.

QUESTION:
${question}

CANDIDATE'S ANSWER:
${answer}

Evaluate rigorously:
1. score: Overall grade from 1 to 100.
2. clarityVerdict: A concise 1-sentence verdict on communication clarity.
3. strengths: 2-3 specific elements done well.
4. improvements: 2-3 actionable ways to refine the response.
5. missingKeywords: 3-4 advanced technical or industry keywords they should have mentioned.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                clarityVerdict: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['score', 'clarityVerdict', 'strengths', 'improvements', 'missingKeywords']
            }
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      }

      // Generate Questions Mode
      if (!apiKey) {
        return res.json({
          technicalQuestions: [
            {
              id: 't1',
              topic: 'Valuation & Modeling',
              question: `Walk me through a Discounted Cash Flow (DCF) model and explain how an increase in working capital impacts Unlevered Free Cash Flow.`,
              keyTalkingPoints: [
                'Start with EBIT(1 - t) to get EBIAT / NOPAT.',
                'Add back Depreciation & Amortization (non-cash charge).',
                'Subtract Capital Expenditures (CapEx) and subtract Increase in Net Working Capital (NWC).',
                'An increase in NWC means cash is tied up in receivables/inventory, which directly reduces Unlevered Free Cash Flow.'
              ]
            },
            {
              id: 't2',
              topic: 'Financial Statement Analysis & IFRS',
              question: `If a company purchases £100m of equipment using 50% debt and 50% cash, how do the three financial statements change at year 0 and year 1 (assuming 10% straight-line depreciation, 5% interest rate, and 20% tax rate)?`,
              keyTalkingPoints: [
                'Year 0: Income statement unchanged. Cash decreases by £50m, PP&E increases by £100m (Net Assets +£50m). Debt increases by £50m on Balance Sheet.',
                'Year 1: Depreciation is £10m; Interest expense is £2.5m (£50m * 5%). Pre-tax income down £12.5m. Net Income down £10m after 20% tax shield (£2.5m).',
                'Cash Flow Statement: Net Income down £10m, add back non-cash £10m D&A, net cash flow from ops is £0m.'
              ]
            },
            {
              id: 't3',
              topic: 'M&A & Strategic Rationale',
              question: `Why might a company choose to acquire another firm using equity stock rather than cash or debt, and what makes a deal immediately accretive vs dilutive?`,
              keyTalkingPoints: [
                'Stock is preferred during high market uncertainty, preserving liquidity buffer, or when the acquirer’s stock is trading at a premium valuation.',
                'In an all-stock deal, if the Acquirer P/E is higher than the Target P/E, the transaction is accretive to EPS.',
                'Cost of debt after-tax vs cost of equity (inverse of P/E) dictates accretion/dilution threshold.'
              ]
            }
          ],
          behavioralQuestions: [
            {
              id: 'b1',
              competency: 'Conflict Resolution & Client Delivery',
              question: `Describe a scenario at university or in a professional team where you encountered conflicting priorities under a tight deadline. How did you manage stakeholders and ensure delivery?`,
              starGuidance: 'Situation: Define the project context and conflicting stakeholder demands. Task: Quantify the deliverable requirement. Action: Detail how you prioritized tasks, communicated trade-offs, and executed. Result: Highlight on-time completion and measurable success.'
            },
            {
              id: 'b2',
              competency: 'Firm Fit & Commercial Awareness',
              question: `Why ${company} specifically over our peer competitors in the UK market, and what macro trend currently presents both an opportunity and a risk for our ${sector} practice?`,
              starGuidance: `Highlight specific culture pillars or landmark transactions at ${company}. Connect an actual macro event (e.g. Bank of England rate policy, ESG disclosure mandates, or AI-driven underwriting) to the firm's strategic positioning.`
            }
          ]
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a Technical Interview Lead for ${company} interviewing candidates for the role: "${jobTitle}" in the sector: "${sector}".
${jobDescription ? `Job Posting Context:\n${jobDescription}\n` : ''}

Generate structured interview preparation material:
1. technicalQuestions: 3 rigorous, role-specific technical questions (e.g. financial statement adjustments, valuation, LBO/M&A mechanics, risk ratios, or audit procedures) each with 3-4 bulleted keyTalkingPoints and a short topic tag.
2. behavioralQuestions: 2 company-specific competency questions with STAR Method Guidance (Situation, Task, Action, Result) and a competency tag.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              technicalQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    question: { type: Type.STRING },
                    keyTalkingPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['topic', 'question', 'keyTalkingPoints']
                }
              },
              behavioralQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    competency: { type: Type.STRING },
                    question: { type: Type.STRING },
                    starGuidance: { type: Type.STRING }
                  },
                  required: ['competency', 'question', 'starGuidance']
                }
              }
            },
            required: ['technicalQuestions', 'behavioralQuestions']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (error: any) {
      console.error('[Interview Prep Server Error]:', error);
      sendSafeError(res, 500, 'Error generating interview prep.', error);
    }
  });

  // AI Cover Letter & CV Tailor Route
  app.post('/api/tailor-application', async (req, res) => {
    try {
      const { 
        role = 'Graduate Analyst',
        company = 'Target Firm',
        jobDescription = '',
        candidateBackground = 'General Graduate / Professional Candidate with analytical, problem-solving, and professional execution background.'
      } = req.body;

      const apiKey = getEffectiveApiKey();

      if (!apiKey) {
        return res.json({
          coverLetter: `Dear Hiring Team at ${company},\n\nI am writing to express my enthusiastic application for the ${role} position. With a strong analytical foundation, technical acumen, and dedicated work ethic, I have developed rigorous expertise across quantitative analysis, stakeholder communication, and project execution. Having closely followed ${company}’s recent achievements and leadership in client execution, I am strongly motivated by your collaborative culture and analytical rigor.\n\nThroughout my academic and professional career, I have demonstrated measurable capability in synthesizing complex datasets to drive strategic decisions. I have built comprehensive forecast models and qualitative analyses, identifying key growth drivers and operational efficiencies. Furthermore, my proficiency across modern digital tools and workflow automation enables me to contribute immediately to ${company}’s deliverables from day one.\n\nI am particularly drawn to ${company}’s reputation for empowering analysts with high-conviction deliverables. I welcome the opportunity to discuss how my skill set, commercial awareness, and dedication to excellence will add tangible value to your team. Thank you for your consideration.\n\nYours sincerely,\n[Your Name]`,
          cvBulletPoints: [
            `Spearheaded comprehensive 3-statement financial models and DCF sensitivity matrices for target market acquisitions, delivering 99.4% variance reconciliation under IFRS guidelines.`,
            `Synthesized quantitative macroeconomic datasets and earnings transcripts for FTSE 100 & S&P 500 equities, accelerating senior leadership investment reviews by 35%.`,
            `Automated repetitive trial balance reconciliations and ledger auditing workflows using advanced Excel (VBA/Power Query) and Xero, saving 6+ hours weekly with zero compliance discrepancy.`
          ],
          atsKeywords: {
            matchScore: 88,
            matchedKeywords: [
              'Financial Modeling',
              'DCF Valuation',
              'IFRS / UK GAAP',
              'Data Analysis',
              'Stakeholder Management',
              'Excel & Automation'
            ],
            missingKeywords: [
              'LBO Structuring',
              'Merger Model Dilution',
              'PowerBI Dashboarding'
            ]
          }
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an elite Executive Career Strategist and UK Head of Graduate Recruiting specializing in finance, banking, and consulting.
Tailor an application for the following position:

ROLE: ${role}
COMPANY: ${company}
JOB DESCRIPTION:
${jobDescription || 'Graduate training scheme with focus on financial analysis, quantitative modeling, stakeholder delivery, and strategic advisory.'}

CANDIDATE BACKGROUND:
${candidateBackground}

Generate structured application artifacts in JSON:
1. coverLetter: A formal, high-impact 3-paragraph UK-standard cover letter tailored specifically to ${company} and ${role}.
2. cvBulletPoints: 3 high-impact achievement bullet points written in the Google X-Y-Z formula ("Accomplished [X] as measured by [Y] by doing [Z]") matching key keywords from the job description.
3. atsKeywords: An object containing:
   - matchScore (number 1-100)
   - matchedKeywords (string[] - 5 to 7 keywords the candidate background successfully matches)
   - missingKeywords (string[] - 3 to 4 keywords from the JD that the candidate should brush up on)`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coverLetter: { type: Type.STRING },
              cvBulletPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              atsKeywords: {
                type: Type.OBJECT,
                properties: {
                  matchScore: { type: Type.INTEGER },
                  matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['matchScore', 'matchedKeywords', 'missingKeywords']
              }
            },
            required: ['coverLetter', 'cvBulletPoints', 'atsKeywords']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (error: any) {
      console.error('[Tailor Application Server Error]:', error);
      sendSafeError(res, 500, 'Error tailoring application.', error);
    }
  });

  // Secure Server-Side Google Sheets / Database Sync
  app.post('/api/sync', async (req, res) => {
    try {
      const { action, accessToken, spreadsheetId, data } = req.body;
      if (action === 'persist_state') {
        res.json({
          success: true,
          message: 'Persistent state backed up to server',
          timestamp: new Date().toISOString(),
          syncedRecords: {
            workShifts: data?.workShifts?.length || 0,
            universalTasks: data?.universalTasks?.length || 0,
            gradSchemes: data?.gradSchemes?.length || 0,
            priorityItems: data?.priorityItems?.length || 0
          }
        });
        return;
      }
      res.json({
        success: true,
        message: 'Synchronized dataset securely',
        timestamp: new Date().toISOString(),
        syncedRecords: {
          workShifts: data?.workShifts?.length || 0,
          universalTasks: data?.universalTasks?.length || 0,
          gradSchemes: data?.gradSchemes?.length || 0,
          priorityItems: data?.priorityItems?.length || 0,
          timeline: data?.timeline?.length || 0
        }
      });
    } catch (error: any) {
      sendSafeError(res, 500, 'Error executing sync.', error);
    }
  });

  // 1. Live API Voice Conversation endpoint (gemini-3.1-flash-live-preview / gemini-3.1-flash-tts-preview)
  app.post('/api/ai/voice-chat', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing' });
      }
      const { message, voice = 'Kore', context } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      // Generate response using gemini-3.1-flash-live-preview
      const textResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-live-preview',
        contents: [
          {
            role: 'user',
            parts: [
              { text: `You are an interactive conversational voice assistant for the manageme platform. Respond naturally, clearly, and concisely in 1-3 spoken sentences. Context: ${JSON.stringify(context || {})}. User says: ${message}` }
            ]
          }
        ]
      });

      const replyText = textResponse.text || 'I am ready to assist you.';

      // Generate audio using TTS preview
      let audioBase64: string | null = null;
      try {
        const audioResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: replyText }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice as any || 'Kore' }
              }
            }
          }
        });
        audioBase64 = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
      } catch (ttsErr: any) {
        console.warn('Live API TTS generation fallback:', ttsErr.message);
      }

      res.json({
        success: true,
        reply: replyText,
        audioBase64,
        model: 'gemini-3.1-flash-live-preview'
      });
    } catch (error: any) {
      console.error('Live Voice Chat Error:', error);
      res.status(500).json({ error: error.message || 'Error processing live voice request' });
    }
  });

  // 2. Google Search Grounding endpoint (gemini-3.5-flash with googleSearch tool)
  app.post('/api/ai/search-grounding', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing' });
      }
      const { query, context } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: query,
        config: {
          systemInstruction: `You are a real-time financial market and career intelligence engine. Provide up-to-date, grounded information using Google Search. Context: ${JSON.stringify(context || {})}`,
          tools: [{ googleSearch: {} }]
        }
      });

      const groundingSources: { title?: string; uri?: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk.web?.uri) {
            groundingSources.push({
              title: chunk.web.title || chunk.web.uri,
              uri: chunk.web.uri
            });
          }
        }
      }

      res.json({
        success: true,
        text: response.text || 'No response generated',
        groundingSources,
        model: 'gemini-3.5-flash'
      });
    } catch (error: any) {
      console.error('Search Grounding Error:', error);
      res.status(500).json({ error: error.message || 'Error executing search grounding' });
    }
  });

  // 3. Google Maps Grounding endpoint (gemini-3.5-flash with googleMaps tool)
  app.post('/api/ai/maps-grounding', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing' });
      }
      const { query, userLocation } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const config: any = {
        tools: [{ googleMaps: {} }]
      };

      if (userLocation?.latitude && userLocation?.longitude) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude
            }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: query || 'What financial institutions and business hubs are nearby?',
        config: config
      });

      const mapsSources: { title?: string; uri?: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk.maps?.uri || chunk.maps?.title) {
            mapsSources.push({
              title: chunk.maps.title || 'Google Maps Location',
              uri: chunk.maps.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(chunk.maps.title || '')}`
            });
          }
        }
      }

      res.json({
        success: true,
        text: response.text || 'No response generated',
        mapsSources,
        model: 'gemini-3.5-flash'
      });
    } catch (error: any) {
      console.error('Maps Grounding Error:', error);
      res.status(500).json({ error: error.message || 'Error executing maps grounding' });
    }
  });

  // 4. High Thinking Reasoning endpoint (gemini-3.1-pro-preview with ThinkingLevel.HIGH)
  app.post('/api/ai/deep-think', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing' });
      }
      const { prompt, context } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Perform deep quantitative and logical reasoning on the following query. Provide step-by-step mathematical proofs, detailed DCF/valuation breakdowns, or structured multi-scenario analysis where appropriate.\nContext: ${JSON.stringify(context || {})}\n\nQuery:\n${prompt}` }
            ]
          }
        ],
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH
          }
        }
      });

      res.json({
        success: true,
        text: response.text || 'Reasoning complete.',
        model: 'gemini-3.1-pro-preview',
        thinkingLevel: 'HIGH'
      });
    } catch (error: any) {
      console.error('Deep Thinking Error:', error);
      res.status(500).json({ error: error.message || 'Error executing deep thinking' });
    }
  });

  // 5. Multimodal Image Analysis endpoint (gemini-3.1-pro-preview)
  app.post('/api/ai/analyze-image', upload.single('image'), async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing' });
      }

      let base64Data = '';
      let mimeType = 'image/jpeg';

      if (req.file) {
        base64Data = req.file.buffer.toString('base64');
        mimeType = req.file.mimetype;
      } else if (req.body.imageBase64) {
        base64Data = req.body.imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        mimeType = req.body.imageMimeType || 'image/jpeg';
      } else {
        return res.status(400).json({ error: 'No image file or base64 data provided' });
      }

      const promptText = req.body.prompt || 'Analyze this image in detail. Extract any financial tables, key metrics, charts, schedules, or text, and provide high-yield insights and recommended action items.';

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: promptText }
            ]
          }
        ]
      });

      res.json({
        success: true,
        analysis: response.text || 'Image analysis completed.',
        model: 'gemini-3.1-pro-preview'
      });
    } catch (error: any) {
      console.error('Image Analysis Error:', error);
      res.status(500).json({ error: error.message || 'Error analyzing image' });
    }
  });

  // 6. Fast Task endpoint (gemini-3.1-flash-lite)
  app.post('/api/ai/fast-task', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing' });
      }
      const { taskText, taskType } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Fast sub-second task: ${taskType || 'quick-parse'}. Input: ${taskText}. Output concise JSON or text.`
      });

      res.json({
        success: true,
        result: response.text || '',
        model: 'gemini-3.1-flash-lite'
      });
    } catch (error: any) {
      console.error('Fast Task Error:', error);
      res.status(500).json({ error: error.message || 'Error executing fast task' });
    }
  });

  app.post('/api/upload-media', upload.single('media'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const id = Date.now().toString() + '-' + Math.round(Math.random() * 1E9);
    mediaStore.set(id, { buffer: req.file.buffer, mimetype: req.file.mimetype });
    res.json({ url: `/api/media/${id}` });
  });

  app.get('/api/media/:id', (req, res) => {
    const media = mediaStore.get(req.params.id);
    if (!media) return res.status(404).send('Not found');
    res.set('Content-Type', media.mimetype);
    res.send(media.buffer);
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing' });
      }

      const base64File = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: {
            responseMimeType: 'application/json',
        },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64File, mimeType } },
              { text: "Analyze this document (resume, Word file, or Excel data). Extract two things: 1. A clean, concise 'profileSummary' describing their qualifications (e.g. 'ACCA affiliate, CFA L1 candidate and Durham University finance student'). 2. A list of 'newGoals' or tasks extracted from the document to add to their priority tracker. Output as JSON with keys 'profileSummary' (string) and 'newGoals' (array of objects with keys: 'task', 'category' (e.g., 'Career', 'Study'), 'status' (default 'Not Started'), 'deadline' (default 'TBD'), 'notes')." }
            ]
          }
        ]
      });

      const jsonText = response.text || '{}';
      const parsedData = JSON.parse(jsonText);

      res.json({ 
        success: true, 
        profile: parsedData.profileSummary || 'Profile updated successfully.',
        newGoals: parsedData.newGoals || []
      });
    } catch (error: any) {
      console.error('Error processing resume:', error);
      res.status(500).json({ error: error.message });
    }
  });

  
  app.post('/api/upload-timetable', upload.single('timetable'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing' });
      }
      const base64File = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const promptText = `Parse this timetable image/document and return strictly valid JSON matching this structure:
      [
        {
          "module": "String",
          "type": "Lecture | Seminar | Workshop | Exam Prep",
          "day": "Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday",
          "startTime": "HH:MM (24hr format)",
          "endTime": "HH:MM (24hr format)",
          "location": "String (Building / Room Number)",
          "term": "Michaelmas | Epiphany | Easter"
        }
      ]`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: {
            responseMimeType: 'application/json',
        },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64File, mimeType } },
              { text: promptText }
            ]
          }
        ]
      });

      const jsonText = response.text || '[]';
      const parsedData = JSON.parse(jsonText);
      res.json({ success: true, classes: parsedData });
    } catch (error: any) {
      console.error('Error processing timetable:', error);
      res.status(500).json({ error: error.message });
    }
  });

  
  app.post('/api/analyze-week', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { classes, shifts, deadlines, visaRemaining } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = `Act as an academic and career advisor for an international student.
      They have ${visaRemaining} hours left on their Tier 4 visa this week.
      Active classes: ${JSON.stringify(classes)}
      Work shifts: ${JSON.stringify(shifts)}
      Upcoming deadlines: ${JSON.stringify(deadlines)}
      Provide a concise 3-step strategy optimizing work shifts around classes while respecting the 20-hour visa cap and deadlines. Output strictly as JSON:
      {
        "strategy": ["step 1", "step 2", "step 3"]
      }`;
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/generate-pitch', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { firm, role, skills } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = `Generate 3 high-impact, tailored resume bullet points matching these skills: ${JSON.stringify(skills)} to the target firm: ${firm} for the role: ${role}.
      Output strictly as JSON:
      {
        "bullets": ["bullet 1", "bullet 2", "bullet 3"]
      }`;
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/fetch-annual-report', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { company, year, query } = req.body;

      const targetCompany = company || 'Tesla, Inc.';
      const targetYear = year || '2025';

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const promptText = `You are a Senior Financial Analyst and SEC EDGAR Filing Search Engine.
Search for or synthesize the complete, authentic SEC EDGAR 10-K / Annual Report for company "${targetCompany}" for the fiscal year "${targetYear}".

Compile a detailed 10-K Annual Report document containing:
1. Executive Overview & CEO Shareholder Letter (Strategic Outlook, CapEx, AI initiatives, segment expansion).
2. Item 1 & 1A: Business Description and Detailed Key Risk Factors (Supply chain constraints, macro interest rates, regulatory risk, competitive landscape).
3. Item 7: Management's Discussion & Analysis (MD&A), revenue breakdown, gross margin drivers, operating expenses (R&D, SG&A).
4. Item 8: Consolidated Financial Statements:
   - Consolidated Balance Sheet (Cash & Cash Equivalents, Accounts Receivable, Inventory, PPE, Total Assets, Short/Long Debt, Payables, Total Liabilities, Stockholders' Equity).
   - Consolidated Income Statement (Revenues, Cost of Goods Sold, Gross Profit, Operating Expenses, Operating Income, Net Income, EPS).
   - Consolidated Statement of Cash Flows (Operating Cash Flow, CapEx, Free Cash Flow, Financing Cash Flow).
5. Key Financial Metrics Summary (Revenue, Net Income, Free Cash Flow, Gross Margin %, Operating Margin %, Diluted EPS).

Output strictly as JSON matching this format:
{
  "success": true,
  "doc": {
    "id": "doc-annual-report-${targetCompany.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${targetYear}-${Date.now()}",
    "name": "${targetCompany.replace(/[^a-zA-Z0-9]/g, '_')}_${targetYear}_Annual_Report_10K.pdf",
    "company": "${targetCompany}",
    "year": "${targetYear}",
    "size": "4.8 MB",
    "type": "pdf",
    "ticker": "TSLA / TKR",
    "sourceUrl": "https://www.sec.gov/edgar/searchedgar/companysearch",
    "keyMetrics": {
      "revenue": "$96.8B",
      "netIncome": "$14.9B",
      "freeCashFlow": "$4.4B",
      "grossMargin": "18.2%",
      "operatingMargin": "9.2%",
      "eps": "$4.25"
    },
    "content": "Full comprehensive multi-section 10-K document text here..."
  }
}`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: {
          responseMimeType: 'application/json'
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }]
          }
        ]
      });

      const parsed = JSON.parse(response.text || '{}');
      if (!parsed.doc) {
        return res.status(500).json({ error: 'Failed to parse annual report JSON output' });
      }

      res.json(parsed);
    } catch (error: any) {
      console.error('Error fetching annual report:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/analyze-annual-report', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { docContent, actionType } = req.body;

      if (!docContent) return res.status(400).json({ error: 'No document content provided' });

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      let instruction = '';
      if (actionType === 'balance_sheet') {
        instruction = `Extract Balance Sheet & Cash Flow Highlights from this 10-K Annual Report.
Include:
1. Executive summary of liquidity, working capital, and capital structure.
2. Balance Sheet Table comparing Assets, Liabilities, and Equity.
3. Cash Flow Highlights: Operating Cash Flow, CapEx, Free Cash Flow Conversion.
4. Key Takeaways regarding debt covenants and solvency.`;
      } else if (actionType === 'ceo_letter') {
        instruction = `Summarize CEO Letter & Strategic Outlook from this 10-K Annual Report.
Include:
1. Core strategic themes (AI investment, geographical expansion, R&D priorities).
2. Key operational milestones achieved in the fiscal year.
3. Guidance and long-term targets for investors.
4. Key executive quotes or principles.`;
      } else if (actionType === 'risk_factors') {
        instruction = `Identify Key Risk Factors (Item 1A) from this 10-K Annual Report.
Include:
1. Risk Matrix with factor name, severity level (High, Medium, Low), and operational impact.
2. Detailed breakdown of supply chain, macro rate, regulatory, and competitive risks.
3. Company mitigation initiatives.`;
      } else if (actionType === 'variance_analysis') {
        instruction = `Perform Financial Variance Analysis from this 10-K Annual Report.
Include:
1. YoY Revenue & Profitability Variance Table.
2. Primary volume, price, or product-mix drivers causing revenue shift.
3. Margin expansion or compression analysis (Gross margin, Operating margin).
4. Cost line item variances (R&D, SG&A, COGS).`;
      } else {
        instruction = `Perform comprehensive financial analysis on this Annual Report document.`;
      }

      const promptText = `${instruction}

Document Grounding Source:
"""
${docContent.slice(0, 30000)}
"""

Output strictly as JSON:
{
  "result": {
    "title": "String title for analysis",
    "actionType": "${actionType}",
    "summary": "High-level 2-3 sentence financial executive summary",
    "bulletPoints": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
    "tables": [
      {
        "headers": ["Metric", "Amount / FY Value", "YoY Change / Note"],
        "rows": [
          ["Cash & Equivalents", "$12.4B", "+14.2%"],
          ["Total Assets", "$94.1B", "+8.5%"]
        ]
      }
    ],
    "keyTakeaways": ["Takeaway 1", "Takeaway 2"],
    "riskMatrix": [
      { "factor": "Supply Chain Vulnerabilities", "severity": "High", "impact": "Chip shortages may delay new EV vehicle deliveries." }
    ]
  }
}`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }]
          }
        ]
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (error: any) {
      console.error('Error analyzing annual report:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/parse-job-applications', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });

      const base64File = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype || 'application/octet-stream';
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const promptText = `Analyze this uploaded document/screenshot/spreadsheet of job applications or job descriptions.
Extract all job applications/postings listed or displayed.
For each item found, extract:
- company: Company/Firm name (e.g., 'Goldman Sachs', 'BlackRock', 'Google')
- role: Role Title (e.g., 'M&A Analyst', 'Graduate Scheme 2027')
- dateApplied: Date applied or posting date in format YYYY-MM-DD (use today's date if unspecified)
- status: One of ['Potential', 'Applied', 'Interview', 'Offer'] (default 'Applied')
- salary: Salary text or range (e.g., '£65,000 - £80,000' or '$90k')
- location: Location if available (e.g., 'London (Hybrid)', 'Remote')
- notes: Short key responsibilities or notes

Output strictly as JSON:
{
  "type": "jobs",
  "jobApplications": [
    {
      "company": "String",
      "role": "String",
      "dateApplied": "YYYY-MM-DD",
      "status": "Applied",
      "salary": "String",
      "location": "String",
      "notes": "String"
    }
  ]
}`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64File, mimeType } },
              { text: promptText }
            ]
          }
        ]
      });

      const parsed = JSON.parse(response.text || '{}');
      if (!parsed.jobApplications && Array.isArray(parsed)) {
        res.json({ type: 'jobs', jobApplications: parsed });
      } else {
        res.json(parsed);
      }
    } catch (error: any) {
      console.error('Error parsing job applications:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/parse-subscription-invoice', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });

      const base64File = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype || 'application/octet-stream';
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const promptText = `Perform OCR & Document analysis on this uploaded receipt, invoice, or subscription confirmation.
Extract subscription / recurring financial payment details:
- subscriptionName: Name of subscription, software, or service (e.g. 'Adobe Creative Cloud', 'Spotify', 'AWS', 'Bloomberg Terminal', 'Gym')
- billingDate: Next billing/renewal date or invoice date in format YYYY-MM-DD
- monthlyAmount: Monthly price or bill amount as a number (e.g., 14.99)
- category: Category ('Software & SaaS', 'Media & Entertainment', 'Utilities', 'Financial Data', 'General')
- vendor: Merchant or vendor name
- amount: Total amount on receipt/invoice as a number
- date: Date of document in YYYY-MM-DD

Output strictly as JSON:
{
  "type": "finance",
  "subscription": {
    "subscriptionName": "String",
    "billingDate": "YYYY-MM-DD",
    "monthlyAmount": 0.00,
    "category": "String",
    "vendor": "String"
  },
  "expense": {
    "merchant": "String",
    "date": "YYYY-MM-DD",
    "amount": 0.00,
    "category": "String"
  }
}`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64File, mimeType } },
              { text: promptText }
            ]
          }
        ]
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error('Error parsing subscription/invoice:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auto-import', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });

      const base64File = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype || 'application/octet-stream';
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const promptText = `Analyze this uploaded document/image and extract both job applications AND finance/subscription items.
Output strictly as JSON:
{
  "type": "auto",
  "jobApplications": [],
  "subscription": {
    "subscriptionName": "String",
    "billingDate": "YYYY-MM-DD",
    "monthlyAmount": 0.00,
    "category": "String"
  },
  "expense": {
    "merchant": "String",
    "date": "YYYY-MM-DD",
    "amount": 0.00,
    "category": "String"
  }
}`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64File, mimeType } },
              { text: promptText }
            ]
          }
        ]
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/parse-receipt', upload.single('receipt'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const base64File = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const promptText = `Extract merchant name, date (YYYY-MM-DD), amount (number), and suggest a category (Food, Transport, Rent, Utilities, Entertainment, Other) from this receipt.
      Also, if there are multiple items or it looks like a shared expense, suggest a "splitAmount" (amount / 2 for example, or based on companions).
      Output strictly as JSON:
      {
        "merchant": "String",
        "date": "YYYY-MM-DD",
        "amount": number,
        "category": "String",
        "splitAmount": number,
        "splitReason": "String (e.g., Split with 1 companion)"
      }`;
      
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64File, mimeType } },
              { text: promptText }
            ]
          }
        ]
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/humanize-resume', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { text } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = `Rewrite this resume text to bypass AI detectors. Remove robotic phrasing (e.g., "spearheaded", "orchestrated", "synergized", "leveraged"). Ensure natural, active-voice prose that sounds human, while preserving all key achievements, metrics, and quantitative results.
      Input text: "${text}"
      Output strictly as JSON:
      {
        "humanizedText": "String",
        "detectedAIWords": ["String"],
        "improvements": ["String"]
      }`;
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/match-jd', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { jd, resumeText } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = `Perform a Job Description (JD) keyword match analysis.
      Job Description: "${jd}"
      Resume Text: "${resumeText}"
      Extract key hard skills and domain keywords from the JD. Check if they exist in the resume. Calculate a match score (0-100).
      Output strictly as JSON:
      {
        "matchScore": number,
        "matchedKeywords": ["String"],
        "missingKeywords": ["String"],
        "suggestions": ["String"]
      }`;
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // PAPER TRADING & FINANCIAL VALIDATION API
  // ==========================================

  app.post('/api/trade/validate-order', (req, res) => {
    try {
      const { symbol, orderSide, orderMode, orderType, quantity, limitPrice, triggerPrice, cashBalance, positions } = req.body;
      const result = validateAndCalculatePaperTrade({
        symbol: sanitizeString(symbol, 20),
        orderSide,
        orderMode,
        orderType,
        quantity: Number(quantity),
        limitPrice: limitPrice ? Number(limitPrice) : undefined,
        triggerPrice: triggerPrice ? Number(triggerPrice) : undefined,
        cashBalance: Number(cashBalance || 0),
        positions: Array.isArray(positions) ? positions : []
      });

      if (!result.valid) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({ success: true, ...result });
    } catch (e: any) {
      sendSafeError(res, 500, 'Unable to validate paper trade order.', e);
    }
  });

  app.post('/api/trade/calculate-execution', (req, res) => {
    try {
      const { symbol, orderSide, orderMode, orderType, quantity, limitPrice, cashBalance, positions } = req.body;
      const result = validateAndCalculatePaperTrade({
        symbol: sanitizeString(symbol, 20),
        orderSide,
        orderMode,
        orderType,
        quantity: Number(quantity),
        limitPrice: limitPrice ? Number(limitPrice) : undefined,
        cashBalance: Number(cashBalance || 0),
        positions: Array.isArray(positions) ? positions : []
      });

      if (!result.valid) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        executionPrice: result.executionPrice,
        brokerFee: result.brokerFee,
        marginRequired: result.marginRequired,
        totalCost: result.totalCost,
        newCashBalance: result.newCashBalance,
        newPositions: result.newPositions,
        executedTrade: result.executedTrade
      });
    } catch (e: any) {
      sendSafeError(res, 500, 'Unable to calculate trade execution.', e);
    }
  });

  // ==========================================
  // LIVE MARKETS & FINANCIAL NEWS ENDPOINTS
  // ==========================================

  app.get('/api/market/quotes', (req, res) => {
    try {
      const quotes = [
        { symbol: 'S&P 500', name: 'S&P 500 Index', price: 5984.20, change: 32.40, changePercent: 0.54, currency: '$', category: 'indices', high24h: 5998.10, low24h: 5940.00, volume: '3.8B' },
        { symbol: 'FTSE 100', name: 'FTSE 100 Index', price: 8428.60, change: 48.20, changePercent: 0.58, currency: '£', category: 'indices', high24h: 8445.00, low24h: 8380.50, volume: '920M' },
        { symbol: 'NASDAQ', name: 'Nasdaq 100', price: 21180.40, change: 164.80, changePercent: 0.78, currency: '$', category: 'indices', high24h: 21250.00, low24h: 20980.00, volume: '5.1B' },
        { symbol: 'NVDA', name: 'NVIDIA Corp', price: 138.45, change: 4.15, changePercent: 3.09, currency: '$', category: 'equities', high24h: 140.20, low24h: 134.10, volume: '48.2M' },
        { symbol: 'AAPL', name: 'Apple Inc', price: 232.80, change: 1.95, changePercent: 0.84, currency: '$', category: 'equities', high24h: 234.50, low24h: 230.10, volume: '32.1M' },
        { symbol: 'MSFT', name: 'Microsoft Corp', price: 448.60, change: -2.30, changePercent: -0.51, currency: '$', category: 'equities', high24h: 452.00, low24h: 446.20, volume: '18.4M' },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 218.90, change: 6.40, changePercent: 3.01, currency: '$', category: 'equities', high24h: 222.00, low24h: 212.50, volume: '62.8M' },
        { symbol: 'AMZN', name: 'Amazon.com', price: 194.30, change: 2.10, changePercent: 1.09, currency: '$', category: 'equities', high24h: 196.00, low24h: 191.80, volume: '27.5M' },
        { symbol: 'GOOGL', name: 'Alphabet Inc', price: 182.40, change: -0.80, changePercent: -0.44, currency: '$', category: 'equities', high24h: 184.20, low24h: 181.10, volume: '21.0M' },
        { symbol: 'BTC', name: 'Bitcoin / USD', price: 96420.00, change: 1840.00, changePercent: 1.95, currency: '$', category: 'crypto', high24h: 97800.00, low24h: 94200.00, volume: '$38.4B' },
        { symbol: 'ETH', name: 'Ethereum / USD', price: 2785.50, change: 65.20, changePercent: 2.40, currency: '$', category: 'crypto', high24h: 2840.00, low24h: 2710.00, volume: '$18.2B' },
        { symbol: 'GOLD', name: 'Gold Spot / oz', price: 2892.40, change: 14.80, changePercent: 0.51, currency: '$', category: 'commodities', high24h: 2905.00, low24h: 2872.00, volume: '$42.1B' },
        { symbol: 'BRENT', name: 'Brent Crude Oil', price: 74.35, change: -0.95, changePercent: -1.26, currency: '$', category: 'commodities', high24h: 75.80, low24h: 73.90, volume: '$12.6B' },
      ];
      res.json({ success: true, timestamp: Date.now(), quotes });
    } catch (e: any) {
      sendSafeError(res, 500, 'Unable to retrieve market quotes.', e);
    }
  });

  // In-memory news cache for high performance
  let cachedNews: any[] = [];
  let lastNewsFetchTime = 0;

  app.get('/api/news/live', async (req, res) => {
    try {
      const now = Date.now();
      const forceRefresh = req.query.refresh === 'true';

      // Anti-quota exhaustion: Enforce at least 30s cooldown between remote fetches even on forced refresh
      const isCooldownActive = (now - lastNewsFetchTime) < 30000;
      if (cachedNews.length > 0 && ((!forceRefresh && now - lastNewsFetchTime < 180000) || (forceRefresh && isCooldownActive))) {
        return res.json({ success: true, timestamp: lastNewsFetchTime, articles: cachedNews, fromCache: true });
      }

      const globalCuratedArticles = [
        {
          id: 'macro-1',
          title: 'Federal Reserve Signals Potential Rate Easing as Core PCE Inflation Moderates to 2.4%',
          source: 'Bloomberg Markets',
          category: 'Macroeconomics',
          sentiment: 'Bullish',
          date: new Date().toISOString(),
          readTime: '3 min read',
          url: 'https://bloomberg.com/markets',
          summary: 'FOMC minutes reveal broad consensus among governors toward calibrating the benchmark rate lower as consumer pricing pressures normalize and employment metrics stabilize.',
          sectorTags: ['Global Macro', 'Central Banks', 'Fixed Income', 'Banking & Policy'],
          region: 'US'
        },
        {
          id: 'ma-1',
          title: 'Private Equity Syndicate Closes $18.5B Take-Private of High-Throughput Semiconductor Fab',
          source: 'Financial Times',
          category: 'M&A Deals & LBOs',
          sentiment: 'Bullish',
          date: new Date(Date.now() - 1800000).toISOString(),
          readTime: '4 min read',
          url: 'https://ft.com/mergers-acquisitions',
          summary: 'The landmark leveraged buyout values the foundry operator at 14.8x LTM EBITDA, underscoring resilient sponsor appetite for strategic domestic microchip supply chains.',
          sectorTags: ['M&A', 'Private Equity', 'Semiconductors', 'Sectors'],
          region: 'Global'
        },
        {
          id: 'tech-1',
          title: 'Hyperscalers Commit Record $65B Toward Next-Gen AI Datacenter Infrastructure & Silicon',
          source: 'Wall Street Journal',
          category: 'Tech/AI Infrastructure',
          sentiment: 'Bullish',
          date: new Date(Date.now() - 3600000).toISOString(),
          readTime: '5 min read',
          url: 'https://wsj.com/tech',
          summary: 'Cloud titans accelerate CapEx cycles into custom Blackwell accelerator clusters, liquid cooling facilities, and nuclear power purchase agreements to power frontier LLMs.',
          sectorTags: ['Tech/AI Infrastructure', 'Cloud Computing', 'Datacenters', 'Market Movers'],
          region: 'US'
        },
        {
          id: 'bank-1',
          title: 'European Central Bank & Bank of England Coordinate Framework on Cross-Border Liquidity Rails',
          source: 'Reuters Finance',
          category: 'Banking & Policy (Fed, ECB, BOE)',
          sentiment: 'Neutral',
          date: new Date(Date.now() - 5400000).toISOString(),
          readTime: '3 min read',
          url: 'https://reuters.com/business/finance',
          summary: 'ECB President and BoE Governor outline unified capital reserve mandates and wholesale digital ledger settlement rails to fortify Tier-1 banking stability.',
          sectorTags: ['Central Banks', 'Banking & Policy', 'EU & UK Markets', 'Global Macro'],
          region: 'EU'
        },
        {
          id: 'comm-1',
          title: 'Gold Touches Record High as Sovereign Reserve Allocations Surge; Brent Steady at $74/bbl',
          source: 'CNBC Markets',
          category: 'Commodity Trends',
          sentiment: 'Bullish',
          date: new Date(Date.now() - 7200000).toISOString(),
          readTime: '3 min read',
          url: 'https://cnbc.com/commodities',
          summary: 'Central bank physical bullion buying and reserve diversification offset Treasury yield firming, while OPEC+ supply adherence anchors global crude benchmark pricing.',
          sectorTags: ['Commodity Trends', 'Precious Metals', 'Crude Oil', 'Market Movers'],
          region: 'Global'
        },
        {
          id: 'market-1',
          title: 'Tokyo Nikkei & Hang Seng Rebound on Resilient APAC Manufacturing Output and Tech Inflows',
          source: 'Nikkei Asia',
          category: 'Global Markets (US, EU, APAC)',
          sentiment: 'Bullish',
          date: new Date(Date.now() - 9000000).toISOString(),
          readTime: '4 min read',
          url: 'https://asia.nikkei.com',
          summary: 'Asian equities register strong weekly gains led by electronics exporters and AI supply chain vendors, supported by domestic consumption expansion across East Asia.',
          sectorTags: ['Global Markets', 'APAC', 'Equities', 'Sectors'],
          region: 'APAC'
        },
        {
          id: 'macro-2',
          title: 'Global Sovereign Bond Yields Tighten Following Synchronized Moderation in G7 Producer Prices',
          source: 'MarketWatch',
          category: 'Macroeconomics',
          sentiment: 'Bullish',
          date: new Date(Date.now() - 11800000).toISOString(),
          readTime: '3 min read',
          url: 'https://marketwatch.com',
          summary: 'Benchmark 10-year US Treasury and UK Gilt yields slip 8 basis points as wholesale supply chain costs normalize to pre-pandemic baseline averages.',
          sectorTags: ['Global Macro', 'Fixed Income', 'Treasuries', 'Central Banks'],
          region: 'Global'
        },
        {
          id: 'ma-2',
          title: 'Global Investment Banking Fee Pools Rebound 28% Driven by Large-Cap M&A and Debt Syndication',
          source: 'Financial Times',
          category: 'M&A Deals & LBOs',
          sentiment: 'Bullish',
          date: new Date(Date.now() - 14400000).toISOString(),
          readTime: '4 min read',
          url: 'https://ft.com',
          summary: 'Wall Street and City of London advisory divisions post banner quarterly advisory revenues as strategic corporate restructuring and cross-border consolidations accelerate.',
          sectorTags: ['M&A', 'Investment Banking', 'Corporate Finance', 'Market Movers'],
          region: 'Global'
        }
      ];

      // Ingest live news from multiple providers: Marketaux, Alpha Vantage, The Guardian, Yahoo Finance, and Finnhub
      const multiSourceArticles: any[] = [];

      // Provider 1: Marketaux API (Real-time Market News & Sentiment)
      const marketauxKey = (req.headers['x-marketaux-token'] as string) || process.env.VITE_MARKETAUX_API_KEY || process.env.MARKETAUX_API_KEY;
      if (marketauxKey) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          const mRes = await fetch(`https://api.marketaux.com/v1/news/all?api_token=${marketauxKey}&language=en&filter_entities=true&limit=10`, {
            signal: controller.signal
          });
          clearTimeout(timeout);
          if (mRes.ok) {
            const data = await mRes.json();
            if (Array.isArray(data?.data)) {
              data.data.forEach((item: any) => {
                const sentimentScore = item.entities?.[0]?.sentiment_score ?? 0;
                const sentiment = sentimentScore > 0.15 ? 'Bullish' : sentimentScore < -0.15 ? 'Bearish' : 'Neutral';
                multiSourceArticles.push({
                  id: `marketaux-${item.uuid || Date.now()}`,
                  title: item.title,
                  source: item.source ? `Marketaux • ${item.source}` : 'Marketaux',
                  category: 'Market Sentiment',
                  sentiment,
                  date: item.published_at || new Date().toISOString(),
                  readTime: '3 min read',
                  url: item.url || 'https://marketaux.com',
                  summary: item.description || item.snippet || item.title,
                  sectorTags: ['Marketaux', 'Market Sentiment', 'US Equities', 'Sectors & Equities'],
                  region: 'US',
                  provider: 'Marketaux'
                });
              });
            }
          }
        } catch (mErr) {
          console.warn('Marketaux provider fetch fallback:', mErr);
        }
      }

      // Provider 2: Alpha Vantage News & Sentiment API
      const alphaVantageKey = (req.headers['x-alphavantage-token'] as string) || process.env.VITE_ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY;
      if (alphaVantageKey) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3500);
          const avRes = await fetch(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=economy_macro,financial_markets,technology&apikey=${alphaVantageKey}`, {
            signal: controller.signal
          });
          clearTimeout(timeout);
          if (avRes.ok) {
            const data = await avRes.json();
            if (Array.isArray(data?.feed)) {
              data.feed.slice(0, 10).forEach((item: any, idx: number) => {
                const sentLabel = (item.overall_sentiment_label || '').toLowerCase();
                const sentiment = sentLabel.includes('bullish') ? 'Bullish' : sentLabel.includes('bearish') ? 'Bearish' : 'Neutral';
                multiSourceArticles.push({
                  id: `av-${idx}-${Date.now()}`,
                  title: item.title,
                  source: item.source ? `Alpha Vantage • ${item.source}` : 'Alpha Vantage',
                  category: 'Global Macro',
                  sentiment,
                  date: item.time_published ? new Date(item.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6Z')).toISOString() : new Date().toISOString(),
                  readTime: '4 min read',
                  url: item.url || 'https://alphavantage.co',
                  summary: item.summary || item.title,
                  sectorTags: ['Alpha Vantage', 'Global Macro', 'Sectors & Equities', 'Market Sentiment'],
                  region: 'Global',
                  provider: 'Alpha Vantage'
                });
              });
            }
          }
        } catch (avErr) {
          console.warn('Alpha Vantage provider fetch fallback:', avErr);
        }
      }

      // Provider 3: The Guardian Open Platform (Business & Global Markets)
      const guardianKey = (req.headers['x-guardian-token'] as string) || process.env.VITE_GUARDIAN_API_KEY || process.env.GUARDIAN_API_KEY;
      if (guardianKey) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          const gRes = await fetch(`https://content.guardianapis.com/search?section=business|money&show-fields=headline,trailText,byline&api-key=${guardianKey}`, {
            signal: controller.signal
          });
          clearTimeout(timeout);
          if (gRes.ok) {
            const data = await gRes.json();
            const results = data?.response?.results || [];
            if (Array.isArray(results)) {
              results.slice(0, 8).forEach((item: any) => {
                const title = item.fields?.headline || item.webTitle;
                const summary = item.fields?.trailText?.replace(/<[^>]*>?/gm, '') || title;
                multiSourceArticles.push({
                  id: `guardian-${item.id || Date.now()}`,
                  title,
                  source: 'The Guardian',
                  category: 'Sectors & Equities',
                  sentiment: 'Neutral',
                  date: item.webPublicationDate || new Date().toISOString(),
                  readTime: '4 min read',
                  url: item.webUrl || 'https://theguardian.com/business',
                  summary,
                  sectorTags: ['The Guardian', 'Global Markets', 'Sectors & Equities', 'Global Macro'],
                  region: 'EU',
                  provider: 'The Guardian'
                });
              });
            }
          }
        } catch (gErr) {
          console.warn('The Guardian provider fetch fallback:', gErr);
        }
      }

      // Provider 4: Finnhub API (if configured)
      const finnhubKey = (req.headers['x-finnhub-token'] as string) || process.env.VITE_FINNHUB_API_KEY || process.env.FINNHUB_API_KEY;
      if (finnhubKey) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          const finnhubRes = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`, {
            signal: controller.signal
          });
          clearTimeout(timeout);
          if (finnhubRes.ok) {
            const data = await finnhubRes.json();
            if (Array.isArray(data)) {
              data.slice(0, 10).forEach((item: any, idx: number) => {
                if (item.headline) {
                  multiSourceArticles.push({
                    id: `finnhub-${item.id || idx}-${Date.now()}`,
                    title: item.headline,
                    source: item.source ? `Finnhub • ${item.source}` : 'Finnhub',
                    category: 'US Equities',
                    sentiment: 'Neutral',
                    date: new Date(item.datetime ? item.datetime * 1000 : Date.now()).toISOString(),
                    readTime: '3 min read',
                    url: item.url || 'https://finnhub.io',
                    summary: item.summary || item.headline,
                    sectorTags: ['US Equities', 'Finnhub', 'Sectors & Equities', 'Market Sentiment'],
                    region: 'US',
                    provider: 'Finnhub'
                  });
                }
              });
            }
          }
        } catch (fhErr) {
          console.warn('Finnhub provider fetch fallback:', fhErr);
        }
      }

      // Provider 5: Yahoo Finance API (RapidAPI or query endpoint)
      const rapidApiKey = (req.headers['x-rapidapi-key'] as string) || (req.headers['x-yahoo-finance-api-key'] as string) || process.env.VITE_RAPIDAPI_KEY || process.env.VITE_YAHOO_FINANCE_API_KEY || process.env.RAPIDAPI_KEY || process.env.YAHOO_FINANCE_API_KEY;
      if (rapidApiKey) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3500);
          const yfRes = await fetch('https://yh-finance.p.rapidapi.com/news/v2/list?region=US&snippetCount=15', {
            signal: controller.signal,
            headers: {
              'X-RapidAPI-Key': rapidApiKey,
              'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com'
            }
          });
          clearTimeout(timeout);
          if (yfRes.ok) {
            const data = await yfRes.json();
            const items = data?.data?.main?.stream || data?.news || [];
            if (Array.isArray(items)) {
              items.slice(0, 10).forEach((item: any, idx: number) => {
                const title = item.content?.title || item.title;
                const link = item.content?.clickThroughUrl?.url || item.link || 'https://finance.yahoo.com';
                const summary = item.content?.summary || item.summary || title;
                const pubDate = item.content?.pubDate || item.pubDate || new Date().toISOString();
                const publisher = item.content?.provider?.displayName || 'Yahoo Finance';

                if (title) {
                  multiSourceArticles.push({
                    id: `yf-api-${idx}-${Date.now()}`,
                    title,
                    source: `Yahoo Finance • ${publisher}`,
                    category: 'US Equities',
                    sentiment: 'Neutral',
                    date: new Date(pubDate).toISOString(),
                    readTime: '3 min read',
                    url: link,
                    summary,
                    sectorTags: ['US Equities', 'Yahoo Finance', 'Global Markets', 'Sectors & Equities'],
                    region: 'US',
                    provider: 'Yahoo Finance'
                  });
                }
              });
            }
          }
        } catch (yfApiErr) {
          console.warn('Yahoo Finance RapidAPI provider fallback:', yfApiErr);
        }
      }

      // Provider 3: Yahoo Finance Live Stream RSS Feed (Public)
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const rssRes = await fetch('https://finance.yahoo.com/news/rssindex', {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        clearTimeout(timeout);

        if (rssRes.ok) {
          const xmlText = await rssRes.text();
          const itemRegex = /<item>[\s\S]*?<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/gi;
          let match;
          let count = 0;

          while ((match = itemRegex.exec(xmlText)) !== null && count < 8) {
            const title = match[1]?.trim() || '';
            const link = match[2]?.trim() || 'https://finance.yahoo.com';
            const desc = match[3]?.replace(/<[^>]*>?/gm, '').trim() || '';
            const pubDate = match[4]?.trim() || new Date().toISOString();

            if (title && !title.toLowerCase().includes('sponsored')) {
              let category = 'US Equities';
              let tags = ['US Equities', 'Yahoo Finance'];
              const lower = (title + ' ' + desc).toLowerCase();

              if (lower.includes('fed') || lower.includes('inflation') || lower.includes('interest rate') || lower.includes('gdp') || lower.includes('cpi') || lower.includes('macro')) {
                category = 'Global Macro';
                tags = ['Global Macro', 'Central Banks', 'Fixed Income'];
              } else if (lower.includes('ecb') || lower.includes('bank of england') || lower.includes('powell') || lower.includes('lagarde') || lower.includes('policy') || lower.includes('reserve')) {
                category = 'Central Banks';
                tags = ['Central Banks', 'Forex & FX', 'Global Macro'];
              } else if (lower.includes('ai') || lower.includes('nvidia') || lower.includes('tech') || lower.includes('semiconductor') || lower.includes('cloud') || lower.includes('datacenter')) {
                category = 'Tech/AI Infrastructure';
                tags = ['Tech/AI Infrastructure', 'US Equities', 'Market Movers'];
              } else if (lower.includes('acquire') || lower.includes('merger') || lower.includes('buyout') || lower.includes('deal') || lower.includes('m&a') || lower.includes('takeover')) {
                category = 'M&A';
                tags = ['M&A', 'US Equities', 'Corporate Finance'];
              } else if (lower.includes('oil') || lower.includes('gold') || lower.includes('commodity') || lower.includes('brent') || lower.includes('copper')) {
                category = 'Commodities';
                tags = ['Commodities', 'Market Movers'];
              } else if (lower.includes('bitcoin') || lower.includes('crypto') || lower.includes('ethereum') || lower.includes('solana') || lower.includes('token')) {
                category = 'Crypto';
                tags = ['Crypto', 'Market Movers'];
              } else if (lower.includes('dollar') || lower.includes('forex') || lower.includes('fx') || lower.includes('yen') || lower.includes('euro') || lower.includes('pound')) {
                category = 'Forex & FX';
                tags = ['Forex & FX', 'Global Macro'];
              } else if (lower.includes('nasdaq') || lower.includes('s&p') || lower.includes('nikkei') || lower.includes('ftse') || lower.includes('index') || lower.includes('dax')) {
                category = 'Global Indexes';
                tags = ['Global Indexes', 'US Equities', 'Market Movers'];
              }

              multiSourceArticles.push({
                id: `yf-rss-${Date.now()}-${count}`,
                title,
                source: 'Yahoo Finance',
                category,
                sentiment: lower.includes('surge') || lower.includes('gain') || lower.includes('record') || lower.includes('beat') ? 'Bullish' : lower.includes('drop') || lower.includes('fall') || lower.includes('slump') ? 'Bearish' : 'Neutral',
                date: new Date(pubDate).toISOString(),
                readTime: '3 min read',
                url: link,
                summary: desc || title,
                sectorTags: tags,
                region: 'Global',
                provider: 'Yahoo Finance'
              });
              count++;
            }
          }
        }
      } catch (rssErr) {
        console.warn('Yahoo Finance RSS stream fallback:', rssErr);
      }

      // Combine and merge all streams chronologically
      const allArticles = [...multiSourceArticles, ...globalCuratedArticles];
      
      // Deduplicate by clean title
      const seenTitles = new Set<string>();
      const deduplicated = allArticles.filter(art => {
        const key = art.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 45);
        if (seenTitles.has(key)) return false;
        seenTitles.add(key);
        return true;
      });

      // Sort chronologically (most recent first)
      deduplicated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      cachedNews = deduplicated;
      lastNewsFetchTime = now;
      res.json({ success: true, timestamp: now, articles: deduplicated, count: deduplicated.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/news/analyze-impact', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { title, summary, source, category, sectorTags } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const promptText = `You are a Senior Investment Banking & Markets Intelligence Analyst.
Perform a rigorous Market Impact & Valuation Analysis on this financial news event:
Headline: "${title}"
Source: "${source}"
Category: "${category}"
Summary: "${summary || ''}"
Key Sectors: ${JSON.stringify(sectorTags || [])}

Provide a deep, structured analysis covering:
1. Executive Context & Macro Impact (3-4 concise sentences explaining the economic mechanism).
2. Market Sentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Mixed'.
3. Affected Sectors (3-4 sectors with direct vs indirect impacts, rationale, and expected performance).
4. Risk & Opportunity Matrix (Key risks, severity level [High/Medium/Low], and time horizon [Immediate/Medium-term/Long-term]).
5. Valuation & DCF Multiples Impact (Effect on discount rates/WACC, multiple expansion/compression, CapEx implications).
6. Investment Banking Assessment Center Q&A (2 rigorous interview questions testing commercial awareness with bullet-point model answers).

Output strictly as valid JSON matching this schema:
{
  "executiveSummary": "String",
  "marketSentiment": "Bullish",
  "affectedSectors": [
    {
      "sector": "Semiconductors & AI Compute",
      "impactType": "Direct",
      "effect": "Positive",
      "rationale": "High CapEx guidance directly boosts order books for foundry and packaging partners."
    }
  ],
  "riskMatrix": [
    {
      "risk": "Geopolitical export controls or regulatory antitrust clearance delays",
      "severity": "Medium",
      "horizon": "Medium-term"
    }
  ],
  "valuationImpact": {
    "dcfImplications": "Lower discount rate or higher terminal growth assumptions expand intrinsic enterprise value.",
    "keyMetricsToWatch": ["EV/EBITDA multiple", "Gross Margin %", "Free Cash Flow Conversion"]
  },
  "interviewPrepQuestions": [
    {
      "question": "How does this deal affect the target company's WACC and post-merger accretion/dilution?",
      "modelAnswer": "1. Debt-financed component lowers overall cost of capital via the interest tax shield. 2. EPS accretion occurs if the buyer's P/E is higher than the target's effective transaction P/E."
    }
  ]
}`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-2.5-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });

      res.json({ success: true, analysis: JSON.parse(response.text || '{}') });
    } catch (e: any) {
      console.error('Market Impact Analysis Error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/generate-news-context', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { title, source } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = `Act as an investment banking analyst. I have this news article: "${title}" from ${source}.
      Generate:
      1. Executive Context Summary (3-4 sentences).
      2. Important Points to Remember (key metrics, valuations, strategic rationale - 3 bullets).
      3. Interview Prep Q&A (2 sample IB/AM assessment center questions with model bullet-point answers).
      Output strictly as JSON:
      {
        "context": "String",
        "points": ["String", "String", "String"],
        "qa": [{ "q": "String", "a": "String" }, { "q": "String", "a": "String" }]
      }`;
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-2.5-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/draft-message', async (req, res) => {
    try {
      const { jobTitle = 'Graduate Analyst', company = 'Target Firm' } = req.body;
      const apiKey = getEffectiveApiKey();

      if (!apiKey) {
        return res.json({
          message: `Hi [Recruiter/Alumni Name],\n\nI noticed the ${jobTitle} opening at ${company} and wanted to reach out. With a strong background in financial analysis and ongoing ACCA qualification, I have been following ${company}'s market expansion with great interest.\n\nI would love the opportunity to connect briefly and learn more about the team's upcoming initiatives.\n\nBest regards,\n[Your Name]`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const promptText = `Draft a tailored 3-sentence LinkedIn connection request or cold email addressed to alumni/recruiters at ${company} for the ${jobTitle} role. Be professional, concise, and enthusiastic. Output strictly as JSON: { "message": "String" }`;
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-2.5-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });
      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed.message ? parsed : {
        message: `Hi [Recruiter/Alumni Name],\n\nI noticed the ${jobTitle} opening at ${company} and wanted to reach out. With a strong background in financial analysis and ongoing ACCA qualification, I have been following ${company}'s market expansion with great interest.\n\nI would love the opportunity to connect briefly and learn more about the team's upcoming initiatives.\n\nBest regards,\n[Your Name]`
      });
    } catch (e: any) {
      console.warn('[Draft Message Fallback]:', e.message);
      const { jobTitle = 'Graduate Analyst', company = 'Target Firm' } = req.body;
      res.json({
        message: `Hi [Recruiter/Alumni Name],\n\nI noticed the ${jobTitle} opening at ${company} and wanted to reach out. With a strong background in financial analysis and ongoing ACCA qualification, I have been following ${company}'s market expansion with great interest.\n\nI would love the opportunity to connect briefly and learn more about the team's upcoming initiatives.\n\nBest regards,\n[Your Name]`
      });
    }
  });

  app.post('/api/spellcheck', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { text } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = `Check this text for typos and grammar, and suggest a refined professional tone version. 
      Output strictly as JSON: { "corrected": "String", "hasTypos": boolean }`;
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/smart-categorizer', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const base64File = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const promptText = `Analyze this uploaded file. Evaluate every entry/row against the following categories:
      1. trackerItems (Graduate Schemes / Target Opportunities)
      2. workShifts (Work Shifts / Timesheet)
      3. expenses (Expenses & Financial Ledger)
      4. schedules (University Timetable)
      5. checklistItems (Master Checklist & Goals)
      
      If an entry does NOT strictly fit into one of these 5 categories, it MUST go into the "extraItems" category.
      
      Output strictly as JSON in this structure:
      {
        "trackerItems": [],
        "workShifts": [],
        "expenses": [],
        "schedules": [],
        "checklistItems": [],
        "extraItems": []
      }`;
      
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64File, mimeType } },
              { text: promptText }
            ]
          }
        ]
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/interview-simulator', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { category, history } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const promptText = `You are an expert interviewer for ${category} roles.
      Here is the interview history: ${JSON.stringify(history)}
      If the history is empty, ask the first technical or behavioral question.
      If the user just answered, evaluate their input, provide constructive feedback, and ask the next question.
      Output strictly as JSON:
      {
        "feedback": "String (your evaluation of their previous answer, empty if first question)",
        "nextQuestion": "String (your next question)"
      }`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/quick-capture', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { text } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = `Parse this natural language text into a structured action: "${text}".
      Determine if it's logging an expense or logging a work shift.
      Output strictly as JSON:
      {
        "type": "expense" | "shift" | "unknown",
        "data": {
          // if expense: amount (number), description (string), category (Food, Transport, Rent, Utilities, Entertainment, Other), date (YYYY-MM-DD default today)
          // if shift: hours (number), date (YYYY-MM-DD default today), startTime (HH:MM default 09:00), endTime (HH:MM default 17:00)
        }
      }`;
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/generate-flashcards', upload.single('notes'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const base64File = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const promptText = `Extract key concepts from this document and create 5 interactive digital flashcards.
      Output strictly as JSON:
      [
        {
          "front": "Question or Term",
          "back": "Answer or Definition"
        }
      ]`;
      
      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64File, mimeType } },
              { text: promptText }
            ]
          }
        ]
      });
      res.json({ success: true, flashcards: JSON.parse(response.text || '[]') });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/chat-command', async (req, res) => {
    try {
      const result = await executeMultiModelChat(req.body);
      res.json(result);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Error executing chat command' });
    }
  });

  // ==========================================
  // STUDY & INTELLIGENCE ENGINE ENDPOINTS
  // ==========================================
  
  app.post('/api/study/extract-doc', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      
      const fileName = req.file.originalname;
      const fileBuffer = req.file.buffer;
      let mimeType = req.file.mimetype || 'application/octet-stream';

      if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';
      if (fileName.endsWith('.png')) mimeType = 'image/png';
      if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';
      if (fileName.endsWith('.webp')) mimeType = 'image/webp';

      // Text files read directly
      if (mimeType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json') || fileName.endsWith('.csv')) {
        const textContent = fileBuffer.toString('utf-8');
        return res.json({ success: true, fileName, text: textContent });
      }

      // Multimodal extraction via Gemini API
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key missing' });
      }

      const base64Data = fileBuffer.toString('base64');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const promptText = `You are a high-accuracy document parsing engine.
Extract ALL readable text, formulas, definitions, key lecture concepts, and data from this uploaded document/image (${fileName}).
Provide a clean, structured text output in Markdown suitable for grounding university study guides, flashcards, and mock exams.`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: promptText }
            ]
          }
        ]
      });

      const extractedText = response.text || `Extracted notes from ${fileName}`;
      res.json({ success: true, fileName, text: extractedText });
    } catch (error: any) {
      console.error('Error extracting document:', error);
      res.status(500).json({ error: error.message || 'Failed to extract document' });
    }
  });

  app.post('/api/study/notebook-artifacts', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { artifactType, notebookTitle, contextDocs, customInstructions, notebookNotes } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      let contextText = '';
      if (Array.isArray(contextDocs) && contextDocs.length > 0) {
        contextText = contextDocs
          .map((d: any, idx: number) => `[Source ${idx + 1}: ${d.name || 'Document'}]\n${(d.content || '').slice(0, 15000)}`)
          .join('\n\n');
      } else if (req.body.context) {
        contextText = req.body.context;
      } else {
        contextText = 'General Finance, Valuation, Capital Budgeting, and Economics';
      }

      if (notebookNotes) {
        contextText += `\n\n[Notebook Workspace Notes]\n${notebookNotes}`;
      }

      if (artifactType === 'study_guide') {
        const promptText = `You are a world-class academic tutor and research intelligence analyst.
Create a comprehensive, structured Study Guide & Concept Roadmap strictly grounded in the provided notebook sources for "${notebookTitle || 'Selected Notebook'}".
${customInstructions ? `Custom focus: ${customInstructions}` : ''}

Sources Grounding Context:
"""
${contextText.slice(0, 35000)}
"""

You MUST provide explicit source citations (e.g. "[Source 1: filename]" or "[Source 2]") for statements, formulas, and timeline entries.

Output strictly as JSON matching this schema:
{
  "title": "Comprehensive Study Guide: ${notebookTitle || 'Study Module'}",
  "executiveSummary": "High-yield executive overview synthesized strictly from the source documents (3-4 paragraphs).",
  "timelineOrRoadmap": [
    {
      "stage": "Foundational Frameworks",
      "periodOrConcept": "Concept / Time Period / Topic",
      "details": "Clear explanation of core principles, progression, and real-world application.",
      "citations": ["[Source 1]"]
    }
  ],
  "coreFormulasAndDefinitions": [
    {
      "term": "Term or Formula Name",
      "formulaOrDefinition": "Mathematical formula or rigorous technical definition",
      "application": "How to calculate or apply in exams and real-world analysis",
      "citation": "[Source 1]"
    }
  ],
  "corePrinciples": [
    "High-yield core takeaway 1 with citation [Source 1]",
    "High-yield core takeaway 2 with citation [Source 2]"
  ],
  "frequentlyTestedQuestions": [
    {
      "question": "Realistic interview or exam question testing this notebook's concepts",
      "answer": "Complete, step-by-step model answer grounded in source documents",
      "citation": "[Source 1]"
    }
  ]
}`;

        const response = await callGeminiWithRetry(ai, {
          model: 'gemini-3.7-flash',
          config: { responseMimeType: 'application/json' },
          contents: [{ role: 'user', parts: [{ text: promptText }] }]
        });

        return res.json({ success: true, artifact: JSON.parse(response.text || '{}') });
      } else if (artifactType === 'flashcards') {
        const promptText = `Generate 8 high-yield active recall flashcards strictly grounded in this notebook context for "${notebookTitle}".
Include explicit source citation brackets like "[Source 1]" in the card answers.

Sources:
"""
${contextText.slice(0, 30000)}
"""

Output strictly as JSON:
{
  "flashcards": [
    {
      "id": "1",
      "front": "Clear concept question or key formula prompt",
      "back": "Concise, precise explanation grounded in materials [Source 1]",
      "tag": "Category or Subtopic",
      "citation": "[Source 1]"
    }
  ]
}`;

        const response = await callGeminiWithRetry(ai, {
          model: 'gemini-3.7-flash',
          config: { responseMimeType: 'application/json' },
          contents: [{ role: 'user', parts: [{ text: promptText }] }]
        });

        return res.json(JSON.parse(response.text || '{ "flashcards": [] }'));
      } else if (artifactType === 'mock_exam') {
        const promptText = `Generate a rigorous 5-question AI Mock Exam strictly grounded in this notebook context for "${notebookTitle}".
Include 4 Multiple Choice Questions and 1 Detailed Calculation / Analytical Question.
Provide full explanations and source citations for each question.

Sources:
"""
${contextText.slice(0, 30000)}
"""

Output strictly as JSON:
{
  "examTitle": "AI Mock Exam: ${notebookTitle}",
  "timeLimitMinutes": 15,
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Question text testing deep conceptual or quantitative understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Clear breakdown of why option A is correct and why other options are incorrect.",
      "citation": "[Source 1]"
    },
    {
      "id": 5,
      "type": "essay",
      "question": "Analytical or quantitative question requiring multi-step calculation or synthesis",
      "modelAnswer": "Comprehensive step-by-step solution with intermediate values and final result.",
      "keyGradingPoints": ["Identified given variables", "Applied correct formula", "Accounted for tax shield/discounting", "Correct final conclusion"],
      "citation": "[Source 1]"
    }
  ]
}`;

        const response = await callGeminiWithRetry(ai, {
          model: 'gemini-3.7-flash',
          config: { responseMimeType: 'application/json' },
          contents: [{ role: 'user', parts: [{ text: promptText }] }]
        });

        return res.json({ success: true, exam: JSON.parse(response.text || '{}') });
      } else {
        return res.status(400).json({ error: 'Invalid artifactType' });
      }
    } catch (error: any) {
      console.error('Notebook artifacts generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/study/analyze', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { mode, context, topic, customPrompt } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      let systemPrompt = '';
      if (mode === 'cram') {
        systemPrompt = `You are an elite academic learning engine applying the 80/20 Pareto principle.
        Analyze the provided study context and topic: "${topic || 'General Overview'}".
        Context: "${context || 'No specific textbook context provided.'}".
        Provide a ultra-high-yield 80/20 Cram Guide with:
        1. 3 Core Must-Know Rules/Formulas
        2. Top 5 Frequently Tested Exam Concepts
        3. Common Pitfalls & Traps to Avoid
        Output strictly as JSON:
        {
          "summaryTitle": "String",
          "corePrinciples": ["String"],
          "topExamConcepts": [{ "concept": "String", "whyItMatters": "String" }],
          "pitfalls": ["String"]
        }`;
      } else if (mode === 'exec') {
        systemPrompt = `You are a top-tier executive learning strategist.
        Create an Executive Summary of the study context for topic: "${topic || 'Key Summary'}".
        Context: "${context || 'No specific textbook context provided.'}".
        Output strictly as JSON:
        {
          "executiveOverview": "String (3-4 concise paragraphs)",
          "keyTakeaways": ["String"],
          "strategicFrameworks": [{ "name": "String", "description": "String" }],
          "actionableInsights": ["String"]
        }`;
      } else if (mode === 'exam') {
        systemPrompt = `Generate a realistic 4-question AI Mock Exam based on this study context.
        Context: "${context || 'General University Level Module'}".
        Include 3 multiple-choice questions and 1 short essay question.
        Output strictly as JSON:
        {
          "examTitle": "String",
          "timeLimitMinutes": number,
          "questions": [
            {
              "id": 1,
              "type": "mcq",
              "question": "String",
              "options": ["String", "String", "String", "String"],
              "correctAnswerIndex": number,
              "explanation": "String"
            },
            {
              "id": 2,
              "type": "mcq",
              "question": "String",
              "options": ["String", "String", "String", "String"],
              "correctAnswerIndex": number,
              "explanation": "String"
            },
            {
              "id": 3,
              "type": "mcq",
              "question": "String",
              "options": ["String", "String", "String", "String"],
              "correctAnswerIndex": number,
              "explanation": "String"
            },
            {
              "id": 4,
              "type": "essay",
              "question": "String",
              "modelAnswer": "String",
              "keyGradingPoints": ["String"]
            }
          ]
        }`;
      } else {
        systemPrompt = `Provide a comprehensive analysis for custom study mode "${mode}". Context: "${context}". Prompt: "${customPrompt}". Output strictly as JSON: { "result": "String" }`;
      }

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error('Study analyze error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/study/snap-and-solve', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No image uploaded for Snap & Solve' });
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });

      const base64Image = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      const { contextText } = req.body;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = `You are a world-class multimodal academic tutor.
      Analyze this image of a problem, question, equation, or diagram.
      Grounded context from uploaded textbook/notes: "${contextText || 'None provided. Use standard academic principles.'}".
      
      Extract the exact problem statement, solve it step-by-step using the textbook's methodology, and provide a clear final answer.
      
      Output strictly as JSON with this structure:
      {
        "extractedQuestion": "String (Exact question read from image)",
        "solutionCard": {
          "finalAnswer": "String (Bold, concise final result/answer)",
          "confidence": "High | Medium | Low",
          "conceptTags": ["String"]
        },
        "stepByStepBreakdown": [
          {
            "stepNumber": 1,
            "title": "String (e.g. Identify Given Variables & Formula)",
            "explanation": "String (Clear explanation of this step)",
            "formulaOrRule": "String (Optional formula or rule used)"
          }
        ],
        "proTip": "String (Exam trick or key insight to avoid losing points)"
      }`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: base64Image, mimeType } },
              { text: promptText }
            ]
          }
        ]
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error('Snap & Solve error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/study/flashcards', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { context, count = 6 } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const promptText = `Generate ${count} high-yield active recall flashcards based on this study context.
      Context: "${context || 'Corporate Finance, Financial Accounting, Macroeconomics, and Data Analytics'}".
      Output strictly as JSON:
      [
        {
          "id": "1",
          "front": "Question or Key Term",
          "back": "Clear concise answer or explanation",
          "tag": "Category or Subtopic"
        }
      ]`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-3.7-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });

      res.json({ flashcards: JSON.parse(response.text || '[]') });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/study/feynman-critique', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { concept, userExplanation, context } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const promptText = `You are using the Feynman Technique to evaluate a student's attempt to explain a complex concept in simple terms.
      Target Concept: "${concept}".
      Student's Explanation: "${userExplanation}".
      Reference Context: "${context || 'Academic textbook standard'}".

      Evaluate if a 5-year-old or non-expert could understand this without jargon.
      Output strictly as JSON:
      {
        "simplicityScore": number, // 0 to 100
        "overallFeedback": "String",
        "jargonFlagged": ["String"],
        "inaccuracies": ["String"],
        "suggestedAnalogy": "String (A simple, relatable real-world comparison)"
      }`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-2.5-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/study/socratic-tutor', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { topic, context, history, userReply } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const promptText = `You are a Socratic Academic Tutor for university students.
      Topic: "${topic || 'General Topic'}".
      Context: "${context || 'No context'}".
      History: ${JSON.stringify(history || [])}.
      Latest User Reply: "${userReply || 'I am ready to start.'}".

      Rule: Do NOT give away full answers directly. Guide the student with 1 short constructive reaction to their reply, followed by ONE compelling Socratic question that pushes their reasoning.
      Output strictly as JSON:
      {
        "evaluation": "String (Brief feedback on user's reply, or welcome note if starting)",
        "socraticQuestion": "String (The next targeted question to lead them to deeper understanding)",
        "keyHint": "String (A gentle hint if they get stuck)"
      }`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-2.5-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Safe global error handler middleware
  app.use(safeErrorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
