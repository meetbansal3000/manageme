const fs = require('fs');
let content = fs.readFileSync('src/components/CompactToolbar.tsx', 'utf8');

// Add X to imports
content = content.replace("import { Search,", "import { Search, X,");
content = content.replace("import React from 'react';", "import React, { useState } from 'react';");

// Add state and X button
content = content.replace("export const CompactToolbar: React.FC<CompactToolbarProps> = ({", `export const CompactToolbar: React.FC<CompactToolbarProps> = ({`);
content = content.replace("  const oppsCount =", "  const [isVisible, setIsVisible] = useState(true);\n  if (!isVisible) return null;\n\n  const oppsCount =");

// Add button to HTML. Let's find the closing of the glass panel.
content = content.replace('<div className="glass-panel border border-[var(--border)] rounded-full px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-4">',
`<div className="glass-panel border border-[var(--border)] rounded-full px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-4 relative pr-10">
        <button onClick={() => setIsVisible(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(128,128,128,0.1)] rounded-full transition-colors"><X className="w-4 h-4" /></button>`);

fs.writeFileSync('src/components/CompactToolbar.tsx', content);
