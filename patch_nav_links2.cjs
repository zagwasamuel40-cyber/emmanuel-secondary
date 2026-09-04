const fs = require('fs');
let code = fs.readFileSync('src/layouts/PublicLayout.tsx', 'utf-8');

code = code.replace(/<a href="\/about#gallery"([^>]*)>Gallery<\/a>/g, '<Link to="/about#gallery"$1>Gallery</Link>');
code = code.replace(/<a href="\/#team"([^>]*)>Dedicated Team<\/a>/g, '<Link to="/#team"$1>Dedicated Team</Link>');
code = code.replace(/<a href="\/#contact"([^>]*)>Contact Us<\/a>/g, '<Link to="/#contact"$1>Contact Us</Link>');

fs.writeFileSync('src/layouts/PublicLayout.tsx', code);
