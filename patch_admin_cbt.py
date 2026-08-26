import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

# Add import for useCbtQuestions
old_import = 'import { useAdmissionApps } from "../data/studentsData";'
new_import = 'import { useAdmissionApps } from "../data/studentsData";\nimport { useCbtQuestions } from "../data/cbtQuestions";'
content = content.replace(old_import, new_import)

# Update hooks inside AdmissionsManagement component
old_hooks = """  const [admissionSettings, setAdmissionSettings] = useAdmissionSettings();
  const [portalSettings] = usePortalSettings();
  
  const [apps, setApps] = useAdmissionApps();"""

new_hooks = """  const [admissionSettings, setAdmissionSettings] = useAdmissionSettings();
  const [portalSettings] = usePortalSettings();
  const [questionsByClass, updateQuestionsForClass] = useCbtQuestions();
  
  const [apps, setApps] = useAdmissionApps();"""
content = content.replace(old_hooks, new_hooks)

# Replace handleUploadCbt
old_handle_upload = """  const handleUploadCbt = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setToastMsg(`File "${file.name}" uploaded successfully for ${cbtClass} (${cbtSession} - ${cbtTerm}).`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };"""

new_handle_upload = """  const handleUploadCbt = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const rows = text.split('\\n').filter(row => row.trim() !== '');
          // Skip header row
          const questionRows = rows.slice(1);
          
          if (questionRows.length > 0) {
            const parsedQuestions = questionRows.map((row, index) => {
              // Simple CSV split (not handling quotes, just basic comma separation)
              const columns = row.split(',');
              return {
                id: index + 1,
                text: columns[0] || `Question ${index + 1}`,
                options: [
                  columns[1] || 'Option A',
                  columns[2] || 'Option B',
                  columns[3] || 'Option C',
                  columns[4] || 'Option D'
                ],
                answer: columns[5]?.trim() || (columns[1] || 'Option A'),
                subject: 'General Knowledge'
              };
            });
            
            updateQuestionsForClass(cbtClass, parsedQuestions);
            
            setToastMsg(`Successfully imported ${parsedQuestions.length} questions for ${cbtClass}.`);
            setTimeout(() => setToastMsg(null), 3000);
          }
        } catch (error) {
          console.error("Error parsing CBT file", error);
          setToastMsg(`Failed to parse file. Please use the correct CSV format.`);
          setTimeout(() => setToastMsg(null), 3000);
        }
      };
      
      reader.readAsText(file);
    }
  };"""

content = content.replace(old_handle_upload, new_handle_upload)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
