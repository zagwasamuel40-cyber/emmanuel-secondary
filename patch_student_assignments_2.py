import re

with open("src/pages/student/StudentSubjects.tsx", "r") as f:
    content = f.read()

content = content.replace("student?.id", "currentStudent?.id")
content = content.replace("student?.name", "currentStudent?.name")
content = content.replace("student?.class", "currentStudent?.class")

with open("src/pages/student/StudentSubjects.tsx", "w") as f:
    f.write(content)
