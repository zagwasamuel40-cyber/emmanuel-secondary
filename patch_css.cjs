const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

if (!css.includes('@media print')) {
  css += `

@media print {
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .print\\:hidden, 
  aside, 
  header, 
  .print-wrapper > div:first-child { 
    display: none !important; 
  }
  .print-section {
    display: block !important;
    page-break-inside: avoid;
  }
  .print-page-break {
    page-break-before: always;
    break-before: page;
  }
  .print-page-break:first-child {
    page-break-before: avoid;
    break-before: auto;
  }
  @page {
    size: A4;
    margin: 1.5cm;
  }
  @page landscape {
    size: A4 landscape;
  }
  .landscape {
    page: landscape;
  }
  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    background: white;
  }
}
`;
  fs.writeFileSync('src/index.css', css);
}
