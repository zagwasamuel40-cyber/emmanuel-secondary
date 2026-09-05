const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');

// Remove import
code = code.replace(/import html2pdf from "html2pdf\.js";\n?/g, '');

// Replace handleExportPDF implementation
const exportRegex = /const handleExportPDF = \(\) => \{[\s\S]*?\};\n\n  const handlePrint =/g;
code = code.replace(exportRegex, 'const handleExportPDF = () => { handlePrint(); };\n\n  const handlePrint =');

fs.writeFileSync('src/pages/Reports.tsx', code);
