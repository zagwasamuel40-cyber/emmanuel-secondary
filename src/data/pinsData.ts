import { useState, useEffect } from "react";

export interface PinRecord {
  id: string;
  pinCode: string;
  serialNumber: string;
  studentId: string;
  studentName: string;
  class: string;
  session: string;
  term: "First Term" | "Second Term" | "Third Term" | "All Terms";
  pinType: "term" | "session";
  status: "Active" | "Used" | "Expired" | "Revoked" | "Inactive";
  usesRemaining: number;
  maxUses: number;
  dateGenerated: string;
  lastUsedAt?: string;
  generatedBy?: string;
  revokedReason?: string;
  pinHash?: string;
}

export interface PinSecurityConfig {
  pinType: "term" | "session"; // Option A (term-specific) vs Option B (session)
  maxUsesPerPin: number;
  pinLength: number;
  maxFailedAttempts: number;
  lockoutMinutes: number;
  requireExamPin: boolean;
  allowStudentRecoveryRequest: boolean;
}

export const defaultPinConfig: PinSecurityConfig = {
  pinType: "session", // Default to session-wide PIN (Option B), can switch to Option A (term-specific)
  maxUsesPerPin: 5,
  pinLength: 12,
  maxFailedAttempts: 5,
  lockoutMinutes: 15,
  requireExamPin: true,
  allowStudentRecoveryRequest: true,
};

export const initialPins: PinRecord[] = [
  {
    id: "PIN-101",
    pinCode: "9842-1048-5510",
    serialNumber: "ESS-SN-2026-001",
    studentId: "ESS/2026/001",
    studentName: "Oluwaseun Adebayo",
    class: "SSS 3A",
    session: "2025/2026",
    term: "All Terms",
    pinType: "session",
    status: "Active",
    usesRemaining: 5,
    maxUses: 5,
    dateGenerated: "2026-07-20",
    generatedBy: "Examination Admin (Mr. Babatunde Lawal)",
  },
  {
    id: "PIN-101-T1",
    pinCode: "8412-9901-3421",
    serialNumber: "ESS-SN-2026-001B",
    studentId: "ESS/2026/001",
    studentName: "Oluwaseun Adebayo",
    class: "SSS 3A",
    session: "2025/2026",
    term: "First Term",
    pinType: "term",
    status: "Active",
    usesRemaining: 5,
    maxUses: 5,
    dateGenerated: "2026-08-01",
    generatedBy: "Examination Admin (Mr. Babatunde Lawal)",
  },
  {
    id: "PIN-102",
    pinCode: "3319-4820-1102",
    serialNumber: "ESS-SN-2026-002",
    studentId: "ESS/2026/002",
    studentName: "Chioma Nwosu",
    class: "SSS 2B",
    session: "2025/2026",
    term: "All Terms",
    pinType: "session",
    status: "Active",
    usesRemaining: 3,
    maxUses: 5,
    dateGenerated: "2026-07-21",
    lastUsedAt: "2026-07-24 14:32",
    generatedBy: "Examination Admin (Mr. Babatunde Lawal)",
  },
  {
    id: "PIN-103",
    pinCode: "7712-9041-8833",
    serialNumber: "ESS-SN-2026-003",
    studentId: "ESS/2026/003",
    studentName: "Abubakar Ibrahim",
    class: "JSS 1A",
    session: "2025/2026",
    term: "All Terms",
    pinType: "session",
    status: "Active",
    usesRemaining: 5,
    maxUses: 5,
    dateGenerated: "2026-07-22",
    generatedBy: "Examination Admin (Mr. Babatunde Lawal)",
  },
  {
    id: "PIN-104",
    pinCode: "1209-5541-6677",
    serialNumber: "ESS-SN-2026-004",
    studentId: "ESS/2026/004",
    studentName: "Grace Okhiria",
    class: "SSS 3C",
    session: "2025/2026",
    term: "All Terms",
    pinType: "session",
    status: "Active",
    usesRemaining: 4,
    maxUses: 5,
    dateGenerated: "2026-07-22",
    lastUsedAt: "2026-07-25 09:15",
    generatedBy: "Examination Admin (Mr. Babatunde Lawal)",
  },
  {
    id: "PIN-105",
    pinCode: "4481-9920-3311",
    serialNumber: "ESS-SN-2026-005",
    studentId: "ESS/2026/005",
    studentName: "David Emmanuel",
    class: "JSS 3B",
    session: "2025/2026",
    term: "All Terms",
    pinType: "session",
    status: "Active",
    usesRemaining: 5,
    maxUses: 5,
    dateGenerated: "2026-07-23",
    generatedBy: "Examination Admin (Mr. Babatunde Lawal)",
  },
  {
    id: "PIN-106",
    pinCode: "6124-7839-4012",
    serialNumber: "ESS-SN-2026-006",
    studentId: "ESS/2026/006",
    studentName: "Fatima Bello",
    class: "SSS 3A",
    session: "2025/2026",
    term: "All Terms",
    pinType: "session",
    status: "Active",
    usesRemaining: 5,
    maxUses: 5,
    dateGenerated: "2026-07-23",
    generatedBy: "Examination Admin (Mr. Babatunde Lawal)",
  },
  {
    id: "PIN-107",
    pinCode: "5910-2348-7762",
    serialNumber: "ESS-SN-2026-007",
    studentId: "ESS/2026/007",
    studentName: "Emeka Okafor",
    class: "SSS 3A",
    session: "2025/2026",
    term: "All Terms",
    pinType: "session",
    status: "Active",
    usesRemaining: 5,
    maxUses: 5,
    dateGenerated: "2026-07-23",
    generatedBy: "Examination Admin (Mr. Babatunde Lawal)",
  },
];

