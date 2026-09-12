import { useState, useEffect } from "react";

export type AdmissionPortalStatus = "open" | "closed" | "not_yet_open";

export type ApplicantStatus = "Pending" | "Under Review" | "Approved" | "Rejected" | "Admitted";

export type ApplicantExamStatus =
  | "Examination Not Scheduled"
  | "Examination Scheduled"
  | "Examination Not Yet Due"
  | "Examination Activated"
  | "Examination In Progress"
  | "Examination Completed"
  | "Examination Ended"
  | "Examination Disqualified";

export type ExamLifecycleStatus = "Scheduled" | "Activated" | "In Progress" | "Paused" | "Ended";

export interface ExamQuestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  explanation?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | "Mixed";
  type?: "MCQ" | "True/False" | "Short Answer";
  targetClass?: string;
  topic?: string;
  createdAt?: string;
  flaggedForReview?: boolean;
  validationIssues?: string[];
}

export interface EntranceExamSchedule {
  id: string;
  title: string;
  session: string;
  eligibleClasses: string[];
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  subjects: string[];
  venue: string;
  status: ExamLifecycleStatus;
  passCutoff: number;
  questions: ExamQuestion[];
  scheduledBy: string;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  startedAt?: string;
  pausedAt?: string;
  endedAt?: string;
}

export interface ApplicantProfile {
  id: string; // e.g. APP-2026-001
  applicationNumber: string; // Unique, e.g. ESS/ADM/2026/001
  fullName: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  passportUrl: string;
  dob: string;
  gender: "Male" | "Female";
  phone: string;
  email: string;
  address: string;
  state: string;
  lga: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  parentOccupation: string;
  parentRelationship?: string;
  previousSchool: string;
  classApplied: string;
  applicationDate: string;
  status: ApplicantStatus;
  examStatus: ApplicantExamStatus;
  examId?: string;
  examScore?: number;
  examPercentage?: number;
  examStartedAt?: string;
  examCompletedAt?: string;
  examAnswers?: Record<string, string>;
  reviewerNotes?: string;
  isTransferredToRoster?: boolean;
  examSubmittedBy?: string;
  examSecurityViolations?: number;
}

export interface AdmissionPortalControl {
  portalOpen: boolean; // Manual master switch
  openingDateTime: string; // ISO string e.g. 2026-06-01T08:00
  closingDateTime: string; // ISO string e.g. 2026-10-31T23:59
  academicSession: string;
  autoCloseEnabled: boolean;
  applicationFee: number;
  acceptanceFee: number;
  noticeMessage: string;
  admissionOfficerName: string;
  contactPhone: string;
  contactEmail: string;
}

export interface AdmissionAuditLog {
  id: string;
  officerName: string;
  officerRole: string;
  action: string;
  timestamp: string;
  details: string;
  targetId?: string;
  meta?: Record<string, any>;
}

// Default initial portal control
export const defaultAdmissionPortalControl: AdmissionPortalControl = {
  portalOpen: true,
  openingDateTime: "2026-06-01T08:00",
  closingDateTime: "2026-11-30T23:59",
  academicSession: "2026/2027",
  autoCloseEnabled: true,
  applicationFee: 5000,
  acceptanceFee: 25000,
  noticeMessage: "2026/2027 Academic Session Admissions are currently in progress. Apply early to reserve your entrance examination slot.",
  admissionOfficerName: "Mrs. Abigail M. Iorliam",
  contactPhone: "+234 803 777 0104",
  contactEmail: "admission@ess.edu.ng"
};

