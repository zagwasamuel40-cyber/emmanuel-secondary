import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

old_gen = """  const handleGenerateCbt = () => {
    setToastMsg(`Successfully generated ${cbtQuestionCount} CBT questions for ${cbtClass} (${cbtSession} - ${cbtTerm}).`);
    setTimeout(() => setToastMsg(null), 3000);
  };"""

new_gen = """  const handleGenerateCbt = () => {
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

content = content.replace(old_gen, new_gen)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
