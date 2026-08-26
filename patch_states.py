import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

content = content.replace("  const [showNewAppModal, setShowNewAppModal] = useState(false);", "  const [showNewAppModal, setShowNewAppModal] = useState(false);\n  const [previewDocument, setPreviewDocument] = useState<{ url: string; title: string } | null>(null);")

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)

with open("src/pages/Profile.tsx", "r") as f:
    content = f.read()

content = content.replace("  const [successMsg, setSuccessMsg] = useState(\"\");", "  const [successMsg, setSuccessMsg] = useState(\"\");\n  const [passwordForm, setPasswordForm] = useState({ current: \"\", new: \"\", confirm: \"\" });")

with open("src/pages/Profile.tsx", "w") as f:
    f.write(content)
