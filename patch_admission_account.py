import re

with open("src/data/portalSettingsData.ts", "r") as f:
    content = f.read()

old_interface = """export interface AdmissionSettings {
  status: string;
  activeSession: string;
  appFee: string;
  acceptanceFee: string;
  entranceExamDate: string;
  closingDate: string;
  passCutoff: number;
  portalOpen: boolean;
}"""

new_interface = """export interface AdmissionSettings {
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
}"""
content = content.replace(old_interface, new_interface)

old_default = """const defaultAdmissionSettings: AdmissionSettings = {
  status: "Open",
  activeSession: "2025/2026",
  appFee: "5000",
  acceptanceFee: "25000",
  entranceExamDate: "2026-08-20",
  closingDate: "2026-08-15",
  passCutoff: 50,
  portalOpen: true
};"""

new_default = """const defaultAdmissionSettings: AdmissionSettings = {
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
};"""
content = content.replace(old_default, new_default)

with open("src/data/portalSettingsData.ts", "w") as f:
    f.write(content)
