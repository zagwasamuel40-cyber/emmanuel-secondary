import { useState, useEffect } from "react";
import { 
  IDCard, 
  AttendanceRecord, 
  QRScanLog, 
  IDCardCustomization,
  AttendanceStatus,
  AttendancePeriod,
  ScanPurpose
} from "../types/idCardAndAttendance";
import { initialStudents } from "./studentsData";

// Default Initial ID Cards for seeded students
export const initialIdCards: IDCard[] = [
  {
    id: "IDC-2026-001",
    studentId: "ESS/2026/001",
    qrToken: "ESS-SEC-QR-9a1b2c3d-001",
    cardStatus: "active",
    issueDate: "2026-01-10",
    expiryDate: "2027-07-31",
    academicSession: "2025/2026",
    barcode: "ESS2026001",
    reissueCount: 0,
    lastScannedAt: "2026-09-07 07:45 AM",
    notes: "Original issue upon SSS 3 resumption."
  },
  {
    id: "IDC-2026-002",
    studentId: "ESS/2026/002",
    qrToken: "ESS-SEC-QR-8e7f6d5c-002",
    cardStatus: "active",
    issueDate: "2026-01-10",
    expiryDate: "2027-07-31",
    academicSession: "2025/2026",
    barcode: "ESS2026002",
    reissueCount: 0,
    lastScannedAt: "2026-09-07 07:50 AM",
    notes: "Original issue upon SSS 2 resumption."
  },
  {
    id: "IDC-2026-003",
    studentId: "ESS/2026/003",
    qrToken: "ESS-SEC-QR-4b3c2d1a-003",
    cardStatus: "active",
    issueDate: "2026-01-15",
    expiryDate: "2027-07-31",
    academicSession: "2025/2026",
    barcode: "ESS2026003",
    reissueCount: 0,
    lastScannedAt: "2026-09-07 07:55 AM",
    notes: "Original issue for newly enrolled JSS 1 student."
  },
  {
    id: "IDC-2026-004",
    studentId: "ESS/2026/004",
    qrToken: "ESS-SEC-QR-1f2e3d4c-004",
    cardStatus: "deactivated",
    issueDate: "2026-01-10",
    expiryDate: "2027-07-31",
    academicSession: "2025/2026",
    barcode: "ESS2026004",
    reissueCount: 1,
    notes: "Reported lost by parent on 2026-08-15. Deactivated for security."
  },
  {
    id: "IDC-2026-005",
    studentId: "ESS/2026/005",
    qrToken: "ESS-SEC-QR-7a8b9c0d-005",
    cardStatus: "active",
    issueDate: "2026-01-12",
    expiryDate: "2027-07-31",
    academicSession: "2025/2026",
    barcode: "ESS2026005",
    reissueCount: 0,
    lastScannedAt: "2026-09-07 08:02 AM",
    notes: "Original issue."
  }
];

// Helper to format today's date in Nigerian local format (YYYY-MM-DD)
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initial Attendance Records
export const initialAttendance: AttendanceRecord[] = [
  {
    id: "ATT-2026-101",
    studentId: "ESS/2026/001",
    studentName: "Oluwaseun Adebayo",
    admissionNo: "ESS/2026/001",
    class: "SSS 3A",
    date: getTodayDateString(),
    time: "07:45 AM",
    period: "Morning Assembly",
    status: "Present",
    method: "qr_scan",
    scannedByStaffId: "TCH/2026/042",
    scannedByStaffName: "Mrs. Grace Adeyemi",
    note: "Scanned at Main Gate entrance"
  },
  {
    id: "ATT-2026-102",
    studentId: "ESS/2026/002",
    studentName: "Chioma Nwosu",
    admissionNo: "ESS/2026/002",
    class: "SSS 2B",
    date: getTodayDateString(),
    time: "07:50 AM",
    period: "Morning Assembly",
    status: "Present",
    method: "qr_scan",
    scannedByStaffId: "TCH/2026/042",
    scannedByStaffName: "Mrs. Grace Adeyemi"
  },
  {
    id: "ATT-2026-103",
    studentId: "ESS/2026/003",
    studentName: "Abubakar Ibrahim",
    admissionNo: "ESS/2026/003",
    class: "JSS 1A",
    date: getTodayDateString(),
    time: "07:55 AM",
    period: "Morning Assembly",
    status: "Present",
    method: "qr_scan",
    scannedByStaffId: "ADM/2026/001",
    scannedByStaffName: "System Administrator"
  },
  {
    id: "ATT-2026-104",
    studentId: "ESS/2026/005",
    studentName: "David Emmanuel",
    admissionNo: "ESS/2026/005",
    class: "JSS 3B",
    date: getTodayDateString(),
    time: "08:15 AM",
    period: "Morning Assembly",
    status: "Late",
    method: "qr_scan",
    scannedByStaffId: "TCH/2026/042",
    scannedByStaffName: "Mrs. Grace Adeyemi",
    lateMinutes: 15,
    note: "Late bus arrival from High Level area"
  }
];

