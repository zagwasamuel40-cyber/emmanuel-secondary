const fs = require('fs');
let code = fs.readFileSync('src/pages/Academics.tsx', 'utf-8');

code = code.replace(/subjects\.map\(s => \(/g, 'subjects.map((s, idx) => (');
code = code.replace(/key=\{s\.id\}/g, 'key={`${s.id}_${idx}`}');

fs.writeFileSync('src/pages/Academics.tsx', code);
