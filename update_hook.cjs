const fs = require('fs');
let code = fs.readFileSync('src/hooks/useFirestoreData.ts', 'utf8');

// Add to import
code = code.replace(
  "import {",
  "import { PaperTradingData,"
);

// Add to UserTrackerData
code = code.replace(
  "gradeEntries: GradeEntry[];",
  "gradeEntries: GradeEntry[];\n  paperTrading?: PaperTradingData;"
);

// Add to DEFAULT_DATA
code = code.replace(
  "gradeEntries: [],",
  "gradeEntries: [],\n  paperTrading: {\n    cashBalance: 100000,\n    startingCapital: 100000,\n    positions: [],\n    tradeHistory: [],\n    academyProgress: {}\n  },"
);

fs.writeFileSync('src/hooks/useFirestoreData.ts', code);