// Default sample questions for entrance exams
export const defaultExamQuestions: ExamQuestion[] = [
  {
    id: "Q-ENG-01",
    subject: "English Language",
    question: "Choose the word that is nearest in meaning to the capitalized word: The principal gave an ELOQUENT speech during morning assembly.",
    options: ["Fluent and expressive", "Confusing and long", "Quiet and brief", "Harsh and angry"],
    correctAnswer: "Fluent and expressive",
    marks: 2
  },
  {
    id: "Q-ENG-02",
    subject: "English Language",
    question: "Complete the sentence: Neither the students nor the teacher _______ present at the workshop.",
    options: ["was", "were", "are", "have been"],
    correctAnswer: "was",
    marks: 2
  },
  {
    id: "Q-ENG-03",
    subject: "English Language",
    question: "Identify the figure of speech in: 'The thunder grumbled like an old man.'",
    options: ["Simile", "Metaphor", "Hyperbole", "Personification"],
    correctAnswer: "Simile",
    marks: 2
  },
  {
    id: "Q-MTH-01",
    subject: "Mathematics",
    question: "Solve for x: 3x + 15 = 45 - 2x",
    options: ["6", "5", "8", "9"],
    correctAnswer: "6",
    marks: 2
  },
  {
    id: "Q-MTH-02",
    subject: "Mathematics",
    question: "Calculate the simple interest on ₦50,000 for 3 years at 5% per annum.",
    options: ["₦7,500", "₦5,000", "₦10,000", "₦8,200"],
    correctAnswer: "₦7,500",
    marks: 2
  },
  {
    id: "Q-MTH-03",
    subject: "Mathematics",
    question: "What is the square root of 0.0064?",
    options: ["0.08", "0.8", "0.008", "0.64"],
    correctAnswer: "0.08",
    marks: 2
  },
  {
    id: "Q-GEN-01",
    subject: "General Aptitude",
    question: "Which of the following is the capital city of Benue State?",
    options: ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala"],
    correctAnswer: "Makurdi",
    marks: 2
  },
  {
    id: "Q-GEN-02",
    subject: "General Aptitude",
    question: "Emmanuel Secondary School was founded on the motto of:",
    options: ["Excellence, Knowledge & Moral Discipline", "Forward Ever, Backward Never", "Service to Humanity", "Wisdom and Integrity"],
    correctAnswer: "Excellence, Knowledge & Moral Discipline",
    marks: 2
  },
  {
    id: "Q-GEN-03",
    subject: "General Aptitude",
    question: "If a train travels at 80 km/h, how far will it travel in 2 hours and 30 minutes?",
    options: ["200 km", "160 km", "240 km", "180 km"],
    correctAnswer: "200 km",
    marks: 2
  },
  {
    id: "Q-GEN-04",
    subject: "General Aptitude",
    question: "Which gas do plants absorb from the atmosphere during photosynthesis?",
    options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
    correctAnswer: "Carbon dioxide",
    marks: 2
  }
];

// Default sample entrance examinations
export const defaultEntranceExams: EntranceExamSchedule[] = [
  {
    id: "ENT-2026-001",
    title: "Batch A Entrance Examination 2026",
    session: "2026/2027",
    eligibleClasses: ["JSS 1", "JSS 2", "SSS 1"],
    examDate: "2026-09-20",
    startTime: "09:00",
    endTime: "11:00",
    durationMinutes: 60,
    subjects: ["English Language", "Mathematics", "General Aptitude"],
    venue: "School ICT Hall & Online CBT Portal",
    status: "Scheduled",
    passCutoff: 50,
    questions: defaultExamQuestions,
    scheduledBy: "Mrs. Abigail M. Iorliam",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z"
  }
];

