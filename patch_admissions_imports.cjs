const fs = require('fs');
let code = fs.readFileSync('src/pages/AdmissionsManagement.tsx', 'utf-8');

if (!code.includes('Sparkles')) {
  code = code.replace(
    /FileCheck,/,
    'FileCheck, Sparkles,'
  );
  fs.writeFileSync('src/pages/AdmissionsManagement.tsx', code);
}
