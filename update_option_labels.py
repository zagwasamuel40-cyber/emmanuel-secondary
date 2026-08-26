import re

files = [
    "src/pages/Examinations.tsx",
    "src/pages/Dashboard.tsx",
    "src/pages/Enrollment.tsx",
    "src/pages/students/StudentSkills.tsx",
    "src/pages/Teachers.tsx"
]

for file in files:
    try:
        with open(file, "r") as f:
            content = f.read()

        # Change `{sessions.map(s => <option key={s} value={s}>{s}</option>)}` 
        # and `{SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}`
        content = re.sub(r'<option key=\{s\} value=\{s\}>\{s\}</option>', r'<option key={s} value={s}>{s} Academic Session</option>', content)
        
        with open(file, "w") as f:
            f.write(content)
    except FileNotFoundError:
        pass
