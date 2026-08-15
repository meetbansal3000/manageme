const fs = require('fs');
let hook = fs.readFileSync('src/hooks/useFirestoreData.ts', 'utf8');

// Load from local storage in fallback
hook = hook.replace(
  "setData(DEFAULT_DATA);",
  "const localData = localStorage.getItem('userTrackerData');\n        if (localData) {\n          setData(JSON.parse(localData));\n        } else {\n          setData(DEFAULT_DATA);\n        }"
);

// Persist to local storage in fallback
hook = hook.replace(
  "setData(prev => ({ ...prev, ...partialData }));",
  "setData(prev => {\n        const newData = { ...prev, ...partialData };\n        localStorage.setItem('userTrackerData', JSON.stringify(newData));\n        return newData;\n      });"
);

fs.writeFileSync('src/hooks/useFirestoreData.ts', hook);
