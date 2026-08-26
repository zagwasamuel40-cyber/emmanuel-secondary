import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Label } from "@/src/components/ui";
import { Activity, CheckCircle2 } from "lucide-react";
import { CLASSES } from "../../data/studentsData";
import { useSessions, TERMS } from "../../data/sessionsData";
import { useSkillsDb } from "../../data/skillsData";


const SKILL_CATEGORIES = [
  "Attentiveness",
  "Attendance",
  "Punctuality",
  "Neatness",
  "Politeness",
  "Rel. With Others",
  "Curiosity",
  "Honesty",
  "Humility",
  "Tolerance",
  "Leadership",
  "Courage",
  "Handwriting",
  "Fluency",
  "Games/Sports",
  "Music Skills",
  "Construction"
];
const GRADES = ["A", "B", "C", "D", "E"];

export default function StudentSkills({ students }: any) {
  const [sessions] = useSessions();
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [selectedSession, setSelectedSession] = useState(sessions[0]);
  const [selectedTerm, setSelectedTerm] = useState(TERMS[0]);
  
  const [skillsDb, setSkillsDb] = useSkillsDb();

  // current form state
  const [currentSkills, setCurrentSkills] = useState<Record<string, string>>({});
  const [teacherComment, setTeacherComment] = useState("");

  const handleStudentSelect = (id: string) => {
    setSelectedStudent(id);
    if (skillsDb[id]) {
      setCurrentSkills({...skillsDb[id]});
      setTeacherComment(skillsDb[id].teacherComment || "");
    } else {
      setCurrentSkills({});
      setTeacherComment("");
    }
  };

  const handleSaveSkills = (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedStudent) {
      alert("Please select a student.");
      return;
    }
    setSkillsDb(prev => ({
      ...prev,
      [selectedStudent]: {
        ...currentSkills,
        teacherComment
      }
    }));
    setSuccessMsg("Student skills updated successfully.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}

      <Card className="border-0 shadow-sm max-w-3xl">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity size={20} className="text-brand-400" />
            Student Psychomotor & Affective Skills
          </CardTitle>
          <p className="text-slate-400 text-xs mt-1">Enter, check, and update student skills and behavior ratings.</p>
        </CardHeader>
        <CardContent className="p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <Label>Academic Session</Label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                value={selectedSession}
                onChange={e => setSelectedSession(e.target.value)}
              >
                {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Term</Label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                value={selectedTerm}
                onChange={e => setSelectedTerm(e.target.value)}
              >
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Select Student</Label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold"
                value={selectedStudent}
                onChange={e => handleStudentSelect(e.target.value)}
              >
                <option value="">-- Choose Student --</option>
                {students.filter((s: any) => s.class === selectedClass).map((s: any, idx: number) => (
                  <option key={`${s.id}_${idx}`} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>
          </div>


          {selectedStudent ? (
            <form onSubmit={handleSaveSkills} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {SKILL_CATEGORIES.map(category => (
                  <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">{category}</span>
                    <div className="flex gap-1">
                      {GRADES.map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setCurrentSkills(prev => ({...prev, [category]: g}))}
                          className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                            currentSkills[category] === g 
                              ? 'bg-brand-600 text-white shadow-sm' 
                              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100">
                <Label className="mb-2 block">Class Teacher's Comment</Label>
                <textarea 
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm min-h-[100px]"
                  placeholder="Enter class teacher's comment here..."
                  value={teacherComment}
                  onChange={e => setTeacherComment(e.target.value)}
                ></textarea>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" variant="brand">Save / Update Skills</Button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Please select a student above to record or update their skills.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
