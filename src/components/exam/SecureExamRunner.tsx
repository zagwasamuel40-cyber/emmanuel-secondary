import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  Send,
  XCircle
} from "lucide-react";
import { cbtSecurityClient, ExamAttemptRecord } from "../../data/cbtSecurityClient";

export interface SecureExamQuestion {
  id: number | string;
  text?: string;
  question?: string;
  options: string[];
  correctOption?: number;
  answer?: string;
  subject?: string;
}

interface SecureExamRunnerProps {
  exam: {
    id: string | number;
    title: string;
    subject: string;
    targetClass?: string;
    duration?: number;
    durationMinutes?: number;
  };
  student: {
    id: string;
    name: string;
    class: string;
  };
  questions: SecureExamQuestion[];
  onComplete: (result: {
    attempt: ExamAttemptRecord;
    score: number;
    percentage: number;
    totalQuestions: number;
    autoSubmitted: boolean;
    reason?: string;
  }) => void;
  onExit: () => void;
}

export const SecureExamRunner: React.FC<SecureExamRunnerProps> = ({
  exam,
  student,
  questions,
  onComplete,
  onExit
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const examDurationMinutes = exam.duration || exam.durationMinutes || 45;

  // Session & Security State
  const [attempt, setAttempt] = useState<ExamAttemptRecord | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(examDurationMinutes * 60);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string | number, any>>({});
  
  // Security Modal States
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);
  const [hasStartedFullscreen, setHasStartedFullscreen] = useState(false);
  const [needsFullscreenPrompt, setNeedsFullscreenPrompt] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [finalResult, setFinalResult] = useState<{
    status: string;
    reason: string;
    score: number;
    percentage: number;
  } | null>(null);

  const violationTriggeredRef = useRef(false);
  const timerRef = useRef<any>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // Helper to calculate score
  const calculateScore = useCallback(() => {
    let score = 0;
    questions.forEach((q, index) => {
      const qId = q.id || index;
      const selected = answersRef.current[qId];
      if (selected !== undefined && selected !== null) {
        if (typeof q.correctOption === "number") {
          const selectedIdx = typeof selected === "number" ? selected : q.options.indexOf(selected);
          if (selectedIdx === q.correctOption) score += 1;
        } else if (q.answer) {
          if (String(selected).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) score += 1;
        }
      }
    });
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return { score, percentage, total: questions.length };
  }, [questions]);

  // Request Fullscreen Cross-Browser
  const enterFullscreen = useCallback(async () => {
    try {
      const el: any = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
      setNeedsFullscreenPrompt(false);
      setHasStartedFullscreen(true);
      return true;
    } catch (err) {
      console.warn("Fullscreen request requires user gesture or was denied:", err);
      setNeedsFullscreenPrompt(true);
      return false;
    }
  }, []);

  // Exit Fullscreen cleanly when done
  const exitFullscreen = useCallback(() => {
    try {
      const doc: any = document;
      if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement) {
        if (doc.exitFullscreen) {
          doc.exitFullscreen().catch(() => {});
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        }
      }
    } catch (e) {}
  }, []);

  // Initialize Exam Session on Mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      const res = await cbtSecurityClient.startAttempt({
        studentId: student.id,
        studentName: student.name,
        studentClass: student.class,
        examId: exam.id,
        examTitle: exam.title,
        subject: exam.subject,
        durationMinutes: examDurationMinutes
      });

      if (!isMounted) return;

      if (!res.success && res.attempt) {
        // Attempt already completed or locked
        const results = calculateScore();
        setFinalResult({
          status: res.attempt.status,
          reason: res.message || res.attempt.submissionReason || "Examination already closed.",
          score: res.attempt.score ?? results.score,
          percentage: res.attempt.score ? Math.round((res.attempt.score / questions.length) * 100) : results.percentage
        });
        setSessionReady(true);
        return;
      }

      setAttempt(res.attempt);
      setTimeLeft(res.remainingSeconds);
      if (res.attempt.answers && Object.keys(res.attempt.answers).length > 0) {
        setAnswers(res.attempt.answers);
      }
      setSessionReady(true);

      // Attempt to enter fullscreen immediately
      enterFullscreen();
    }

    initSession();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam, student, examDurationMinutes, enterFullscreen, calculateScore, questions.length]);

  // Execute Automatic Submission on Security Breach
  const executeViolationAutoSubmit = useCallback(async (violationType: any, details: string) => {
    if (violationTriggeredRef.current) return;
    violationTriggeredRef.current = true;

    setIsAutoSubmitting(true);
    setSecurityWarning(details);

    // Give a strict 3-second warning countdown to notify candidate
    let countdown = 3;
    setAutoSubmitCountdown(countdown);

    const countdownTimer = setInterval(async () => {
      countdown -= 1;
      setAutoSubmitCountdown(countdown);

      if (countdown <= 0) {
        clearInterval(countdownTimer);

        if (attempt) {
          const { score, percentage, total } = calculateScore();
          const autoRes = await cbtSecurityClient.logViolation({
            attemptId: attempt.id,
            type: violationType,
            details,
            currentAnswers: answersRef.current,
            autoSubmit: true
          });

          exitFullscreen();

          const finalizedAttempt = autoRes.attempt || attempt;
          finalizedAttempt.status = "AUTO_SUBMITTED_VIOLATION";
          finalizedAttempt.score = score;
          finalizedAttempt.totalQuestions = total;

          setFinalResult({
            status: "AUTO_SUBMITTED_VIOLATION",
            reason: `Automatically Submitted – Examination Security Violation: ${details}`,
            score,
            percentage
          });

          onComplete({
            attempt: finalizedAttempt,
            score,
            percentage,
            totalQuestions: total,
            autoSubmitted: true,
            reason: details
          });
        }
      }
    }, 1000);
  }, [attempt, calculateScore, exitFullscreen, onComplete]);

  // Normal / Timer-Based Submission
  const handleNormalSubmit = useCallback(async (reason = "Candidate manually submitted examination.") => {
    if (violationTriggeredRef.current || !attempt) return;
    violationTriggeredRef.current = true;

    const { score, percentage, total } = calculateScore();
    const subRes = await cbtSecurityClient.submitAttempt({
      attemptId: attempt.id,
      answers: answersRef.current,
      score,
      totalQuestions: total,
      reason
    });

    exitFullscreen();

    const finalizedAttempt = subRes.attempt || attempt;
    finalizedAttempt.status = "SUBMITTED";
    finalizedAttempt.score = score;
    finalizedAttempt.totalQuestions = total;

    setFinalResult({
      status: "SUBMITTED",
      reason,
      score,
      percentage
    });

    onComplete({
      attempt: finalizedAttempt,
      score,
      percentage,
      totalQuestions: total,
      autoSubmitted: false,
      reason
    });
  }, [attempt, calculateScore, exitFullscreen, onComplete]);

  // Server-Synchronized Timer Countdown
  useEffect(() => {
    if (!sessionReady || finalResult || isAutoSubmitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNormalSubmit("Server Examination Duration Expired – Time is Up.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionReady, finalResult, isAutoSubmitting, handleNormalSubmit]);

  // Periodically Auto-Save Answers Every 15 seconds
  useEffect(() => {
    if (!attempt || finalResult) return;
    const saveTimer = setInterval(() => {
      if (Object.keys(answersRef.current).length > 0) {
        cbtSecurityClient.saveProgress(attempt.id, answersRef.current);
      }
    }, 15000);

    return () => clearInterval(saveTimer);
  }, [attempt, finalResult]);

  // =========================================================================
  // STRICT ANTI-CHEATING & FULLSCREEN CHANGE DETECTORS
  // =========================================================================
  useEffect(() => {
    if (!sessionReady || finalResult || isAutoSubmitting || !hasStartedFullscreen) return;

    // 1. Fullscreen Exit Event Listener
    const handleFullscreenChange = () => {
      const doc: any = document;
      const isCurrentlyFullscreen = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (!isCurrentlyFullscreen && !violationTriggeredRef.current) {
        executeViolationAutoSubmit(
          "FULLSCREEN_EXIT",
          "Candidate exited mandatory full-screen examination mode."
        );
      }
    };

    // 2. Page Visibility API & Tab Switch Detector
    const handleVisibilityChange = () => {
      if ((document.hidden || document.visibilityState !== "visible") && !violationTriggeredRef.current) {
        executeViolationAutoSubmit(
          "VISIBILITY_HIDDEN",
          "Browser tab or window switched away from the examination."
        );
      }
    };

    // 3. Window Blur Detector (Candidate clicked off window or switched apps)
    const handleWindowBlur = () => {
      if (!violationTriggeredRef.current) {
        executeViolationAutoSubmit(
          "TAB_SWITCH_OR_BLUR",
          "Examination window lost focus. Candidate switched applications or opened another window."
        );
      }
    };

    // 4. Suspicious Window Resize (e.g. splitting screen or docking inspector)
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    const handleResize = () => {
      const widthDiff = Math.abs(window.innerWidth - lastWidth);
      const heightDiff = Math.abs(window.innerHeight - lastHeight);
      if ((widthDiff > 250 || heightDiff > 250) && !violationTriggeredRef.current) {
        executeViolationAutoSubmit(
          "SUSPICIOUS_RESIZE",
          "Suspicious window resize detected during examination."
        );
      }
      lastWidth = window.innerWidth;
      lastHeight = window.innerHeight;
    };

    // 5. Prevent Keyboard Cheats & Developer Tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Escape key from quietly exiting
      if (e.key === "Escape") {
        e.preventDefault();
      }
      // Prevent F11, F12, Ctrl+U, Ctrl+Shift+I, Alt+Tab / Ctrl+Tab combinations
      if (
        e.key === "F11" ||
        e.key === "F12" ||
        (e.ctrlKey && (e.key === "u" || e.key === "U" || e.key === "c" || e.key === "C" || e.key === "v" || e.key === "V" || e.key === "p" || e.key === "P")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c"))
      ) {
        e.preventDefault();
      }
    };

    // 6. Prevent Leaving Via Browser Back Button
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      if (!violationTriggeredRef.current) {
        executeViolationAutoSubmit(
          "TAB_SWITCH_OR_BLUR",
          "Attempted to navigate back or leave examination view."
        );
      }
    };

    // 7. Prevent Window Close / Reload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Examination is in progress. Leaving will submit your test with a violation.";
      return e.returnValue;
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sessionReady, finalResult, isAutoSubmitting, hasStartedFullscreen, executeViolationAutoSubmit]);

  // Format Time Remaining as 00:45:30
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (optionValue: any) => {
    if (finalResult || isAutoSubmitting) return;
    const currentQ = questions[currentIndex];
    const qId = currentQ?.id ?? currentIndex;
    const updated = { ...answers, [qId]: optionValue };
    setAnswers(updated);
    if (attempt) {
      cbtSecurityClient.saveProgress(attempt.id, updated);
    }
  };

  // If initial fullscreen prompt is required (browser security policy)
  if (needsFullscreenPrompt && !hasStartedFullscreen && !finalResult) {
    return (
      <div className="fixed inset-0 z-[999999] bg-slate-950 text-white flex items-center justify-center p-6 select-none">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border-2 border-amber-500/40">
            <Maximize2 size={38} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-white">
              Activate Secure Fullscreen Mode
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              In accordance with Emmanuel Secondary School examination protocol, this examination must be conducted in strict, distraction-free Fullscreen Mode.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 text-left space-y-2 text-xs border border-slate-700">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Lock size={14} /> Anti-Cheating Examination Rules:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
              <li>Exiting fullscreen will automatically submit your exam immediately.</li>
              <li>Switching tabs, minimizing, or opening other apps is strictly prohibited.</li>
              <li>Your answers are automatically saved in real time.</li>
            </ul>
          </div>

          <button
            onClick={() => enterFullscreen()}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Maximize2 size={18} /> Enter Fullscreen & Begin Exam
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // POST-EXAM FINAL RESULT OR VIOLATION DISQUALIFICATION SCREEN
  // =========================================================================
  if (finalResult) {
    const isViolation = finalResult.status === "AUTO_SUBMITTED_VIOLATION";

    return (
      <div className="fixed inset-0 z-[999999] bg-slate-950 text-white flex items-center justify-center p-6 overflow-y-auto select-none">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div
            className={`p-8 text-center space-y-3 ${
              isViolation ? "bg-rose-950/80 border-b border-rose-900/50" : "bg-emerald-950/80 border-b border-emerald-900/50"
            }`}
          >
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
                isViolation ? "bg-rose-500/20 text-rose-400 border-2 border-rose-500/40" : "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40"
              }`}
            >
              {isViolation ? <XCircle size={44} /> : <CheckCircle2 size={44} />}
            </div>
            <h2 className="text-2xl font-bold font-heading text-white">
              {isViolation
                ? "Automatically Submitted – Examination Security Violation"
                : "Examination Submitted Successfully"}
            </h2>
            <p className="text-xs text-slate-300">
              Candidate: <strong>{student.name}</strong> ({student.id}) &bull; Class: <strong>{student.class}</strong>
            </p>
          </div>

          <div className="p-8 space-y-6">
            {isViolation && (
              <div className="p-4 rounded-xl bg-rose-900/30 border border-rose-500/30 text-rose-200 text-xs space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <AlertTriangle size={15} /> Violation Audit Record:
                </div>
                <p className="leading-relaxed">{finalResult.reason}</p>
                <div className="text-[11px] text-rose-300/70 pt-1">
                  Timestamp: {new Date().toLocaleString()} &bull; Logged to Admin Security Audit Roster.
                </div>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Official Examination Score
              </span>
              <div className="text-4xl font-bold font-heading text-white">
                {finalResult.score} / {questions.length}
              </div>
              <div className="text-sm font-semibold text-brand-400">
                Score Percentage: {finalResult.percentage}%
              </div>
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  isViolation
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : finalResult.percentage >= 50
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {isViolation
                  ? "Status: Flagged for Administrative Security Review"
                  : finalResult.percentage >= 50
                  ? "Status: Passed Examination"
                  : "Status: Below Pass Threshold"}
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              All responses have been preserved and securely stored on the server. You may now return to the portal.
            </p>

            <button
              onClick={onExit}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-600 transition-colors"
            >
              Exit Examination Environment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Current Active Question
  const currentQuestion = questions[currentIndex];
  const qId = currentQuestion?.id ?? currentIndex;
  const selectedAnswer = answers[qId];

  // =========================================================================
  // MAIN DISTRACTION-FREE SECURE EXAMINATION UI
  // =========================================================================
  return (
    <div
      ref={containerRef}
      onContextMenu={e => e.preventDefault()}
      className="fixed inset-0 z-[999999] bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto select-none font-sans"
    >
      {/* ------------------------------------------------------------------- */}
      {/* EMERGENCY SECURITY WARNING BANNER (AUTO-SUBMISSION MODAL) */}
      {/* ------------------------------------------------------------------- */}
      {isAutoSubmitting && (
        <div className="fixed inset-0 z-[1000000] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-rose-950 border-2 border-rose-500 rounded-3xl p-8 text-white space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-rose-500/30 text-rose-300 flex items-center justify-center mx-auto border-2 border-rose-400 animate-pulse">
              <ShieldAlert size={44} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-rose-200 uppercase tracking-wide">
                Security Violation Detected
              </h3>
              <p className="text-sm font-semibold text-rose-300 mt-2">
                {securityWarning || "Fullscreen exit or window switch detected."}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-rose-500/30 text-xs text-rose-200">
              Examination security violation detected. Your examination will be submitted automatically.
            </div>
            <div className="text-3xl font-mono font-bold text-white">
              Submitting in {autoSubmitCountdown ?? 3}s...
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* CONFIRM MANUAL SUBMISSION MODAL */}
      {/* ------------------------------------------------------------------- */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[1000000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center mx-auto border border-brand-500/30">
              <Send size={30} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-white">
                Submit Examination Now?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                You have answered {Object.keys(answers).length} of {questions.length} questions.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800 text-xs text-slate-300 text-left space-y-1 border border-slate-700">
              <div>Time Remaining: <strong className="font-mono text-white">{formatTime(timeLeft)}</strong></div>
              <div>Once submitted, answers cannot be edited or re-attempted.</div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-600 transition-colors"
              >
                Return to Exam
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleNormalSubmit();
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition-colors"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* DISTRACTION-FREE HEADER */}
      {/* [ EXAMINATION TITLE ] */}
      {/* Student: [Name] | Class: [Class] | Time Remaining: [00:45:30] */}
      {/* ------------------------------------------------------------------- */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-8 py-4 shrink-0 shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <h1 className="text-base sm:text-lg font-bold font-heading text-white uppercase tracking-wider">
              {exam.title}
            </h1>
            <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-0.5">
              <span>
                Student: <strong className="text-white">{student.name}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Class: <strong className="text-white">{student.class}</strong>
              </span>
              <span>&bull;</span>
              <span className="text-brand-400 font-semibold">{exam.subject}</span>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold text-sm sm:text-base shadow-inner">
              <Clock size={16} className="text-rose-400 shrink-0" />
              <span>Time Remaining: [{formatTime(timeLeft)}]</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              <Lock size={12} /> Secure Anti-Cheat Active
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* EXAMINATION BODY: QUESTION & OPTIONS */}
      {/* Question 1 of 50 */}
      {/* [Question] */}
      {/* ○ Option A */}
      {/* ○ Option B */}
      {/* ○ Option C */}
      {/* ○ Option D */}
      {/* ------------------------------------------------------------------- */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center space-y-6">
        {currentQuestion ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            {/* Question Counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="font-bold text-brand-400 uppercase tracking-wider text-sm">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="font-mono text-[11px] bg-slate-800 px-2.5 py-1 rounded-lg">
                Answered: {Object.keys(answers).length} / {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="text-lg sm:text-xl font-medium text-white leading-relaxed">
              {currentQuestion.text || currentQuestion.question}
            </div>

            {/* Answer Options */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt, optIndex) => {
                const optLetter = String.fromCharCode(65 + optIndex);
                // Can be index or text
                const isSelected =
                  selectedAnswer === optIndex ||
                  selectedAnswer === opt ||
                  selectedAnswer === optLetter;

                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer text-sm sm:text-base ${
                      isSelected
                        ? "bg-brand-500/20 border-brand-500 text-white font-semibold shadow-lg shadow-brand-500/20 ring-1 ring-brand-500"
                        : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors border ${
                        isSelected
                          ? "bg-brand-500 text-white border-brand-400"
                          : "bg-slate-800 text-slate-400 border-slate-600"
                      }`}
                    >
                      {optLetter}
                    </div>
                    <span className="flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation: [Previous] [Next] */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <ArrowLeft size={16} /> Previous
              </button>

              <div className="hidden sm:flex gap-1.5 overflow-x-auto max-w-[50%] px-2 py-1 hide-scrollbar">
                {questions.map((_, qIdx) => {
                  const isCurrent = currentIndex === qIdx;
                  const isAns = answers[questions[qIdx].id ?? qIdx] !== undefined;
                  return (
                    <button
                      key={qIdx}
                      type="button"
                      onClick={() => setCurrentIndex(qIdx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        isCurrent
                          ? "bg-brand-500 text-white ring-2 ring-brand-300 scale-110"
                          : isAns
                          ? "bg-emerald-600/80 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-900/40 transition-colors"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-colors"
                >
                  Finish & Review <Send size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">Loading examination questions...</div>
        )}
      </main>

      {/* ------------------------------------------------------------------- */}
      {/* AT THE BOTTOM: [ SUBMIT EXAMINATION ] */}
      {/* ------------------------------------------------------------------- */}
      <footer className="bg-slate-900/95 border-t border-slate-800 p-4 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 text-center sm:text-left">
            <span>Emmanuel Secondary School Anti-Cheat Proctor System</span>
            <span className="hidden sm:inline"> &bull; Attempt ID: {attempt?.id || "Loading..."}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSubmitConfirm(true)}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xl shadow-emerald-900/50 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <CheckCircle2 size={18} /> SUBMIT EXAMINATION
          </button>
        </div>
      </footer>
    </div>
  );
};
