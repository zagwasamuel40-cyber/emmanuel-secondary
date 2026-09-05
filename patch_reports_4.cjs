const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');

code = code.replace(/<ReportHeader title="([^"]+)" \/>/g, '<ReportHeader title="$1" />\n        <div className="print-footer hidden print:block">Generated from {portalSettings.schoolName} Management Portal</div>');
code = code.replace(/<ReportHeader title=\{\`([^\`]+)\`\} \/>/g, '<ReportHeader title={`$1`} />\n        <div className="print-footer hidden print:block">Generated from {portalSettings.schoolName} Management Portal</div>');

fs.writeFileSync('src/pages/Reports.tsx', code);
