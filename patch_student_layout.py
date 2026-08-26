import re

with open("src/layouts/StudentLayout.tsx", "r") as f:
    content = f.read()

if 'useStudents' not in content:
    content = content.replace(
        'import { Outlet, Link, useLocation } from "react-router-dom";',
        'import { Outlet, Link, useLocation } from "react-router-dom";\nimport { useState, useEffect } from "react";\nimport { useStudents } from "../data/studentsData";'
    )

old_header_start = """export default function StudentLayout() {
  const location = useLocation();"""

new_header_start = """export default function StudentLayout() {
  const location = useLocation();
  const [students] = useStudents();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const loggedInId = localStorage.getItem('loggedInStudentId');
    if (loggedInId) {
      const found = students.find(s => s.id === loggedInId || s.name.toLowerCase().includes(loggedInId.toLowerCase()));
      if (found) setStudent(found);
      else setStudent(students[0]);
    } else {
      setStudent(students[0]);
    }
  }, [students]);"""

content = content.replace(old_header_start, new_header_start)

old_header_content = """            <div className="font-medium text-slate-900">
              Welcome back, Samuel
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm">
              SJ
            </div>"""

new_header_content = """            <div className="font-medium text-slate-900">
              Welcome back, {student?.name?.split(' ')[0] || "Student"}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm overflow-hidden">
              {student?.passportUrl ? (
                <img src={student.passportUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                student?.name?.charAt(0) || "S"
              )}
            </div>"""

content = content.replace(old_header_content, new_header_content)

with open("src/layouts/StudentLayout.tsx", "w") as f:
    f.write(content)
