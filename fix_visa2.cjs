const fs = require('fs');
let fin = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

fin = fin.replace("Warning: Approaching ${limit}-hour limit", "Warning: Approaching {limit}-hour limit");
fin = fin.replace("more than 20 hours", "more than {limit} hours");

fs.writeFileSync('src/components/FinanceHubTab.tsx', fin);
