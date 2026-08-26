import re

with open("src/pages/Academics.tsx", "r") as f:
    content = f.read()

# Add imports
imports_to_add = """
import { CLASSES } from "../data/studentsData";
import { useSessions, TERMS } from "../data/sessionsData";
import { Sparkles } from "lucide-react";
"""
if "import { CLASSES }" not in content:
    content = content.replace('import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";', 'import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";\n' + imports_to_add)

if "const [sessions] = useSessions();" not in content:
    content = content.replace("export default function Academics() {", "export default function Academics() {\n  const [sessions] = useSessions();")

# Add new fields to newExam state
if "session:" not in content[content.find("const [newExam, setNewExam] = useState({"):]:
    content = content.replace(
"""  const [newExam, setNewExam] = useState({
    title: "",
    subject: "Mathematics",
    targetClass: "SSS 3A",
    type: "CBT",
    date: new Date().toISOString().split('T')[0],
    duration: "45",
    passMark: "50",
    questionsCount: "5"
  });""",
"""  const [newExam, setNewExam] = useState({
    title: "",
    subject: "Mathematics",
    targetClass: "SSS 3A",
    session: "2025/2026",
    term: "First Term",
    type: "CBT",
    date: new Date().toISOString().split('T')[0],
    duration: "45",
    passMark: "50",
    questionsCount: "5",
    aiMode: true
  });"""
    )


# Update modal form UI
# Replace the targetClass input with a select
# Add Session, Term, Num questions, AI mode.

# Let's find the targetClass input block
old_targetClass_block = """                  <div className="space-y-2">
                    <Label htmlFor="targetClass">Target Class</Label>
                    <Input 
                      id="targetClass" 
                      required 
                      value={newExam.targetClass}
                      onChange={(e) => setNewExam({...newExam, targetClass: e.target.value})}
                      placeholder="e.g. SSS 3A"
                    />
                  </div>"""

new_targetClass_block = """                  <div className="space-y-2">
                    <Label htmlFor="targetClass">Target Class</Label>
                    <select 
                      id="targetClass" 
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={newExam.targetClass}
                      onChange={(e) => setNewExam({...newExam, targetClass: e.target.value})}
                    >
                      {CLASSES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>"""
content = content.replace(old_targetClass_block, new_targetClass_block)

# Add session and term
new_session_term_block = """
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session">Academic Session</Label>
                    <select 
                      id="session" 
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={newExam.session}
                      onChange={(e) => setNewExam({...newExam, session: e.target.value})}
                    >
                      {sessions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term">Term</Label>
                    <select 
                      id="term" 
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={newExam.term}
                      onChange={(e) => setNewExam({...newExam, term: e.target.value})}
                    >
                      {TERMS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
"""

old_grid_cols_2 = """                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Assessment Format</Label>"""
if 'htmlFor="session"' not in content:
    content = content.replace(old_grid_cols_2, new_session_term_block + old_grid_cols_2)

# Add Number of Questions and AI mode
new_questions_ai_block = """
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="space-y-2">
                    <Label htmlFor="questionsCount">Number of Questions</Label>
                    <Input 
                      id="questionsCount" 
                      type="number"
                      min="1"
                      required 
                      value={newExam.questionsCount}
                      onChange={(e) => setNewExam({...newExam, questionsCount: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input 
                      type="checkbox" 
                      id="aiMode" 
                      className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      checked={newExam.aiMode}
                      onChange={(e) => setNewExam({...newExam, aiMode: e.target.checked})}
                    />
                    <Label htmlFor="aiMode" className="cursor-pointer flex items-center gap-1.5 font-bold text-brand-700">
                      <Sparkles size={16} /> Enable AI Generation
                    </Label>
                  </div>
                </div>
"""

old_grid_duration = """                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Minutes)</Label>"""

if 'htmlFor="questionsCount"' not in content:
    content = content.replace(old_grid_duration, new_questions_ai_block + old_grid_duration)

with open("src/pages/Academics.tsx", "w") as f:
    f.write(content)
