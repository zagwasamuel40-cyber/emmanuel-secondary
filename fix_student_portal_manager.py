import re

with open("src/pages/StudentPortalManager.tsx", "r") as f:
    content = f.read()

import_statement = 'import { useSessions } from "../data/sessionsData";\n'
if 'import { useSessions }' not in content:
    content = content.replace('import { usePortalSettings, PortalSettings } from "../data/portalSettingsData";', import_statement + 'import { usePortalSettings, PortalSettings } from "../data/portalSettingsData";')

if 'const [sessions, , currentSession]' not in content:
    content = content.replace('const [releaseMap, updateRelease] = useResultsRelease();', 'const [releaseMap, updateRelease] = useResultsRelease();\n  const [sessions, , currentSession] = useSessions();')

content = content.replace('isResultReleased("2025/2026", "First Term")', 'isResultReleased(currentSession || "2025/2026", "First Term")')
content = content.replace('updateRelease("2025/2026", "First Term", "All Classes")', 'updateRelease(currentSession || "2025/2026", "First Term", "All Classes")')

with open("src/pages/StudentPortalManager.tsx", "w") as f:
    f.write(content)

