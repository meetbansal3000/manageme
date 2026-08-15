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

  // We want to replace the header container layout in all of these files if they have it
  // Usually looks like: <div className="border-b border-[var(--border)] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
  // or similar.
  const oldHeader = /className="border-b border-\[var\(--border\)\] pb-6 flex flex-col md:flex-row [^>]+>/g;
  
  content = content.replace(oldHeader, (match) => {
    return 'className="border-b border-[var(--border)] pb-6 flex flex-col lg:flex-row justify-between items-start gap-8 w-full">';
  });

  // Also replace `<div>` wrapping the title with `<div className="flex-1">`
  // A heuristic: replace `<div>\n          <div className="font-space-mono` with `<div className="flex-1">\n          <div className="font-space-mono`
  content = content.replace(/<div>\s*<div className="font-space-mono/g, '<div className="flex-1">\n          <div className="font-space-mono');
  
  // Also for filter bar: `<div className="flex flex-wrap items-center gap-3">` -> `<div className="flex flex-wrap items-center gap-3 shrink-0">`
  content = content.replace(/<div className="flex flex-wrap items-center gap-3">/g, '<div className="flex flex-wrap items-center gap-3 shrink-0">');

  fs.writeFileSync(file, content);
}