export function getStoredPins(): PinRecord[] {
  const saved = localStorage.getItem("ess_pins");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return initialPins;
}

export function saveStoredPins(pins: PinRecord[]) {
  localStorage.setItem("ess_pins", JSON.stringify(pins));
}

export function getPinConfig(): PinSecurityConfig {
  const saved = localStorage.getItem("ess_pin_config");
  if (saved) {
    try {
      return { ...defaultPinConfig, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
  }
  return defaultPinConfig;
}

export function savePinConfig(config: PinSecurityConfig) {
  localStorage.setItem("ess_pin_config", JSON.stringify(config));
}

export function usePins() {
  const [pins, setPinsState] = useState<PinRecord[]>(() => getStoredPins());

  useEffect(() => {
    saveStoredPins(pins);
  }, [pins]);

  return [pins, setPinsState] as const;
}

export function usePinConfig() {
  const [config, setConfigState] = useState<PinSecurityConfig>(() => getPinConfig());

  useEffect(() => {
    savePinConfig(config);
  }, [config]);

  return [config, setConfigState] as const;
}

// Generate randomized 12-digit PIN in 4-4-4 format: 9842-1048-5510
export function generateRandomPinCode(): string {
  const segment1 = Math.floor(1000 + Math.random() * 9000);
  const segment2 = Math.floor(1000 + Math.random() * 9000);
  const segment3 = Math.floor(1000 + Math.random() * 9000);
  return `${segment1}-${segment2}-${segment3}`;
}

// Generate serial number
export function generateRandomSerialNumber(index: number = 1): string {
  const year = new Date().getFullYear();
  const randSeq = Math.floor(100 + Math.random() * 900);
  return `ESS-SN-${year}-${String(randSeq).padStart(3, "0")}-${String(index).padStart(2, "0")}`;
}

// Normalize PIN code for comparison (strips whitespace and dashes)
export function normalizePin(pin: string): string {
  return pin.replace(/[\s-]/g, "").toUpperCase();
}

// Track brute-force attempts per student
interface FailedAttemptsRecord {
  count: number;
  lockedUntil?: number; // timestamp
}

export function getFailedAttempts(studentId: string): FailedAttemptsRecord {
  const key = `ess_pin_attempts_${studentId.toUpperCase()}`;
  const saved = sessionStorage.getItem(key) || localStorage.getItem(key);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.lockedUntil && Date.now() > parsed.lockedUntil) {
        // Lockout expired
        clearFailedAttempts(studentId);
        return { count: 0 };
      }
      return parsed;
    } catch (e) {
      return { count: 0 };
    }
  }
  return { count: 0 };
}

