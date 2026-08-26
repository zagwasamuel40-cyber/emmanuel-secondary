import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

# Replace the portalSettingsData import to include useAdmissionSettings
old_import = 'import { usePortalSettings } from "../data/portalSettingsData";'
new_import = 'import { usePortalSettings, useAdmissionSettings } from "../data/portalSettingsData";'
content = content.replace(old_import, new_import)

# Replace the state initialization
old_state = """  // Settings state
  const [admissionSettings, setAdmissionSettings] = useState({
    activeSession: "2026/2027",
    appFee: "5000",
    acceptanceFee: "15000",
    passCutoff: 50,
    portalOpen: true
  });"""

new_state = """  // Settings state
  const [admissionSettings, updateAdmissionSettings] = useAdmissionSettings();
  const setAdmissionSettings = updateAdmissionSettings;"""

content = content.replace(old_state, new_state)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)

