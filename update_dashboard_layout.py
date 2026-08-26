import re

with open("src/layouts/DashboardLayout.tsx", "r") as f:
    content = f.read()

import_statement = 'import { usePortalSettings } from "../data/portalSettingsData";\n'
content = content.replace('import { Input } from "@/src/components/ui";', 'import { Input } from "@/src/components/ui";\n' + import_statement)

# Add usePortalSettings to DashboardLayout
content = content.replace(
    'const role = localStorage.getItem(\'userRole\') || \'admin\';',
    'const role = localStorage.getItem(\'userRole\') || \'admin\';\n  const [portalSettings] = usePortalSettings();'
)

# Replace the sidebar header
content = content.replace(
    '<span className="font-heading font-bold text-white text-base tracking-wide">\n            {isPortalAdmin ? "Portal Administrator" : isSuperAdmin ? "Admission Officer" : isStaff ? "ESSMS Staff" : "ESSMS Admin"}\n          </span>',
    '<div className="flex items-center gap-2">\n            {portalSettings.logoUrl && <img src={portalSettings.logoUrl} alt="School Logo" className="w-8 h-8 rounded-full object-cover" />}\n            <span className="font-heading font-bold text-white text-sm tracking-wide line-clamp-1" title={portalSettings.schoolName}>\n              {portalSettings.schoolName || "Admin Dashboard"}\n            </span>\n          </div>'
)

with open("src/layouts/DashboardLayout.tsx", "w") as f:
    f.write(content)