export function recordFailedAttempt(studentId: string, maxAttempts: number = 5, lockoutMinutes: number = 15): FailedAttemptsRecord {
  const current = getFailedAttempts(studentId);
  const newCount = current.count + 1;
  const key = `ess_pin_attempts_${studentId.toUpperCase()}`;
  
  let record: FailedAttemptsRecord = { count: newCount };
  if (newCount >= maxAttempts) {
    record.lockedUntil = Date.now() + lockoutMinutes * 60 * 1000;
  }
  
  sessionStorage.setItem(key, JSON.stringify(record));
  localStorage.setItem(key, JSON.stringify(record));
  return record;
}

export function clearFailedAttempts(studentId: string): void {
  const key = `ess_pin_attempts_${studentId.toUpperCase()}`;
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

// Result of PIN Verification
export interface PinVerificationResult {
  success: boolean;
  message: string;
  pin?: PinRecord;
  remainingAttempts?: number;
  isLocked?: boolean;
  lockedMinutesRemaining?: number;
  usesRemaining?: number;
}

/**
 * Validate a student's Result PIN against the database:
 * Confirms:
 * 1. Brute-force lockout state
 * 2. PIN matches stored record
 * 3. PIN strictly belongs to the logged-in student (Student ID check)
 * 4. PIN is valid for the selected session and term
 * 5. PIN status is Active and has uses remaining
 */
export function verifyStudentResultPin(
  studentId: string,
  enteredPin: string,
  session: string,
  term: string
): PinVerificationResult {
  const config = getPinConfig();
  const trimmedId = studentId.trim().toUpperCase();
  const cleanEnteredPin = normalizePin(enteredPin);

  // 1. Check brute force lockout
  const attemptRecord = getFailedAttempts(trimmedId);
  if (attemptRecord.lockedUntil && Date.now() < attemptRecord.lockedUntil) {
    const minutesLeft = Math.ceil((attemptRecord.lockedUntil - Date.now()) / (60 * 1000));
    return {
      success: false,
      isLocked: true,
      lockedMinutesRemaining: minutesLeft,
      message: `Account security lockout active due to repeated incorrect PIN attempts. Please wait ${minutesLeft} minute(s) before trying again, or contact the school examination office.`,
    };
  }

  if (!cleanEnteredPin) {
    return {
      success: false,
      message: "Please enter your Result PIN to view your academic result.",
    };
  }

  const allPins = getStoredPins();

  // Find pin by code
  const matchedPin = allPins.find((p) => normalizePin(p.pinCode) === cleanEnteredPin);

  if (!matchedPin) {
    const updated = recordFailedAttempt(trimmedId, config.maxFailedAttempts, config.lockoutMinutes);
    const remaining = Math.max(0, config.maxFailedAttempts - updated.count);
    
    if (updated.lockedUntil) {
      return {
        success: false,
        isLocked: true,
        lockedMinutesRemaining: config.lockoutMinutes,
        message: `Too many failed PIN attempts. For security, result access is locked for ${config.lockoutMinutes} minutes. Please contact the school examination office.`,
      };
    }

    return {
      success: false,
      remainingAttempts: remaining,
      message: `Invalid Result PIN. Please check your PIN and try again. (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)`,
    };
  }

  // 2. PIN MUST BE CONNECTED TO THIS LOGGED-IN STUDENT
  const pinStudentId = (matchedPin.studentId || "").trim().toUpperCase();
  if (pinStudentId !== trimmedId) {
    const updated = recordFailedAttempt(trimmedId, config.maxFailedAttempts, config.lockoutMinutes);
    const remaining = Math.max(0, config.maxFailedAttempts - updated.count);
    return {
      success: false,
      remainingAttempts: remaining,
      message: "Invalid Result PIN. This PIN does not belong to your student account.",
    };
  }

  // 3. Status check
  if (matchedPin.status === "Revoked") {
    return {
      success: false,
      message: `This Result PIN has been revoked by the examination office. Reason: ${matchedPin.revokedReason || "Administrative hold"}. Please contact the examination office.`,
    };
  }

  if (matchedPin.status === "Expired" || matchedPin.status === "Used" || matchedPin.usesRemaining <= 0) {
    return {
      success: false,
      message: "This Result PIN has reached its maximum usage limit or expired. Please acquire a new Result PIN.",
    };
  }

  // 4. Validate session & term based on system configuration
  const sessionYear = session.includes(" - ") ? session.split(" - ")[0].trim() : session.trim();
  const pinSessionYear = matchedPin.session.includes(" - ") ? matchedPin.session.split(" - ")[0].trim() : matchedPin.session.trim();

  if (pinSessionYear && sessionYear && pinSessionYear !== sessionYear) {
    return {
      success: false,
      message: `This PIN is valid for the ${matchedPin.session} academic session, not ${sessionYear}. Please use a valid PIN for this session.`,
    };
  }

  // Term check if pinType is 'term' or if configured for term-specific
  if (config.pinType === "term" || matchedPin.pinType === "term") {
    if (matchedPin.term && matchedPin.term !== "All Terms" && matchedPin.term !== term) {
      return {
        success: false,
        message: `This PIN is only valid for ${matchedPin.term} results. You are attempting to view ${term}.`,
      };
    }
  }

  // 5. Success! Clear failed attempts and decrement uses
  clearFailedAttempts(trimmedId);

  const updatedUsesRemaining = Math.max(0, matchedPin.usesRemaining - 1);
  const updatedStatus = updatedUsesRemaining === 0 ? "Used" : "Active";
  const nowStr = new Date().toLocaleString();

  const updatedPins = allPins.map((p) => {
    if (p.id === matchedPin.id) {
      return {
        ...p,
        usesRemaining: updatedUsesRemaining,
        status: updatedStatus as any,
        lastUsedAt: nowStr,
      };
    }
    return p;
  });
  saveStoredPins(updatedPins);

  // Record audit log for Checked Results Via PIN Use
  recordPinUsageLog({
    pinId: matchedPin.id,
    pinCode: matchedPin.pinCode,
    serialNumber: matchedPin.serialNumber,
    studentId: matchedPin.studentId || trimmedId,
    studentName: matchedPin.studentName || "Student",
    class: matchedPin.class || "SSS 3A",
    session: session,
    term: term,
    timestamp: nowStr,
    accessChannel: "Student Portal",
    status: "Success",
    details: `Accessed academic report card. Remaining uses: ${updatedUsesRemaining}/${matchedPin.maxUses}.`
  });

  return {
    success: true,
    message: "Result PIN verified successfully.",
    pin: {
      ...matchedPin,
      usesRemaining: updatedUsesRemaining,
      status: updatedStatus,
      lastUsedAt: nowStr,
    },
    usesRemaining: updatedUsesRemaining,
  };
}

// Audit record for checked results via PIN
export interface PinUsageLog {
  id: string;
  pinId: string;
  pinCode: string;
  serialNumber: string;
  studentId: string;
  studentName: string;
  class: string;
  session: string;
  term: string;
  timestamp: string;
  accessChannel: "Student Portal" | "Public Result Checker";
  status: "Success" | "Failed";
  details?: string;
}

export const initialPinUsageLogs: PinUsageLog[] = [
  {
    id: "LOG-001",
    pinId: "PIN-101",
    pinCode: "9842-1048-5510",
    serialNumber: "ESS-SN-2026-001",
    studentId: "ESS/2026/001",
    studentName: "Oluwaseun Adebayo",
    class: "SSS 3A",
    session: "2025/2026",
    term: "First Term",
    timestamp: "2026-07-24 14:32:10",
    accessChannel: "Student Portal",
    status: "Success",
    details: "First Term report card accessed. Remaining uses: 4/5."
  },
  {
    id: "LOG-002",
    pinId: "PIN-102",
    pinCode: "3319-4820-1102",
    serialNumber: "ESS-SN-2026-002",
    studentId: "ESS/2026/002",
    studentName: "Chioma Nwosu",
    class: "SSS 2B",
    session: "2025/2026",
    term: "First Term",
    timestamp: "2026-07-24 16:05:44",
    accessChannel: "Public Result Checker",
    status: "Success",
    details: "First Term result verified and printed by parent. Remaining uses: 3/5."
  },
  {
    id: "LOG-003",
    pinId: "PIN-104",
    pinCode: "1209-5541-6677",
    serialNumber: "ESS-SN-2026-004",
    studentId: "ESS/2026/004",
    studentName: "Grace Okhiria",
    class: "SSS 3C",
    session: "2025/2026",
    term: "First Term",
    timestamp: "2026-07-25 09:15:20",
    accessChannel: "Student Portal",
    status: "Success",
    details: "First Term result checked via Student Portal. Remaining uses: 4/5."
  },
  {
    id: "LOG-004",
    pinId: "PIN-105",
    pinCode: "4481-9920-3311",
    serialNumber: "ESS-SN-2026-005",
    studentId: "ESS/2026/005",
    studentName: "David Emmanuel",
    class: "JSS 3B",
    session: "2025/2026",
    term: "First Term",
    timestamp: "2026-07-25 11:20:12",
    accessChannel: "Student Portal",
    status: "Success",
    details: "First Term terminal examination broadsheet previewed. Remaining uses: 4/5."
  },
  {
    id: "LOG-005",
    pinId: "PIN-106",
    pinCode: "6124-7839-4012",
    serialNumber: "ESS-SN-2026-006",
    studentId: "ESS/2026/006",
    studentName: "Fatima Bello",
    class: "SSS 3A",
    session: "2025/2026",
    term: "First Term",
    timestamp: "2026-07-25 13:45:00",
    accessChannel: "Student Portal",
    status: "Success",
    details: "Verified result access. Terminal report printed."
  }
];

export function getStoredPinUsageLogs(): PinUsageLog[] {
  const saved = localStorage.getItem("ess_pin_usage_logs");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return initialPinUsageLogs;
}

export function saveStoredPinUsageLogs(logs: PinUsageLog[]) {
  localStorage.setItem("ess_pin_usage_logs", JSON.stringify(logs));
}

export function recordPinUsageLog(log: Omit<PinUsageLog, "id">): void {
  const allLogs = getStoredPinUsageLogs();
  const newLog: PinUsageLog = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...log,
  };
  const updated = [newLog, ...allLogs];
  saveStoredPinUsageLogs(updated);
}

