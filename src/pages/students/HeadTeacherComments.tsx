import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { CLASSES } from "../../data/studentsData";

export default function HeadTeacherComments({ students }: any) {
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [commentType, setCommentType] = useState("Term"); // Term or Annual
  const [comment, setComment] = useState("");

  const [commentsHistory, setCommentsHistory] = useState([
    { id: 1, studentId: "ESS/2026/001", type: "Term", date: "2026-07-27", text: "A brilliant student, keep it up." }
  ]);

  const handleSaveComment = (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedStudent) {
      alert("Please select a student.");
      return;
    }
    setCommentsHistory([
      { id: Date.now(), studentId: selectedStudent, type: commentType, date: new Date().toISOString().split('T')[0], text: comment },
      ...commentsHistory
    ]);
    setSuccessMsg("Comment saved successfully.");
    setComment("");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const currentStudentComments = commentsHistory.filter(c => c.studentId === selectedStudent);

  return (
    <div className="space-y-6 animate-in fade-in">
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-slate-900 text-white rounded-t-xl">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare size={20} className="text-brand-400" />
              Enter / Record Comment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveComment} className="space-y-4">
              
              <div className="space-y-2">
                <Label>Class</Label>
                <select 
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                  value={selectedClass}
                  onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(""); }}
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Select Student</Label>

                <select 
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                >
                  <option value="">-- Choose Student --</option>
                  {students.filter((s: any) => s.class === selectedClass).map((s: any, idx: number) => (
                    <option key={`${s.id}_${idx}`} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Comment Type</Label>
                <select 
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                  value={commentType}
                  onChange={e => setCommentType(e.target.value)}
                >
                  <option value="Term">Term Comment</option>
                  <option value="Annual">Annual Comment</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Comment</Label>
                <textarea 
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm min-h-[120px]"
                  placeholder="Enter the Head Teacher's remark here..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <Button type="submit" variant="brand" className="w-full">Save Comment</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
            <CardTitle className="text-lg text-slate-800">View Comments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedStudent ? (
              <div className="divide-y divide-slate-100">
                {currentStudentComments.length > 0 ? (
                  currentStudentComments.map(c => (
                    <div key={c.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${c.type === 'Annual' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                          {c.type} Comment
                        </span>
                        <span className="text-xs text-slate-500">{c.date}</span>
                      </div>
                      <p className="text-sm text-slate-700">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">No comments recorded for this student yet.</div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">Select a student to view their comments history.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
