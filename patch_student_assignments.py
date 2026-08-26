import re

with open("src/pages/student/StudentSubjects.tsx", "r") as f:
    content = f.read()

imports = """
import { useAssignments } from "../../data/assignmentsData";
"""

if "import { useAssignments }" not in content:
    content = content.replace(
        'import { BookOpen, GraduationCap, Clock, Award, FileText, Video, Play, Download, CheckCircle2, UploadCloud, Link as LinkIcon, BookX, ArrowRight, BookMarked, Brain, Library } from "lucide-react";',
        'import { BookOpen, GraduationCap, Clock, Award, FileText, Video, Play, Download, CheckCircle2, UploadCloud, Link as LinkIcon, BookX, ArrowRight, BookMarked, Brain, Library } from "lucide-react";\n' + imports
    )

state_vars = """
  const { assignments, submissions, setSubmissions } = useAssignments();
  const [submissionText, setSubmissionText] = useState("");
  const [activeSubmittingAss, setActiveSubmittingAss] = useState<string | null>(null);

  const handleTextSubmit = (assId: string) => {
    if (!submissionText) return;
    const newSub = {
      id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
      assignmentId: assId,
      studentId: student?.id || "ESS/2026/001",
      studentName: student?.name || "Student",
      content: submissionText,
      submittedAt: new Date().toLocaleString(),
      grade: null,
      feedback: "",
      status: "Pending Review" as const
    };
    setSubmissions([newSub, ...submissions]);
    setSubmissionText("");
    setActiveSubmittingAss(null);
  };
"""

if "const { assignments" not in content:
    content = content.replace(
        "const [activeTab, setActiveTab] = useState<string | null>(null);",
        "const [activeTab, setActiveTab] = useState<string | null>(null);\n" + state_vars
    )

assignments_tab_content = """
            <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 rounded-t-xl">
              <CardTitle>My Assignments</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {assignments.filter(a => a.targetClass === student?.class || a.targetClass === "All Classes").length === 0 ? (
                   <p className="text-slate-500 text-center py-4">No assignments right now.</p>
                ) : (
                  assignments.filter(a => a.targetClass === student?.class || a.targetClass === "All Classes").map(ass => {
                    const submission = submissions.find(s => s.assignmentId === ass.id && s.studentId === student?.id);
                    return (
                      <div key={ass.id} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 uppercase tracking-wider mb-2 inline-block">{ass.subject}</span>
                            <h3 className="font-bold text-lg text-slate-900">{ass.title}</h3>
                          </div>
                          {submission ? (
                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-md uppercase flex items-center gap-1">
                              <CheckCircle2 size={12} /> {submission.status}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-rose-100 text-rose-700 font-bold rounded-md uppercase">Due: {ass.dueDate}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap">{ass.description}</p>
                        
                        {submission ? (
                           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                             <p className="text-sm text-slate-700 font-medium mb-2">Your Submission:</p>
                             <p className="text-sm text-slate-600 italic whitespace-pre-wrap">{submission.content}</p>
                             {submission.status === "Graded" && (
                               <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                                 <div>
                                   <p className="text-xs text-slate-500 uppercase font-bold">Grade</p>
                                   <p className="text-lg font-black text-emerald-600">{submission.grade}/100</p>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-xs text-slate-500 uppercase font-bold">Feedback</p>
                                   <p className="text-sm text-slate-700">{submission.feedback}</p>
                                 </div>
                               </div>
                             )}
                           </div>
                        ) : (
                          activeSubmittingAss === ass.id ? (
                            <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                              <Label className="text-sm font-bold text-slate-700">Write your answer</Label>
                              <textarea
                                className="w-full min-h-[120px] p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Type your assignment submission here..."
                                value={submissionText}
                                onChange={e => setSubmissionText(e.target.value)}
                              ></textarea>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setActiveSubmittingAss(null)}>Cancel</Button>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleTextSubmit(ass.id)}>Submit Answer</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <Button size="sm" className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800" onClick={() => setActiveSubmittingAss(ass.id)}>
                                Submit Assignment
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
"""

old_my_assignments = """            <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 rounded-t-xl">
              <CardTitle>My Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900">English Essay Submission</h3>
                    {assignmentSubmitted ? (
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-md uppercase flex items-center gap-1"><CheckCircle2 size={12} /> Submitted</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-rose-100 text-rose-700 font-bold rounded-md uppercase">Due Tomorrow</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-4">Write a 500 word essay on the impact of technology in modern education.</p>
                  
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleAssignmentUpload} />
                  
                  {!assignmentSubmitted && (
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud size={14} /> Upload & Submit
                    </Button>
                  )}
                </div>
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900">Chemistry Practical Log</h3>
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-md uppercase flex items-center gap-1"><CheckCircle2 size={12} /> Submitted</span>
                  </div>
                  <p className="text-sm text-slate-600">Titration practical report submitted successfully.</p>
                </div>
              </div>
            </CardContent>"""

content = content.replace(old_my_assignments, assignments_tab_content)

with open("src/pages/student/StudentSubjects.tsx", "w") as f:
    f.write(content)