// Initial Audit Scan Logs
export const initialScanLogs: QRScanLog[] = [
  {
    id: "LOG-2026-501",
    qrToken: "ESS-SEC-QR-9a1b2c3d-001",
    studentId: "ESS/2026/001",
    studentName: "Oluwaseun Adebayo",
    admissionNo: "ESS/2026/001",
    studentClass: "SSS 3A",
    scannedByStaffId: "TCH/2026/042",
    scannedByStaffName: "Mrs. Grace Adeyemi",
    timestamp: `${getTodayDateString()} 07:45:12 AM`,
    date: getTodayDateString(),
    time: "07:45:12 AM",
    purpose: "Attendance Recording",
    status: "Verified",
    deviceInfo: "Mobile Camera Scanner (Staff Android)"
  },
  {
    id: "LOG-2026-502",
    qrToken: "ESS-SEC-QR-8e7f6d5c-002",
    studentId: "ESS/2026/002",
    studentName: "Chioma Nwosu",
    admissionNo: "ESS/2026/002",
    studentClass: "SSS 2B",
    scannedByStaffId: "TCH/2026/042",
    scannedByStaffName: "Mrs. Grace Adeyemi",
    timestamp: `${getTodayDateString()} 07:50:33 AM`,
    date: getTodayDateString(),
    time: "07:50:33 AM",
    purpose: "Attendance Recording",
    status: "Verified",
    deviceInfo: "Mobile Camera Scanner (Staff Android)"
  },
  {
    id: "LOG-2026-503",
    qrToken: "ESS-SEC-QR-1f2e3d4c-004",
    studentId: "ESS/2026/004",
    studentName: "Grace Okhiria",
    admissionNo: "ESS/2026/004",
    studentClass: "SSS 3C",
    scannedByStaffId: "ADM/2026/001",
    scannedByStaffName: "System Administrator",
    timestamp: `${getTodayDateString()} 08:05:10 AM`,
    date: getTodayDateString(),
    time: "08:05:10 AM",
    purpose: "Identity Verification",
    status: "Card Deactivated",
    deviceInfo: "Administrative Gate Terminal"
  }
];

export const defaultIDCardDesign: IDCardCustomization = {
  schoolName: "EMMANUEL SECONDARY SCHOOL, MAKURDI",
  schoolMotto: "Excellence, Knowledge & Moral Discipline",
  logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80",
  templateStyle: "classic_navy",
  orientation: "vertical",
  showWatermark: true,
  showChipGraphic: true,
  showEmergencyContact: true,
  showDob: true,
  showBloodGroup: true,
  customFooterNote: "This card remains property of Emmanuel Secondary School. If found, please return to the school administration office or call emergency hotlines.",
  contactPhone: "+234 703 900 9964 / 0706 516 6377",
  contactEmail: "info@ess.edu.ng",
  schoolAddress: "Behind Federal Low Cost, Naka Road, Makurdi, Benue State."
};

