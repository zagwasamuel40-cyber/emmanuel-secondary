import re

with open('src/pages/StudentPortalManager.tsx', 'r') as f:
    content = f.read()

# 1. Update import
content = content.replace(
    'import { useAdmissionApps } from "../data/studentsData";',
    'import { useAdmissionApps, useStudents } from "../data/studentsData";'
)

# 2. Add useStudents hook
content = content.replace(
    '  const [admissionApps, setAdmissionApps] = useAdmissionApps();',
    '  const [admissionApps, setAdmissionApps] = useAdmissionApps();\n  const [students, setStudents] = useStudents();'
)

# 3. Update the Approve logic
approve_logic_old = """                              onClick={() => {
                                setAdmissionApps(prev => prev.map(a => a.id === app.id ? {...a, status: 'Approved'} : a));
                                setSuccessMsg("Application Approved.");
                                setTimeout(() => setSuccessMsg(""), 3500);
                              }}"""

approve_logic_new = """                              onClick={() => {
                                setAdmissionApps(prev => prev.map(a => a.id === app.id ? {...a, status: 'Approved'} : a));
                                // Add to students
                                const newStudent = {
                                  id: `ESS/${new Date().getFullYear()}/${String(students.length + 1).padStart(3, '0')}`,
                                  name: app.name,
                                  class: app.assignedClass || app.class,
                                  previousClass: "Newly Admitted",
                                  gender: "Not Specified",
                                  status: "Active",
                                  fees: "Paid",
                                  email: app.email || `${app.name.toLowerCase().replace(/\s+/g, '.')}@student.ess.edu.ng`,
                                  parentNumber: app.phone,
                                  address: "Not Specified",
                                  password: "password123",
                                  enrollmentStatus: "Newly Enrolled"
                                };
                                setStudents((prev: any[]) => [...prev, newStudent]);
                                setSuccessMsg("Application Approved and Student Registered.");
                                setTimeout(() => setSuccessMsg(""), 3500);
                              }}"""

content = content.replace(approve_logic_old, approve_logic_new)

with open('src/pages/StudentPortalManager.tsx', 'w') as f:
    f.write(content)
