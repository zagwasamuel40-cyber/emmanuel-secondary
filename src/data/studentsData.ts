import { useState, useEffect } from "react";
import { safeStorage, sanitizeStorageData } from "../utils/safeStorage";

export const CLASSES = [
  "JSS 1A", "JSS 1B", "JSS 1C", "JSS 1D",
  "JSS 2A", "JSS 2B", "JSS 2C", "JSS 2D",
  "JSS 3A", "JSS 3B", "JSS 3C", "JSS 3D",
  "SSS 1A", "SSS 1B", "SSS 1C", "SSS 1D",
  "SSS 2A", "SSS 2B", "SSS 2C", "SSS 2D",
  "SSS 3A", "SSS 3B", "SSS 3C", "SSS 3D",
  "Graduated / Alumni"
];

export interface Student {
  id: string;
  applicationNumber?: string;
  name: string;
  class: string;
  previousClass?: string;
  gender: string;
  status: string;
  fees?: string;
  email?: string;
  parentNumber?: string;
  parentPhone?: string;
  address?: string;
  password?: string;
  enrollmentStatus?: string;
  passportUrl?: string;
  dob?: string;
  session?: string;
  term?: string;
}

export const initialStudents: Student[] = [
  { id: "ESS/2026/001", applicationNumber: "ESS/ADM/2026/001", name: "Oluwaseun Adebayo", class: "SSS 3A", previousClass: "SSS 2A", gender: "Male", status: "Active", fees: "Paid", email: "o.adebayo@student.ess.edu.ng", parentNumber: "+234 803 123 4567", address: "14 High Street, Makurdi, Benue State", password: "password123", enrollmentStatus: "Promoted", dob: "2008-05-14" },
  { id: "ESS/2026/002", applicationNumber: "ESS/ADM/2026/002", name: "Chioma Nwosu", class: "SSS 2B", previousClass: "SSS 1B", gender: "Female", status: "Active", fees: "Partial", email: "c.nwosu@student.ess.edu.ng", parentNumber: "+234 802 987 6543", address: "8 Commercial Avenue, Makurdi", password: "password123", enrollmentStatus: "Promoted", dob: "2009-08-22" },
  { id: "ESS/2026/003", applicationNumber: "ESS/ADM/2026/003", name: "Abubakar Ibrahim", class: "JSS 1A", previousClass: "Primary 6", gender: "Male", status: "Active", fees: "Paid", email: "a.ibrahim@student.ess.edu.ng", parentNumber: "+234 805 555 1212", address: "22 Airport Road, Makurdi", password: "password123", enrollmentStatus: "Newly Enrolled", dob: "2013-03-10" },
  { id: "ESS/2026/004", applicationNumber: "ESS/ADM/2026/004", name: "Grace Okhiria", class: "SSS 3C", previousClass: "SSS 2C", gender: "Female", status: "Inactive", fees: "Unpaid", email: "g.okhiria@student.ess.edu.ng", parentNumber: "+234 807 444 3322", address: "5 Gboko Road, Makurdi", password: "password123", enrollmentStatus: "Retained", dob: "2008-11-05" },
  { id: "ESS/2026/005", applicationNumber: "ESS/ADM/2026/005", name: "David Emmanuel", class: "JSS 3B", previousClass: "JSS 2B", gender: "Male", status: "Active", fees: "Paid", email: "d.emmanuel@student.ess.edu.ng", parentNumber: "+234 809 111 2233", address: "19 Ankpa Quarters, Makurdi", password: "password123", enrollmentStatus: "Promoted", dob: "2011-07-19" },
  { id: "ESS/2026/006", applicationNumber: "ESS/ADM/2026/006", name: "Fatima Bello", class: "SSS 3A", previousClass: "SSS 2A", gender: "Female", status: "Active", fees: "Paid", email: "f.bello@student.ess.edu.ng", parentNumber: "+234 803 555 8899", address: "12 Wurukum Road, Makurdi", password: "password123", enrollmentStatus: "Promoted", dob: "2008-09-30" },
  { id: "ESS/2026/007", applicationNumber: "ESS/ADM/2026/007", name: "Emeka Okafor", class: "SSS 3A", previousClass: "SSS 2A", gender: "Male", status: "Active", fees: "Paid", email: "e.okafor@student.ess.edu.ng", parentNumber: "+234 802 444 7711", address: "7 Kanshio Layout, Makurdi", password: "password123", enrollmentStatus: "Promoted", dob: "2008-01-15" },
];

