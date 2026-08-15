const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Revert TimelineTab to remove selectedSector
app = app.replace('searchQuery={searchQuery} selectedSector={selectedSector}', 'searchQuery={searchQuery}'); // Since TimelineTab was the first one replaced by sed, hopefully this hits it.
// Let's just do a clean replace using Regex for each

app = app.replace(/<TimelineTab([^]*?)searchQuery=\{searchQuery\}([^]*?)\/>/g, (match) => {
  return match.replace(/selectedSector=\{selectedSector\}/g, '');
});

app = app.replace(/<PartTimeRolesTab([^]*?)searchQuery=\{searchQuery\}([^]*?)\/>/g, (match) => {
  // ensure exactly one
  let str = match.replace(/selectedSector=\{selectedSector\}/g, '');
  return str.replace('searchQuery={searchQuery}', 'searchQuery={searchQuery} selectedSector={selectedSector}');
});

app = app.replace(/<GraduateSchemesTab([^]*?)searchQuery=\{searchQuery\}([^]*?)\/>/g, (match) => {
  let str = match.replace(/selectedSector=\{selectedSector\}/g, '');
  return str.replace('searchQuery={searchQuery}', 'searchQuery={searchQuery} selectedSector={selectedSector}');
});

app = app.replace(/<PriorityTrackerTab([^]*?)searchQuery=\{searchQuery\}([^]*?)\/>/g, (match) => {
  let str = match.replace(/selectedSector=\{selectedSector\}/g, '');
  return str.replace('searchQuery={searchQuery}', 'searchQuery={searchQuery} selectedSector={selectedSector}');
});

fs.writeFileSync('src/App.tsx', app);
