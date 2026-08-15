const fs = require('fs');
let content = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

content = content.replace(
  /<span>\{userData\.currency === 'USD' \? '\n/g,
  "<span>{userData.currency === 'USD' ? '$' : userData.currency === 'INR' ? '₹' : '£'}</span>\n"
);

content = content.replace(
  /<span className="absolute left-2 top-1\/2 -translate-y-1\/2 text-xs text-\[var\(--text-secondary\)\]">\{userData\.currency === 'USD' \? '\n/g,
  '<span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">{userData.currency === \'USD\' ? \'$\' : userData.currency === \'INR\' ? \'₹\' : \'£\'}</span>\n'
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', content);
