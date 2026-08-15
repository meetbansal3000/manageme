const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  "if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });",
  `const apiKey = (req.headers.authorization || '').replace('Bearer ', '') || process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Gemini API Key missing' });`
);

server = server.replace(
  "const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY,",
  "const ai = new GoogleGenAI({ apiKey: apiKey,"
);

fs.writeFileSync('server.ts', server);
