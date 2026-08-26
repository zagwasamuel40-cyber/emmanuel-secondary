import re
import json

with open("jss1_50.json", "r") as f:
    jss1_questions = f.read()

with open("src/data/cbtQuestions.ts", "r") as f:
    content = f.read()

pattern = re.compile(r'"JSS 1": \[\s*\{.*?\}\s*\],', re.DOTALL)
replacement = f'"JSS 1": {jss1_questions},\n'

content = pattern.sub(replacement, content, count=1)

with open("src/data/cbtQuestions.ts", "w") as f:
    f.write(content)
