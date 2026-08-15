const fs = require('fs');
let content = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');
content = content.replace(
  'const updated = userData.invoices.map(',
  'const updated = (userData.invoices || []).map('
);
fs.writeFileSync('src/components/FinanceHubTab.tsx', content);
