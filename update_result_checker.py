import re

with open("src/pages/public/ResultChecker.tsx", "r") as f:
    content = f.read()

import_statement = 'import { usePortalSettings } from "../../data/portalSettingsData";\n'
content = content.replace('import { useScores, ScoreRecord } from "../../data/scoresData";', 'import { useScores, ScoreRecord } from "../../data/scoresData";\n' + import_statement)

# Add usePortalSettings to ResultChecker
content = content.replace(
    'const [scoreRecords] = useScores();',
    'const [scoreRecords] = useScores();\n  const [portalSettings] = usePortalSettings();'
)

# Replace the logo image
content = content.replace(
    '<div className="w-20 h-20 bg-brand-900 text-amber-400 rounded-xl flex items-center justify-center font-black text-2xl border-2 border-amber-400 shrink-0 shadow-md">\n                      ESS\n                    </div>',
    '<div className="w-20 h-20 bg-brand-900 text-amber-400 rounded-xl flex items-center justify-center font-black text-2xl border-2 border-amber-400 shrink-0 shadow-md overflow-hidden">\n                      {portalSettings.logoUrl ? <img src={portalSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : "ESS"}\n                    </div>'
)

content = content.replace(
    'Official Emmanuel Secondary School portal. Instantly check, verify, and print academic terminal report sheets for all students.',
    'Official {portalSettings.schoolName} portal. Instantly check, verify, and print academic terminal report sheets for all students.'
)

content = content.replace(
    '<h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-950 uppercase font-heading">\n                        Emmanuel Secondary School\n                      </h2>',
    '<h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-950 uppercase font-heading">\n                        {portalSettings.schoolName}\n                      </h2>'
)

content = content.replace(
    'Behind Federal Low Cost, Plot no 1982, Naka Road, Makurdi, Benue State.',
    '{portalSettings.address}'
)

with open("src/pages/public/ResultChecker.tsx", "w") as f:
    f.write(content)
