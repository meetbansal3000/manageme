const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const dockCss = `
  .apple-dock {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(0, 0, 0, 0.12);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  }
  
  .dark .apple-dock {
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
`;

css = css.replace('.glass-panel {', dockCss + '\n  .glass-panel {');
fs.writeFileSync('src/index.css', css);

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
appTsx = appTsx.replace(/className="glass-panel px-4 py-2 rounded-full border border-\[var\(--border\)\] shadow-2xl flex items-center gap-4"/g, 'className="apple-dock px-4 py-2 rounded-full flex items-center gap-4"');

// also replace bg-[rgba(255,255,255,0.05)] with something that adapts to light/dark
// in dark mode it is bg-white/5, in light mode it should probably be bg-black/5
appTsx = appTsx.replace(/bg-\[rgba\(255,255,255,0\.05\)\]/g, 'bg-black/5 dark:bg-white/5');

// also the divider `<div className="w-[1px] h-6 bg-[rgba(255,255,255,0.1)] mx-1"></div>`
appTsx = appTsx.replace(/bg-\[rgba\(255,255,255,0\.1\)\]/g, 'bg-black/10 dark:bg-white/10');

fs.writeFileSync('src/App.tsx', appTsx);
