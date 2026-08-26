const fs = require('fs');

let file = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

file = file.replace(
  'import html2canvas from "html2canvas";',
  'import { toPng } from "html-to-image";'
);

file = file.replace(
  /const canvas = await html2canvas\(input, \{ scale: 2, useCORS: true \}\);\n\s*const imgData = canvas\.toDataURL\('image\/png'\);\n\s*const pdf = new jsPDF\(\{ orientation: "portrait", unit: "mm", format: "a4" \}\);\n\s*const pdfWidth = pdf\.internal\.pageSize\.getWidth\(\);\n\s*let pdfHeight = \(canvas\.height \* pdfWidth\) \/ canvas\.width;/,
  `const imgData = await toPng(input, { pixelRatio: 2, cacheBust: true });
                      
                      // html-to-image doesn't give us a canvas height directly from the wrapper so we can get it from the input dimensions
                      const inputRect = input.getBoundingClientRect();
                      const canvasWidth = inputRect.width * 2;
                      const canvasHeight = inputRect.height * 2;
                      
                      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                      const pdfWidth = pdf.internal.pageSize.getWidth();
                      let pdfHeight = (canvasHeight * pdfWidth) / canvasWidth;`
);

fs.writeFileSync('src/pages/Dashboard.tsx', file);
