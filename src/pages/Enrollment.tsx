import { useStudents, useAdmissionApps } from "../data/studentsData";
import { usePins } from "../data/pinsData";
import React, { useState } from "react";
import { useSessions, TERMS } from "../data/sessionsData";
import { Card, CardContent, CardHeader, CardTitle, Label, Input } from "@/src/components/ui";
import { Button } from "@/src/components/ui";
import {  Users, GraduationCap, ArrowRight, CheckCircle2, UserPlus, History, Search, Upload, UserMinus, Trash2 , FileText, Check, X, Eye } from "lucide-react";

const CLASSES = [
  "JSS 1A", "JSS 1B", "JSS 1C", "JSS 1D",
  "JSS 2A", "JSS 2B", "JSS 2C", "JSS 2D",
  "JSS 3A", "JSS 3B", "JSS 3C", "JSS 3D",
  "SSS 1A", "SSS 1B", "SSS 1C", "SSS 1D",
  "SSS 2A", "SSS 2B", "SSS 2C", "SSS 2D",
  "SSS 3A", "SSS 3B", "SSS 3C", "SSS 3D",
  "Graduated / Alumni"
];


interface StudentEnrollment {
  id: string;
  name: string;
  class: string;
  session: string;
  term: string;
}

const initialEnrollments: StudentEnrollment[] = [
  { id: "ESS/2026/001", name: "Oluwaseun Adebayo", class: "SSS 3A", session: "2025/2026", term: "First Term" },
  { id: "ESS/2026/002", name: "Chioma Nwosu", class: "JSS 2B", session: "2025/2026", term: "First Term" },
  { id: "ESS/2026/003", name: "Abubakar Ibrahim", class: "JSS 1A", session: "2025/2026", term: "First Term" },
];

