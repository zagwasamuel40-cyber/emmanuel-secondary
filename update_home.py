import re

with open("src/pages/Home.tsx", "r") as f:
    content = f.read()

import_statement = 'import { usePortalSettings } from "../data/portalSettingsData";\n'
content = content.replace('import { useInquiries } from "../data/inquiriesData";', 'import { useInquiries } from "../data/inquiriesData";\n' + import_statement)

# Add usePortalSettings to Home
content = content.replace(
    'const [news] = useNews();',
    'const [news] = useNews();\n  const [portalSettings] = usePortalSettings();'
)

# Replace the text
content = content.replace(
    'Emmanuel Secondary School, Makurdi provides a world-class educational experience combining academic rigor, moral discipline, and technological innovation.',
    '{portalSettings.schoolName} provides a world-class educational experience combining academic rigor, moral discipline, and technological innovation.'
)
content = content.replace(
    'Why Choose Emmanuel Secondary School?',
    'Why Choose {portalSettings.schoolName}?'
)
content = content.replace(
    'Stay informed about what\'s happening at Emmanuel Secondary School.',
    'Stay informed about what\'s happening at {portalSettings.schoolName}.'
)

with open("src/pages/Home.tsx", "w") as f:
    f.write(content)