// Initial registered applicants roster
export const defaultApplicants: ApplicantProfile[] = [
  {
    id: "APP-2026-001",
    applicationNumber: "ESS/ADM/2026/001",
    fullName: "Terkimbi Daniel Agbo",
    firstName: "Terkimbi",
    lastName: "Agbo",
    middleName: "Daniel",
    passportUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80",
    dob: "2013-05-14",
    gender: "Male",
    phone: "+234 803 999 1001",
    email: "agbo.terkimbi@gmail.com",
    address: "No. 12 High Level, Makurdi, Benue State",
    state: "Benue",
    lga: "Makurdi",
    parentName: "Engr. Paul Agbo",
    parentPhone: "+234 803 111 2233",
    parentEmail: "paul.agbo@benuestate.gov.ng",
    parentOccupation: "Civil Engineer",
    parentRelationship: "Father",
    previousSchool: "St. Theresa's Primary School, Makurdi",
    classApplied: "JSS 1",
    applicationDate: "2026-08-10",
    status: "Approved",
    examStatus: "Examination Scheduled",
    examId: "ENT-2026-001",
    reviewerNotes: "Primary school transcripts verified. Eligible for Batch A CBT."
  },
  {
    id: "APP-2026-002",
    applicationNumber: "ESS/ADM/2026/002",
    fullName: "Dooshima Grace Iorfa",
    firstName: "Dooshima",
    lastName: "Iorfa",
    middleName: "Grace",
    passportUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    dob: "2013-08-22",
    gender: "Female",
    phone: "+234 802 888 2002",
    email: "grace.iorfa@yahoo.com",
    address: "Plot 5 Federal Low Cost, Naka Road, Makurdi",
    state: "Benue",
    lga: "Gwer West",
    parentName: "Dr. Matthew Iorfa",
    parentPhone: "+234 802 333 4455",
    parentEmail: "dr.iorfa@fmc.gov.ng",
    parentOccupation: "Medical Practitioner",
    parentRelationship: "Father",
    previousSchool: "Bright Stars International School",
    classApplied: "JSS 1",
    applicationDate: "2026-08-12",
    status: "Approved",
    examStatus: "Examination Scheduled",
    examId: "ENT-2026-001",
    reviewerNotes: "Top of her class in primary school. Ready for exam."
  },
  {
    id: "APP-2026-003",
    applicationNumber: "ESS/ADM/2026/003",
    fullName: "Chukwuemeka David Okafor",
    firstName: "Chukwuemeka",
    lastName: "Okafor",
    middleName: "David",
    passportUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    dob: "2011-03-10",
    gender: "Male",
    phone: "+234 805 777 3003",
    email: "c.okafor2011@gmail.com",
    address: "No. 44 Modern Market Road, Makurdi",
    state: "Enugu",
    lga: "Nsukka",
    parentName: "Chief Augustine Okafor",
    parentPhone: "+234 805 444 5566",
    parentEmail: "augustine.okafor@gmail.com",
    parentOccupation: "Businessman",
    parentRelationship: "Father",
    previousSchool: "Christ The King College, Onitsha",
    classApplied: "SSS 1",
    applicationDate: "2026-08-14",
    status: "Approved",
    examStatus: "Examination Scheduled",
    examId: "ENT-2026-001",
    reviewerNotes: "Transfer from JSS 3 with excellent BECE results."
  },
  {
    id: "APP-2026-004",
    applicationNumber: "ESS/ADM/2026/004",
    fullName: "Amina Fatima Suleiman",
    firstName: "Amina",
    lastName: "Suleiman",
    middleName: "Fatima",
    passportUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    dob: "2012-11-05",
    gender: "Female",
    phone: "+234 808 666 4004",
    email: "amina.suleiman@hotmail.com",
    address: "Barracks Road, Wadata, Makurdi",
    state: "Nasarawa",
    lga: "Lafia",
    parentName: "Alhaji Suleiman Yusuf",
    parentPhone: "+234 808 555 6677",
    parentEmail: "yusuf.suleiman@customs.gov.ng",
    parentOccupation: "Senior Officer",
    parentRelationship: "Father",
    previousSchool: "Command Children School, Makurdi",
    classApplied: "JSS 2",
    applicationDate: "2026-08-15",
    status: "Under Review",
    examStatus: "Examination Not Scheduled",
    reviewerNotes: "Awaiting recommendation letter from previous school."
  },
  {
    id: "APP-2026-005",
    applicationNumber: "ESS/ADM/2026/005",
    fullName: "Msughter Isaac Chia",
    firstName: "Msughter",
    lastName: "Chia",
    middleName: "Isaac",
    passportUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    dob: "2013-02-18",
    gender: "Male",
    phone: "+234 809 555 5005",
    email: "msughter.chia@gmail.com",
    address: "Wurukum Roundabout, Makurdi",
    state: "Benue",
    lga: "Tarka",
    parentName: "Mrs. Victoria Chia",
    parentPhone: "+234 809 666 7788",
    parentEmail: "vchia@unical.edu.ng",
    parentOccupation: "Lecturer",
    parentRelationship: "Mother",
    previousSchool: "University Staff School, Makurdi",
    classApplied: "JSS 1",
    applicationDate: "2026-08-16",
    status: "Approved",
    examStatus: "Examination Completed",
    examId: "ENT-2026-001",
    examScore: 18,
    examPercentage: 90,
    examStartedAt: "2026-08-18T09:05:00.000Z",
    examCompletedAt: "2026-08-18T09:50:00.000Z",
    reviewerNotes: "Outstanding exam performance (90%). Recommended for scholarship."
  },
  {
    id: "APP-2026-006",
    applicationNumber: "ESS/ADM/2026/006",
    fullName: "Blessing Onyeka Nwachukwu",
    firstName: "Blessing",
    lastName: "Nwachukwu",
    middleName: "Onyeka",
    passportUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80",
    dob: "2011-07-29",
    gender: "Female",
    phone: "+234 803 444 6006",
    email: "blessing.nwa@gmail.com",
    address: "Ankpa Road, Makurdi, Benue State",
    state: "Imo",
    lga: "Owerri",
    parentName: "Mr. Emmanuel Nwachukwu",
    parentPhone: "+234 803 777 8899",
    parentEmail: "emma.nwachukwu@yahoo.com",
    parentOccupation: "Accountant",
    parentRelationship: "Father",
    previousSchool: "Queen of the Rosary College",
    classApplied: "SSS 1",
    applicationDate: "2026-08-17",
    status: "Pending",
    examStatus: "Examination Not Scheduled",
    reviewerNotes: "New application received online."
  }
];

