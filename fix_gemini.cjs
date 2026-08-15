const fs = require('fs');
let content = fs.readFileSync('src/components/GeminiDrawer.tsx', 'utf8');

const targetStr = `<button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 p-4 rounded-full bg-[var(--accent)] text-white shadow-2xl hover:scale-105 transition-transform flex items-center justify-center"
          title="Open AI Assistant"
        >
          <Sparkles className="w-6 h-6" />
        </button>`;

const replacementStr = `<button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-[40] p-4 rounded-full bg-[var(--accent)] text-white shadow-2xl hover:scale-105 transition-transform flex items-center justify-center group"
        >
          <Sparkles className="w-6 h-6" />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-[#1a1a1a] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-[rgba(255,255,255,0.1)]">
            Open AI Assistant
          </span>
        </button>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/GeminiDrawer.tsx', content);
