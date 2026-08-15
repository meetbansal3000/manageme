const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// For Timeline
app = app.replace(/<TimelineTab([^]*?)searchQuery=\{searchQuery\}([^]*?)\/>/g, '<TimelineTab$1searchQuery={searchQuery} selectedSector={selectedSector}$2/>');

// For Grad
app = app.replace(/<GraduateSchemesTab([^]*?)searchQuery=\{searchQuery\}([^]*?)\/>/g, '<GraduateSchemesTab$1searchQuery={searchQuery} selectedSector={selectedSector}$2/>');

// For PartTime
app = app.replace(/<PartTimeRolesTab([^]*?)searchQuery=\{searchQuery\}([^]*?)\/>/g, '<PartTimeRolesTab$1searchQuery={searchQuery} selectedSector={selectedSector}$2/>');

// For Priority
app = app.replace(/<PriorityTrackerTab([^]*?)searchQuery=\{searchQuery\}([^]*?)\/>/g, '<PriorityTrackerTab$1searchQuery={searchQuery} selectedSector={selectedSector}$2/>');

fs.writeFileSync('src/App.tsx', app);
