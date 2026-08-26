import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

content = content.replace("at Emmanuel Secondary School for the", "at {portalSettings.schoolName} for the")
content = content.replace("admission into Emmanuel Secondary School!", "admission into {portalSettings.schoolName}!")

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)

with open("src/pages/public/Admissions.tsx", "r") as f:
    content = f.read()

content = content.replace("enrollment at Emmanuel Secondary School", "enrollment at {portalSettings.schoolName}")

with open("src/pages/public/Admissions.tsx", "w") as f:
    f.write(content)

