const fs = require('fs');

let file = fs.readFileSync('src/pages/Examinations.tsx', 'utf8');

// Fix Array.from(new Set(...)).map
file = file.replace(
  '        })))).map(str => {',
  '        })))).map((str, idx) => {'
);
file = file.replace(
  '<div key={st.studentId} className="border-b-4 border-dashed border-slate-700 pb-12 mb-12 last:border-0" style={{ breakInside: \'avoid\', pageBreakInside: \'avoid\', breakAfter: \'page\' }}>',
  '<div key={`${st.studentId}_${idx}`} className="border-b-4 border-dashed border-slate-700 pb-12 mb-12 last:border-0" style={{ breakInside: \'avoid\', pageBreakInside: \'avoid\', breakAfter: \'page\' }}>'
);

// Fix ALL_STUDENTS.map
file = file.replace(
  '{ALL_STUDENTS.map(s => (\\n                    <option key={s.id} value={s.id}>{s.name} ({s.id}) - {s.class}</option>\\n                  ))}',
  '{ALL_STUDENTS.map((s, idx) => (\\n                    <option key={`${s.id}_${idx}`} value={s.id}>{s.name} ({s.id}) - {s.class}</option>\\n                  ))}'
);

// We need to use regex for ALL_STUDENTS since it spans multiple lines.
file = file.replace(
  /\{ALL_STUDENTS\.map\(s => \(\s*<option key=\{s\.id\} value=\{s\.id\}>\{s\.name\} \(\{s\.id\}\) - \{s\.class\}<\/option>\s*\)\)\}/,
  `{ALL_STUDENTS.map((s, idx) => (
                    <option key={\`\${s.id}_\${idx}\`} value={s.id}>{s.name} ({s.id}) - {s.class}</option>
                  ))}`
);

fs.writeFileSync('src/pages/Examinations.tsx', file);
