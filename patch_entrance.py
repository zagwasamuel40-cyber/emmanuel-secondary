import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

# Add imports
imports_to_add = 'import { useSessions, TERMS } from "../../data/sessionsData";\nimport { CLASSES } from "../../data/studentsData";\n'
if 'useSessions' not in content:
    content = content.replace(
        'import { usePortalSettings }', 
        imports_to_add + 'import { usePortalSettings }'
    )

# Add state inside component
state_add = """  const [sessions, , currentSession] = useSessions();
  const [selectedSession, setSelectedSession] = useState(() => currentSession || "2025/2026");
  const [selectedTerm, setSelectedTerm] = useState(TERMS[0]);
  const [examQuestionCount, setExamQuestionCount] = useState(50);
"""
if 'const [selectedSession' not in content:
    content = content.replace(
        '  const [selectedClass, setSelectedClass] = useState("JSS 1");',
        '  const [selectedClass, setSelectedClass] = useState("JSS 1");\n' + state_add
    )

# Use CLASSES instead of hardcoded classes
content = content.replace(
    'const classes = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];',
    'const classes = CLASSES;'
)

# Update handleAuth to load CBT config
old_auth = """  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.startsWith("APP-")) {
      setErrorMsg("Invalid Application ID. It should start with APP-");
      return;
    }
    setErrorMsg("");
    setStep("intro");
  };"""

new_auth = """  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId.startsWith("APP-")) {
      setErrorMsg("Invalid Application ID. It should start with APP-");
      return;
    }
    
    const key = `cbt_config_${selectedClass}_${selectedSession}_${selectedTerm}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const config = JSON.parse(stored);
        if (config.questionCount) {
          setExamQuestionCount(config.questionCount);
        }
      } catch (err) {}
    } else {
      // Default fallback if no custom generation
      setExamQuestionCount(50);
    }
    
    setErrorMsg("");
    setStep("intro");
  };"""
content = content.replace(old_auth, new_auth)

# Add Session and Term selects to auth form
old_form = """                <div className="space-y-2">
                  <Label>Class Applied For</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>"""

new_form = """                <div className="space-y-2">
                  <Label>Class Applied For</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Academic Session</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                  >
                    {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>"""
content = content.replace(old_form, new_form)

# Update the display of Question count in intro
content = content.replace(
    '<p className="text-sm font-bold text-slate-900 mt-1">50 Questions</p>',
    '<p className="text-sm font-bold text-slate-900 mt-1">{Math.min(examQuestionCount, questions.length)} Questions</p>'
)

# Update score calculation total in results
content = content.replace(
    'You scored {score} out of 50 in the entrance examination.',
    'You scored {score} out of {Math.min(examQuestionCount, questions.length)} in the entrance examination.'
)
content = content.replace(
    '<p className="text-sm font-bold text-slate-900 mt-1">100 Marks</p>',
    '<p className="text-sm font-bold text-slate-900 mt-1">{Math.min(examQuestionCount, questions.length) * 2} Marks</p>'
)
content = content.replace(
    '<p className="text-sm font-bold text-slate-900 mt-1">50 / 100 (50%)</p>',
    '<p className="text-sm font-bold text-slate-900 mt-1">{Math.min(examQuestionCount, questions.length)} / {Math.min(examQuestionCount, questions.length) * 2} (50%)</p>'
)

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
