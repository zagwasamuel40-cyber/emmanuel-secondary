import { useState, useEffect } from "react";

export interface ScoreRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  session: string;
  ca1: number;
  ca2: number;
  ca3: number;
  ca4: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
  position?: string;
  annualScore?: number;
  teacherNote?: string;
}

export const initialScores: ScoreRecord[] = [
  { id: "SCR-101", studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", class: "SSS 3A", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 9, ca2: 8, ca3: 9, ca4: 9, exam: 52, total: 87, grade: "A", remark: "Excellent", position: "1st", annualScore: 258, teacherNote: "Outstanding problem solver" },
  { id: "SCR-102", studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", class: "SSS 3A", subject: "English Language", session: "2025/2026 - First Term", ca1: 8, ca2: 7, ca3: 8, ca4: 8, exam: 45, total: 76, grade: "A", remark: "Excellent", position: "1st", annualScore: 230, teacherNote: "Very articulate essays" },
  { id: "SCR-103", studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", class: "SSS 3A", subject: "Physics", session: "2025/2026 - First Term", ca1: 9, ca2: 9, ca3: 8, ca4: 8, exam: 50, total: 84, grade: "A", remark: "Excellent", position: "1st", annualScore: 248, teacherNote: "Brilliant practical understanding" },
  { id: "SCR-104", studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", class: "SSS 3A", subject: "Chemistry", session: "2025/2026 - First Term", ca1: 8, ca2: 8, ca3: 9, ca4: 8, exam: 48, total: 81, grade: "A", remark: "Excellent", position: "1st", annualScore: 240, teacherNote: "Great grasp of stoichiometry" },
  { id: "SCR-105", studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", class: "SSS 3A", subject: "Biology", session: "2025/2026 - First Term", ca1: 7, ca2: 8, ca3: 8, ca4: 8, exam: 44, total: 75, grade: "A", remark: "Excellent", position: "2nd", annualScore: 222, teacherNote: "Very thorough diagrams" },

  { id: "SCR-106", studentId: "ESS/2026/002", studentName: "Chioma Nwosu", class: "SSS 2B", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 7, ca2: 8, ca3: 8, ca4: 7, exam: 42, total: 72, grade: "A", remark: "Excellent", position: "3rd", annualScore: 215, teacherNote: "Good effort" },
  { id: "SCR-107", studentId: "ESS/2026/002", studentName: "Chioma Nwosu", class: "SSS 2B", subject: "English Language", session: "2025/2026 - First Term", ca1: 6, ca2: 7, ca3: 7, ca4: 7, exam: 38, total: 65, grade: "B", remark: "Very Good", position: "2nd", annualScore: 198, teacherNote: "Steady performance" },
  { id: "SCR-108", studentId: "ESS/2026/002", studentName: "Chioma Nwosu", class: "SSS 2B", subject: "Economics", session: "2025/2026 - First Term", ca1: 8, ca2: 8, ca3: 8, ca4: 7, exam: 46, total: 77, grade: "A", remark: "Excellent", position: "1st", annualScore: 231, teacherNote: "Understands economic principles" },

  { id: "SCR-109", studentId: "ESS/2026/003", studentName: "Abubakar Ibrahim", class: "JSS 1A", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 7, ca2: 6, ca3: 8, ca4: 7, exam: 36, total: 64, grade: "B", remark: "Very Good", position: "1st", annualScore: 190, teacherNote: "Good foundation" },
  { id: "SCR-110", studentId: "ESS/2026/003", studentName: "Abubakar Ibrahim", class: "JSS 1A", subject: "English Language", session: "2025/2026 - First Term", ca1: 8, ca2: 8, ca3: 7, ca4: 7, exam: 40, total: 70, grade: "A", remark: "Excellent", position: "1st", annualScore: 210, teacherNote: "Excellent reading comprehension" },

  { id: "SCR-111", studentId: "ESS/2026/004", studentName: "Grace Okhiria", class: "SSS 3C", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 5, ca2: 4, ca3: 6, ca4: 5, exam: 28, total: 48, grade: "D", remark: "Pass", position: "4th", annualScore: 140, teacherNote: "Needs extra practice" },
  { id: "SCR-112", studentId: "ESS/2026/004", studentName: "Grace Okhiria", class: "SSS 3C", subject: "English Language", session: "2025/2026 - First Term", ca1: 6, ca2: 6, ca3: 7, ca4: 6, exam: 35, total: 60, grade: "B", remark: "Very Good", position: "3rd", annualScore: 180, teacherNote: "Good comprehension skills" },

  { id: "SCR-113", studentId: "ESS/2026/005", studentName: "David Emmanuel", class: "JSS 3B", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 8, ca2: 9, ca3: 9, ca4: 8, exam: 48, total: 82, grade: "A", remark: "Excellent", position: "2nd", annualScore: 245, teacherNote: "Keen analytical skills" },
  { id: "SCR-114", studentId: "ESS/2026/005", studentName: "David Emmanuel", class: "JSS 3B", subject: "English Language", session: "2025/2026 - First Term", ca1: 8, ca2: 8, ca3: 8, ca4: 9, exam: 46, total: 79, grade: "A", remark: "Excellent", position: "1st", annualScore: 237, teacherNote: "Excellent vocabulary and grammar" }
];

export function getStoredScores(): ScoreRecord[] {
  const saved = localStorage.getItem("ess_scores");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return initialScores;
}

export function useScores() {
  const [scores, setScoresState] = useState<ScoreRecord[]>(getStoredScores);

  useEffect(() => {
    const handleUpdate = () => {
      setScoresState(getStoredScores());
    };
    window.addEventListener("ess_scores_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("ess_scores_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setScores = (newScores: ScoreRecord[] | ((prev: ScoreRecord[]) => ScoreRecord[])) => {
    const current = getStoredScores();
    const nextScores = typeof newScores === "function" ? newScores(current) : newScores;
    localStorage.setItem("ess_scores", JSON.stringify(nextScores));
    window.dispatchEvent(new Event("ess_scores_change"));
  };

  return [scores, setScores] as const;
}
