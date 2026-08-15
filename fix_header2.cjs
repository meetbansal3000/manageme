const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

// import Currency
content = content.replace(
  "import { Menu, X, Cloud, Settings, FileSpreadsheet, Upload, User } from 'lucide-react';",
  "import { Menu, X, Cloud, Settings, FileSpreadsheet, Upload, User, PoundSterling, DollarSign, IndianRupee } from 'lucide-react';\nimport { Currency } from '../types';"
);

// cycleCurrency
const cycleStr = `
  const cycleCurrency = () => {
    const cur = userData.currency || 'GBP';
    const next = cur === 'GBP' ? 'USD' : cur === 'USD' ? 'INR' : 'GBP';
    updateData({ currency: next });
  };
`;

content = content.replace(
  'const handleLogout = async () => {',
  cycleStr + '\n  const handleLogout = async () => {'
);

const currencyButtonStr = `
              <button
                onClick={cycleCurrency}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[rgba(255,255,255,0.08)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.15)] transition-colors"
                title="Toggle Currency"
              >
                {userData.currency === 'USD' ? <DollarSign className="w-3.5 h-3.5" /> : userData.currency === 'INR' ? <IndianRupee className="w-3.5 h-3.5" /> : <PoundSterling className="w-3.5 h-3.5" />}
                {userData.currency || 'GBP'}
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
`;

content = content.replace(
  '<button\n                onClick={() => fileInputRef.current?.click()}',
  currencyButtonStr
);

fs.writeFileSync('src/components/Header.tsx', content);
console.log("Updated Header.tsx with Currency Toggle!");
