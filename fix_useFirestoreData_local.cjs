const fs = require('fs');

let code = fs.readFileSync('src/hooks/useFirestoreData.ts', 'utf8');

code = code.replace(
  "const initialData = localDataStr ? JSON.parse(localDataStr) : DEFAULT_DATA;",
  "const initialData = localDataStr ? { ...DEFAULT_DATA, ...JSON.parse(localDataStr) } : DEFAULT_DATA;"
);

code = code.replace(
  "setData(JSON.parse(localData));",
  "setData({ ...DEFAULT_DATA, ...JSON.parse(localData) });"
);

fs.writeFileSync('src/hooks/useFirestoreData.ts', code);
