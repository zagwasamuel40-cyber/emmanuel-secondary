import { useState, useEffect } from "react";

export type AuditModule =
  | 'Admission'
  | 'Finance & Bursary'
  | 'Examinations & CBT'
  | 'Academics & Classes'
  | 'Attendance & Gate'
  | 'Portal & Website'
  | 'Staff & Roles'
  | 'Students & Records'
  | 'System Settings'
  | 'Security & Auth';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO String
  formattedDate: string; // e.g. "12 Sept 2026"
  formattedTime: string; // e.g. "10:14 AM"
  userName: string;
  userId: string;
  role: string;
  action: string;
  module: AuditModule;
  recordAffected: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  device?: string;
  severity?: 'Info' | 'Warning' | 'Critical';
}

const initialAuditLogs: AuditLogEntry[] = [
  {
    id: "AUD-2026-091",
    timestamp: "2026-09-12T08:35:10.000Z",
    formattedDate: "12 Sept 2026",
    formattedTime: "09:35 AM",
    userName: "Mrs. Abigail M. Iorliam",
    userId: "ADM/2026/010",
    role: "Admission Officer",
    action: "Approved applicant admission dossier and generated student clearance ID",
    module: "Admission",
    recordAffected: "Applicant APP-2026-089 (David Terfa)",
    previousValue: "Under Review",
    newValue: "Approved & Clearance Issued",
    ipAddress: "197.210.45.18",
    device: "Chrome on macOS",
    severity: "Info"
  },
  {
    id: "AUD-2026-090",
    timestamp: "2026-09-12T08:12:44.000Z",
    formattedDate: "12 Sept 2026",
    formattedTime: "09:12 AM",
    userName: "Mrs. Blessing K. Danladi",
    userId: "BUR/2026/005",
    role: "Finance/Bursar",
    action: "Recorded tuition fee payment and issued official digitally signed receipt",
    module: "Finance & Bursary",
    recordAffected: "Receipt REC-2026-441 / Student ESS/2026/001",
    previousValue: "₦85,000 Unpaid",
    newValue: "₦85,000 Paid (Verified)",
    ipAddress: "102.89.33.72",
    device: "Firefox on Windows 11",
    severity: "Info"
  },
  {
    id: "AUD-2026-089",
    timestamp: "2026-09-12T07:45:00.000Z",
    formattedDate: "12 Sept 2026",
    formattedTime: "08:45 AM",
    userName: "Mr. Babatunde Lawal",
    userId: "TCH/2026/015",
    role: "Examination Admin",
    action: "Published Term Examination and CA result sheets for SSS 3",
    module: "Examinations & CBT",
    recordAffected: "SSS 3 Mathematics & Sciences Result Broad-sheet",
    previousValue: "Draft / Pending Approval",
    newValue: "Published & Released to Portal",
    ipAddress: "197.210.45.89",
    device: "Edge on Windows 11",
    severity: "Info"
  },
  {
    id: "AUD-2026-088",
    timestamp: "2026-09-11T16:20:15.000Z",
    formattedDate: "11 Sept 2026",
    formattedTime: "05:20 PM",
    userName: "Dr. Emmanuel A. Vershima",
    userId: "PRN/2026/001",
    role: "Super Admin",
    action: "Assigned departmental role 'Examination Admin' to existing staff account while retaining teaching subjects",
    module: "Staff & Roles",
    recordAffected: "Staff Account Mr. Babatunde Lawal (TCH/2026/015)",
    previousValue: "Roles: [Staff/Teacher]",
    newValue: "Roles: [Staff/Teacher, Examination Admin]",
    ipAddress: "102.91.4.15",
    device: "Safari on iPad Pro",
    severity: "Critical"
  },
  {
    id: "AUD-2026-087",
    timestamp: "2026-09-11T14:10:00.000Z",
    formattedDate: "11 Sept 2026",
    formattedTime: "03:10 PM",
    userName: "Mr. Emmanuel Terhemba",
    userId: "STF/2026/088",
    role: "Attendance Officer",
    action: "Clocked in 142 morning students and 28 academic staff via Main Gate QR Scanner",
    module: "Attendance & Gate",
    recordAffected: "Morning Gate Register 2026-09-11",
    previousValue: "0 Scans",
    newValue: "170 Scanned Entries",
    ipAddress: "102.89.20.5",
    device: "Handheld Android Zebra Barcode Scanner",
    severity: "Info"
  },
  {
    id: "AUD-2026-086",
    timestamp: "2026-09-11T11:05:30.000Z",
    formattedDate: "11 Sept 2026",
    formattedTime: "12:05 PM",
    userName: "Mr. Clement U. Oche",
    userId: "ADM/2026/001",
    role: "Portal Admin",
    action: "Updated public school announcement and published Inter-House Sports banner on homepage",
    module: "Portal & Website",
    recordAffected: "Homepage Banner Carousel & News Feed",
    previousValue: "Term 1 Resumption Notice",
    newValue: "Inter-House Sports Festival 2026",
    ipAddress: "197.210.12.98",
    device: "Chrome on Linux",
    severity: "Info"
  }
];

export function getStoredAuditLogs(): AuditLogEntry[] {
  const saved = localStorage.getItem("ess_audit_logs");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return initialAuditLogs;
}

export function logAuditEvent(entry: {
  action: string;
  module: AuditModule;
  recordAffected: string;
  previousValue?: string;
  newValue?: string;
  userName?: string;
  userId?: string;
  role?: string;
  severity?: 'Info' | 'Warning' | 'Critical';
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });

  let defaultName = "Current User";
  let defaultId = "USR-001";
  let defaultRole = "Staff/Teacher";

  try {
    const roles: string[] = JSON.parse(localStorage.getItem('userRoles') || '[]');
    if (roles.length > 0) defaultRole = roles[0];
    const uId = localStorage.getItem('loggedInUserId');
    if (uId) defaultId = uId;
    const impName = localStorage.getItem('impersonatingName');
    if (impName) defaultName = impName;
  } catch (e) {}

  const newLog: AuditLogEntry = {
    id: `AUD-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: now.toISOString(),
    formattedDate: dateStr,
    formattedTime: timeStr,
    userName: entry.userName || defaultName,
    userId: entry.userId || defaultId,
    role: entry.role || defaultRole,
    action: entry.action,
    module: entry.module,
    recordAffected: entry.recordAffected,
    previousValue: entry.previousValue,
    newValue: entry.newValue,
    ipAddress: "102.89.23.11", // Simulated local workstation IP
    device: navigator.userAgent.includes("Mac") ? "Safari / macOS" : "Chrome / Desktop Workstation",
    severity: entry.severity || 'Info'
  };

  const logs = getStoredAuditLogs();
  const updated = [newLog, ...logs];
  localStorage.setItem("ess_audit_logs", JSON.stringify(updated));
  window.dispatchEvent(new Event("ess_audit_logs_change"));
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(getStoredAuditLogs);

  useEffect(() => {
    const handleUpdate = () => {
      setLogs(getStoredAuditLogs());
    };
    window.addEventListener("ess_audit_logs_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ess_audit_logs_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return logs;
}
