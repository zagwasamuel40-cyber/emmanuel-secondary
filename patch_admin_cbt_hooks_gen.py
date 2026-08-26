import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

# Add isGeneratingCbt state
old_state = '  const [cbtQuestionCount, setCbtQuestionCount] = useState<number>(50);'
new_state = '  const [cbtQuestionCount, setCbtQuestionCount] = useState<number>(50);\n  const [isGeneratingCbt, setIsGeneratingCbt] = useState(false);'
content = content.replace(old_state, new_state)

old_generate = """  const handleGenerateCbt = () => {
    // Save to local storage for the student portal to use
    const cbtConfig = {
      class: cbtClass,
      session: cbtSession,
      term: cbtTerm,
      questionCount: cbtQuestionCount
    };
    const key = `cbt_config_${cbtClass}_${cbtSession}_${cbtTerm}`;
    localStorage.setItem(key, JSON.stringify(cbtConfig));

    setToastMsg(`Successfully generated ${cbtQuestionCount} CBT questions for ${cbtClass} (${cbtSession} - ${cbtTerm}).`);
    setTimeout(() => setToastMsg(null), 3000);
  };"""

new_generate = """  const handleGenerateCbt = async () => {
    setIsGeneratingCbt(true);
    setToastMsg(`Generating ${cbtQuestionCount} AI questions for ${cbtClass}... This may take a moment.`);
    
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          className: cbtClass,
          count: cbtQuestionCount
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }
      
      if (data.questions && Array.isArray(data.questions)) {
        // Map to format with unique IDs
        const formattedQuestions = data.questions.map((q: any, i: number) => ({
          id: i + 1,
          text: q.text,
          options: q.options || ["Option A", "Option B", "Option C", "Option D"],
          answer: q.answer,
          subject: q.subject || "General Knowledge"
        }));
        
        updateQuestionsForClass(cbtClass, formattedQuestions);
        
        // Save config
        const cbtConfig = {
          class: cbtClass,
          session: cbtSession,
          term: cbtTerm,
          questionCount: formattedQuestions.length
        };
        const key = `cbt_config_${cbtClass}_${cbtSession}_${cbtTerm}`;
        localStorage.setItem(key, JSON.stringify(cbtConfig));

        setToastMsg(`Successfully generated ${formattedQuestions.length} AI CBT questions for ${cbtClass}!`);
      } else {
        throw new Error("Invalid format received from server");
      }
    } catch (err: any) {
      console.error(err);
      setToastMsg(`Error: ${err.message}. Make sure GEMINI_API_KEY is configured.`);
    } finally {
      setTimeout(() => setToastMsg(null), 5000);
      setIsGeneratingCbt(false);
    }
  };"""

content = content.replace(old_generate, new_generate)

old_download = """  const handleDownloadCbt = () => {
    let csvContent = "Question,Option A,Option B,Option C,Option D,Correct Answer\\n";
    for (let i = 1; i <= cbtQuestionCount; i++) {
      csvContent += `Sample Question ${i} for ${cbtClass} (${cbtSession} - ${cbtTerm})?,Option A,Option B,Option C,Option D,A\\n`;
    }
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `entrance_cbt_${cbtClass.replace(/\\s+/g, '_')}_${cbtSession.replace('/', '_')}_${cbtTerm.replace(/\\s+/g, '_')}_${cbtQuestionCount}Qs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToastMsg(`Downloaded ${cbtQuestionCount} CBT questions for ${cbtClass}.`);
    setTimeout(() => setToastMsg(null), 3000);
  };"""

new_download = """  const handleDownloadCbt = () => {
    const questions = questionsByClass[cbtClass] || [];
    if (questions.length === 0) {
      setToastMsg(`No questions available for ${cbtClass}. Generate or upload some first.`);
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    let textContent = `Entrance Examination Questions - ${cbtClass}\\nSession: ${cbtSession} | Term: ${cbtTerm}\\n\\n`;
    
    questions.forEach((q, index) => {
      textContent += `${index + 1}. ${q.text}\\n`;
      const optionLabels = ['A', 'B', 'C', 'D', 'E'];
      q.options.forEach((opt: string, optIdx: number) => {
        textContent += `${optionLabels[optIdx] || '*'}. ${opt}\\n`;
      });
      textContent += `Correct Answer: ${q.answer}\\n\\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `entrance_cbt_${cbtClass.replace(/\\s+/g, '_')}_${questions.length}Qs.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToastMsg(`Downloaded ${questions.length} CBT questions for ${cbtClass}.`);
    setTimeout(() => setToastMsg(null), 3000);
  };"""

content = content.replace(old_download, new_download)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
