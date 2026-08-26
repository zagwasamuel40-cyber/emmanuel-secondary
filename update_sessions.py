import re
import os

files = [
    "src/pages/Examinations.tsx",
    "src/pages/students/StudentSkills.tsx",
    "src/pages/student/StudentSubjects.tsx",
    "src/pages/Dashboard.tsx"
]

for file in files:
    with open(file, "r") as f:
        content = f.read()

    # Replacements
    content = content.replace(">Session<", ">Academic Session<")
    content = content.replace('"Session"', '"Academic Session"')
    content = content.replace("Create Session", "Create Academic Session")
    content = content.replace("Session Gradebook", "Academic Session Gradebook")
    
    with open(file, "w") as f:
        f.write(content)
