export interface SecurityViolation {
  id: string;
  type: "FULLSCREEN_EXIT" | "TAB_SWITCH_OR_BLUR" | "VISIBILITY_HIDDEN" | "SUSPICIOUS_RESIZE" | "DEVTOOLS_OR_SHORTCUT";
  details: string;
  timestamp: string;
}

export interface ExamAttemptRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  examId: string | number;
  examTitle: string;
  subject: string;
  startTime: string;
  durationMinutes: number;
  serverExpiresAt: number; // Server-side Epoch Timestamp (ms)
  submissionTime?: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED_VIOLATION" | "EXPIRED";
  submissionReason?: string;
  violationsCount: number;
  violations: SecurityViolation[];
  answers: Record<string | number, any>;
  score?: number;
  totalQuestions?: number;
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    platform: string;
    ip: string;
  };
}

// In-memory persistent database for examination attempts & security audit logs
const examAttempts = new Map<string, ExamAttemptRecord>();

// Pre-populate with sample logs for administrative visibility
const samplePastAttempts: ExamAttemptRecord[] = [
  {
    id: "ATT-2026-081",
    studentId: "ESS/2026/014",
    studentName: "Emmanuel Terfa",
    studentClass: "SSS 3A",
    examId: "1",
    examTitle: "First Term Continuous Examination",
    subject: "Mathematics",
    startTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    durationMinutes: 45,
    serverExpiresAt: Date.now() - 3600000 * 3.25,
    submissionTime: new Date(Date.now() - 3600000 * 3.3).toISOString(),
    status: "SUBMITTED",
    submissionReason: "Candidate manually completed and submitted examination.",
    violationsCount: 0,
    violations: [],
    answers: { 1: 1, 2: 1, 3: 2, 4: 1, 5: 0 },
    score: 80,
    totalQuestions: 5,
    deviceInfo: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      screenResolution: "1920x1080",
      platform: "Win32",
      ip: "192.168.1.45"
    }
  },
  {
    id: "ATT-2026-082",
    studentId: "ESS/2026/029",
    studentName: "Joshua Kuma",
    studentClass: "SSS 3B",
    examId: "1",
    examTitle: "First Term Continuous Examination",
    subject: "Mathematics",
    startTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    durationMinutes: 45,
    serverExpiresAt: Date.now() - 3600000 * 1.25,
    submissionTime: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    status: "AUTO_SUBMITTED_VIOLATION",
    submissionReason: "Automatically Submitted – Examination Security Violation (Exited Fullscreen & Switched Browser Window).",
    violationsCount: 2,
    violations: [
      {
        id: "VIO-101",
        type: "FULLSCREEN_EXIT",
        details: "Candidate exited required fullscreen examination mode.",
        timestamp: new Date(Date.now() - 3600000 * 1.81).toISOString()
      },
      {
        id: "VIO-102",
        type: "TAB_SWITCH_OR_BLUR",
        details: "Browser lost window focus. Candidate attempted to navigate away or open secondary window.",
        timestamp: new Date(Date.now() - 3600000 * 1.80).toISOString()
      }
    ],
    answers: { 1: 1, 2: 0 },
    score: 40,
    totalQuestions: 5,
    deviceInfo: {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      screenResolution: "1440x900",
      platform: "MacIntel",
      ip: "192.168.1.52"
    }
  }
];

samplePastAttempts.forEach(att => examAttempts.set(att.id, att));

export class CbtSecurityManager {
  /**
   * Find an existing active attempt by student and exam ID
   */
  static findAttempt(studentId: string, examId: string | number): ExamAttemptRecord | undefined {
    for (const attempt of examAttempts.values()) {
      if (attempt.studentId === studentId && String(attempt.examId) === String(examId)) {
        return attempt;
      }
    }
    return undefined;
  }