export function usePinUsageLogs() {
  const [logs, setLogs] = useState<PinUsageLog[]>(() => getStoredPinUsageLogs());

  useEffect(() => {
    saveStoredPinUsageLogs(logs);
  }, [logs]);

  return [logs, setLogs] as const;
}

// Session storage helper for verified result state
export function getVerifiedResultSession(studentId: string, session: string, term: string): boolean {
  try {
    const key = `ess_verified_result_${studentId.toUpperCase()}_${session}_${term}`;
    const data = sessionStorage.getItem(key);
    if (!data) return false;
    const parsed = JSON.parse(data);
    // Verified session valid for 60 minutes
    if (Date.now() - parsed.timestamp > 60 * 60 * 1000) {
      sessionStorage.removeItem(key);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function setVerifiedResultSession(studentId: string, session: string, term: string, pinId: string): void {
  try {
    const key = `ess_verified_result_${studentId.toUpperCase()}_${session}_${term}`;
    sessionStorage.setItem(
      key,
      JSON.stringify({
        studentId: studentId.toUpperCase(),
        session,
        term,
        pinId,
        timestamp: Date.now(),
      })
    );
  } catch (e) {}
}

export function clearVerifiedResultSession(studentId: string, session?: string, term?: string): void {
  try {
    if (session && term) {
      sessionStorage.removeItem(`ess_verified_result_${studentId.toUpperCase()}_${session}_${term}`);
    } else {
      // Clear all sessions for this student
      const prefix = `ess_verified_result_${studentId.toUpperCase()}`;
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith(prefix)) sessionStorage.removeItem(k);
      });
    }
  } catch (e) {}
}

