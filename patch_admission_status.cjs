const fs = require('fs');
let code = fs.readFileSync('src/pages/public/AdmissionStatus.tsx', 'utf-8');

// Add import for exams
if (!code.includes('useEntranceExams')) {
  code = code.replace(
    /import \{ usePortalSettings \} from "\.\.\/\.\.\/data\/portalSettingsData";/,
    'import { usePortalSettings } from "../../data/portalSettingsData";\nimport { useEntranceExams } from "../../data/entranceExamsData";'
  );
}

if (!code.includes('const { exams, codes } = useEntranceExams();')) {
  code = code.replace(
    /const \[apps\] = useAdmissionApps\(\);/,
    'const [apps] = useAdmissionApps();\n  const { exams, codes } = useEntranceExams();'
  );
}

// Add Exam Slip to rendering
const slipInjection = `
              {searchedApp.status === 'Approved' && searchedApp.examStatus !== 'Passed' && searchedApp.examStatus !== 'Failed' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-6 print:hidden">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-950">Entrance Examination Scheduled</h4>
                      <p className="text-sm text-amber-800/80 mt-1">Your admission application has been approved. You are now required to take the entrance examination.</p>
                      
                      {(() => {
                        const codeEntry = codes.find(c => c.applicationNumber === searchedApp.applicationNumber || c.applicationNumber === searchedApp.id);
                        if (codeEntry) {
                          const examDetails = exams.find(e => e.id === codeEntry.examId);
                          return (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200 shadow-sm space-y-3">
                              <div className="flex flex-wrap gap-4 text-sm">
                                <div><span className="text-slate-500 font-medium">Date:</span> <span className="font-bold text-slate-900">{examDetails?.date}</span></div>
                                <div><span className="text-slate-500 font-medium">Time:</span> <span className="font-bold text-slate-900">{examDetails?.startTime}</span></div>
                                <div><span className="text-slate-500 font-medium">Venue:</span> <span className="font-bold text-slate-900">{examDetails?.venue}</span></div>
                              </div>
                              <div className="pt-2 border-t border-amber-100 flex items-center gap-3">
                                <span className="text-sm text-slate-500 font-medium">Your Exam Access Code:</span>
                                <span className="font-mono font-bold text-lg tracking-widest text-brand-600">{codeEntry.accessCode}</span>
                              </div>
                              <p className="text-xs text-rose-600 font-bold">This code will be activated by the supervisor on the examination day. Do not share it.</p>
                              
                              {/* Printable Slip that will only show when printing this specific section */}
                              <Button 
                                variant="brand" 
                                className="mt-2 w-full text-sm font-bold gap-2" 
                                onClick={() => {
                                  // Very simple way to print just this: hide everything else using CSS during print
                                  document.body.classList.add('print-slip-mode');
                                  window.print();
                                  setTimeout(() => document.body.classList.remove('print-slip-mode'), 500);
                                }}
                              >
                                <Printer size={16} /> Print Examination Slip
                              </Button>
                              
                              <div id="exam-slip" className="hidden print:block fixed top-0 left-0 w-full h-full bg-white z-[9999] p-10">
                                <div className="max-w-2xl mx-auto border-2 border-slate-900 p-8">
                                  <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
                                    <h1 className="text-2xl font-black font-heading uppercase tracking-widest">{portalSettings.schoolName}</h1>
                                    <p className="text-slate-700 font-serif">{portalSettings.schoolAddress}</p>
                                    <p className="text-slate-700 font-serif">{portalSettings.schoolContactPhone}</p>
                                    <h2 className="text-xl font-bold mt-4 bg-slate-900 text-white inline-block px-4 py-1 uppercase">Official Entrance Examination Slip</h2>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                                    <div>
                                      <p className="text-slate-500 font-bold uppercase mb-1">Candidate Name</p>
                                      <p className="font-bold text-lg">{searchedApp.name}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-slate-500 font-bold uppercase mb-1">Application Number</p>
                                      <p className="font-bold text-lg font-mono">{searchedApp.applicationNumber || searchedApp.id}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500 font-bold uppercase mb-1">Class Applied For</p>
                                      <p className="font-bold text-lg">{searchedApp.classApplied}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-slate-500 font-bold uppercase mb-1">Examination Session</p>
                                      <p className="font-bold text-lg">{examDetails?.session}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-slate-50 border border-slate-300 p-6 mb-8">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div><span className="font-bold text-slate-500 uppercase block mb-1">Date</span> <span className="font-bold text-lg">{examDetails?.date}</span></div>
                                      <div><span className="font-bold text-slate-500 uppercase block mb-1">Time</span> <span className="font-bold text-lg">{examDetails?.startTime}</span></div>
                                      <div className="col-span-2"><span className="font-bold text-slate-500 uppercase block mb-1">Venue</span> <span className="font-bold text-lg">{examDetails?.venue}</span></div>
                                    </div>
                                  </div>
                                  
                                  <div className="text-center mb-8">
                                    <p className="text-slate-500 font-bold uppercase mb-2">Examination Access Code</p>
                                    <div className="font-mono text-3xl font-black tracking-[0.2em] border-2 border-dashed border-slate-400 py-3 bg-slate-50">
                                      {codeEntry.accessCode}
                                    </div>
                                  </div>
                                  
                                  <div className="border-t border-slate-300 pt-6">
                                    <h3 className="font-bold uppercase text-slate-900 mb-2">Important Instructions:</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700 font-medium">
                                      <li>This examination must be taken at the school on the scheduled date and time.</li>
                                      <li>Present this slip to the examination supervisor upon arrival.</li>
                                      <li>Your access code is strictly confidential. Do not share it.</li>
                                      <li>The supervisor will activate your code to allow you to start the CBT.</li>
                                      <li>Any attempt to cheat or bypass the examination system will lead to automatic disqualification.</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <p className="text-sm font-bold text-rose-600 mt-4">
                              Your examination schedule is being processed. Please check back later or contact the administration.
                            </p>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}
`;

code = code.replace(
  /\{searchedApp\.status === 'Pending' && \(/,
  slipInjection + '\n\n              {searchedApp.status === \'Pending\' && ('
);

fs.writeFileSync('src/pages/public/AdmissionStatus.tsx', code);
