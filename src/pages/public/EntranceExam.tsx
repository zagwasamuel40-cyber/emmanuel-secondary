import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useAdmissionApplicants,
  useEntranceExamsList,
  ApplicantProfile,
  EntranceExamSchedule,
  ExamQuestion
} from "../../data/admissionsAndExamData";
import { useAdmissionApps } from "../../data/studentsData";
import { usePortalSettings } from "../../data/portalSettingsData";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui";
import {
  Play,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Clock,
  Calendar,
  Lock,
  Sparkles,
  ShieldCheck,
  Award,
  RefreshCw,
  FileCheck,
  User,
  GraduationCap,
  Check,
  UserCheck,
  Search,
  BookOpen,
  Info,
  ChevronRight,
  School
} from "lucide-react";

interface ValidationResult {
  allowed: boolean;
  canStart: boolean;
  code: string;
  title: string;
  message: string;
}

export default function EntranceExam() {
  const [searchParams] = useSearchParams();
  const [portalSettings] = usePortalSettings();
  const { applicants, updateApplicant } = useAdmissionApplicants();
  const [admissionApps] = useAdmissionApps();
  const { exams } = useEntranceExamsList();

  const [step, setStep] = useState<"auth" | "waiting" | "intro" | "testing" | "result">("auth");
  const [appId, setAppId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [waitingInfo, setWaitingInfo] = useState<ValidationResult | null>(null);
  const [detectedSource, setDetectedSource] = useState<string | null>(null);
  const [isEditingId, setIsEditingId] = useState(false);

  // Authenticated Applicant & Linked Exam Schedule
  const [currentApplicant, setCurrentApplicant] = useState<ApplicantProfile | null>(null);
  const [currentExam, setCurrentExam] = useState<EntranceExamSchedule | null>(null);

  // Unified applicant roster merging admission applicants and submitted admission apps
  const unifiedApplicants: ApplicantProfile[] = useMemo(() => {
    const list = [...applicants];
    if (Array.isArray(admissionApps)) {
      admissionApps.forEach(app => {
        if (!app || !app.id) return;
        const exists = list.some(
          a =>
            a.id.toLowerCase() === app.id.toLowerCase() ||
            (a.applicationNumber && a.applicationNumber.toLowerCase() === app.id.toLowerCase())
        );
        if (!exists) {
          list.push({
            id: app.id,
            applicationNumber: app.id,
            fullName: app.name || `${app.firstName || ""} ${app.lastName || ""}`.trim() || "Applicant",
            firstName: app.firstName || app.name?.split(" ")[0] || "Applicant",
            lastName: app.lastName || app.name?.split(" ").slice(1).join(" ") || "",
            passportUrl:
              app.passportUrl ||
              "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80",
            dob: app.dob || "2012-01-01",
            gender: app.gender === "Female" ? "Female" : "Male",
            phone: app.phone || app.parentNumber || "+234 800 000 0000",
            email: app.email || "applicant@example.com",
            address: app.address || "Makurdi, Benue State",
            state: app.state || "Benue",
            lga: app.lga || "Makurdi",
            parentName: app.parentName || "Parent",
            parentPhone: app.parentPhone || app.parentNumber || "+234 800 000 0000",
            parentEmail: app.parentEmail || "parent@example.com",
            parentOccupation: "Guardian",
            previousSchool: app.previousSchool || "Primary School",
            classApplied: app.classApplied || app.classApplying || app.class || "JSS 1",
            applicationDate: app.date || new Date().toISOString().split("T")[0],
            status: (app.status as any) || "Pending",
            examStatus: (app.examStatus as any) || "Examination Scheduled",
            examScore: app.examScore ? parseInt(app.examScore) : undefined
          });
        }
      });
    }
    return list;
  }, [applicants, admissionApps]);

  // Server Time
  const [serverTimeInfo, setServerTimeInfo] = useState<{
    serverTime: string;
    serverDate: string;
    timezone: string;
  }>({
    serverTime: "",
    serverDate: "",
    timezone: "Africa/Lagos (WAT)"
  });

  // Fetch server clock on mount and periodically
  useEffect(() => {
    const fetchClock = async () => {
      try {
        const res = await fetch("/api/admission/server-time");
        if (res.ok) {
          const data = await res.json();
          setServerTimeInfo({
            serverTime: data.serverTime,
            serverDate: data.serverDate,
            timezone: data.timezone
          });
        }
      } catch (e) {
        const d = new Date();
        setServerTimeInfo({
          serverTime: d.toLocaleTimeString(),
          serverDate: d.toISOString().split("T")[0],
          timezone: "WAT"
        });
      }
    };
    fetchClock();
    const interval = setInterval(fetchClock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-detect application number from URL parameter or localStorage on mount
  useEffect(() => {
    // 1. URL search params (e.g. ?appId=ESS/ADM/2026/001)
    const urlAppId =
      searchParams.get("appId") ||
      searchParams.get("applicationNumber") ||
      searchParams.get("appNumber") ||
      searchParams.get("ref");

    if (urlAppId && urlAppId.trim()) {
      setAppId(urlAppId.trim());
      setDetectedSource("Direct Registration Link");
      return;
    }

    // 2. Saved application in browser storage
    const savedAppId =
      localStorage.getItem("ess_latest_app_id") ||
      localStorage.getItem("ess_admission_app_num");
    if (savedAppId && savedAppId.trim()) {
      setAppId(savedAppId.trim());
      setDetectedSource("Device Registration Session");
      return;
    }

    // 3. Fallback default if testing and list available
    if (applicants.length > 0 && !appId) {
      // Don't auto-force, leave blank if user prefers typing, but offer quick picks
    }
  }, [searchParams]);

  // Real-time live detection of applicant matching current `appId`
  const detectedApplicant: ApplicantProfile | null = useMemo(() => {
    const query = appId.trim().toUpperCase();
    if (!query) return null;
    return (
      unifiedApplicants.find(
        a =>
          a.applicationNumber.toUpperCase() === query ||
          a.id.toUpperCase() === query ||
          (a.phone && a.phone.replace(/[\s\-\+]/g, "").endsWith(query.replace(/[\s\-\+]/g, ""))) ||
          (a.parentPhone && a.parentPhone.replace(/[\s\-\+]/g, "").endsWith(query.replace(/[\s\-\+]/g, "")))
      ) || null
    );
  }, [appId, unifiedApplicants]);

  // Live detection of scheduled examination matching the candidate's applied class
  const detectedExam = useMemo(() => {
    if (!detectedApplicant) return null;
    let exam = exams.find(e => e.id === detectedApplicant.examId);
    if (!exam) {
      exam = exams.find(e => e.eligibleClasses.includes(detectedApplicant.classApplied));
    }
    if (!exam && exams.length > 0) {
      exam = exams[0];
    }
    return exam || null;
  }, [detectedApplicant, exams]);

  // Exam Questions & Testing State
  const activeQuestions: ExamQuestion[] = useMemo(() => {
    if (currentExam && currentExam.questions && currentExam.questions.length > 0) {
      return currentExam.questions;
    }
    // Default 5-question fallback
    return [
      {
        id: "Q1",
        subject: "English Language",
        question: "Choose the word that is nearest in meaning to 'diligent':",
        options: ["Hardworking", "Careless", "Slow", "Timid"],
        correctAnswer: "Hardworking",
        marks: 2
      },
      {
        id: "Q2",
        subject: "Mathematics",
        question: "What is the square root of 144?",
        options: ["10", "12", "14", "16"],
        correctAnswer: "12",
        marks: 2
      },
      {
        id: "Q3",
        subject: "General Aptitude",
        question: "What is the capital of Benue State?",
        options: ["Otukpo", "Gboko", "Makurdi", "Katsina-Ala"],
        correctAnswer: "Makurdi",
        marks: 2
      },
      {
        id: "Q4",
        subject: "Basic Science",
        question: "Which of the following is essential for plant photosynthesis?",
        options: ["Oxygen", "Carbon dioxide & Sunlight", "Nitrogen", "Argon"],
        correctAnswer: "Carbon dioxide & Sunlight",
        marks: 2
      },
      {
        id: "Q5",
        subject: "Mathematics",
        question: "If 3x + 5 = 20, what is the value of x?",
        options: ["3", "5", "10", "15"],
        correctAnswer: "5",
        marks: 2
      }
    ];
  }, [currentExam]);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [percentageScore, setPercentageScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600); // in seconds

  // Active Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "testing" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && step === "testing") {
      handleSubmitExam();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Live polling while in 'waiting' step so that when the Admission Officer presses START EXAM,
  // the applicant immediately transitions or is notified!
  useEffect(() => {
    if (step !== "waiting" || !currentApplicant || !currentExam) return;

    const interval = setInterval(async () => {
      // Re-read latest exams from localStorage or server to detect Admission Officer clicking START EXAM
      try {
        const storedExams: EntranceExamSchedule[] = JSON.parse(
          localStorage.getItem("ess_entrance_exam_schedules") || "[]"
        );
        const liveExam = storedExams.find(e => e.id === currentExam.id);
        if (liveExam) {
          if (liveExam.status === "In Progress") {
            // Live exam has started!
            setCurrentExam(liveExam);
            setStep("intro");
          } else if (liveExam.status !== currentExam.status) {
            setCurrentExam(liveExam);
          }
        }
      } catch (e) {}
    }, 4000);

    return () => clearInterval(interval);
  }, [step, currentApplicant, currentExam]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  // ---------------------------------------------------------------------------
  // Verify & Authenticate Candidate with Backend Server Validation
  // ---------------------------------------------------------------------------
  const handleVerifyApplication = async (
    e?: React.FormEvent,
    candidateParam?: ApplicantProfile
  ) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setWaitingInfo(null);
    setVerifying(true);

    const query = appId.trim().toUpperCase();

    // 1. Locate applicant in directory or use candidateParam / detectedApplicant
    const applicant =
      candidateParam ||
      detectedApplicant ||
      unifiedApplicants.find(
        a =>
          a.applicationNumber.toUpperCase() === query ||
          a.id.toUpperCase() === query ||
          (a.phone && a.phone.replace(/[\s\-\+]/g, "").endsWith(query.replace(/[\s\-\+]/g, ""))) ||
          (a.parentPhone && a.parentPhone.replace(/[\s\-\+]/g, "").endsWith(query.replace(/[\s\-\+]/g, "")))
      );

    if (!applicant) {
      setVerifying(false);
      setErrorMsg(
        "Application Number not found in the admission roster. Please confirm your application number (e.g. ESS/ADM/2026/001)."
      );
      return;
    }

    // 2. Identify corresponding Entrance Exam Schedule
    let exam = exams.find(e => e.id === applicant.examId);
    if (!exam) {
      exam = exams.find(e => e.eligibleClasses.includes(applicant.classApplied));
    }
    if (!exam && exams.length > 0) {
      exam = exams[0];
    }

    setCurrentApplicant(applicant);
    setCurrentExam(exam || null);

    // Persist verified application credentials for seamless re-visits
    localStorage.setItem("ess_latest_app_id", applicant.applicationNumber);
    localStorage.setItem("ess_admission_app_num", applicant.applicationNumber);
    localStorage.setItem(
      "ess_latest_applicant",
      JSON.stringify({
        applicationNumber: applicant.applicationNumber,
        id: applicant.id,
        fullName: applicant.fullName,
        classApplied: applicant.classApplied
      })
    );

    // 3. Call Server-Side Validation Route (Requirement 11 - Cannot be bypassed by device clock)
    try {
      const response = await fetch("/api/admission/validate-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicant, exam })
      });

      if (response.ok) {
        const result: ValidationResult = await response.json();

        if (result.canStart) {
          // Admission Officer has STARTED the exam! Candidate can enter.
          setTimeLeft((exam?.durationMinutes || 60) * 60);
          setStep("intro");
        } else {
          // Display the required polite and specific notification
          setWaitingInfo(result);
          setStep("waiting");
        }
      } else {
        // Fallback validation logic in case offline
        evaluateAccessLocally(applicant, exam);
      }
    } catch (err) {
      evaluateAccessLocally(applicant, exam);
    } finally {
      setVerifying(false);
    }
  };

  const evaluateAccessLocally = (
    applicant: ApplicantProfile,
    exam: EntranceExamSchedule | undefined
  ) => {
    if (applicant.examStatus === "Examination Completed") {
      setWaitingInfo({
        allowed: false,
        canStart: false,
        code: "ALREADY_COMPLETED",
        title: "EXAMINATION COMPLETED",
        message: `You have already completed and submitted your entrance examination. Score: ${
          applicant.examScore ?? "Recorded"
        }/20.`
      });
      setStep("waiting");
      return;
    }

    if (applicant.examStatus === "Examination Disqualified") {
      setWaitingInfo({
        allowed: false,
        canStart: false,
        code: "DISQUALIFIED",
        title: "EXAMINATION DISQUALIFIED",
        message: "Your application is marked as disqualified for this entrance examination."
      });
      setStep("waiting");
      return;
    }

    if (!exam || exam.status === "Scheduled") {
      setWaitingInfo({
        allowed: false,
        canStart: false,
        code: "NOT_YET_AVAILABLE",
        title: "EXAMINATION NOT YET AVAILABLE",
        message:
          "Your entrance examination has not started yet. Please wait until the Admission Officer activates the examination. Check your scheduled examination date and time."
      });
      setStep("waiting");
      return;
    }

    if (exam.status === "In Progress") {
      setTimeLeft(exam.durationMinutes * 60);
      setStep("intro");
      return;
    }

    setWaitingInfo({
      allowed: false,
      canStart: false,
      code: "NOT_YET_AVAILABLE",
      title: "EXAMINATION NOT YET AVAILABLE",
      message:
        "Your entrance examination has not started yet. Please wait until the Admission Officer activates the examination."
    });
    setStep("waiting");
  };

  const handleStartExamSession = () => {
    setStep("testing");
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setScore(0);
    // Mark candidate as present / in progress
    if (currentApplicant) {
      updateApplicant(currentApplicant.id, {
        examStatus: "Examination In Progress",
        examStartedAt: new Date().toISOString()
      });
    }
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

  const handleSubmitExam = () => {
    if (Object.keys(selectedAnswers).length < activeQuestions.length && timeLeft > 0) {
      const confirmSubmit = window.confirm(
        `You have answered ${Object.keys(selectedAnswers).length} out of ${
          activeQuestions.length
        } questions. Are you sure you want to submit your examination?`
      );
      if (!confirmSubmit) return;
    }

    let calculatedScore = 0;
    activeQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        calculatedScore += q.marks || 2;
      }
    });

    const totalPossible = activeQuestions.reduce((acc, q) => acc + (q.marks || 2), 0);
    const percentage = totalPossible > 0 ? Math.round((calculatedScore / totalPossible) * 100) : 0;

    setScore(calculatedScore);
    setPercentageScore(percentage);

    // Save candidate final exam score and mark as Examination Completed (cannot retake)
    if (currentApplicant) {
      updateApplicant(currentApplicant.id, {
        examStatus: "Examination Completed",
        examScore: calculatedScore,
        examPercentage: percentage,
        examCompletedAt: new Date().toISOString(),
        status: percentage >= 50 ? "Approved" : "Pending",
        reviewerNotes: `Exam completed. Raw Score: ${calculatedScore}/${totalPossible} (${percentage}%).`
      });
    }

    setStep("result");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Portal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck size={14} /> Official CBT Entrance Examination Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900">
            {portalSettings.schoolName} Entrance Examination
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Authorized Computer-Based Testing (CBT) gateway for provisional admission into JSS & SSS classes.
          </p>
          {serverTimeInfo.serverTime && (
            <p className="text-xs font-mono text-slate-400">
              Official Server Clock: {serverTimeInfo.serverTime} ({serverTimeInfo.timezone})
            </p>
          )}
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* STEP 1: AUTHENTICATION & SCHEDULE LOOKUP (WITH AUTO-DETECTION) */}
        {/* ------------------------------------------------------------------- */}
        {step === "auth" && (
          <div className="max-w-xl mx-auto space-y-6">
            {errorMsg && (
              <div className="p-4 bg-rose-50 text-rose-800 text-xs rounded-2xl border border-rose-200 flex items-start gap-3 shadow-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <div className="font-bold text-sm">Application Verification Issue</div>
                  <div className="mt-0.5">{errorMsg}</div>
                </div>
              </div>
            )}

            {/* If Candidate Auto-Detected from URL / Storage / Input */}
            {detectedApplicant && !isEditingId && (
              <Card className="border-2 border-indigo-500/30 shadow-2xl shadow-indigo-900/10 overflow-hidden bg-white">
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      Application Detected
                    </span>
                    {detectedSource && (
                      <span className="text-[11px] font-medium text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                        Via {detectedSource}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/40 border-2 border-indigo-400/40 overflow-hidden shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                      {detectedApplicant.passportUrl ? (
                        <img
                          src={detectedApplicant.passportUrl}
                          alt={detectedApplicant.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={30} className="text-indigo-200" />
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold">
                        Registered Applicant
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-heading text-white truncate">
                        {detectedApplicant.fullName}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-100 font-bold border border-indigo-400/40 flex items-center gap-1">
                          <GraduationCap size={13} />
                          Class Applied: {detectedApplicant.classApplied}
                        </span>
                        <span className="font-mono text-slate-300 bg-black/30 px-2 py-0.5 rounded border border-white/10">
                          {detectedApplicant.applicationNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-5">
                  {/* Detected Examination Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                        <BookOpen size={15} className="text-indigo-600" />
                        Target Entrance Examination
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        Class {detectedApplicant.classApplied} Track
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-slate-700">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">
                          Exam Name
                        </span>
                        <strong className="text-slate-900 block text-xs truncate">
                          {detectedExam ? detectedExam.title : "Provisional Entrance CBT"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">
                          Duration
                        </span>
                        <strong className="text-slate-900 block text-xs">
                          {detectedExam?.durationMinutes || 60} Minutes
                        </strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-semibold">
                          Subjects Tested
                        </span>
                        <strong className="text-slate-900 block text-xs">
                          {detectedExam?.subjects?.join(", ") || "English Language, Mathematics, General Aptitude"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Single-Click Verification & Action Button */}
                  <div className="space-y-2.5">
                    <Button
                      onClick={() => handleVerifyApplication(undefined, detectedApplicant)}
                      disabled={verifying}
                      className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2 shadow-lg shadow-indigo-900/20"
                    >
                      {verifying ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" /> Verifying Schedule with Server...
                        </>
                      ) : (
                        <>
                          Proceed to CBT as {detectedApplicant.firstName || detectedApplicant.fullName.split(" ")[0]} ({detectedApplicant.classApplied}) <ArrowRight size={18} />
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setIsEditingId(true)}
                      className="w-full text-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors py-1"
                    >
                      Not your application? Switch or enter another Application Number &rarr;
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Manual Lookup Form (Shown if not detected or user clicked Switch) */}
            {(!detectedApplicant || isEditingId) && (
              <Card className="border-0 shadow-2xl shadow-indigo-900/10">
                <CardHeader className="bg-slate-900 text-white rounded-t-xl text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2 border border-indigo-500/30">
                    <Search size={22} />
                  </div>
                  <CardTitle className="text-xl font-bold font-heading text-white">
                    Candidate Examination Sign-In
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your official Application Number. The portal will automatically detect your registered profile and class applied for.
                  </p>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-5">
                  <form onSubmit={handleVerifyApplication} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-700">
                          Application Number
                        </Label>
                        {detectedApplicant && (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 size={13} /> Found: {detectedApplicant.fullName} ({detectedApplicant.classApplied})
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          required
                          value={appId}
                          onChange={e => {
                            setAppId(e.target.value);
                            setErrorMsg("");
                          }}
                          placeholder="e.g. ESS/ADM/2026/001"
                          className="h-11 font-mono uppercase text-sm tracking-wider font-bold pr-10"
                        />
                        <div className="absolute right-3 top-3 text-slate-400">
                          {detectedApplicant ? (
                            <CheckCircle2 size={18} className="text-emerald-500" />
                          ) : (
                            <Search size={18} />
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Provided on your application slip (e.g. ESS/ADM/2026/001 or APP-2026-001).
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {detectedApplicant && isEditingId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingId(false)}
                          className="h-12 text-xs font-bold"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={verifying || !appId.trim()}
                        className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2 shadow-lg shadow-indigo-900/20"
                      >
                        {verifying ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" /> Verifying Schedule...
                          </>
                        ) : (
                          <>
                            Verify Schedule & Proceed <ArrowRight size={18} />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Quick Select Candidates for Demo / Quick Access */}
                  {unifiedApplicants.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1">
                        <UserCheck size={13} className="text-indigo-600" />
                        Quick Select Registered Candidate:
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {unifiedApplicants.slice(0, 4).map(app => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => {
                              setAppId(app.applicationNumber);
                              setIsEditingId(false);
                              setErrorMsg("");
                            }}
                            className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-slate-900 truncate">{app.fullName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {app.applicationNumber}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px] shrink-0">
                              {app.classApplied}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock size={14} className="text-indigo-600" />
                      Examination Access Protocol:
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                      <li>The examination is restricted to the scheduled date and time window.</li>
                      <li>The Admission Officer must activate the live test before candidates can write.</li>
                      <li>Candidate identity, applied class, and time-stamps are logged server-side.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* STEP 2: NOT YET STARTED / WAITING NOTIFICATION (Requirement 5 & 6) */}
        {/* ------------------------------------------------------------------- */}
        {step === "waiting" && waitingInfo && currentApplicant && (
          <Card className="max-w-xl mx-auto border-0 shadow-2xl shadow-indigo-900/10 overflow-hidden">
            <div
              className={`p-6 text-white text-center ${
                waitingInfo.code === "ALREADY_COMPLETED"
                  ? "bg-emerald-900"
                  : waitingInfo.code === "DISQUALIFIED"
                  ? "bg-rose-900"
                  : "bg-slate-900"
              }`}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-3">
                {waitingInfo.code === "ALREADY_COMPLETED" ? (
                  <CheckCircle2 size={36} className="text-emerald-400" />
                ) : waitingInfo.code === "DISQUALIFIED" ? (
                  <XCircle size={36} className="text-rose-400" />
                ) : (
                  <Clock size={36} className="text-amber-400 animate-pulse" />
                )}
              </div>
              <h2 className="text-xl font-bold font-heading">{waitingInfo.title}</h2>
              <p className="text-xs text-slate-300 mt-1">
                Candidate: <strong>{currentApplicant.fullName}</strong> ({currentApplicant.applicationNumber})
              </p>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Mandatory Polite Notification (Requirement 5) */}
              <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-950 space-y-2">
                <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <AlertCircle className="text-amber-600 shrink-0" size={20} />
                  Notice to Candidate:
                </h4>
                <p className="text-xs sm:text-sm font-medium leading-relaxed">
                  {waitingInfo.message}
                </p>
              </div>

              {/* Schedule Summary Card */}
              {currentExam && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Your Scheduled Examination Details
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Examination Title</span>
                      <strong className="text-slate-900">{currentExam.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Target Class</span>
                      <strong className="text-slate-900">{currentApplicant.classApplied}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Scheduled Date</span>
                      <strong className="text-slate-900">{currentExam.examDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Exam Window</span>
                      <strong className="text-slate-900">
                        {currentExam.startTime} - {currentExam.endTime} ({currentExam.durationMinutes} mins)
                      </strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Current Status</span>
                      <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-900">
                        ● {currentExam.status} (Awaiting Admission Officer START signal)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setStep("auth")}
                  className="font-semibold text-xs h-11"
                >
                  <ArrowLeft size={16} className="mr-1.5" /> Back to Sign-In
                </Button>
                <Button
                  onClick={async () => {
                    // Refresh status from server
                    setVerifying(true);
                    try {
                      const response = await fetch("/api/admission/validate-access", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ applicant: currentApplicant, exam: currentExam })
                      });
                      if (response.ok) {
                        const result = await response.json();
                        if (result.canStart) {
                          setStep("intro");
                        } else {
                          setWaitingInfo(result);
                        }
                      }
                    } catch (e) {}
                    setVerifying(false);
                  }}
                  disabled={verifying}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-11 px-5"
                >
                  <RefreshCw size={16} className={`mr-1.5 ${verifying ? "animate-spin" : ""}`} /> Check If
                  Officer Started Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* STEP 3: EXAM INTRO (Accessible ONLY after START EXAM) */}
        {/* ------------------------------------------------------------------- */}
        {step === "intro" && currentApplicant && currentExam && (
          <Card className="max-w-2xl mx-auto border-0 shadow-2xl shadow-indigo-900/10">
            <CardHeader className="bg-slate-900 text-white p-6 rounded-t-xl text-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ● Examination Session Active & In Progress
              </span>
              <CardTitle className="text-2xl font-bold font-heading text-white mt-2">
                Welcome, {currentApplicant.fullName}
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Application Number: <strong className="text-white">{currentApplicant.applicationNumber}</strong> |
                Class: <strong className="text-white">{currentApplicant.classApplied}</strong>
              </p>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">
                    Subjects
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    {currentExam.subjects.join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">
                    Questions
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    {activeQuestions.length} Questions
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">
                    Allocated Time
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    {currentExam.durationMinutes} Minutes
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">
                    Pass Cutoff
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    {currentExam.passCutoff}%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1.5">
                <h5 className="font-bold">Instructions & Guidelines:</h5>
                <ul className="list-disc pl-4 space-y-1 text-blue-800 text-[11px]">
                  <li>Read each question carefully before choosing your answer.</li>
                  <li>You may move between questions using the Previous and Next buttons.</li>
                  <li>Once you click Submit or time expires, your answers are automatically finalized.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-center">
                <Button
                  size="lg"
                  onClick={handleStartExamSession}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-8 h-12 shadow-xl shadow-emerald-900/30 gap-2"
                >
                  <Play size={20} /> Begin Examination Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* STEP 4: LIVE CBT TESTING */}
        {/* ------------------------------------------------------------------- */}
        {step === "testing" && activeQuestions.length > 0 && currentApplicant && (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Live Status Bar */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white shadow-md flex-wrap gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Candidate & Class Track
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-white">
                    {currentApplicant.fullName}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    Class Applied: {currentApplicant.classApplied}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ({currentApplicant.applicationNumber})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold text-base">
                  <Clock size={16} /> {formatTime(timeLeft)}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
                  Question {currentQIndex + 1} of {activeQuestions.length}
                </div>
              </div>
            </div>

            {/* Question Card */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between text-xs pb-3 border-b">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {activeQuestions[currentQIndex].subject}
                  </span>
                  <span className="font-mono text-slate-500 font-semibold">
                    {activeQuestions[currentQIndex].marks || 2} Marks
                  </span>
                </div>

                <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                  {currentQIndex + 1}. {activeQuestions[currentQIndex].question}
                </p>

                <div className="space-y-3 pt-2">
                  {activeQuestions[currentQIndex].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQIndex] === opt;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentQIndex, opt)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-sm"
                            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700 font-medium"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="text-sm">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation & Submission Strip */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentQIndex === 0}
                className="font-semibold text-xs h-10 px-4"
              >
                <ArrowLeft size={16} className="mr-1" /> Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentQIndex < activeQuestions.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-5"
                  >
                    Next Question <ArrowRight size={16} className="ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitExam}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 shadow-md"
                  >
                    Submit Final Examination
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* STEP 5: EXAMINATION RESULT & SUBMISSION ACKNOWLEDGEMENT */}
        {/* ------------------------------------------------------------------- */}
        {step === "result" && currentApplicant && (
          <Card className="max-w-xl mx-auto border-0 shadow-2xl shadow-emerald-900/10 overflow-hidden text-center">
            <div className="p-8 bg-slate-900 text-white space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40">
                <Award size={44} />
              </div>
              <h2 className="text-2xl font-bold font-heading text-white">
                Examination Submitted Successfully!
              </h2>
              <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-300 pt-1">
                <span>Candidate: <strong className="text-white">{currentApplicant.fullName}</strong></span>
                <span>&bull;</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  Class Applied: {currentApplicant.classApplied}
                </span>
                <span>&bull;</span>
                <span>App No: <strong className="font-mono text-white">{currentApplicant.applicationNumber}</strong></span>
              </div>
            </div>

            <CardContent className="p-8 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                  Recorded Entrance Score
                </span>
                <div className="text-4xl font-bold font-heading text-slate-900">
                  {score} Marks
                </div>
                <div className="text-sm font-semibold text-indigo-700">
                  Overall Performance: {percentageScore}%
                </div>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    percentageScore >= 50
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Status: {percentageScore >= 50 ? "Qualified for Admission" : "Under Review"}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Your examination responses have been transmitted to the Admission Directorate. The Admission
                Officer will review results and update final admission offers.
              </p>

              <div className="pt-2 flex justify-center gap-3">
                <Button
                  onClick={() => {
                    setStep("auth");
                    setAppId("");
                    setCurrentApplicant(null);
                    setCurrentExam(null);
                  }}
                  variant="outline"
                  className="font-semibold text-xs"
                >
                  Exit Exam Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
