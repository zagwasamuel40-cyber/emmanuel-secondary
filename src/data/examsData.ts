import { useState, useEffect } from "react";

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctOption: number; // 0, 1, 2, 3
}

export interface Exam {
  id: number;
  title: string;
  subject: string;
  targetClass: string;
  type: string;
  date: string;
  duration: number; // minutes
  passMark: number; // percentage e.g. 50
  status: string;
  questions: Question[];
}

export const defaultQuestionsMap: Record<string, Question[]> = {
  default: [
    {
      id: 1,
      text: "Which of the following is the primary function of the cell mitochondrion?",
      options: ["Protein Synthesis", "Cellular Respiration and Energy Production", "Photosynthesis", "DNA Replication"],
      correctOption: 1
    },
    {
      id: 2,
      text: "Solve for x in the equation: 3x + 15 = 45",
      options: ["x = 5", "x = 10", "x = 15", "x = 20"],
      correctOption: 1
    },
    {
      id: 3,
      text: "What is the capital city of Nigeria?",
      options: ["Lagos", "Kano", "Abuja", "Port Harcourt"],
      correctOption: 2
    },
    {
      id: 4,
      text: "Which literary device is used in 'The wind whispered through the trees'?",
      options: ["Metaphor", "Personification", "Hyperbole", "Oxymoron"],
      correctOption: 1
    },
    {
      id: 5,
      text: "An object is dropped from rest. What is its velocity after 3 seconds? (g = 9.8 m/s²)",
      options: ["29.4 m/s", "19.6 m/s", "9.8 m/s", "44.1 m/s"],
      correctOption: 0
    }
  ]
};

const initialExams: Exam[] = [
  { 
    id: 1, 
    title: "First Term Mid-Term", 
    subject: "Mathematics",
    targetClass: "SSS 3A",
    type: "Continuous Assessment", 
    date: "Oct 15, 2026", 
    duration: 45,
    passMark: 50,
    status: "Upcoming",
    questions: defaultQuestionsMap.default
  },
  { 
    id: 2, 
    title: "WAEC Mock Exam (SSS3)", 
    subject: "English Language",
    targetClass: "SSS 3 All",
    type: "CBT", 
    date: "Nov 05, 2026", 
    duration: 60,
    passMark: 60,
    status: "Scheduled",
    questions: defaultQuestionsMap.default
  },
  { 
    id: 3, 
    title: "BECE Prep Test", 
    subject: "Basic Science",
    targetClass: "JSS 3",
    type: "CBT", 
    date: "Sep 30, 2026", 
    duration: 30,
    passMark: 50,
    status: "Completed",
    questions: defaultQuestionsMap.default
  },
  { 
    id: 4, 
    title: "First Term Examination", 
    subject: "Physics",
    targetClass: "SSS 2 Science",
    type: "Finals", 
    date: "Dec 05, 2026", 
    duration: 90,
    passMark: 50,
    status: "Draft",
    questions: defaultQuestionsMap.default
  },
];

export function useExams() {
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem("ess_exams");
    return saved ? JSON.parse(saved) : initialExams;
  });

  useEffect(() => {
    localStorage.setItem("ess_exams", JSON.stringify(exams));
  }, [exams]);

  return { exams, setExams };
}
