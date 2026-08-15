const fs = require('fs');
let content = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

content = content.replace(
  /<span>\{userData\.currency === 'USD' \? '            <input/g,
  "<span>{userData.currency === 'USD' ? '$' : userData.currency === 'INR' ? '₹' : '£'}</span>\n            <input"
);

content = content.replace(
  /<span className="absolute left-2 top-1\/2 -translate-y-1\/2 text-xs text-\[var\(--text-secondary\)\]">\{userData\.currency === 'USD' \? '                    <input/g,
  '<span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">{userData.currency === \'USD\' ? \'$\' : userData.currency === \'INR\' ? \'₹\' : \'£\'}</span>\n                    <input'
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', content);
