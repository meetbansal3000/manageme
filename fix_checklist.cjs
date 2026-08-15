const fs = require('fs');
let code = fs.readFileSync('src/components/KeyNotesChecklistTab.tsx', 'utf8');

code = code.replace("import { \n  CheckCircle2,", "import { Share2, CheckCircle2,");

const shareFn = `
  const handleShare = () => {
    const json = JSON.stringify(notesSections, null, 2);
    navigator.clipboard.writeText(json);
    alert('Master Checklist data copied to clipboard as JSON!');
  };
`;
code = code.replace("export const KeyNotesChecklistTab: React.FC<KeyNotesChecklistTabProps> = ({", 
"export const KeyNotesChecklistTab: React.FC<KeyNotesChecklistTabProps> = ({\n  notesSections,\n  onToggleItem,\n  searchQuery\n}) => {\n" + shareFn + "\n  return (");
code = code.replace("  notesSections,\n  onToggleItem,\n  searchQuery\n}) => {\n  return (", "");

code = code.replace(
  `          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
            Essential operational checklists covering visa compliance, financial strictness, application pipelines, and daily productivity mantras.
          </p>
        </div>`,
  `          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
            Essential operational checklists covering visa compliance, financial strictness, application pipelines, and daily productivity mantras.
          </p>
        </div>
        <div className="flex items-center self-start mt-4 lg:mt-0">
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <Share2 className="w-4 h-4" /> Share List
          </button>
        </div>`
);

fs.writeFileSync('src/components/KeyNotesChecklistTab.tsx', code);
