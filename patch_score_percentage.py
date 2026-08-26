import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

# Update handleSubmit
old_score_logic = r'    let calculatedScore = 0;\n    questions\.forEach\(\(q, idx\) => \{\n      if \(selectedAnswers\[idx\] === q\.answer\) \{\n        calculatedScore \+= 2; // 2 marks per question \(50 questions = 100 total\)\n      \}\n    \}\);\n    setScore\(calculatedScore\);\n    \n    // Update the applicant\'s score in the global apps state\n    setApps\(prev => prev\.map\(app => \n      app\.id === appId \n        \? \{ \.\.\.app, examScore: calculatedScore, examStatus: calculatedScore >= 50 \? \'Passed\' : \'Failed\' \} \n        : app\n    \)\);'

new_score_logic = """    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        calculatedScore += 2; // 2 marks per question
      }
    });
    setScore(calculatedScore);
    
    // Update the applicant's score in the global apps state (as a percentage)
    const percentageScore = questions.length > 0 ? Math.round((calculatedScore / (questions.length * 2)) * 100) : 0;
    
    setApps(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, examScore: percentageScore, examStatus: percentageScore >= 50 ? 'Passed' : 'Failed' } 
        : app
    ));"""

content = re.sub(old_score_logic, new_score_logic, content)

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
