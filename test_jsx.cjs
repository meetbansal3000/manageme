const fs = require('fs');
const content = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

let stack = [];
const tagRegex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
let match;
while ((match = tagRegex.exec(content)) !== null) {
  const fullTag = match[0];
  const tagName = match[1];
  if (fullTag.endsWith('/>')) {
    // self closing
    continue;
  }
  if (fullTag.startsWith('</')) {
    const last = stack.pop();
    if (last !== tagName) {
      console.log(`Mismatch at index ${match.index}: expected </${last}> but found </${tagName}>`);
      break;
    }
  } else {
    stack.push(tagName);
  }
}
console.log("Remaining stack:", stack);
