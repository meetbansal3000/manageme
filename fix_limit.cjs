const fs = require('fs');
let fin = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

fin = fin.replace(
  "const visaLimit = isTermTime ? 20 : 999;",
  "const limit = userData.visaLimit !== undefined ? userData.visaLimit : 20;\n  const visaLimit = isTermTime ? limit : 999;"
);
// Also fix visaUsagePercent logic
fin = fin.replace(
  "const visaUsagePercent = Math.min(100, (last7DaysHours / (isTermTime ? 20 : 40)) * 100);",
  "const visaUsagePercent = Math.min(100, (last7DaysHours / (isTermTime ? limit : 40)) * 100);"
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', fin);
