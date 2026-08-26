import re

with open("src/pages/Examinations.tsx", "r") as f:
    content = f.read()

# 1. Add setAssignments to destructured object
content = content.replace(
    "const { assignments, submissions, setSubmissions } = useAssignments();",
    "const { assignments, setAssignments, submissions, setSubmissions } = useAssignments();"
)

# 2. Add state and handler for new assignment
state_vars = """
  const [isGiveAssModalOpen, setIsGiveAssModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "Mathematics",
    targetClass: "SSS 3A",
    dueDate: new Date().toISOString().split('T')[0]
  });

  const handleGiveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const ass = {
      id: `ASS-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newAssignment,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAssignments([ass, ...assignments]);
    setIsGiveAssModalOpen(false);
    setSuccessMsg("Assignment created successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };
"""

content = content.replace(
    "const [activeGradingSub, setActiveGradingSub] = useState<any>(null);",
    state_vars + "\n  const [activeGradingSub, setActiveGradingSub] = useState<any>(null);"
)

# 3. Add button to the SECTION 2 div
old_buttons = """              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => setActiveModal("view_assignments")}
              >
                <FileText size={14} className="text-amber-300 shrink-0" />
                <span className="truncate">Submitted Assignments</span>
              </Button>"""

new_buttons = """              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => setActiveModal("view_assignments")}
              >
                <FileText size={14} className="text-amber-300 shrink-0" />
                <span className="truncate">Submitted Assignments</span>
              </Button>
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => setIsGiveAssModalOpen(true)}
              >
                <Plus size={14} className="text-emerald-400 shrink-0" />
                <span className="truncate">Give Assignment</span>
              </Button>"""

content = content.replace(old_buttons, new_buttons)

# 4. Add modal HTML
modal_html = """
      {/* GIVE ASSIGNMENT MODAL */}
      {isGiveAssModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg border-0 shadow-2xl animate-in zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle>Give New Assignment</CardTitle>
              <button onClick={() => setIsGiveAssModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 max-h-[80vh] overflow-y-auto bg-white text-slate-800">
              <form onSubmit={handleGiveAssignment} className="space-y-4 text-sm">
                <div className="space-y-2">
                  <Label htmlFor="ass_title">Assignment Title</Label>
                  <Input 
                    id="ass_title" 
                    required 
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="e.g. Algebra Homework"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ass_desc">Instructions / Description</Label>
                  <textarea 
                    id="ass_desc" 
                    required 
                    className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    placeholder="Enter assignment details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ass_subject">Subject</Label>
                    <select 
                      id="ass_subject" 
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={newAssignment.subject}
                      onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                    >
                      {["Mathematics", "English Language", "Basic Science", "Civic Education"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ass_class">Target Class</Label>
                    <select 
                      id="ass_class" 
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={newAssignment.targetClass}
                      onChange={(e) => setNewAssignment({...newAssignment, targetClass: e.target.value})}
                    >
                      {CLASSES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ass_date">Due Date</Label>
                  <Input 
                    id="ass_date" 
                    type="date"
                    required 
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 bg-white border-slate-200" onClick={() => setIsGiveAssModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-md">
                    Give Assignment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
"""

content = content.replace("{/* MODAL: VIEW ASSIGNMENTS */}", modal_html + "\n      {/* MODAL: VIEW ASSIGNMENTS */}")

with open("src/pages/Examinations.tsx", "w") as f:
    f.write(content)
