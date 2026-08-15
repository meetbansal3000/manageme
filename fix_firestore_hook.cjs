const fs = require('fs');
let content = fs.readFileSync('src/hooks/useFirestoreData.ts', 'utf8');

// Update imports
content = content.replace(
  'Invoice } from \'../types\';',
  'Invoice, UniClass, TermStatus } from \'../types\';'
);

// Update interface
content = content.replace(
  '  invoices: Invoice[];\n}',
  '  invoices: Invoice[];\n  uniClasses: UniClass[];\n  termStatus: TermStatus;\n}'
);

// Update DEFAULT_DATA
content = content.replace(
  '  invoices: []\n};',
  '  invoices: [],\n  uniClasses: [],\n  termStatus: \'Term Time\'\n};'
);

// Update setData block
content = content.replace(
  '              invoices: fbData.invoices || DEFAULT_DATA.invoices\n            });',
  '              invoices: fbData.invoices || DEFAULT_DATA.invoices,\n              uniClasses: fbData.uniClasses || DEFAULT_DATA.uniClasses,\n              termStatus: fbData.termStatus || DEFAULT_DATA.termStatus\n            });'
);

fs.writeFileSync('src/hooks/useFirestoreData.ts', content);
console.log("Updated useFirestoreData.ts!");
