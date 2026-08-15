const fs = require('fs');
let header = fs.readFileSync('src/components/Header.tsx', 'utf8');

// Using regex to ensure Clock is imported from lucide-react
if(!header.includes("Clock,")) {
  header = header.replace(/import {([^}]+)} from 'lucide-react';/, "import { Clock, $1 } from 'lucide-react';");
}
fs.writeFileSync('src/components/Header.tsx', header);
