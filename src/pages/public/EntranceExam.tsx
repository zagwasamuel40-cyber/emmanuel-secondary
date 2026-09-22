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
import { safeStorage } from "../../utils/safeStorage";
import { SecureExamRunner } from "../../components/exam/SecureExamRunner";
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
  Search,
  ChevronRight
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

  // Optional pre-fill from explicit URL search query param if opened from slip
  useEffect(() => {
    const urlAppId =
      searchParams.get("appId") ||
      searchParams.get("applicationNumber") ||
      searchParams.get("appNumber") ||
      searchParams.get("ref");

    if (urlAppId && urlAppId.trim()) {
      setAppId(urlAppId.trim());
    }
  }, [searchParams]);

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
  const [examViolated, setExamViolated] = useState(false);
  const [violationReason, setViolationReason] = useState("");

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

    const query = appId.trim().toUpperCase();
    if (!query) {
      setErrorMsg("Please enter your Application Number (e.g. ESS/ADM/2026/001).");
      return;
    }

    setVerifying(true);

    // 1. Locate applicant in directory
    const applicant =
      candidateParam ||
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
        "Application Number not found in the admission roster. Please confirm your application number (e.g. ESS/ADM/2026/001) and try again."
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
    safeStorage.setItem("ess_latest_app_id", applicant.applicationNumber);
    safeStorage.setItem("ess_admission_app_num", applicant.applicationNumber);
    safeStorage.setItem(
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
        {/* STEP 1: CANDIDATE SIGN-IN (NO NAME SUGGESTION) */}
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

            {/* Candidate Sign-In Card */}
            <Card className="border-0 shadow-2xl shadow-indigo-900/10">
              <CardHeader className="bg-slate-900 text-white rounded-t-xl text-center p-6">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2 border border-indigo-500/30">
                  <Search size={22} />
                </div>
                <CardTitle className="text-xl font-bold font-heading text-white">
                  Candidate Examination Sign-In
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your official Application Number to access your scheduled Computer-Based Test.
                </p>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-5">
                <form onSubmit={handleVerifyApplication} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="appIdInput" className="text-xs font-bold text-slate-700">
                      Application Number
                    </Label>
                    <div className="relative">
                      <Input
                        id="appIdInput"
                        required
                        autoFocus
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        value={appId}
                        onChange={e => {
                          setAppId(e.target.value);
                          setErrorMsg("");
                        }}
                        placeholder="e.g. ESS/ADM/2026/001"
                        className="h-12 font-mono uppercase text-sm tracking-wider font-bold pr-10"
                      />
                      <div className="absolute right-3 top-3.5 text-slate-400">
                        <Search size={18} />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Provided on your application slip (e.g. ESS/ADM/2026/001 or APP-2026-001).
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={verifying || !appId.trim()}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2 shadow-lg shadow-indigo-900/20"
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
                </form>

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

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <h5 className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Lock size={15} className="text-amber-600" /> Mandatory Examination Security & Anti-Cheating Protocol:
                </h5>
                <ul className="list-disc pl-4 space-y-1 text-amber-900 text-[11px]">
                  <li><strong>Forced Fullscreen:</strong> When you click 'Begin Examination Now', your screen will expand to full screen. Exiting fullscreen will cause immediate automatic submission.</li>
                  <li><strong>Tab / App Switching Prohibited:</strong> Minimizing, switching browser tabs, or opening other applications will trigger an automatic violation report and terminate your test.</li>
                  <li><strong>Server Synchronized Timer:</strong> Countdown continues on the server even if you refresh your browser.</li>
                  <li><strong>Live Auto-Save:</strong> Selected answers are saved in real-time.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-center">
                <Button
                  size="lg"
                  onClick={handleStartExamSession}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-8 h-12 shadow-xl shadow-emerald-900/30 gap-2"
                >
                  <Play size={20} /> I Agree & Begin Examination Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* STEP 4: LIVE CBT TESTING (SECURE FULLSCREEN ANTI-CHEAT MODE) */}
        {/* ------------------------------------------------------------------- */}
        {step === "testing" && activeQuestions.length > 0 && currentApplicant && (
          <SecureExamRunner
            exam={{
              id: currentExam?.id || "entrance-exam-1",
              title: currentExam?.title || "Entrance Examination",
              subject: currentExam?.subjects?.join(", ") || "General Assessment",
              durationMinutes: currentExam?.durationMinutes || 60
            }}
            student={{
              id: currentApplicant.id,
              name: currentApplicant.fullName,
              class: currentApplicant.classApplied
            }}
            questions={activeQuestions}
            onComplete={(result) => {
              setScore(result.score);
              setPercentageScore(result.percentage);
              setExamViolated(result.autoSubmitted);
              setViolationReason(result.reason || "");
              updateApplicant(currentApplicant.id, {
                examStatus: "Examination Completed",
                examCompletedAt: new Date().toISOString(),
                examScore: result.percentage,
                examSubmittedBy: result.autoSubmitted ? "Security Auto-Submission (Violation)" : "Candidate Submission"
              });
              setStep("result");
            }}
            onExit={() => {
              setStep("waiting");
            }}
          />
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
              {examViolated && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs text-left space-y-1.5 animate-in fade-in">
                  <div className="font-bold text-rose-800 flex items-center gap-1.5 text-sm">
                    <AlertCircle size={16} className="text-rose-600" /> Auto-Submitted by Security Watchdog
                  </div>
                  <p className="text-rose-700 leading-relaxed">
                    This examination was automatically terminated and submitted due to a security violation:{" "}
                    <strong>{violationReason || "Exiting fullscreen or switching windows"}</strong>.
                  </p>
                  <p className="text-[11px] text-rose-600">
                    The incident has been logged with your device details and timestamp for administrative review by Mrs. Abigail M. Iorliam (Admission Officer).
                  </p>
                </div>
              )}

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
