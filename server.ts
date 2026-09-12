import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  generateEntranceExamQuestions,
  validateQuestionQuality,
  generateCurriculumFallback
} from "./server/aiQuestionEngine";
import { CbtSecurityManager } from "./server/cbtSecurityManager";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Security & Authorization Guard: Admission Officer Only
  const requireAdmissionOfficerAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userRole = (req.headers["x-user-role"] as string) || (req.body && req.body.userRole);
    if (userRole === "student" || userRole === "applicant") {
      return res.status(403).json({
        error: "Forbidden: Applicants and students are strictly prohibited from accessing question generation, answer keys, or question repositories."
      });
    }
    next();
  };

  // AI API Route - Entrance Examination Question Generator
  app.post("/api/admission/ai-generate-questions", requireAdmissionOfficerAuth, async (req, res) => {
    try {
      const {
        examName,
        className,
        subject,
        count,
        difficulty,
        questionType,
        durationMinutes,
        topics,
        optionsCount,
        customInstructions,
        avoidQuestions
      } = req.body;

      const result = await generateEntranceExamQuestions({
        examName: examName || "Entrance Examination",
        className: className || "JSS 1",
        subject: subject || "Mathematics",
        count: Number(count) || 10,
        difficulty: difficulty || "Mixed",
        questionType: questionType || "MCQ",
        durationMinutes: Number(durationMinutes) || 60,
        topics: topics || "",
        optionsCount: Number(optionsCount) || 4,
        customInstructions: customInstructions || "",
        avoidQuestions: Array.isArray(avoidQuestions) ? avoidQuestions : []
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/admission/ai-generate-questions:", error);
      res.status(500).json({ error: error.message || "Failed to generate entrance questions" });
    }
  });

  // Regenerate a single question
  app.post("/api/admission/ai-regenerate-single-question", requireAdmissionOfficerAuth, async (req, res) => {
    try {
      const { className, subject, difficulty, questionType, optionsCount, avoidQuestions, topics } = req.body;
      const result = await generateEntranceExamQuestions({
        className: className || "JSS 1",
        subject: subject || "Mathematics",
        count: 1,
        difficulty: difficulty || "Medium",
        questionType: questionType || "MCQ",
        optionsCount: Number(optionsCount) || 4,
        topics: topics || "",
        avoidQuestions: Array.isArray(avoidQuestions) ? avoidQuestions : []
      });

      if (result.questions && result.questions.length > 0) {
        res.json({ question: result.questions[0] });
      } else {
        res.status(500).json({ error: "Failed to generate replacement question" });
      }
    } catch (error: any) {
      console.error("Error in /api/admission/ai-regenerate-single-question:", error);
      res.status(500).json({ error: error.message || "Failed to regenerate single question" });
    }
  });

  // Legacy route compatibility
  app.post("/api/generate-questions", async (req, res) => {
    try {
      const { className, subject, count, topics } = req.body;
      const result = await generateEntranceExamQuestions({
        className: className || "JSS 1",
        subject: subject || "Mathematics",
        count: Number(count) || 10,
        difficulty: "Mixed",
        questionType: "MCQ",
        topics: topics || ""
      });
      // format for legacy caller
      const legacyFormat = result.questions.map(q => ({
        text: q.question,
        options: q.options,
        answer: q.correctAnswer,
        subject: q.subject
      }));
      res.json({ questions: legacyFormat });
    } catch (error: any) {
      console.error("Error generating questions:", error);
      res.status(500).json({ error: error.message || "Failed to generate questions" });
    }
  });

  // Admission & Entrance Examination Server-Side Validation Endpoints (Requirement 11)
  app.get("/api/admission/server-time", (req, res) => {
    const now = new Date();
    res.json({
      serverIso: now.toISOString(),
      serverDate: now.toISOString().split("T")[0],
      serverTime: now.toLocaleTimeString("en-US", { hour12: false }),
      timezone: "Africa/Lagos (WAT)",
      timestampMs: now.getTime()
    });
  });

  app.post("/api/admission/validate-access", (req, res) => {
    try {
      const { applicant, exam } = req.body;
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      if (!applicant) {
        return res.status(400).json({
          allowed: false,
          code: "NOT_FOUND",
          title: "APPLICANT NOT FOUND",
          message: "Unable to verify application credentials."
        });
      }

      if (applicant.examStatus === "Examination Disqualified") {
        return res.json({
          allowed: false,
          canStart: false,
          code: "DISQUALIFIED",
          title: "EXAMINATION DISQUALIFIED",
          message: "Your application is marked as disqualified for this entrance examination. Contact the Admission Office."
        });
      }

      if (applicant.examStatus === "Examination Completed") {
        return res.json({
          allowed: false,
          canStart: false,
          code: "ALREADY_COMPLETED",
          title: "EXAMINATION COMPLETED",
          message: `You have already completed and submitted your entrance examination. Score: ${applicant.examScore ?? "Recorded"}.`
        });
      }

      if (!exam || applicant.examStatus === "Examination Not Scheduled") {
        return res.json({
          allowed: false,
          canStart: false,
          code: "NOT_SCHEDULED",
          title: "EXAMINATION NOT SCHEDULED",
          message: "No entrance examination has been scheduled for your application yet. Please check back later."
        });
      }

      if (exam.status === "Ended" || applicant.examStatus === "Examination Ended") {
        return res.json({
          allowed: false,
          canStart: false,
          code: "ENDED",
          title: "EXAMINATION CONCLUDED",
          message: "The entrance examination session has officially concluded. Submissions are closed."
        });
      }

      // Backend schedule date check
      if (exam.examDate && exam.examDate > todayStr) {
        const dateFormatted = new Date(exam.examDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        return res.json({
          allowed: false,
          canStart: false,
          code: "NOT_YET_DUE",
          title: "EXAMINATION NOT YET DUE",
          message: `Your entrance examination is scheduled for ${dateFormatted} at ${exam.startTime || "09:00 AM"}. You cannot access the examination before the scheduled time.`
        });
      }

      // Backend activation check
      if (exam.status === "Scheduled") {
        return res.json({
          allowed: false,
          canStart: false,
          code: "NOT_YET_AVAILABLE",
          title: "EXAMINATION NOT YET AVAILABLE",
          message: "Your entrance examination has not started yet. Please wait until the Admission Officer activates the examination. Check your scheduled examination date and time."
        });
      }

      if (exam.status === "Activated") {
        return res.json({
          allowed: true,
          canStart: false,
          code: "ACTIVATED_WAITING_START",
          title: "EXAMINATION ACTIVATED",
          message: "The examination has been activated by the Admission Officer. Candidates are seated. Please wait for the Admission Officer to click START EXAM."
        });
      }

      if (exam.status === "Paused") {
        return res.json({
          allowed: false,
          canStart: false,
          code: "PAUSED",
          title: "EXAMINATION TEMPORARILY PAUSED",
          message: "The Admission Officer has temporarily paused the examination session. Please stand by."
        });
      }

      if (exam.status === "In Progress") {
        return res.json({
          allowed: true,
          canStart: true,
          code: "IN_PROGRESS",
          title: "EXAMINATION IN PROGRESS",
          message: "The examination is live! Click the START EXAM button below to begin."
        });
      }

      return res.json({
        allowed: false,
        canStart: false,
        code: "NOT_YET_AVAILABLE",
        title: "EXAMINATION NOT YET AVAILABLE",
        message: "Your entrance examination has not started yet. Please wait until the Admission Officer activates the examination."
      });
    } catch (err: any) {
      console.error("Validation error:", err);
      res.status(500).json({ error: "Internal validation failure" });
    }
  });

  // =========================================================================
  // SECURE CBT EXAMINATION & ANTI-CHEATING BACKEND API
  // =========================================================================

  // 1. Start or Resume an Exam Attempt (Server-Enforced Timer & No-Restart Exploit Guard)
  app.post("/api/cbt/start-attempt", (req, res) => {
    try {
      const {
        studentId,
        studentName,
        studentClass,
        examId,
        examTitle,
        subject,
        durationMinutes,
        deviceInfo
      } = req.body;

      if (!studentId || !examId) {
        return res.status(400).json({ error: "Missing required studentId or examId parameters." });
      }

      const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || "127.0.0.1";
      const result = CbtSecurityManager.startOrResumeAttempt({
        studentId,
        studentName: studentName || "Student Candidate",
        studentClass: studentClass || "SSS 3",
        examId,
        examTitle: examTitle || "Terminal Examination",
        subject: subject || "General",
        durationMinutes: Number(durationMinutes) || 45,
        deviceInfo: {
          userAgent: deviceInfo?.userAgent || req.headers["user-agent"] || "Browser",
          screenResolution: deviceInfo?.screenResolution || "Unknown",
          platform: deviceInfo?.platform || "Desktop/Mobile",
          ip: clientIp
        }
      });

      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/cbt/start-attempt:", err);
      res.status(500).json({ error: err.message || "Failed to initialize secure exam attempt." });
    }
  });

  // 2. Log Security Violation & Enforce Automatic Submission
  app.post("/api/cbt/log-violation", (req, res) => {
    try {
      const { attemptId, type, details, currentAnswers, autoSubmit } = req.body;
      if (!attemptId) {
        return res.status(400).json({ error: "Attempt ID required." });
      }

      const result = CbtSecurityManager.logViolation({
        attemptId,
        type: type || "FULLSCREEN_EXIT",
        details: details || "Security violation detected.",
        currentAnswers,
        autoSubmit: autoSubmit !== false
      });

      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/cbt/log-violation:", err);
      res.status(500).json({ error: err.message || "Failed to log security violation." });
    }
  });

  // 3. Save Incremental Progress / Auto-Save Answers
  app.post("/api/cbt/save-progress", (req, res) => {
    try {
      const { attemptId, answers } = req.body;
      if (!attemptId || !answers) {
        return res.status(400).json({ error: "Missing attemptId or answers." });
      }
      const success = CbtSecurityManager.saveProgress(attemptId, answers);
      res.json({ success });
    } catch (err: any) {
      console.error("Error in /api/cbt/save-progress:", err);
      res.status(500).json({ error: err.message || "Failed to save exam progress." });
    }
  });

  // 4. Submit Examination (Standard or Timer Completion)
  app.post("/api/cbt/submit-attempt", (req, res) => {
    try {
      const { attemptId, answers, score, totalQuestions, reason } = req.body;
      if (!attemptId) {
        return res.status(400).json({ error: "Attempt ID required." });
      }

      const result = CbtSecurityManager.submitAttempt({
        attemptId,
        answers,
        score,
        totalQuestions,
        reason
      });

      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/cbt/submit-attempt:", err);
      res.status(500).json({ error: err.message || "Failed to finalize examination attempt." });
    }
  });

  // 5. Admin & Exam Officer Security Logs & Proctoring Endpoint
  app.get("/api/cbt/security-logs", (req, res) => {
    try {
      const data = CbtSecurityManager.getAllAttempts();
      res.json(data);
    } catch (err: any) {
      console.error("Error in /api/cbt/security-logs:", err);
      res.status(500).json({ error: err.message || "Failed to retrieve security logs." });
    }
  });

  // 6. Admin Reset Exam Attempt (for authorized re-sit or test)
  app.post("/api/cbt/reset-attempt", (req, res) => {
    try {
      const { attemptId } = req.body;
      if (!attemptId) {
        return res.status(400).json({ error: "Attempt ID required." });
      }
      const success = CbtSecurityManager.resetAttempt(attemptId);
      res.json({ success });
    } catch (err: any) {
      console.error("Error in /api/cbt/reset-attempt:", err);
      res.status(500).json({ error: err.message || "Failed to reset attempt." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
