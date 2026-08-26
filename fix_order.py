with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

content = content.replace("  const activeQuestions = questions.slice(0, examQuestionCount);\n", "")

# Add it after questions
questions_end = '    "subject": "General Knowledge"\n  }'
questions_end_full = questions_end + '\n  ];\n'

if questions_end_full in content:
    content = content.replace(
        questions_end_full,
        questions_end_full + '\n  const activeQuestions = questions.slice(0, examQuestionCount);\n'
    )
elif '    "subject": "General Knowledge"\n  }\n];' in content:
    content = content.replace(
        '    "subject": "General Knowledge"\n  }\n];',
        '    "subject": "General Knowledge"\n  }\n];\n  const activeQuestions = questions.slice(0, examQuestionCount);\n'
    )

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
