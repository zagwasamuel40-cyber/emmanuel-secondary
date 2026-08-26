import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '{Math.min(examQuestionCount, questions.length) * 2}',
    '{questions.length * 2}'
)

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
