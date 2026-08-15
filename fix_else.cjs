const fs = require('fs');
let hook = fs.readFileSync('src/hooks/useFirestoreData.ts', 'utf8');

hook = hook.replace(
  `      } else {
        setData(DEFAULT_DATA);
        setLoading(false);
      }`,
  `      } else {
        const localData = localStorage.getItem('userTrackerData');
        if (localData) {
          setData(JSON.parse(localData));
        } else {
          setData(DEFAULT_DATA);
        }
        setLoading(false);
      }`
);

fs.writeFileSync('src/hooks/useFirestoreData.ts', hook);
