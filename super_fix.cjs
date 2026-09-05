const fs = require('fs');

let en = fs.readFileSync('src/pages/Enrollment.tsx', 'utf-8');
en = en.replace(/student \=\> \(/g, '(student, idx) => (');
fs.writeFileSync('src/pages/Enrollment.tsx', en);

let rp = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');
rp = rp.replace(/Award/g, 'GraduationCap');
rp = rp.replace(/\{studentsToPrint\.map\(\(s\) \=\> \{/g, '{studentsToPrint.map((s, idx) => {');
rp = rp.replace(/\{students\.slice\(0\, 20\)\.map\(\(s\) \=\> \{/g, '{students.slice(0, 20).map((s, idx) => {');
fs.writeFileSync('src/pages/Reports.tsx', rp);
