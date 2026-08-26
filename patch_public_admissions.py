import re

with open("src/pages/public/Admissions.tsx", "r") as f:
    content = f.read()

# Replace the portalSettingsData import to include useAdmissionSettings
old_import = 'import { usePortalSettings } from "../../data/portalSettingsData";'
new_import = 'import { usePortalSettings, useAdmissionSettings } from "../../data/portalSettingsData";'
content = content.replace(old_import, new_import)

# Hook invocation
old_hooks = """  const [admissionApps, setAdmissionApps] = useAdmissionApps();
  const [portalSettings] = usePortalSettings();"""
new_hooks = """  const [admissionApps, setAdmissionApps] = useAdmissionApps();
  const [portalSettings] = usePortalSettings();
  const [admissionSettings] = useAdmissionSettings();"""
content = content.replace(old_hooks, new_hooks)

# Hardcoded 5,000s
old_fee1 = 'A non-refundable application fee of ₦5,000 is required to process your admission.'
new_fee1 = 'A non-refundable application fee of ₦{parseInt(admissionSettings.appFee || "5000").toLocaleString()} is required to process your admission.'
content = content.replace(old_fee1, new_fee1)

old_fee2 = '<p className="text-2xl font-black text-brand-700">₦5,000.00</p>'
new_fee2 = '<p className="text-2xl font-black text-brand-700">₦{parseInt(admissionSettings.appFee || "5000").toLocaleString()}.00</p>'
content = content.replace(old_fee2, new_fee2)

with open("src/pages/public/Admissions.tsx", "w") as f:
    f.write(content)
