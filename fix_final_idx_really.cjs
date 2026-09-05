const fs = require('fs');

let rp = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');
rp = rp.replace(/\{students\.slice\(0\, 20\)\.map\(\(s\, idx\) \=\> \{/g, '{students.slice(0, 20).map((s) => {');
fs.writeFileSync('src/pages/Reports.tsx', rp);
