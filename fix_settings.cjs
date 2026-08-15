const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsDrawer.tsx', 'utf8');

// Update imports and props
content = content.replace(
  "import { useSettings } from '../context/SettingsContext';",
  "import { useSettings } from '../context/SettingsContext';\nimport { UserTrackerData } from '../hooks/useFirestoreData';"
);

content = content.replace(
  "interface SettingsDrawerProps {",
  "interface SettingsDrawerProps {\n  userData: UserTrackerData;\n  updateData: (data: Partial<UserTrackerData>) => void;"
);

content = content.replace(
  "export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {",
  "export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose, userData, updateData }) => {"
);

// Add backup/restore logic
const backupLogic = `
  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", \`tracker_backup_\${new Date().toISOString().split('T')[0]}.json\`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm('Warning: This will overwrite your current data. Proceed?')) {
          await updateData(data);
          alert('Data restored successfully!');
        }
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };
`;

content = content.replace(
  "  if (!isOpen) return null;",
  backupLogic + "\n  if (!isOpen) return null;"
);

const backupSection = `
          {/* Data Backup */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Data Backup</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDownloadBackup}
                className="w-full py-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] text-sm font-medium transition-all"
              >
                Download Full System Backup (.json)
              </button>
              <label className="w-full py-3 rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] text-sm font-medium transition-all text-center cursor-pointer">
                Restore System Snapshot
                <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
              </label>
            </div>
          </section>
`;

content = content.replace(
  "<hr className=\"border-[var(--border)]\" />",
  backupSection + "\n          <hr className=\"border-[var(--border)]\" />"
);

fs.writeFileSync('src/components/SettingsDrawer.tsx', content);
console.log("Updated SettingsDrawer.tsx!");