// Ensure every student in state or localStorage has a strictly unique ID and complete data
export function sanitizeStudentsList(list: any[]): Student[] {
  if (!Array.isArray(list) || list.length === 0) return initialStudents;
  const seenIds = new Set<string>();
  let highestNum = 0;

  // Scan existing numeric IDs to find current ceiling
  list.forEach((s) => {
    if (s && s.id) {
      const match = String(s.id).match(/ESS\/\d{4}\/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > highestNum) highestNum = num;
      }
    }
  });

  return list.map((student, idx) => {
    if (!student || typeof student !== "object") return student;
    let studentId = student.id;
    // If ID is missing or already seen, re-assign a unique ID
    if (!studentId || seenIds.has(studentId)) {
      highestNum = Math.max(highestNum + 1, list.length + 1);
      studentId = `ESS/2026/${String(highestNum).padStart(3, "0")}`;
    }
    seenIds.add(studentId);

    const numPart = studentId.match(/ESS\/\d{4}\/(\d+)/)?.[1] || String(idx + 1).padStart(3, "0");
    const appNum = student.applicationNumber || `ESS/ADM/2026/${numPart}`;

    return {
      ...student,
      id: studentId,
      applicationNumber: appNum,
      gender: student.gender || "Not Specified",
      status: student.status || "Active",
      fees: student.fees || "Unpaid",
      password: student.password || "password123",
      enrollmentStatus: student.enrollmentStatus || "Enrolled"
    };
  });
}

/**
 * Resolves a student strictly by ID, Application Number, Email, or Exact Full Name.
 * Never uses fuzzy partial substring matching to prevent account crossover and data leakage.
 */
export function findStudentByIdentifier(
  identifier: string | null | undefined,
  list: Student[]
): Student | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;

  // 1. Exact ID match (case-insensitive)
  const byId = list.find((s) => s.id && s.id.toLowerCase() === clean);
  if (byId) return byId;

  // 2. Exact Application Number match (case-insensitive)
  const byAppNo = list.find(
    (s) => s.applicationNumber && s.applicationNumber.toLowerCase() === clean
  );
  if (byAppNo) return byAppNo;

  // 3. Exact Email match (case-insensitive)
  const byEmail = list.find((s) => s.email && s.email.toLowerCase() === clean);
  if (byEmail) return byEmail;

  // 4. Exact Name match (case-insensitive)
  const byName = list.find((s) => s.name && s.name.trim().toLowerCase() === clean);
  if (byName) return byName;

  return null;
}

// Generates the next guaranteed non-colliding student ID
export function generateNextStudentId(existingStudents: any[]): string {
  let highest = 0;
  const existingIds = new Set<string>();

  (existingStudents || []).forEach((s) => {
    if (s && s.id) {
      existingIds.add(String(s.id).trim());
      const match = String(s.id).match(/ESS\/\d{4}\/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > highest) highest = num;
      }
    }
  });

  let nextNum = Math.max(highest + 1, (existingStudents?.length || 0) + 1);
  let candidate = `ESS/2026/${String(nextNum).padStart(3, "0")}`;
  while (existingIds.has(candidate)) {
    nextNum++;
    candidate = `ESS/2026/${String(nextNum).padStart(3, "0")}`;
  }
  return candidate;
}

export function getStoredStudents(): Student[] {
  const saved = safeStorage.getItem("ess_students");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return sanitizeStudentsList(parsed);
    } catch (e) {
      return initialStudents;
    }
  }
  return initialStudents;
}

