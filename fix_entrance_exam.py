import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

# Replace the handleAuth function block to remove setExamQuestionCount
new_handle_auth = """  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.startsWith("APP-")) {
      setErrorMsg("Invalid Application ID. It should start with APP-");
      return;
    }
    
    setErrorMsg("");
    setStep("intro");
  };"""

# regex replace handleAuth block
content = re.sub(r'  const handleAuth = \(e: React\.FormEvent\) => \{.*?    setStep\("intro"\);\n  \};\n', new_handle_auth + "\n", content, flags=re.DOTALL)

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
