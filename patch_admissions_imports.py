import re

with open("src/pages/public/Admissions.tsx", "r") as f:
    content = f.read()

old_import = 'import { UploadCloud, FileText, CheckCircle2, Trash2, ShieldAlert, Award, FileCheck } from "lucide-react";'
new_import = 'import { UploadCloud, FileText, CheckCircle2, Trash2, ShieldAlert, Award, FileCheck, Search } from "lucide-react";\nimport { Link } from "react-router-dom";'

content = content.replace(old_import, new_import)

with open("src/pages/public/Admissions.tsx", "w") as f:
    f.write(content)
