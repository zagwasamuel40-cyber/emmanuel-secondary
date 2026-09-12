import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { 
  Users, BookOpen, GraduationCap, Download, CheckCircle, 
  X, FileText, Clock, Bell, Book, Plus, Search, Filter,
  Check, Save, Send, Lock, Unlock, Eye, CalendarCheck,
  Award, AlertCircle, ToggleLeft, ToggleRight, Laptop, Sparkles
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Teacher } from "../../data/teachersData";
import { useStudents } from "../../data/studentsData";
import { 
  useAssessments, 
  useResultDrafts, 
  useAssessmentWeightings,
  STANDARD_ASSESSMENT_TYPES,
  AssessmentType,
  AssessmentItem,
  TeacherResultDraft,
  calculateGrade
} from "../../data/assessmentRecordingData";
import { calculateStudentAttendanceStats } from "../../data/attendanceResultConnector";
import { AttendanceRecordTable } from "../../components/AttendanceRecordTable";
import { StudentReportCard } from "../../components/StudentReportCard";
import { getStoredScores } from "../../data/scoresData";

interface TeacherDashboardProps {
  teacher: Teacher;
  stats?: any[];
  sessions?: string[];
  newsList?: any[];
}

export default function TeacherDashboard({ teacher, stats = [], sessions = ["2025/2026"], newsList = [] }: TeacherDashboardProps) {
  const [students] = useStudents();
  const [assessments, setAssessments] = useAssessments();
  const [resultDrafts, setResultDrafts] = useResultDrafts();
  const [weightings] = useAssessmentWeightings();

  // Tab State
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "classes"
    | "subjects"
    | "attendance"
    | "assessments"
    | "enter-scores"
    | "cbt-results"
    | "result-drafts"
    | "submitted-results"
    | "performance"
  >("overview");

  const [notificationMsg, setNotificationMsg] = useState("");
  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(""), 4500);
  };

  // Selected filters
  const assignedClasses = teacher?.assignedClasses?.length ? teacher.assignedClasses : ["SSS 3A", "SSS 2B", "JSS 1A"];
  const assignedSubjects = teacher?.subjects?.length ? teacher.subjects : ["Mathematics", "English Language", "Physics"];
  const [selectedClass, setSelectedClass] = useState(assignedClasses[0] || "SSS 3A");
  const [selectedSubject, setSelectedSubject] = useState(assignedSubjects[0] || "Mathematics");
  const [selectedSession, setSelectedSession] = useState(sessions[0] || "2025/2026");
  const [selectedTerm, setSelectedTerm] = useState("First Term");

  // Filter students for the active class
  const classStudents = useMemo(() => {
    return students.filter(s => s.class === selectedClass);
  }, [students, selectedClass]);

  // "Add New Assessment" Modal State
  const [isAddAssessmentOpen, setIsAddAssessmentOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState<{
    name: string;
    type: AssessmentType;
    maxScore: number;
    date: string;
    subject: string;
    class: string;
    term: string;
    session: string;
    includeInFinalResult: boolean;
  }>({
    name: "",
    type: "First Test",
    maxScore: 20,
    date: new Date().toISOString().split("T")[0],
    subject: selectedSubject,
    class: selectedClass,
    term: selectedTerm,
    session: selectedSession,
    includeInFinalResult: true,
  });

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessment.name.trim()) {
      alert("Please enter assessment name");
      return;
    }

    const created: AssessmentItem = {
      id: `ASM-${Date.now().toString(36).toUpperCase()}`,
      name: newAssessment.name,
      type: newAssessment.type,
      maxScore: Number(newAssessment.maxScore) || 20,
      date: newAssessment.date,
      subject: newAssessment.subject,
      class: newAssessment.class,
      term: newAssessment.term,
      session: newAssessment.session,
      includeInFinalResult: newAssessment.includeInFinalResult,
      isCbt: newAssessment.type === "CBT Examination",
      status: "Published",
      teacherName: teacher?.name || "Subject Teacher",
      scores: {},
    };

    setAssessments(prev => [created, ...prev]);
    setIsAddAssessmentOpen(false);
    showNotification(`Assessment "${created.name}" created successfully with status: ${created.includeInFinalResult ? 'Included on Final Result' : 'Internal Record Only'}`);
    
    // Switch to enter scores for this new assessment
    setSelectedAssessmentId(created.id);
    setActiveTab("enter-scores");
  };

  // Score Entry State
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(() => {
    return assessments[0]?.id || "";
  });

  const activeAssessment = useMemo(() => {
    return assessments.find(a => a.id === selectedAssessmentId) || assessments[0] || null;
  }, [assessments, selectedAssessmentId]);

  // Working scores state for currently selected assessment
  const [entryScores, setEntryScores] = useState<Record<string, { score: number; includeInFinalResult: boolean; remarks: string }>>({});

  // Populate working scores when assessment changes
  React.useEffect(() => {
    if (!activeAssessment) return;
    const initialMap: Record<string, { score: number; includeInFinalResult: boolean; remarks: string }> = {};
    classStudents.forEach(s => {
      const existing = activeAssessment.scores?.[s.id];
      initialMap[s.id] = {
        score: existing ? existing.score : 0,
        includeInFinalResult: existing ? existing.includeInFinalResult : activeAssessment.includeInFinalResult,
        remarks: existing?.remarks || "",
      };
    });
    setEntryScores(initialMap);
  }, [activeAssessment?.id, classStudents]);

  const handleSaveAssessmentScores = () => {
    if (!activeAssessment) return;
    const updatedScores = { ...(activeAssessment.scores || {}) };

    classStudents.forEach(s => {
      const stScore = entryScores[s.id];
      if (stScore) {
        updatedScores[s.id] = {
          studentId: s.id,
          studentName: s.name,
          score: Math.min(activeAssessment.maxScore, Math.max(0, Number(stScore.score) || 0)),
          maxScore: activeAssessment.maxScore,
          includeInFinalResult: stScore.includeInFinalResult,
          remarks: stScore.remarks,
          submittedAt: new Date().toISOString(),
        };
      }
    });

    setAssessments(prev => prev.map(a => a.id === activeAssessment.id ? { ...a, scores: updatedScores } : a));
    showNotification(`Scores saved for ${activeAssessment.name}! All records updated.`);
  };

  // Toggle "Record on Final Result" for a specific student or bulk
  const handleToggleIncludeOnResult = (studentId: string) => {
    setEntryScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        includeInFinalResult: !prev[studentId]?.includeInFinalResult,
      }
    }));
  };

  const handleBulkToggleInclude = (include: boolean) => {
    setEntryScores(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        next[id] = { ...next[id], includeInFinalResult: include };
      });
      return next;
    });
  };

  // Result Preview & Publishing State
  const [previewStudent, setPreviewStudent] = useState<any | null>(null);
  const [previewDraft, setPreviewDraft] = useState<TeacherResultDraft | null>(null);

  const openResultPreview = (student: any) => {
    const draft = resultDrafts.find(d => 
      d.studentId === student.id && 
      d.subject === selectedSubject &&
      d.class === selectedClass &&
      d.session === selectedSession &&
      d.term === selectedTerm
    ) || {
      id: `DFT-${Date.now().toString(36)}`,
      studentId: student.id,
      studentName: student.name,
      class: selectedClass,
      subject: selectedSubject,
      session: selectedSession,
      term: selectedTerm,
      firstTest: 16,
      secondTest: 18,
      assignment: 5,
      practical: 5,
      cbtScore: 25,
      includeCbtInResult: true,
      examination: 50,
      totalScore: 89,
      grade: "A",
      teacherRemark: "Outstanding academic grasp and consistent diligence.",
      status: "Draft",
      submittedBy: teacher?.name || "Subject Teacher",
    };

    setPreviewStudent(student);
    setPreviewDraft(draft);
  };

  // Draft Actions: SAVE DRAFT, SUBMIT RESULT, FINALIZE RESULT
  const handleUpdateDraftStatus = (newStatus: "Draft" | "Submitted" | "Finalized") => {
    if (!previewDraft || !previewStudent) return;
    const updatedDraft: TeacherResultDraft = {
      ...previewDraft,
      status: newStatus,
      submittedAt: newStatus !== "Draft" ? (previewDraft.submittedAt || new Date().toLocaleString()) : undefined,
      finalizedAt: newStatus === "Finalized" ? new Date().toLocaleString() : undefined,
    };

    setResultDrafts(prev => {
      const filtered = prev.filter(d => d.id !== updatedDraft.id && !(d.studentId === updatedDraft.studentId && d.subject === updatedDraft.subject && d.term === updatedDraft.term));
      return [updatedDraft, ...filtered];
    });

    setPreviewDraft(updatedDraft);
    showNotification(`Result for ${previewStudent.name} set to ${newStatus.toUpperCase()}!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Teacher Portal & Result Management</span>
            <span className="inline-flex px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-200">
              {teacher?.name || "Teacher"}
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Manage your classes, record continuous assessments, integrate CBT examination scores, and finalize official student results.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            onClick={() => setIsAddAssessmentOpen(true)}
            className="gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
          >
            <Plus size={16} /> Add New Assessment
          </Button>
          <Button variant="outline" className="gap-2 bg-white text-xs font-semibold" onClick={() => window.print()}>
            <Download size={14} /> Print Sheet
          </Button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg("")} className="text-emerald-600 hover:text-emerald-800">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Class & Subject Selector Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">Class:</span>
            <select
              className="bg-slate-800 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-400"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {assignedClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">Subject:</span>
            <select
              className="bg-slate-800 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-400"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {assignedSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">Session / Term:</span>
            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-amber-300 font-mono">
              {selectedSession} ({selectedTerm})
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-300 font-medium flex items-center gap-2">
          <Users size={15} className="text-brand-400" />
          <span><b>{classStudents.length}</b> Enrolled Students in {selectedClass}</span>
        </div>
      </div>

      {/* DASHBOARD ORGANIZED TABS (Requirement 13) */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 flex flex-wrap gap-1 shadow-2xs">
        {[
          { id: "overview", label: "Dashboard Overview", icon: Sparkles },
          { id: "classes", label: "My Classes", icon: Users },
          { id: "subjects", label: "My Subjects", icon: BookOpen },
          { id: "attendance", label: "Attendance", icon: CalendarCheck },
          { id: "assessments", label: "Assessments", icon: Award },
          { id: "enter-scores", label: "Enter Scores", icon: FileText },
          { id: "cbt-results", label: "CBT Results", icon: Laptop },
          { id: "result-drafts", label: "Result Drafts", icon: Clock },
          { id: "submitted-results", label: "Submitted Results", icon: CheckCircle },
          { id: "performance", label: "Student Performance", icon: GraduationCap },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                isActive 
                  ? "bg-brand-50 text-brand-700 border-b-2 border-brand-600 font-black"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon size={15} className={isActive ? "text-brand-600" : "text-slate-400"} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-xs bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Assigned Classes</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">{assignedClasses.length}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{assignedClasses.join(", ")}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Users size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xs bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Registered Assessments</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">{assessments.length}</h4>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">Tests, CBT, Assignments</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Award size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xs bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Result Submissions</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">{resultDrafts.length}</h4>
                  <p className="text-[11px] text-indigo-600 font-bold mt-1">Ready for publishing</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText size={24} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xs bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Average Attendance</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-0.5">94.8%</h4>
                  <p className="text-[11px] text-amber-600 font-bold mt-1">Terminal check-ins</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <CalendarCheck size={24} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => setActiveTab("enter-scores")}
              className="p-5 bg-gradient-to-br from-brand-900 to-indigo-950 text-white rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all group"
            >
              <FileText size={28} className="text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold">Enter Student Scores</h3>
              <p className="text-xs text-slate-300 mt-1">Record scores for tests, assignments, exams with "Include in Final Result" control.</p>
              <span className="inline-flex items-center gap-1 text-amber-300 text-xs font-bold mt-3">
                Open Score Recorder →
              </span>
            </div>

            <div 
              onClick={() => setActiveTab("cbt-results")}
              className="p-5 bg-gradient-to-br from-purple-900 to-slate-900 text-white rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all group"
            >
              <Laptop size={28} className="text-purple-300 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold">CBT Examination Scores</h3>
              <p className="text-xs text-slate-300 mt-1">Sync computer-based test scores directly to student terminal results.</p>
              <span className="inline-flex items-center gap-1 text-purple-300 text-xs font-bold mt-3">
                Manage CBT Integration →
              </span>
            </div>

            <div 
              onClick={() => setActiveTab("attendance")}
              className="p-5 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all group"
            >
              <CalendarCheck size={28} className="text-emerald-300 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold">Terminal Attendance</h3>
              <p className="text-xs text-slate-300 mt-1">Review automatically calculated attendance metrics connected to results.</p>
              <span className="inline-flex items-center gap-1 text-emerald-300 text-xs font-bold mt-3">
                View Attendance Record →
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. MY CLASSES */}
      {activeTab === "classes" && (
        <Card className="border-0 shadow-xs bg-white">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Enrolled Students in {selectedClass}</CardTitle>
              <p className="text-xs text-slate-500">Official student registry linked by unique identifier.</p>
            </div>
            <span className="px-3 py-1 bg-brand-50 text-brand-800 text-xs font-bold rounded-lg border border-brand-200">
              {classStudents.length} Students
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Parent Contact</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {classStudents.map(st => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-brand-900">{st.id}</td>
                      <td className="p-3 font-bold text-slate-900">{st.name}</td>
                      <td className="p-3">{st.class}</td>
                      <td className="p-3">{st.gender}</td>
                      <td className="p-3 text-slate-600">{st.parentNumber || "N/A"}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {st.status || "Active"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs font-bold"
                          onClick={() => openResultPreview(st)}
                        >
                          Preview Result
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: 3. MY SUBJECTS */}
      {activeTab === "subjects" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assignedSubjects.map((sb, i) => (
            <Card key={i} className="border border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                  <span>{sb}</span>
                  <BookOpen size={18} className="text-brand-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold">Taught in Classes:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {assignedClasses.map(c => (
                      <span key={c} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Session: {selectedSession}</span>
                  <Button 
                    size="sm" 
                    className="h-7 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white"
                    onClick={() => {
                      setSelectedSubject(sb);
                      setActiveTab("enter-scores");
                    }}
                  >
                    Record Scores
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB CONTENT: 4. ATTENDANCE (Requirements 1 & 7) */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 text-xs flex items-start gap-3">
            <CalendarCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Attendance Connected Directly to Academic Records</h4>
              <p className="mt-0.5 text-emerald-800">
                All attendance parameters (Total Days, Days Present, Late, Absent, Days in School, Days Out of School, and Attendance Percentage) are automatically computed from the attendance database for each student.
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Class Attendance Summary — {selectedClass}</CardTitle>
                <p className="text-xs text-slate-500">Session: {selectedSession} | Term: {selectedTerm}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                      <th className="p-3">Student</th>
                      <th className="p-3">Student ID</th>
                      <th className="p-3 text-center">Total School Days</th>
                      <th className="p-3 text-center text-emerald-300">Days Present</th>
                      <th className="p-3 text-center text-rose-300">Days Absent</th>
                      <th className="p-3 text-center text-amber-300">Days Late</th>
                      <th className="p-3 text-center">Days in School</th>
                      <th className="p-3 text-center">Days Out School</th>
                      <th className="p-3 text-right">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {classStudents.map(st => {
                      const att = calculateStudentAttendanceStats(st.id, selectedSession, selectedTerm, selectedClass);
                      return (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{st.name}</td>
                          <td className="p-3 font-mono text-brand-900 font-bold">{st.id}</td>
                          <td className="p-3 text-center font-mono">{att.totalSchoolDays}</td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-700">{att.daysPresent}</td>
                          <td className="p-3 text-center font-mono font-bold text-rose-700">{att.daysAbsent}</td>
                          <td className="p-3 text-center font-mono font-bold text-amber-700">{att.daysLate}</td>
                          <td className="p-3 text-center font-mono">{att.daysInSchool}</td>
                          <td className="p-3 text-center font-mono">{att.daysOutSchool}</td>
                          <td className="p-3 text-right font-mono font-black text-emerald-800">
                            {att.attendancePercentage}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: 5. ASSESSMENTS (Requirement 2) */}
      {activeTab === "assessments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Configured Assessments</h3>
              <p className="text-xs text-slate-500">Flexible assessment types: Tests, Continuous Assessment, Assignments, Practicals, CBT, and Exams.</p>
            </div>
            <Button 
              onClick={() => setIsAddAssessmentOpen(true)}
              className="gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
            >
              <Plus size={16} /> Add New Assessment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map(asm => (
              <Card key={asm.id} className="border border-slate-200 bg-white shadow-xs hover:border-brand-300 transition-all">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                        {asm.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{asm.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      asm.includeInFinalResult ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                    }`}>
                      {asm.includeInFinalResult ? "On Result: YES" : "Internal Record Only"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subject:</span>
                    <span className="font-bold text-slate-900">{asm.subject}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Class:</span>
                    <span className="font-bold text-slate-900">{asm.class}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Max Score:</span>
                    <span className="font-mono font-bold text-brand-900">{asm.maxScore} Marks</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Date:</span>
                    <span className="font-medium text-slate-800">{asm.date}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {Object.keys(asm.scores || {}).length} scored
                    </span>
                    <Button 
                      size="sm" 
                      className="h-7 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white"
                      onClick={() => {
                        setSelectedAssessmentId(asm.id);
                        setSelectedClass(asm.class);
                        setSelectedSubject(asm.subject);
                        setActiveTab("enter-scores");
                      }}
                    >
                      Enter Scores →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. ENTER SCORES (Requirements 2 & 3) */}
      {activeTab === "enter-scores" && (
        <div className="space-y-4">
          {/* Assessment Selection Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Label className="text-xs font-bold text-slate-700 uppercase">Assessment:</Label>
              <select
                className="h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500"
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
              >
                {assessments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type} - Max: {a.maxScore}m) - {a.subject} ({a.class})
                  </option>
                ))}
              </select>
            </div>

            {activeAssessment && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">Bulk Toggle on Result:</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs font-bold bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                  onClick={() => handleBulkToggleInclude(true)}
                >
                  Set All to YES
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                  onClick={() => handleBulkToggleInclude(false)}
                >
                  Set All to NO
                </Button>
              </div>
            )}
          </div>

          {activeAssessment ? (
            <Card className="border-0 shadow-xs bg-white">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Recording Scores: {activeAssessment.name}
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Type: <b className="text-brand-700">{activeAssessment.type}</b> | Maximum Score: <b>{activeAssessment.maxScore}</b> | Subject: <b>{activeAssessment.subject}</b> | Class: <b>{activeAssessment.class}</b>
                  </p>
                </div>
                <Button 
                  onClick={handleSaveAssessmentScores}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  <Save size={16} /> Save All Scores
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                        <th className="p-3 w-32">Student ID</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3 w-28 text-center">Score (Max: {activeAssessment.maxScore})</th>
                        <th className="p-3 w-56 text-center">Record on Final Result?</th>
                        <th className="p-3">Teacher Remarks / Notes</th>
                        <th className="p-3 text-right w-28">Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {classStudents.map(st => {
                        const current = entryScores[st.id] || { score: 0, includeInFinalResult: activeAssessment.includeInFinalResult, remarks: "" };
                        return (
                          <tr key={st.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-brand-900">{st.id}</td>
                            <td className="p-3 font-bold text-slate-900">{st.name}</td>
                            <td className="p-3 text-center">
                              <Input 
                                type="number"
                                min={0}
                                max={activeAssessment.maxScore}
                                className="h-8 w-20 text-center font-mono font-bold text-slate-900 border-slate-300 mx-auto"
                                value={current.score}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setEntryScores(prev => ({
                                    ...prev,
                                    [st.id]: {
                                      ...prev[st.id],
                                      score: val,
                                    }
                                  }));
                                }}
                              />
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleIncludeOnResult(st.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all inline-flex items-center gap-1.5 ${
                                  current.includeInFinalResult
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                                }`}
                              >
                                {current.includeInFinalResult ? (
                                  <>
                                    <CheckCircle size={14} className="text-emerald-600" />
                                    <span>YES — Included on Result</span>
                                  </>
                                ) : (
                                  <>
                                    <X size={14} className="text-slate-500" />
                                    <span>NO — Internal Record Only</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="p-3">
                              <Input 
                                type="text"
                                placeholder="Optional teacher remark..."
                                className="h-8 text-xs border-slate-200"
                                value={current.remarks}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEntryScores(prev => ({
                                    ...prev,
                                    [st.id]: {
                                      ...prev[st.id],
                                      remarks: val,
                                    }
                                  }));
                                }}
                              />
                            </td>
                            <td className="p-3 text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs font-semibold"
                                onClick={() => openResultPreview(st)}
                              >
                                Preview
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500 text-sm">No assessment found. Click "Add New Assessment" to create one.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 7. CBT RESULTS (Requirement 5) */}
      {activeTab === "cbt-results" && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-purple-950 text-xs flex items-start gap-3">
            <Laptop size={20} className="text-purple-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">CBT Examination System Connected to Official Results</h4>
              <p className="mt-0.5 text-purple-800">
                When you toggle <b>"Record CBT Score on Final Result?"</b> to YES, the student's score is automatically computed in their official terminal result. When NO, it remains an internal assessment record.
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">
                CBT Examinations & Student Terminal Mapping — {selectedClass} ({selectedSubject})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Student ID</th>
                      <th className="p-3">CBT Examination Title</th>
                      <th className="p-3 text-center">Max Score</th>
                      <th className="p-3 text-center text-purple-300">Student Score</th>
                      <th className="p-3 text-center">Percentage</th>
                      <th className="p-3 text-center">CBT Status</th>
                      <th className="p-3 text-center">Record on Final Result?</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {classStudents.map(st => {
                      const cbtAsm = assessments.find(a => a.isCbt && a.class === selectedClass && a.subject === selectedSubject) || assessments.find(a => a.isCbt);
                      const studentCbt = cbtAsm?.scores?.[st.id];
                      const maxSc = cbtAsm?.maxScore || 30;
                      const score = studentCbt ? studentCbt.score : 24;
                      const pct = Number(((score / maxSc) * 100).toFixed(1));
                      const isRecorded = studentCbt ? studentCbt.includeInFinalResult : true;

                      return (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{st.name}</td>
                          <td className="p-3 font-mono text-brand-900 font-bold">{st.id}</td>
                          <td className="p-3 font-semibold text-purple-950">{cbtAsm?.name || "Calculus & Functions CBT Quiz 1"}</td>
                          <td className="p-3 text-center font-mono">{maxSc}</td>
                          <td className="p-3 text-center font-mono font-bold text-purple-700 text-sm">{score}</td>
                          <td className="p-3 text-center font-mono font-bold">{pct}%</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Completed
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (!cbtAsm) return;
                                const updatedScores = { ...(cbtAsm.scores || {}) };
                                updatedScores[st.id] = {
                                  studentId: st.id,
                                  studentName: st.name,
                                  score,
                                  maxScore: maxSc,
                                  includeInFinalResult: !isRecorded,
                                  submittedAt: new Date().toISOString(),
                                };
                                setAssessments(prev => prev.map(a => a.id === cbtAsm.id ? { ...a, scores: updatedScores } : a));
                                showNotification(`CBT Result recording for ${st.name} toggled to ${!isRecorded ? 'YES' : 'NO'}`);
                              }}
                              className={`px-3 py-1 rounded text-xs font-bold border transition-all ${
                                isRecorded
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-slate-100 text-slate-600 border-slate-300"
                              }`}
                            >
                              {isRecorded ? "YES (On Result)" : "NO (Internal)"}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs font-bold"
                              onClick={() => openResultPreview(st)}
                            >
                              View Card
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: 8. RESULT DRAFTS (Requirement 6) */}
      {activeTab === "result-drafts" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Result Drafts & Approvals</h3>
              <p className="text-xs text-slate-500">Review preliminary scores before final publishing. Restricted from editing once finalized.</p>
            </div>
          </div>

          <Card className="border-0 shadow-xs bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3 text-center">Total Score</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {resultDrafts.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{d.studentName}</td>
                        <td className="p-3 font-mono text-brand-900 font-bold">{d.studentId}</td>
                        <td className="p-3">{d.class}</td>
                        <td className="p-3">{d.subject}</td>
                        <td className="p-3 text-center font-mono font-black text-sm text-emerald-800">{d.totalScore}</td>
                        <td className="p-3 text-center font-bold text-brand-900">{d.grade}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === "Finalized" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                            d.status === "Submitted" ? "bg-blue-100 text-blue-800 border border-blue-300" :
                            "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-3 text-right flex justify-end gap-1.5">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs font-bold"
                            onClick={() => {
                              const found = students.find(s => s.id === d.studentId) || { id: d.studentId, name: d.studentName, class: d.class };
                              setPreviewStudent(found);
                              setPreviewDraft(d);
                            }}
                          >
                            <Eye size={13} className="mr-1" /> Preview & Act
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: 9. SUBMITTED RESULTS */}
      {activeTab === "submitted-results" && (
        <Card className="border-0 shadow-xs bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">Finalized & Submitted Official Results</CardTitle>
            <p className="text-xs text-slate-500">Official archived academic results ready for student terminal scratch card checker access.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs text-left">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3 text-center">Total (100)</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3 text-center">Finalized Date</th>
                    <th className="p-3 text-right">Lock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {resultDrafts.filter(d => d.status === "Finalized" || d.status === "Submitted").map(d => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{d.studentName}</td>
                      <td className="p-3 font-mono text-brand-900 font-bold">{d.studentId}</td>
                      <td className="p-3">{d.class}</td>
                      <td className="p-3">{d.subject}</td>
                      <td className="p-3 text-center font-mono font-black text-emerald-800">{d.totalScore}</td>
                      <td className="p-3 text-center font-bold text-brand-900">{d.grade}</td>
                      <td className="p-3 text-center text-slate-500">{d.finalizedAt || "Official 2026"}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 inline-flex items-center gap-1">
                          <Lock size={11} className="text-slate-500" /> Locked
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENT: 10. STUDENT PERFORMANCE */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          <Card className="border-0 shadow-xs bg-white">
            <CardHeader className="pb-2 border-none">
              <CardTitle className="text-base font-bold text-slate-900">
                Academic Performance vs Attendance Tracking ({selectedClass})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Jan', attendance: 92, performance: 78 },
                    { name: 'Feb', attendance: 95, performance: 82 },
                    { name: 'Mar', attendance: 94, performance: 85 },
                    { name: 'Apr', attendance: 96, performance: 88 },
                    { name: 'May', attendance: 98, performance: 86 },
                    { name: 'Jun', attendance: 97, performance: 91 },
                  ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAtt)" name="Attendance %" />
                    <Area type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPerf)" name="Subject Avg %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* "ADD NEW ASSESSMENT" MODAL (Requirement 2) */}
      {isAddAssessmentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Award size={18} className="text-brand-600" />
                Add New Assessment
              </h3>
              <button 
                onClick={() => setIsAddAssessmentOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
              <div>
                <Label className="font-bold text-slate-700 mb-1 block">Assessment Name *</Label>
                <Input 
                  type="text"
                  placeholder="e.g. Term 1 First Test - Quadratic Equations"
                  className="h-10 text-xs font-semibold"
                  value={newAssessment.name}
                  onChange={(e) => setNewAssessment({ ...newAssessment, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-bold text-slate-700 mb-1 block">Assessment Type *</Label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-brand-500"
                    value={newAssessment.type}
                    onChange={(e) => setNewAssessment({ ...newAssessment, type: e.target.value as AssessmentType })}
                  >
                    {STANDARD_ASSESSMENT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="font-bold text-slate-700 mb-1 block">Maximum Score *</Label>
                  <Input 
                    type="number"
                    min={1}
                    max={100}
                    className="h-10 text-xs font-bold font-mono"
                    value={newAssessment.maxScore}
                    onChange={(e) => setNewAssessment({ ...newAssessment, maxScore: Number(e.target.value) || 20 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-bold text-slate-700 mb-1 block">Subject *</Label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs"
                    value={newAssessment.subject}
                    onChange={(e) => setNewAssessment({ ...newAssessment, subject: e.target.value })}
                  >
                    {assignedSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <Label className="font-bold text-slate-700 mb-1 block">Class *</Label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs"
                    value={newAssessment.class}
                    onChange={(e) => setNewAssessment({ ...newAssessment, class: e.target.value })}
                  >
                    {assignedClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-bold text-slate-700 mb-1 block">Date *</Label>
                  <Input 
                    type="date"
                    className="h-10 text-xs"
                    value={newAssessment.date}
                    onChange={(e) => setNewAssessment({ ...newAssessment, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label className="font-bold text-slate-700 mb-1 block">Term *</Label>
                  <select
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs"
                    value={newAssessment.term}
                    onChange={(e) => setNewAssessment({ ...newAssessment, term: e.target.value })}
                  >
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>
              </div>

              {/* Requirement 3: Record on final result toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Record this score on student's final result?</span>
                  <button
                    type="button"
                    onClick={() => setNewAssessment({ ...newAssessment, includeInFinalResult: !newAssessment.includeInFinalResult })}
                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all ${
                      newAssessment.includeInFinalResult
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    {newAssessment.includeInFinalResult ? "YES — Include on Result" : "NO — Class Record Only"}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  {newAssessment.includeInFinalResult 
                    ? "✓ This assessment contributes to official report cards according to admin weighting." 
                    : "✗ Stored in system for teacher tracking only; does not affect official final result."}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddAssessmentOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  Create Assessment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESULT PREVIEW BEFORE PUBLISHING (Requirement 6) */}
      {previewStudent && previewDraft && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-700">
                  Result Preview & Publish Console
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Terminal Academic & Attendance Verification: {previewStudent.name}
                </h3>
              </div>
              <button 
                onClick={() => { setPreviewStudent(null); setPreviewDraft(null); }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            {/* PREVIEW DETAILS TABLE */}
            <div className="space-y-5 text-xs">
              {/* Bio & Result Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-semibold">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Student ID:</span>
                  <span className="text-brand-900 font-mono font-bold">{previewStudent.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Class:</span>
                  <span className="text-slate-900 font-bold">{previewDraft.class}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Subject:</span>
                  <span className="text-slate-900 font-bold">{previewDraft.subject}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Session & Term:</span>
                  <span className="text-slate-900 font-bold">{previewDraft.session} ({previewDraft.term})</span>
                </div>
              </div>

              {/* Assessment Scores Breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                      <th className="p-2.5">Assessment Component</th>
                      <th className="p-2.5 text-center">Score</th>
                      <th className="p-2.5 text-center">Weighting Contribution</th>
                      <th className="p-2.5 text-right">Status on Official Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">First Test</td>
                      <td className="p-2.5 text-center font-mono font-bold">{previewDraft.firstTest || 16} / 20</td>
                      <td className="p-2.5 text-center font-semibold text-slate-600">10% of Final Total</td>
                      <td className="p-2.5 text-right text-emerald-700 font-bold">✓ Included</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">Second Test</td>
                      <td className="p-2.5 text-center font-mono font-bold">{previewDraft.secondTest || 18} / 20</td>
                      <td className="p-2.5 text-center font-semibold text-slate-600">10% of Final Total</td>
                      <td className="p-2.5 text-right text-emerald-700 font-bold">✓ Included</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-purple-900">CBT Examination</td>
                      <td className="p-2.5 text-center font-mono font-bold text-purple-700">{previewDraft.cbtScore || 25} / 30</td>
                      <td className="p-2.5 text-center font-semibold text-slate-600">10% of Final Total</td>
                      <td className="p-2.5 text-right text-emerald-700 font-bold">
                        {previewDraft.includeCbtInResult ? "✓ Recorded on Result" : "✗ Internal Record Only"}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-800">Official Terminal Examination</td>
                      <td className="p-2.5 text-center font-mono font-bold">{previewDraft.examination || 50} / 60</td>
                      <td className="p-2.5 text-center font-semibold text-slate-600">60% of Final Total</td>
                      <td className="p-2.5 text-right text-emerald-700 font-bold">✓ Included</td>
                    </tr>
                    <tr className="bg-emerald-50/60 font-black border-t-2 border-emerald-200">
                      <td className="p-3 text-emerald-950 uppercase">Final Total Score & Grade</td>
                      <td className="p-3 text-center font-mono text-base text-emerald-900">{previewDraft.totalScore || 89} / 100</td>
                      <td className="p-3 text-center text-sm font-black text-brand-900">Grade: {previewDraft.grade || "A"}</td>
                      <td className="p-3 text-right text-emerald-800">Remark: Excellent</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Attendance Record Section (Requirement 1 & 7) */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Terminal Attendance Verification (Live Calculated)
                </h4>
                <AttendanceRecordTable 
                  attendance={calculateStudentAttendanceStats(previewStudent.id, previewDraft.session, previewDraft.term, previewDraft.class)} 
                />
              </div>

              {/* Action Buttons: SAVE DRAFT, SUBMIT RESULT, FINALIZE RESULT (Requirement 6) */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">Current Result Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    previewDraft.status === "Finalized" ? "bg-emerald-100 text-emerald-800" :
                    previewDraft.status === "Submitted" ? "bg-blue-100 text-blue-800" :
                    "bg-amber-100 text-amber-800"
                  }`}>
                    {previewDraft.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="text-xs font-bold gap-1.5"
                    onClick={() => handleUpdateDraftStatus("Draft")}
                  >
                    <Save size={14} /> SAVE DRAFT
                  </Button>

                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5"
                    onClick={() => handleUpdateDraftStatus("Submitted")}
                  >
                    <Send size={14} /> SUBMIT RESULT
                  </Button>

                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                    onClick={() => handleUpdateDraftStatus("Finalized")}
                  >
                    <Lock size={14} /> FINALIZE RESULT
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
