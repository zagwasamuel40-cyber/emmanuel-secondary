const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');

// Fix s.firstName s.lastName to s.name
code = code.replace(/{s\.firstName} {s\.lastName}/g, '{s.name}');
code = code.replace(/\{`Student Report: \$\{s\.firstName\} \$\{s\.lastName\}`\}/g, '{`Student Report: ${s.name}`}');

// Fix duplicate keys in Reports
code = code.replace(/classStudents\.map\(s => \(/g, 'classStudents.map((s, idx) => (');
code = code.replace(/<tr key=\{s\.id\}>/g, '<tr key={`${s.id}_${idx}`}>');

code = code.replace(/studentsToPrint\.map\(s => \{/g, 'studentsToPrint.map((s, idx) => {');
code = code.replace(/<div key=\{s\.id\} className="print-page-break print-section p-8 bg-white min-h-screen">/g, '<div key={`${s.id}_${idx}`} className="print-page-break print-section p-8 bg-white min-h-screen">');

code = code.replace(/teachers\.map\(t => \(/g, 'teachers.map((t, idx) => (');
code = code.replace(/<tr key=\{t\.id\}>/g, '<tr key={`${t.id}_${idx}`}>');

fs.writeFileSync('src/pages/Reports.tsx', code);
