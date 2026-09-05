const fs = require('fs');

let en = fs.readFileSync('src/pages/Enrollment.tsx', 'utf-8');
en = en.replace(/\{student\.id \+ Math\.random\(\)\}/g, '{student.id}');
en = en.replace(/\{student\.id\}_\$\{idx\}/g, '{student.id}');
en = en.replace(/student, idx/g, 'student');
en = en.replace(/key=\{\`\$\{student\.id\}_\$\{idx\}\`\}/g, 'key={student.id}');
fs.writeFileSync('src/pages/Enrollment.tsx', en);

let rp = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');
rp = rp.replace(/GraduationCap className/g, 'Award className');
rp = rp.replace(/key=\{\`\$\{s\.id\}_\$\{idx\}\`\}/g, 'key={s.id}');
rp = rp.replace(/key=\{\`\$\{t\.id\}_\$\{idx\}\`\}/g, 'key={t.id}');
rp = rp.replace(/const present \= 60 \- \(idx \% 5\)/g, 'const present = 60 - (Math.floor(Math.random() * 5))');
rp = rp.replace(/const absent \= \(idx \% 3\)/g, 'const absent = (Math.floor(Math.random() * 3))');
rp = rp.replace(/const late \= \(idx \% 2\)/g, 'const late = (Math.floor(Math.random() * 2))');
fs.writeFileSync('src/pages/Reports.tsx', rp);
