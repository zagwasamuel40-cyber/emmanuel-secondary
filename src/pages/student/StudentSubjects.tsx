import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Input } from "@/src/components/ui";
import { useCbtQuestions } from "../../data/cbtQuestions";
import { StudentReportCard } from "../../components/StudentReportCard";
import { 
  BookOpen, Clock, Download, PlayCircle, Edit3, CheckCircle2, Award, 
  FileText, UploadCloud, X, AlertTriangle, Lock, Paperclip, FileUp, 
  FileCheck, Trash2, Eye, Sparkles, Check, Video, Film, Play, Plus,
  Key, ShieldCheck, ShieldAlert, AlertCircle
} from "lucide-react";

import { useAssignments } from "../../data/assignmentsData";
import { useExams } from "../../data/examsData";
import { useVideoLessons, VideoLesson } from "../../data/videoLessonsData";
import { VideoPlayer } from "../../components/ui/VideoPlayer";

import { isResultReleased, useResultsRelease } from "../../data/resultsReleaseData";
import { usePortalSettings } from "../../data/portalSettingsData";
import { useSessions } from "../../data/sessionsData";
import { useStudents, findStudentByIdentifier } from "../../data/studentsData";
import { SecureExamRunner } from "../../components/exam/SecureExamRunner";
import { ResultAccessVerification } from "../../components/pins/ResultAccessVerification";
import { ExamPinVerificationModal } from "../../components/pins/ExamPinVerificationModal";
import { 
  getVerifiedResultSession, 
  clearVerifiedResultSession, 
  getPinConfig, 
  PinRecord 
} from "../../data/pinsData";

interface StudentSubjectsProps {
  defaultTab?: string;
}

