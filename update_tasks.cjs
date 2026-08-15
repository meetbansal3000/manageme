const fs = require('fs');
let code = fs.readFileSync('src/components/KeyNotesChecklistTab.tsx', 'utf8');

if (!code.includes("getAccessToken")) {
  code = code.replace(
    "import { NoteSection } from '../types';",
    "import { NoteSection } from '../types';\nimport { getAccessToken } from '../firebase';\nimport { CheckSquare } from 'lucide-react';"
  );
}

const syncFn = `
  const [isSyncing, setIsSyncing] = React.useState(false);
  
  const handleSyncTasks = async () => {
    setIsSyncing(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        alert("Please sign in to Google to sync with Tasks.");
        setIsSyncing(false);
        return;
      }
      
      // Get all task lists
      const listRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      const listData = await listRes.json();
      
      let listId = listData.items?.find((l: any) => l.title === 'Student Tracker Workspace')?.id;
      if (!listId) {
        const createListRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
          method: 'POST',
          headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Student Tracker Workspace' })
        });
        const newList = await createListRes.json();
        listId = newList.id;
      }
      
      let syncedCount = 0;
      for (const section of notesSections) {
        for (const item of section.items) {
          if (!item.completed) {
            await fetch(\`https://tasks.googleapis.com/tasks/v1/lists/\${listId}/tasks\`, {
              method: 'POST',
              headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: item.title, notes: item.details || '' })
            });
            syncedCount++;
          }
        }
      }
      alert(\`Successfully synced \${syncedCount} tasks to Google Tasks!\`);
    } catch (e) {
      console.error(e);
      alert('Failed to sync with Google Tasks.');
    } finally {
      setIsSyncing(false);
    }
  };
`;

code = code.replace("  const handleShare = () => {", syncFn + "\n  const handleShare = () => {");

const syncBtn = `
          <button onClick={handleSyncTasks} disabled={isSyncing} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-sm font-semibold text-blue-400 hover:bg-blue-400/10 transition-colors mr-2">
            <CheckSquare className="w-4 h-4" /> {isSyncing ? 'Syncing...' : 'Push to G-Tasks'}
          </button>
`;

code = code.replace(
  `<div className="flex items-center self-start mt-4 lg:mt-0">`,
  `<div className="flex items-center self-start mt-4 lg:mt-0">\n${syncBtn}`
);

fs.writeFileSync('src/components/KeyNotesChecklistTab.tsx', code);
