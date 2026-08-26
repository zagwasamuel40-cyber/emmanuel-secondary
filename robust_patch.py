import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

# Replace the questions array with dynamic hook
# The array starts at `const questions = [` and ends at `];` before `const handleAuth = (e: React.FormEvent) => {`
pattern = re.compile(r'const questions = \[\s*\{.*?\n\];', re.DOTALL)

new_questions = """const [questionsByClass] = useCbtQuestions();
  const questions = questionsByClass[selectedClass] || questionsByClass["JSS 1"] || [];"""

content = pattern.sub(new_questions, content)

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
