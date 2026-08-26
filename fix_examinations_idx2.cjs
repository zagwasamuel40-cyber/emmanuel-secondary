const fs = require('fs');

let file = fs.readFileSync('src/pages/Examinations.tsx', 'utf8');

file = file.replace(
  'filteredScores.map(student => {\n                          const rankings =',
  'filteredScores.map((student, rankIdx) => {\n                          const rankings ='
);

fs.writeFileSync('src/pages/Examinations.tsx', file);
