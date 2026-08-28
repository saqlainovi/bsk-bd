const fs = require('fs');

const content = fs.readFileSync('src/components/AdminCMS.tsx', 'utf8');

// Strip JSX comments
const cleanCode = content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

// Parse tags
const tagRegex = /<\/?([a-zA-Z0-9]+)(\s|>|\/)/g;
const stack = [];
const lines = cleanCode.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const full = match[0];
    const tagName = match[1];
    const isClose = full.startsWith('</');
    const isSelfClosing = line.includes('/>') && !isClose && line.lastIndexOf('/>') > match.index;

    if (['img', 'input', 'br', 'hr', 'path', 'svg', 'circle', 'line', 'polyline', 'rect'].includes(tagName.toLowerCase())) continue;

    if (isClose) {
      if (stack.length > 0 && stack[stack.length - 1].tag === tagName) {
        stack.pop();
      } else {
        console.log(`Line ${i + 1}: Unmatched </${tagName}>, stack top:`, stack.length ? stack[stack.length - 1] : 'empty');
      }
    } else if (!isSelfClosing) {
      stack.push({ tag: tagName, line: i + 1 });
    }
  }
}

console.log('Unclosed tags at end of file:', stack);
