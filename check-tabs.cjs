const fs = require('fs');

const content = fs.readFileSync('src/components/AdminCMS.tsx', 'utf8');
const lines = content.split('\n');

function checkRange(start, end, label) {
  const range = lines.slice(start - 1, end).join('\n');
  let openDivs = (range.match(/<div/g) || []).length;
  let closeDivs = (range.match(/<\/div>/g) || []).length;
  console.log(`${label} (Lines ${start}-${end}): <divCount=${openDivs}, </divCount=${closeDivs}, diff=${openDivs - closeDivs}`);
}

checkRange(3599, 4506, 'global_settings');
checkRange(4507, 4965, 'hero');
checkRange(4966, 5336, 'who_we_are');
checkRange(5337, 5885, 'activities');
