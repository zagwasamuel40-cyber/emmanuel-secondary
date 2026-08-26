import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

handle_auth_old = r'  const handleAuth = \(e: React\.FormEvent\) => \{\n    e\.preventDefault\(\);\n    if \(\!appId\.startsWith\("APP-"\)\) \{\n      setErrorMsg\("Invalid Application ID\. It should start with APP-"\);\n      return;\n    \}\n    \n    setErrorMsg\(""\);\n    setStep\("intro"\);\n  \};'

handle_auth_new = """  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.startsWith("APP-")) {
      setErrorMsg("Invalid Application ID. It should start with APP-");
      return;
    }
    
    const appExists = apps.find(a => a.id === appId);
    if (!appExists) {
      setErrorMsg("Application ID not found. Please check and try again.");
      return;
    }
    
    setErrorMsg("");
    setStep("intro");
  };"""

content = re.sub(handle_auth_old, handle_auth_new, content)

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
