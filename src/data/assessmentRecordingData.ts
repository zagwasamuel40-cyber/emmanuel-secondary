import { useState, useEffect } from "react";
import { initialStudents } from "./studentsData";
import { getStoredScores, ScoreRecord } from "./scoresData";
import { calculateStudentAttendanceStats } from "./attendanceResultConnector";

export type AssessmentType =
  | "First Test"
  | "Second Test"
  | "Third Test"
  | "Continuous Assessment"
  | "Assignment"
  | "Classwork"
  | "Practical"
  | "Mid-Term Test"
  | "Examination"
  | "CBT Examination"
  | "Other Assessment";

export const STANDARD_ASSESSMENT_TYPES: AssessmentType[] = [
  "First Test",
  "Second Test",
  "Third Test",
  "Continuous Assessment",
  "Assignment",
  "Classwork",
  "Practical",
  "Mid-Term Test",
  "Examination",
  "CBT Examination",
  "Other Assessment"
];

export interface StudentAssessmentScore {
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  includeInFinalResult: boolean; // YES = include in final result, NO = keep as internal/class record only
  remarks?: string;
  submittedAt?: string;
}

export interface AssessmentItem {
  id: string;
  name: string;
  type: AssessmentType;
  maxScore: number;
  date: string; // YYYY-MM-DD
  subject: string;
  class: string;
  term: string;
  session: string;
  includeInFinalResult: boolean; // default for newly entered scores
  isCbt: boolean;
  cbtExamId?: number | string;
  status: "Draft" | "Published" | "Archived";
  teacherId?: string;
  teacherName?: string;
  scores: Record<string, StudentAssessmentScore>; // keyed by studentId
}

export interface AssessmentWeightingRule {
  id: string;
  title: string;
  session: string;
  term: string;
  targetClass: string; // "All Classes" or specific class like "SSS 3A"
  subject: string; // "All Subjects" or specific subject
  // Percentage contributions, e.g. First Test 10%, Second Test 10%, Assignment 5%, Practical 5%, Examination 70%
  weights: Record<string, number>;
  totalWeight: number; // Must equal 100
  updatedAt: string;
  updatedBy: string;
}

export interface TeacherResultDraft {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  session: string;
  term: string;
  firstTest?: number;
  secondTest?: number;
  thirdTest?: number;
  assignment?: number;
  practical?: number;
  midTerm?: number;
  cbtScore?: number;
  includeCbtInResult?: boolean;
  otherAssessments?: { name: string; score: number; maxScore: number }[];
  examination: number;
  totalScore: number;
  grade: string;
  teacherRemark: string;
  status: "Draft" | "Submitted" | "Finalized";
  submittedAt?: string;
  finalizedAt?: string;
  submittedBy?: string;
}

// Initial seed assessment weightings
export const defaultWeightingRules: AssessmentWeightingRule[] = [
  {
    id: "WEIGHT-GLOBAL",
    title: "Standard Senior Secondary Weighting Structure",
    session: "2025/2026",
    term: "First Term",
    targetClass: "All Classes",
    subject: "All Subjects",
    weights: {
      "First Test": 10,
      "Second Test": 10,
      "Assignment": 5,
      "Practical": 5,
      "CBT Examination": 10,
      "Examination": 60,
    },
    totalWeight: 100,
    updatedAt: "2026-09-01",
    updatedBy: "General Admin",
  },
  {
    id: "WEIGHT-JSS",
    title: "Junior Secondary Weighting Structure",
    session: "2025/2026",
    term: "First Term",
    targetClass: "JSS 1A",
    subject: "All Subjects",
    weights: {
      "First Test": 15,
      "Second Test": 15,
      "Continuous Assessment": 10,
      "Examination": 60,
    },
    totalWeight: 100,
    updatedAt: "2026-09-01",
    updatedBy: "Academic Admin",
  }
];

