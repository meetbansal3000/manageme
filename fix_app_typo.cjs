const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "useState<'timeline' | 'grad' | 'parttime' | 'priority' | 'notes' | 'skills' | 'finance' | 'uni'>(('timeline');",
  "useState<'timeline' | 'grad' | 'parttime' | 'priority' | 'notes' | 'skills' | 'finance' | 'uni'>('timeline');"
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed App.tsx typo!");
