import { useState, useEffect } from "react";
import { safeStorage } from "../utils/safeStorage";
import { 
  IDCard, 
  AttendanceRecord, 
  StaffAttendanceRecord,
  AttendanceMethod,
  QRScanLog, 
  IDCardCustomization,
  AttendanceStatus,
  AttendancePeriod,
  ScanPurpose,
  AttendanceSettings,
  AttendanceOfficerPermissions
} from "../types/idCardAndAttendance";
import { initialStudents } from "./studentsData";
import { getStoredTeachers } from "./teachersData";

// Default Initial ID Cards for seeded students and staff
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
  },
  {
    id: "IDC-STF-001",
    studentId: "PRN/2026/001",
    userType: 'staff',
    qrToken: "STAFF-prn001-PRN2026001-essdir",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "PRN2026001",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:25 AM",
    notes: "Official Staff Card for Principal & Director Dr. Emmanuel A. Vershima"
  },
  {
    id: "IDC-STF-002",
    studentId: "VPA/2026/002",
    userType: 'staff',
    qrToken: "STAFF-vpa002-VPA2026002-vpacd",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "VPA2026002",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:28 AM",
    notes: "Official Staff Card for Vice Principal (Academics) Mrs. Victoria N. Alabi"
  },
  {
    id: "IDC-STF-003",
    studentId: "VPA/2026/003",
    userType: 'staff',
    qrToken: "STAFF-vpa003-VPA2026003-vpadm",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "VPA2026003",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:30 AM",
    notes: "Official Staff Card for Vice Principal (Admin) Mr. Kenneth O. Agbo"
  },
  {
    id: "IDC-STF-004",
    studentId: "ADM/2026/001",
    userType: 'staff',
    qrToken: "STAFF-9x8w7v-ADM2026001-adm001",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "ADM2026001",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:32 AM",
    notes: "Official Staff Card for Head of ICT Mr. Clement U. Oche"
  },
  {
    id: "IDC-STF-005",
    studentId: "TCH/2026/001",
    userType: 'staff',
    qrToken: "STAFF-2m1l0k-TCH2026001-tch001",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "TCH2026001",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:44 AM",
    notes: "Official Staff Card for HOD Sciences Dr. Samuel Okoh"
  },
  {
    id: "IDC-STF-006",
    studentId: "TCH/2026/042",
    userType: 'staff',
    qrToken: "STAFF-5p4o3n-TCH2026042-tch042",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "TCH2026042",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:38 AM",
    notes: "Official Staff Card for HOD Languages Mrs. Grace Adeyemi"
  },
  {
    id: "IDC-STF-007",
    studentId: "TCH/2026/015",
    userType: 'staff',
    qrToken: "STAFF-bl15mt-TCH2026015-tch015",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "TCH2026015",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:40 AM",
    notes: "Official Staff Card for HOD Mathematics Mr. Babatunde Lawal"
  },
  {
    id: "IDC-STF-008",
    studentId: "TCH/2026/023",
    userType: 'staff',
    qrToken: "STAFF-ne23cm-TCH2026023-tch023",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "TCH2026023",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:42 AM",
    notes: "Official Staff Card for HOD Commercial Mrs. Ngozi Eze"
  },
  {
    id: "IDC-STF-009",
    studentId: "TCH/2026/031",
    userType: 'staff',
    qrToken: "STAFF-ti31vc-TCH2026031-tch031",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "TCH2026031",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:45 AM",
    notes: "Official Staff Card for HOD Vocational Mr. Terzungwe D. Iorfa"
  },
  {
    id: "IDC-STF-010",
    studentId: "TCH/2026/054",
    userType: 'staff',
    qrToken: "STAFF-ea54sc-TCH2026054-tch054",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "TCH2026054",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:47 AM",
    notes: "Official Staff Card for Mrs. Esther M. Ayua"
  },
  {
    id: "IDC-STF-011",
    studentId: "TCH/2026/063",
    userType: 'staff',
    qrToken: "STAFF-co63sc-TCH2026063-tch063",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "TCH2026063",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:49 AM",
    notes: "Official Staff Card for Mr. Chukwuemeka Obi"
  },
  {
    id: "IDC-STF-012",
    studentId: "TCH/2026/072",
    userType: 'staff',
    qrToken: "STAFF-dt72hm-TCH2026072-tch072",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "TCH2026072",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:50 AM",
    notes: "Official Staff Card for Mrs. Deborah S. Tor"
  },
  {
    id: "IDC-STF-013",
    studentId: "BUR/2026/005",
    userType: 'staff',
    qrToken: "STAFF-bd05fn-BUR2026005-bur005",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "BUR2026005",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:35 AM",
    notes: "Official Staff Card for Chief Bursar Mrs. Blessing K. Danladi"
  },
  {
    id: "IDC-STF-014",
    studentId: "STF/2026/088",
    userType: 'staff',
    qrToken: "STAFF-7j6h5g-STF2026088-stf088",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "STF2026088",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:15 AM",
    notes: "Official Staff Card for Chief Attendance Officer Mr. Emmanuel Terhemba"
  },
  {
    id: "IDC-STF-015",
    studentId: "STF/2026/019",
    userType: 'staff',
    qrToken: "STAFF-fb19cn-STF2026019-stf019",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "STF2026019",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:52 AM",
    notes: "Official Staff Card for Counselor Mrs. Fatima Bello"
  },
  {
    id: "IDC-STF-016",
    studentId: "LIB/2026/007",
    userType: 'staff',
    qrToken: "STAFF-jt07lb-LIB2026007-lib007",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "LIB2026007",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:55 AM",
    notes: "Official Staff Card for Chief Librarian Mr. John A. Tyovenda"
  },
  {
    id: "IDC-STF-017",
    studentId: "MED/2026/012",
    userType: 'staff',
    qrToken: "STAFF-ra12md-MED2026012-med012",
    cardStatus: "active",
    issueDate: "2026-01-05",
    expiryDate: "2028-12-31",
    academicSession: "2025/2026",
    barcode: "MED2026012",
    reissueCount: 0,
    lastScannedAt: "2026-09-08 07:58 AM",
    notes: "Official Staff Card for Nurse Rosemary K. Akor"
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

// Initial Staff Attendance Records
export const initialStaffAttendance: StaffAttendanceRecord[] = [
  {
    id: "ATT-STF-101",
    staffId: "ADM/2026/001",
    staffName: "System Administrator",
    department: "Administration",
    role: "General Admin",
    date: getTodayDateString(),
    checkInTime: "07:30 AM",
    checkOutTime: undefined,
    status: "Present",
    method: "qr_scan",
    scannedByStaffId: "STF/2026/088",
    scannedByStaffName: "Mr. Emmanuel Terhemba"
  },
  {
    id: "ATT-STF-102",
    staffId: "TCH/2026/042",
    staffName: "Mrs. Grace Adeyemi",
    department: "Languages",
    role: "English Teacher",
    date: getTodayDateString(),
    checkInTime: "07:38 AM",
    checkOutTime: undefined,
    status: "Present",
    method: "qr_scan",
    scannedByStaffId: "STF/2026/088",
    scannedByStaffName: "Mr. Emmanuel Terhemba"
  },
  {
    id: "ATT-STF-103",
    staffId: "TCH/2026/001",
    staffName: "Dr. Samuel Okoh",
    department: "Sciences",
    role: "Senior Master & HOD Science",
    date: getTodayDateString(),
    checkInTime: "07:44 AM",
    checkOutTime: undefined,
    status: "Present",
    method: "qr_scan",
    scannedByStaffId: "STF/2026/088",
    scannedByStaffName: "Mr. Emmanuel Terhemba"
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
  let cards: IDCard[] = initialIdCards;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cards = parsed;
      }
    } catch {}
  }

  // Guarantee that EVERY staff member of Emmanuel Secondary School has an active ID card
  let updated = false;
  try {
    const teachers = getStoredTeachers();
    teachers.forEach(staff => {
      const existing = cards.find(c => c.studentId === staff.id);
      if (!existing) {
        const cleanId = staff.id.replace(/[^a-zA-Z0-9]/g, '');
        cards.push({
          id: `IDC-STF-${cleanId}`,
          studentId: staff.id,
          userType: 'staff',
          qrToken: generateUniqueQRToken(staff.id, true),
          cardStatus: "active",
          issueDate: getTodayDateString(),
          expiryDate: "2028-12-31",
          academicSession: "2025/2026",
          barcode: cleanId,
          reissueCount: 0,
          notes: `Official Staff Card for ${staff.name} (${staff.role})`
        });
        updated = true;
      }
    });

    if (updated && typeof window !== "undefined") {
      safeStorage.setItem("ess_student_id_cards", JSON.stringify(cards));
    }
  } catch (err) {
    console.error("Error ensuring staff id cards:", err);
  }

  return cards;
}

