const fs = require('fs');
let code = fs.readFileSync('src/pages/public/About.tsx', 'utf-8');

code = code.replace(/<div className="mt-16">/, '<div id="gallery" className="mt-16 pt-8">');

fs.writeFileSync('src/pages/public/About.tsx', code);
