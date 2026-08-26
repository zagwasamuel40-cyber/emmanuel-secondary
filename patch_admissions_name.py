import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '<div className="font-serif italic text-base font-bold text-slate-900">Dr. A. O. Terungwa</div>',
    '<div className="font-serif italic text-base font-bold text-slate-900">{portalSettings.admissionOfficerName || "Dr. A. O. Terungwa"}</div>'
)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
