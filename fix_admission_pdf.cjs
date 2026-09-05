const fs = require('fs');
let code = fs.readFileSync('src/pages/public/AdmissionStatus.tsx', 'utf-8');

const regex = /const opt = \{[\s\S]*?\}\);\s*\}/g;
code = code.replace(regex, "window.print();\n                      }");

// Make sure the button text matches
code = code.replace(/<Download size=\{15\} \/> Download PDF/g, '<Printer size={15} /> Print / Save PDF');

fs.writeFileSync('src/pages/public/AdmissionStatus.tsx', code);
