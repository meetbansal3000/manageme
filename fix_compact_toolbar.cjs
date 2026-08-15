const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(/<CompactToolbar([^]*?)searchQuery=\{searchQuery\}([^]*?)setSearchQuery=\{setSearchQuery\}/, '<CompactToolbar$1searchQuery={searchQuery}\n          setSearchQuery={setSearchQuery}');

app = app.replace(/<PartTimeRolesTab([^]*?)searchQuery=\{searchQuery\} selectedSector=\{selectedSector\} selectedSector=\{selectedSector\}([^]*?)\/>/g, '<PartTimeRolesTab$1searchQuery={searchQuery} selectedSector={selectedSector}$2/>');

fs.writeFileSync('src/App.tsx', app);
