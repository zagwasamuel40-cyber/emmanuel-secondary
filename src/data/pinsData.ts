import { useState, useEffect } from "react";

export interface PinRecord {
  id: string;
  pinCode: string;
  serialNumber: string;
  studentId: string;
  studentName: string;
  class: string;
  session: string;
  status: "Active" | "Inactive" | "Used" | "Expired";
  usesRemaining: number;
  maxUses: number;
  dateGenerated: string;
  lastUsedAt?: string;
}

export const initialPins: PinRecord[] = [
  { id: "PIN-101", pinCode: "9842-1048-5510", serialNumber: "SN-2026-001", studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", class: "SSS 3A", session: "2025/2026 - First Term", status: "Active", usesRemaining: 5, maxUses: 5, dateGenerated: "2026-07-20" },
  { id: "PIN-102", pinCode: "3319-4820-1102", serialNumber: "SN-2026-002", studentId: "ESS/2026/002", studentName: "Chioma Nwosu", class: "SSS 2B", session: "2025/2026 - First Term", status: "Used", usesRemaining: 0, maxUses: 5, dateGenerated: "2026-07-21", lastUsedAt: "2026-07-24 14:32" },
  { id: "PIN-103", pinCode: "7712-9041-8833", serialNumber: "SN-2026-003", studentId: "ESS/2026/003", studentName: "Abubakar Ibrahim", class: "JSS 1A", session: "2025/2026 - First Term", status: "Active", usesRemaining: 5, maxUses: 5, dateGenerated: "2026-07-22" },
  { id: "PIN-104", pinCode: "1209-5541-6677", serialNumber: "SN-2026-004", studentId: "ESS/2026/004", studentName: "Grace Okhiria", class: "SSS 3C", session: "2025/2026 - First Term", status: "Active", usesRemaining: 3, maxUses: 5, dateGenerated: "2026-07-22", lastUsedAt: "2026-07-25 09:15" },
  { id: "PIN-105", pinCode: "4481-9920-3311", serialNumber: "SN-2026-005", studentId: "ESS/2026/005", studentName: "David Emmanuel", class: "JSS 3B", session: "2025/2026 - First Term", status: "Active", usesRemaining: 5, maxUses: 5, dateGenerated: "2026-07-23" },
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

export function usePins() {
  const [pins, setPinsState] = useState<PinRecord[]>(() => getStoredPins());

  useEffect(() => {
    saveStoredPins(pins);
  }, [pins]);

  return [pins, setPinsState] as const;
}
