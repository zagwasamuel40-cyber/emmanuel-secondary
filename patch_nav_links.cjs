const fs = require('fs');
let code = fs.readFileSync('src/layouts/PublicLayout.tsx', 'utf-8');

code = code.replace(/href="\/#gallery"/g, 'href="/about#gallery"');

fs.writeFileSync('src/layouts/PublicLayout.tsx', code);
