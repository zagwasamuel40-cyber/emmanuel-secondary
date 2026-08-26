import re

with open("src/pages/Teachers.tsx", "r") as f:
    content = f.read()

# 1. Update Interface
content = re.sub(r'isAdmin\?:\s*boolean;', r"systemRole?: 'Teacher' | 'Admin' | 'Admission Officer' | 'Portal Admin' | 'Super Admin';", content)

# 2. Update initialTeachers
content = re.sub(r'isAdmin:\s*true', r"systemRole: 'Admin'", content)
content = re.sub(r'isAdmin:\s*false', r"systemRole: 'Teacher'", content)

# 3. Update active modal / form state
content = re.sub(r'const \[createStaffForm, setCreateStaffForm\] = useState\(\{([\s\S]*?)isAdmin: false,', r'const [createStaffForm, setCreateStaffForm] = useState({\1systemRole: "Teacher",', content)

# Write back
with open("src/pages/Teachers.tsx", "w") as f:
    f.write(content)
