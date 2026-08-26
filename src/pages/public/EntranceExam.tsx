import React, { useState, useEffect } from "react";
import { useSessions, TERMS } from "../../data/sessionsData";
import { CLASSES, useAdmissionApps } from "../../data/studentsData";
import { useCbtQuestions } from "../../data/cbtQuestions";
import { usePortalSettings } from "../../data/portalSettingsData";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui";
import { Play, ArrowRight, ArrowLeft, CheckCircle2, XCircle, AlertCircle, HelpCircle, Clock } from "lucide-react";

export default function EntranceExam() {
  const [portalSettings] = usePortalSettings();
  const [apps, setApps] = useAdmissionApps();
  const [step, setStep] = useState<"auth" | "intro" | "testing" | "result">("auth");
  const [appId, setAppId] = useState("");
  
  useEffect(() => {
    const savedAppId = localStorage.getItem("ess_latest_app_id");
    if (savedAppId) {
      setAppId(savedAppId);
    }
  }, []);
  const [selectedClass, setSelectedClass] = useState("JSS 1");
  const [sessions, , currentSession] = useSessions();
  const [selectedSession, setSelectedSession] = useState(() => currentSession || "2025/2026");
  const [selectedTerm, setSelectedTerm] = useState(TERMS[0]);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "testing" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && step === "testing") {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  const [errorMsg, setErrorMsg] = useState("");

  const classes = CLASSES;

  const [questionsByClass] = useCbtQuestions();
  const questions = questionsByClass[selectedClass] || questionsByClass["JSS 1"] || [];
  const activeQuestions = questions;


  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.startsWith("APP-")) {
      setErrorMsg("Invalid Application ID. It should start with APP-");
      return;
    }
    
    const appExists = apps.find(a => a.id === appId);
    if (!appExists) {
      setErrorMsg("Application ID not found. Please check and try again.");
      return;
    }
    
    setErrorMsg("");
    setStep("intro");
  };

  const handleStart = () => {
    setStep("testing");
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setScore(0);
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };


  const handleNext = () => {
    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      const confirmSubmit = window.confirm("You have unanswered questions. Are you sure you want to submit?");
      if (!confirmSubmit) return;
    }

    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        calculatedScore += 2; // 2 marks per question
      }
    });
    const percentageScore = questions.length > 0 ? Math.round((calculatedScore / (questions.length * 2)) * 100) : 0;
    setScore(percentageScore);
    
    // Update the applicant's score in the global apps state (as a percentage)
    setApps(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, examScore: percentageScore, examStatus: percentageScore >= 50 ? 'Passed' : 'Failed' } 
        : app
    ));

    setStep("result");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-heading text-slate-900">Entrance Examination Portal</h1>
          <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
            Take the admission CBT entrance exam to qualify for admission into {portalSettings.schoolName}.
          </p>
        </div>

        {step === "auth" && (
          <Card className="max-w-md mx-auto border-0 shadow-xl shadow-brand-900/5">
            <CardHeader className="bg-slate-900 text-white rounded-t-xl text-center">
              <CardTitle>Verify Application</CardTitle>
              <p className="text-xs text-slate-400 mt-1">Enter your Application ID to start</p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAuth} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200 flex items-center gap-2">
                    <AlertCircle size={16} /> {errorMsg}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Application ID</Label>
                  <Input 
                    value={appId} 
                    onChange={e => setAppId(e.target.value)} 
                    placeholder="e.g. APP-2026-001" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Class Applied For</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Academic Session</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                  >
                    {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <Button type="submit" variant="brand" className="w-full mt-2 gap-2">
                  Verify & Proceed <ArrowRight size={16} />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "intro" && (
          <Card className="max-w-2xl mx-auto border-0 shadow-xl shadow-brand-900/5">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
                <HelpCircle size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-heading text-slate-900">Welcome, Applicant ({appId})</h3>
                <p className="text-slate-600 mt-2">
                  You are about to start the Entrance Examination for <strong>{selectedClass}</strong>.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subjects</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">Maths, English, General</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Questions</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{questions.length} Questions</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Marks</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{questions.length * 2} Marks</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass Mark Standard</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">{questions.length} / {questions.length * 2} (50%)</p>
                </div>
              </div>
              <div className="pt-4">
                <Button variant="brand" size="lg" className="w-full gap-2 text-base h-12" onClick={handleStart}>
                  <Play size={20} /> Start Examination Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "testing" && activeQuestions.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">{selectedClass} Entrance Exam</h3>
                <p className="text-sm text-brand-600 font-semibold">{activeQuestions[currentQIndex].subject}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-lg font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                  {formatTime(timeLeft)}
                </span>
                <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-bold text-slate-700">
                  Question {currentQIndex + 1} of {questions.length}
                </div>
              </div>
            </div>
            
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <p className="text-lg font-medium text-slate-900 leading-relaxed">
                  {currentQIndex + 1}. {activeQuestions[currentQIndex].text}
                </p>
                <div className="space-y-3">
                  {activeQuestions[currentQIndex].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQIndex] === opt;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(currentQIndex, opt)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected 
                            ? 'border-brand-500 bg-brand-50 text-brand-900 font-medium shadow-sm' 
                            : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className={`inline-block w-6 h-6 rounded-full text-center text-sm font-bold mr-3 ${
                          isSelected ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex gap-4 w-full sm:w-auto order-2 sm:order-1">
                <Button 
                  variant="outline" 
                  onClick={handlePrev}
                  disabled={currentQIndex === 0}
                  className="flex-1 sm:flex-none"
                >
                  Previous
                </Button>
                {currentQIndex < activeQuestions.length - 1 ? (
                  <Button variant="brand" onClick={handleNext} className="flex-1 sm:flex-none">
                    Next Question
                  </Button>
                ) : (
                  <Button variant="brand" className="bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-none" onClick={handleSubmit}>
                    Submit Exam
                  </Button>
                )}
              </div>
              
              <div className="flex gap-1 overflow-x-auto px-1 hide-scrollbar max-w-full sm:max-w-[40%] order-1 sm:order-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-8 h-8 shrink-0 rounded-full text-xs font-bold transition-colors ${
                      currentQIndex === idx 
                        ? 'bg-brand-600 text-white ring-4 ring-brand-200 ring-offset-1 scale-110'
                        : selectedAnswers[idx] 
                          ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                          : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === "result" && (
          <Card className="max-w-xl mx-auto border-0 shadow-xl shadow-brand-900/5">
            <CardContent className="p-8 text-center space-y-6">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center \${
                score >= 50 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {score >= 50 ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
              </div>
              
              <div>
                <h3 className="text-3xl font-bold font-heading text-slate-900">
                  {score >= 50 ? "Congratulations!" : "Not Admitted"}
                </h3>
                <p className="text-slate-600 mt-2">
                  {score >= 50 
                    ? `You have passed the admission standard for ${portalSettings.schoolName}.`
                    : "Unfortunately, you did not meet the admission standard score of 50."}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Your Score</p>
                <div className="text-5xl font-black font-heading text-slate-900">
                  {score}<span className="text-2xl text-slate-400">/100</span>
                </div>
                <div className={`mt-4 inline-flex px-4 py-1.5 rounded-full text-sm font-bold \${
                  score >= 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {score >= 50 ? 'ADMISSION STATUS: APPROVED' : 'ADMISSION STATUS: REJECTED'}
                </div>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
