const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');

// Add import if not present
if (!code.includes('html2pdf')) {
  code = code.replace(
    /import \{ useSessions \} from "\.\.\/data\/sessionsData";/,
    'import { useSessions } from "../data/sessionsData";\nimport html2pdf from "html2pdf.js";'
  );
}

// Add export function
const exportCode = `
  const handleExportPDF = () => {
    if (!printAreaRef.current) return;
    
    // Temporarily add a class to make it look like print mode for html2pdf
    printAreaRef.current.classList.add('pdf-export-mode');
    
    const opt = {
      margin:       0.5,
      filename:     \`\${portalSettings.schoolName}_Report.pdf\`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(printAreaRef.current).save().then(() => {
      printAreaRef.current?.classList.remove('pdf-export-mode');
    });
  };
`;

if (!code.includes('handleExportPDF')) {
  code = code.replace(
    /const handlePrint = \(\) => \{/,
    exportCode + '\n  const handlePrint = () => {'
  );
  
  code = code.replace(
    /<Button variant="outline" className="gap-2">[\s\S]*?<Download size=\{16\} \/> Export PDF[\s\S]*?<\/Button>/,
    '<Button variant="outline" onClick={handleExportPDF} className="gap-2"><Download size={16} /> Export PDF</Button>'
  );
}

fs.writeFileSync('src/pages/Reports.tsx', code);
