const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const dockBtnCss = `
  .apple-dock-icon-bg {
    background-color: rgba(0, 0, 0, 0.05);
  }
  .dark .apple-dock-icon-bg {
    background-color: rgba(255, 255, 255, 0.05);
  }
  .apple-dock-divider {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .dark .apple-dock-divider {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

css = css.replace('.apple-dock {', dockBtnCss + '\n  .apple-dock {');
fs.writeFileSync('src/index.css', css);

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
appTsx = appTsx.replace(/bg-black\/5 dark:bg-white\/5/g, 'apple-dock-icon-bg');
appTsx = appTsx.replace(/bg-black\/10 dark:bg-white\/10/g, 'apple-dock-divider');

fs.writeFileSync('src/App.tsx', appTsx);
