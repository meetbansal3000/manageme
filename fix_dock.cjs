const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<button onClick={() => setQuickLog('quick')} className="flex flex-col items-center gap-1 group text-[var(--text-secondary)] hover:text-indigo-400 transition-colors" title="AI Quick Log">
            <div className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] group-hover:bg-indigo-500/20 transition-colors">
              <Bot className="w-5 h-5" />
            </div>
          </button>`;

const replaceStr = `<button onClick={() => document.getElementById('geminiAssistantBtn')?.click()} className="flex flex-col items-center gap-1 group text-[var(--text-secondary)] hover:text-indigo-400 transition-colors" title="Ask Gemini AI (Ctrl+J)">
            <div className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] group-hover:bg-indigo-500/20 transition-colors">
              <Bot className="w-5 h-5" />
            </div>
          </button>`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/App.tsx', content);