// Initial audit logs
export const defaultAdmissionAuditLogs: AdmissionAuditLog[] = [
  {
    id: "LOG-001",
    officerName: "Mrs. Abigail M. Iorliam",
    officerRole: "Admission Officer",
    action: "OPEN_ADMISSION",
    timestamp: "2026-08-01T08:00:00.000Z",
    details: "Online admission portal activated for 2026/2027 academic session. Opening date configured.",
    meta: { session: "2026/2027" }
  },
  {
    id: "LOG-002",
    officerName: "Mrs. Abigail M. Iorliam",
    officerRole: "Admission Officer",
    action: "CREATE_EXAMINATION",
    timestamp: "2026-08-01T10:15:00.000Z",
    details: "Scheduled Batch A Entrance Examination for 20 September 2026 (09:00 AM - 11:00 AM). Status set to Scheduled.",
    targetId: "ENT-2026-001"
  },
  {
    id: "LOG-003",
    officerName: "Mrs. Abigail M. Iorliam",
    officerRole: "Admission Officer",
    action: "UPDATE_PORTAL_SCHEDULE",
    timestamp: "2026-08-05T14:30:00.000Z",
    details: "Configured scheduled portal closing date to 30 November 2026 with auto-close enabled."
  }
];

// Status Calculation Helper
export function computeAdmissionPortalStatus(
  control: AdmissionPortalControl,
  currentDateObj = new Date()
): {
  status: AdmissionPortalStatus;
  statusLabel: string;
  statusColor: string;
  badgeBg: string;
  isAcceptingApplications: boolean;
  reason: string;
} {
  if (!control.portalOpen) {
    return {
      status: "closed",
      statusLabel: "Admission Closed",
      statusColor: "text-rose-600",
      badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
      isAcceptingApplications: false,
      reason: "The Admission Officer has manually closed the admission portal."
    };
  }

  const nowTime = currentDateObj.getTime();
  const openTime = control.openingDateTime ? new Date(control.openingDateTime).getTime() : 0;
  const closeTime = control.closingDateTime ? new Date(control.closingDateTime).getTime() : Infinity;

  if (nowTime < openTime) {
    return {
      status: "not_yet_open",
      statusLabel: "Admission Not Yet Open",
      statusColor: "text-amber-600",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
      isAcceptingApplications: false,
      reason: `Admissions will officially open on ${new Date(control.openingDateTime).toLocaleString()}.`
    };
  }

  if (control.autoCloseEnabled && nowTime >= closeTime) {
    return {
      status: "closed",
      statusLabel: "Admission Closed",
      statusColor: "text-rose-600",
      badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
      isAcceptingApplications: false,
      reason: `The admission application deadline reached on ${new Date(control.closingDateTime).toLocaleString()}. Portal automatically closed.`
    };
  }

  return {
    status: "open",
    statusLabel: "Admission Open",
    statusColor: "text-emerald-600",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    isAcceptingApplications: true,
    reason: `Portal is active and accepting new applications until ${new Date(control.closingDateTime).toLocaleDateString()}.`
  };
}

