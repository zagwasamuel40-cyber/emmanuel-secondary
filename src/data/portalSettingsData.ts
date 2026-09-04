import { useState, useEffect } from "react";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  qualification?: string;
  experienceYears?: string;
  photoUrl: string;
  bio?: string;
  published?: boolean;
  displayOrder?: number;
}

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
  dedicatedTeam: TeamMember[];
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
  aboutUsText: "Founded with a vision to provide world-class education in Makurdi, Benue State, we are dedicated to raising a generation of intellectually sound, morally upright, and socially responsible leaders.",
  dedicatedTeam: [
    {
      id: "1",
      name: "Dr. A. O. Terungwa",
      role: "Principal",
      department: "Administration",
      qualification: "Ph.D. Educational Leadership",
      experienceYears: "15",
      photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
      bio: "Committed to excellence in education and moral discipline.",
      published: true,
      displayOrder: 1
    }
  ]
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
  guidelines: string;
  galleryImages: string[];
  imageRotationInterval: number;
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
  accountNumber: "0123456789",
  guidelines: `ADMISSION APPLICATION GUIDELINES\n\nDear Applicant,\n\nPlease follow the instructions below carefully when applying for admission:\n\n### 1. Complete Your Registration Carefully\nFill in all required information correctly. Make sure your name, date of birth, contact details, academic information, and other details are accurate before submitting your application.\n\n### 2. Save Your Application Code\nAfter completing your registration, **save or write down your Application Code/Number and password**. You will need these details to log in, check your application status, access your examination information, and continue with the admission process.\n\n### 3. Check Your Information\nBefore submitting your application, carefully review all the information you entered. **Incorrect or false information may lead to the rejection of your application.**\n\n### 4. Upload the Correct Documents\nMake sure all required documents are clear, valid, and correctly uploaded. Do not upload the wrong document or someone else's document. Incorrect or incomplete documentation may result in **admission rejection**.\n\n### 5. Take the CBT Examination\nAfter successful registration, log in to your applicant dashboard and check your **CBT examination date, time, and instructions**. Make sure you sit for the examination as scheduled.\n\n### 6. Keep Your Login Details Safe\nDo not share your Application Code, password, or other login details with anyone. Keep them safe for future use.\n\n### 7. Check Your Admission Status\nAfter completing your registration and CBT examination, regularly log in to your applicant dashboard to check for updates concerning your admission status.\n\n---\n\n## IMPORTANT NOTICE\n\nApplicants are advised to carefully verify all information and documents before submitting their application. The institution will not be responsible for errors caused by applicants during registration.\n\n**Incorrect information, invalid documents, or failure to follow the admission instructions may result in the rejection of your application.**\n\n**Good luck with your application and CBT examination!**`,
  galleryImages: [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
    "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&q=80",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80"
  ],
  imageRotationInterval: 2
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
