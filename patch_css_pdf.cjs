const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

if (!css.includes('.pdf-export-mode')) {
  css += `

.pdf-export-mode {
  background: white !important;
  color: black !important;
  padding: 0 !important;
  margin: 0 !important;
}
.pdf-export-mode .print\\:hidden {
  display: none !important;
}
`;
  fs.writeFileSync('src/index.css', css);
}
