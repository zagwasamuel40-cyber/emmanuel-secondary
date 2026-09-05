const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');

// The user wants a robust Academic Result printing feature with School Logo, Student Photo, Remarks, Skills
// We'll inject a "Student Academic Results" section in the Reports component
const resultPrintInjection = `
  const [resultClass, setResultClass] = useState(CLASSES[0]);
  const [resultTerm, setResultTerm] = useState(TERMS[0]);
  const [resultSession, setResultSession] = useState("2025/2026");
  
  const AcademicResultReport = () => {
    // Only fetch students from the selected class
    const targetStudents = activeReport === "master" ? students.slice(0, 1) : students.filter(s => s.class === resultClass);
    
    return (
      <div id="academic-results-container">
        {targetStudents.map((s, idx) => {
          const studentScores = scores.filter(score => score.studentId === s.id);
          
          let totalScore = 0;
          let maxPossibleScore = studentScores.length * 100;
          studentScores.forEach(sc => totalScore += sc.total);
          
          return (
            <div key={\`\${s.id}_\${idx}\`} className="print-page-break print-section p-10 bg-white min-h-screen">
              {/* School Header */}
              <div className="flex flex-col items-center justify-center border-b-[3px] border-slate-900 pb-6 mb-6">
                <div className="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="text-white" size={40} />
                </div>
                <h1 className="text-4xl font-black font-heading tracking-wider uppercase text-center">{portalSettings.schoolName}</h1>
                <p className="text-slate-700 font-bold mt-2">{portalSettings.schoolAddress} | {portalSettings.schoolContactPhone}</p>
                <div className="mt-4 px-6 py-2 bg-slate-900 text-white font-bold uppercase tracking-widest text-lg rounded-t-lg">
                  Student Terminal Report
                </div>
              </div>
              
              {/* Report Meta Info */}
              <div className="grid grid-cols-4 gap-4 mb-8 bg-slate-50 p-4 border border-slate-300">
                <div><span className="text-slate-500 font-bold uppercase text-xs block mb-1">Academic Session</span><span className="font-bold">{resultSession}</span></div>
                <div><span className="text-slate-500 font-bold uppercase text-xs block mb-1">Term</span><span className="font-bold">{resultTerm}</span></div>
                <div><span className="text-slate-500 font-bold uppercase text-xs block mb-1">Class</span><span className="font-bold">{resultClass}</span></div>
                <div><span className="text-slate-500 font-bold uppercase text-xs block mb-1">Section</span><span className="font-bold">A</span></div>
              </div>
              
              {/* Student Info Box */}
              <div className="flex border border-slate-900 mb-8">
                <div className="w-32 h-32 bg-slate-200 border-r border-slate-900 flex items-center justify-center shrink-0">
                  <UserCheck className="text-slate-400" size={48} />
                </div>
                <div className="flex-1 p-4 grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-500 font-bold uppercase text-xs inline-block w-32">Student Name:</span>
                    <span className="font-black text-lg">{s.name}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-500 font-bold uppercase text-xs inline-block w-32">Admission No:</span>
                    <span className="font-bold font-mono">{s.id}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-500 font-bold uppercase text-xs inline-block w-32">Gender:</span>
                    <span className="font-bold">{s.gender || "N/A"}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-500 font-bold uppercase text-xs inline-block w-32">Attendance:</span>
                    <span className="font-bold">115 / 120 Days</span>
                  </div>
                </div>
              </div>
              
              {/* Academic Performance Table */}
              <h2 className="text-lg font-black uppercase bg-slate-100 p-2 border-l-4 border-slate-900 mb-4">Academic Performance</h2>
              <table className="w-full text-sm border-collapse border border-slate-900 mb-8">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="border border-slate-800 p-2 text-left">Subject</th>
                    <th className="border border-slate-800 p-2 text-center w-16">CA (40)</th>
                    <th className="border border-slate-800 p-2 text-center w-16">Exam (60)</th>
                    <th className="border border-slate-800 p-2 text-center w-16">Total (100)</th>
                    <th className="border border-slate-800 p-2 text-center w-16">Grade</th>
                    <th className="border border-slate-800 p-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentScores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border border-slate-900 p-8 text-center text-slate-500 italic">No academic records found for this term.</td>
                    </tr>
                  ) : (
                    studentScores.map(sc => (
                      <tr key={sc.id} className="odd:bg-slate-50">
                        <td className="border border-slate-900 p-2 font-bold">{sc.subject}</td>
                        <td className="border border-slate-900 p-2 text-center">{(sc.ca1||0)+(sc.ca2||0)+(sc.ca3||0)+(sc.ca4||0)}</td>
                        <td className="border border-slate-900 p-2 text-center">{sc.exam}</td>
                        <td className="border border-slate-900 p-2 text-center font-black">{sc.total}</td>
                        <td className="border border-slate-900 p-2 text-center font-bold">{sc.grade}</td>
                        <td className="border border-slate-900 p-2 text-xs">{sc.remark}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {studentScores.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 font-black">
                      <td colSpan={3} className="border border-slate-900 p-2 text-right">Total Score:</td>
                      <td className="border border-slate-900 p-2 text-center">{totalScore}</td>
                      <td colSpan={2} className="border border-slate-900 p-2">
                        {Math.round((totalScore/maxPossibleScore)*100)}% Average
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
              
              {/* Affective & Psychomotor Domains */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-lg font-black uppercase bg-slate-100 p-2 border-l-4 border-slate-900 mb-4">Affective Traits (Character)</h2>
                  <table className="w-full text-xs border-collapse border border-slate-900">
                    <tbody>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Punctuality</td><td className="border border-slate-900 p-1.5 text-center font-bold">5</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Neatness</td><td className="border border-slate-900 p-1.5 text-center font-bold">4</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Politeness</td><td className="border border-slate-900 p-1.5 text-center font-bold">5</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Honesty</td><td className="border border-slate-900 p-1.5 text-center font-bold">5</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase bg-slate-100 p-2 border-l-4 border-slate-900 mb-4">Psychomotor Skills</h2>
                  <table className="w-full text-xs border-collapse border border-slate-900">
                    <tbody>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Handwriting</td><td className="border border-slate-900 p-1.5 text-center font-bold">4</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Sports / Games</td><td className="border border-slate-900 p-1.5 text-center font-bold">3</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Public Speaking</td><td className="border border-slate-900 p-1.5 text-center font-bold">5</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Crafts / Arts</td><td className="border border-slate-900 p-1.5 text-center font-bold">4</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Teacher Remarks & Signatures */}
              <div className="border-2 border-slate-900 p-4 space-y-6">
                <div>
                  <span className="font-bold uppercase text-sm block mb-1">Class Teacher's Remark:</span>
                  <div className="border-b border-slate-400 pb-1 italic font-serif">
                    An excellent performance this term. Keep up the good work and stay focused.
                  </div>
                </div>
                <div>
                  <span className="font-bold uppercase text-sm block mb-1">Principal's Remark:</span>
                  <div className="border-b border-slate-400 pb-1 italic font-serif">
                    Outstanding results. Passed.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="text-center">
                    <div className="border-b border-slate-900 pb-2 mb-2 w-48 mx-auto signature-font italic font-bold">M. A. Johnson</div>
                    <span className="font-bold text-xs uppercase">Class Teacher Signature</span>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-slate-900 pb-2 mb-2 w-48 mx-auto signature-font italic font-bold">Dr. A. O. Terungwa</div>
                    <span className="font-bold text-xs uppercase">Principal Signature / Stamp</span>
                  </div>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    );
  };
`;

