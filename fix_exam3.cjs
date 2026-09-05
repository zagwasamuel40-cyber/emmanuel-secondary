const fs = require('fs');
let code = fs.readFileSync('src/pages/Examinations.tsx', 'utf-8');

code = code.replace(/\.map\(s => \(/g, '.map((s, idx) => (');
code = code.replace(/key=\{s\.id\}/g, 'key={`${s.id}_${idx}`}');

fs.writeFileSync('src/pages/Examinations.tsx', code);
