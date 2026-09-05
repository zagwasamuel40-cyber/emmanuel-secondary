const fs = require('fs');
let code = fs.readFileSync('src/pages/Examinations.tsx', 'utf-8');

// Fix global students array being defined twice
// Just to make sure we don't have unused mockStudents
code = code.replace(/const mockStudents = \[[\s\S]*?\];/m, '');

fs.writeFileSync('src/pages/Examinations.tsx', code);
