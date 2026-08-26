import re

def fix_initial(filepath):
    with open(filepath, "r") as f:
        content = f.read()
    
    content = content.replace('useState("2025/2026")', 'useState(() => sessions[1] || sessions[0] || "2025/2026")')
    
    with open(filepath, "w") as f:
        f.write(content)

fix_initial("src/pages/Dashboard.tsx")
fix_initial("src/pages/Examinations.tsx")
fix_initial("src/pages/student/StudentSubjects.tsx") # Wait, StudentSubjects uses resSession, I already fixed it to sessions[1] I think, let's just let it run.

