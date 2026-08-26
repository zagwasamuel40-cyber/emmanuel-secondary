const fs = require('fs');

let file = fs.readFileSync('src/pages/Enrollment.tsx', 'utf8');

file = file.replace(
  '{previousStudents.map(student => (\n                            <tr key={student.id}',
  '{previousStudents.map((student, idx) => (\n                            <tr key={`${student.id}_${idx}`}'
);

fs.writeFileSync('src/pages/Enrollment.tsx', file);
