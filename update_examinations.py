import re

with open("src/pages/Examinations.tsx", "r") as f:
    content = f.read()

import_statement = 'import { usePortalSettings } from "../data/portalSettingsData";\n'
content = content.replace('import { useSessions, TERMS } from "../data/sessionsData";', 'import { useSessions, TERMS } from "../data/sessionsData";\n' + import_statement)

# Add usePortalSettings to Examinations
content = content.replace(
    'const [results, setResults] = useState<any[]>([]);',
    'const [results, setResults] = useState<any[]>([]);\n  const [portalSettings] = usePortalSettings();'
)

# Replace the logo image
content = content.replace(
    '<img src="https://api.dicebear.com/7.x/initials/svg?seed=ESS" alt="School Badge" className="w-full h-full object-cover" />',
    '<img src={portalSettings.logoUrl} alt="School Badge" className="w-full h-full object-cover" />'
)

# And if schoolName is used:
content = content.replace(
    '<h1 className="text-2xl font-black text-yellow-600 uppercase tracking-wide">Emmanuel Secondary School, Makurdi</h1>',
    '<h1 className="text-2xl font-black text-yellow-600 uppercase tracking-wide">{portalSettings.schoolName}</h1>'
)

content = content.replace(
    '<p className="text-yellow-500 font-bold mt-1 text-sm">Behind Federal Low Cost, Plot no 1982, Naka Road, Makurdi, Benue State.</p>',
    '<p className="text-yellow-500 font-bold mt-1 text-sm">{portalSettings.address}</p>'
)

content = content.replace(
    '<p className="text-yellow-500 font-bold text-sm">Phone: 07039009964 or 07065166377</p>',
    '<p className="text-yellow-500 font-bold text-sm">Phone: {portalSettings.contactPhone}</p>'
)

with open("src/pages/Examinations.tsx", "w") as f:
    f.write(content)
