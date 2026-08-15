const fs = require('fs');
let content = fs.readFileSync('src/hooks/useFirestoreData.ts', 'utf8');

// Update imports
content = content.replace(
  'UniClass, TermStatus } from \'../types\';',
  'UniClass, TermStatus, Currency, GradeEntry } from \'../types\';'
);

// Update interface
content = content.replace(
  '  termStatus: TermStatus;\n}',
  '  termStatus: TermStatus;\n  currency?: Currency;\n  gradeEntries?: GradeEntry[];\n}'
);

// Update DEFAULT_DATA
content = content.replace(
  '  termStatus: \'Term Time\'\n};',
  '  termStatus: \'Term Time\',\n  currency: \'GBP\',\n  gradeEntries: []\n};'
);

// Update setData block
content = content.replace(
  '              termStatus: fbData.termStatus || DEFAULT_DATA.termStatus\n            });',
  '              termStatus: fbData.termStatus || DEFAULT_DATA.termStatus,\n              currency: fbData.currency || \'GBP\',\n              gradeEntries: fbData.gradeEntries || []\n            });'
);

fs.writeFileSync('src/hooks/useFirestoreData.ts', content);
console.log("Updated useFirestoreData.ts!");
