export type IDCardStatus = 'active' | 'lost' | 'stolen' | 'deactivated' | 'expired';

export type CardOrientation = 'vertical' | 'horizontal';

export type CardTemplateTheme = 'classic_navy' | 'modern_emerald' | 'executive_gold' | 'tech_slate';

export interface IDCard {
  id: string;
  studentId: string; // Used for both student and staff IDs for backwards compatibility
  userType?: 'student' | 'staff'; // Optional for backwards compatibility, default to student
  qrToken: string;
  cardStatus: IDCardStatus;
  issueDate: string;
  expiryDate: string;
  academicSession: string;
  barcode: string;
  reissueCount: number;
  lastScannedAt?: string;
  notes?: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Excused' | 'On Leave' | 'Early Departure';
export type AttendanceMethod = 'qr_scan' | 'manual';
export type AttendancePeriod = 'Morning Assembly' | 'Daily Attendance' | 'Afternoon Rollcall' | 'Exam Session';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  class: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS AM/PM (check-in time)
  checkInTime?: string;
  checkOutTime?: string; // HH:MM:SS AM/PM (check-out time)
  period: AttendancePeriod;
  status: AttendanceStatus;
  method: AttendanceMethod;
  scannedByStaffId: string;
  scannedByStaffName: string;
  note?: string;
  lateMinutes?: number;
  personType?: 'Student' | 'Staff';
  timestamp?: string;
}

export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  role: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM:SS AM/PM
  checkOutTime?: string; // HH:MM:SS AM/PM
  status: AttendanceStatus;
  method: AttendanceMethod;
  lateMinutes?: number;
  scannedByStaffId?: string;
  scannedByStaffName?: string;
  note?: string;
  timestamp?: string;
}

export interface AttendanceSettings {
  schoolStartTime: string; // e.g. "07:45"
  studentLateCutoff: string; // e.g. "08:00"
  staffStartTime: string; // e.g. "07:30"
  staffLateCutoff: string; // e.g. "08:00"
  studentDismissalTime: string; // e.g. "14:00"
  staffDismissalTime: string; // e.g. "16:00"
  checkOutThreshold: string; // e.g. "12:30" - scans after this are treated as Check-Out
  preventDuplicatePerDay: boolean;
  enableAudioFeedback: boolean;
  enableVibrationFeedback: boolean;
  autoResumeDelaySeconds: number; // e.g. 2.5
}

export interface AttendanceOfficerPermissions {
  canScanStudents: boolean;
  canScanStaff: boolean;
  canManualAttendance: boolean;
  canOverrideCheckOut: boolean;
  canEditRemarks: boolean;
  canExportReports: boolean;
  canViewAuditLogs: boolean;
}

export type ScanPurpose = 
  | 'Attendance Recording' 
  | 'Identity Verification' 
  | 'Academic Result Check' 
  | 'Exam Hall Verification';

export type ScanResultStatus = 'Verified' | 'Card Deactivated' | 'Invalid Token';

export interface QRScanLog {
  id: string;
  qrToken: string;
  personType?: 'student' | 'staff';
  studentId: string; // Used for person ID (student or staff)
  studentName: string;
  admissionNo: string;
  studentClass: string; // Class or Department
  scannedByStaffId: string;
  scannedByStaffName: string;
  timestamp: string;
  date: string;
  time: string;
  purpose: ScanPurpose;
  status: ScanResultStatus;
  deviceInfo: string;
}

export interface IDCardCustomization {
  schoolName: string;
  schoolMotto: string;
  logoUrl: string;
  templateStyle: CardTemplateTheme;
  orientation: CardOrientation;
  showWatermark: boolean;
  showChipGraphic: boolean;
  showEmergencyContact: boolean;
  showDob: boolean;
  showBloodGroup: boolean;
  customFooterNote: string;
  principalSignatureUrl?: string;
  contactPhone: string;
  contactEmail: string;
  schoolAddress: string;
}
