import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

if 'Edit2' not in content[:2000]:
    content = content.replace('MessageSquare\n} from "lucide-react";', 'MessageSquare,\n  Edit2,\n  Save\n} from "lucide-react";')

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
