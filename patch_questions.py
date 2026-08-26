import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

# Add activeQuestions
if 'const activeQuestions' not in content:
    content = content.replace(
        '  const classes = CLASSES;',
        '  const classes = CLASSES;\n  const activeQuestions = questions.slice(0, examQuestionCount);'
    )

# Replace remaining questions.length with activeQuestions.length
content = content.replace('questions.length', 'activeQuestions.length')

# Replace questions[currentQIndex] with activeQuestions[currentQIndex]
content = content.replace('questions[currentQIndex]', 'activeQuestions[currentQIndex]')

# In handleNext, handleFinish, check where questions.length is used
old_next = """  const handleNext = () => {
    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };"""

old_finish = """  const handleFinish = () => {
    let currentScore = 0;
    activeQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setStep("result");
  };"""

# Ensure it's correctly updated. Let's see what is inside EntranceExam.tsx
