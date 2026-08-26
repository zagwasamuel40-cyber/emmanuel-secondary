import re

with open("src/pages/public/About.tsx", "r") as f:
    content = f.read()

if 'import { usePortalSettings }' not in content:
    content = 'import { usePortalSettings } from "../../data/portalSettingsData";\n' + content

with open("src/pages/public/About.tsx", "w") as f:
    f.write(content)

