const fs = require('fs');
let code = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

code = code.replace("import { \n  Clock,", "import { \n  ArrowRightLeft, Share2, Users,\n  Clock,");

fs.writeFileSync('src/components/FinanceHubTab.tsx', code);
