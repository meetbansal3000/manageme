const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
// Find the block for the dock
const dockStart = appTsx.indexOf('{/* macOS Style Quick-Capture Dock */}');
if (dockStart !== -1) {
  let before = appTsx.substring(0, dockStart);
  let dock = appTsx.substring(dockStart);
  
  dock = dock.replace(/text-\[var\(--text-secondary\)\]/g, 'text-[var(--text-primary)]');
  
  appTsx = before + dock;
  fs.writeFileSync('src/App.tsx', appTsx);
}
