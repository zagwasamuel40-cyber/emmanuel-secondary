const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

if (!css.includes('.print-slip-mode')) {
  css += `

.print-slip-mode {
  background: white !important;
}
.print-slip-mode > * {
  display: none !important;
}
.print-slip-mode #exam-slip {
  display: block !important;
}
`;
  fs.writeFileSync('src/index.css', css);
}
