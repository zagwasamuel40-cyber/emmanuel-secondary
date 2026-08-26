import re

with open("src/pages/public/AdmissionStatus.tsx", "r") as f:
    content = f.read()

old_button = """                        const opt = {
                          margin:       0.5,
                          filename:     `${searchedApp?.name?.replace(/\s+/g, '_')}_Admission_Letter.pdf`,
                          image:        { type: 'jpeg', quality: 0.98 },
                          html2canvas:  { scale: 2, useCORS: true },
                          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
                        };"""

new_button = """                        const opt = {
                          margin:       0.5,
                          filename:     `${searchedApp?.name?.replace(/\\s+/g, '_')}_Admission_Letter.pdf`,
                          image:        { type: 'jpeg' as const, quality: 0.98 },
                          html2canvas:  { scale: 2, useCORS: true },
                          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
                        };"""

content = content.replace(old_button, new_button)

with open("src/pages/public/AdmissionStatus.tsx", "w") as f:
    f.write(content)
