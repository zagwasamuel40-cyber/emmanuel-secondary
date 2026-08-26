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
  aboutUsImageUrl?: string;
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
  aboutUsText?: string;
}"""

content = content.replace(old_interface, new_interface)

old_default = """  aboutUsImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
};"""

new_default = """  aboutUsImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  aboutUsText: "Founded with a vision to provide world-class education in Makurdi, Benue State, we are dedicated to raising a generation of intellectually sound, morally upright, and socially responsible leaders."
};"""

content = content.replace(old_default, new_default)

with open("src/data/portalSettingsData.ts", "w") as f:
    f.write(content)
