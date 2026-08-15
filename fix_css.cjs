const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

const oldCSS = `.apple-headline {
    background: linear-gradient(180deg, #FFFFFF 0%, #A1A1A6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
    letter-spacing: -0.02em;
  }`;

const newCSS = `.apple-headline {
    color: var(--text-primary);
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  
  .dark .apple-headline {
    background: linear-gradient(180deg, #FFFFFF 0%, #A1A1A6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }`;

content = content.replace(oldCSS, newCSS);
fs.writeFileSync('src/index.css', content);
