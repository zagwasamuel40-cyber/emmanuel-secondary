import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

import_statement = 'import { usePortalSettings } from "../data/portalSettingsData";\n'
content = content.replace('import { useInquiries } from "../data/inquiriesData";', 'import { useInquiries } from "../data/inquiriesData";\n' + import_statement)

# Add usePortalSettings to AdmissionsManagement
content = content.replace(
    'const [inquiries, setInquiries] = useInquiries();',
    'const [inquiries, setInquiries] = useInquiries();\n  const [portalSettings] = usePortalSettings();'
)

# Replace the logo image
content = content.replace(
    '<img src="https://api.dicebear.com/7.x/initials/svg?seed=ESS" alt="Logo" className="w-full h-full" />',
    '<img src={portalSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />'
)

content = content.replace(
    '<h2 className="font-heading text-2xl font-black text-slate-900">EMMANUEL SECONDARY SCHOOL</h2>',
    '<h2 className="font-heading text-2xl font-black text-slate-900 uppercase">{portalSettings.schoolName}</h2>'
)

content = content.replace(
    '<p className="text-xs text-slate-400">P.O. Box 1024, Makurdi, Benue State &bull; admissions@ess.edu.ng</p>',
    '<p className="text-xs text-slate-400">{portalSettings.address} &bull; {portalSettings.contactEmail}</p>'
)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
