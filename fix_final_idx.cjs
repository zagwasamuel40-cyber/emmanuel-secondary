const fs = require('fs');

let en = fs.readFileSync('src/pages/Enrollment.tsx', 'utf-8');
en = en.replace(/key=\{student\.id\}/g, 'key={student.id + Math.random()}');
en = en.replace(/\{student\.id\}_\$\{idx\}/g, '{student.id + Math.random()}');
fs.writeFileSync('src/pages/Enrollment.tsx', en);

let rp = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');
rp = rp.replace(/key=\{student\.id\}/g, 'key={student.id + Math.random()}');
rp = rp.replace(/\{student\.id\}_\$\{idx\}/g, '{student.id + Math.random()}');
rp = rp.replace(/GraduationCap/g, 'Award'); // Use an icon that already exists or avoid it
fs.writeFileSync('src/pages/Reports.tsx', rp);
