const fs = require('fs');

let file = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace indivSession and batchSession state definitions
file = file.replace(
  'const [indivSession, setIndivSession] = useState("2025/2026 - First Term");',
  'const [indivSessionYear, setIndivSessionYear] = useState("2025/2026");\n  const [indivSessionTerm, setIndivSessionTerm] = useState("First Term");'
);
file = file.replace(
  'const [batchSession, setBatchSession] = useState("2025/2026 - First Term");',
  'const [batchSessionYear, setBatchSessionYear] = useState("2025/2026");\n  const [batchSessionTerm, setBatchSessionTerm] = useState("First Term");'
);

// Replace uses of indivSession with combined string
file = file.replace(
  'session: indivSession,',
  'session: `${indivSessionYear} - ${indivSessionTerm}`,'
);

file = file.replace(
  'onClick={() => handleGenerateClassPins(batchClass, batchSession)}',
  'onClick={() => handleGenerateClassPins(batchClass, `${batchSessionYear} - ${batchSessionTerm}`)}'
);

// Replace indiv dropdowns
file = file.replace(
  '<Label className="text-xs font-bold text-slate-300">Academic Session / Term</Label>',
  '<Label className="text-xs font-bold text-slate-300">Academic Year</Label>'
);
file = file.replace(
  'value={indivSession}',
  'value={indivSessionYear}'
);
file = file.replace(
  'onChange={(e) => setIndivSession(e.target.value)}',
  'onChange={(e) => setIndivSessionYear(e.target.value)}'
);

// Add term dropdown for indiv
file = file.replace(
  '</select>\n                    </div>\n\n                    <div className="space-y-1.5">',
  '</select>\n                    </div>\n\n                    <div className="space-y-1.5">\n                      <Label className="text-xs font-bold text-slate-300">Term</Label>\n                      <select\n                        className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 text-sm font-semibold"\n                        value={indivSessionTerm}\n                        onChange={(e) => setIndivSessionTerm(e.target.value)}\n                      >\n                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}\n                      </select>\n                    </div>\n\n                    <div className="space-y-1.5">'
);


// Replace batch dropdowns
file = file.replace(
  '<Label className="text-xs font-bold text-slate-300">Academic Term Session</Label>',
  '<Label className="text-xs font-bold text-slate-300">Academic Year</Label>'
);
file = file.replace(
  'value={batchSession}',
  'value={batchSessionYear}'
);
file = file.replace(
  'onChange={(e) => setBatchSession(e.target.value)}',
  'onChange={(e) => setBatchSessionYear(e.target.value)}'
);

// Add term dropdown for batch
file = file.replace(
  '</select>\n                  </div>\n\n                  <Button',
  '</select>\n                  </div>\n\n                  <div className="space-y-1.5">\n                    <Label className="text-xs font-bold text-slate-300">Term</Label>\n                    <select\n                      className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 text-sm font-semibold"\n                      value={batchSessionTerm}\n                      onChange={(e) => setBatchSessionTerm(e.target.value)}\n                    >\n                      {TERMS.map(t => <option key={t} value={t}>{t}</option>)}\n                    </select>\n                  </div>\n\n                  <Button'
);

fs.writeFileSync('src/pages/Dashboard.tsx', file);
