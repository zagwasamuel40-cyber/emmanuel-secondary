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

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Excused';
export type AttendanceMethod = 'qr_scan' | 'manual';
export type AttendancePeriod = 'Morning Assembly' | 'Daily Attendance' | 'Afternoon Rollcall' | 'Exam Session';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  class: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS AM/PM
  period: AttendancePeriod;
  status: AttendanceStatus;
  method: AttendanceMethod;
  scannedByStaffId: string;
  scannedByStaffName: string;
  note?: string;
  lateMinutes?: number;
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
  studentId: string;
  studentName: string;
  admissionNo: string;
  studentClass: string;
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
