import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

# Remove unused states/functions
content = re.sub(r'  const \[currentQIndex, setCurrentQIndex\] = useState\(0\);\n', '', content)

handle_next_prev = r'  const handleNext = \(\) => \{\n    if \(currentQIndex < activeQuestions\.length - 1\) \{\n      setCurrentQIndex\(prev => prev \+ 1\);\n    \}\n  \};\n\n  const handlePrev = \(\) => \{\n    if \(currentQIndex > 0\) \{\n      setCurrentQIndex\(prev => prev - 1\);\n    \}\n  \};\n'
content = re.sub(handle_next_prev, '', content)

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
