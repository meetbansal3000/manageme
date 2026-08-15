const fs = require('fs');
let content = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

// import formatCurrency
if (!content.includes('formatCurrency')) {
  content = content.replace(
    "import { CreditCard, PoundSterling, TrendingUp, AlertTriangle, FileText, Upload, Plus, Trash2 } from 'lucide-react';",
    "import { CreditCard, PoundSterling, TrendingUp, AlertTriangle, FileText, Upload, Plus, Trash2 } from 'lucide-react';\nimport { formatCurrency } from '../utils/currencyUtils';"
  );
}

// Replaces
content = content.replace(
  /<span>£<\/span>/g,
  "<span>{userData.currency === 'USD' ? '$' : userData.currency === 'INR' ? '₹' : '£'}</span>"
);

content = content.replace(
  /<span className="text-sm font-bold text-blue-400">\+£\{\(shift\.hours \* userData\.hourlyRate\)\.toFixed\(2\)\}<\/span>/g,
  '<span className="text-sm font-bold text-blue-400">+{formatCurrency(shift.hours * userData.hourlyRate, userData.currency)}</span>'
);

content = content.replace(
  /<p className="text-2xl font-bold mt-1 text-\[var\(--text-primary\)\]">£\{totalEarned\.toFixed\(2\)\}<\/p>/g,
  '<p className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{formatCurrency(totalEarned, userData.currency)}</p>'
);

content = content.replace(
  /£\{netSavings\.toFixed\(2\)\}/g,
  '{formatCurrency(netSavings, userData.currency)}'
);

content = content.replace(
  /placeholder="£ Amount"/g,
  'placeholder="Amount"'
);

content = content.replace(
  /<span className="text-sm font-bold text-\[var\(--text-primary\)\]">-£\{exp\.amount\.toFixed\(2\)\}<\/span>/g,
  '<span className="text-sm font-bold text-[var(--text-primary)]">-{formatCurrency(exp.amount, userData.currency)}</span>'
);

content = content.replace(
  /placeholder="Balance £"/g,
  'placeholder="Balance"'
);

content = content.replace(
  /<p className="font-bold text-sm">£\{remaining\.toFixed\(2\)\}<\/p>/g,
  '<p className="font-bold text-sm">{formatCurrency(remaining, userData.currency)}</p>'
);

content = content.replace(
  /const amt = prompt\('Enter payment amount: £'\);/g,
  "const amt = prompt('Enter payment amount:');"
);

content = content.replace(
  /<span className="absolute left-2 top-1\/2 -translate-y-1\/2 text-xs text-\[var\(--text-secondary\)\]">£<\/span>/g,
  '<span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)]">{userData.currency === \'USD\' ? \'$\' : userData.currency === \'INR\' ? \'₹\' : \'£\'}</span>'
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', content);
console.log("Updated FinanceHubTab.tsx currencies!");
