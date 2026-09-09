import { useState, useEffect } from "react";

export type SystemRole = 'Teacher' | 'Admin' | 'Attendance Officer' | 'Admission Officer' | 'Portal Admin' | 'Super Admin' | 'General Admin' | 'Examination Admin' | 'Finance/Admin Officer' | 'HR/Staff Admin' | 'Academic Admin' | 'Library Admin' | 'Inventory Admin';

export type StaffStatus = 'Active' | 'On Leave' | 'Suspended' | 'Terminated' | 'Resigned' | 'Retired' | 'Inactive';

export const DEPARTMENTS = [
  "All Departments",
  "Sciences",
  "Mathematics",
  "Languages",
  "Humanities",
  "Commercial",
  "Vocational",
  "Administration",
  "Security & Logistics"
];

export interface Teacher {
  id: string; // Staff Number / ID
  name: string;
  gender?: string;
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
    id: "PRN/2026/001",
    name: "Dr. Emmanuel A. Vershima",
    gender: "Male",
    department: "Administration",
    role: "Principal & Director of Education",
    status: "Active",
    email: "principal@ess.edu.ng",
    phone: "+234 703 900 9964",
    address: "Principal's Lodge, Emmanuel Secondary School Campus, Makurdi",
    subjects: ["Civic Education", "Leadership Studies"],
    assignedClasses: ["SSS 3A", "SSS 3B"],
    password: "principal123",
    systemRoles: ['Admin', 'Super Admin', 'General Admin', 'Academic Admin'],
    employmentDate: '2018-09-01',
    passportUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "VPA/2026/002",
    name: "Mrs. Victoria N. Alabi",
    gender: "Female",
    department: "Administration",
    role: "Vice Principal (Academics)",
    status: "Active",
    email: "vp.academics@ess.edu.ng",
    phone: "+234 803 555 0102",
    address: "Plot 8, Federal Low Cost, Makurdi, Benue State",
    subjects: ["English Literature"],
    assignedClasses: ["SSS 3A", "SSS 3B"],
    password: "admin123",
    systemRoles: ['Admin', 'Academic Admin', 'Examination Admin'],
    employmentDate: '2019-01-10',
    passportUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "VPA/2026/003",
    name: "Mr. Kenneth O. Agbo",
    gender: "Male",
    department: "Administration",
    role: "Vice Principal (Administration & Discipline)",
    status: "Active",
    email: "vp.admin@ess.edu.ng",
    phone: "+234 802 444 0103",
    address: "15 High Level Quarters, Makurdi, Benue State",
    subjects: ["Government"],
    assignedClasses: ["SSS 2A", "SSS 2B"],
    password: "admin123",
    systemRoles: ['Admin', 'General Admin', 'HR/Staff Admin'],
    employmentDate: '2019-03-15',
    passportUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "ADM/2026/001",
    name: "Mr. Clement U. Oche",
    gender: "Male",
    department: "Administration",
    role: "Head of ICT & Portal Administrator",
    status: "Active",
    email: "admin@ess.edu.ng",
    phone: "+234 800 000 0000",
    address: "ICT Data Center, Admin Block, ESS",
    subjects: ["Computer Studies", "Data Processing"],
    assignedClasses: ["SSS 1A", "SSS 2A", "SSS 3A"],
    password: "admin123",
    systemRoles: ['Admin', 'Super Admin', 'General Admin', 'Portal Admin', 'HR/Staff Admin'],
    employmentDate: '2020-01-01',
    passportUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "TCH/2026/001",
    name: "Dr. Samuel Okoh",
    gender: "Male",
    department: "Sciences",
    role: "Senior Master & HOD Sciences",
    status: "Active",
    email: "s.okoh@staff.ess.edu.ng",
    phone: "+234 803 456 7890",
    address: "24 Executive Quarters, Makurdi, Benue State",
    subjects: ["Physics", "Further Mathematics"],
    assignedClasses: ["SSS 3A", "SSS 3B", "SSS 2A"],
    password: "teacher123",
    systemRoles: ['Teacher', 'Academic Admin'],
    employmentDate: '2020-01-15',
    passportUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "TCH/2026/042",
    name: "Mrs. Grace Adeyemi",
    gender: "Female",
    department: "Languages",
    role: "HOD Languages & Senior English Tutor",
    status: "Active",
    email: "g.adeyemi@staff.ess.edu.ng",
    phone: "+234 802 345 6789",
    address: "12 Staff Quarters, Emmanuel Secondary School",
    subjects: ["English Language", "Literature in English"],
    assignedClasses: ["JSS 1A", "JSS 1B", "SSS 1A"],
    password: "teacher123",
    systemRoles: ['Teacher'],
    employmentDate: '2022-05-10',
    passportUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "TCH/2026/015",
    name: "Mr. Babatunde Lawal",
    gender: "Male",
    department: "Mathematics",
    role: "HOD Mathematics & Senior Specialist",
    status: "Active",
    email: "b.lawal@staff.ess.edu.ng",
    phone: "+234 805 123 9876",
    address: "18 Ankpa Road, Makurdi, Benue State",
    subjects: ["Mathematics", "Further Mathematics"],
    assignedClasses: ["SSS 1B", "SSS 2B", "SSS 3B"],
    password: "teacher123",
    systemRoles: ['Teacher', 'Examination Admin'],
    employmentDate: '2021-02-01',
    passportUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "TCH/2026/023",
    name: "Mrs. Ngozi Eze",
    gender: "Female",
    department: "Commercial",
    role: "HOD Commercial Studies & Economics Tutor",
    status: "Active",
    email: "n.eze@staff.ess.edu.ng",
    phone: "+234 807 888 2345",
    address: "3 Wurukum Market Road, Makurdi, Benue State",
    subjects: ["Economics", "Commerce", "Financial Accounting"],
    assignedClasses: ["SSS 1C", "SSS 2C", "SSS 3C"],
    password: "teacher123",
    systemRoles: ['Teacher'],
    employmentDate: '2021-08-15',
    passportUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "TCH/2026/031",
    name: "Mr. Terzungwe D. Iorfa",
    gender: "Male",
    department: "Vocational",
    role: "HOD Technical Drawing & Vocational Studies",
    status: "Active",
    email: "t.iorfa@staff.ess.edu.ng",
    phone: "+234 812 345 6701",
    address: "9 Kanshio Layout, Makurdi, Benue State",
    subjects: ["Technical Drawing", "Basic Technology", "Fine Art"],
    assignedClasses: ["JSS 2A", "JSS 3A", "SSS 1A"],
    password: "teacher123",
    systemRoles: ['Teacher'],
    employmentDate: '2022-01-20',
    passportUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "TCH/2026/054",
    name: "Mrs. Esther M. Ayua",
    gender: "Female",
    department: "Sciences",
    role: "Senior Biology & Agricultural Science Tutor",
    status: "Active",
    email: "e.ayua@staff.ess.edu.ng",
    phone: "+234 803 777 9012",
    address: "6 Modern Market Road, Makurdi, Benue State",
    subjects: ["Biology", "Agricultural Science"],
    assignedClasses: ["SSS 1A", "SSS 2A", "SSS 3A"],
    password: "teacher123",
    systemRoles: ['Teacher'],
    employmentDate: '2022-09-01',
    passportUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "TCH/2026/063",
    name: "Mr. Chukwuemeka Obi",
    gender: "Male",
    department: "Sciences",
    role: "Senior Chemistry & Physics Tutor",
    status: "Active",
    email: "c.obi@staff.ess.edu.ng",
    phone: "+234 806 654 3210",
    address: "11 Benue Crescent, Makurdi, Benue State",
    subjects: ["Chemistry", "Basic Science"],
    assignedClasses: ["SSS 1B", "SSS 2B", "SSS 3B"],
    password: "teacher123",
    systemRoles: ['Teacher'],
    employmentDate: '2023-01-10',
    passportUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "TCH/2026/072",
    name: "Mrs. Deborah S. Tor",
    gender: "Female",
    department: "Humanities",
    role: "Senior Government & Civic Education Tutor",
    status: "Active",
    email: "d.tor@staff.ess.edu.ng",
    phone: "+234 813 901 2345",
    address: "14 David Mark Bye-pass, Makurdi, Benue State",
    subjects: ["Government", "Christian Religious Studies", "Civic Education"],
    assignedClasses: ["JSS 3A", "SSS 1A", "SSS 2A"],
    password: "teacher123",
    systemRoles: ['Teacher'],
    employmentDate: '2023-04-18',
    passportUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "BUR/2026/005",
    name: "Mrs. Blessing K. Danladi",
    gender: "Female",
    department: "Administration",
    role: "Chief Bursar & Head of Accounts",
    status: "Active",
    email: "bursar@ess.edu.ng",
    phone: "+234 803 210 9876",
    address: "Bursary Office, Emmanuel Secondary School",
    subjects: [],
    assignedClasses: [],
    password: "bursar123",
    systemRoles: ['Finance/Admin Officer', 'Admin'],
    employmentDate: '2020-03-01',
    passportUrl: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "STF/2026/088",
    name: "Mr. Emmanuel Terhemba",
    gender: "Male",
    department: "Security & Operations",
    role: "Chief Attendance Officer & Gate Controller",
    status: "Active",
    email: "attendance@ess.edu.ng",
    phone: "+234 814 555 1234",
    address: "Security Command & Gate Office, ESS",
    subjects: [],
    assignedClasses: [],
    password: "officer123",
    systemRoles: ['Attendance Officer'],
    employmentDate: '2023-03-01',
    passportUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "STF/2026/019",
    name: "Mrs. Fatima Bello",
    gender: "Female",
    department: "Humanities",
    role: "Chief Guidance & Counseling Officer",
    status: "Active",
    email: "counselor@ess.edu.ng",
    phone: "+234 802 888 4433",
    address: "Student Support Center, Emmanuel Secondary School",
    subjects: ["Guidance & Life Skills"],
    assignedClasses: ["JSS 1A", "SSS 3A"],
    password: "counselor123",
    systemRoles: ['Teacher', 'Admission Officer'],
    employmentDate: '2021-11-01',
    passportUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "ADM/2026/010",
    name: "Mrs. Abigail M. Iorliam",
    gender: "Female",
    department: "Administration",
    role: "Chief Admission Officer & Registrar",
    status: "Active",
    email: "admission@ess.edu.ng",
    phone: "+234 803 999 1122",
    address: "Admission Directorate, Administration Block, Emmanuel Secondary School",
    subjects: [],
    assignedClasses: [],
    password: "admission123",
    systemRoles: ['Admission Officer'],
    employmentDate: '2020-09-01',
    passportUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "LIB/2026/007",
    name: "Mr. John A. Tyovenda",
    gender: "Male",
    department: "Administration",
    role: "Chief Librarian & Information Specialist",
    status: "Active",
    email: "library@ess.edu.ng",
    phone: "+234 816 777 5544",
    address: "School E-Library Complex, Emmanuel Secondary School",
    subjects: ["Library Studies"],
    assignedClasses: ["JSS 1A", "JSS 2A"],
    password: "library123",
    systemRoles: ['Library Admin', 'Teacher'],
    employmentDate: '2022-02-15',
    passportUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "MED/2026/012",
    name: "Nurse Rosemary K. Akor",
    gender: "Female",
    department: "Administration",
    role: "School Health Officer & Registered Matron",
    status: "Active",
    email: "clinic@ess.edu.ng",
    phone: "+234 808 333 2211",
    address: "School Clinic & Health Bay, Emmanuel Secondary School",
    subjects: ["Health Science & First Aid"],
    assignedClasses: [],
    password: "clinic123",
    systemRoles: ['Teacher'],
    employmentDate: '2022-07-01',
    passportUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
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
