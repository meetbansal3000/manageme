const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Let's remove the block I added at the end first
const badBlock = `@layer base {
  h1, h2, h3, h4, h5, h6 {
    color: var(--text-primary);
  }
  p, span, sub, sup, small {
    /* Most text should inherit or use text-primary, but we can ensure high contrast defaults if needed */
  }
}`;

css = css.replace(badBlock, '');

// Now insert a proper clean block
const newBlock = `
@layer base {
  h1, h2, h3, h4, h5, h6 {
    color: var(--text-primary);
  }
  p {
    color: var(--text-secondary);
  }
}`;

css = css + newBlock;

fs.writeFileSync('src/index.css', css);
