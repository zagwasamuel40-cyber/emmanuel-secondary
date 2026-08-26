import re

with open("src/pages/Examinations.tsx", "r") as f:
    content = f.read()

imports = """
import { useAssignments } from "../data/assignmentsData";
"""

if "import { useAssignments }" not in content:
    content = content.replace(
        'import { useScores, ScoreRecord } from "../data/scoresData";',
        'import { useScores, ScoreRecord } from "../data/scoresData";\n' + imports
    )

state_vars = """
  const { assignments, submissions, setSubmissions } = useAssignments();
  const [activeGradingSub, setActiveGradingSub] = useState<any>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  const handleGradeSubmit = (subId: string) => {
    setSubmissions(submissions.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          grade: parseInt(gradeInput),
          feedback: feedbackInput,
          status: "Graded"
        };
      }
      return s;
    }));
    setActiveGradingSub(null);
    setSuccessMsg("Assignment graded successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };
"""

if "const { assignments" not in content:
    content = content.replace(
        "const [activeModal, setActiveModal] = useState<string | null>(null);",
        "const [activeModal, setActiveModal] = useState<string | null>(null);\n" + state_vars
    )

modal_code = """
      {/* MODAL: VIEW ASSIGNMENTS */}
      {activeModal === "view_assignments" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-4xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="text-brand-400" size={20} /> Submitted Assignments
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Review student submissions for {selectedClass}</p>
              </div>
              <button onClick={() => { setActiveModal(null); setActiveGradingSub(null); }} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
              {activeGradingSub ? (
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                    <div>
                      <h3 className="font-bold text-xl text-slate-900">{activeGradingSub.studentName}</h3>
                      <p className="text-sm text-slate-500">{activeGradingSub.studentId} &middot; {assignments.find(a => a.id === activeGradingSub.assignmentId)?.title}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 font-bold rounded-md uppercase">{activeGradingSub.status}</span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Student's Submission</h4>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm whitespace-pre-wrap text-slate-800">
                      {activeGradingSub.content}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Grade (0-100)</Label>
                      <Input 
                        type="number" 
                        min="0" max="100" 
                        value={gradeInput}
                        onChange={e => setGradeInput(e.target.value)}
                        placeholder="e.g. 85"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Feedback / Comments</Label>
                      <textarea 
                        className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        value={feedbackInput}
                        onChange={e => setFeedbackInput(e.target.value)}
                        placeholder="Great work, but check question 2..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button variant="outline" onClick={() => setActiveGradingSub(null)}>Cancel</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleGradeSubmit(activeGradingSub.id)}>Submit Grade</Button>
                  </div>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Assignment Title</th>
                      <th className="px-4 py-3">Submitted On</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {submissions.filter(s => {
                      const ass = assignments.find(a => a.id === s.assignmentId);
                      return ass && ass.targetClass === selectedClass;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No submissions yet for {selectedClass}.</td>
                      </tr>
                    ) : (
                      submissions.filter(s => {
                        const ass = assignments.find(a => a.id === s.assignmentId);
                        return ass && ass.targetClass === selectedClass;
                      }).map(sub => {
                        const ass = assignments.find(a => a.id === sub.assignmentId);
                        return (
                          <tr key={sub.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">{sub.studentName}</td>
                            <td className="px-4 py-3 text-slate-600">{ass?.title}</td>
                            <td className="px-4 py-3 text-slate-600">{sub.submittedAt}</td>
                            <td className="px-4 py-3">
                              {sub.status === "Graded" ? (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-bold uppercase">Graded ({sub.grade})</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold uppercase">Pending</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button 
                                size="sm" 
                                variant={sub.status === "Graded" ? "outline" : "brand"} 
                                className="h-8 text-xs"
                                onClick={() => {
                                  setActiveGradingSub(sub);
                                  setGradeInput(sub.grade?.toString() || "");
                                  setFeedbackInput(sub.feedback || "");
                                }}
                              >
                                {sub.status === "Graded" ? "View / Edit" : "Grade Work"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </CardContent>
"""

old_view_ass = """      {/* MODAL: VIEW ASSIGNMENTS */}
      {activeModal === "view_assignments" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-4xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="text-brand-400" size={20} /> Submitted Assignments
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Review student submissions for {selectedClass} - {selectedSubject}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Assignment Title</th>
                    <th className="px-4 py-3">Submitted On</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-900">Oluwaseun Adebayo</td>
                    <td className="px-4 py-3 text-slate-600">Algebra Homework 1</td>
                    <td className="px-4 py-3 text-slate-600">Aug 10, 2026</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Graded</span></td>
                    <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" className="h-8 text-xs">View Work</Button></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-900">Chioma Nwosu</td>
                    <td className="px-4 py-3 text-slate-600">Algebra Homework 1</td>
                    <td className="px-4 py-3 text-slate-600">Aug 11, 2026</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Pending Review</span></td>
                    <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" className="h-8 text-xs">Grade Work</Button></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-900">David Emmanuel</td>
                    <td className="px-4 py-3 text-slate-600">Algebra Homework 1</td>
                    <td className="px-4 py-3 text-slate-600">Aug 11, 2026</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">Pending Review</span></td>
                    <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" className="h-8 text-xs">Grade Work</Button></td>
                  </tr>
                </tbody>
              </table>
            </CardContent>"""

if "activeGradingSub" not in content:
    content = content.replace(old_view_ass, modal_code)

with open("src/pages/Examinations.tsx", "w") as f:
    f.write(content)
