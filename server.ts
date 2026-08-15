import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { GoogleGenAI, Type, ThinkingLevel, Modality } from '@google/genai';
import { getProvidersStatus, executeMultiModelChat } from './server/aiService';

const upload = multer({ storage: multer.memoryStorage() });

async function callGeminiWithRetry(ai: any, params: any, retries = 3): Promise<any> {
  const primaryModel = params.model || 'gemini-2.5-flash';
  const modelCandidates = [primaryModel, 'gemini-1.5-flash', 'gemini-2.0-flash'];
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
  const app = express();
  const PORT = 3000;
  
  app.use(express.json({ limit: '20mb' }));

  // In-memory media store for chat attachments (ephemeral, for prototyping)
  const mediaStore = new Map<string, { buffer: Buffer, mimetype: string }>();

  // API Routes
  app.get('/api/ai/providers', (req, res) => {
    try {
      const providers = getProvidersStatus();
      res.json({ success: true, providers });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const result = await executeMultiModelChat(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('Multi-model AI Chat Error:', error);
      res.status(500).json({ error: error.message || 'Error processing AI chat request' });
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
        model: 'gemini-3.7-flash',
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
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { jobTitle, company } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = `Draft a tailored 3-sentence LinkedIn connection request or cold email addressed to alumni/recruiters at ${company} for the ${jobTitle} role. Be professional, concise, and enthusiastic. Output strictly as JSON: { "message": "String" }`;
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
        model: 'gemini-3.7-flash',
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
        model: 'gemini-3.7-flash',
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
