const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
  app.post('/api/analyze-week', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const { classes, shifts, deadlines, visaRemaining } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptText = \`Act as an academic and career advisor for an international student.
      They have \${visaRemaining} hours left on their Tier 4 visa this week.
      Active classes: \${JSON.stringify(classes)}
      Work shifts: \${JSON.stringify(shifts)}
      Upcoming deadlines: \${JSON.stringify(deadlines)}
      Provide a concise 3-step strategy optimizing work shifts around classes while respecting the 20-hour visa cap and deadlines. Output strictly as JSON:
      {
        "strategy": ["step 1", "step 2", "step 3"]
      }\`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
      const promptText = \`Generate 3 high-impact, tailored resume bullet points matching these skills: \${JSON.stringify(skills)} to the target firm: \${firm} for the role: \${role}.
      Output strictly as JSON:
      {
        "bullets": ["bullet 1", "bullet 2", "bullet 3"]
      }\`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: { responseMimeType: 'application/json' },
        contents: [{ role: 'user', parts: [{ text: promptText }] }]
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
      
      const promptText = \`Extract merchant name, date (YYYY-MM-DD), amount (number), and suggest a category (Food, Transport, Rent, Utilities, Entertainment, Other) from this receipt.
      Output strictly as JSON:
      {
        "merchant": "String",
        "date": "YYYY-MM-DD",
        "amount": number,
        "category": "String"
      }\`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
      
      const promptText = \`You are an expert interviewer for \${category} roles.
      Here is the interview history: \${JSON.stringify(history)}
      If the history is empty, ask the first technical or behavioral question.
      If the user just answered, evaluate their input, provide constructive feedback, and ask the next question.
      Output strictly as JSON:
      {
        "feedback": "String (your evaluation of their previous answer, empty if first question)",
        "nextQuestion": "String (your next question)"
      }\`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
      const promptText = \`Parse this natural language text into a structured action: "\${text}".
      Determine if it's logging an expense or logging a work shift.
      Output strictly as JSON:
      {
        "type": "expense" | "shift" | "unknown",
        "data": {
          // if expense: amount (number), description (string), category (Food, Transport, Rent, Utilities, Entertainment, Other), date (YYYY-MM-DD default today)
          // if shift: hours (number), date (YYYY-MM-DD default today), startTime (HH:MM default 09:00), endTime (HH:MM default 17:00)
        }
      }\`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
      
      const promptText = \`Extract key concepts from this document and create 5 interactive digital flashcards.
      Output strictly as JSON:
      [
        {
          "front": "Question or Term",
          "back": "Answer or Definition"
        }
      ]\`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
`;

content = content.replace(
  "// Vite middleware for development",
  newRoutes + "\n  // Vite middleware for development"
);

fs.writeFileSync('server.ts', content);
console.log("Updated server.ts with AI routes");