// Applicant Exam Validation Helper
export function validateApplicantExamAccess(
  applicant: ApplicantProfile,
  exam: EntranceExamSchedule | undefined,
  currentDateObj = new Date()
): {
  allowed: boolean;
  canStart: boolean;
  code:
    | "NOT_FOUND"
    | "DISQUALIFIED"
    | "ALREADY_COMPLETED"
    | "NOT_SCHEDULED"
    | "NOT_YET_DUE"
    | "NOT_YET_AVAILABLE"
    | "ACTIVATED_WAITING_START"
    | "PAUSED"
    | "ENDED"
    | "IN_PROGRESS";
  title: string;
  message: string;
} {
  if (applicant.examStatus === "Examination Disqualified") {
    return {
      allowed: false,
      canStart: false,
      code: "DISQUALIFIED",
      title: "EXAMINATION DISQUALIFIED",
      message: "Your application is not permitted to sit for this examination. Please contact the Admission Office."
    };
  }

  if (applicant.examStatus === "Examination Completed") {
    return {
      allowed: false,
      canStart: false,
      code: "ALREADY_COMPLETED",
      title: "EXAMINATION COMPLETED",
      message: `You have already completed and submitted your entrance examination. Score: ${applicant.examScore ?? "Recorded"}. Your result is being processed.`
    };
  }

  if (!exam || applicant.examStatus === "Examination Not Scheduled") {
    return {
      allowed: false,
      canStart: false,
      code: "NOT_SCHEDULED",
      title: "EXAMINATION NOT SCHEDULED",
      message: "No entrance examination has been scheduled for your application yet. Please contact the Admission Office."
    };
  }

  if (exam.status === "Ended" || applicant.examStatus === "Examination Ended") {
    return {
      allowed: false,
      canStart: false,
      code: "ENDED",
      title: "EXAMINATION CONCLUDED",
      message: "The examination session has ended. Submissions are now closed."
    };
  }

  // Date check: Check if examination date is in the future
  const todayStr = currentDateObj.toISOString().split("T")[0];
  if (exam.examDate && exam.examDate > todayStr) {
    const formattedDate = new Date(exam.examDate).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    return {
      allowed: false,
      canStart: false,
      code: "NOT_YET_DUE",
      title: "EXAMINATION NOT YET DUE",
      message: `Your entrance examination is scheduled for ${formattedDate} at ${exam.startTime || "09:00 AM"}. You cannot access the examination before the scheduled time.`
    };
  }

  // Check manual activation by Admission Officer
  if (exam.status === "Scheduled") {
    return {
      allowed: false,
      canStart: false,
      code: "NOT_YET_AVAILABLE",
      title: "EXAMINATION NOT YET AVAILABLE",
      message: "Your entrance examination has not started yet. Please wait until the Admission Officer activates the examination. Check your scheduled examination date and time."
    };
  }

  if (exam.status === "Activated") {
    return {
      allowed: true,
      canStart: false,
      code: "ACTIVATED_WAITING_START",
      title: "EXAMINATION ACTIVATED - STAND BY",
      message: "The examination has been activated by the Admission Officer. Candidates are seated. Please wait for the Admission Officer to click START EXAM."
    };
  }

  if (exam.status === "Paused") {
    return {
      allowed: false,
      canStart: false,
      code: "PAUSED",
      title: "EXAMINATION TEMPORARILY PAUSED",
      message: "The Admission Officer has temporarily paused the examination session. Please remain on this screen."
    };
  }

  if (exam.status === "In Progress") {
    return {
      allowed: true,
      canStart: true,
      code: "IN_PROGRESS",
      title: "EXAMINATION IN PROGRESS",
      message: "The examination is live! Click the START EXAM button below to commence your questions."
    };
  }

  return {
    allowed: false,
    canStart: false,
    code: "NOT_YET_AVAILABLE",
    title: "EXAMINATION NOT YET AVAILABLE",
    message: "Your entrance examination has not started yet. Please wait until the Admission Officer activates the examination."
  };
}

