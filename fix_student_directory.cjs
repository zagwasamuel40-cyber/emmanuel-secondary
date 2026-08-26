const fs = require('fs');

let file = fs.readFileSync('src/pages/students/StudentDirectory.tsx', 'utf8');

file = file.replace(
  '{filteredStudents.map((student: any) => (\n                <tr key={student.id}',
  '{filteredStudents.map((student: any, idx: number) => (\n                <tr key={`${student.id}_${idx}`}'
);

fs.writeFileSync('src/pages/students/StudentDirectory.tsx', file);
