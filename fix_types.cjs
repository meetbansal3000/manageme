const fs = require('fs');
let types = fs.readFileSync('src/types.ts', 'utf8');

types = types.replace("export interface Expense {\\n  splitWith?: string;\\n  splitType?: 'equal' | 'custom';\\n  owedToMe?: number;\\n  iOwe?: number;\\n  settled?: boolean;", 
`export interface Expense {
  splitWith?: string;
  splitType?: 'equal' | 'custom';
  owedToMe?: number;
  iOwe?: number;
  settled?: boolean;`);

fs.writeFileSync('src/types.ts', types);