// React Hooks
export function useAdmissionPortal() {
  const [control, setControl] = useState<AdmissionPortalControl>(() => {
    const saved = localStorage.getItem("ess_admission_portal_control");
    if (saved) {
      try {
        return { ...defaultAdmissionPortalControl, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse admission portal control", e);
      }
    }
    return defaultAdmissionPortalControl;
  });

  useEffect(() => {
    localStorage.setItem("ess_admission_portal_control", JSON.stringify(control));
  }, [control]);

  const updateControl = (partial: Partial<AdmissionPortalControl>) => {
    setControl(prev => ({ ...prev, ...partial }));
  };

  const computedStatus = computeAdmissionPortalStatus(control);

  return { control, updateControl, computedStatus };
}

export function useAdmissionApplicants() {
  const [applicants, setApplicants] = useState<ApplicantProfile[]>(() => {
    const saved = localStorage.getItem("ess_admission_applicants");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse admission applicants", e);
      }
    }
    return defaultApplicants;
  });

  useEffect(() => {
    localStorage.setItem("ess_admission_applicants", JSON.stringify(applicants));
  }, [applicants]);

  const addApplicant = (app: Omit<ApplicantProfile, "id" | "applicationNumber">) => {
    const count = applicants.length + 1;
    const padded = String(count).padStart(3, "0");
    const year = new Date().getFullYear();
    const id = `APP-${year}-${padded}`;
    const applicationNumber = `ESS/ADM/${year}/${padded}`;
    const newProfile: ApplicantProfile = {
      ...app,
      id,
      applicationNumber,
      status: app.status || "Pending",
      examStatus: app.examStatus || "Examination Not Scheduled"
    };
    setApplicants(prev => [newProfile, ...prev]);
    return newProfile;
  };

  const updateApplicant = (id: string, updates: Partial<ApplicantProfile>) => {
    setApplicants(prev => prev.map(a => (a.id === id || a.applicationNumber === id ? { ...a, ...updates } : a)));
  };

  return { applicants, setApplicants, addApplicant, updateApplicant };
}

