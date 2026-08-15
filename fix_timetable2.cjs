const fs = require('fs');
let content = fs.readFileSync('src/components/UniTimetableTab.tsx', 'utf8');

content = content.replace(
  "{activeSubTab === 'schedule' ? (",
  "{activeSubTab === 'schedule' ? (\n        <>"
);

content = content.replace(
  ") : (",
  "        </>\n      ) : ("
);

fs.writeFileSync('src/components/UniTimetableTab.tsx', content);
