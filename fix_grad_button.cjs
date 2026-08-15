const fs = require('fs');
let grad = fs.readFileSync('src/components/GraduateSchemesTab.tsx', 'utf8');

grad = grad.replace(
  /<h2 className="apple-headline[^>]*>\s*Graduate Schemes \([^)]*\)\s*<\/h2>\s*<\/div>/,
  `$&
  <div className="flex items-center self-start mt-4 lg:mt-0">
    <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
      <Share2 className="w-4 h-4" /> Share List
    </button>
  </div>`
);

fs.writeFileSync('src/components/GraduateSchemesTab.tsx', grad);