export default function Enrollment() {
  const [sessions] = useSessions();
  const SESSIONS = sessions;
  const [activeTab, setActiveTab] = useState("batch_enrollment");
  const [enrollments, setEnrollments] = useStudents();
  const [successMsg, setSuccessMsg] = useState("");

  // Batch Enrollment States
  const [batchSession, setBatchSession] = useState(SESSIONS[1]);
  const [batchTerm, setBatchTerm] = useState(TERMS[0]);
  const [batchFromClass, setBatchFromClass] = useState(CLASSES[0]);
  const [batchToClass, setBatchToClass] = useState(CLASSES[4]);

  // Single Enrollment States
  const [singleName, setSingleName] = useState("");
  const [singleId, setSingleId] = useState("");
  const [singleSession, setSingleSession] = useState(SESSIONS[1]);
  const [singleTerm, setSingleTerm] = useState(TERMS[0]);
  const [singleClass, setSingleClass] = useState(CLASSES[0]);

  // Enroll From Previous States
  const [prevSession, setPrevSession] = useState(SESSIONS[0]);
  const [prevTerm, setPrevTerm] = useState(TERMS[2]);
  const [prevClass, setPrevClass] = useState(CLASSES[0]);
  const [newSession, setNewSession] = useState(SESSIONS[1]);
  const [newTerm, setNewTerm] = useState(TERMS[0]);
  const [newClass, setNewClass] = useState(CLASSES[4]);

  // Find Enrollment States
  const [findSession, setFindSession] = useState(SESSIONS[1]);
  const [findTerm, setFindTerm] = useState(TERMS[0]);
  const [findClass, setFindClass] = useState(CLASSES[0]);
  const [foundStudents, setFoundStudents] = useState<StudentEnrollment[] | null>(null);

  // Upload Enrollment States
  const [uploadSession, setUploadSession] = useState(SESSIONS[1]);
  const [uploadTerm, setUploadTerm] = useState(TERMS[0]);
  const [uploadClass, setUploadClass] = useState(CLASSES[0]);

  // Remove Enrollment States
  const [removeSession, setRemoveSession] = useState(SESSIONS[1]);
  const [removeTerm, setRemoveTerm] = useState(TERMS[0]);
  const [removeClass, setRemoveClass] = useState(CLASSES[0]);
  const [removeStudentId, setRemoveStudentId] = useState("");

  const [admissionApps, setAdmissionApps] = useAdmissionApps();
  const [pins, setPins] = usePins();


  const getNextClass = (currentClass: string) => {
    const classSequence = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3", "Graduated / Alumni"];
    const baseClass = currentClass.replace(/[^A-Za-z0-9 ]/g, '').substring(0, 5).trim();
    const idx = classSequence.findIndex(c => c.startsWith(baseClass));
    if (idx !== -1 && idx < classSequence.length - 1) {
      const nextBase = classSequence[idx + 1];
      const suffixMatch = currentClass.match(/[A-D]$/);
      return suffixMatch ? `${nextBase}${suffixMatch[0]}` : nextBase;
    }
    return currentClass;
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleBatchEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    let count = 0;
    setEnrollments(prev => prev.map(s => {
      if (s.class === batchFromClass && s.session === batchSession && s.term === batchTerm) {
        count++;
        return { ...s, class: batchToClass };
      }
      return s;
    }));
    showSuccess(`Successfully promoted ${count} student(s) from ${batchFromClass} to ${batchToClass} for ${batchSession} (${batchTerm})!`);
  };

  const handleSingleEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName || !singleId) {
      alert("Please provide Student Name and ID.");
      return;
    }
    const newStudent = { id: singleId, name: singleName, class: singleClass, session: singleSession, term: singleTerm };
    setEnrollments(prev => [...prev.filter(s => !(s.id === singleId && s.session === singleSession && s.term === singleTerm)), newStudent]);
    showSuccess(`Successfully enrolled ${singleName} into ${singleClass} for ${singleSession} (${singleTerm})!`);
    setSingleName("");
    setSingleId("");
  };

  const handleEnrollFromPrevious = (e: React.FormEvent) => {
    e.preventDefault();
    const previousStudents = enrollments.filter(s => s.session === prevSession && s.term === prevTerm && s.class === prevClass);
    if (previousStudents.length === 0) {
      alert("No students found in the previous session/term/class.");
      return;
    }
    const newEnrollments = previousStudents.map(s => ({
      ...s,
      session: newSession,
      term: newTerm,
      class: newClass
    }));
    setEnrollments(prev => {
      const filtered = prev.filter(p => !newEnrollments.some(n => n.id === p.id && n.session === p.session && n.term === p.term));
      return [...filtered, ...newEnrollments];
    });
    showSuccess(`Successfully enrolled ${previousStudents.length} student(s) from ${prevClass} to ${newClass} for ${newSession} (${newTerm})!`);
  };

  const handleFindEnrollments = () => {
    const results = enrollments.filter(s => s.session === findSession && s.term === findTerm && s.class === findClass);
    setFoundStudents(results);
  };

  const handleUploadEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess(`Enrollment file uploaded and processed successfully for ${uploadClass} in ${uploadSession} (${uploadTerm})!`);
  };

  const handleRemoveEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeStudentId) {
      alert("Please select a student to remove.");
      return;
    }
    const student = enrollments.find(s => s.id === removeStudentId && s.session === removeSession && s.term === removeTerm && s.class === removeClass);
    setEnrollments(prev => prev.filter(s => !(s.id === removeStudentId && s.session === removeSession && s.term === removeTerm && s.class === removeClass)));
    showSuccess(`Successfully removed ${student?.name || 'student'} from ${removeClass} for ${removeSession} (${removeTerm}).`);
    setRemoveStudentId("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-heading">Enrollment Management</h1>
        <p className="text-slate-500 text-sm mt-1">Manage single and batch student enrollments, promotions, and class assignments.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <Button 
            variant={activeTab === "batch_enrollment" ? "brand" : "outline"} 
            className={`justify-start gap-3 w-full ${activeTab !== "batch_enrollment" ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : ''}`}
            onClick={() => setActiveTab("batch_enrollment")}
          >
            <GraduationCap size={18} /> Batch Enrollment
          </Button>
          <Button 
            variant={activeTab === "enroll_student" ? "brand" : "outline"} 
            className={`justify-start gap-3 w-full ${activeTab !== "enroll_student" ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : ''}`}
            onClick={() => setActiveTab("enroll_student")}
          >
            <UserPlus size={18} /> Enroll Student
          </Button>
          <Button 
            variant={activeTab === "enroll_from_previous" ? "brand" : "outline"} 
            className={`justify-start gap-3 w-full ${activeTab !== "enroll_from_previous" ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : ''}`}
            onClick={() => setActiveTab("enroll_from_previous")}
          >
            <History size={18} /> Enroll From Previous
          </Button>
          <Button 
            variant={activeTab === "find_enrollment" ? "brand" : "outline"} 
            className={`justify-start gap-3 w-full ${activeTab !== "find_enrollment" ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : ''}`}
            onClick={() => setActiveTab("find_enrollment")}
          >
            <Search size={18} /> Find Class Enrollment
          </Button>
          <Button 
            variant={activeTab === "upload_enrollment" ? "brand" : "outline"} 
            className={`justify-start gap-3 w-full ${activeTab !== "upload_enrollment" ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : ''}`}
            onClick={() => setActiveTab("upload_enrollment")}
          >
            <Upload size={18} /> Upload Enrollment
          </Button>
          
          

          <Button 
            variant={activeTab === "remove_student" ? "brand" : "outline"} 
            className={`justify-start gap-3 w-full ${activeTab !== "remove_student" ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : ''}`}
            onClick={() => setActiveTab("remove_student")}
          >
            <UserMinus size={18} /> Remove Enrolled
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          
          {activeTab === "batch_enrollment" && (
            <Card className="border-0 shadow-sm animate-in fade-in">
              <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap size={20} className="text-brand-400" />
                  Batch Class Enrollment & Promotion
                </CardTitle>
                <p className="text-slate-400 text-xs mt-1">Promote or enroll an entire class of students to a new class.</p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleBatchEnrollment} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="session">Academic Session</Label>
                      <select 
                        id="session"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                        value={batchSession}
                        onChange={(e) => setBatchSession(e.target.value)}
                      >
                        {SESSIONS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="term">Term</Label>
                      <select 
                        id="term"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                        value={batchTerm}
                        onChange={(e) => setBatchTerm(e.target.value)}
                      >
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="fromClass">Current Class</Label>
                      <select 
                        id="fromClass"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-500 outline-none text-sm font-semibold text-slate-700"
                        value={batchFromClass}
                        onChange={(e) => {
                          setBatchFromClass(e.target.value);
                          setBatchToClass(getNextClass(e.target.value));
                        }}
                      >
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="hidden md:flex justify-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                        <ArrowRight size={20} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="toClass">Promote To Class</Label>
                      <select 
                        id="toClass"
                        className="w-full h-10 px-3 rounded-lg border-2 border-brand-200 bg-brand-50 focus:ring-2 focus:ring-brand-500 outline-none text-sm font-bold text-brand-900"
                        value={batchToClass}
                        onChange={(e) => setBatchToClass(e.target.value)}
                      >
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 leading-relaxed">
                    <strong>Batch Action Notice:</strong> This will update the current class of all active students in <span className="font-bold">{batchFromClass}</span> to <span className="font-bold">{batchToClass}</span> for the <span className="font-bold">{batchSession} ({batchTerm})</span>.
                  </div>

                  <Button type="submit" variant="brand" className="w-full gap-2">
                    <Users size={16} /> Execute Batch Enrollment
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "enroll_student" && (
            <Card className="border-0 shadow-sm animate-in fade-in">
              <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus size={20} className="text-brand-400" />
                  Enroll Single Student
                </CardTitle>
                <p className="text-slate-400 text-xs mt-1">Enroll a single student into a class and session.</p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSingleEnrollment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Student Full Name</Label>
                      <Input 
                        placeholder="e.g. Oluwaseun Adebayo" 
                        value={singleName}
                        onChange={(e) => setSingleName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Admission Number / ID</Label>
                      <Input 
                        placeholder="e.g. ESS/2026/001" 
                        value={singleId}
                        onChange={(e) => setSingleId(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Academic Session</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={singleSession}
                        onChange={(e) => setSingleSession(e.target.value)}
                      >
                        {SESSIONS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Term</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={singleTerm}
                        onChange={(e) => setSingleTerm(e.target.value)}
                      >
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Class</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={singleClass}
                        onChange={(e) => setSingleClass(e.target.value)}
                      >
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <Button type="submit" variant="brand" className="w-full gap-2 mt-4">
                    <CheckCircle2 size={16} /> Confirm Enrollment
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "enroll_from_previous" && (
            <Card className="border-0 shadow-sm animate-in fade-in">
              <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  <History size={20} className="text-brand-400" />
                  Enroll From Previous Class
                </CardTitle>
                <p className="text-slate-400 text-xs mt-1">Select students from a past class and enroll them in the current session.</p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleEnrollFromPrevious} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Previous Session</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={prevSession}
                        onChange={(e) => setPrevSession(e.target.value)}
                      >
                        {SESSIONS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Previous Term</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={prevTerm}
                        onChange={(e) => setPrevTerm(e.target.value)}
                      >
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Previous Class</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={prevClass}
                        onChange={(e) => setPrevClass(e.target.value)}
                      >
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="p-6 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-center text-slate-500 text-sm">
                    {(() => {
                      const count = enrollments.filter(s => s.session === prevSession && s.term === prevTerm && s.class === prevClass).length;
                      return count > 0 
                        ? <span className="font-bold text-brand-600">{count} student(s) found in {prevClass} ({prevSession}, {prevTerm})</span>
                        : <span>No students found in {prevClass} for {prevSession} ({prevTerm}).</span>
                    })()}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                      <Label>Enroll To (New Session)</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={newSession}
                        onChange={(e) => setNewSession(e.target.value)}
                      >
                        {SESSIONS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Enroll To (New Term)</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={newTerm}
                        onChange={(e) => setNewTerm(e.target.value)}
                      >
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Enroll To (New Class)</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={newClass}
                        onChange={(e) => setNewClass(e.target.value)}
                      >
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <Button type="submit" variant="brand" className="w-full gap-2 mt-4">
                    <CheckCircle2 size={16} /> Process Enrollments
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "find_enrollment" && (
            <Card className="border-0 shadow-sm animate-in fade-in">
              <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search size={20} className="text-brand-400" />
                  Find Class Enrollment
                </CardTitle>
                <p className="text-slate-400 text-xs mt-1">Search and view the current enrolled students for a specific class.</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Academic Session</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={findSession}
                        onChange={(e) => setFindSession(e.target.value)}
                      >
                        {SESSIONS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Term</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={findTerm}
                        onChange={(e) => setFindTerm(e.target.value)}
                      >
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={findClass}
                        onChange={(e) => setFindClass(e.target.value)}
                      >
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-2">
                    <Button variant="brand" className="gap-2" onClick={handleFindEnrollments}>
                      <Search size={16} /> Find Enrollments
                    </Button>
                  </div>

                  {foundStudents !== null && (
                    <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Student Name</th>
                            <th className="p-3">Admission ID</th>
                            <th className="p-3">Class</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {foundStudents.length > 0 ? foundStudents.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50">
                              <td className="p-3 font-medium text-slate-900">{student.name}</td>
                              <td className="p-3 text-slate-500 font-mono">{student.id}</td>
                              <td className="p-3 text-slate-700">{student.class}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={3} className="p-6 text-center text-slate-500">
                                No students found enrolled in {findClass} for {findSession} ({findTerm}).
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "upload_enrollment" && (
            <Card className="border-0 shadow-sm animate-in fade-in">
              <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload size={20} className="text-brand-400" />
                  Upload Students's Enrollment
                </CardTitle>
                <p className="text-slate-400 text-xs mt-1">Bulk upload student enrollments using a CSV or Excel template.</p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleUploadEnrollment} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Academic Session</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={uploadSession}
                        onChange={(e) => setUploadSession(e.target.value)}
                      >
                        {SESSIONS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Term</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={uploadTerm}
                        onChange={(e) => setUploadTerm(e.target.value)}
                      >
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Class</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={uploadClass}
                        onChange={(e) => setUploadClass(e.target.value)}
                      >
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-brand-50 text-brand-800 border border-brand-200 rounded-lg text-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Step 1: Download Template</p>
                      <p className="text-brand-700/80 mt-1">Download the required template structure before uploading.</p>
                    </div>
                    <Button type="button" variant="outline" className="bg-white">Download CSV Template</Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Step 2: Upload Completed File</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                      <Upload size={36} className="text-brand-500 mb-3" />
                      <p className="font-medium text-slate-700">Click to select file or drag and drop</p>
                      <p className="text-xs text-slate-500 mt-1">Supports .csv, .xlsx, .xls</p>
                    </div>
                  </div>

                  <Button type="submit" variant="brand" className="w-full gap-2">
                    <Upload size={16} /> Process Upload
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          
          

          {activeTab === "remove_student" && (
            <Card className="border-0 shadow-sm animate-in fade-in">
              <CardHeader className="bg-rose-950 text-white rounded-t-xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserMinus size={20} className="text-rose-400" />
                  Remove Enrolled Student
                </CardTitle>
                <p className="text-rose-200/80 text-xs mt-1">Permanently remove a student's enrollment record from a specific session and class.</p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleRemoveEnrollment} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Academic Session</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={removeSession}
                        onChange={(e) => setRemoveSession(e.target.value)}
                      >
                        {SESSIONS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Term</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={removeTerm}
                        onChange={(e) => setRemoveTerm(e.target.value)}
                      >
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <select 
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                        value={removeClass}
                        onChange={(e) => setRemoveClass(e.target.value)}
                      >
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Student to Remove</Label>
                    <select 
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium"
                      value={removeStudentId}
                      onChange={(e) => setRemoveStudentId(e.target.value)}
                    >
                      <option value="">-- Select a Student --</option>
                      {enrollments.filter(s => s.session === removeSession && s.term === removeTerm && s.class === removeClass).map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-sm">
                    <strong>Warning:</strong> This will delete the student's enrollment status for the selected session. This action cannot be undone.
                  </div>

                  <Button type="submit" className="w-full gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold">
                    <Trash2 size={16} /> Remove Enrollment Record
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
