const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');

code = code.replace(/map\(\(\[cls, classStudents\]\) =>/g, 'map(([cls, classStudents]: [string, any[]]) =>');

fs.writeFileSync('src/pages/Reports.tsx', code);