export default function StudentSubjects({ defaultTab }: StudentSubjectsProps = {}) {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() => {
    if (defaultTab) return defaultTab;
    if (urlTab === "results") return "results";
    if (urlTab === "cbt") return "cbt";
    if (urlTab === "videos") return "videos";
    return "subjects";
  });

  useEffect(() => {
    if (urlTab === "results" || defaultTab === "results") {
      setActiveTab("results");
    } else if (urlTab === "cbt") {
      setActiveTab("cbt");
    }
  }, [urlTab, defaultTab]);

  const { assignments, submissions, setSubmissions } = useAssignments();
  const { exams } = useExams();
  const [submissionText, setSubmissionText] = useState("");
  const [activeSubmittingAss, setActiveSubmittingAss] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<{ name: string; size: string; type: string; dataUrl: string } | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<string>("");
  const assDocInputRef = useRef<HTMLInputElement>(null);

  // Video Lessons & Upload State
  const { lessons: videoLessons, addVideoLesson, incrementViews } = useVideoLessons();
  const [selectedVideoLesson, setSelectedVideoLesson] = useState<VideoLesson | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");
  const [showUploadVideoModal, setShowUploadVideoModal] = useState<boolean>(false);
  const [videoUploadMode, setVideoUploadMode] = useState<"file" | "link">("file");
  const [videoFileMeta, setVideoFileMeta] = useState<{ name: string; size: string; type: string; dataUrl: string } | null>(null);
  const [videoLinkUrl, setVideoLinkUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoSubject, setVideoSubject] = useState("Mathematics");
  const [videoTargetClass, setVideoTargetClass] = useState("All Classes");
  const [videoPresenter, setVideoPresenter] = useState("");
  const [videoDuration, setVideoDuration] = useState("25");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoUploadError, setVideoUploadError] = useState("");
  const [videoUploadSuccess, setVideoUploadSuccess] = useState("");
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setVideoUploadError("File size exceeds 25MB limit. Please compress or link via YouTube/Vimeo/Cloud URL.");
      return;
    }
    setVideoUploadError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setVideoFileMeta({
        name: file.name,
        size: sizeStr,
        type: file.type || "video/mp4",
        dataUrl: event.target?.result as string
      });
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublishVideoLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      setVideoUploadError("Please provide a title for the video lesson.");
      return;
    }
    const finalUrl = videoUploadMode === "file" ? videoFileMeta?.dataUrl : videoLinkUrl.trim();
    if (!finalUrl) {
      setVideoUploadError(videoUploadMode === "file" ? "Please select a video file to upload." : "Please provide a valid video URL.");
      return;
    }

    addVideoLesson({
      title: videoTitle.trim(),
      subject: videoSubject,
      targetClass: videoTargetClass,
      teacherName: videoPresenter.trim() || currentStudent?.name || "Instructor / Student",
      teacherId: currentStudent?.id || "USR-2026",
      description: videoDescription.trim() || "Uploaded video lesson / recorded presentation.",
      videoUrl: finalUrl,
      mediaType: videoUploadMode === "file" ? "direct" : (videoLinkUrl.includes("youtu") ? "youtube" : videoLinkUrl.includes("vimeo") ? "vimeo" : "direct"),
      durationMinutes: parseInt(videoDuration) || 20,
      fileSize: videoFileMeta?.size || "Online Stream",
      thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
      tags: [videoSubject, "Video Lesson", videoTargetClass]
    });

    setVideoTitle("");
    setVideoFileMeta(null);
    setVideoLinkUrl("");
    setVideoDescription("");
    setVideoUploadError("");
    setShowUploadVideoModal(false);
    setVideoUploadSuccess("Video lesson published successfully! You and your classmates can now watch it.");
    setTimeout(() => setVideoUploadSuccess(""), 4000);
  };

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
  const loggedInId = localStorage.getItem('loggedInStudentId');
  const currentStudent = findStudentByIdentifier(loggedInId, students);
  const studentClass = currentStudent ? currentStudent.class : "SSS 3A";

  const [cbtQIndex, setCbtQIndex] = useState(0);
  const [cbtAnswers, setCbtAnswers] = useState<Record<number, string>>({});
  const [cbtQuestions] = useCbtQuestions();
  const [activeCbtExam, setActiveCbtExam] = useState<any>(null);

  // CBT / Exam PIN Modal State
  const [showExamPinModal, setShowExamPinModal] = useState(false);
  const [targetExamForPin, setTargetExamForPin] = useState<any>(null);
  const [preExamNoticeExam, setPreExamNoticeExam] = useState<any>(null);
  const [lastExamResult, setLastExamResult] = useState<any>(null);

  // Result Access PIN State
  const [isResultPinVerified, setIsResultPinVerified] = useState<boolean>(() => {
    return getVerifiedResultSession(currentStudent?.id || "", sessions[1] || "2025/2026", "First Term");
  });
  const [verifiedPinRecord, setVerifiedPinRecord] = useState<PinRecord | null>(null);

  const handleStartCbt = (exam: any) => {
    const pinConfig = getPinConfig();
    if (pinConfig.requireExamPin || exam.accessCode) {
      setTargetExamForPin(exam);
      setShowExamPinModal(true);
    } else {
      setPreExamNoticeExam(exam);
    }
  };

  const handleLockResults = () => {
    clearVerifiedResultSession(currentStudent?.id);
    setIsResultPinVerified(false);
    setResultVisible(false);
    setVerifiedPinRecord(null);
  };

  const handleSessionChange = (newSession: string) => {
    setResSession(newSession);
    setReleaseError("");
    const isVerified = getVerifiedResultSession(currentStudent?.id || "", newSession, resTerm);
    setIsResultPinVerified(isVerified);
    if (!isVerified) {
      setResultVisible(false);
    }
  };

  const handleTermChange = (newTerm: string) => {
    setResTerm(newTerm);
    setReleaseError("");
    const isVerified = getVerifiedResultSession(currentStudent?.id || "", resSession, newTerm);
    setIsResultPinVerified(isVerified);
    if (!isVerified) {
      setResultVisible(false);
    }
  };

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
    return (
      <SecureExamRunner
        exam={{
          id: activeCbtExam?.id || "cbt-term-1",
          title: activeCbtExam?.title || "Terminal CBT Examination",
          subject: activeCbtExam?.subject || activeQuestions[0]?.subject || "Mathematics",
          durationMinutes: activeCbtExam?.duration || 45
        }}
        student={{
          id: currentStudent?.id || loggedInId || "ESS/2026/001",
          name: currentStudent?.name || "Student Candidate",
          class: currentStudent?.class || studentClass
        }}
        questions={activeQuestions}
        onComplete={(result) => {
          setExamActive(false);
          setExamSubmitted(true);
          setLastExamResult(result);
        }}
        onExit={() => {
          setExamActive(false);
        }}
      />
    );
  }

  if (!currentStudent) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Student Verification Required</h3>
        <p className="text-slate-600 text-sm">
          Please sign in with your student credentials to view your assigned subjects, CBT examinations, assignments, and terminal results.
        </p>
        <Link to="/login">
          <Button className="bg-brand-900 text-white hover:bg-brand-800 mt-2">
            Sign In to Student Portal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* PRE-EXAM SECURITY & FULLSCREEN READINESS AGREEMENT MODAL */}
      {preExamNoticeExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <Card className="w-full max-w-lg border-0 bg-slate-900 text-white shadow-2xl overflow-hidden rounded-3xl animate-in zoom-in-95">
            <CardHeader className="bg-slate-950 border-b border-slate-800 p-6 text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
                <Lock size={32} />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Secure Examination Environment
                </span>
                <CardTitle className="text-xl font-bold font-heading text-white mt-2">
                  {preExamNoticeExam.title} - {preExamNoticeExam.subject}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Duration: {preExamNoticeExam.duration || 45} Minutes &bull; {preExamNoticeExam.questions?.length || 5} Questions
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-5 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 space-y-2.5 leading-relaxed">
                <h4 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  <AlertTriangle size={16} /> Strict Anti-Cheating Protocol Notice:
                </h4>
                <ul className="space-y-2 text-slate-300 text-[11px] list-disc pl-4">
                  <li>
                    <strong className="text-white">Mandatory Fullscreen Mode:</strong> When you start, your browser will immediately expand to full screen. Exiting fullscreen will trigger an automatic submission with a violation report.
                  </li>
                  <li>
                    <strong className="text-white">No Tab or Application Switching:</strong> Switching browser tabs, minimizing the window, or opening other programs will be recorded and auto-submits your test immediately.
                  </li>
                  <li>
                    <strong className="text-white">Server-Enforced Timer:</strong> The countdown is controlled by the server. Refreshing the webpage will NOT reset the timer.
                  </li>
                  <li>
                    <strong className="text-white">Live Auto-Save:</strong> Every answer you select is saved instantly to the school's central examination server.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 h-11 text-xs"
                  onClick={() => setPreExamNoticeExam(null)}
                >
                  Cancel & Return
                </Button>
                <Button
                  variant="brand"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-xs shadow-lg shadow-emerald-900/40"
                  onClick={() => {
                    const examToRun = preExamNoticeExam;
                    setPreExamNoticeExam(null);
                    setActiveCbtExam(examToRun);
                    setExamActive(true);
                  }}
                >
                  I Understand & Start Examination &rarr;
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CBT / EXAM PIN VERIFICATION GATEWAY MODAL */}
      <ExamPinVerificationModal
        isOpen={showExamPinModal}
        onClose={() => {
          setShowExamPinModal(false);
          setTargetExamForPin(null);
        }}
        onSuccess={() => {
          setShowExamPinModal(false);
          const target = targetExamForPin;
          setTargetExamForPin(null);
          setPreExamNoticeExam(target);
        }}
        exam={targetExamForPin}
        student={{
          id: currentStudent?.id || loggedInId || "ESS/2026/001",
          name: currentStudent?.name || "Student Candidate",
          class: currentStudent?.class || studentClass,
        }}
      />

      {/* WATCH VIDEO LESSON MODAL */}
      {selectedVideoLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <Card className="w-full max-w-4xl border-0 bg-slate-900 text-white shadow-2xl overflow-hidden rounded-3xl animate-in zoom-in-95 flex flex-col max-h-[95vh]">
            <CardHeader className="bg-slate-950 border-b border-slate-800 p-4 sm:p-5 flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-600 text-white flex items-center gap-1.5 shrink-0">
                  <Play size={12} className="fill-white" /> {selectedVideoLesson.subject}
                </span>
                <span className="text-xs text-slate-400 font-medium truncate">
                  Target: <strong className="text-slate-200">{selectedVideoLesson.targetClass}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedVideoLesson(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </CardHeader>

            <div className="bg-black p-2 sm:p-4 shrink-0 flex items-center justify-center">
              <VideoPlayer
                src={selectedVideoLesson.videoUrl}
                title={selectedVideoLesson.title}
                poster={selectedVideoLesson.thumbnailUrl}
                controls
                autoPlay
                className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl"
              />
            </div>

            <CardContent className="p-5 sm:p-6 overflow-y-auto space-y-3 bg-slate-900 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <h3 className="text-xl font-bold font-heading text-white">
                  {selectedVideoLesson.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                  {selectedVideoLesson.durationMinutes && (
                    <span className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
                      <Clock size={12} /> {selectedVideoLesson.durationMinutes} mins
                    </span>
                  )}
                  <span className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
                    <Eye size={12} /> {selectedVideoLesson.viewsCount || 0} views
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Presenter: <strong className="text-slate-200">{selectedVideoLesson.teacherName}</strong></span>
                <span>Date: <strong className="text-slate-300">{selectedVideoLesson.createdAt}</strong></span>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {selectedVideoLesson.description}
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  variant="outline" 
                  className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 text-xs"
                  onClick={() => setSelectedVideoLesson(null)}
                >
                  Close Player
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* UPLOAD VIDEO LESSON / PROJECT MODAL */}
      {showUploadVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <Card className="w-full max-w-2xl border-0 bg-white shadow-2xl overflow-hidden rounded-3xl animate-in zoom-in-95 flex flex-col max-h-[92vh]">
            <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                    <Video size={18} />
                  </span>
                  <CardTitle className="text-white text-lg sm:text-xl font-bold font-heading">
                    Upload Video Lesson or Presentation
                  </CardTitle>
                </div>
                <p className="text-xs text-slate-300">
                  Share a recorded lecture, laboratory experiment, or class presentation with students.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUploadVideoModal(false);
                  setVideoUploadError("");
                  setVideoFileMeta(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </CardHeader>

            <form onSubmit={handlePublishVideoLesson} className="flex-1 overflow-y-auto p-6 space-y-5">
              {videoUploadError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                  {videoUploadError}
                </div>
              )}

              {/* Source Mode Toggle */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Video Source Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVideoUploadMode("file")}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      videoUploadMode === "file"
                        ? "bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <UploadCloud size={16} /> Direct Video File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoUploadMode("link")}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      videoUploadMode === "link"
                        ? "bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <PlayCircle size={16} /> Video Link (YouTube / Vimeo / MP4)
                  </button>
                </div>
              </div>

              {/* Direct File Dropzone */}
              {videoUploadMode === "file" ? (
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Select Video File (.mp4, .mov, .webm)</Label>
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    onChange={handleVideoFileSelect}
                    className="hidden"
                  />
                  {videoFileMeta ? (
                    <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                          <Video size={22} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-900 truncate">{videoFileMeta.name}</p>
                          <p className="text-xs text-emerald-700 font-semibold">{videoFileMeta.size} &bull; Ready to publish</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFileMeta(null);
                          if (videoFileInputRef.current) videoFileInputRef.current.value = "";
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                        title="Remove video file"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => videoFileInputRef.current?.click()}
                      className="p-6 border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/40 hover:bg-rose-50/70 rounded-2xl text-center cursor-pointer transition-all space-y-2"
                    >
                      <div className="w-12 h-12 bg-white rounded-2xl border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        Click or drag & drop video file here
                      </p>
                      <p className="text-xs text-slate-500">
                        Supports MP4, WebM, QuickTime MOV (Max: 25MB recommended)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Video Streaming URL</Label>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=... or https://domain.com/lecture.mp4"
                    value={videoLinkUrl}
                    onChange={(e) => setVideoLinkUrl(e.target.value)}
                    className="text-xs h-10"
                  />
                  <p className="text-[11px] text-slate-400">
                    Paste any YouTube, Vimeo, Google Storage, or direct MP4 stream URL.
                  </p>
                </div>
              )}

              {/* Live Preview Player if file/URL is selected */}
              {(videoFileMeta?.dataUrl || videoLinkUrl) && (
                <div className="space-y-1.5 p-3.5 bg-slate-900 rounded-2xl">
                  <div className="flex items-center justify-between text-xs text-slate-300 px-1">
                    <span className="font-bold flex items-center gap-1.5 text-rose-400">
                      <Sparkles size={13} /> Live Preview Check
                    </span>
                    <span className="text-[11px] text-slate-400">Ensure video renders and plays properly</span>
                  </div>
                  <div className="rounded-xl overflow-hidden aspect-video bg-black">
                    <VideoPlayer
                      src={videoUploadMode === "file" ? videoFileMeta?.dataUrl || "" : videoLinkUrl}
                      title={videoTitle || "Video Preview"}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-700">Lesson Title *</Label>
                  <Input
                    placeholder="e.g. Physics: Laws of Thermodynamics & Heat Transfer"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    required
                    className="text-xs h-10 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Subject</Label>
                  <select
                    value={videoSubject}
                    onChange={(e) => setVideoSubject(e.target.value)}
                    className="w-full text-xs h-10 rounded-xl border border-slate-300 bg-white px-3 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {["Mathematics", "Physics", "Chemistry", "Biology", "English Language", "Basic Science", "Agricultural Science", "Economics", "Geography", "Further Mathematics", "Civic Education"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Target Class</Label>
                  <select
                    value={videoTargetClass}
                    onChange={(e) => setVideoTargetClass(e.target.value)}
                    className="w-full text-xs h-10 rounded-xl border border-slate-300 bg-white px-3 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {["All Classes", "SSS 3A", "SSS 3B", "SSS 2A", "SSS 2B", "SSS 1A", "SSS 1B", "JSS 3", "JSS 2", "JSS 1"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Teacher / Presenter Name</Label>
                  <Input
                    placeholder="e.g. Dr. Mrs. Ojo / Emmanuel Eze"
                    value={videoPresenter}
                    onChange={(e) => setVideoPresenter(e.target.value)}
                    className="text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Duration (Minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="180"
                    placeholder="e.g. 35"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    className="text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-700">Lesson Description / Key Topics Covered</Label>
                  <textarea
                    rows={3}
                    placeholder="Detail the core objectives, formulas, or practice questions covered in this recorded session..."
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs h-10"
                  onClick={() => setShowUploadVideoModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 text-xs h-10 px-5 shadow-sm"
                >
                  <UploadCloud size={15} /> Publish Video Lesson
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">My Subjects & CBT</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your subjects, curriculum, online classes and results.</p>
        </div>
      </div>

      {videoUploadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in shadow-sm">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span className="font-semibold text-sm">{videoUploadSuccess}</span>
        </div>
      )}

      <div className="flex overflow-x-auto space-x-2 pb-2">
        {["subjects", "videos", "classes", "registration", "curriculum", "cbt", "results"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === tab
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab === "subjects" && "My Subjects"}
            {tab === "videos" && (
              <>
                <Video size={15} /> Video Lessons ({videoLessons.length})
              </>
            )}
            {tab === "classes" && "Online Classes & Assignments"}
            {tab === "registration" && "Subject Registration"}
            {tab === "curriculum" && "Curriculum"}
            {tab === "cbt" && "CBT Examination"}
            {tab === "results" && (
              <span className="flex items-center gap-1.5">
                <Lock size={14} className={activeTab === tab ? "text-amber-300" : "text-amber-600"} />
                My Results
                {isResultPinVerified && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="PIN Verified"></span>
                )}
              </span>
            )}
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

      {activeTab === "videos" && (
        <div className="space-y-6">
          {/* Top Banner & Upload Action */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1.5 uppercase tracking-wider">
                  <Film size={14} /> E-Learning Video Library
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                  Recorded Video Lessons & Lectures
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Stream high-definition recorded lessons uploaded by teachers, revise difficult concepts, or submit your own video project presentations.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Button 
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 shadow-lg shadow-rose-950/40 rounded-xl px-5 h-11"
                  onClick={() => {
                    setShowUploadVideoModal(true);
                    setVideoPresenter(currentStudent?.name || "");
                  }}
                >
                  <UploadCloud size={18} /> Upload Video Lesson / Project
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subject Filter Pills */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
                Subject Filter:
              </span>
              {["All", "Mathematics", "Physics", "English Language", "Basic Science", "Chemistry", "Biology"].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubjectFilter(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedSubjectFilter === sub
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong>{videoLessons.filter(l => selectedSubjectFilter === "All" || l.subject.toLowerCase() === selectedSubjectFilter.toLowerCase()).length}</strong> lessons
            </span>
          </div>

          {/* Video Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoLessons
              .filter(l => selectedSubjectFilter === "All" || l.subject.toLowerCase() === selectedSubjectFilter.toLowerCase())
              .map(lesson => (
                <Card 
                  key={lesson.id} 
                  className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col group bg-white border-slate-200"
                >
                  {/* Thumbnail / Video Preview Area */}
                  <div 
                    onClick={() => {
                      setSelectedVideoLesson(lesson);
                      incrementViews(lesson.id);
                    }}
                    className="aspect-video relative bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center"
                  >
                    {lesson.thumbnailUrl ? (
                      <img 
                        src={lesson.thumbnailUrl} 
                        alt={lesson.title} 
                        className="w-full h-full object-cover opacity-75 group-hover:scale-105 group-hover:opacity-60 transition-all duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950" />
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-rose-600 transition-all">
                        <Play size={24} className="ml-1 fill-white" />
                      </div>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow">
                        {lesson.subject}
                      </span>
                      <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                        {lesson.targetClass}
                      </span>
                    </div>

                    {/* Duration / Source Badge */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                      {lesson.durationMinutes && (
                        <span className="bg-black/80 backdrop-blur-md text-white text-xs font-mono px-2 py-0.5 rounded shadow flex items-center gap-1">
                          <Clock size={11} /> {lesson.durationMinutes}m
                        </span>
                      )}
                      {lesson.fileSize && (
                        <span className="bg-slate-800/80 backdrop-blur-md text-slate-200 text-[10px] px-2 py-0.5 rounded shadow">
                          {lesson.fileSize}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-600">{lesson.teacherName}</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> {lesson.viewsCount || 0} views</span>
                    </div>

                    <h4 
                      onClick={() => {
                        setSelectedVideoLesson(lesson);
                        incrementViews(lesson.id);
                      }}
                      className="font-bold text-slate-900 text-base leading-snug group-hover:text-rose-600 transition-colors cursor-pointer mb-2 line-clamp-2"
                    >
                      {lesson.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {lesson.description}
                    </p>

                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Added {lesson.createdAt}</span>
                      <Button
                        size="sm"
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1 text-xs rounded-xl shadow-xs"
                        onClick={() => {
                          setSelectedVideoLesson(lesson);
                          incrementViews(lesson.id);
                        }}
                      >
                        <Play size={12} className="fill-white" /> Watch Lecture
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {videoLessons.filter(l => selectedSubjectFilter === "All" || l.subject.toLowerCase() === selectedSubjectFilter.toLowerCase()).length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
              <Video size={48} className="mx-auto text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-800 text-base">No video lessons found for {selectedSubjectFilter}</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Be the first to upload a recorded lesson, demonstration, or class presentation in this subject.
              </p>
              <Button 
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 text-xs rounded-xl"
                onClick={() => {
                  setShowUploadVideoModal(true);
                  setVideoSubject(selectedSubjectFilter === "All" ? "Mathematics" : selectedSubjectFilter);
                }}
              >
                <UploadCloud size={15} /> Upload Video Now
              </Button>
            </div>
          )}
        </div>
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
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                    submission.documentName.match(/\.(mp4|mov|webm|m4v)$/i) || submission.documentType?.startsWith("video/")
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}>
                                    {submission.documentName.match(/\.(mp4|mov|webm|m4v)$/i) || submission.documentType?.startsWith("video/") ? (
                                      <Video size={18} />
                                    ) : (
                                      <Paperclip size={18} />
                                    )}
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-slate-900 truncate">{submission.documentName}</p>
                                    <p className="text-[11px] text-slate-500">
                                      {submission.documentSize || "Attachment"} &bull; {submission.documentName.match(/\.(mp4|mov|webm|m4v)$/i) ? "Recorded Video" : "Document"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {(submission.documentName.match(/\.(mp4|mov|webm|m4v)$/i) || submission.documentType?.startsWith("video/")) && submission.documentUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedVideoLesson({
                                          id: "sub-" + submission.id,
                                          title: "Assignment Submission: " + submission.documentName,
                                          subject: ass.subject,
                                          targetClass: currentStudent?.class || "My Class",
                                          teacherName: currentStudent?.name || "Student",
                                          teacherId: currentStudent?.id || "USR-2026",
                                          description: submission.content || "Student video recording submitted for: " + ass.title,
                                          videoUrl: submission.documentUrl || "",
                                          mediaType: "direct",
                                          durationMinutes: 10,
                                          fileSize: submission.documentSize || "Video File",
                                          createdAt: submission.submittedAt
                                        });
                                      }}
                                      className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 h-8 gap-1.5"
                                    >
                                      <Play size={12} className="fill-rose-700" /> Watch Video
                                    </Button>
                                  )}
                                  {submission.documentUrl ? (
                                    <a 
                                      href={submission.documentUrl} 
                                      download={submission.documentName} 
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                                    >
                                      <Download size={13} /> Download
                                    </a>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">Attached</span>
                                  )}
                                </div>
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
                                <Label className="text-xs font-semibold text-slate-700">1. Upload Document, Presentation or Video Solution (Optional or Required)</Label>
                                
                                <input 
                                  ref={assDocInputRef}
                                  type="file" 
                                  className="hidden" 
                                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip,.xlsx,.csv,.mp4,.mov,.webm,video/*"
                                  onChange={handleDocumentSelect}
                                />

                                {uploadedDoc ? (
                                  <div className="p-3.5 bg-blue-50/80 border-2 border-blue-300 rounded-xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                      <div className={`w-10 h-10 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                                        uploadedDoc.type.startsWith("video/") || uploadedDoc.name.match(/\.(mp4|mov|webm|m4v)$/i)
                                          ? "bg-rose-600"
                                          : "bg-blue-600"
                                      }`}>
                                        {uploadedDoc.type.startsWith("video/") || uploadedDoc.name.match(/\.(mp4|mov|webm|m4v)$/i) ? (
                                          <Video size={20} />
                                        ) : (
                                          <Paperclip size={18} />
                                        )}
                                      </div>
                                      <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-slate-900 truncate">{uploadedDoc.name}</p>
                                        <p className="text-[11px] text-blue-700 font-medium">
                                          {uploadedDoc.size} &bull; {uploadedDoc.type.startsWith("video/") || uploadedDoc.name.match(/\.(mp4|mov|webm|m4v)$/i) ? "Recorded Video Ready" : "Document Ready to submit"}
                                        </p>
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
                                      Click to Browse Document or Video File
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      Supports PDF, Word (.docx), Videos (.mp4, .mov, .webm), Images (Max 15MB)
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
                        <Button variant="brand" className="w-full mt-auto" onClick={() => handleStartCbt(exam)}>Start Examination</Button>
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
        <div className="space-y-6">
          {!isResultPinVerified ? (
            <ResultAccessVerification
              student={{
                id: currentStudent?.id || loggedInId || "ESS/2026/001",
                name: currentStudent?.name || "Student Candidate",
                class: currentStudent?.class || studentClass,
                parentPhone: currentStudent?.parentPhone,
                dob: currentStudent?.dob,
              }}
              defaultSession={resSession}
              defaultTerm={resTerm}
              onVerificationSuccess={(pin, session, term) => {
                setResSession(session);
                setResTerm(term);
                setVerifiedPinRecord(pin);
                setIsResultPinVerified(true);
                setResultVisible(true);
                setReleaseError("");
              }}
              onCancel={() => setActiveTab("subjects")}
            />
          ) : (
            <div className="space-y-6">
              {/* Authenticated Result Access Security Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white font-heading">
                        Authenticated Result Access
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        PIN Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Candidate: <strong className="text-white">{currentStudent?.name}</strong> ({currentStudent?.id}) &bull; Active PIN Session ({resSession})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLockResults}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs h-9 font-semibold"
                  >
                    <Lock size={13} className="mr-1.5 text-amber-400" />
                    Lock Results / Sign Out PIN
                  </Button>
                </div>
              </div>

              {/* Session / Term Controls */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold">Academic Session & Term Selection</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Academic Session</label>
                      <select 
                        value={resSession} 
                        onChange={e => handleSessionChange(e.target.value)}
                        className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs w-full focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                      >
                        {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Term</label>
                      <select 
                        value={resTerm} 
                        onChange={e => handleTermChange(e.target.value)}
                        className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs w-full focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                      >
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Third Term">Third Term</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Release Error Notice if administrative hold is active */}
              {(() => {
                const isReleased = isResultReleased(resSession, resTerm, currentStudent?.class || studentClass);
                if (!isReleased) {
                  return (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3.5 text-amber-900 shadow-sm">
                      <Lock className="text-amber-600 shrink-0 mt-0.5" size={22} />
                      <div>
                        <h4 className="font-bold text-base text-amber-950">Result Pending Official Release</h4>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          Your PIN has been verified, but the examination results for <strong>{resSession} &bull; {resTerm} ({currentStudent?.class || studentClass})</strong> have not yet been officially released by the school management. Please check back later.
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div>
                        <h4 className="font-bold text-emerald-950 text-sm">Official Academic Report Card</h4>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          Verified for {resSession} &bull; {resTerm}. Performance report generated below.
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs shrink-0 font-bold" 
                        onClick={() => window.print()}
                      >
                        <Download size={14} className="mr-1.5" /> Download / Print Report Card
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto pb-4">
                      <StudentReportCard session={resSession} term={resTerm} student={currentStudent} />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
