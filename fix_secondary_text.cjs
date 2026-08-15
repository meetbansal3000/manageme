const fs = require('fs');

const files = [
  'src/components/GraduateSchemesTab.tsx',
  'src/components/PartTimeRolesTab.tsx',
  'src/components/PriorityTrackerTab.tsx',
  'src/components/KeyNotesChecklistTab.tsx',
  'src/components/TimelineTab.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/text-\[var\(--text-primary\)\]\/70/g, 'text-[var(--text-secondary)]');

  fs.writeFileSync(file, content);
}
