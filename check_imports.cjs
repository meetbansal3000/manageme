const fs = require('fs');

let content = fs.readFileSync('src/components/UniTimetableTab.tsx', 'utf8');

if (!content.includes('useRef')) {
  content = content.replace('import React, { useState', 'import React, { useState, useRef');
}

if (!content.includes('Loader2')) {
  content = content.replace('import { ', 'import { Loader2, Bot, ');
}

fs.writeFileSync('src/components/UniTimetableTab.tsx', content);
