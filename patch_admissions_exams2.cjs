const fs = require('fs');
let code = fs.readFileSync('src/pages/AdmissionsManagement.tsx', 'utf-8');

const regex = /<td className="p-3 text-right">[\s\S]*?<\/td>/g;
let matchCount = 0;
code = code.replace(regex, (match) => {
  matchCount++;
  // We only want to replace the Actions column for the Exams table
  // Since we injected the table, it's the only one with "Assign Candidates & Gen Codes"
  if (match.includes('handleAssignCandidates')) {
    return `<td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            {exam.status === 'Scheduled' && (
                              <Button size="sm" variant="brand" onClick={() => {
                                setExams(exams.map(e => e.id === exam.id ? {...e, status: 'Active'} : e));
                                setToastMsg("Examination activated successfully!");
                                setTimeout(() => setToastMsg(""), 3000);
                              }} className="text-[10px] h-7 px-2">
                                Activate Exam
                              </Button>
                            )}
                            {exam.status === 'Active' && (
                              <Button size="sm" variant="outline" onClick={() => {
                                setExams(exams.map(e => e.id === exam.id ? {...e, status: 'Completed'} : e));
                                setToastMsg("Examination marked as completed.");
                                setTimeout(() => setToastMsg(""), 3000);
                              }} className="text-[10px] h-7 px-2 border-slate-300 text-slate-700">
                                End Exam
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleAssignCandidates(exam.id, exam.classApplied)} className="text-[10px] h-7 px-2">
                              Assign Candidates & Gen Codes
                            </Button>
                          </div>
                        </td>`;
  }
  return match;
});

// Add Supervisor Activation Table
const supervisorInjection = `
          {/* Supervisor Candidate Authorization Table */}
          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={18} /> Candidate Verification & Authorization
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">Verify candidates on arrival and activate their CBT access codes.</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-500 uppercase text-xs font-semibold">
                    <tr>
                      <th className="p-3">Candidate App No.</th>
                      <th className="p-3">Exam ID</th>
                      <th className="p-3">Access Code</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {codes.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No candidates assigned to examinations yet.</td></tr>
                    ) : codes.map(code => (
                      <tr key={code.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-slate-900">{code.applicationNumber}</td>
                        <td className="p-3 text-slate-600">{code.examId}</td>
                        <td className="p-3 font-mono font-bold tracking-wider">{code.accessCode}</td>
                        <td className="p-3">
                          <span className={\`px-2 py-1 text-[10px] font-bold rounded-full \${
                            code.status === 'Activated' ? 'bg-emerald-100 text-emerald-700' :
                            code.status === 'Used' ? 'bg-slate-200 text-slate-500' :
                            'bg-amber-100 text-amber-700'
                          }\`}>
                            {code.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {code.status === 'Unused' && (
                            <Button size="sm" variant="brand" onClick={() => {
                              const examLinked = exams.find(e => e.id === code.examId);
                              if (examLinked?.status !== 'Active') {
                                setToastMsg("Cannot activate code: the examination is not currently Active.");
                                setTimeout(() => setToastMsg(""), 3000);
                                return;
                              }
                              setCodes(codes.map(c => c.id === code.id ? {...c, status: 'Activated', activatedAt: new Date().toISOString()} : c));
                              setToastMsg("Access code activated successfully! Candidate can now start the exam.");
                              setTimeout(() => setToastMsg(""), 3000);
                            }} className="text-[10px] h-7 px-3">
                              Verify & Activate Code
                            </Button>
                          )}
                          {code.status === 'Activated' && (
                            <span className="text-xs text-emerald-600 font-bold flex justify-end items-center gap-1">
                              <CheckCircle2 size={14} /> Ready for Candidate
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
`;

code = code.replace(
  /\{\/\* CBT Management Card \*\/\}/,
  supervisorInjection + '\n\n          {/* CBT Management Card */}'
);


fs.writeFileSync('src/pages/AdmissionsManagement.tsx', code);
