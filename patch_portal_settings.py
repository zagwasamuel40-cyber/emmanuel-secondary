import re

with open("src/data/portalSettingsData.ts", "r") as f:
    content = f.read()

old_interface = """export interface PortalSettings {
  schoolName: string;
  motto: string;
  primaryColor: string;
  accentColor: string;
  themePreset: "navy" | "emerald" | "purple" | "amber" | "slate" | "crimson";
  logoUrl: string;
  welcomeBanner: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  portalNotice: string;
  admissionOfficerName: string;
  principalName: string;
  principalSignatureUrl: string;
}"""

new_interface = """export interface PortalSettings {
  schoolName: string;
  motto: string;
  primaryColor: string;
  accentColor: string;
  themePreset: "navy" | "emerald" | "purple" | "amber" | "slate" | "crimson";
  logoUrl: string;
  welcomeBanner: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  portalNotice: string;
  admissionOfficerName: string;
  principalName: string;
  principalSignatureUrl: string;
  aboutUsImageUrl?: string;
}"""

content = content.replace(old_interface, new_interface)

old_default = """const defaultPortalSettings: PortalSettings = {
  schoolName: "Emmanuel Secondary School",
  motto: "Excellence, Knowledge & Moral Discipline",
  primaryColor: "#0f172a",
  accentColor: "#f59e0b",
  themePreset: "navy",
  logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80",
  welcomeBanner: "Welcome to Emmanuel Secondary School Official Student & Administration Portal",
  contactPhone: "+234 803 123 4567",
  contactEmail: "info@ess.edu.ng",
  address: "Km 4, Gboko Road, Makurdi, Benue State",
  portalNotice: "2026/2027 Entrance Examinations & First Term Portal Registration is now open!",
  admissionOfficerName: "Dr. A. O. Terungwa",
  principalName: "Mr. J. T. Terna",
  principalSignatureUrl: ""
};"""

new_default = """const defaultPortalSettings: PortalSettings = {
  schoolName: "Emmanuel Secondary School",
  motto: "Excellence, Knowledge & Moral Discipline",
  primaryColor: "#0f172a",
  accentColor: "#f59e0b",
  themePreset: "navy",
  logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80",
  welcomeBanner: "Welcome to Emmanuel Secondary School Official Student & Administration Portal",
  contactPhone: "+234 803 123 4567",
  contactEmail: "info@ess.edu.ng",
  address: "Km 4, Gboko Road, Makurdi, Benue State",
  portalNotice: "2026/2027 Entrance Examinations & First Term Portal Registration is now open!",
  admissionOfficerName: "Dr. A. O. Terungwa",
  principalName: "Mr. J. T. Terna",
  principalSignatureUrl: "",
  aboutUsImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
};"""

content = content.replace(old_default, new_default)

with open("src/data/portalSettingsData.ts", "w") as f:
    f.write(content)
