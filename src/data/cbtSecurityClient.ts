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
  serverExpiresAt: number;
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

export interface SecurityLogsResponse {
  attempts: ExamAttemptRecord[];
  stats: {
    total: number;
    active: number;
    submitted: number;
    autoSubmittedViolations: number;
    totalViolationsLogged: number;
  };
}

const LOCAL_STORAGE_KEY = "ess_cbt_security_attempts_v1";

function getLocalAttempts(): ExamAttemptRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalAttempts(attempts: ExamAttemptRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(attempts));
  } catch (e) {}
}

export const cbtSecurityClient = {
  /**
   * Start or resume a secure exam attempt
   */
  async startAttempt(params: {
    studentId: string;
    studentName: string;
    studentClass: string;
    examId: string | number;
    examTitle: string;
    subject: string;
    durationMinutes: number;
  }): Promise<{
    success: boolean;
    isResumed: boolean;
    attempt: ExamAttemptRecord;
    remainingSeconds: number;
    message?: string;
  }> {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`,
      platform: navigator.platform || "Browser",
      ip: "Client"
    };

    try {
      const res = await fetch("/api/cbt/start-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, deviceInfo })
      });

      if (res.ok) {
        const data = await res.json();
        // Update local cache
        const local = getLocalAttempts().filter(a => a.id !== data.attempt.id);
        local.unshift(data.attempt);
        saveLocalAttempts(local);
        return data;
      }
    } catch (err) {
      console.warn("Server unavailable for startAttempt, using resilient local storage:", err);
    }

    // Local fallback if server is unreachable
    const localList = getLocalAttempts();
    const existing = localList.find(a => a.studentId === params.studentId && String(a.examId) === String(params.examId));
    const now = Date.now();

    if (existing) {
      if (existing.status === "SUBMITTED" || existing.status === "AUTO_SUBMITTED_VIOLATION") {
        return {
          success: false,
          isResumed: false,
          attempt: existing,
          remainingSeconds: 0,
          message: existing.submissionReason || "Examination already completed."
        };
      }
      const remainingSeconds = Math.max(0, Math.floor((existing.serverExpiresAt - now) / 1000));
      return {
        success: true,
        isResumed: true,
        attempt: existing,
        remainingSeconds
      };
    }

    const duration = params.durationMinutes > 0 ? params.durationMinutes : 45;
    const expiresAt = now + duration * 60 * 1000;
    const newAttempt: ExamAttemptRecord = {
      id: `ATT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: params.studentId,
      studentName: params.studentName,
      studentClass: params.studentClass,
      examId: params.examId,
      examTitle: params.examTitle,
      subject: params.subject,
      startTime: new Date().toISOString(),
      durationMinutes: duration,
      serverExpiresAt: expiresAt,
      status: "IN_PROGRESS",
      violationsCount: 0,
      violations: [],
      answers: {},
      deviceInfo: {
        userAgent: deviceInfo.userAgent,
        screenResolution: deviceInfo.screenResolution,
        platform: deviceInfo.platform,
        ip: "127.0.0.1"
      }
    };

    localList.unshift(newAttempt);
    saveLocalAttempts(localList);

    return {
      success: true,
      isResumed: false,
      attempt: newAttempt,
      remainingSeconds: duration * 60
    };
  },

  /**
   * Log violation and immediately auto-submit
   */
  async logViolation(params: {
    attemptId: string;
    type: SecurityViolation["type"];
    details: string;
    currentAnswers?: Record<string | number, any>;
    autoSubmit?: boolean;
  }): Promise<{ success: boolean; attempt?: ExamAttemptRecord; autoSubmitted: boolean }> {
    try {
      const res = await fetch("/api/cbt/log-violation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.attempt) {
          const local = getLocalAttempts().filter(a => a.id !== data.attempt.id);
          local.unshift(data.attempt);
          saveLocalAttempts(local);
        }
        return data;
      }
    } catch (err) {
      console.warn("Server unavailable for logViolation, fallback to local:", err);
    }

    // Local fallback
    const list = getLocalAttempts();
    const attempt = list.find(a => a.id === params.attemptId);
    if (!attempt) return { success: false, autoSubmitted: false };

    if (params.currentAnswers) {
      attempt.answers = { ...attempt.answers, ...params.currentAnswers };
    }

    attempt.violations.push({
      id: `VIO-${Date.now()}`,
      type: params.type,
      details: params.details,
      timestamp: new Date().toISOString()
    });
    attempt.violationsCount += 1;

    let autoSubmitted = false;
    if (params.autoSubmit !== false) {
      attempt.status = "AUTO_SUBMITTED_VIOLATION";
      attempt.submissionTime = new Date().toISOString();
      attempt.submissionReason = `Automatically Submitted – Examination Security Violation: ${params.details}`;
      autoSubmitted = true;
    }

    saveLocalAttempts(list);
    return { success: true, attempt, autoSubmitted };
  },

  /**
   * Incrementally save answers
   */
  async saveProgress(attemptId: string, answers: Record<string | number, any>) {
    try {
      fetch("/api/cbt/save-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers })
      }).catch(() => {});
    } catch (e) {}

    const list = getLocalAttempts();
    const item = list.find(a => a.id === attemptId);
    if (item) {
      item.answers = { ...item.answers, ...answers };
      saveLocalAttempts(list);
    }
  },

  /**
   * Normal or timer submission
   */
  async submitAttempt(params: {
    attemptId: string;
    answers?: Record<string | number, any>;
    score?: number;
    totalQuestions?: number;
    reason?: string;
  }): Promise<{ success: boolean; attempt?: ExamAttemptRecord }> {
    try {
      const res = await fetch("/api/cbt/submit-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.attempt) {
          const local = getLocalAttempts().filter(a => a.id !== data.attempt.id);
          local.unshift(data.attempt);
          saveLocalAttempts(local);
        }
        return data;
      }
    } catch (e) {}

    const list = getLocalAttempts();
    const item = list.find(a => a.id === params.attemptId);
    if (!item) return { success: false };

    if (params.answers) item.answers = { ...item.answers, ...params.answers };
    if (params.score !== undefined) item.score = params.score;
    if (params.totalQuestions !== undefined) item.totalQuestions = params.totalQuestions;
    item.status = "SUBMITTED";
    item.submissionTime = new Date().toISOString();
    item.submissionReason = params.reason || "Candidate manually completed and submitted examination.";

    saveLocalAttempts(list);
    return { success: true, attempt: item };
  },

  /**
   * Retrieve all logs for Admin / Exam Officer Dashboard
   */
  async getSecurityLogs(): Promise<SecurityLogsResponse> {
    try {
      const res = await fetch("/api/cbt/security-logs");
      if (res.ok) {
        const data: SecurityLogsResponse = await res.json();
        // Merge with any local unique attempts
        const local = getLocalAttempts();
        const map = new Map<string, ExamAttemptRecord>();
        data.attempts.forEach(a => map.set(a.id, a));
        local.forEach(a => {
          if (!map.has(a.id)) map.set(a.id, a);
        });
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        return {
          attempts: merged,
          stats: {
            total: merged.length,
            active: merged.filter(a => a.status === "IN_PROGRESS").length,
            submitted: merged.filter(a => a.status === "SUBMITTED").length,
            autoSubmittedViolations: merged.filter(a => a.status === "AUTO_SUBMITTED_VIOLATION").length,
            totalViolationsLogged: merged.reduce((acc, curr) => acc + curr.violationsCount, 0)
          }
        };
      }
    } catch (e) {
      console.warn("Failed to fetch server security logs, falling back to local storage:", e);
    }

    const local = getLocalAttempts();
    return {
      attempts: local,
      stats: {
        total: local.length,
        active: local.filter(a => a.status === "IN_PROGRESS").length,
        submitted: local.filter(a => a.status === "SUBMITTED").length,
        autoSubmittedViolations: local.filter(a => a.status === "AUTO_SUBMITTED_VIOLATION").length,
        totalViolationsLogged: local.reduce((acc, curr) => acc + curr.violationsCount, 0)
      }
    };
  },

  /**
   * Reset attempt (Admin action)
   */
  async resetAttempt(attemptId: string): Promise<boolean> {
    try {
      await fetch("/api/cbt/reset-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId })
      });
    } catch (e) {}

    const local = getLocalAttempts().filter(a => a.id !== attemptId);
    saveLocalAttempts(local);
    return true;
  }
};
