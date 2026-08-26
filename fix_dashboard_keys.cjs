const fs = require('fs');
let file = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
file = file.replace(
  '{initialStudentsList.map(st => (\n                        <option key={st.id}',
  '{initialStudentsList.map((st, idx) => (\n                        <option key={`${st.id}_${idx}`}'
);
fs.writeFileSync('src/pages/Dashboard.tsx', file);
