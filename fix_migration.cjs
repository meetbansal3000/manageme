const fs = require('fs');
let hook = fs.readFileSync('src/hooks/useFirestoreData.ts', 'utf8');

// Re-write the initialize logic
const searchString = `            // Initialize with default data
            setDoc(docRef, DEFAULT_DATA).then(() => {
              const localData = localStorage.getItem('userTrackerData');
        if (localData) {
          setData(JSON.parse(localData));
        } else {
          setData(DEFAULT_DATA);
        }
              setLoading(false);
            });`;

const replacement = `            // Initialize with default data or migrate from local storage
            const localDataStr = localStorage.getItem('userTrackerData');
            const initialData = localDataStr ? JSON.parse(localDataStr) : DEFAULT_DATA;
            setDoc(docRef, initialData).then(() => {
              setData(initialData);
              setLoading(false);
            });`;

hook = hook.replace(searchString, replacement);

const fallbackSearch = `      } else {
        const localData = localStorage.getItem('userTrackerData');
        if (localData) {
          setData(JSON.parse(localData));
        } else {
          setData(DEFAULT_DATA);
        }
        setLoading(false);
      }`;
// Wait, I might have replaced the other one too, let's verify.
fs.writeFileSync('src/hooks/useFirestoreData.ts', hook);