export function generateStaffIdCardsForAll(): { createdCount: number; totalStaff: number } {
  const cards = getStoredIdCards();
  const teachers = getStoredTeachers();
  let createdCount = 0;

  teachers.forEach(staff => {
    const existing = cards.find(c => c.studentId === staff.id);
    if (!existing) {
      const cleanId = staff.id.replace(/[^a-zA-Z0-9]/g, '');
      cards.push({
        id: `IDC-STF-${cleanId}`,
        studentId: staff.id,
        userType: 'staff',
        qrToken: generateUniqueQRToken(staff.id, true),
        cardStatus: "active",
        issueDate: getTodayDateString(),
        expiryDate: "2028-12-31",
        academicSession: "2025/2026",
        barcode: cleanId,
        reissueCount: 0,
        notes: `Official Staff Card for ${staff.name} (${staff.role})`
      });
      createdCount++;
    }
  });

  saveStoredIdCards([...cards]);
  return { createdCount, totalStaff: teachers.length };
}

export function saveStoredIdCards(cards: IDCard[]) {
  if (typeof window === "undefined") return;
  safeStorage.setItem("ess_student_id_cards", JSON.stringify(cards));
  window.dispatchEvent(new Event("ess_id_cards_change"));
}

export function getStoredStaffAttendance(): StaffAttendanceRecord[] {
  if (typeof window === "undefined") return initialStaffAttendance;
  const saved = safeStorage.getItem("ess_staff_attendance");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return initialStaffAttendance;
}

