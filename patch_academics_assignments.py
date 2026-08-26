import re

with open("src/pages/Academics.tsx", "r") as f:
    content = f.read()

imports = """
import { useAssignments } from "../data/assignmentsData";
"""

if "import { useAssignments }" not in content:
    content = content.replace(
        'import { useSessions, TERMS } from "../data/sessionsData";',
        'import { useSessions, TERMS } from "../data/sessionsData";\n' + imports
    )

state_vars = """
  const { assignments, setAssignments } = useAssignments();
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "Mathematics",
    targetClass: "SSS 3A",
    dueDate: new Date().toISOString().split('T')[0]
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const ass = {
      id: `ASS-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newAssignment,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAssignments([ass, ...assignments]);
    setIsAssignmentModalOpen(false);
  };
"""

if "const { assignments" not in content:
    content = content.replace(
        "const [activeCbtExam, setActiveCbtExam] = useState<Exam | null>(null);",
        "const [activeCbtExam, setActiveCbtExam] = useState<Exam | null>(null);\n" + state_vars
    )

button_code = """
            <Button 
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-semibold shadow-md shadow-amber-200 w-full sm:w-auto"
              onClick={() => setIsAssignmentModalOpen(true)}
            >
              <Plus size={18} /> Give Assignment
            </Button>
"""
if "Give Assignment" not in content:
    content = content.replace(
        """<Button 
              className="bg-brand-600 hover:bg-brand-700 text-white gap-2 font-semibold shadow-md shadow-brand-200 w-full sm:w-auto"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={18} /> Create CBT Exam
            </Button>""",
        """<Button 
              className="bg-brand-600 hover:bg-brand-700 text-white gap-2 font-semibold shadow-md shadow-brand-200 w-full sm:w-auto"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={18} /> Create CBT Exam
            </Button>""" + button_code
    )


modal_code = """
      {/* Create Assignment Modal */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle>Give New Assignment</CardTitle>
              <button onClick={() => setIsAssignmentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleCreateAssignment} className="space-y-4">
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
                      {subjects.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
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
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAssignmentModalOpen(false)}>
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

if "Create Assignment Modal" not in content:
    content = content.replace("{/* Create CBT Exam Modal */}", modal_code + "\n      {/* Create CBT Exam Modal */}")

with open("src/pages/Academics.tsx", "w") as f:
    f.write(content)
