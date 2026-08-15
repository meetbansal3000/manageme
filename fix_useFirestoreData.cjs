const fs = require('fs');

let code = fs.readFileSync('src/hooks/useFirestoreData.ts', 'utf8');

// Replace the explicit setData block with a spread
const oldSetDataBlockRegex = /setData\(\{\s*timeline: fbData\.timeline \|\| DEFAULT_DATA\.timeline,[\s\S]*?gradeEntries: fbData\.gradeEntries \|\| \[\]\s*\}\);/;

code = code.replace(oldSetDataBlockRegex, `setData({
              ...DEFAULT_DATA,
              ...fbData
            });`);

fs.writeFileSync('src/hooks/useFirestoreData.ts', code);
