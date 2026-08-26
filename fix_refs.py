import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

content = content.replace('questions[currentQIndex]', 'activeQuestions[currentQIndex]')

old_finish = """  const handleFinish = () => {
    let currentScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setStep("result");
  };"""

new_finish = """  const handleFinish = () => {
    let currentScore = 0;
    activeQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setStep("result");
  };"""
content = content.replace(old_finish, new_finish)

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
