const fs = require('fs');

let file = fs.readFileSync('src/pages/Examinations.tsx', 'utf8');

file = file.replace(
  'filteredScores.map(student => {',
  'filteredScores.map((student, idx) => {'
);
file = file.replace(
  'rankedStudents.map((student, rankIdx) => {',
  'rankedStudents.map((student, rankIdx) => {'
);

fs.writeFileSync('src/pages/Examinations.tsx', file);
