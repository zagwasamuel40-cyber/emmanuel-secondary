import { useState, useEffect } from "react";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  targetClass: string;
  dueDate: string;
  createdAt: string;
  teacherId?: string;
  teacherName?: string;
  maxMarks?: number;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentClass?: string;
  content: string;
  submittedAt: string;
  grade: number | null;
  feedback: string;
  status: "Pending Review" | "Graded";
  maxMarks?: number;
  documentName?: string;
  documentUrl?: string;
  documentSize?: string;
  documentType?: string;
}

const initialAssignments: Assignment[] = [
  {
    id: "ASS-001",
    title: "Algebra & Quadratic Equations Homework",
    description: "Solve questions 1 through 15 on Chapter 4 (Page 42-45). Show all workings clearly, including factorization and formula methods.",
    subject: "Mathematics",
    targetClass: "SSS 3A",
    dueDate: "2026-08-25",
    createdAt: "2026-08-10",
    teacherId: "TCH/2026/002",
    teacherName: "Mrs. Victoria Danjuma",
    maxMarks: 100
  },
  {
    id: "ASS-002",
    title: "Thermodynamics & Heat Capacity Report",
    description: "Write a 2-page laboratory review on the Specific Heat Capacity of Copper and Aluminum. Attach graphs where appropriate.",
    subject: "Physics",
    targetClass: "SSS 3A",
    dueDate: "2026-08-28",
    createdAt: "2026-08-12",
    teacherId: "TCH/2026/001",
    teacherName: "Dr. Samuel Okoh",
    maxMarks: 100
  },
  {
    id: "ASS-003",
    title: "Formal Essay: Technology in Secondary Education",
    description: "Compose an argumentative essay (450 - 600 words) debating whether AI tutors should replace traditional homework checking.",
    subject: "English Language",
    targetClass: "SSS 3A",
    dueDate: "2026-08-30",
    createdAt: "2026-08-14",
    teacherId: "TCH/2026/003",
    teacherName: "Mr. Chukwuma Eze",
    maxMarks: 100
  }
];

const initialSubmissions: AssignmentSubmission[] = [
  {
    id: "SUB-001",
    assignmentId: "ASS-001",
    studentId: "ESS/2026/001",
    studentName: "Oluwaseun Adebayo",
    studentClass: "SSS 3A",
    content: "Attached is my completed solutions for questions 1 to 15 with full quadratic formula steps and discriminant checks.",
    submittedAt: "2026-08-11 14:00",
    grade: 92,
    feedback: "Exceptional presentation and rigorous derivation in Question 12. Keep up the high standard!",
    status: "Graded",
    maxMarks: 100,
    documentName: "Adebayo_Quadratic_Solutions_HW1.pdf",
    documentSize: "340 KB",
    documentType: "application/pdf"
  },
  {
    id: "SUB-002",
    assignmentId: "ASS-001",
    studentId: "ESS/2026/002",
    studentName: "Chioma Nwosu",
    studentClass: "SSS 3A",
    content: "Here are my completed answers for the 15 equations. I solved questions 1-10 using factorization and 11-15 using the quadratic formula.",
    submittedAt: "2026-08-13 09:30",
    grade: null,
    feedback: "",
    status: "Pending Review",
    maxMarks: 100,
    documentName: "Chioma_Nwosu_Maths_Assignment.docx",
    documentSize: "512 KB",
    documentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  },
  {
    id: "SUB-003",
    assignmentId: "ASS-002",
    studentId: "ESS/2026/001",
    studentName: "Oluwaseun Adebayo",
    studentClass: "SSS 3A",
    content: "Please find attached my lab experiment report on heat capacities and calorimeters. Included error margin calculations.",
    submittedAt: "2026-08-15 16:45",
    grade: 88,
    feedback: "Well structured lab report with accurate calorimeter graphs. Ensure units are explicitly labeled next time.",
    status: "Graded",
    maxMarks: 100,
    documentName: "Physics_Thermodynamics_Lab_Adebayo.pdf",
    documentSize: "780 KB",
    documentType: "application/pdf"
  }
];

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem("ess_assignments");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialAssignments;
  });

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem("ess_submissions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return initialSubmissions;
  });

  useEffect(() => {
    localStorage.setItem("ess_assignments", JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem("ess_submissions", JSON.stringify(submissions));
  }, [submissions]);

  return { assignments, setAssignments, submissions, setSubmissions };
}

