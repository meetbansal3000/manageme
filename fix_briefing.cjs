const fs = require('fs');
let content = fs.readFileSync('src/components/MorningBriefing.tsx', 'utf8');

content = content.replace(
  /className="glass-panel border border-\[var\(--border\)\] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"/,
  'className="glass-panel border border-[var(--border)] rounded-2xl p-4 flex flex-row justify-between items-center w-full gap-4 flex-wrap md:flex-nowrap mt-4"'
);

fs.writeFileSync('src/components/MorningBriefing.tsx', content);
