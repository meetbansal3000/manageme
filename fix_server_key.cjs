const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// Undo mistake in /api/analyze-week
server = server.replace(
  "const apiKey = (req.headers.authorization || '').replace('Bearer ', '') || process.env.GEMINI_API_KEY;\n      if (!apiKey) return res.status(500).json({ error: 'Gemini API Key missing' });",
  "if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });"
);

// Apply correctly to /api/chat-command
const chatCmdFind = `  app.post('/api/chat-command', async (req, res) => {
    try {
      const { message, trackerContext } = req.body;
      if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API Key missing' });`;

const chatCmdRepl = `  app.post('/api/chat-command', async (req, res) => {
    try {
      const { message, trackerContext } = req.body;
      const apiKey = (req.headers.authorization || '').replace('Bearer ', '') || process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Gemini API Key missing' });`;

server = server.replace(chatCmdFind, chatCmdRepl);

fs.writeFileSync('server.ts', server);
