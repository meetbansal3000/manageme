const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoints = `
  app.post('/api/generate-news-context', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { title, source } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = \`Act as an investment banking analyst. I have this news article: "\${title}" from \${source}.
      Generate:
      1. Executive Context Summary (3-4 sentences).
      2. Important Points to Remember (key metrics, valuations, strategic rationale - 3 bullets).
      3. Interview Prep Q&A (2 sample IB/AM assessment center questions with model bullet-point answers).
      Output strictly as JSON:
      {
        "context": "String",
        "points": ["String", "String", "String"],
        "qa": [{ "q": "String", "a": "String" }, { "q": "String", "a": "String" }]
      }\`;
      const response = await ai.models.generateContent({
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
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { jobTitle, company } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = \`Draft a tailored 3-sentence LinkedIn connection request or cold email addressed to alumni/recruiters at \${company} for the \${jobTitle} role. Be professional, concise, and enthusiastic. Output strictly as JSON: { "message": "String" }\`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
      const promptText = \`Check this text for typos and grammar, and suggest a refined professional tone version. 
      Output strictly as JSON: { "corrected": "String", "hasTypos": boolean }\`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
`;

code = code.replace("  app.post('/api/smart-categorizer'", newEndpoints + "\n  app.post('/api/smart-categorizer'");
fs.writeFileSync('server.ts', code);
