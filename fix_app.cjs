const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  "</AnimatePresence>\n        </main>",
  "</AnimatePresence>\n        </div>\n        </main>"
);
fs.writeFileSync('src/App.tsx', code);
