import React, { useState, useMemo, useEffect } from "react";
import {
  useAdmissionPortal,
  useAdmissionApplicants,
  useEntranceExamsList,
  useAdmissionAuditLogs,
  useAdmissionQuestionBank,
  EntranceExamSchedule,
  ApplicantProfile,
  ExamQuestion,
  computeAdmissionPortalStatus,
  defaultExamQuestions
} from "../../data/admissionsAndExamData";
import AIQuestionGenerator from "../../components/admissions/AIQuestionGenerator";
import QuestionBankManager from "../../components/admissions/QuestionBankManager";
import { CLASSES } from "../../data/studentsData";
import { usePortalSettings } from "../../data/portalSettingsData";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Label
} from "@/src/components/ui";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Users,
  FileCheck,
  Play,
  Pause,
  StopCircle,
  Zap,
  Sliders,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Award,
  BookOpen,
  Eye,
  Check,
  X,
  History,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  Printer,
  ChevronRight,
  HelpCircle,
  Radio,
  FileText
} from "lucide-react";

export default function AdmissionOfficerDashboard() {
  const [portalSettings] = usePortalSettings();
  const { control, updateControl, computedStatus } = useAdmissionPortal();
  const { applicants, setApplicants, addApplicant, updateApplicant } = useAdmissionApplicants();
  const { exams, setExams, addExam, updateExam } = useEntranceExamsList();
  const { logs, addLog } = useAdmissionAuditLogs();
  const { bankQuestions, addQuestionsBulkToBank } = useAdmissionQuestionBank();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "portal" | "applicants" | "exams" | "live" | "ai-generator" | "question-bank" | "questions" | "audit"
  >(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (
      t === "portal" ||
      t === "applicants" ||
      t === "exams" ||
      t === "live" ||
      t === "ai-generator" ||
      t === "question-bank" ||
      t === "questions" ||
      t === "audit"
    ) {
      return t as any;
    }
    return "overview";
  });

  // Server Time Sync
  const [serverTime, setServerTime] = useState<string>("");
  const [serverDate, setServerDate] = useState<string>("");
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const res = await fetch("/api/admission/server-time");
        if (res.ok) {
          const data = await res.json();
          setServerTime(data.serverTime);
          setServerDate(data.serverDate);
        }
      } catch (e) {
        const d = new Date();
        setServerTime(d.toLocaleTimeString());
        setServerDate(d.toISOString().split("T")[0]);
      }
    };
    fetchServerTime();
    const interval = setInterval(fetchServerTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Officer name from settings or logged-in teacher
  const officerName = control.admissionOfficerName || "Mrs. Abigail M. Iorliam";

  // Selected Exam for Live Controls (defaults to first or currently active/scheduled exam)
  const currentExam = useMemo(() => {
    if (exams.length === 0) return null;
    const active = exams.find(e => e.status === "In Progress" || e.status === "Activated" || e.status === "Paused");
    return active || exams[0];
  }, [exams]);

  // Selected Exam ID for detail/editing
  const [selectedExamId, setSelectedExamId] = useState<string>(() => currentExam?.id || "");
  useEffect(() => {
    if (!selectedExamId && currentExam) {
      setSelectedExamId(currentExam.id);
    }
  }, [currentExam, selectedExamId]);

  const activeExamDetail = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || currentExam;
  }, [exams, selectedExamId, currentExam]);

  // Modals and Action Confirmations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionText: string;
    variant: "brand" | "danger" | "warning" | "success";
    onConfirm: () => void;
  } | null>(null);

  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Schedule Exam Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examFormData, setExamFormData] = useState({
    title: "Entrance Examination 2026",
    session: "2026/2027",
    eligibleClasses: ["JSS 1", "JSS 2", "SSS 1"],
    examDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "11:00",
    durationMinutes: 60,
    subjects: ["English Language", "Mathematics", "General Aptitude"],
    venue: "School ICT Hall & Online CBT Portal",
    passCutoff: 50
  });

  // View Applicant Profile Modal
  const [viewingApplicant, setViewingApplicant] = useState<ApplicantProfile | null>(null);

  // New Applicant Registration Modal
  const [showNewApplicantModal, setShowNewApplicantModal] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    fullName: "",
    gender: "Male" as "Male" | "Female",
    dob: "2013-05-15",
    phone: "",
    email: "",
    address: "Makurdi, Benue State",
    state: "Benue",
    lga: "Makurdi",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentOccupation: "Civil Servant",
    previousSchool: "",
    classApplied: "JSS 1",
    status: "Pending" as const,
    examStatus: "Examination Scheduled" as const,
    examId: currentExam?.id || ""
  });

  // Question Bank Management Modal / State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState({
    subject: "English Language",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 2
  });

  // Filtering for Applicants
  const [applicantSearch, setApplicantSearch] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterAppStatus, setFilterAppStatus] = useState("All");
  const [filterExamStatus, setFilterExamStatus] = useState("All");

  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const matchesSearch =
        app.fullName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        app.id.toLowerCase().includes(applicantSearch.toLowerCase()) ||
        app.parentPhone.includes(applicantSearch);

      const matchesClass = filterClass === "All" || app.classApplied === filterClass;
      const matchesAppStatus = filterAppStatus === "All" || app.status === filterAppStatus;
      const matchesExamStatus = filterExamStatus === "All" || app.examStatus === filterExamStatus;

      return matchesSearch && matchesClass && matchesAppStatus && matchesExamStatus;
    });
  }, [applicants, applicantSearch, filterClass, filterAppStatus, filterExamStatus]);

  // Statistics Calculation (per Requirement 9)
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const totalApps = applicants.length;
    const appsToday = applicants.filter(a => a.applicationDate === todayStr).length;
    const pendingApps = applicants.filter(a => a.status === "Pending" || a.status === "Under Review").length;
    const approvedApps = applicants.filter(a => a.status === "Approved" || a.status === "Admitted").length;
    const rejectedApps = applicants.filter(a => a.status === "Rejected").length;

    const scheduledForExam = applicants.filter(
      a => a.examStatus !== "Examination Not Scheduled" && a.examStatus !== "Examination Disqualified"
    ).length;
    const presentForExam = applicants.filter(
      a => a.examStatus === "Examination In Progress" || a.examStatus === "Examination Completed"
    ).length;
    const completedExam = applicants.filter(a => a.examStatus === "Examination Completed").length;
    const inProgressExam = applicants.filter(a => a.examStatus === "Examination In Progress").length;
    const yetToWrite = applicants.filter(
      a =>
        a.examStatus === "Examination Scheduled" ||
        a.examStatus === "Examination Not Yet Due" ||
        a.examStatus === "Examination Activated"
    ).length;

    return {
      totalApps,
      appsToday,
      pendingApps,
      approvedApps,
      rejectedApps,
      scheduledForExam,
      presentForExam,
      completedExam,
      inProgressExam,
      yetToWrite,
      currentExamStatus: currentExam ? currentExam.status : "No Active Exam"
    };
  }, [applicants, currentExam]);

  // ---------------------------------------------------------------------------
  // Action Handlers (Portal Control)
  // ---------------------------------------------------------------------------
  const handleOpenAdmission = () => {
    setConfirmModal({
      isOpen: true,
      title: "Activate & Open Admission Portal?",
      description: `You are about to OPEN the online admission application portal for session ${control.academicSession}. Prospective students and parents will immediately be able to submit new applications.`,
      actionText: "OPEN ADMISSION",
      variant: "success",
      onConfirm: () => {
        updateControl({ portalOpen: true });
        addLog(
          "OPEN_ADMISSION",
          `Admission portal opened manually by ${officerName}. Accepting applications for session ${control.academicSession}.`,
          officerName
        );
        showToast("Online Admission Portal is now OPEN 🟢");
        setConfirmModal(null);
      }
    });
  };

  const handleCloseAdmission = () => {
    setConfirmModal({
      isOpen: true,
      title: "Deactivate & Close Admission Portal?",
      description:
        "Closing the portal will immediately prevent all new online application submissions. Already registered applicants will still be able to check status or sit for scheduled entrance exams.",
      actionText: "CLOSE ADMISSION",
      variant: "danger",
      onConfirm: () => {
        updateControl({ portalOpen: false });
        addLog(
          "CLOSE_ADMISSION",
          `Admission portal closed manually by ${officerName}. Submissions locked.`,
          officerName
        );
        showToast("Online Admission Portal has been CLOSED 🔴");
        setConfirmModal(null);
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Action Handlers (Entrance Exam Control per Requirements 4, 6, 7)
  // ---------------------------------------------------------------------------
  const handleActivateExam = (exam: EntranceExamSchedule) => {
    setConfirmModal({
      isOpen: true,
      title: "ACTIVATE ENTRANCE EXAMINATION?",
      description: `Activating '${exam.title}' arms the examination gateway. Applicants in the exam hall will see that the exam is activated and ready, waiting for your START signal.`,
      actionText: "ACTIVATE EXAM",
      variant: "warning",
      onConfirm: () => {
        const now = new Date().toISOString();
        updateExam(exam.id, { status: "Activated", activatedAt: now });
        // Update all scheduled applicants to Activated status
        setApplicants(prev =>
          prev.map(app =>
            (app.examId === exam.id || (!app.examId && exam.eligibleClasses.includes(app.classApplied))) &&
            app.examStatus === "Examination Scheduled"
              ? { ...app, examStatus: "Examination Activated", examId: exam.id }
              : app
          )
        );
        addLog(
          "ACTIVATE_EXAM",
          `Activated examination '${exam.title}' (ID: ${exam.id}). Ready for candidate sign-in.`,
          officerName,
          exam.id
        );
        showToast("Examination Activated! Stand by to START EXAM.");
        setConfirmModal(null);
      }
    });
  };

  const handleStartExam = (exam: EntranceExamSchedule) => {
    setConfirmModal({
      isOpen: true,
      title: "Are you sure you want to start this examination?",
      description:
        "Once started, eligible applicants will be able to access and begin the examination immediately. The countdown timer will commence for candidates as they enter.",
      actionText: "START EXAM",
      variant: "success",
      onConfirm: () => {
        const now = new Date().toISOString();
        updateExam(exam.id, { status: "In Progress", startedAt: now });
        // Update activated applicants to In Progress or ready
        setApplicants(prev =>
          prev.map(app =>
            app.examId === exam.id && app.examStatus === "Examination Activated"
              ? { ...app, examStatus: "Examination In Progress", examStartedAt: now }
              : app
          )
        );
        addLog(
          "START_EXAM",
          `Started live examination session '${exam.title}' (ID: ${exam.id}). Applicants granted full CBT access.`,
          officerName,
          exam.id
        );
        showToast("Examination is now LIVE & IN PROGRESS! 🚀");
        setConfirmModal(null);
      }
    });
  };

  const handlePauseExam = (exam: EntranceExamSchedule) => {
    setConfirmModal({
      isOpen: true,
      title: "PAUSE ENTRANCE EXAMINATION?",
      description:
        "Pausing will temporarily freeze the examination access for all candidates. Applicants will see a paused notice until resumed.",
      actionText: "PAUSE EXAM",
      variant: "warning",
      onConfirm: () => {
        const now = new Date().toISOString();
        updateExam(exam.id, { status: "Paused", pausedAt: now });
        addLog(
          "PAUSE_EXAM",
          `Paused examination session '${exam.title}' (ID: ${exam.id}).`,
          officerName,
          exam.id
        );
        showToast("Examination session PAUSED.");
        setConfirmModal(null);
      }
    });
  };

  const handleEndExam = (exam: EntranceExamSchedule) => {
    setConfirmModal({
      isOpen: true,
      title: "Are you sure you want to END this examination?",
      description:
        "CRITICAL ACTION: Ending the exam will immediately stop all active candidate sessions, force-submit any incomplete papers, and lock the examination portal. This action cannot be undone.",
      actionText: "END EXAM",
      variant: "danger",
      onConfirm: () => {
        const now = new Date().toISOString();
        updateExam(exam.id, { status: "Ended", endedAt: now });
        // Auto-finalize any in-progress applicants
        setApplicants(prev =>
          prev.map(app => {
            if (app.examId === exam.id && app.examStatus === "Examination In Progress") {
              const simulatedScore = app.examScore || Math.floor(Math.random() * 8) + 12; // 12-20
              const percentage = Math.round((simulatedScore / 20) * 100);
              return {
                ...app,
                examStatus: "Examination Completed",
                examCompletedAt: now,
                examScore: simulatedScore,
                examPercentage: percentage,
                reviewerNotes: `Exam concluded by Admission Officer. Final score: ${simulatedScore}/20 (${percentage}%).`
              };
            }
            if (app.examId === exam.id && app.examStatus === "Examination Activated") {
              return {
                ...app,
                examStatus: "Examination Ended"
              };
            }
            return app;
          })
        );
        addLog(
          "END_EXAM",
          `Ended examination session '${exam.title}' (ID: ${exam.id}). Submissions finalized and locked.`,
          officerName,
          exam.id
        );
        showToast("Examination session ended and finalized.");
        setConfirmModal(null);
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Action Handlers (Exam Scheduling & Rescheduling)
  // ---------------------------------------------------------------------------
  const handleSaveExamSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExamId) {
      updateExam(editingExamId, {
        title: examFormData.title,
        session: examFormData.session,
        eligibleClasses: examFormData.eligibleClasses,
        examDate: examFormData.examDate,
        startTime: examFormData.startTime,
        endTime: examFormData.endTime,
        durationMinutes: Number(examFormData.durationMinutes),
        subjects: examFormData.subjects,
        venue: examFormData.venue,
        passCutoff: Number(examFormData.passCutoff)
      });
      addLog(
        "UPDATE_EXAMINATION",
        `Updated examination schedule '${examFormData.title}' to date ${examFormData.examDate} at ${examFormData.startTime}.`,
        officerName,
        editingExamId
      );
      showToast("Examination schedule updated successfully!");
    } else {
      const newExam = addExam({
        title: examFormData.title,
        session: examFormData.session,
        eligibleClasses: examFormData.eligibleClasses,
        examDate: examFormData.examDate,
        startTime: examFormData.startTime,
        endTime: examFormData.endTime,
        durationMinutes: Number(examFormData.durationMinutes),
        subjects: examFormData.subjects,
        venue: examFormData.venue,
        status: "Scheduled", // Saved in advance as Scheduled!
        passCutoff: Number(examFormData.passCutoff),
        questions: defaultExamQuestions,
        scheduledBy: officerName
      });
      addLog(
        "CREATE_EXAMINATION",
        `Created new examination '${newExam.title}' scheduled for ${newExam.examDate} (${newExam.startTime} - ${newExam.endTime}). Status: Scheduled.`,
        officerName,
        newExam.id
      );
      showToast("Entrance Examination scheduled successfully as 'Scheduled'!");
    }
    setShowScheduleModal(false);
    setEditingExamId(null);
  };

  const handleOpenEditExam = (exam: EntranceExamSchedule) => {
    setEditingExamId(exam.id);
    setExamFormData({
      title: exam.title,
      session: exam.session,
      eligibleClasses: exam.eligibleClasses,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      durationMinutes: exam.durationMinutes,
      subjects: exam.subjects,
      venue: exam.venue,
      passCutoff: exam.passCutoff
    });
    setShowScheduleModal(true);
  };

  // ---------------------------------------------------------------------------
  // Action Handlers (Applicant Registration & Management)
  // ---------------------------------------------------------------------------
  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    const names = newAppForm.fullName.trim().split(" ");
    const firstName = names[0] || "Applicant";
    const lastName = names.slice(1).join(" ") || "Candidate";

    const created = addApplicant({
      fullName: newAppForm.fullName,
      firstName,
      lastName,
      passportUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80",
      dob: newAppForm.dob,
      gender: newAppForm.gender,
      phone: newAppForm.phone,
      email: newAppForm.email,
      address: newAppForm.address,
      state: newAppForm.state,
      lga: newAppForm.lga,
      parentName: newAppForm.parentName,
      parentPhone: newAppForm.parentPhone,
      parentEmail: newAppForm.parentEmail,
      parentOccupation: newAppForm.parentOccupation,
      parentRelationship: "Parent/Guardian",
      previousSchool: newAppForm.previousSchool,
      classApplied: newAppForm.classApplied,
      applicationDate: new Date().toISOString().split("T")[0],
      status: newAppForm.status,
      examStatus: newAppForm.examStatus,
      examId: newAppForm.examId
    });

    addLog(
      "REGISTER_APPLICANT",
      `Registered new applicant ${created.fullName} (${created.applicationNumber}) for class ${created.classApplied}.`,
      officerName,
      created.id
    );

    showToast(`Applicant ${created.applicationNumber} registered successfully!`);
    setShowNewApplicantModal(false);
    setNewAppForm({
      fullName: "",
      gender: "Male",
      dob: "2013-05-15",
      phone: "",
      email: "",
      address: "Makurdi, Benue State",
      state: "Benue",
      lga: "Makurdi",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      parentOccupation: "Civil Servant",
      previousSchool: "",
      classApplied: "JSS 1",
      status: "Pending",
      examStatus: "Examination Scheduled",
      examId: currentExam?.id || ""
    });
  };

  const handleUpdateApplicantStatus = (
    applicant: ApplicantProfile,
    newStatus: ApplicantProfile["status"],
    notes?: string
  ) => {
    updateApplicant(applicant.id, {
      status: newStatus,
      reviewerNotes: notes || `Status updated to ${newStatus} by Admission Officer.`
    });
    addLog(
      "CHANGE_APPLICANT_STATUS",
      `Changed status of applicant ${applicant.fullName} (${applicant.applicationNumber}) from ${applicant.status} to ${newStatus}.`,
      officerName,
      applicant.id
    );
    showToast(`Applicant status updated to ${newStatus}`);
    if (viewingApplicant?.id === applicant.id) {
      setViewingApplicant(prev => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleUpdateApplicantExamStatus = (
    applicant: ApplicantProfile,
    newExamStatus: ApplicantProfile["examStatus"]
  ) => {
    updateApplicant(applicant.id, { examStatus: newExamStatus });
    addLog(
      "CHANGE_APPLICANT_EXAM_STATUS",
      `Updated exam status of ${applicant.fullName} (${applicant.applicationNumber}) to '${newExamStatus}'.`,
      officerName,
      applicant.id
    );
    showToast(`Exam status updated to ${newExamStatus}`);
    if (viewingApplicant?.id === applicant.id) {
      setViewingApplicant(prev => (prev ? { ...prev, examStatus: newExamStatus } : null));
    }
  };

  // Add Question to Selected Exam
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExamDetail) return;
    const newQ: ExamQuestion = {
      id: `Q-${Date.now().toString(36)}`,
      subject: newQuestionForm.subject,
      question: newQuestionForm.question,
      options: newQuestionForm.options.filter(o => o.trim().length > 0),
      correctAnswer: newQuestionForm.correctAnswer || newQuestionForm.options[0],
      marks: Number(newQuestionForm.marks) || 2
    };

    const updatedQuestions = [...(activeExamDetail.questions || []), newQ];
    updateExam(activeExamDetail.id, { questions: updatedQuestions });
    addLog(
      "ADD_EXAM_QUESTION",
      `Added question to ${activeExamDetail.title} under subject ${newQ.subject}.`,
      officerName,
      activeExamDetail.id
    );
    showToast("Question successfully added to examination question bank!");
    setShowQuestionModal(false);
    setNewQuestionForm({
      subject: "English Language",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 2
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* --------------------------------------------------------------------- */}
      {/* Top Banner & Control Deck Header */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck size={14} /> Official Role: Admission Officer
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${computedStatus.badgeBg}`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    computedStatus.status === "open"
                      ? "bg-emerald-500"
                      : computedStatus.status === "closed"
                      ? "bg-rose-500"
                      : "bg-amber-500"
                  }`}
                />
                {computedStatus.statusLabel}
              </span>
              {serverTime && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-slate-300 flex items-center gap-1">
                  <Clock size={12} /> Server Time: {serverTime}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-heading text-white">
              Admission Officer & Entrance Examination Command Center
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-1.5 max-w-3xl">
              Centralized authority for Emmanuel Secondary School's online admissions, applicant verification, and
              entrance examination lifecycle activation.
            </p>
          </div>

          {/* Master Control Buttons (Large & Clearly Labeled per Requirement 12) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {computedStatus.status === "open" ? (
              <Button
                size="lg"
                onClick={handleCloseAdmission}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 h-12 shadow-lg shadow-rose-900/30 gap-2 text-sm sm:text-base border border-rose-500"
              >
                <XCircle size={20} /> CLOSE ADMISSION
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleOpenAdmission}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 h-12 shadow-lg shadow-emerald-900/30 gap-2 text-sm sm:text-base border border-emerald-500"
              >
                <CheckCircle2 size={20} /> OPEN ADMISSION
              </Button>
            )}

            <Button
              size="lg"
              onClick={() => {
                setEditingExamId(null);
                setShowScheduleModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 h-12 shadow-lg shadow-indigo-900/30 gap-2 text-sm sm:text-base border border-indigo-500"
            >
              <Calendar size={20} /> SCHEDULE EXAM
            </Button>
          </div>
        </div>

        {/* Live Examination Quick Strip (Requirement 9 & 4) */}
        {currentExam && (
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2 flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  currentExam.status === "In Progress"
                    ? "bg-emerald-400 animate-ping"
                    : currentExam.status === "Activated"
                    ? "bg-amber-400"
                    : currentExam.status === "Paused"
                    ? "bg-orange-400"
                    : "bg-slate-400"
                }`}
              />
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Live Examination Session
                </div>
                <div className="font-bold text-white text-base truncate flex items-center gap-2">
                  {currentExam.title}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      currentExam.status === "In Progress"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : currentExam.status === "Activated"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : currentExam.status === "Paused"
                        ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    ● {currentExam.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Date: <strong className="text-white">{currentExam.examDate}</strong> | Time:{" "}
                  <strong className="text-white">
                    {currentExam.startTime} - {currentExam.endTime}
                  </strong>{" "}
                  ({currentExam.durationMinutes} Mins)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-black/30 px-3 py-2 rounded-lg border border-white/10">
                <span className="text-slate-400 block text-[10px]">TOTAL CANDIDATES</span>
                <span className="text-base font-bold text-cyan-300">{stats.scheduledForExam}</span>
              </div>
              <div className="bg-black/30 px-3 py-2 rounded-lg border border-white/10">
                <span className="text-slate-400 block text-[10px]">IN PROGRESS</span>
                <span className="text-base font-bold text-amber-300">{stats.inProgressExam}</span>
              </div>
              <div className="bg-black/30 px-3 py-2 rounded-lg border border-white/10">
                <span className="text-slate-400 block text-[10px]">COMPLETED</span>
                <span className="text-base font-bold text-emerald-300">{stats.completedExam}</span>
              </div>
            </div>

            {/* Direct Exam Controls */}
            <div className="flex items-center justify-end gap-2 flex-wrap">
              {currentExam.status === "Scheduled" && (
                <Button
                  size="sm"
                  onClick={() => handleActivateExam(currentExam)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 px-3 py-2 h-9 border border-amber-400"
                >
                  <Zap size={15} /> ACTIVATE EXAM
                </Button>
              )}

              {currentExam.status === "Activated" && (
                <Button
                  size="sm"
                  onClick={() => handleStartExam(currentExam)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 px-3 py-2 h-9 border border-emerald-400 shadow-md animate-bounce"
                >
                  <Play size={15} /> START EXAM
                </Button>
              )}

              {currentExam.status === "In Progress" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handlePauseExam(currentExam)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 px-3 py-2 h-9 border border-amber-400"
                  >
                    <Pause size={15} /> PAUSE EXAM
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEndExam(currentExam)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 px-3 py-2 h-9 border border-rose-400"
                  >
                    <StopCircle size={15} /> END EXAM
                  </Button>
                </>
              )}

              {currentExam.status === "Paused" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStartExam(currentExam)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 px-3 py-2 h-9 border border-emerald-400"
                  >
                    <Play size={15} /> RESUME EXAM
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEndExam(currentExam)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 px-3 py-2 h-9 border border-rose-400"
                  >
                    <StopCircle size={15} /> END EXAM
                  </Button>
                </>
              )}

              {currentExam.status === "Ended" && (
                <span className="text-xs text-slate-400 font-semibold italic">Exam Session Concluded</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-indigo-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="text-cyan-400 shrink-0" size={18} />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 10 Key Dashboard Metrics Grid (Requirement 9) */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Applications
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-slate-900 font-heading">{stats.totalApps}</span>
              <Users size={18} className="text-indigo-600" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Active 2026/2027 cycle</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Applications Today
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-emerald-600 font-heading">{stats.appsToday}</span>
              <Clock size={18} className="text-emerald-600" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Submitted last 24 hrs</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Pending Applications
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-amber-600 font-heading">{stats.pendingApps}</span>
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Awaiting officer review</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Approved Applicants
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-blue-600 font-heading">{stats.approvedApps}</span>
              <CheckCircle2 size={18} className="text-blue-600" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Cleared for examination</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Rejected Applicants
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-rose-600 font-heading">{stats.rejectedApps}</span>
              <XCircle size={18} className="text-rose-600" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Ineligible or incomplete</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Scheduled for Exam
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-purple-600 font-heading">{stats.scheduledForExam}</span>
              <Calendar size={18} className="text-purple-600" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Assigned CBT exam slot</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Present for Exam
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-cyan-600 font-heading">{stats.presentForExam}</span>
              <Radio size={18} className="text-cyan-600" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Signed in to test hall</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Completed Exam
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-emerald-600 font-heading">{stats.completedExam}</span>
              <Award size={18} className="text-emerald-600" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">CBT submissions received</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Yet to Write Exam
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold text-amber-600 font-heading">{stats.yetToWrite}</span>
              <Clock size={18} className="text-amber-600" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Pending / Upcoming</span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-slate-900 text-white">
          <CardContent className="p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Exam Status
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span
                className={`text-lg font-bold truncate ${
                  stats.currentExamStatus === "In Progress"
                    ? "text-emerald-400"
                    : stats.currentExamStatus === "Activated"
                    ? "text-amber-400"
                    : "text-white"
                }`}
              >
                {stats.currentExamStatus}
              </span>
              <Zap size={18} className="text-amber-400" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {currentExam ? currentExam.title : "No exam selected"}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* Navigation Sub-Tabs */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "overview"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Award size={16} /> Overview & Live Panel
        </button>

        <button
          onClick={() => setActiveTab("portal")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "portal"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Sliders size={16} /> Admission Portal Control
        </button>

        <button
          onClick={() => setActiveTab("applicants")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "applicants"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Users size={16} /> Applicants Roster ({applicants.length})
        </button>

        <button
          onClick={() => setActiveTab("exams")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "exams"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Calendar size={16} /> Entrance Exams ({exams.length})
        </button>

        <button
          onClick={() => setActiveTab("ai-generator")}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
            activeTab === "ai-generator"
              ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white shadow-md shadow-indigo-200 border-indigo-500"
              : "bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
          }`}
        >
          <Sparkles size={16} className={activeTab === "ai-generator" ? "text-amber-300 animate-spin" : "text-indigo-600"} />
          <span>AI QUESTION GENERATOR</span>
          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            AI
          </span>
        </button>

        <button
          onClick={() => setActiveTab("question-bank")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "question-bank"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <BookOpen size={16} /> Question Bank ({bankQuestions.length})
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "audit"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <History size={16} /> Audit Logs ({logs.length})
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & LIVE PANEL */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Live Exam Panel (Requirement 9 & 4) */}
          {currentExam && (
            <Card className="border-slate-200 overflow-hidden shadow-sm">
              <CardHeader className="bg-slate-900 text-white p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
                      Live Examination Dashboard
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-heading text-white mt-1">
                      {currentExam.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Session: {currentExam.session} | Venue: {currentExam.venue}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                        currentExam.status === "In Progress"
                          ? "bg-emerald-500 text-white animate-pulse"
                          : currentExam.status === "Activated"
                          ? "bg-amber-500 text-slate-950 font-extrabold"
                          : currentExam.status === "Paused"
                          ? "bg-orange-500 text-white"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      ● Current Status: {currentExam.status}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Live Exam Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500 block font-medium">Scheduled Date</span>
                    <span className="text-base font-bold text-slate-900">{currentExam.examDate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block font-medium">Time Window & Duration</span>
                    <span className="text-base font-bold text-slate-900">
                      {currentExam.startTime} - {currentExam.endTime} ({currentExam.durationMinutes} mins)
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block font-medium">Target Classes</span>
                    <span className="text-base font-bold text-slate-900">
                      {currentExam.eligibleClasses.join(", ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block font-medium">Subjects</span>
                    <span className="text-base font-bold text-slate-900">
                      {currentExam.subjects.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Candidate Flow Counter Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="text-xs font-bold text-indigo-700 uppercase block">Total Applicants</span>
                    <span className="text-3xl font-bold text-indigo-950 mt-1 block font-heading">
                      {stats.scheduledForExam}
                    </span>
                    <span className="text-[11px] text-indigo-600 mt-1 block">Scheduled for this exam</span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-xs font-bold text-amber-700 uppercase block">In Progress</span>
                    <span className="text-3xl font-bold text-amber-950 mt-1 block font-heading">
                      {stats.inProgressExam}
                    </span>
                    <span className="text-[11px] text-amber-600 mt-1 block">Currently answering questions</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-xs font-bold text-emerald-700 uppercase block">Completed</span>
                    <span className="text-3xl font-bold text-emerald-950 mt-1 block font-heading">
                      {stats.completedExam}
                    </span>
                    <span className="text-[11px] text-emerald-600 mt-1 block">Answers successfully submitted</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 uppercase block">Yet to Write</span>
                    <span className="text-3xl font-bold text-slate-900 mt-1 block font-heading">
                      {stats.yetToWrite}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">Pending entrance</span>
                  </div>
                </div>

                {/* Control Action Buttons Bar */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Admission Officer Live Action Trigger</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Applicants cannot begin until you press <strong className="text-emerald-400">START EXAM</strong>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      disabled={currentExam.status !== "Scheduled"}
                      onClick={() => handleActivateExam(currentExam)}
                      className={`font-bold px-5 h-11 text-sm ${
                        currentExam.status === "Scheduled"
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/40"
                          : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                      }`}
                    >
                      <Zap size={16} className="mr-1.5" /> 1. ACTIVATE EXAM
                    </Button>

                    <Button
                      disabled={currentExam.status !== "Activated" && currentExam.status !== "Paused"}
                      onClick={() => handleStartExam(currentExam)}
                      className={`font-bold px-6 h-11 text-sm ${
                        currentExam.status === "Activated" || currentExam.status === "Paused"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/40 animate-pulse"
                          : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                      }`}
                    >
                      <Play size={16} className="mr-1.5" /> 2. START EXAM
                    </Button>

                    <Button
                      disabled={currentExam.status !== "In Progress"}
                      onClick={() => handlePauseExam(currentExam)}
                      className={`font-bold px-4 h-11 text-sm ${
                        currentExam.status === "In Progress"
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                      }`}
                    >
                      <Pause size={16} className="mr-1.5" /> PAUSE EXAM
                    </Button>

                    <Button
                      disabled={currentExam.status !== "In Progress" && currentExam.status !== "Paused"}
                      onClick={() => handleEndExam(currentExam)}
                      className={`font-bold px-5 h-11 text-sm ${
                        currentExam.status === "In Progress" || currentExam.status === "Paused"
                          ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/40"
                          : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                      }`}
                    >
                      <StopCircle size={16} className="mr-1.5" /> END EXAM
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Roster & Recent Applications Table */}
          <Card className="border-slate-200">
            <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Recent Applications Received</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest online submissions awaiting processing or examination verification
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("applicants")}
                className="text-xs gap-1"
              >
                View Full Roster ({applicants.length}) <ChevronRight size={14} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="p-3">App Number & Name</th>
                      <th className="p-3">Class Applied</th>
                      <th className="p-3">Parent Info</th>
                      <th className="p-3">Application Status</th>
                      <th className="p-3">Entrance Exam Status</th>
                      <th className="p-3 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applicants.slice(0, 5).map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={app.passportUrl}
                              alt={app.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">{app.fullName}</div>
                              <span className="font-mono text-[11px] font-bold text-indigo-700">
                                {app.applicationNumber}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {app.classApplied}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-800">{app.parentName}</div>
                          <div className="text-slate-500 font-mono text-[11px]">{app.parentPhone}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              app.status === "Approved" || app.status === "Admitted"
                                ? "bg-emerald-100 text-emerald-800"
                                : app.status === "Rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              app.examStatus === "Examination Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : app.examStatus === "Examination In Progress"
                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                : app.examStatus === "Examination Scheduled"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {app.examStatus}
                          </span>
                          {app.examScore !== undefined && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Score: <strong>{app.examScore}/20</strong> ({app.examPercentage}%)
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingApplicant(app)}
                            className="h-8 text-xs gap-1"
                          >
                            <Eye size={12} /> View Profile
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: ADMISSION PORTAL CONTROL (Requirement 1) */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "portal" && (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold font-heading text-slate-900">
                    Online Admission Portal Control & Scheduling
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage opening dates, closing deadlines, automated cut-offs, and live portal accessibility.
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${computedStatus.badgeBg}`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      computedStatus.status === "open"
                        ? "bg-emerald-500 animate-pulse"
                        : computedStatus.status === "closed"
                        ? "bg-rose-500"
                        : "bg-amber-500"
                    }`}
                  />
                  Live Status: {computedStatus.statusLabel}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Status Explanation Card */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  computedStatus.status === "open"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : computedStatus.status === "closed"
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <div className="mt-0.5">
                  {computedStatus.status === "open" && <CheckCircle2 className="text-emerald-600" size={20} />}
                  {computedStatus.status === "closed" && <XCircle className="text-rose-600" size={20} />}
                  {computedStatus.status === "not_yet_open" && <Clock className="text-amber-600" size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{computedStatus.statusLabel}</h4>
                  <p className="text-xs mt-0.5">{computedStatus.reason}</p>
                </div>
              </div>

              {/* Master Open / Close Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-emerald-900 text-base flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      Activate / Reopen Admission Portal
                    </h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      Enables the public application form. Parents and prospective students can submit new applications.
                    </p>
                  </div>
                  <Button
                    onClick={handleOpenAdmission}
                    disabled={computedStatus.status === "open"}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 gap-2 text-base shadow-md disabled:opacity-50"
                  >
                    <CheckCircle2 size={20} /> OPEN ADMISSION
                  </Button>
                </div>

                <div className="p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/50 flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-rose-900 text-base flex items-center gap-2">
                      <XCircle size={18} className="text-rose-600" />
                      Deactivate / Close Admission Portal
                    </h4>
                    <p className="text-xs text-rose-700 mt-1">
                      Manually deactivates new submissions immediately. Prevents any unauthorized registrations.
                    </p>
                  </div>
                  <Button
                    onClick={handleCloseAdmission}
                    disabled={computedStatus.status === "closed"}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 gap-2 text-base shadow-md disabled:opacity-50"
                  >
                    <XCircle size={20} /> CLOSE ADMISSION
                  </Button>
                </div>
              </div>

              {/* Date & Time Schedule Form */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-600" />
                  Scheduled Opening & Closing Times
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">
                      Admission Opening Date & Time
                    </Label>
                    <Input
                      type="datetime-local"
                      value={control.openingDateTime}
                      onChange={e => updateControl({ openingDateTime: e.target.value })}
                      className="h-11"
                    />
                    <p className="text-[11px] text-slate-500">
                      Before this timestamp, the portal displays: <strong>🟡 Admission Not Yet Open</strong>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">
                      Admission Closing Date & Time
                    </Label>
                    <Input
                      type="datetime-local"
                      value={control.closingDateTime}
                      onChange={e => updateControl({ closingDateTime: e.target.value })}
                      className="h-11"
                    />
                    <p className="text-[11px] text-slate-500">
                      After this timestamp, the portal displays: <strong>🔴 Admission Closed</strong>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Active Academic Session</Label>
                    <Input
                      value={control.academicSession}
                      onChange={e => updateControl({ academicSession: e.target.value })}
                      className="h-11"
                      placeholder="e.g. 2026/2027"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Admission Officer Name</Label>
                    <Input
                      value={control.admissionOfficerName}
                      onChange={e => updateControl({ admissionOfficerName: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-700">
                      Automated Closing Protection
                    </Label>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <input
                        type="checkbox"
                        id="autoClose"
                        checked={control.autoCloseEnabled}
                        onChange={e => updateControl({ autoCloseEnabled: e.target.checked })}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="autoClose" className="text-xs text-slate-700 font-medium cursor-pointer">
                        <strong>Automatically close the admission portal</strong> when the scheduled closing date and
                        time is reached (Prevents any late submissions automatically).
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold text-slate-700">Public Portal Announcement</Label>
                    <textarea
                      rows={3}
                      value={control.noticeMessage}
                      onChange={e => updateControl({ noticeMessage: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter announcement to display to candidates..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => {
                      addLog(
                        "UPDATE_PORTAL_SCHEDULE",
                        `Updated portal schedule. Opening: ${control.openingDateTime}, Closing: ${control.closingDateTime}.`,
                        officerName
                      );
                      showToast("Portal schedule & settings saved successfully!");
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 h-11 text-sm gap-2"
                  >
                    <Check size={16} /> Save Portal Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: APPLICANTS ROSTER (Requirement 2 & 8) */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "applicants" && (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold font-heading text-slate-900">
                  Applicant Profiles & Registration Directory
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Unique application numbers, parental credentials, class levels, and entrance examination progress.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowNewApplicantModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-10 px-4"
                >
                  <Plus size={16} /> Register New Applicant
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Search and Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <Input
                    placeholder="Search by name, app no, phone..."
                    value={applicantSearch}
                    onChange={e => setApplicantSearch(e.target.value)}
                    className="pl-9 h-10 text-xs"
                  />
                </div>

                <div>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                    value={filterClass}
                    onChange={e => setFilterClass(e.target.value)}
                  >
                    <option value="All">All Classes Applied</option>
                    {CLASSES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                    value={filterAppStatus}
                    onChange={e => setFilterAppStatus(e.target.value)}
                  >
                    <option value="All">All Application Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Admitted">Admitted</option>
                  </select>
                </div>

                <div>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                    value={filterExamStatus}
                    onChange={e => setFilterExamStatus(e.target.value)}
                  >
                    <option value="All">All Exam Statuses</option>
                    <option value="Examination Not Scheduled">Not Scheduled</option>
                    <option value="Examination Scheduled">Scheduled</option>
                    <option value="Examination Activated">Activated</option>
                    <option value="Examination In Progress">In Progress</option>
                    <option value="Examination Completed">Completed</option>
                    <option value="Examination Ended">Ended</option>
                    <option value="Examination Disqualified">Disqualified</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="p-3">Application Number & Candidate</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">DOB & Gender</th>
                      <th className="p-3">Parent / Guardian Contact</th>
                      <th className="p-3">Application Status</th>
                      <th className="p-3">Entrance Exam Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplicants.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                          No applicants matched your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredApplicants.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={app.passportUrl}
                                alt={app.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{app.fullName}</div>
                                <div className="font-mono text-[11px] font-bold text-indigo-700">
                                  {app.applicationNumber}
                                </div>
                                <span className="text-[10px] text-slate-400">ID: {app.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              {app.classApplied}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]">
                              {app.previousSchool}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-800">{app.dob}</div>
                            <span className="text-slate-500">{app.gender}</span>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-900">{app.parentName}</div>
                            <div className="font-mono text-slate-600 text-[11px]">{app.parentPhone}</div>
                            <div className="text-slate-400 text-[10px]">{app.parentEmail}</div>
                          </td>
                          <td className="p-3">
                            <select
                              value={app.status}
                              onChange={e =>
                                handleUpdateApplicantStatus(app, e.target.value as ApplicantProfile["status"])
                              }
                              className={`text-[11px] font-bold rounded-md px-2 py-1 border font-sans ${
                                app.status === "Approved" || app.status === "Admitted"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : app.status === "Rejected"
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Admitted">Admitted</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold block w-fit ${
                                app.examStatus === "Examination Completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : app.examStatus === "Examination In Progress"
                                  ? "bg-amber-100 text-amber-800 animate-pulse"
                                  : app.examStatus === "Examination Activated"
                                  ? "bg-cyan-100 text-cyan-800"
                                  : app.examStatus === "Examination Scheduled"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : app.examStatus === "Examination Disqualified"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {app.examStatus}
                            </span>
                            {app.examScore !== undefined && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                Score: <strong>{app.examScore}/20</strong> ({app.examPercentage}%)
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingApplicant(app)}
                              className="h-8 text-xs gap-1 font-semibold"
                            >
                              <Eye size={12} /> View Full Profile
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 4: ENTRANCE EXAMS MANAGEMENT (Requirement 3 & 4) */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "exams" && (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold font-heading text-slate-900">
                  Entrance Examinations Repository
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Schedule, configure subjects, question sets, and manage candidate activation controls.
                </p>
              </div>

              <Button
                onClick={() => {
                  setEditingExamId(null);
                  setShowScheduleModal(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-10 px-4"
              >
                <Plus size={16} /> Create Entrance Exam
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {exams.map(exam => {
                  const examApplicants = applicants.filter(a => a.examId === exam.id);
                  const completed = examApplicants.filter(a => a.examStatus === "Examination Completed").length;
                  const inProgress = examApplicants.filter(a => a.examStatus === "Examination In Progress").length;

                  return (
                    <div
                      key={exam.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        exam.status === "In Progress"
                          ? "bg-emerald-50/50 border-emerald-300 shadow-md"
                          : exam.status === "Activated"
                          ? "bg-amber-50/50 border-amber-300 shadow-md"
                          : "bg-white border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                              {exam.id}
                            </span>
                            <span
                              className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                                exam.status === "In Progress"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse"
                                  : exam.status === "Activated"
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : exam.status === "Paused"
                                  ? "bg-orange-100 text-orange-800 border border-orange-300"
                                  : exam.status === "Ended"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              Status: {exam.status}
                            </span>
                            <span className="text-xs text-slate-500 font-semibold">
                              Session: {exam.session}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold font-heading text-slate-900">{exam.title}</h3>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-semibold">
                              <Calendar size={14} className="text-indigo-600" />
                              Date: {exam.examDate}
                            </span>
                            <span className="flex items-center gap-1 font-semibold">
                              <Clock size={14} className="text-indigo-600" />
                              Time: {exam.startTime} - {exam.endTime} ({exam.durationMinutes} mins)
                            </span>
                            <span>
                              Venue: <strong>{exam.venue}</strong>
                            </span>
                            <span>
                              Pass Cutoff: <strong>{exam.passCutoff}%</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span className="text-xs text-slate-500 font-medium">Eligible Classes:</span>
                            {exam.eligibleClasses.map(c => (
                              <span
                                key={c}
                                className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                              >
                                {c}
                              </span>
                            ))}
                            <span className="text-xs text-slate-400 mx-1">|</span>
                            <span className="text-xs text-slate-500 font-medium">Subjects:</span>
                            {exam.subjects.map(s => (
                              <span
                                key={s}
                                className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Candidates stats and Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
                            <div>Candidates: <strong className="text-slate-900">{examApplicants.length}</strong></div>
                            <div>In Progress: <strong className="text-amber-600">{inProgress}</strong></div>
                            <div>Completed: <strong className="text-emerald-600">{completed}</strong></div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {exam.status === "Scheduled" && (
                              <Button
                                size="sm"
                                onClick={() => handleActivateExam(exam)}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1 h-9"
                              >
                                <Zap size={14} /> ACTIVATE
                              </Button>
                            )}

                            {exam.status === "Activated" && (
                              <Button
                                size="sm"
                                onClick={() => handleStartExam(exam)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 h-9"
                              >
                                <Play size={14} /> START EXAM
                              </Button>
                            )}

                            {exam.status === "In Progress" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handlePauseExam(exam)}
                                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1 h-9"
                                >
                                  <Pause size={14} /> PAUSE
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleEndExam(exam)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1 h-9"
                                >
                                  <StopCircle size={14} /> END EXAM
                                </Button>
                              </>
                            )}

                            {exam.status === "Paused" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStartExam(exam)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 h-9"
                                >
                                  <Play size={14} /> RESUME
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleEndExam(exam)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1 h-9"
                                >
                                  <StopCircle size={14} /> END EXAM
                                </Button>
                              </>
                            )}

                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedExamId(exam.id);
                                setActiveTab("ai-generator");
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-9 shadow-sm"
                            >
                              <Sparkles size={13} className="text-amber-300" /> AI Questions ({exam.questions?.length || 0})
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditExam(exam)}
                              className="text-xs h-9"
                            >
                              Edit / Reschedule
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB: AI QUESTION GENERATOR (Requirement 1 & 2) */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "ai-generator" && (
        <AIQuestionGenerator
          exams={exams}
          onSaveToExam={(examId, qList) => {
            const target = exams.find(e => e.id === examId);
            if (!target) return;
            const existing = target.questions || [];
            const merged = [...existing, ...qList];
            updateExam(examId, { questions: merged });
            addLog(
              "AI_ATTACH_QUESTIONS_TO_EXAM",
              `Generated and attached ${qList.length} questions to entrance examination ${target.title}. Exam now has ${merged.length} questions.`,
              officerName,
              examId
            );
            showToast(`Added ${qList.length} questions to ${target.title}!`);
          }}
          onSaveToQuestionBank={qList => {
            addQuestionsBulkToBank(qList, "AI Generated", officerName);
            addLog(
              "SAVE_AI_QUESTIONS_TO_BANK",
              `Saved ${qList.length} AI-generated questions to permanent Question Bank repository.`,
              officerName
            );
            showToast(`Saved ${qList.length} questions to Question Bank!`);
          }}
          officerName={officerName}
        />
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB: PERMANENT QUESTION BANK (Requirement 7) */}
      {/* --------------------------------------------------------------------- */}
      {(activeTab === "question-bank" || activeTab === "questions") && (
        <QuestionBankManager
          exams={exams}
          onAddQuestionsToExam={(examId, qList) => {
            const target = exams.find(e => e.id === examId);
            if (!target) return;
            const existing = target.questions || [];
            const merged = [...existing, ...qList];
            updateExam(examId, { questions: merged });
            addLog(
              "REUSE_BANK_QUESTIONS_IN_EXAM",
              `Reused ${qList.length} questions from Question Bank in ${target.title}. Exam now has ${merged.length} questions.`,
              officerName,
              examId
            );
            showToast(`Added ${qList.length} questions to ${target.title}!`);
          }}
          officerName={officerName}
        />
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 6: AUDIT LOGS (Requirement 10) */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="p-6 border-b border-slate-100">
              <CardTitle className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
                <History className="text-indigo-600" />
                Admission Officer Security & Activity Audit Trail
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Immutable chronological log of all portal activations, exam scheduling, status modifications, and candidate transitions.
              </p>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="p-3.5">Log ID & Timestamp</th>
                      <th className="p-3.5">Officer Name & Role</th>
                      <th className="p-3.5">Action Code</th>
                      <th className="p-3.5">Operation Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-mono text-slate-900 font-bold">{log.id}</div>
                          <div className="text-slate-500 text-[11px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{log.officerName}</div>
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            {log.officerRole}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                              log.action.includes("START") || log.action.includes("OPEN")
                                ? "bg-emerald-100 text-emerald-800"
                                : log.action.includes("END") || log.action.includes("CLOSE")
                                ? "bg-rose-100 text-rose-800"
                                : log.action.includes("ACTIVATE") || log.action.includes("PAUSE")
                                ? "bg-amber-100 text-amber-800"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-800">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: VIEW FULL APPLICANT PROFILE */}
      {/* --------------------------------------------------------------------- */}
      {viewingApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-3">
                <img
                  src={viewingApplicant.passportUrl}
                  alt={viewingApplicant.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h3 className="text-lg font-bold font-heading">{viewingApplicant.fullName}</h3>
                  <div className="font-mono text-xs text-amber-400 font-bold">
                    {viewingApplicant.applicationNumber} • Class: {viewingApplicant.classApplied}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingApplicant(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Status Header Bar */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Application Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={viewingApplicant.status}
                      onChange={e =>
                        handleUpdateApplicantStatus(
                          viewingApplicant,
                          e.target.value as ApplicantProfile["status"]
                        )
                      }
                      className="font-bold text-xs p-1.5 rounded border border-slate-300 bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Admitted">Admitted</option>
                    </select>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Entrance Exam Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={viewingApplicant.examStatus}
                      onChange={e =>
                        handleUpdateApplicantExamStatus(
                          viewingApplicant,
                          e.target.value as ApplicantProfile["examStatus"]
                        )
                      }
                      className="font-bold text-xs p-1.5 rounded border border-slate-300 bg-white"
                    >
                      <option value="Examination Not Scheduled">Not Scheduled</option>
                      <option value="Examination Scheduled">Scheduled</option>
                      <option value="Examination Activated">Activated</option>
                      <option value="Examination In Progress">In Progress</option>
                      <option value="Examination Completed">Completed</option>
                      <option value="Examination Ended">Ended</option>
                      <option value="Examination Disqualified">Disqualified</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 border-b pb-1">
                  1. Applicant Bio-Data
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                    <span className="font-semibold">{viewingApplicant.dob}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gender</span>
                    <span className="font-semibold">{viewingApplicant.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">State of Origin / LGA</span>
                    <span className="font-semibold">
                      {viewingApplicant.state} / {viewingApplicant.lga}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Applicant Phone</span>
                    <span className="font-semibold">{viewingApplicant.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Applicant Email</span>
                    <span className="font-semibold">{viewingApplicant.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Previous School</span>
                    <span className="font-semibold">{viewingApplicant.previousSchool || "N/A"}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 block text-[10px]">Residential Address</span>
                    <span className="font-semibold">{viewingApplicant.address}</span>
                  </div>
                </div>
              </div>

              {/* Parent Details */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 border-b pb-1">
                  2. Parent / Guardian Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Parent/Guardian Name</span>
                    <span className="font-semibold">{viewingApplicant.parentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Relationship</span>
                    <span className="font-semibold">{viewingApplicant.parentRelationship || "Father"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Occupation</span>
                    <span className="font-semibold">{viewingApplicant.parentOccupation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Phone</span>
                    <span className="font-semibold font-mono">{viewingApplicant.parentPhone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Contact Email</span>
                    <span className="font-semibold">{viewingApplicant.parentEmail}</span>
                  </div>
                </div>
              </div>

              {/* Exam Score & Review Notes */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 border-b pb-1">
                  3. Examination Score & Reviewer Notes
                </h4>
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-900">Recorded Exam Score:</span>
                    <span className="font-bold text-base text-indigo-950 font-mono">
                      {viewingApplicant.examScore !== undefined
                        ? `${viewingApplicant.examScore} / 20 (${viewingApplicant.examPercentage}%)`
                        : "Not yet examined"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Reviewer Notes / Assessment:</span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {viewingApplicant.reviewerNotes || "No notes recorded."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0">
              <Button variant="outline" onClick={() => setViewingApplicant(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: SCHEDULE NEW ENTRANCE EXAM (Requirement 3) */}
      {/* --------------------------------------------------------------------- */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold font-heading text-lg">
                  {editingExamId ? "Edit / Reschedule Entrance Exam" : "Schedule New Entrance Examination"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Prepares the examination in advance without making it accessible to students.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setEditingExamId(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveExamSchedule} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label>Examination Title</Label>
                <Input
                  required
                  value={examFormData.title}
                  onChange={e => setExamFormData({ ...examFormData, title: e.target.value })}
                  placeholder="e.g. Batch B Entrance Examination 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Academic Session</Label>
                  <Input
                    required
                    value={examFormData.session}
                    onChange={e => setExamFormData({ ...examFormData, session: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Examination Date</Label>
                  <Input
                    type="date"
                    required
                    value={examFormData.examDate}
                    onChange={e => setExamFormData({ ...examFormData, examDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    required
                    value={examFormData.startTime}
                    onChange={e => setExamFormData({ ...examFormData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    required
                    value={examFormData.endTime}
                    onChange={e => setExamFormData({ ...examFormData, endTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Duration (Minutes)</Label>
                  <Input
                    type="number"
                    required
                    min={15}
                    max={240}
                    value={examFormData.durationMinutes}
                    onChange={e =>
                      setExamFormData({ ...examFormData, durationMinutes: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Venue</Label>
                <Input
                  required
                  value={examFormData.venue}
                  onChange={e => setExamFormData({ ...examFormData, venue: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Pass Cutoff Mark (%)</Label>
                <Input
                  type="number"
                  required
                  min={30}
                  max={100}
                  value={examFormData.passCutoff}
                  onChange={e =>
                    setExamFormData({ ...examFormData, passCutoff: Number(e.target.value) })
                  }
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                <strong>Important Note:</strong> This examination will be saved with the status{" "}
                <span className="font-bold uppercase underline">Scheduled</span>. It will NOT be accessible
                to applicants until you manually press <strong className="uppercase">START EXAM</strong> on
                the examination day.
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowScheduleModal(false);
                    setEditingExamId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  {editingExamId ? "Save Changes" : "Save Examination as Scheduled"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: REGISTER APPLICANT */}
      {/* --------------------------------------------------------------------- */}
      {showNewApplicantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold font-heading text-lg">Register New Applicant Profile</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generates an official Application Number (e.g. ESS/ADM/2026/XXX).
                </p>
              </div>
              <button onClick={() => setShowNewApplicantModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label>Applicant Full Name</Label>
                <Input
                  required
                  placeholder="e.g. Terseer Matthew Tyover"
                  value={newAppForm.fullName}
                  onChange={e => setNewAppForm({ ...newAppForm, fullName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white"
                    value={newAppForm.gender}
                    onChange={e =>
                      setNewAppForm({ ...newAppForm, gender: e.target.value as "Male" | "Female" })
                    }
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    required
                    value={newAppForm.dob}
                    onChange={e => setNewAppForm({ ...newAppForm, dob: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Class Applied For</Label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium"
                    value={newAppForm.classApplied}
                    onChange={e => setNewAppForm({ ...newAppForm, classApplied: e.target.value })}
                  >
                    {CLASSES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Previous School</Label>
                  <Input
                    required
                    placeholder="e.g. St. Francis Primary School"
                    value={newAppForm.previousSchool}
                    onChange={e => setNewAppForm({ ...newAppForm, previousSchool: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Parent/Guardian Full Name</Label>
                  <Input
                    required
                    value={newAppForm.parentName}
                    onChange={e => setNewAppForm({ ...newAppForm, parentName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Parent Contact Phone</Label>
                  <Input
                    required
                    placeholder="+234 800 000 0000"
                    value={newAppForm.parentPhone}
                    onChange={e => setNewAppForm({ ...newAppForm, parentPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Parent Email Address</Label>
                <Input
                  type="email"
                  required
                  placeholder="parent@example.com"
                  value={newAppForm.parentEmail}
                  onChange={e => setNewAppForm({ ...newAppForm, parentEmail: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Residential Address</Label>
                <Input
                  required
                  value={newAppForm.address}
                  onChange={e => setNewAppForm({ ...newAppForm, address: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowNewApplicantModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Generate Application Number & Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: ADD QUESTION TO EXAM (Requirement 3) */}
      {/* --------------------------------------------------------------------- */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold font-heading text-lg">Add Question to Question Bank</h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium"
                  value={newQuestionForm.subject}
                  onChange={e => setNewQuestionForm({ ...newQuestionForm, subject: e.target.value })}
                >
                  <option value="English Language">English Language</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="General Aptitude">General Aptitude</option>
                  <option value="Basic Science">Basic Science</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Question Text</Label>
                <textarea
                  required
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium"
                  placeholder="Enter the question..."
                  value={newQuestionForm.question}
                  onChange={e => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Four Multiple Choice Options</Label>
                {newQuestionForm.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-700">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <Input
                      required
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={e => {
                        const newOpts = [...newQuestionForm.options];
                        newOpts[i] = e.target.value;
                        setNewQuestionForm({ ...newQuestionForm, options: newOpts });
                      }}
                    />
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={newQuestionForm.correctAnswer === opt && opt !== ""}
                      onChange={() => setNewQuestionForm({ ...newQuestionForm, correctAnswer: opt })}
                      title="Set as correct answer"
                      className="w-4 h-4 text-emerald-600"
                    />
                  </div>
                ))}
                <p className="text-[11px] text-slate-500">Select the radio button next to the correct answer.</p>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowQuestionModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Save Question
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CONFIRMATION MODAL (Requirement 12) */}
      {/* --------------------------------------------------------------------- */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-3 rounded-full shrink-0 ${
                  confirmModal.variant === "danger"
                    ? "bg-rose-100 text-rose-600"
                    : confirmModal.variant === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {confirmModal.variant === "danger" ? (
                  <StopCircle size={24} />
                ) : confirmModal.variant === "success" ? (
                  <Play size={24} />
                ) : (
                  <AlertTriangle size={24} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">{confirmModal.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{confirmModal.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmModal(null)}
                className="font-semibold text-xs"
              >
                CANCEL
              </Button>
              <Button
                onClick={confirmModal.onConfirm}
                className={`font-bold text-xs px-5 text-white ${
                  confirmModal.variant === "danger"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : confirmModal.variant === "success"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {confirmModal.actionText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