  /**
   * Start a new attempt or resume an existing non-completed attempt
   */
  static startOrResumeAttempt(params: {
    studentId: string;
    studentName: string;
    studentClass: string;
    examId: string | number;
    examTitle: string;
    subject: string;
    durationMinutes: number;
    deviceInfo: {
      userAgent?: string;
      screenResolution?: string;
      platform?: string;
      ip?: string;
    };
  }): {
    success: boolean;
    isResumed: boolean;
    attempt: ExamAttemptRecord;
    remainingSeconds: number;
    message?: string;
  } {
    const existing = this.findAttempt(params.studentId, params.examId);
    const now = Date.now();

    if (existing) {
      // Check if attempt was already finalized
      if (existing.status === "SUBMITTED") {
        return {
          success: false,
          isResumed: false,
          attempt: existing,
          remainingSeconds: 0,
          message: "You have already completed and submitted this examination. Re-entry is prohibited."
        };
      }

      if (existing.status === "AUTO_SUBMITTED_VIOLATION") {
        return {
          success: false,
          isResumed: false,
          attempt: existing,
          remainingSeconds: 0,
          message: "Examination was automatically submitted due to an active security violation. Re-entry is prohibited."
        };
      }

      // Check if server-side timer expired
      if (now >= existing.serverExpiresAt) {
        existing.status = "EXPIRED";
        existing.submissionReason = "Server examination duration expired.";
        existing.submissionTime = new Date(existing.serverExpiresAt).toISOString();
        return {
          success: false,
          isResumed: false,
          attempt: existing,
          remainingSeconds: 0,
          message: "The examination duration has expired."
        };
      }

      // Restore existing in-progress session (Prevents restart timer exploit!)
      const remainingSeconds = Math.max(0, Math.floor((existing.serverExpiresAt - now) / 1000));
      return {
        success: true,
        isResumed: true,
        attempt: existing,
        remainingSeconds
      };
    }

    // Initialize new secure attempt with server-side expiry timestamp
    const duration = params.durationMinutes > 0 ? params.durationMinutes : 45;
    const expiresAt = now + duration * 60 * 1000;
    const attemptId = `ATT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAttempt: ExamAttemptRecord = {
      id: attemptId,
      studentId: params.studentId,
      studentName: params.studentName,
      studentClass: params.studentClass,
      examId: params.examId,
      examTitle: params.examTitle,
      subject: params.subject,
      startTime: new Date(now).toISOString(),
      durationMinutes: duration,
      serverExpiresAt: expiresAt,
      status: "IN_PROGRESS",
      violationsCount: 0,
      violations: [],
      answers: {},
      deviceInfo: {
        userAgent: params.deviceInfo.userAgent || "Unknown Browser",
        screenResolution: params.deviceInfo.screenResolution || "Unknown",
        platform: params.deviceInfo.platform || "Unknown",
        ip: params.deviceInfo.ip || "127.0.0.1"
      }
    };

    examAttempts.set(newAttempt.id, newAttempt);

    return {
      success: true,
      isResumed: false,
      attempt: newAttempt,
      remainingSeconds: duration * 60
    };
  }

  /**
   * Log security violation & trigger instant auto-submission if required
   */
  static logViolation(params: {
    attemptId: string;
    type: SecurityViolation["type"];
    details: string;
    currentAnswers?: Record<string | number, any>;
    autoSubmit?: boolean;
  }): {
    success: boolean;
    attempt?: ExamAttemptRecord;
    autoSubmitted: boolean;
  } {
    const attempt = examAttempts.get(params.attemptId);
    if (!attempt) {
      return { success: false, autoSubmitted: false };
    }

    if (params.currentAnswers) {
      attempt.answers = { ...attempt.answers, ...params.currentAnswers };
    }

    const violation: SecurityViolation = {
      id: `VIO-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      type: params.type,
      details: params.details,
      timestamp: new Date().toISOString()
    };

    attempt.violations.push(violation);
    attempt.violationsCount += 1;

    let autoSubmitted = false;
    if (params.autoSubmit || attempt.status === "IN_PROGRESS") {
      // Mark as Automatically Submitted - Examination Security Violation
      attempt.status = "AUTO_SUBMITTED_VIOLATION";
      attempt.submissionTime = new Date().toISOString();
      attempt.submissionReason = `Automatically Submitted – Examination Security Violation: ${params.details}`;
      autoSubmitted = true;
    }

    return {
      success: true,
      attempt,
      autoSubmitted
    };
  }

  /**
   * Save incremental student answers
   */
  static saveProgress(attemptId: string, answers: Record<string | number, any>): boolean {
    const attempt = examAttempts.get(attemptId);
    if (!attempt || attempt.status !== "IN_PROGRESS") {
      return false;
    }
    attempt.answers = { ...attempt.answers, ...answers };
    return true;
  }

  /**
   * Normal or Timer-based examination submission
   */
  static submitAttempt(params: {
    attemptId: string;
    answers?: Record<string | number, any>;
    score?: number;
    totalQuestions?: number;
    reason?: string;
  }): { success: boolean; attempt?: ExamAttemptRecord } {
    const attempt = examAttempts.get(params.attemptId);
    if (!attempt) {
      return { success: false };
    }

    if (params.answers) {
      attempt.answers = { ...attempt.answers, ...params.answers };
    }
    if (params.score !== undefined) {
      attempt.score = params.score;
    }
    if (params.totalQuestions !== undefined) {
      attempt.totalQuestions = params.totalQuestions;
    }

    attempt.submissionTime = new Date().toISOString();
    if (attempt.status === "IN_PROGRESS") {
      attempt.status = "SUBMITTED";
      attempt.submissionReason = params.reason || "Candidate completed and submitted examination.";
    }

    return { success: true, attempt };
  }

  /**
   * Fetch all logs & attempts for Exam Officer Dashboard
   */
  static getAllAttempts(): {
    attempts: ExamAttemptRecord[];
    stats: {
      total: number;
      active: number;
      submitted: number;
      autoSubmittedViolations: number;
      totalViolationsLogged: number;
    };
  } {
    const list = Array.from(examAttempts.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    const stats = {
      total: list.length,
      active: list.filter(a => a.status === "IN_PROGRESS").length,
      submitted: list.filter(a => a.status === "SUBMITTED").length,
      autoSubmittedViolations: list.filter(a => a.status === "AUTO_SUBMITTED_VIOLATION").length,
      totalViolationsLogged: list.reduce((acc, curr) => acc + curr.violationsCount, 0)
    };

    return { attempts: list, stats };
  }

  /**
   * Reset attempt (Admin authorized action)
   */
  static resetAttempt(attemptId: string): boolean {
    return examAttempts.delete(attemptId);
  }
}
