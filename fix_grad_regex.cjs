const fs = require('fs');
let content = fs.readFileSync('src/components/GraduateSchemesTab.tsx', 'utf8');

const regex = /const q = searchQuery\.toLowerCase\(\);[\s\S]*?return \(/;
content = content.replace(regex, 'const q = searchQuery.toLowerCase();\n    return (');

fs.writeFileSync('src/components/GraduateSchemesTab.tsx', content);