export function saveStoredStaffAttendance(records: StaffAttendanceRecord[]) {
  if (typeof window === "undefined") return;
  safeStorage.setItem("ess_staff_attendance", JSON.stringify(records));
  window.dispatchEvent(new Event("ess_staff_attendance_change"));
}

export function getStoredAttendance(): AttendanceRecord[] {
  if (typeof window === "undefined") return initialAttendance;
  const saved = safeStorage.getItem("ess_student_attendance");
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
  safeStorage.setItem("ess_student_attendance", JSON.stringify(records));
  window.dispatchEvent(new Event("ess_attendance_change"));
}

export function getStoredScanLogs(): QRScanLog[] {
  if (typeof window === "undefined") return initialScanLogs;
  const saved = safeStorage.getItem("ess_qr_scan_logs");
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
  // Keep latest 40 logs to prevent unbounded quota growth
  const trimmed = logs.slice(0, 40);
  safeStorage.setItem("ess_qr_scan_logs", JSON.stringify(trimmed));
  window.dispatchEvent(new Event("ess_scan_logs_change"));
}

export function getStoredIDCardDesign(): IDCardCustomization {
  if (typeof window === "undefined") return defaultIDCardDesign;
  const saved = safeStorage.getItem("ess_id_card_design");
  if (saved) {
    try {
      return { ...defaultIDCardDesign, ...JSON.parse(saved) };
    } catch {}
  }
  return defaultIDCardDesign;
}

export const defaultAttendanceSettings: AttendanceSettings = {
  schoolStartTime: "07:45",
  studentLateCutoff: "08:00",
  staffStartTime: "07:30",
  staffLateCutoff: "08:00",
  studentDismissalTime: "14:00",
  staffDismissalTime: "16:00",
  checkOutThreshold: "12:30",
  preventDuplicatePerDay: true,
  enableAudioFeedback: true,
  enableVibrationFeedback: true,
  autoResumeDelaySeconds: 2.5
};

export function getStoredAttendanceSettings(): AttendanceSettings {
  if (typeof window === "undefined") return defaultAttendanceSettings;
  const saved = safeStorage.getItem("ess_attendance_settings");
  if (saved) {
    try {
      return { ...defaultAttendanceSettings, ...JSON.parse(saved) };
    } catch {}
  }
  return defaultAttendanceSettings;
}

export function saveStoredAttendanceSettings(settings: AttendanceSettings) {
  if (typeof window === "undefined") return;
  safeStorage.setItem("ess_attendance_settings", JSON.stringify(settings));
  window.dispatchEvent(new Event("ess_attendance_settings_change"));
}

