import re

with open("src/pages/public/Admissions.tsx", "r") as f:
    content = f.read()

import_statement = 'import { usePortalSettings } from "../../data/portalSettingsData";\n'
content = content.replace('import { useAdmissionApps } from "../../data/studentsData";', 'import { useAdmissionApps } from "../../data/studentsData";\n' + import_statement)

# Add usePortalSettings to Admissions
content = content.replace(
    'const [admissionApps, setAdmissionApps] = useAdmissionApps();',
    'const [admissionApps, setAdmissionApps] = useAdmissionApps();\n  const [portalSettings] = usePortalSettings();'
)

# Replace the logo image
content = content.replace(
    '<img src="https://api.dicebear.com/7.x/initials/svg?seed=ESS" alt="Logo" className="w-full h-full" />',
    '<img src={portalSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />'
)

content = content.replace(
    '<h2 className="font-heading text-xl font-bold text-slate-900">Emmanuel Secondary School</h2>',
    '<h2 className="font-heading text-xl font-bold text-slate-900">{portalSettings.schoolName}</h2>'
)

with open("src/pages/public/Admissions.tsx", "w") as f:
    f.write(content)
