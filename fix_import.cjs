const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace("import { GoogleGenAI } from '@google/genai';", "import { GoogleGenAI, Type } from '@google/genai';");
server = server.replace("const { GoogleGenAI, Type } = require('@google/genai');", "");

fs.writeFileSync('server.ts', server);
