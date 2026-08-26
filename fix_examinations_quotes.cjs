const fs = require('fs');
let file = fs.readFileSync('src/pages/Examinations.tsx', 'utf8');

file = file.replace(
  '<CardTitle className="text-white">\n                "Check Student Result"\n              </CardTitle>',
  '<CardTitle className="text-white">\n                Check Student Result\n              </CardTitle>'
);

fs.writeFileSync('src/pages/Examinations.tsx', file);
