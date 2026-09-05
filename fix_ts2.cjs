const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');

code = code.replace(/as Record<string, typeof students>/g, 'as Record<string, any[]>');

fs.writeFileSync('src/pages/Reports.tsx', code);
