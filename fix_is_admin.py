import re

with open("src/pages/Teachers.tsx", "r") as f:
    content = f.read()

# Fix createStaffForm assignment in form reset
content = re.sub(
    r'isAdmin:\s*createStaffForm\.isAdmin',
    r'systemRole: createStaffForm.systemRole as any',
    content
)

# Fix badge rendering 1
content = re.sub(
    r'\{currentStaff\.isAdmin && \(',
    r'{currentStaff.systemRole && currentStaff.systemRole !== "Teacher" && (',
    content
)
# Fix badge rendering 2 (admin count)
content = re.sub(
    r'\{teachers\.filter\(t => t\.isAdmin\)\.length\} Admins',
    r'{teachers.filter(t => t.systemRole && t.systemRole !== "Teacher").length} System Staff',
    content
)

# Fix badge rendering 3
content = re.sub(
    r'\{teacher\.isAdmin \? \(',
    r'{teacher.systemRole && teacher.systemRole !== "Teacher" ? (',
    content
)

content = re.sub(
    r'\{t\.isAdmin \? \(',
    r'{t.systemRole && t.systemRole !== "Teacher" ? (',
    content
)

content = re.sub(
    r'\{t\.isAdmin',
    r'{t.systemRole && t.systemRole !== "Teacher"',
    content
)

content = re.sub(
    r'teacher\.isAdmin',
    r'(teacher.systemRole && teacher.systemRole !== "Teacher")',
    content
)

content = re.sub(
    r'currentStaff\.isAdmin',
    r'(currentStaff.systemRole && currentStaff.systemRole !== "Teacher")',
    content
)

# Remove the handleToggleAdminStatus definition and replace it
handle_toggle_re = re.compile(r'// Handler: Toggle Admin Status.*?setTimeout\(\(\) => setNotificationMsg\(""\), 4000\);\n  };', re.DOTALL)
content = handle_toggle_re.sub(r'''
  // Handler: Assign System Role
  const handleAssignRole = (teacherId: string, newRole: string) => {
    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId) {
        setNotificationMsg(`Role updated to ${newRole} for ${t.name}.`);
        return { ...t, systemRole: newRole as any };
      }
      return t;
    }));
    setTimeout(() => setNotificationMsg(""), 4000);
  };
''', content)

with open("src/pages/Teachers.tsx", "w") as f:
    f.write(content)
