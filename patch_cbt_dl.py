import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

old_dl = """  const handleDownloadCbt = () => {
    const csvContent = "Question,Option A,Option B,Option C,Option D,Correct Answer\\nWhat is the capital of France?,Berlin,Madrid,Paris,Rome,C\\nWhat is 2+2?,3,4,5,6,B";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `entrance_cbt_${cbtClass.replace(/\\s+/g, '_')}_${cbtSession.replace('/', '_')}_${cbtTerm.replace(/\\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToastMsg(`CBT questions for ${cbtClass} downloaded.`);
    setTimeout(() => setToastMsg(null), 3000);
  };"""

new_dl = """  const handleDownloadCbt = () => {
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

content = content.replace(old_dl, new_dl)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
