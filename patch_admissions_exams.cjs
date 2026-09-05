const fs = require('fs');
let code = fs.readFileSync('src/pages/AdmissionsManagement.tsx', 'utf-8');

// Add import for useEntranceExams
if (!code.includes('useEntranceExams')) {
  code = code.replace(
    /import \{ useCbtQuestions \} from "\.\.\/data\/cbtQuestions";/,
    'import { useCbtQuestions } from "../data/cbtQuestions";\nimport { useEntranceExams, generateAccessCode } from "../data/entranceExamsData";'
  );
}

// Add state for Entrance Exams
const stateInjection = `
  const { exams, setExams, codes, setCodes } = useEntranceExams();
  const [showExamForm, setShowExamForm] = useState(false);
  const [examForm, setExamForm] = useState({
    session: sessions[1] || "",
    classApplied: CLASSES[0] || "",
    date: "",
    startTime: "09:00",
    endTime: "11:00",
    duration: 120,
    venue: "School ICT Hall",
    maxCandidates: 50,
  });
  
  const handleScheduleExam = (e) => {
    e.preventDefault();
    const newExam = {
      id: "ENT-" + Date.now(),
      ...examForm,
      status: "Scheduled"
    };
    setExams([...exams, newExam]);
    setShowExamForm(false);
    setToastMsg("Entrance Examination scheduled successfully!");
    setTimeout(() => setToastMsg(""), 3000);
  };
  
  const handleAssignCandidates = (examId, targetClass) => {
    // Find applicants for this class who don't have a code yet
    const eligibleApps = apps.filter(a => a.status === 'Approved' && a.classApplied === targetClass);
    
    let generated = 0;
    const newCodes = [...codes];
    
    for (const app of eligibleApps) {
      if (!newCodes.find(c => c.applicationNumber === app.applicationNumber)) {
        newCodes.push({
          id: "CODE-" + Date.now() + Math.floor(Math.random() * 1000),
          examId,
          applicationNumber: app.applicationNumber,
          accessCode: generateAccessCode(),
          status: "Unused"
        });
        generated++;
      }
    }
    
    if (generated > 0) {
      setCodes(newCodes);
      setToastMsg(\`\${generated} candidates assigned and codes generated!\`);
    } else {
      setToastMsg("No new eligible approved candidates found for this class.");
    }
    setTimeout(() => setToastMsg(""), 3000);
  };
  
  const getExamCandidatesCount = (examId) => {
    return codes.filter(c => c.examId === examId).length;
  };
`;

if (!code.includes('const { exams, setExams, codes, setCodes } = useEntranceExams();')) {
  code = code.replace(
    /const \[cbtClass, setCbtClass\] = useState\(CLASSES\[0\]\);/,
    stateInjection + '\n  const [cbtClass, setCbtClass] = useState(CLASSES[0]);'
  );
}

const renderInjection = `
          {/* Entrance Examination Scheduling & Candidate Management */}
          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="text-brand-600" size={18} /> Entrance Examination Scheduling
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">Schedule exams, assign candidates, and generate access codes.</p>
                </div>
                <Button size="sm" onClick={() => setShowExamForm(!showExamForm)} variant="brand" className="gap-2 text-xs">
                  {showExamForm ? "Cancel" : "+ Schedule New Exam"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {showExamForm && (
                <form onSubmit={handleScheduleExam} className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 mb-2">Schedule New Examination</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 text-left">
                      <Label className="text-xs">Academic Session</Label>
                      <select required value={examForm.session} onChange={(e) => setExamForm({...examForm, session: e.target.value})} className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs">
                        {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1 text-left">
                      <Label className="text-xs">Class Applied For</Label>
                      <select required value={examForm.classApplied} onChange={(e) => setExamForm({...examForm, classApplied: e.target.value})} className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs">
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1 text-left">
                      <Label className="text-xs">Date</Label>
                      <Input required type="date" value={examForm.date} onChange={(e) => setExamForm({...examForm, date: e.target.value})} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1 text-left">
                      <Label className="text-xs">Start Time</Label>
                      <Input required type="time" value={examForm.startTime} onChange={(e) => setExamForm({...examForm, startTime: e.target.value})} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1 text-left">
                      <Label className="text-xs">Duration (Minutes)</Label>
                      <Input required type="number" min="10" value={examForm.duration} onChange={(e) => setExamForm({...examForm, duration: parseInt(e.target.value)})} className="h-9 text-xs" />
                    </div>
                    <div className="space-y-1 text-left">
                      <Label className="text-xs">Venue</Label>
                      <Input required type="text" value={examForm.venue} onChange={(e) => setExamForm({...examForm, venue: e.target.value})} className="h-9 text-xs" />
                    </div>
                  </div>
                  <Button type="submit" variant="brand" className="w-full text-sm font-bold">Save Examination Schedule</Button>
                </form>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-500 uppercase text-xs font-semibold">
                    <tr>
                      <th className="p-3">Session & Class</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Venue & Duration</th>
                      <th className="p-3">Candidates</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exams.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500">No entrance examinations scheduled.</td></tr>
                    ) : exams.map(exam => (
                      <tr key={exam.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{exam.classApplied}</div>
                          <div className="text-xs text-slate-500">{exam.session}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{exam.date}</div>
                          <div className="text-xs text-slate-500">{exam.startTime}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{exam.venue}</div>
                          <div className="text-xs text-slate-500">{exam.duration} mins</div>
                        </td>
                        <td className="p-3 font-medium text-brand-600">
                          {getExamCandidatesCount(exam.id)} Assigned
                        </td>
                        <td className="p-3">
                          <span className={\`px-2 py-1 text-[10px] font-bold rounded-full \${
                            exam.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                            exam.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }\`}>
                            {exam.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => handleAssignCandidates(exam.id, exam.classApplied)} className="text-[10px] h-7 px-2">
                            Assign Candidates & Gen Codes
                          </Button>
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
  renderInjection + '\n\n          {/* CBT Management Card */}'
);

fs.writeFileSync('src/pages/AdmissionsManagement.tsx', code);
