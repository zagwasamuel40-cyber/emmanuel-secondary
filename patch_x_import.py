import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

content = content.replace("  MessageSquare,", "  MessageSquare,\n  X,")

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
