const fs = require('fs');
let code = fs.readFileSync('src/pages/Examinations.tsx', 'utf-8');

code = code.replace(/const students = \[/g, 'const mockStudents = [');

fs.writeFileSync('src/pages/Examinations.tsx', code);
