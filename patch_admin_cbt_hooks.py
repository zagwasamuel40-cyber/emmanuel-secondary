import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

# Add import
old_import = 'import { usePortalSettings, useAdmissionSettings } from "../data/portalSettingsData";'
new_import = 'import { usePortalSettings, useAdmissionSettings } from "../data/portalSettingsData";\nimport { useCbtQuestions } from "../data/cbtQuestions";'
content = content.replace(old_import, new_import)

# Add hook
old_hook = '  const [portalSettings] = usePortalSettings();'
new_hook = '  const [portalSettings] = usePortalSettings();\n  const [, updateQuestionsForClass] = useCbtQuestions();'
content = content.replace(old_hook, new_hook)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