export function useEntranceExamsList() {
  const [exams, setExams] = useState<EntranceExamSchedule[]>(() => {
    const saved = localStorage.getItem("ess_entrance_exam_schedules");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse entrance exam schedules", e);
      }
    }
    return defaultEntranceExams;
  });

  useEffect(() => {
    localStorage.setItem("ess_entrance_exam_schedules", JSON.stringify(exams));
  }, [exams]);

  const addExam = (exam: Omit<EntranceExamSchedule, "id" | "createdAt" | "updatedAt">) => {
    const id = `ENT-${new Date().getFullYear()}-${String(exams.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const newExam: EntranceExamSchedule = {
      ...exam,
      id,
      createdAt: now,
      updatedAt: now
    };
    setExams(prev => [newExam, ...prev]);
    return newExam;
  };

  const updateExam = (id: string, updates: Partial<EntranceExamSchedule>) => {
    setExams(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  };

  return { exams, setExams, addExam, updateExam };
}

export function useAdmissionAuditLogs() {
  const [logs, setLogs] = useState<AdmissionAuditLog[]>(() => {
    const saved = localStorage.getItem("ess_admission_audit_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse admission audit logs", e);
      }
    }
    return defaultAdmissionAuditLogs;
  });

  useEffect(() => {
    localStorage.setItem("ess_admission_audit_logs", JSON.stringify(logs));
  }, [logs]);

  const addLog = (
    action: string,
    details: string,
    officerName = "Mrs. Abigail M. Iorliam",
    targetId?: string,
    meta?: Record<string, any>
  ) => {
    const newLog: AdmissionAuditLog = {
      id: `LOG-${Date.now().toString(36).toUpperCase()}`,
      officerName,
      officerRole: "Admission Officer",
      action,
      timestamp: new Date().toISOString(),
      details,
      targetId,
      meta
    };
    setLogs(prev => [newLog, ...prev]);
  };

  return { logs, addLog };
}

export function addAdmissionAuditLog(
  action: string,
  details: string,
  officerName = "Mrs. Abigail M. Iorliam",
  targetId?: string
) {
  try {
    const saved = localStorage.getItem("ess_admission_audit_logs");
    const logs: AdmissionAuditLog[] = saved ? JSON.parse(saved) : defaultAdmissionAuditLogs;
    const newLog: AdmissionAuditLog = {
      id: `LOG-${Date.now().toString(36).toUpperCase()}`,
      officerName,
      officerRole: "Admission Officer",
      action,
      timestamp: new Date().toISOString(),
      details,
      targetId
    };
    localStorage.setItem("ess_admission_audit_logs", JSON.stringify([newLog, ...logs]));
  } catch (e) {
    console.error("Failed to append audit log", e);
  }
}

// -----------------------------------------------------------------------------
// PERMANENT QUESTION BANK REPOSITORY (Requirement 7)
// -----------------------------------------------------------------------------
export interface QuestionBankItem extends ExamQuestion {
  bankId: string;
  source?: "AI Generated" | "Manual" | "Imported";
  timesUsed?: number;
  addedBy?: string;
  category?: string;
}

export const defaultQuestionBank: QuestionBankItem[] = [
  {
    bankId: "QB-MTH-01",
    id: "QB-MTH-01",
    subject: "Mathematics",
    targetClass: "JSS 1",
    topic: "Fractions & Percentages",
    difficulty: "Medium",
    type: "MCQ",
    question: "Express 3/8 as a percentage.",
    options: ["37.5%", "35%", "38%", "32.5%"],
    correctAnswer: "37.5%",
    explanation: "(3/8) × 100% = 300 / 8 = 37.5%.",
    marks: 2,
    source: "AI Generated",
    timesUsed: 3,
    addedBy: "Mrs. Abigail M. Iorliam"
  },
  {
    bankId: "QB-MTH-02",
    id: "QB-MTH-02",
    subject: "Mathematics",
    targetClass: "JSS 1",
    topic: "Algebra",
    difficulty: "Easy",
    type: "MCQ",
    question: "If 3y + 9 = 24, find the value of y.",
    options: ["5", "6", "7", "8"],
    correctAnswer: "5",
    explanation: "3y = 24 - 9 = 15. y = 15 / 3 = 5.",
    marks: 2,
    source: "Manual",
    timesUsed: 5,
    addedBy: "Mrs. Abigail M. Iorliam"
  },
  {
    bankId: "QB-ENG-01",
    id: "QB-ENG-01",
    subject: "English Language",
    targetClass: "JSS 1",
    topic: "Grammar & Concord",
    difficulty: "Medium",
    type: "MCQ",
    question: "The jury _______ reached a unanimous verdict.",
    options: ["has", "have", "are", "were"],
    correctAnswer: "has",
    explanation: "When a collective noun acts as a single unified body, it takes a singular verb ('has').",
    marks: 2,
    source: "AI Generated",
    timesUsed: 4,
    addedBy: "Mrs. Abigail M. Iorliam"
  },
  {
    bankId: "QB-ENG-02",
    id: "QB-ENG-02",
    subject: "English Language",
    targetClass: "JSS 1",
    topic: "Vocabulary (Antonyms)",
    difficulty: "Hard",
    type: "MCQ",
    question: "Choose the word opposite in meaning to METICULOUS.",
    options: ["Careless", "Careful", "Painstaking", "Thorough"],
    correctAnswer: "Careless",
    explanation: "'Meticulous' means showing great attention to detail; its exact opposite is 'careless'.",
    marks: 2,
    source: "AI Generated",
    timesUsed: 2,
    addedBy: "Mrs. Abigail M. Iorliam"
  },
  {
    bankId: "QB-SCI-01",
    id: "QB-SCI-01",
    subject: "Basic Science",
    targetClass: "JSS 1",
    topic: "Living Things & Environment",
    difficulty: "Easy",
    type: "MCQ",
    question: "Which of the following is NOT a characteristic of living organisms?",
    options: ["Respiration", "Combustion", "Reproduction", "Excretion"],
    correctAnswer: "Combustion",
    explanation: "Combustion is a chemical burning process, whereas respiration, reproduction, and excretion are core characteristics of life (MR NIGER D).",
    marks: 2,
    source: "Manual",
    timesUsed: 2,
    addedBy: "Mrs. Abigail M. Iorliam"
  },
  {
    bankId: "QB-GEN-01",
    id: "QB-GEN-01",
    subject: "General Aptitude",
    targetClass: "JSS 1",
    topic: "Quantitative Aptitude",
    difficulty: "Medium",
    type: "MCQ",
    question: "What number completes the series: 3, 7, 15, 31, ___?",
    options: ["63", "62", "64", "59"],
    correctAnswer: "63",
    explanation: "Rule: multiply by 2 and add 1. 3×2+1=7; 7×2+1=15; 15×2+1=31; 31×2+1=63.",
    marks: 2,
    source: "AI Generated",
    timesUsed: 6,
    addedBy: "Mrs. Abigail M. Iorliam"
  },
  {
    bankId: "QB-SOC-01",
    id: "QB-SOC-01",
    subject: "Social Studies",
    targetClass: "JSS 1",
    topic: "National Heritage",
    difficulty: "Easy",
    type: "MCQ",
    question: "The green color on the Nigerian National Flag symbolizes _______.",
    options: ["Agriculture and natural wealth", "Peace and unity", "Bravery of heroes", "Water bodies"],
    correctAnswer: "Agriculture and natural wealth",
    explanation: "Green represents Nigeria's fertile soil, agriculture, and natural wealth, while white represents peace and unity.",
    marks: 2,
    source: "Manual",
    timesUsed: 3,
    addedBy: "Mrs. Abigail M. Iorliam"
  }
];

export function useAdmissionQuestionBank() {
  const [bankQuestions, setBankQuestions] = useState<QuestionBankItem[]>(() => {
    try {
      const saved = localStorage.getItem("ess_admission_question_bank");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultQuestionBank;
  });

  useEffect(() => {
    localStorage.setItem("ess_admission_question_bank", JSON.stringify(bankQuestions));
  }, [bankQuestions]);

  const addQuestionToBank = (item: Omit<QuestionBankItem, "bankId">): QuestionBankItem => {
    const newId = `QB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const newItem: QuestionBankItem = {
      ...item,
      bankId: newId,
      id: item.id || newId,
      timesUsed: item.timesUsed || 0,
      createdAt: new Date().toISOString()
    };
    setBankQuestions(prev => [newItem, ...prev]);
    return newItem;
  };

  const addQuestionsBulkToBank = (items: ExamQuestion[], source: "AI Generated" | "Manual" = "AI Generated", addedBy = "Mrs. Abigail M. Iorliam") => {
    const formatted: QuestionBankItem[] = items.map(q => ({
      ...q,
      bankId: `QB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
      source,
      addedBy,
      timesUsed: 1,
      createdAt: new Date().toISOString()
    }));
    setBankQuestions(prev => [...formatted, ...prev]);
    return formatted;
  };

  const updateBankQuestion = (bankId: string, updates: Partial<QuestionBankItem>) => {
    setBankQuestions(prev =>
      prev.map(q => (q.bankId === bankId ? { ...q, ...updates } : q))
    );
  };

  const deleteBankQuestion = (bankId: string) => {
    setBankQuestions(prev => prev.filter(q => q.bankId !== bankId));
  };

  return {
    bankQuestions,
    setBankQuestions,
    addQuestionToBank,
    addQuestionsBulkToBank,
    updateBankQuestion,
    deleteBankQuestion
  };
}

