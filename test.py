with open("src/pages/student/StudentSubjects.tsx", "r") as f:
    text = f.read()

import re
match = re.search(r'<CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 rounded-t-xl">\s*<CardTitle>My Assignments</CardTitle>\s*</CardHeader>.*?</CardContent>', text, re.DOTALL)
print("Found:" if match else "Not found")
