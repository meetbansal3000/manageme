const fs = require('fs');

let code = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

code = code.replace(
  "import { Expense, Currency } from '../types';",
  "import { Expense, Currency } from '../types';\nimport { AddToCalendar } from './AddToCalendar';"
);

code = code.replace(
  "<span className=\"font-bold\">£49.99</span>",
  "<span className=\"font-bold\">£49.99</span>\n                <AddToCalendar title=\"Adobe Creative Cloud Renewal\" startDate={new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0]} />"
);

// We also need it for vehicle insurance renewal
code = code.replace(
  "<span className=\"font-bold\">£850.00</span>",
  "<span className=\"font-bold\">£850.00</span>\n                <AddToCalendar title=\"Car Insurance Renewal\" startDate={new Date(Date.now() + 45*24*60*60*1000).toISOString().split('T')[0]} />"
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', code);
