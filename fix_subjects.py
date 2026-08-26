import re

files = [
    "src/pages/Examinations.tsx",
    "src/pages/Teachers.tsx"
]

for file in files:
    with open(file, "r") as f:
        content = f.read()

    # We need to revert the SUBJECTS options:
    # {SUBJECTS.filter(s => s !== "All Subjects").map(s => <option key={s} value={s}>{s} Academic Session</option>)}
    # to {SUBJECTS.filter(s => s !== "All Subjects").map(s => <option key={s} value={s}>{s}</option>)}
    content = content.replace('{SUBJECTS.filter(s => s !== "All Subjects").map(s => <option key={s} value={s}>{s} Academic Session</option>)}', '{SUBJECTS.filter(s => s !== "All Subjects").map(s => <option key={s} value={s}>{s}</option>)}')
    
    # {SUBJECTS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
    content = content.replace('{SUBJECTS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}', '{SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}')

    with open(file, "w") as f:
        f.write(content)

