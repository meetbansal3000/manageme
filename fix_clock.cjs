const fs = require('fs');
let header = fs.readFileSync('src/components/Header.tsx', 'utf8');

if(!header.includes("Clock")) {
  header = header.replace("import { Sun, Moon, ", "import { Sun, Moon, Clock, ");
}

fs.writeFileSync('src/components/Header.tsx', header);
