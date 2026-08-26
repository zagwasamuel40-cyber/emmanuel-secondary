const fs = require('fs');

let file = fs.readFileSync('src/pages/Teachers.tsx', 'utf8');

file = file.replace(
  '{students.map((student) => (\n                      <tr key={student.id}',
  '{students.map((student, idx) => (\n                      <tr key={`${student.id}_${idx}`}'
);

fs.writeFileSync('src/pages/Teachers.tsx', file);
