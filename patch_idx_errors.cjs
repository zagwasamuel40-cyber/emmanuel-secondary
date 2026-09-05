const fs = require('fs');

// Fix idx in Enrollment.tsx
let enrollment = fs.readFileSync('src/pages/Enrollment.tsx', 'utf-8');
enrollment = enrollment.replace(/key=\{\`\$\{student\.id\}_\$\{idx\}\`\}/g, 'key={student.id}');
fs.writeFileSync('src/pages/Enrollment.tsx', enrollment);

// Fix idx in Reports.tsx
let reports = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');
reports = reports.replace(/key=\{\`\$\{student\.id\}_\$\{idx\}\`\}/g, 'key={student.id}');
fs.writeFileSync('src/pages/Reports.tsx', reports);
