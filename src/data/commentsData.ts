import { useState, useEffect } from "react";

export interface ParentComment {
  id: string;
  parentName: string;
  relation: string; // e.g., "Parent of JSS 1 student"
  comment: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

const initialComments: ParentComment[] = [
  {
    id: "COM-001",
    parentName: "Mrs. A. Terhemen",
    relation: "Parent",
    comment: "Emmanuel Secondary School has transformed my child. The teachers are dedicated and the CBT portal makes exams seamless.",
    date: "2026-07-20",
    status: "Approved"
  },
  {
    id: "COM-002",
    parentName: "Mr. B. Olorunfemi",
    relation: "Parent",
    comment: "Great environment for learning, and I love how we can check results online.",
    date: "2026-08-10",
    status: "Approved"
  },
  {
    id: "COM-003",
    parentName: "Chief D. Abba",
    relation: "Guardian",
    comment: "The new portal is very confusing, I need help navigating it.",
    date: "2026-08-15",
    status: "Pending"
  }
];

export function useComments() {
  const [comments, setComments] = useState<ParentComment[]>(() => {
    const saved = localStorage.getItem("ess_parent_comments");
    if (saved) return JSON.parse(saved);
    return initialComments;
  });

  useEffect(() => {
    localStorage.setItem("ess_parent_comments", JSON.stringify(comments));
  }, [comments]);

  return [comments, setComments] as const;
}