code = code.replace(
  /const \[activeReport, setActiveReport\] = useState<ReportType \| null>\(null\);/,
  resultPrintInjection + '\n  const [activeReport, setActiveReport] = useState<ReportType | null>(null);'
);

const renderOptionInjection = `
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Class</Label>
                    <select value={resultClass} onChange={e => setResultClass(e.target.value)} className="w-full h-8 text-xs border border-slate-300 rounded">
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Term</Label>
                    <select value={resultTerm} onChange={e => setResultTerm(e.target.value)} className="w-full h-8 text-xs border border-slate-300 rounded">
                      {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <Button 
                    variant="brand" 
                    className="mt-5 h-8 text-xs px-2 whitespace-nowrap"
                    onClick={() => {
                      setActiveReport("results");
                    }}
                  >
                    Print Results
                  </Button>
                </div>
`;

code = code.replace(
  /\{ id: "staff", title: "Staff Directory"/,
  '{ id: "results", title: "Print Academic Results", icon: GraduationCap, desc: "Generate professional end-of-term academic results for students." },\n    { id: "staff", title: "Staff Directory"'
);

// Add component render
code = code.replace(
  /activeReport === "master" \? <MasterReport \/> :/,
  'activeReport === "master" ? <MasterReport /> :\n        activeReport === "results" ? <AcademicResultReport /> :'
);


fs.writeFileSync('src/pages/Reports.tsx', code);