export function useStudents() {
  const [students, setStudentsState] = useState<Student[]>(getStoredStudents);

  useEffect(() => {
    const handleUpdate = () => {
      setStudentsState(getStoredStudents());
    };
    window.addEventListener("ess_students_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("ess_students_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setStudents = (newStudents: Student[] | ((prev: Student[]) => Student[])) => {
    const current = getStoredStudents();
    const nextVal = typeof newStudents === "function" ? newStudents(current) : newStudents;
    const sanitized = sanitizeStudentsList(nextVal);
    safeStorage.setItem("ess_students", JSON.stringify(sanitized));
    setStudentsState(sanitized);
    window.dispatchEvent(new Event("ess_students_change"));
    window.dispatchEvent(new Event("storage"));
  };

  return [students, setStudents] as const;
}

export const initialAdmissionApps = [
  {
    id: "APP-2026-001",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    gender: "Male",
    class: "JSS 1A",
    assignedClass: "JSS 1A",
    date: "2026-07-25",
    status: "Under Review",
    payment: "Paid",
    acceptanceFee: "Unpaid",
    phone: "+234 800 111 2222",
    email: "j.doe.parent@gmail.com",
    state: "Benue",
    lga: "Makurdi",
    examScore: 78,
    examStatus: "Passed",
    documents: {
      birthCertificate: "Verified",
      academicResult: "Verified",
      passportPhoto: "Verified",
      medicalForm: "Pending"
    },
    offerStatus: "Offered",
    reviewerNotes: "Excellent academic transcripts. Recommended for admission.",
    isTransferredToRoster: false
  },
  {
    id: "APP-2026-002",
    name: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    gender: "Female",
    class: "SSS 1A",
    assignedClass: "SSS 1A",
    date: "2026-07-26",
    status: "Admitted",
    payment: "Paid",
    acceptanceFee: "Paid",
    phone: "+234 800 333 4444",
    email: "smith.family@yahoo.com",
    state: "Enugu",
    lga: "Nsukka",
    examScore: 85,
    examStatus: "Passed",
    documents: {
      birthCertificate: "Verified",
      academicResult: "Verified",
      passportPhoto: "Verified",
      medicalForm: "Verified"
    },
    offerStatus: "Accepted",
    reviewerNotes: "High scorer in Science assessment. Acceptance fee confirmed.",
    isTransferredToRoster: true
  },
  {
    id: "APP-2026-003",
    name: "Peter Obi",
    firstName: "Peter",
    lastName: "Obi",
    gender: "Male",
    class: "JSS 2B",
    assignedClass: "JSS 2B",
    date: "2026-07-24",
    status: "Pending",
    payment: "Unpaid",
    acceptanceFee: "Unpaid",
    phone: "+234 800 555 6666",
    email: "obi.parent@gmail.com",
    state: "Anambra",
    lga: "Anaocha",
    examScore: 0,
    examStatus: "Not Taken",
    documents: {
      birthCertificate: "Submitted",
      academicResult: "Pending",
      passportPhoto: "Submitted",
      medicalForm: "Pending"
    },
    offerStatus: "None",
    reviewerNotes: "Awaiting application fee payment and academic transcript.",
    isTransferredToRoster: false
  },
  {
    id: "APP-2026-004",
    name: "Fatima Alhassan",
    firstName: "Fatima",
    lastName: "Alhassan",
    gender: "Female",
    class: "SSS 1 Science",
    assignedClass: "SSS 1A",
    date: "2026-07-28",
    status: "Exam Scheduled",
    payment: "Paid",
    acceptanceFee: "Unpaid",
    phone: "+234 802 666 7777",
    email: "alhassan.f@gmail.com",
    state: "Kano",
    lga: "Dala",
    examScore: 68,
    examStatus: "Passed",
    documents: {
      birthCertificate: "Verified",
      academicResult: "Verified",
      passportPhoto: "Verified",
      medicalForm: "Submitted"
    },
    offerStatus: "Offered",
    reviewerNotes: "Passed entrance exam. Offer letter generated.",
    isTransferredToRoster: false
  },
  {
    id: "APP-2026-005",
    name: "Emeka Chinedu",
    firstName: "Emeka",
    lastName: "Chinedu",
    gender: "Male",
    class: "JSS 1B",
    assignedClass: "JSS 1B",
    date: "2026-07-29",
    status: "Under Review",
    payment: "Paid",
    acceptanceFee: "Unpaid",
    phone: "+234 803 888 9999",
    email: "chinedu.p@outlook.com",
    state: "Imo",
    lga: "Owerri North",
    examScore: 42,
    examStatus: "Failed",
    documents: {
      birthCertificate: "Verified",
      academicResult: "Verified",
      passportPhoto: "Verified",
      medicalForm: "Pending"
    },
    offerStatus: "Rejected",
    reviewerNotes: "Entrance exam score below required cut-off (50%). Application rejected.",
    isTransferredToRoster: false
  }
];

export function useAdmissionApps() {
  const [apps, setAppsState] = useState<any[]>(() => {
    try {
      const saved = safeStorage.getItem("ess_admission_apps");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return sanitizeStorageData(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to load admission apps:", e);
    }
    return initialAdmissionApps;
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = safeStorage.getItem("ess_admission_apps");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setAppsState(sanitizeStorageData(parsed));
          }
        }
      } catch (e) {
        console.warn("Failed to update admission apps:", e);
      }
    };

    window.addEventListener("ess_admission_apps_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("ess_admission_apps_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setApps = (newApps: any[] | ((prev: any[]) => any[])) => {
    setAppsState(prev => {
      const nextVal = typeof newApps === "function" ? newApps(prev) : newApps;
      const sanitized = sanitizeStorageData(nextVal);
      safeStorage.setItem("ess_admission_apps", JSON.stringify(sanitized));
      window.dispatchEvent(new Event("ess_admission_apps_change"));
      return sanitized;
    });
  };

  return [apps, setApps] as const;
}