// Initial seed assessments
export const initialAssessments: AssessmentItem[] = [
  {
    id: "ASM-2026-001",
    name: "Term 1 First Test - Algebraic Fractions",
    type: "First Test",
    maxScore: 20,
    date: "2026-09-18",
    subject: "Mathematics",
    class: "SSS 3A",
    term: "First Term",
    session: "2025/2026",
    includeInFinalResult: true,
    isCbt: false,
    status: "Published",
    teacherName: "Mr. Terna Shior",
    scores: {
      "ESS/2026/001": { studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", score: 18, maxScore: 20, includeInFinalResult: true, remarks: "Excellent algebra steps" },
      "ESS/2026/002": { studentId: "ESS/2026/002", studentName: "Chioma Nwosu", score: 15, maxScore: 20, includeInFinalResult: true, remarks: "Very good effort" },
      "ESS/2026/004": { studentId: "ESS/2026/004", studentName: "Grace Okhiria", score: 11, maxScore: 20, includeInFinalResult: true, remarks: "Needs practice with signs" },
    }
  },
  {
    id: "ASM-2026-002",
    name: "Calculus & Functions CBT Quiz 1",
    type: "CBT Examination",
    maxScore: 30,
    date: "2026-09-25",
    subject: "Mathematics",
    class: "SSS 3A",
    term: "First Term",
    session: "2025/2026",
    includeInFinalResult: true,
    isCbt: true,
    cbtExamId: 1,
    status: "Published",
    teacherName: "Mr. Terna Shior",
    scores: {
      "ESS/2026/001": { studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", score: 28, maxScore: 30, includeInFinalResult: true, remarks: "Top CBT performance" },
      "ESS/2026/002": { studentId: "ESS/2026/002", studentName: "Chioma Nwosu", score: 24, maxScore: 30, includeInFinalResult: true, remarks: "Good timing" },
      "ESS/2026/004": { studentId: "ESS/2026/004", studentName: "Grace Okhiria", score: 18, maxScore: 30, includeInFinalResult: true, remarks: "Fair attempt" },
    }
  },
  {
    id: "ASM-2026-003",
    name: "Weekend Class Assignment 3 - Optics",
    type: "Assignment",
    maxScore: 10,
    date: "2026-09-22",
    subject: "Physics",
    class: "SSS 3A",
    term: "First Term",
    session: "2025/2026",
    includeInFinalResult: false, // Internal Class Record Only
    isCbt: false,
    status: "Published",
    teacherName: "Engr. Victoria Danjuma",
    scores: {
      "ESS/2026/001": { studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", score: 10, maxScore: 10, includeInFinalResult: false, remarks: "Great diagram" },
      "ESS/2026/002": { studentId: "ESS/2026/002", studentName: "Chioma Nwosu", score: 8, maxScore: 10, includeInFinalResult: false, remarks: "Accurate ray traces" },
    }
  },
  {
    id: "ASM-2026-004",
    name: "Mid-Term Assessment Examination",
    type: "Mid-Term Test",
    maxScore: 40,
    date: "2026-10-05",
    subject: "English Language",
    class: "SSS 3A",
    term: "First Term",
    session: "2025/2026",
    includeInFinalResult: true,
    isCbt: false,
    status: "Published",
    teacherName: "Mrs. Esther Iorfa",
    scores: {
      "ESS/2026/001": { studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", score: 34, maxScore: 40, includeInFinalResult: true, remarks: "High essay caliber" },
      "ESS/2026/002": { studentId: "ESS/2026/002", studentName: "Chioma Nwosu", score: 31, maxScore: 40, includeInFinalResult: true, remarks: "Good comprehension" },
    }
  }
];

export function getStoredAssessments(): AssessmentItem[] {
  const saved = localStorage.getItem("ess_assessments_db");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return initialAssessments;
}

export function saveStoredAssessments(items: AssessmentItem[]) {
  localStorage.setItem("ess_assessments_db", JSON.stringify(items));
  window.dispatchEvent(new Event("ess_assessments_change"));
}

export function useAssessments() {
  const [assessments, setAssessmentsState] = useState<AssessmentItem[]>(getStoredAssessments);

  useEffect(() => {
    const handleUpdate = () => {
      setAssessmentsState(getStoredAssessments());
    };
    window.addEventListener("ess_assessments_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ess_assessments_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setAssessments = (updater: AssessmentItem[] | ((prev: AssessmentItem[]) => AssessmentItem[])) => {
    const current = getStoredAssessments();
    const next = typeof updater === "function" ? updater(current) : updater;
    saveStoredAssessments(next);
  };

  return [assessments, setAssessments] as const;
}

// Weightings Hook
export function getStoredWeightings(): AssessmentWeightingRule[] {
  const saved = localStorage.getItem("ess_assessment_weightings");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return defaultWeightingRules;
}

export function saveStoredWeightings(rules: AssessmentWeightingRule[]) {
  localStorage.setItem("ess_assessment_weightings", JSON.stringify(rules));
  window.dispatchEvent(new Event("ess_weightings_change"));
}

export function useAssessmentWeightings() {
  const [weightings, setWeightingsState] = useState<AssessmentWeightingRule[]>(getStoredWeightings);

  useEffect(() => {
    const handleUpdate = () => {
      setWeightingsState(getStoredWeightings());
    };
    window.addEventListener("ess_weightings_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ess_weightings_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setWeightings = (updater: AssessmentWeightingRule[] | ((prev: AssessmentWeightingRule[]) => AssessmentWeightingRule[])) => {
    const current = getStoredWeightings();
    const next = typeof updater === "function" ? updater(current) : updater;
    saveStoredWeightings(next);
  };

  return [weightings, setWeightings] as const;
}

// Result Submissions & Drafts Hook
export function getStoredResultDrafts(): TeacherResultDraft[] {
  const saved = localStorage.getItem("ess_teacher_result_drafts");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }

  // Pre-seed with existing score records mapped to drafts
  const existingScores = getStoredScores();
  return existingScores.map(sc => ({
    id: `DFT-${sc.id}`,
    studentId: sc.studentId,
    studentName: sc.studentName,
    class: sc.class,
    subject: sc.subject,
    session: sc.session.split(" - ")[0] || "2025/2026",
    term: sc.session.split(" - ")[1] || "First Term",
    firstTest: sc.ca1,
    secondTest: sc.ca2,
    thirdTest: sc.ca3,
    cbtScore: sc.ca4 * 2.5, // mapped CBT score
    includeCbtInResult: true,
    examination: sc.exam,
    totalScore: sc.total,
    grade: sc.grade,
    teacherRemark: sc.remark,
    status: "Finalized",
    submittedBy: "Subject Teacher",
    submittedAt: "2026-09-01 10:00 AM",
    finalizedAt: "2026-09-02 02:30 PM",
  }));
}

export function saveStoredResultDrafts(drafts: TeacherResultDraft[]) {
  localStorage.setItem("ess_teacher_result_drafts", JSON.stringify(drafts));
  window.dispatchEvent(new Event("ess_result_drafts_change"));
}

export function useResultDrafts() {
  const [drafts, setDraftsState] = useState<TeacherResultDraft[]>(getStoredResultDrafts);

  useEffect(() => {
    const handleUpdate = () => {
      setDraftsState(getStoredResultDrafts());
    };
    window.addEventListener("ess_result_drafts_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ess_result_drafts_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setDrafts = (updater: TeacherResultDraft[] | ((prev: TeacherResultDraft[]) => TeacherResultDraft[])) => {
    const current = getStoredResultDrafts();
    const next = typeof updater === "function" ? updater(current) : updater;
    saveStoredResultDrafts(next);
  };

  return [drafts, setDrafts] as const;
}

// Grade calculation helper
export function calculateGrade(total: number): { grade: string; remark: string } {
  if (total >= 70) return { grade: "A", remark: "Excellent" };
  if (total >= 60) return { grade: "B", remark: "Very Good" };
  if (total >= 50) return { grade: "C", remark: "Good" };
  if (total >= 45) return { grade: "D", remark: "Pass" };
  if (total >= 40) return { grade: "E", remark: "Fair" };
  return { grade: "F", remark: "Fail" };
}
