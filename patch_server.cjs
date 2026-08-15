const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newRoute = `
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
      
      const promptText = \`Parse this timetable image/document and return strictly valid JSON matching this structure:
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
      ]\`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
`;

content = content.replace(
  "// Vite middleware for development",
  newRoute + "\n  // Vite middleware for development"
);

fs.writeFileSync('server.ts', content);
console.log("Updated server.ts with /api/upload-timetable");
