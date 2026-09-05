const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');

if (!code.includes('setTimeout(() => setGenerating(false), 500);')) {
  console.log("Could not find the target string.");
} else if (!code.includes('setTimeout(() => handlePrint(), 800);')) {
  code = code.replace(
    /setTimeout\(\(\) => setGenerating\(false\), 500\);/g,
    'setTimeout(() => setGenerating(false), 500);\n        setTimeout(() => handlePrint(), 800);'
  );
  fs.writeFileSync('src/pages/Reports.tsx', code);
}
