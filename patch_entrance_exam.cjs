const fs = require('fs');
let code = fs.readFileSync('src/pages/public/EntranceExam.tsx', 'utf-8');

// Add imports
if (!code.includes('useEntranceExams')) {
  code = code.replace(
    /import \{ CLASSES, useAdmissionApps \} from "\.\.\/\.\.\/data\/studentsData";/,
    'import { CLASSES, useAdmissionApps } from "../../data/studentsData";\nimport { useEntranceExams } from "../../data/entranceExamsData";'
  );
}

// Modify states and add code logic
const stateInjection = `
  const { exams, codes, setCodes } = useEntranceExams();
  const [accessCode, setAccessCode] = useState("");
  const [examMode, setExamMode] = useState<"official" | "practice">("official");
  const [currentCode, setCurrentCode] = useState<any>(null);
`;

if (!code.includes('const { exams, codes, setCodes }')) {
  code = code.replace(
    /const \[appId, setAppId\] = useState\(""\);/,
    'const [appId, setAppId] = useState("");' + stateInjection
  );
}

// Replace handleAuth
const handleAuthReplacement = `
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (examMode === "practice") {
      setStep("intro");
      return;
    }
    
    if (!appId.startsWith("APP-") && !appId.startsWith("EMS/")) {
      setErrorMsg("Invalid Application Number.");
      return;
    }
        
    const appExists = apps.find(a => a.applicationNumber === appId || a.id === appId);
    if (!appExists) {
      setErrorMsg("Application Number not found.");
      return;
    }
    
    const validCode = codes.find(c => c.applicationNumber === appExists.applicationNumber && c.accessCode === accessCode);
    if (!validCode) {
      setErrorMsg("Invalid Access Code for this Application Number.");
      return;
    }
    
    const linkedExam = exams.find(ex => ex.id === validCode.examId);
    if (!linkedExam) {
      setErrorMsg("Examination schedule not found.");
      return;
    }
    
    if (linkedExam.status !== "Active") {
      setErrorMsg("This entrance examination is not currently available. Please contact the school administration.");
      return;
    }
    
    if (validCode.status === "Used" || validCode.status === "Revoked") {
      setErrorMsg("This access code has already been used or revoked.");
      return;
    }
    
    if (validCode.status !== "Activated") {
      setErrorMsg("Your examination access has not been activated by the supervisor. Please ask the supervisor to authorize your access.");
      return;
    }
    
    setCurrentCode(validCode);
    setSelectedClass(linkedExam.classApplied);
    setTimeLeft(linkedExam.duration * 60);
    setErrorMsg("");
    setStep("intro");
  };
`;

code = code.replace(/const handleAuth = \([\s\S]*?setStep\("intro"\);\n  };/, handleAuthReplacement);

// Fix handleSubmit to mark code as used
const submitRegex = /const percentageScore =[\s\S]*?setStep\("result"\);\n  };/;
const submitReplacement = `
    const percentageScore = questions.length > 0 ? Math.round((calculatedScore / (questions.length * 2)) * 100) : 0;
    setScore(percentageScore);
       
    if (examMode === "official" && currentCode) {
      setApps(prev => prev.map(app => 
        (app.applicationNumber === currentCode.applicationNumber || app.id === currentCode.applicationNumber)
          ? { ...app, examScore: percentageScore, examStatus: percentageScore >= 50 ? 'Passed' : 'Failed' }
          : app
      ));
      
      setCodes(prev => prev.map(c => 
        c.id === currentCode.id 
          ? { ...c, status: "Used", attemptStatus: "Completed", score: percentageScore, attemptSubmitTime: new Date().toISOString() }
          : c
      ));
    }
    
    setStep("result");
  };
`;
code = code.replace(submitRegex, submitReplacement);

// Fix UI in step auth
const authUIRegex = /<CardContent className="p-8">[\s\S]*?<\/CardContent>/;
const authUIReplacement = `
<CardContent className="p-8">
              <form onSubmit={handleAuth} className="space-y-6">
                
                <div className="flex gap-4 p-1 bg-slate-100 rounded-lg mb-6">
                  <button type="button" onClick={() => setExamMode("official")} className={\`flex-1 py-2 text-sm font-bold rounded-md transition-all \${examMode === "official" ? "bg-white shadow-sm text-brand-700" : "text-slate-500 hover:text-slate-700"}\`}>
                    Official CBT
                  </button>
                  <button type="button" onClick={() => setExamMode("practice")} className={\`flex-1 py-2 text-sm font-bold rounded-md transition-all \${examMode === "practice" ? "bg-white shadow-sm text-brand-700" : "text-slate-500 hover:text-slate-700"}\`}>
                    Practice Mode
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appId" className="text-slate-700 font-bold">Application Number</Label>
                  <Input 
                    id="appId" 
                    placeholder="e.g. APP-2026-001 or EMS/2026/000125" 
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    required
                    className="h-12 bg-slate-50"
                  />
                </div>
                
                {examMode === "official" && (
                  <div className="space-y-2">
                    <Label htmlFor="accessCode" className="text-slate-700 font-bold">Examination Access Code</Label>
                    <Input 
                      id="accessCode" 
                      placeholder="e.g. X7K9-P2LM" 
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      required
                      className="h-12 bg-slate-50 uppercase tracking-widest font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-2">This code is provided on your exam slip and must be activated by the supervisor.</p>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm flex gap-3 rounded-r-lg">
                    <AlertCircle size={20} className="shrink-0" />
                    <p>{errorMsg}</p>
                  </div>
                )}
                
                <Button type="submit" variant="brand" className="w-full h-12 text-base font-bold flex items-center justify-center gap-2">
                  {examMode === "practice" ? "Start Practice Exam" : "Verify & Access CBT"} <ArrowRight size={18} />
                </Button>
              </form>
            </CardContent>
`;

code = code.replace(authUIRegex, authUIReplacement);

fs.writeFileSync('src/pages/public/EntranceExam.tsx', code);
