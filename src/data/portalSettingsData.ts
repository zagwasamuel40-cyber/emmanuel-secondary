import { useState, useEffect } from "react";

export interface PortalSettings {
  schoolName: string;
  motto: string;
  primaryColor: string;
  accentColor: string;
  themePreset: "navy" | "emerald" | "purple" | "amber" | "slate" | "crimson";
  logoUrl: string;
  welcomeBanner: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  address: string;
  portalNotice: string;
  admissionOfficerName: string;
  principalName: string;
  principalSignatureUrl: string;
  aboutUsImageUrl?: string;
  aboutUsText?: string;
}

const defaultPortalSettings: PortalSettings = {
  schoolName: "EMMANUEL SECONDARY SCHOOL, MAKURDI",
  motto: "Excellence, Knowledge & Moral Discipline",
  primaryColor: "#0f172a",
  accentColor: "#f59e0b",
  themePreset: "navy",
  logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80",
  welcomeBanner: "Welcome to Emmanuel Secondary School Official Student & Administration Portal",
  contactPhone: "07039009964 or 07065166377",
  contactEmail: "info@ess.edu.ng",
  website: "https://emmanuelschoolsmkd.com/",
  address: "Behind Federal Low Cost, Naka Road, Makurdi Benue State.",
  portalNotice: "2026/2027 Entrance Examinations & First Term Portal Registration is now open!",
  admissionOfficerName: "Dr. A. O. Terungwa",
  principalName: "IORTYER EMMANUEL",
  principalSignatureUrl: "",
  aboutUsImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  aboutUsText: "Founded with a vision to provide world-class education in Makurdi, Benue State, we are dedicated to raising a generation of intellectually sound, morally upright, and socially responsible leaders."
};

export function usePortalSettings() {
  const [settings, setSettings] = useState<PortalSettings>(() => {
    const saved = localStorage.getItem("ess_portal_settings");
    if (saved) {
      try {
        return { ...defaultPortalSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse saved portal settings", e);
      }
    }
    return defaultPortalSettings;
  });

  useEffect(() => {
    localStorage.setItem("ess_portal_settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (partial: Partial<PortalSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  return [settings, updateSettings] as const;
}

export interface AdmissionSettings {
  status: string;
  activeSession: string;
  appFee: string;
  acceptanceFee: string;
  entranceExamDate: string;
  closingDate: string;
  passCutoff: number;
  portalOpen: boolean;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

const defaultAdmissionSettings: AdmissionSettings = {
  status: "Open",
  activeSession: "2025/2026",
  appFee: "5000",
  acceptanceFee: "25000",
  entranceExamDate: "2026-08-20",
  closingDate: "2026-08-15",
  passCutoff: 50,
  portalOpen: true,
  bankName: "Guaranty Trust Bank (GTB)",
  accountName: "Emmanuel Secondary School",
  accountNumber: "0123456789"
};

export function useAdmissionSettings() {
  const [settings, setSettings] = useState<AdmissionSettings>(() => {
    const saved = localStorage.getItem("ess_admission_settings");
    if (saved) {
      try {
        return { ...defaultAdmissionSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse saved admission settings", e);
      }
    }
    return defaultAdmissionSettings;
  });

  useEffect(() => {
    localStorage.setItem("ess_admission_settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (partial: Partial<AdmissionSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  return [settings, updateSettings] as const;
}
