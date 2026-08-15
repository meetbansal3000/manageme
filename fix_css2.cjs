const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

const darkBlock = `.dark {
    /* Default Apple Obsidian Dark Theme */
    --bg: #000000;
    --surface: rgba(0, 0, 0, 0.8);
    --surface-solid: #161617;
    --border: rgba(255, 255, 255, 0.12);
    --text-primary: #f5f5f7;
    --text-secondary: #515154;`;

const fixedDarkBlock = `.dark {
    /* Default Apple Obsidian Dark Theme */
    --bg: #000000;
    --surface: rgba(0, 0, 0, 0.8);
    --surface-solid: #161617;
    --border: rgba(255, 255, 255, 0.12);
    --text-primary: #f5f5f7;
    --text-secondary: #86868b;`;

content = content.replace(darkBlock, fixedDarkBlock);
fs.writeFileSync('src/index.css', content);