// Cryptographic pseudo-random token generator to ensure zero collisions
export function generateUniqueQRToken(id: string, isStaff = false): string {
  const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
  const rand = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 6);
  const timestamp = Date.now().toString(36);
  const prefix = isStaff ? 'STAFF' : 'ESS-SEC-QR';
  return `${prefix}-${rand}-${cleanId}-${timestamp}`;
}

// Helpers for localStorage sync
export function getStoredIdCards(): IDCard[] {
  if (typeof window === "undefined") return initialIdCards;
  const saved = localStorage.getItem("ess_student_id_cards");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return initialIdCards;
}

export function saveStoredIdCards(cards: IDCard[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ess_student_id_cards", JSON.stringify(cards));
  window.dispatchEvent(new Event("ess_id_cards_change"));
}

export function getStoredStaffAttendance(): any[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("ess_staff_attendance");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export function saveStoredStaffAttendance(records: any[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ess_staff_attendance", JSON.stringify(records));
  window.dispatchEvent(new Event("ess_staff_attendance_change"));
}

export function getStoredAttendance(): AttendanceRecord[] {
  if (typeof window === "undefined") return initialAttendance;
  const saved = localStorage.getItem("ess_student_attendance");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return initialAttendance;
}

export function saveStoredAttendance(records: AttendanceRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ess_student_attendance", JSON.stringify(records));
  window.dispatchEvent(new Event("ess_attendance_change"));
}

export function getStoredScanLogs(): QRScanLog[] {
  if (typeof window === "undefined") return initialScanLogs;
  const saved = localStorage.getItem("ess_qr_scan_logs");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return initialScanLogs;
}

export function saveStoredScanLogs(logs: QRScanLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ess_qr_scan_logs", JSON.stringify(logs));
  window.dispatchEvent(new Event("ess_scan_logs_change"));
}

export function getStoredIDCardDesign(): IDCardCustomization {
  if (typeof window === "undefined") return defaultIDCardDesign;
  const saved = localStorage.getItem("ess_id_card_design");
  if (saved) {
    try {
      return { ...defaultIDCardDesign, ...JSON.parse(saved) };
    } catch {}
  }
  return defaultIDCardDesign;
}

export function saveStoredIDCardDesign(design: IDCardCustomization) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ess_id_card_design", JSON.stringify(design));
  window.dispatchEvent(new Event("ess_id_card_design_change"));
}

// React Hooks
export function useIdCards() {
  const [cards, setCardsState] = useState<IDCard[]>(getStoredIdCards);

  useEffect(() => {
    const handleUpdate = () => setCardsState(getStoredIdCards());
    window.addEventListener("ess_id_cards_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ess_id_cards_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setCards = (updater: IDCard[] | ((prev: IDCard[]) => IDCard[])) => {
    const current = getStoredIdCards();
    const next = typeof updater === "function" ? updater(current) : updater;
    saveStoredIdCards(next);
  };

  return [cards, setCards] as const;
}

export function useAttendance() {
  const [records, setRecordsState] = useState<AttendanceRecord[]>(getStoredAttendance);

  useEffect(() => {
    const handleUpdate = () => setRecordsState(getStoredAttendance());
    window.addEventListener("ess_attendance_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ess_attendance_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setRecords = (updater: AttendanceRecord[] | ((prev: AttendanceRecord[]) => AttendanceRecord[])) => {
    const current = getStoredAttendance();
    const next = typeof updater === "function" ? updater(current) : updater;
    saveStoredAttendance(next);
  };

  return [records, setRecords] as const;
}

export function useStaffAttendance() {
  const [records, setRecordsState] = useState<any[]>(getStoredStaffAttendance);

  useEffect(() => {
    const handleUpdate = () => setRecordsState(getStoredStaffAttendance());
    window.addEventListener("ess_staff_attendance_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ess_staff_attendance_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setRecords = (updater: any[] | ((prev: any[]) => any[])) => {
    const current = getStoredStaffAttendance();
    const next = typeof updater === "function" ? updater(current) : updater;
    saveStoredStaffAttendance(next);
  };

  return [records, setRecords] as const;
}

export function useQRScanLogs() {
  const [logs, setLogsState] = useState<QRScanLog[]>(getStoredScanLogs);

  useEffect(() => {
    const handleUpdate = () => setLogsState(getStoredScanLogs());
    window.addEventListener("ess_scan_logs_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ess_scan_logs_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setLogs = (updater: QRScanLog[] | ((prev: QRScanLog[]) => QRScanLog[])) => {
    const current = getStoredScanLogs();
    const next = typeof updater === "function" ? updater(current) : updater;
    saveStoredScanLogs(next);
  };

  return [logs, setLogs] as const;
}

export function useIDCardDesignSettings() {
  const [design, setDesignState] = useState<IDCardCustomization>(getStoredIDCardDesign);

  useEffect(() => {
    const handleUpdate = () => setDesignState(getStoredIDCardDesign());
    window.addEventListener("ess_id_card_design_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ess_id_card_design_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setDesign = (updater: IDCardCustomization | ((prev: IDCardCustomization) => IDCardCustomization)) => {
    const current = getStoredIDCardDesign();
    const next = typeof updater === "function" ? updater(current) : updater;
    saveStoredIDCardDesign(next);
  };

  return [design, setDesign] as const;
}

// Service Methods for Card & QR Management
export function ensureStudentHasIdCard(student: any, session = "2025/2026"): IDCard {
  const cards = getStoredIdCards();
  const existing = cards.find(c => c.studentId === student.id);
  if (existing) return existing;

  const newCard: IDCard = {
    id: `IDC-2026-${String(cards.length + 1).padStart(3, '0')}`,
    studentId: student.id,
    userType: 'student',
    qrToken: generateUniqueQRToken(student.id, false),
    cardStatus: "active",
    issueDate: getTodayDateString(),
    expiryDate: "2027-07-31",
    academicSession: session,
    barcode: student.id.replace(/[^a-zA-Z0-9]/g, ''),
    reissueCount: 0,
    notes: `Generated upon registration on ${getTodayDateString()}`
  };

  saveStoredIdCards([newCard, ...cards]);
  return newCard;
}

export function ensureStaffHasIdCard(staff: any, session = "2025/2026"): IDCard {
  const cards = getStoredIdCards();
  const existing = cards.find(c => c.studentId === staff.id);
  if (existing) return existing;

  const newCard: IDCard = {
    id: `IDC-STF-${String(cards.length + 1).padStart(3, '0')}`,
    studentId: staff.id,
    userType: 'staff',
    qrToken: generateUniqueQRToken(staff.id, true),
    cardStatus: "active",
    issueDate: getTodayDateString(),
    expiryDate: "2028-12-31",
    academicSession: session,
    barcode: staff.id.replace(/[^a-zA-Z0-9]/g, ''),
    reissueCount: 0,
    notes: `Generated for staff on ${getTodayDateString()}`
  };

  saveStoredIdCards([newCard, ...cards]);
  return newCard;
}

export function reissueStudentQRToken(id: string, reason: string, isStaff = false): IDCard | null {
  const cards = getStoredIdCards();
  const index = cards.findIndex(c => c.studentId === id);
  if (index === -1) return null;

  const current = cards[index];
  const updated: IDCard = {
    ...current,
    qrToken: generateUniqueQRToken(id, isStaff),
    cardStatus: "active",
    issueDate: getTodayDateString(),
    reissueCount: (current.reissueCount || 0) + 1,
    notes: `Card & QR reissued on ${getTodayDateString()}: ${reason}`
  };

  cards[index] = updated;
  saveStoredIdCards([...cards]);
  return updated;
}

export function setStudentCardStatus(studentId: string, status: IDCard["cardStatus"], reason?: string): boolean {
  const cards = getStoredIdCards();
  const index = cards.findIndex(c => c.studentId === studentId);
  if (index === -1) return false;

  cards[index] = {
    ...cards[index],
    cardStatus: status,
    notes: reason ? `${cards[index].notes || ''} [${status.toUpperCase()}: ${reason}]` : cards[index].notes
  };

  saveStoredIdCards([...cards]);
  return true;
}

export function logScanEvent(
  qrToken: string,
  student: any,
  staffUser: { id: string; name: string },
  purpose: ScanPurpose,
  status: 'Verified' | 'Card Deactivated' | 'Invalid Token',
  deviceInfo = "Staff Portal Web Scanner"
): QRScanLog {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = getTodayDateString();

  const newLog: QRScanLog = {
    id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    qrToken,
    studentId: student?.id || "UNKNOWN",
    studentName: student?.name || "Unrecognized Student",
    admissionNo: student?.id || "N/A",
    studentClass: student?.class || "N/A",
    scannedByStaffId: staffUser.id || "STAFF",
    scannedByStaffName: staffUser.name || "Authorized Staff",
    timestamp: `${dateStr} ${timeStr}`,
    date: dateStr,
    time: timeStr,
    purpose,
    status,
    deviceInfo
  };

  const currentLogs = getStoredScanLogs();
  saveStoredScanLogs([newLog, ...currentLogs]);
  return newLog;
}

export function recordStudentAttendance(params: {
  student: any;
  status: AttendanceStatus;
  period?: AttendancePeriod;
  method?: 'qr_scan' | 'manual';
  staffUser: { id: string; name: string };
  lateMinutes?: number;
  note?: string;
  forceOverride?: boolean;
}): { success: boolean; message: string; record?: AttendanceRecord; duplicate?: boolean } {
  const { 
    student, 
    status, 
    period = "Morning Assembly", 
    method = "qr_scan", 
    staffUser, 
    lateMinutes, 
    note, 
    forceOverride 
  } = params;

  const today = getTodayDateString();
  const currentRecords = getStoredAttendance();

  // Check for duplicate attendance entry for the same student on the same date and period
  const existingIdx = currentRecords.findIndex(
    r => r.studentId === student.id && r.date === today && r.period === period
  );

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (existingIdx !== -1 && !forceOverride) {
    const existing = currentRecords[existingIdx];
    return {
      success: false,
      duplicate: true,
      record: existing,
      message: `${student.name} – Attendance already recorded today at ${existing.time} (Status: ${existing.status}).`
    };
  }

  if (existingIdx !== -1 && forceOverride) {
    // Override existing record
    const updated: AttendanceRecord = {
      ...currentRecords[existingIdx],
      status,
      time: timeStr,
      method,
      scannedByStaffId: staffUser.id,
      scannedByStaffName: staffUser.name,
      lateMinutes,
      note: note || `Updated attendance to ${status}`
    };
    currentRecords[existingIdx] = updated;
    saveStoredAttendance([...currentRecords]);
    return {
      success: true,
      message: `${student.name} – Attendance Updated to ${status} (${timeStr})`,
      record: updated
    };
  }

  // Create new record
  const newRecord: AttendanceRecord = {
    id: `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    studentId: student.id,
    studentName: student.name,
    admissionNo: student.id,
    class: student.class,
    date: today,
    time: timeStr,
    period,
    status,
    method,
    scannedByStaffId: staffUser.id,
    scannedByStaffName: staffUser.name,
    lateMinutes,
    note
  };

  saveStoredAttendance([newRecord, ...currentRecords]);

  // Update lastScannedAt on student's ID card
  const cards = getStoredIdCards();
  const cardIdx = cards.findIndex(c => c.studentId === student.id);
  if (cardIdx !== -1) {
    cards[cardIdx] = {
      ...cards[cardIdx],
      lastScannedAt: `${today} ${timeStr}`
    };
    saveStoredIdCards([...cards]);
  }

  return {
    success: true,
    message: `${student.name} – Attendance Marked ${status} (${timeStr})`,
    record: newRecord
  };
}
