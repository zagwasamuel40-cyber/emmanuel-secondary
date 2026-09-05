const fs = require('fs');
let rp = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');
rp = rp.replace(/\{s\.id\}_\$\{idx\}/g, '{s.id}');
rp = rp.replace(/s, idx/g, 's');
fs.writeFileSync('src/pages/Reports.tsx', rp);

let en = fs.readFileSync('src/pages/Enrollment.tsx', 'utf-8');
en = en.replace(/student, idx/g, 'student');
fs.writeFileSync('src/pages/Enrollment.tsx', en);
