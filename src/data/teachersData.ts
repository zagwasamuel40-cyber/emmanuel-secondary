import { useState, useEffect } from "react";

export type SystemRole = 'Teacher' | 'Admin' | 'Admission Officer' | 'Portal Admin' | 'Super Admin' | 'General Admin' | 'Examination Admin' | 'Finance/Admin Officer' | 'HR/Staff Admin' | 'Academic Admin' | 'Library Admin' | 'Inventory Admin';

export type StaffStatus = 'Active' | 'On Leave' | 'Suspended' | 'Terminated' | 'Resigned' | 'Retired' | 'Inactive';

export interface Teacher {
  id: string; // Staff Number / ID
  name: string;
  department: string;
  role: string;
  status: StaffStatus;
  email: string;
  phone: string;
  address: string;
  subjects: string[];
  assignedClasses: string[];
  password: string;
  systemRoles: SystemRole[];
  passportUrl?: string;
  employmentDate?: string;
}

const initialTeachers: Teacher[] = [
  {
    id: "ADM/2026/001",
    name: "System Administrator",
    department: "Administration",
    role: "General Admin",
    status: "Active",
    email: "admin@ess.edu.ng",
    phone: "+234 800 000 0000",
    address: "Admin Block",
    subjects: [],
    assignedClasses: [],
    password: "admin123",
    systemRoles: ['Admin', 'Super Admin', 'General Admin', 'HR/Staff Admin'],
    employmentDate: '2020-01-01'
  },
  {
    id: "TCH/2026/042",
    name: "Mrs. Grace Adeyemi",
    department: "Languages",
    role: "English Teacher",
    status: "Active",
    email: "g.adeyemi@staff.ess.edu.ng",
    phone: "+234 802 345 6789",
    address: "12 Staff Quarters",
    subjects: ["English Language"],
    assignedClasses: ["JSS 1A", "JSS 1B"],
    password: "teacher123",
    systemRoles: ['Teacher'],
    employmentDate: '2022-05-10'
  },
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
    systemRoles: ['Teacher', 'Academic Admin'],
    employmentDate: '2020-01-15'
  }
];

export function getStoredTeachers(): Teacher[] {
  const saved = localStorage.getItem("ess_teachers");
  if (saved) {
    try {
      let parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed = parsed.map(t => {
          if (t.systemRole && !t.systemRoles) {
            t.systemRoles = [t.systemRole === 'Teacher' ? 'Teacher' : 'Teacher', t.systemRole].filter((v, i, a) => a.indexOf(v) === i);
            delete t.systemRole;
          } else if (!t.systemRoles) {
            t.systemRoles = ['Teacher'];
          }
          if (!t.status) {
             t.status = 'Active';
          }
          return t;
        });

        // Ensure new demo teachers are present if missing
        initialTeachers.forEach(initial => {
          if (!parsed.find((t: Teacher) => t.id === initial.id)) {
            parsed.push(initial);
          }
        });
        
        return parsed;
      }
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
