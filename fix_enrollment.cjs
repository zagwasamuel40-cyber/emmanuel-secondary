const fs = require('fs');
let code = fs.readFileSync('src/pages/Enrollment.tsx', 'utf-8');

code = code.replace(/foundStudents\.length > 0 \? foundStudents\.map\(student => \(/g, 'foundStudents.length > 0 ? foundStudents.map((student, idx) => (');
code = code.replace(/<tr key=\{student\.id\}/g, '<tr key={`${student.id}_${idx}`}');

code = code.replace(/enrollments\.map\(s => \(/g, 'enrollments.map((s, idx) => (');
code = code.replace(/<option key=\{s\.id\} value=\{s\.id\}/g, '<option key={`${s.id}_${idx}`} value={s.id}');

fs.writeFileSync('src/pages/Enrollment.tsx', code);
