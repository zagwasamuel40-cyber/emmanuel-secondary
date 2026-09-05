const fs = require('fs');
let en = fs.readFileSync('src/pages/Enrollment.tsx', 'utf-8');
en = en.replace(/key=\{\`\$\{s\.id\}_\$\{idx\}\`\}/g, 'key={s.id}');
fs.writeFileSync('src/pages/Enrollment.tsx', en);

let rp = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');
rp = rp.replace(/Award/g, 'GraduationCap');
fs.writeFileSync('src/pages/Reports.tsx', rp);
