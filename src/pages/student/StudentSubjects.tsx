import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Label } from "@/src/components/ui";
import { useCbtQuestions } from "../../data/cbtQuestions";
import { StudentReportCard } from "../../components/StudentReportCard";
import { 
  BookOpen, Clock, Download, PlayCircle, Edit3, CheckCircle2, Award, 
  FileText, UploadCloud, X, AlertTriangle, Lock, Paperclip, FileUp, 
  FileCheck, Trash2, Eye, Sparkles, Check
} from "lucide-react";

import { useAssignments } from "../../data/assignmentsData";
import { useExams } from "../../data/examsData";

import { isResultReleased, useResultsRelease } from "../../data/resultsReleaseData";
import { usePortalSettings } from "../../data/portalSettingsData";
import { useSessions } from "../../data/sessionsData";
import { useStudents } from "../../data/studentsData";

export default function StudentSubjects() {
  const [activeTab, setActiveTab] = useState("subjects");

  const { assignments, submissions, setSubmissions } = useAssignments();
  const { exams } = useExams();
  const [submissionText, setSubmissionText] = useState("");
  const [activeSubmittingAss, setActiveSubmittingAss] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<{ name: string; size: string; type: string; dataUrl: string } | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<string>("");
  const assDocInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("File size exceeds 15MB limit.");
      return;
    }
    setUploadError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const sizeStr = file.size < 1024 * 1024 
        ? `${(file.size / 1024).toFixed(1)} KB` 
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      setUploadedDoc({
        name: file.name,
        size: sizeStr,
        type: file.type || "application/octet-stream",
        dataUrl: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleTextSubmit = (assId: string) => {
    if (!submissionText.trim() && !uploadedDoc) {
      setUploadError("Please provide an answer text or upload a document before submitting.");
      return;
    }
    const newSub = {
      id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
      assignmentId: assId,
      studentId: currentStudent?.id || "ESS/2026/001",
      studentName: currentStudent?.name || "Student",
      studentClass: currentStudent?.class || "SSS 3A",
      content: submissionText.trim() || (uploadedDoc ? `Attached document: ${uploadedDoc.name}` : ""),
      submittedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      grade: null,
      feedback: "",
      status: "Pending Review" as const,
      maxMarks: 100,
      documentName: uploadedDoc?.name,
      documentUrl: uploadedDoc?.dataUrl,
      documentSize: uploadedDoc?.size,
      documentType: uploadedDoc?.type
    };
    setSubmissions([newSub, ...submissions]);
    setSubmissionText("");
    setUploadedDoc(null);
    setUploadError("");
    setActiveSubmittingAss(null);
    setSubmitSuccess("Assignment submitted successfully to your teacher!");
    setTimeout(() => setSubmitSuccess(""), 4000);
  };

  const [subjects, setSubjects] = useState<any[]>([]);
  const [inLiveClass, setInLiveClass] = useState(false);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
  const [examActive, setExamActive] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [sessions] = useSessions();
  const [resSession, setResSession] = useState(sessions[1] || "2025/2026");
  const [resTerm, setResTerm] = useState("First Term");
  const [releaseError, setReleaseError] = useState("");
  const [students] = useStudents();
  const [releaseMap] = useResultsRelease();
  const [portalSettings] = usePortalSettings();
  const [cbtQIndex, setCbtQIndex] = useState(0);
  const [cbtAnswers, setCbtAnswers] = useState<Record<number, string>>({});
  const [cbtQuestions] = useCbtQuestions();
  const [activeCbtExam, setActiveCbtExam] = useState<any>(null);
  
  const loggedInId = localStorage.getItem('loggedInStudentId');
  const currentStudent = students.find(s => s.id === loggedInId || s.name.toLowerCase().includes((loggedInId || '').toLowerCase()));
  const studentClass = currentStudent ? currentStudent.class.substring(0, 5) : "JSS 1"; // e.g. "SSS 3A" -> "SSS 3", "JSS 1A" -> "JSS 1"
  const activeQuestions = activeCbtExam ? activeCbtExam.questions : (cbtQuestions[studentClass] || cbtQuestions["JSS 1"] || []);



  const handleCbtNext = () => {
    if (cbtQIndex < activeQuestions.length - 1) {
      setCbtQIndex(prev => prev + 1);
    }
  };

  const handleCbtPrev = () => {
    if (cbtQIndex > 0) {
      setCbtQIndex(prev => prev - 1);
    }
  };

  const handleViewResult = () => {
    const loggedInId = localStorage.getItem('loggedInStudentId');
    const currentStudent = students.find(s => s.id === loggedInId || s.name.toLowerCase().includes((loggedInId || '').toLowerCase())) || students[0];
    const studentClass = currentStudent ? currentStudent.class : "SSS 3A";

    const released = isResultReleased(resSession, resTerm, studentClass);

    if (!released) {
      setReleaseError(`Results for ${resSession} - ${resTerm} (${studentClass}) have not been officially released by the school management yet. Please check back later.`);
      setResultVisible(false);
    } else {
      setReleaseError("");
      setResultVisible(true);
    }
  };
  const [registered, setRegistered] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableSubjects = [
    { name: "Mathematics", teacher: "Mr. Akpan", type: "Core" },
    { name: "English Language", teacher: "Mrs. Nwachukwu", type: "Core" },
    { name: "Physics", teacher: "Dr. Ojo", type: "Science" },
    { name: "Chemistry", teacher: "Mr. Adeleke", type: "Science" },
    { name: "Biology", teacher: "Miss. Chinda", type: "Science" },
    { name: "Economics", teacher: "Mr. Bamidele", type: "Commercial" },
    { name: "Further Mathematics", teacher: "Mr. Akpan", type: "Science" },
    { name: "Agricultural Science", teacher: "Mrs. Okon", type: "Science" },
    { name: "Geography", teacher: "Mr. Bamidele", type: "Art" }
  ];

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const selected: any[] = [];
    availableSubjects.forEach((sub, idx) => {
      const checkbox = form.elements.namedItem(`reg-${idx}`) as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        selected.push(sub);
      }
    });
    setSubjects(selected.length > 0 ? selected : availableSubjects.slice(0, 5));
    setRegistered(true);
    setActiveTab("subjects");
  };

  const handleAssignmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTimeout(() => setAssignmentSubmitted(true), 1000);
    }
  };

  if (inLiveClass) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="text-white font-bold flex items-center gap-2">
            <span className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></span>
            Live: Physics - Thermodynamics
          </div>
          <Button variant="outline" className="bg-rose-500 hover:bg-rose-600 text-white border-0" onClick={() => setInLiveClass(false)}>
            Leave Class
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center relative">
          <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative">
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <PlayCircle size={64} className="mx-auto mb-4 opacity-50" />
                <p>Teacher's Screen Sharing</p>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 w-48 aspect-video bg-slate-800 rounded-lg border-2 border-slate-700 overflow-hidden flex items-center justify-center text-slate-500">
               Your Camera
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (examActive && activeQuestions.length > 0) {
    const q = activeQuestions[cbtQIndex];
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-lg text-slate-900">{activeCbtExam?.title || "First Term Examinations"}</h2>
            <p className="text-sm font-semibold text-brand-600">{activeCbtExam?.subject || q.subject}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-lg font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
              89:59
            </span>
            <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-bold text-slate-700 hidden sm:block">
              Question {cbtQIndex + 1} of {activeQuestions.length}
            </div>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto p-6 space-y-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <p className="font-medium text-slate-900 mb-4 text-lg">
                {cbtQIndex + 1}. {q.text}
              </p>
              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  const isSelected = cbtAnswers[q.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => setCbtAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'border-brand-500 bg-brand-50 text-brand-900 font-medium shadow-sm' 
                          : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`inline-block w-6 h-6 rounded-full text-center text-sm font-bold mr-3 ${
                        isSelected ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + i)}
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
                onClick={handleCbtPrev}
                disabled={cbtQIndex === 0}
                className="flex-1 sm:flex-none"
              >
                Previous
              </Button>
              {cbtQIndex < activeQuestions.length - 1 ? (
                <Button variant="brand" onClick={handleCbtNext} className="flex-1 sm:flex-none">
                  Next Question
                </Button>
              ) : (
                <Button variant="brand" className="bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-none" onClick={() => { setExamActive(false); setExamSubmitted(true); setCbtQIndex(0); }}>
                  Submit Exam
                </Button>
              )}
            </div>
            
            <div className="flex gap-1 overflow-x-auto px-1 hide-scrollbar max-w-full sm:max-w-[40%] order-1 sm:order-2">
              {activeQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCbtQIndex(idx)}
                  className={`w-8 h-8 shrink-0 rounded-full text-xs font-bold transition-colors ${
                    cbtQIndex === idx 
                      ? 'bg-brand-600 text-white ring-4 ring-brand-200 ring-offset-1 scale-110'
                      : cbtAnswers[activeQuestions[idx].id] 
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">My Subjects & CBT</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your subjects, curriculum, online classes and results.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto space-x-2 pb-2">
        {["subjects", "registration", "curriculum", "classes", "cbt", "results"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab === "subjects" && "My Subjects"}
            {tab === "registration" && "Subject Registration"}
            {tab === "curriculum" && "Curriculum"}
            {tab === "classes" && "Online Classes & Assignments"}
            {tab === "cbt" && "CBT Examination"}
            {tab === "results" && "My Results"}
          </button>
        ))}
      </div>

      {activeTab === "subjects" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Currently Enrolled Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {!registered ? (
              <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <BookOpen size={32} className="mx-auto mb-3 text-slate-400" />
                <h3 className="font-bold text-slate-700">No Subjects Registered</h3>
                <p className="text-sm text-slate-500 mb-4">You have not registered for any subjects for this term.</p>
                <Button onClick={() => setActiveTab("registration")} variant="brand">Go to Registration</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((sub, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl hover:border-brand-300 transition-colors bg-white">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                      <BookOpen size={20} />
                    </div>
                    <h3 className="font-bold text-slate-900">{sub.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">Teacher: {sub.teacher}</p>
                    <span className="inline-block mt-3 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md uppercase tracking-wide">
                      {sub.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "registration" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Subject Registration</CardTitle>
          </CardHeader>
          <CardContent>
            {registered ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-4">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                <h3 className="font-bold text-emerald-900">Registration Successful</h3>
                <p className="text-sm text-emerald-700">You have already registered your subjects for the current term.</p>
                <Button variant="outline" onClick={() => setRegistered(false)}>Edit Registration</Button>
              </div>
            ) : (
              <form onSubmit={handleRegistration}>
                <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl mb-6">
                  <p className="text-sm font-semibold text-brand-900">2026/2027 Session - First Term Registration Open</p>
                  <p className="text-xs text-brand-700 mt-1">Please select the subjects you will be offering this term. Core subjects are selected by default.</p>
                </div>
                <div className="space-y-3">
                  {availableSubjects.map((sub, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                      <input 
                        type="checkbox" 
                        name={`reg-${idx}`} 
                        id={`reg-${idx}`} 
                        className="w-4 h-4 text-brand-600 rounded" 
                        defaultChecked={idx < 6} 
                        disabled={idx < 2} 
                      />
                      <Label htmlFor={`reg-${idx}`} className="flex-1 cursor-pointer font-medium text-slate-700">{sub.name} ({sub.type})</Label>
                    </div>
                  ))}
                </div>
                <Button type="submit" variant="brand" className="mt-6">Submit Course Registration</Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "curriculum" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Term Curriculum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(subjects.length > 0 ? subjects : availableSubjects.slice(0, 5)).map((sub, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2"><FileText size={18} className="text-brand-500" /> {sub.name}</h3>
                    <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Download PDF</Button>
                  </div>
                  <div className="text-sm text-slate-600 space-y-2 pl-6 border-l-2 border-brand-100">
                    <p><span className="font-semibold text-slate-800">Week 1-2:</span> Introduction & Basic Concepts</p>
                    <p><span className="font-semibold text-slate-800">Week 3-4:</span> Intermediate Applications and Practical Setup</p>
                    <p><span className="font-semibold text-slate-800">Week 5-6:</span> Mid-Term Assessments & Review</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "classes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Online Classes (Live)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Physics - Thermodynamics</h3>
                    <p className="text-sm text-slate-500">Live now with Dr. Ojo</p>
                  </div>
                  <Button variant="brand" className="bg-rose-500 hover:bg-rose-600 text-white border-0 gap-2" onClick={() => setInLiveClass(true)}>
                    <PlayCircle size={16} /> Join Live
                  </Button>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between opacity-75">
                  <div>
                    <h3 className="font-bold text-slate-900">Mathematics - Calculus</h3>
                    <p className="text-sm text-slate-500">Starts at 2:00 PM</p>
                  </div>
                  <Button variant="outline" disabled>Waiting...</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} /> My Assignments & Tasks
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">Review assignments given by teachers and upload your homework documents</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                {assignments.filter(a => a.targetClass === currentStudent?.class || a.targetClass === "All Classes").length} Assigned
              </span>
            </CardHeader>
            <CardContent className="p-6">
              {submitSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  {submitSuccess}
                </div>
              )}

              <div className="space-y-6">
                {assignments.filter(a => a.targetClass === currentStudent?.class || a.targetClass === "All Classes").length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <FileText className="mx-auto text-slate-300 mb-2" size={36} />
                    <p className="text-slate-600 font-medium text-sm">No assignments right now</p>
                    <p className="text-slate-400 text-xs mt-1">Assignments issued by your teachers for {currentStudent?.class || "your class"} will show here.</p>
                  </div>
                ) : (
                  assignments.filter(a => a.targetClass === currentStudent?.class || a.targetClass === "All Classes").map(ass => {
                    const submission = submissions.find(s => s.assignmentId === ass.id && s.studentId === currentStudent?.id);
                    const isSubmitting = activeSubmittingAss === ass.id;

                    return (
                      <div key={ass.id} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:border-blue-300 transition-all space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                                {ass.subject}
                              </span>
                              <span className="text-xs font-medium text-slate-500">
                                Target: <strong>{ass.targetClass}</strong>
                              </span>
                              {ass.teacherName && (
                                <span className="text-xs text-slate-400">
                                  &bull; Teacher: <strong className="text-slate-600">{ass.teacherName}</strong>
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">{ass.title}</h3>
                          </div>
                          
                          <div className="shrink-0">
                            {submission ? (
                              submission.status === "Graded" ? (
                                <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-black rounded-full uppercase flex items-center gap-1.5 border border-emerald-200">
                                  <CheckCircle2 size={13} className="text-emerald-600" /> Graded &bull; {submission.grade}/{submission.maxMarks || 100}
                                </span>
                              ) : (
                                <span className="text-xs px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full uppercase flex items-center gap-1.5 border border-amber-200">
                                  <Clock size={13} className="text-amber-600" /> Submitted (Pending Review)
                                </span>
                              )
                            ) : (
                              <span className="text-xs px-3 py-1 bg-rose-50 text-rose-700 font-bold rounded-full uppercase border border-rose-200 flex items-center gap-1">
                                <Clock size={13} /> Due: {ass.dueDate}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {ass.description}
                        </div>
                        
                        {/* If student has submitted, show their submission details */}
                        {submission ? (
                          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 rounded-xl border border-slate-200/80 space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/60 pb-2">
                              <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                <FileCheck size={14} className="text-blue-600" /> Your Submitted Work
                              </span>
                              <span>Submitted on: <strong className="text-slate-700">{submission.submittedAt}</strong></span>
                            </div>

                            {submission.content && (
                              <p className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200/60">
                                {submission.content}
                              </p>
                            )}

                            {/* Attached document by student */}
                            {submission.documentName && (
                              <div className="p-3 bg-white border border-blue-200 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                    <Paperclip size={18} />
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-slate-900 truncate">{submission.documentName}</p>
                                    <p className="text-[11px] text-slate-500">{submission.documentSize || "Document file"}</p>
                                  </div>
                                </div>
                                {submission.documentUrl ? (
                                  <a 
                                    href={submission.documentUrl} 
                                    download={submission.documentName} 
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                                  >
                                    <Download size={13} /> Download Document
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Attached</span>
                                )}
                              </div>
                            )}

                            {/* Teacher Grade & Feedback Review */}
                            {submission.status === "Graded" && (
                              <div className="mt-3 p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                                    <Award size={16} className="text-emerald-600" /> Teacher's Grade & Mark
                                  </span>
                                  <span className="text-xl font-black text-emerald-700">
                                    {submission.grade} <span className="text-xs font-bold text-emerald-600">/ {submission.maxMarks || 100}</span>
                                  </span>
                                </div>
                                {submission.feedback && (
                                  <div className="pt-2 border-t border-emerald-200/60 text-xs text-emerald-900">
                                    <span className="font-bold text-emerald-800">Teacher's Feedback: </span>
                                    <span className="italic">{submission.feedback}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Submission Form */
                          isSubmitting ? (
                            <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                  <FileUp size={16} className="text-blue-600" /> Submit Assignment Response
                                </Label>
                                <span className="text-xs text-slate-400">Upload document, type solution, or both</span>
                              </div>

                              {uploadError && (
                                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium flex items-center gap-2">
                                  <AlertTriangle size={14} className="shrink-0" /> {uploadError}
                                </div>
                              )}

                              {/* DOCUMENT UPLOAD DROPZONE */}
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-700">1. Upload Document / File (Optional or Required)</Label>
                                
                                <input 
                                  ref={assDocInputRef}
                                  type="file" 
                                  className="hidden" 
                                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip,.xlsx,.csv"
                                  onChange={handleDocumentSelect}
                                />

                                {uploadedDoc ? (
                                  <div className="p-3.5 bg-blue-50/80 border-2 border-blue-300 rounded-xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                      <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                        <Paperclip size={18} />
                                      </div>
                                      <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-slate-900 truncate">{uploadedDoc.name}</p>
                                        <p className="text-[11px] text-blue-700 font-medium">{uploadedDoc.size} &bull; Ready to submit</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <button 
                                        type="button" 
                                        onClick={() => {
                                          setUploadedDoc(null);
                                          if (assDocInputRef.current) assDocInputRef.current.value = "";
                                        }}
                                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                        title="Remove file"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    onClick={() => assDocInputRef.current?.click()}
                                    className="p-5 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl text-center cursor-pointer transition-all space-y-1.5"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                                      <UploadCloud size={20} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-800">
                                      Click to Browse Document from your Phone or Computer
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      Supports PDF, Word (.docx), TXT, Excel, Images (Max 15MB)
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* TEXT AREA ANSWER */}
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-700">2. Answer Text / Submission Comments</Label>
                                <textarea
                                  className="w-full min-h-[100px] p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs leading-relaxed"
                                  placeholder="Type your explanation, answers, or comments to your teacher..."
                                  value={submissionText}
                                  onChange={e => setSubmissionText(e.target.value)}
                                ></textarea>
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setActiveSubmittingAss(null);
                                    setUploadedDoc(null);
                                    setUploadError("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 px-4 shadow-sm"
                                  onClick={() => handleTextSubmit(ass.id)}
                                >
                                  <Check size={14} /> Submit to Teacher
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-xs text-slate-500 font-medium">Ready to submit your work?</span>
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5 shadow-sm" 
                                onClick={() => {
                                  setActiveSubmittingAss(ass.id);
                                  setUploadedDoc(null);
                                  setUploadError("");
                                }}
                              >
                                <FileUp size={14} /> Submit Assignment & Upload Document
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "cbt" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Active CBT Examinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 border border-slate-200 rounded-xl bg-white text-center">
              <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Upcoming & Available Examinations</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">Your examinations are available here. Ensure you have a stable internet connection before starting.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
                {exams.filter(e => e.type === "CBT").length > 0 ? (
                  exams.filter(e => e.type === "CBT").map(exam => (
                    <div key={exam.id} className="p-4 border border-brand-200 bg-brand-50 rounded-xl flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-brand-900 mb-1">{exam.title} - {exam.subject}</h4>
                        <p className="text-sm text-brand-700 mb-2">Class: {exam.targetClass}</p>
                        <p className="text-sm text-brand-700 mb-4">Duration: {exam.duration} Minutes &middot; {exam.questions?.length || 0} Questions</p>
                      </div>
                      {examSubmitted ? (
                        <Button variant="outline" className="w-full mt-auto" disabled>Submitted Successfully</Button>
                      ) : (
                        <Button variant="brand" className="w-full mt-auto" onClick={() => { setActiveCbtExam(exam); setExamActive(true); }}>Start Examination</Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-slate-500 italic border border-dashed border-slate-300 rounded-xl">
                    No CBT examinations are currently scheduled.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "results" && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>My Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <select 
                value={resSession} 
                onChange={e => { setResSession(e.target.value); setResultVisible(false); setReleaseError(""); }}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm flex-1 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
              </select>
              <select 
                value={resTerm} 
                onChange={e => { setResTerm(e.target.value); setResultVisible(false); setReleaseError(""); }}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm flex-1 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
              <Button variant="brand" onClick={handleViewResult}>View Result</Button>
            </div>
            
            {releaseError && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3.5 mb-6 text-amber-900">
                <Lock className="text-amber-600 shrink-0 mt-0.5" size={22} />
                <div>
                  <h4 className="font-bold text-base text-amber-950">Result Pending Release</h4>
                  <p className="text-sm text-amber-800 mt-1">{releaseError}</p>
                </div>
              </div>
            )}

            {resultVisible && !releaseError ? (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-900">Term Result Released</h4>
                    <p className="text-sm text-emerald-700 mt-1">Below is the breakdown of your performance.</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100" onClick={() => window.print()}>
                    <Download size={14} className="mr-2" /> Download / Print Report Card
                  </Button>
                </div>
                
                <div className="overflow-x-auto pb-4">
                  <StudentReportCard session={resSession} term={resTerm} student={currentStudent || students[0]} />
                </div>
              </div>
            ) : (
               <div className="text-center p-8 text-slate-500">
                 Select session and term, then click View Result.
               </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
