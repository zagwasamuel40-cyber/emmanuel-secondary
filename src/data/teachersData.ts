import { useState, useEffect } from "react";

export interface Teacher {
  id: string; // Staff Number / ID
  name: string;
  department: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  email: string;
  phone: string;
  address: string;
  subjects: string[];
  assignedClasses: string[];
  password: string;
  systemRole?: 'Teacher' | 'Admin' | 'Admission Officer' | 'Portal Admin' | 'Super Admin';
  passportUrl?: string;
}

const initialTeachers: Teacher[] = [
  {
    id: "TCH/2026/001",
    name: "Dr. Samuel Okoh",
    department: "Sciences",
    role: "Senior Master & HOD Science",
    status: "Active",
    email: "s.okoh@staff.ess.edu.ng",
    phone: "+234 803 456 7890",
    address: "24 Executive Quarters, Makurdi, Benue State",
    subjects: ["Physics", "Further Mathematics"],
    assignedClasses: ["SSS 3A", "SSS 3B", "SSS 2A"],
    password: "teacher123",
    systemRole: 'Admin'
  }
];

export function getStoredTeachers(): Teacher[] {
  const saved = localStorage.getItem("ess_teachers");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return initialTeachers;
}

export function useTeachers() {
  const [teachers, setTeachersState] = useState<Teacher[]>(getStoredTeachers);

  useEffect(() => {
    const handleUpdate = () => {
      setTeachersState(getStoredTeachers());
    };
    window.addEventListener("ess_teachers_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ess_teachers_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setTeachers = (newTeachers: Teacher[] | ((prev: Teacher[]) => Teacher[])) => {
    const current = getStoredTeachers();
    const nextTeachers = typeof newTeachers === "function" ? newTeachers(current) : newTeachers;
    localStorage.setItem("ess_teachers", JSON.stringify(nextTeachers));
    window.dispatchEvent(new Event("ess_teachers_change"));
  };

  return [teachers, setTeachers] as const;
}
