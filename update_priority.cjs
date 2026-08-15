const fs = require('fs');
let content = fs.readFileSync('src/components/PriorityTrackerTab.tsx', 'utf8');

content = content.replace("import { \n  Plus,", "import { \n  Plus,\n  X,");
content = content.replace("  const [tempNotes, setTempNotes] = useState<string>('');", "  const [tempNotes, setTempNotes] = useState<string>('');\n  const [isVisible, setIsVisible] = useState(true);\n  if (!isVisible) return null;");

content = content.replace('<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">',
`<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full transition-colors z-10 hidden sm:block"><X className="w-5 h-5" /></button>`);

fs.writeFileSync('src/components/PriorityTrackerTab.tsx', content);
