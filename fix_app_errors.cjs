const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "updateData({ graduateSchemes: userData.graduateSchemes.map(s => s.id === id ? { ...s, ...data } : s) });",
  "updateData({ gradSchemes: userData.gradSchemes.map(s => s.id === id ? { ...s, ...data } : s) });"
);

code = code.replace(
  "deleteScheme={(id) => {",
  "deleteScheme={(id) => {"
);

code = code.replace(
  "updateData({ graduateSchemes: userData.graduateSchemes.filter(s => s.id !== id) });",
  "updateData({ gradSchemes: userData.gradSchemes.filter(s => s.id !== id) });"
);

code = code.replace(
  "schemes={userData.graduateSchemes}",
  "schemes={userData.gradSchemes}"
);

fs.writeFileSync('src/App.tsx', code);
