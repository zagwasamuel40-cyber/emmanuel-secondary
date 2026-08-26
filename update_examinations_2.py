import re

with open("src/pages/Examinations.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'export default function Examinations() {\n  const isStaff',
    'export default function Examinations() {\n  const [portalSettings] = usePortalSettings();\n  const isStaff'
)

with open("src/pages/Examinations.tsx", "w") as f:
    f.write(content)

