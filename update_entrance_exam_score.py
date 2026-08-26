import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

# Add useAdmissionApps import
content = content.replace(
    'import { CLASSES } from "../../data/studentsData";',
    'import { CLASSES, useAdmissionApps } from "../../data/studentsData";'
)

# Add useAdmissionApps hook
hook_insert = '  const [portalSettings] = usePortalSettings();\n  const [apps, setApps] = useAdmissionApps();'
content = content.replace(
    '  const [portalSettings] = usePortalSettings();',
    hook_insert
)

# Update handleSubmit
handle_submit_old = r'    setScore\(calculatedScore\);\n    setStep\("result"\);'
handle_submit_new = """    setScore(calculatedScore);
    
    // Update the applicant's score in the global apps state
    setApps(prev => prev.map(app => 
      app.id === appId 
        ? { ...app, examScore: calculatedScore, examStatus: calculatedScore >= 50 ? 'Passed' : 'Failed' } 
        : app
    ));

    setStep("result");"""

content = re.sub(handle_submit_old, handle_submit_new, content)

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
