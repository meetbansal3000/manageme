const fs = require('fs');
let code = fs.readFileSync('src/components/PartTimeRolesTab.tsx', 'utf8');

code = code.replace(
  "import { \n  ExternalLink\n} from 'lucide-react';", 
  "import { Share2, ExternalLink } from 'lucide-react';"
);

fs.writeFileSync('src/components/PartTimeRolesTab.tsx', code);