export function useAttendanceSettings() {
  const [settings, setSettingsState] = useState<AttendanceSettings>(getStoredAttendanceSettings);

  useEffect(() => {
    const handleUpdate = () => setSettingsState(getStoredAttendanceSettings());
    window.addEventListener("ess_attendance_settings_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ess_attendance_settings_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setSettings = (updater: AttendanceSettings | ((prev: AttendanceSettings) => AttendanceSettings)) => {
    const current = getStoredAttendanceSettings();
    const next = typeof updater === "function" ? updater(current) : updater;
    saveStoredAttendanceSettings(next);
  };

  return [settings, setSettings] as const;
}

// Time helper to determine if scan is past late cutoff
export function calculateLateStatus(timeStr: string, cutoffTime24: string): { isLate: boolean; lateMinutes: number } {
  let hours = 0;
  let minutes = 0;
  const match = timeStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
  } else {
    const now = new Date();
    hours = now.getHours();
    minutes = now.getMinutes();
  }
  const currentTotalMins = hours * 60 + minutes;

  const [cutoffH, cutoffM] = (cutoffTime24 || "08:00").split(':').map(Number);
  const cutoffTotalMins = (cutoffH || 8) * 60 + (cutoffM || 0);

  if (currentTotalMins > cutoffTotalMins) {
    return { isLate: true, lateMinutes: currentTotalMins - cutoffTotalMins };
  }
  return { isLate: false, lateMinutes: 0 };
}

// Check if current scan time is past checkout threshold
export function isPastCheckOutTime(timeStr: string, thresholdTime24: string): boolean {
  let hours = 0;
  let minutes = 0;
  const match = timeStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
  } else {
    const now = new Date();
    hours = now.getHours();
    minutes = now.getMinutes();
  }
  const currentTotalMins = hours * 60 + minutes;

  const [threshH, threshM] = (thresholdTime24 || "12:30").split(':').map(Number);
  const threshTotalMins = (threshH || 12) * 60 + (threshM || 30);

  return currentTotalMins >= threshTotalMins;
}

