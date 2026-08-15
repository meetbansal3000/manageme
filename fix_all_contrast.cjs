const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/text-\[var\(--text-primary\)\]\/(?:70|60)/g, 'text-[var(--text-secondary)]');
      fs.writeFileSync(fullPath, content);
    }
  }
}

replaceInDir('src/');
