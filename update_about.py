import re

with open("src/pages/public/About.tsx", "r") as f:
    content = f.read()

if "usePortalSettings" not in content[:300]:
    content = 'import { usePortalSettings } from "../../data/portalSettingsData";\n' + content

with open("src/pages/public/About.tsx", "w") as f:
    f.write(content)

with open("src/pages/public/News.tsx", "r") as f:
    content = f.read()

if "usePortalSettings" not in content[:300]:
    content = 'import { usePortalSettings } from "../../data/portalSettingsData";\n' + content
    
with open("src/pages/public/News.tsx", "w") as f:
    f.write(content)

with open("src/pages/public/ResultChecker.tsx", "r") as f:
    content = f.read()

if "usePortalSettings" not in content[:300]:
    content = 'import { usePortalSettings } from "../../data/portalSettingsData";\n' + content
    
with open("src/pages/public/ResultChecker.tsx", "w") as f:
    f.write(content)