export function saveStoredIDCardDesign(design: IDCardCustomization) {
  if (typeof window === "undefined") return;
  safeStorage.setItem("ess_id_card_design", JSON.stringify(design));
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
  person: any,
  staffUser: { id: string; name: string },
  purpose: ScanPurpose,
  status: 'Verified' | 'Card Deactivated' | 'Invalid Token',
  deviceInfo = "Staff Portal Web Scanner",
  personType: 'student' | 'staff' = 'student'
): QRScanLog {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = getTodayDateString();

  const newLog: QRScanLog = {
    id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    qrToken,
    personType,
    studentId: person?.id || "UNKNOWN",
    studentName: person?.name || "Unrecognized Person",
    admissionNo: person?.id || "N/A",
    studentClass: person?.class || person?.department || "N/A",
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
  status?: AttendanceStatus;
  period?: AttendancePeriod;
  method?: 'qr_scan' | 'manual';
  mode?: 'auto' | 'check_in' | 'check_out';
  staffUser: { id: string; name: string };
  lateMinutes?: number;
  note?: string;
  forceOverride?: boolean;
}): { success: boolean; message: string; record?: AttendanceRecord; duplicate?: boolean; action?: 'check_in' | 'check_out' | 'duplicate' } {
  const { 
    student, 
    status: explicitStatus, 
    period = "Morning Assembly", 
    method = "qr_scan", 
    mode = "auto",
    staffUser, 
    lateMinutes: explicitLateMinutes, 
    note, 
    forceOverride 
  } = params;

  const today = getTodayDateString();
  const currentRecords = getStoredAttendance();
  const settings = getStoredAttendanceSettings();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  // Check for existing attendance today
  const existingIdx = currentRecords.findIndex(
    r => r.studentId === student.id && r.date === today && r.period === period
  );

  // Check-In vs Check-Out determination
  if (existingIdx !== -1) {
    const existing = currentRecords[existingIdx];

    // Check if we should record Check-Out
    const shouldCheckOut = mode === 'check_out' || (mode === 'auto' && isPastCheckOutTime(timeStr, settings.checkOutThreshold));

    if (shouldCheckOut && !existing.checkOutTime) {
      const updated: AttendanceRecord = {
        ...existing,
        checkOutTime: timeStr,
        note: note || (existing.note ? `${existing.note}; Dismissal Check-Out at ${timeStr}` : `Dismissal Check-Out at ${timeStr}`)
      };
      currentRecords[existingIdx] = updated;
      saveStoredAttendance([...currentRecords]);
      return {
        success: true,
        action: 'check_out',
        message: `${student.name} – Dismissal Check-Out Recorded Successfully (${timeStr})`,
        record: updated
      };
    }

    if (existing.checkOutTime && !forceOverride) {
      return {
        success: false,
        duplicate: true,
        action: 'duplicate',
        record: existing,
        message: `${student.name} – Student already completed Check-In (${existing.time}) and Check-Out (${existing.checkOutTime}) today.`
      };
    }

    if (!forceOverride) {
      return {
        success: false,
        duplicate: true,
        action: 'duplicate',
        record: existing,
        message: `${student.name} – Attendance Already Recorded Today at ${existing.time} (Status: ${existing.status}).`
      };
    }

    // Force override
    const updated: AttendanceRecord = {
      ...existing,
      status: explicitStatus || existing.status,
      time: timeStr,
      checkInTime: timeStr,
      method,
      scannedByStaffId: staffUser.id,
      scannedByStaffName: staffUser.name,
      lateMinutes: explicitLateMinutes !== undefined ? explicitLateMinutes : existing.lateMinutes,
      note: note || `Updated attendance to ${explicitStatus || existing.status}`
    };
    currentRecords[existingIdx] = updated;
    saveStoredAttendance([...currentRecords]);
    return {
      success: true,
      action: 'check_in',
      message: `${student.name} – Attendance Updated to ${explicitStatus || existing.status} (${timeStr})`,
      record: updated
    };
  }

  // Automatic late evaluation based on settings if status was not manually set to something else
  let finalStatus: AttendanceStatus = explicitStatus || 'Present';
  let finalLateMinutes = explicitLateMinutes || 0;

  if (!explicitStatus || explicitStatus === 'Present') {
    const lateCalc = calculateLateStatus(timeStr, settings.studentLateCutoff);
    if (lateCalc.isLate) {
      finalStatus = 'Late';
      finalLateMinutes = lateCalc.lateMinutes;
    }
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
    checkInTime: timeStr,
    period,
    status: finalStatus,
    method,
    scannedByStaffId: staffUser.id,
    scannedByStaffName: staffUser.name,
    lateMinutes: finalLateMinutes > 0 ? finalLateMinutes : undefined,
    note: note || (finalStatus === 'Late' ? `Late arrival (+${finalLateMinutes}m after ${settings.studentLateCutoff})` : undefined),
    personType: 'Student',
    timestamp: `${today} ${timeStr}`
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
    action: 'check_in',
    message: `${student.name} – Attendance Recorded Successfully (${timeStr}${finalStatus === 'Late' ? ' - Marked Late' : ''})`,
    record: newRecord
  };
}

