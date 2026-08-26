import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

# Add new functions below handleExportCSV
functions_to_add = """  const handleGenerateCbt = () => {
    setToastMsg(`CBT questions for ${cbtClass} (${cbtSession} - ${cbtTerm}) generated successfully.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDownloadCbt = () => {
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
  };

  const handleUploadCbt = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setToastMsg(`File "${file.name}" uploaded successfully for ${cbtClass} (${cbtSession} - ${cbtTerm}).`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

"""

# Insert before 'return ('
content = content.replace("  return (", functions_to_add + "  return (")

# Update buttons
old_gen = 'onClick={() => alert(`CBT questions for ${cbtClass} (${cbtSession} - ${cbtTerm}) generated successfully.`)}'
new_gen = 'onClick={handleGenerateCbt}'
content = content.replace(old_gen, new_gen)

old_up = 'onChange={() => alert(`Questions for ${cbtClass} (${cbtSession} - ${cbtTerm}) uploaded successfully.`)}'
new_up = 'onChange={handleUploadCbt}'
content = content.replace(old_up, new_up)

old_dl = 'onClick={() => alert(`Downloading CBT questions for ${cbtClass} (${cbtSession} - ${cbtTerm})...`)}'
new_dl = 'onClick={handleDownloadCbt}'
content = content.replace(old_dl, new_dl)


with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
