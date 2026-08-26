import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

if "const activeQuestions =" not in content:
    content = content.replace(
        "const classes = CLASSES;",
        "const classes = CLASSES;\n  const activeQuestions = questions.slice(0, examQuestionCount);"
    )

content = content.replace('if (currentQIndex < questions.length - 1)', 'if (currentQIndex < activeQuestions.length - 1)')

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