export function recordStaffAttendance(params: {
  staff: any;
  status?: AttendanceStatus;
  method?: AttendanceMethod;
  mode?: 'auto' | 'check_in' | 'check_out';
  staffUser: { id: string; name: string };
  lateMinutes?: number;
  note?: string;
  forceOverride?: boolean;
}): { success: boolean; duplicate?: boolean; message: string; record?: StaffAttendanceRecord; action?: 'check_in' | 'check_out' | 'duplicate' } {
  const {
    staff,
    status: explicitStatus,
    method = "qr_scan",
    mode = "auto",
    staffUser,
    lateMinutes: explicitLateMinutes,
    note,
    forceOverride
  } = params;

  const today = getTodayDateString();
  const currentRecords = getStoredStaffAttendance();
  const settings = getStoredAttendanceSettings();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const existingIdx = currentRecords.findIndex(
    r => r.staffId === staff.id && r.date === today
  );

  if (existingIdx !== -1) {
    const existing = currentRecords[existingIdx];

    // Check if user specifically requested check_out or if auto mode past checkout threshold
    const shouldCheckOut = mode === 'check_out' || (mode === 'auto' && isPastCheckOutTime(timeStr, settings.checkOutThreshold));

    if (shouldCheckOut && !existing.checkOutTime) {
      const updated: StaffAttendanceRecord = {
        ...existing,
        checkOutTime: timeStr,
        note: note || (existing.note ? `${existing.note}; Checked out at ${timeStr}` : `Checked out at ${timeStr}`),
        timestamp: `${today} ${timeStr}`
      };
      currentRecords[existingIdx] = updated;
      saveStoredStaffAttendance([...currentRecords]);
      return {
        success: true,
        action: 'check_out',
        message: `${staff.name} – Staff Check-Out Recorded Successfully (${timeStr})`,
        record: updated
      };
    }

    if (existing.checkOutTime && !forceOverride) {
      return {
        success: false,
        duplicate: true,
        action: 'duplicate',
        record: existing,
        message: `${staff.name} – Staff already checked in (${existing.checkInTime}) and checked out (${existing.checkOutTime}) today.`
      };
    }

    if (!forceOverride) {
      return {
        success: false,
        duplicate: true,
        action: 'duplicate',
        record: existing,
        message: `${staff.name} – Staff Attendance Already Recorded Today at ${existing.checkInTime} (Status: ${existing.status}).`
      };
    } else {
      // Force override
      const updated: StaffAttendanceRecord = {
        ...existing,
        status: explicitStatus || existing.status,
        checkInTime: timeStr,
        method,
        scannedByStaffId: staffUser.id,
        scannedByStaffName: staffUser.name,
        lateMinutes: explicitLateMinutes !== undefined ? explicitLateMinutes : existing.lateMinutes,
        note: note || `Updated staff attendance to ${explicitStatus || existing.status}`,
        timestamp: `${today} ${timeStr}`
      };
      currentRecords[existingIdx] = updated;
      saveStoredStaffAttendance([...currentRecords]);
      return {
        success: true,
        action: 'check_in',
        message: `${staff.name} – Staff Attendance Updated to ${explicitStatus || existing.status} (${timeStr})`,
        record: updated
      };
    }
  }

  // Automatic late evaluation based on settings
  let finalStatus: AttendanceStatus = explicitStatus || 'Present';
  let finalLateMinutes = explicitLateMinutes || 0;

  if (!explicitStatus || explicitStatus === 'Present') {
    const lateCalc = calculateLateStatus(timeStr, settings.staffLateCutoff);
    if (lateCalc.isLate) {
      finalStatus = 'Late';
      finalLateMinutes = lateCalc.lateMinutes;
    }
  }

  // Create new staff attendance check-in
  const newRecord: StaffAttendanceRecord = {
    id: `ATT-STF-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    staffId: staff.id,
    staffName: staff.name,
    department: staff.department || "General",
    role: staff.role || "Staff",
    date: today,
    checkInTime: timeStr,
    status: finalStatus,
    method,
    lateMinutes: finalLateMinutes > 0 ? finalLateMinutes : undefined,
    scannedByStaffId: staffUser.id,
    scannedByStaffName: staffUser.name,
    note: note || (finalStatus === 'Late' ? `Late arrival (+${finalLateMinutes}m after ${settings.staffLateCutoff})` : undefined),
    timestamp: `${today} ${timeStr}`
  };

  saveStoredStaffAttendance([newRecord, ...currentRecords]);

  // Update lastScannedAt on staff's ID card
  const cards = getStoredIdCards();
  const cardIdx = cards.findIndex(c => c.studentId === staff.id);
  if (cardIdx !== -1) {
    cards[cardIdx] = {
      ...cards[cardIdx],
      lastScannedAt: `${today} ${timeStr}`
    };
    saveStoredIdCards([...cards]);
  }

  return {
    success: true,
    action: 'check_in',
    message: `${staff.name} – Staff Attendance Recorded Successfully (${timeStr}${finalStatus === 'Late' ? ' - Marked Late' : ''})`,
    record: newRecord
  };
}

// Unified Manual Attendance Entry
export function recordManualAttendance(params: {
  personType: 'student' | 'staff';
  person: any;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  period?: AttendancePeriod;
  officer: { id: string; name: string };
  reason?: string;
  forceOverride?: boolean;
}) {
  const { personType, person, status, period, officer, reason, forceOverride } = params;
  const remark = reason ? `Manual Entry: ${reason}` : 'Manual Attendance Entry';

  if (personType === 'student') {
    return recordStudentAttendance({
      student: person,
      status,
      period: period || "Morning Assembly",
      method: 'manual',
      staffUser: officer,
      note: remark,
      forceOverride
    });
  } else {
    return recordStaffAttendance({
      staff: person,
      status,
      method: 'manual',
      mode: 'auto',
      staffUser: officer,
      note: remark,
      forceOverride
    });
  }
}

export function updateStudentAttendanceRecord(recordId: string, updates: Partial<AttendanceRecord>): boolean {
  const records = getStoredAttendance();
  const idx = records.findIndex(r => r.id === recordId);
  if (idx === -1) return false;

  records[idx] = { ...records[idx], ...updates };
  saveStoredAttendance([...records]);
  return true;
}

export function updateStaffAttendanceRecord(recordId: string, updates: Partial<StaffAttendanceRecord>): boolean {
  const records = getStoredStaffAttendance();
  const idx = records.findIndex(r => r.id === recordId);
  if (idx === -1) return false;

  records[idx] = { ...records[idx], ...updates };
  saveStoredStaffAttendance([...records]);
  return true;
}

export function deleteStudentAttendanceRecord(recordId: string): boolean {
  const records = getStoredAttendance();
  const filtered = records.filter(r => r.id !== recordId);
  if (filtered.length === records.length) return false;
  saveStoredAttendance(filtered);
  return true;
}

export function deleteStaffAttendanceRecord(recordId: string): boolean {
  const records = getStoredStaffAttendance();
  const filtered = records.filter(r => r.id !== recordId);
  if (filtered.length === records.length) return false;
  saveStoredStaffAttendance(filtered);
  return true;
}

export function getTodayAttendanceSummary(
  allTeachers: any[],
  allStudents: any[]
) {
  const today = getTodayDateString();
  const studentRecords = getStoredAttendance().filter(r => r.date === today);
  const staffRecords = getStoredStaffAttendance().filter(r => r.date === today);
  const recentLogs = getStoredScanLogs();

  // Active students
  const activeStudents = allStudents.filter(s => s.status !== 'Graduated' && s.status !== 'Withdrawn');
  const totalStudentsCount = activeStudents.length;

  const studentPresentCount = studentRecords.filter(r => r.status === 'Present').length;
  const studentLateCount = studentRecords.filter(r => r.status === 'Late').length;
  const studentExcusedCount = studentRecords.filter(r => r.status === 'Excused').length;
  const studentRecordedCount = studentPresentCount + studentLateCount + studentExcusedCount;
  const studentAbsentCount = Math.max(0, totalStudentsCount - studentRecordedCount);

  // List of absent students
  const recordedStudentIds = new Set(studentRecords.map(r => r.studentId));
  const absentStudentsList = activeStudents.filter(s => !recordedStudentIds.has(s.id));

  // Active staff
  const activeStaff = allTeachers.filter(t => !['Resigned', 'Terminated', 'Retired', 'Suspended'].includes(t.status));
  const totalStaffCount = activeStaff.length;

  const staffPresentCount = staffRecords.filter(r => r.status === 'Present').length;
  const staffLateCount = staffRecords.filter(r => r.status === 'Late').length;
  const staffOnLeaveCount = staffRecords.filter(r => r.status === 'On Leave' || r.status === 'Excused').length;
  const staffRecordedCount = staffPresentCount + staffLateCount + staffOnLeaveCount;
  const staffAbsentCount = Math.max(0, totalStaffCount - staffRecordedCount);

  // List of absent staff
  const recordedStaffIds = new Set(staffRecords.map(r => r.staffId));
  const absentStaffList = activeStaff.filter(t => !recordedStaffIds.has(t.id));

  return {
    today,
    totalStaffCount,
    staffPresentCount,
    staffLateCount,
    staffOnLeaveCount,
    staffAbsentCount,
    staffAttendanceRate: totalStaffCount > 0 ? Math.round(((staffPresentCount + staffLateCount) / totalStaffCount) * 100) : 0,
    totalStudentsCount,
    studentPresentCount,
    studentLateCount,
    studentExcusedCount,
    studentsPresentCount: studentPresentCount + studentLateCount,
    studentsAbsentCount: studentAbsentCount,
    studentsAttendanceRate: totalStudentsCount > 0 ? Math.round(((studentPresentCount + studentLateCount) / totalStudentsCount) * 100) : 0,
    studentRecords,
    staffRecords,
    absentStudentsList,
    absentStaffList,
    recentLogs
  };
}
