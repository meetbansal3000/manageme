const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
  app.post('/api/smart-categorizer', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });
      const base64File = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const promptText = \`Analyze this uploaded file. Evaluate every entry/row against the following categories:
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
`;

code = code.replace("  app.post('/api/interview-simulator'", newEndpoint + "\n  app.post('/api/interview-simulator'");

fs.writeFileSync('server.ts', code);
