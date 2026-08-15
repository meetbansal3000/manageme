const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace('searchQuery={searchQuery}', 'searchQuery={searchQuery}\n              selectedSector={selectedSector}');
app = app.replace('searchQuery={searchQuery}', 'searchQuery={searchQuery}\n              selectedSector={selectedSector}');
app = app.replace('searchQuery={searchQuery}', 'searchQuery={searchQuery}\n              selectedSector={selectedSector}');
app = app.replace('searchQuery={searchQuery}', 'searchQuery={searchQuery}\n              selectedSector={selectedSector}');

fs.writeFileSync('src/App.tsx', app);
