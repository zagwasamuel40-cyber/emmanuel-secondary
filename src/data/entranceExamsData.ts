import { useState, useEffect } from "react";

export interface EntranceExam {
  id: string;
  session: string;
  classApplied: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  venue: string;
  maxCandidates: number;
  status: "Scheduled" | "Active" | "Completed" | "Cancelled";
}

export interface EntranceExamCode {
  id: string;
  examId: string;
  applicationNumber: string; // The candidate's app number
  accessCode: string;
  status: "Unused" | "Activated" | "Used" | "Revoked";
  activatedBy?: string; // staff ID
  activatedAt?: string;
  attemptStartTime?: string;
  attemptSubmitTime?: string;
  attemptStatus?: "Pending" | "In Progress" | "Completed" | "Auto-Submitted";
  score?: number;
}

const defaultExams: EntranceExam[] = [
  {
    id: "ENT-2026-01",
    session: "2026/2027",
    classApplied: "JSS 1",
    date: "2026-09-20",
    startTime: "09:00",
    endTime: "11:00",
    duration: 120,
    venue: "School ICT Hall",
    maxCandidates: 50,
    status: "Scheduled"
  }
];

const defaultCodes: EntranceExamCode[] = [
  {
    id: "CODE-001",
    examId: "ENT-2026-01",
    applicationNumber: "EMS/2026/000125",
    accessCode: "X7K9-P2LM",
    status: "Unused"
  }
];

export function useEntranceExams() {
  const [exams, setExamsState] = useState<EntranceExam[]>(() => {
    const saved = localStorage.getItem("ess_entrance_exams");
    return saved ? JSON.parse(saved) : defaultExams;
  });

  const [codes, setCodesState] = useState<EntranceExamCode[]>(() => {
    const saved = localStorage.getItem("ess_entrance_codes");
    return saved ? JSON.parse(saved) : defaultCodes;
  });

  useEffect(() => {
    localStorage.setItem("ess_entrance_exams", JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem("ess_entrance_codes", JSON.stringify(codes));
  }, [codes]);

  return { exams, setExams: setExamsState, codes, setCodes: setCodesState };
}

export function generateAccessCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += "-";
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}
