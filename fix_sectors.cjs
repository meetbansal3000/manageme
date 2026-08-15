const fs = require('fs');

function updateComponent(file, propName, filterItemsName) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add selectedSector to props interface
  content = content.replace(/searchQuery: string;/g, 'searchQuery: string;\n  selectedSector: string;');
  
  // Add to component destructuring
  content = content.replace(/searchQuery\n}\) => {/g, 'searchQuery,\n  selectedSector\n}) => {');
  
  // Also handle cases where they are on the same line or differently formatted
  if (!content.includes('selectedSector: string;')) {
    content = content.replace(/searchQuery: string;/g, 'searchQuery: string; selectedSector: string;');
  }
  if (!content.includes('selectedSector\n}) => {')) {
    content = content.replace(/searchQuery\s*}\)\s*=>\s*{/, 'searchQuery, selectedSector }) => {');
  }

  // Update the filter logic to use it
  const filterStart = `const filtered = ${filterItemsName}.filter(`;
  if (content.includes(filterStart)) {
    // We'll just insert it inside the filter function right after '=> {'
    // Find '=> {' for this filter
    const filterRegex = new RegExp(`const filtered = ${filterItemsName}\\??\\.filter\\([a-zA-Z0-9_]+\\s*=>\\s*\\{`);
    content = content.replace(filterRegex, (match) => {
      // return the match + the sector check
      return match + `\n    if (selectedSector !== 'ALL' && ${match.match(/\(([a-zA-Z0-9_]+)/)[1]}.sector !== selectedSector) return false;`;
    });
  }

  fs.writeFileSync(file, content);
}

// 1. Update GraduateSchemesTab
updateComponent('src/components/GraduateSchemesTab.tsx', 'gradSchemes', 'gradSchemes');
// 2. Update PartTimeRolesTab
updateComponent('src/components/PartTimeRolesTab.tsx', 'partTimeRoles', 'partTimeRoles');
// 3. Update PriorityTrackerTab
updateComponent('src/components/PriorityTrackerTab.tsx', 'priorityItems', 'priorityItems');

// 4. Update App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/<GraduateSchemesTab([^>]+)searchQuery=\{searchQuery\}/g, '<GraduateSchemesTab$1searchQuery={searchQuery} selectedSector={selectedSector}');
app = app.replace(/<PartTimeRolesTab([^>]+)searchQuery=\{searchQuery\}/g, '<PartTimeRolesTab$1searchQuery={searchQuery} selectedSector={selectedSector}');
app = app.replace(/<PriorityTrackerTab([^>]+)searchQuery=\{searchQuery\}/g, '<PriorityTrackerTab$1searchQuery={searchQuery} selectedSector={selectedSector}');
fs.writeFileSync('src/App.tsx', app);
