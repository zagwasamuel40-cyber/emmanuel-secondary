import re

with open("src/pages/student/StudentSubjects.tsx", "r") as f:
    content = f.read()

import_statement = 'import { useSessions } from "../../data/sessionsData";\n'
if 'import { useSessions }' not in content:
    content = content.replace('import { useStudents }', import_statement + 'import { useStudents }')

if 'const [sessions] = useSessions();' not in content:
    content = content.replace('const [resSession, setResSession] = useState("2025/2026");', 'const [sessions] = useSessions();\n  const [resSession, setResSession] = useState(sessions[1] || "2025/2026");')

options = '''<option value="2025/2026">2025/2026 Session</option>
                <option value="2026/2027">2026/2027 Session</option>'''
new_options = '{sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}'

content = content.replace(options, new_options)

with open("src/pages/student/StudentSubjects.tsx", "w") as f:
    f.write(content)
