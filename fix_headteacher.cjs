const fs = require('fs');
let file = fs.readFileSync('src/pages/students/HeadTeacherComments.tsx', 'utf8');
file = file.replace(
  '{students.filter((s: any) => s.class === selectedClass).map((s: any) => (\n                    <option key={s.id}',
  '{students.filter((s: any) => s.class === selectedClass).map((s: any, idx: number) => (\n                    <option key={`${s.id}_${idx}`}'
);
fs.writeFileSync('src/pages/students/HeadTeacherComments.tsx', file);
