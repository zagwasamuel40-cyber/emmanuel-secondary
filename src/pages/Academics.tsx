import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";

import { CLASSES } from "../data/studentsData";
import { useSessions, TERMS } from "../data/sessionsData";

import { useAssignments } from "../data/assignmentsData";
import { useExams, Exam, Question, defaultQuestionsMap } from "../data/examsData";

import { Sparkles , Download } from "lucide-react";

import { 
  BookOpen, GraduationCap, Award, Calendar, FileText, Plus, BookCheck, X, 
  Play, Edit, Trash2, HelpCircle, CheckCircle, AlertCircle, Clock, Check, ArrowRight, ArrowLeft, RefreshCw
} from "lucide-react";

const initialSubjects = [
  { id: 1, name: "Mathematics", level: "Senior Secondary", classes: 6, status: "Active" },
  { id: 2, name: "English Language", level: "Senior Secondary", classes: 6, status: "Active" },
  { id: 3, name: "Basic Science", level: "Junior Secondary", classes: 9, status: "Active" },
  { id: 4, name: "Physics", level: "SSS Science", classes: 3, status: "Active" },
  { id: 5, name: "Civic Education", level: "All Levels", classes: 15, status: "Active" },
];

export default function Academics() {
  const [sessions] = useSessions();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);
  const [newSubject, setNewSubject] = useState({
    name: "",
    level: "All Levels",
    classes: ""
  });

  const { exams, setExams } = useExams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [questionModalExam, setQuestionModalExam] = useState<Exam | null>(null);
  const [activeCbtExam, setActiveCbtExam] = useState<Exam | null>(null);

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


  // CBT Exam Creation state
  const [newExam, setNewExam] = useState({
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
  , topics: '', accessCode: ''});
  const [isGenerating, setIsGenerating] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Question Form State (for question editor)
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    optA: "",
    optB: "",
    optC: "",
    optD: "",
    correctOption: 0
  });

  // Interactive CBT Player state
  const [cbtStep, setCbtStep] = useState<"intro" | "testing" | "result">("intro");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [cbtScore, setCbtScore] = useState({ score: 0, total: 0, percentage: 0 });

  const downloadCbt = (exam: Exam) => {
    if (!exam.questions || exam.questions.length === 0) {
      setNotificationMsg("No questions available to download.");
      setTimeout(() => setNotificationMsg(""), 3000);
      return;
    }
    const lines = [`${exam.title} - ${exam.subject} CBT Questions`, ""];
    exam.questions.forEach((q, i) => {
      lines.push(`Q${i + 1}: ${q.text}`);
      q.options.forEach((opt, oi) => {
        lines.push(`  ${String.fromCharCode(65 + oi)}. ${opt}`);
      });
      lines.push(`  Correct Answer: ${q.options[q.correctOption]}`);
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.title}_CBT.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };


  // Handle Exam Creation
  
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    let generatedQuestions = [...defaultQuestionsMap.default];
    if (newExam.aiMode) {
        setIsGenerating(true);
        setNotificationMsg("Generating CBT questions using AI...");
        try {
            const response = await fetch("/api/generate-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    className: newExam.targetClass, 
                    subject: newExam.subject, 
                    count: parseInt(newExam.questionsCount) || 10,
                    topics: newExam.topics 
                })
            });
            const data = await response.json();
            if (response.ok && data.questions && Array.isArray(data.questions)) {
                generatedQuestions = data.questions.map((q, index) => ({
                    id: index + 1,
                    text: q.text,
                    options: q.options,
                    correctOption: q.options.indexOf(q.answer) !== -1 ? q.options.indexOf(q.answer) : 0
                }));
                setNotificationMsg("Successfully generated CBT questions!");
            } else {
                setNotificationMsg("AI generation failed, using fallback questions.");
            }
        } catch (error) {
            console.error(error);
            setNotificationMsg("AI generation failed, using fallback questions.");
        }
        setIsGenerating(false);
        setTimeout(() => setNotificationMsg(""), 3000);
    }

    const newId = exams.length ? Math.max(...exams.map(e => e.id)) + 1 : 1;
    
    const formattedDate = new Date(newExam.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const createdExam: Exam = {
      id: newId,
      title: newExam.title,
      subject: newExam.subject,
      targetClass: newExam.targetClass,
      type: newExam.type,
      date: formattedDate,
      duration: parseInt(newExam.duration) || 45,
      passMark: parseInt(newExam.passMark) || 50,
      status: "Upcoming",
      questions: generatedQuestions,
      accessCode: newExam.accessCode
    };

    setExams([createdExam, ...exams]);
    setIsCreateModalOpen(false);
    setNewExam({
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
      aiMode: true,
      topics: "",
      accessCode: ""
    });
  };


  // Handle Exam Update
  const handleUpdateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;
    setExams(exams.map(ex => ex.id === editingExam.id ? editingExam : ex));
    setEditingExam(null);
  };

  // Delete Exam
  const handleDeleteExam = (id: number) => {
    if (confirm("Are you sure you want to delete this examination?")) {
      setExams(exams.filter(ex => ex.id !== id));
    }
  };

  // Add Question to Exam
  const handleAddQuestionToExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionModalExam) return;

    const q: Question = {
      id: questionModalExam.questions.length + 1,
      text: newQuestion.text,
      options: [newQuestion.optA, newQuestion.optB, newQuestion.optC, newQuestion.optD],
      correctOption: newQuestion.correctOption
    };

    const updatedExam = {
      ...questionModalExam,
      questions: [...questionModalExam.questions, q]
    };

    setQuestionModalExam(updatedExam);
    setExams(exams.map(ex => ex.id === updatedExam.id ? updatedExam : ex));
    setNewQuestion({ text: "", optA: "", optB: "", optC: "", optD: "", correctOption: 0 });
  };

  // Delete Question from Exam
  const handleDeleteQuestion = (qId: number) => {
    if (!questionModalExam) return;
    const updatedExam = {
      ...questionModalExam,
      questions: questionModalExam.questions.filter(q => q.id !== qId)
    };
    setQuestionModalExam(updatedExam);
    setExams(exams.map(ex => ex.id === updatedExam.id ? updatedExam : ex));
  };

  // Handle Subject Creation
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = subjects.length ? Math.max(...subjects.map(s => s.id)) + 1 : 1;
    
    setSubjects([{
      id: newId,
      name: newSubject.name,
      level: newSubject.level,
      classes: parseInt(newSubject.classes) || 0,
      status: "Active"
    }, ...subjects]);
    setIsAddSubjectModalOpen(false);
    setNewSubject({ name: "", level: "All Levels", classes: "" });
  };

  // Handle Subject Update
  const handleUpdateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    setSubjects(subjects.map(s => s.id === editingSubject.id ? editingSubject : s));
    setEditingSubject(null);
  };

  // Delete Subject
  const handleDeleteSubject = (id: number) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  // Start CBT Exam
  const startCbtExam = (exam: Exam) => {
    setActiveCbtExam(exam);
    setCbtStep("intro");
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setTimeRemaining(exam.duration * 60);
  };

  // Submit CBT Exam
  const submitCbt = () => {
    if (!activeCbtExam) return;
    let score = 0;
    activeCbtExam.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOption) {
        score++;
      }
    });
    const percentage = Math.round((score / (activeCbtExam.questions.length || 1)) * 100);
    setCbtScore({ score, total: activeCbtExam.questions.length, percentage });
    setCbtStep("result");
  };

  return (
    <div className="space-y-6">

      {notificationMsg && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl z-[60] flex items-center gap-2">
          <span>{notificationMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">Academic & CBT Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage curriculum, subjects, Computer Based Tests (CBT), and examination portals.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-white" onClick={() => setIsAddSubjectModalOpen(true)}>
            <Plus size={16} />
            Add Subject
          </Button>
          <Button variant="brand" className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} />
            Create CBT Exam
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Subjects</p>
                <h4 className="text-2xl font-bold font-heading text-slate-900">{subjects.length}</h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                <BookOpen size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">CBT Exams Ready</p>
                <h4 className="text-2xl font-bold font-heading text-slate-900">
                  {exams.filter(e => e.type === "CBT" || e.type.includes("CBT")).length}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-50 text-brand-600">
                <BookCheck size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Examinations</p>
                <h4 className="text-2xl font-bold font-heading text-slate-900">{exams.length}</h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
                <Calendar size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Avg Pass Rate</p>
                <h4 className="text-2xl font-bold font-heading text-slate-900">88.5%</h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
                <Award size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects List */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle>Curriculum & Subjects ({subjects.length})</CardTitle>
            <Button variant="ghost" size="sm" className="text-brand-600 gap-1" onClick={() => setIsAddSubjectModalOpen(true)}>
              <Plus size={14} /> Add Subject
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
              {subjects.map((subject) => (
                <div key={subject.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{subject.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{subject.level} &middot; {subject.classes} Classes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      {subject.status}
                    </span>
                    <button 
                      onClick={() => setEditingSubject({...subject})} 
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Subject"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSubject(subject.id)} 
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exams & CBT List */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle>Examinations & CBT Tests ({exams.length})</CardTitle>
            <Button variant="ghost" size="sm" className="text-brand-600 gap-1" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={14} /> New Exam
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
              {exams.map((exam) => (
                <div key={exam.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{exam.title}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        exam.type.includes('CBT') ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {exam.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {exam.subject || "General"} &middot; {exam.targetClass || "All"} &middot; {exam.date} &middot; {exam.duration} mins
                    </p>
                    <p className="text-xs text-brand-600 font-medium">
                      {exam.questions.length} Questions configured
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button 
                      size="sm" 
                      variant="brand" 
                      className="gap-1 text-xs py-1 h-8"
                      onClick={() => startCbtExam(exam)}
                    >
                      <Play size={14} /> Take / Test CBT
                    </Button>
                    
                    <button 
                      onClick={() => downloadCbt(exam)} 
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Download CBT Questions"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => setQuestionModalExam(exam)} 
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Manage Questions"
                    >
                      <HelpCircle size={16} />
                    </button>
                    <button 
                      onClick={() => setEditingExam({...exam})} 
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Exam Settings"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteExam(exam.id)} 
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      
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

      {/* Create CBT Exam Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle>Create New Examination / CBT</CardTitle>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleCreateExam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input 
                    id="title" 
                    required 
                    value={newExam.title}
                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                    placeholder="e.g. First Term Mathematics CBT"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <select 
                      id="subject" 
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={newExam.subject}
                      onChange={(e) => setNewExam({...newExam, subject: e.target.value})}
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
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
                  </div>
                </div>


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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Assessment Format</Label>
                    <select 
                      id="type" 
                      required
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={newExam.type}
                      onChange={(e) => setNewExam({...newExam, type: e.target.value})}
                    >
                      <option value="CBT">CBT (Computer Based Test)</option>
                      <option value="CBT / Theory">CBT + Theory Hybrid</option>
                      <option value="Continuous Assessment">Continuous Assessment</option>
                      <option value="Finals">Finals</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Scheduled Date</Label>
                    <Input 
                      id="date" 
                      type="date"
                      required 
                      value={newExam.date}
                      onChange={(e) => setNewExam({...newExam, date: e.target.value})}
                    />
                  </div>
                </div>


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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topics">Topics (Optional, for AI)</Label>
                    <Input 
                      id="topics" 
                      value={newExam.topics}
                      onChange={(e) => setNewExam({...newExam, topics: e.target.value})}
                      placeholder="e.g. Algebra, Geometry"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accessCode">Access Code (PIN) (Optional)</Label>
                    <Input 
                      id="accessCode" 
                      value={newExam.accessCode}
                      onChange={(e) => setNewExam({...newExam, accessCode: e.target.value})}
                      placeholder="e.g. 1234"
                    />
                  </div>
                </div>

<div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Minutes)</Label>
                    <Input 
                      id="duration" 
                      type="number"
                      min="1"
                      required 
                      value={newExam.duration}
                      onChange={(e) => setNewExam({...newExam, duration: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passMark">Pass Mark (%)</Label>
                    <Input 
                      id="passMark" 
                      type="number"
                      min="1"
                      max="100"
                      required 
                      value={newExam.passMark}
                      onChange={(e) => setNewExam({...newExam, passMark: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg text-xs text-brand-800">
                  ⚡ <strong>Auto CBT Setup:</strong> Creating this exam pre-loads standard CBT test questions so students can immediately take the exam or practice in the portal.
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="brand" className="w-full" disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Save & Publish CBT Exam"}
                    Save & Publish CBT Exam
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Exam Settings Modal */}
      {editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle>Edit Exam: {editingExam.title}</CardTitle>
              <button onClick={() => setEditingExam(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleUpdateExam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Exam Title</Label>
                  <Input 
                    id="edit-title" 
                    required 
                    value={editingExam.title}
                    onChange={(e) => setEditingExam({...editingExam, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject">Subject</Label>
                    <Input 
                      id="edit-subject" 
                      required 
                      value={editingExam.subject}
                      onChange={(e) => setEditingExam({...editingExam, subject: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-class">Target Class</Label>
                    <Input 
                      id="edit-class" 
                      required 
                      value={editingExam.targetClass}
                      onChange={(e) => setEditingExam({...editingExam, targetClass: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Format</Label>
                    <select 
                      id="edit-type" 
                      required
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={editingExam.type}
                      onChange={(e) => setEditingExam({...editingExam, type: e.target.value})}
                    >
                      <option value="CBT">CBT</option>
                      <option value="CBT / Theory">CBT / Theory</option>
                      <option value="Continuous Assessment">Continuous Assessment</option>
                      <option value="Finals">Finals</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration (Mins)</Label>
                    <Input 
                      id="edit-duration" 
                      type="number"
                      required 
                      value={editingExam.duration}
                      onChange={(e) => setEditingExam({...editingExam, duration: parseInt(e.target.value) || 30})}
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setEditingExam(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="brand" className="w-full">
                    Update Exam Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Question Builder / Questions Manager Modal */}
      {questionModalExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-3xl border-0 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <CardTitle className="text-lg">CBT Question Bank: {questionModalExam.title}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">{questionModalExam.questions.length} questions configured</p>
              </div>
              <button onClick={() => setQuestionModalExam(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Existing Questions list */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800">Current Questions</h4>
                {questionModalExam.questions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No questions added yet. Use the form below to add questions.</p>
                ) : (
                  <div className="space-y-3">
                    {questionModalExam.questions.map((q, idx) => (
                      <div key={q.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm relative group">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-semibold text-slate-900">Q{idx + 1}. {q.text}</p>
                          <button 
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-slate-400 hover:text-rose-600 shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`px-2.5 py-1.5 rounded border ${
                              oIdx === q.correctOption 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium' 
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correctOption && '✓'}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Question Form */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Plus size={16} className="text-brand-600" /> Add New Multiple Choice Question
                </h4>
                <form onSubmit={handleAddQuestionToExam} className="space-y-3">
                  <div>
                    <Label htmlFor="q-text" className="text-xs">Question Prompt</Label>
                    <Input 
                      id="q-text" 
                      required 
                      value={newQuestion.text} 
                      onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                      placeholder="e.g. What is the derivative of x^2?"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="opt-a" className="text-xs">Option A</Label>
                      <Input 
                        id="opt-a" 
                        required 
                        value={newQuestion.optA} 
                        onChange={(e) => setNewQuestion({...newQuestion, optA: e.target.value})}
                        placeholder="Option A text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="opt-b" className="text-xs">Option B</Label>
                      <Input 
                        id="opt-b" 
                        required 
                        value={newQuestion.optB} 
                        onChange={(e) => setNewQuestion({...newQuestion, optB: e.target.value})}
                        placeholder="Option B text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="opt-c" className="text-xs">Option C</Label>
                      <Input 
                        id="opt-c" 
                        required 
                        value={newQuestion.optC} 
                        onChange={(e) => setNewQuestion({...newQuestion, optC: e.target.value})}
                        placeholder="Option C text"
                      />
                    </div>
                    <div>
                      <Label htmlFor="opt-d" className="text-xs">Option D</Label>
                      <Input 
                        id="opt-d" 
                        required 
                        value={newQuestion.optD} 
                        onChange={(e) => setNewQuestion({...newQuestion, optD: e.target.value})}
                        placeholder="Option D text"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="correct-opt" className="text-xs">Correct Option</Label>
                    <select 
                      id="correct-opt" 
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={newQuestion.correctOption}
                      onChange={(e) => setNewQuestion({...newQuestion, correctOption: parseInt(e.target.value)})}
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                  <Button type="submit" variant="brand" className="w-full gap-2">
                    <Plus size={16} /> Add Question to CBT Exam
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interactive CBT Test Player Modal */}
      {activeCbtExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <Card className="w-full max-w-4xl border-0 shadow-2xl overflow-hidden bg-white max-h-[92vh] flex flex-col">
            {/* CBT Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-500 text-white uppercase tracking-wider">CBT Examination Portal</span>
                <h3 className="text-lg font-bold font-heading mt-1">{activeCbtExam.title}</h3>
                <p className="text-xs text-slate-400">{activeCbtExam.subject} &middot; {activeCbtExam.targetClass}</p>
              </div>
              <button 
                onClick={() => setActiveCbtExam(null)} 
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {cbtStep === "intro" && (
                <div className="max-w-xl mx-auto py-8 text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                    <BookCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading text-slate-900">Ready to begin CBT Examination?</h3>
                    <p className="text-slate-500 text-sm mt-1">Please read the instructions carefully before launching the test player.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs">
                    <div>
                      <p className="text-slate-400 font-medium">Duration</p>
                      <p className="text-slate-900 font-bold text-sm mt-0.5">{activeCbtExam.duration} Minutes</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Total Questions</p>
                      <p className="text-slate-900 font-bold text-sm mt-0.5">{activeCbtExam.questions.length} Questions</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Pass Mark</p>
                      <p className="text-slate-900 font-bold text-sm mt-0.5">{activeCbtExam.passMark}%</p>
                    </div>
                  </div>

                  <div className="text-left text-xs space-y-2 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900">
                    <p className="font-semibold">⚠️ Exam Instructions:</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-800">
                      <li>Once started, the timer cannot be paused.</li>
                      <li>You can navigate back and forth between questions anytime.</li>
                      <li>Submit only when you have answered all questions.</li>
                    </ul>
                  </div>

                  <Button 
                    variant="brand" 
                    size="lg" 
                    className="w-full gap-2 text-base font-semibold py-3"
                    onClick={() => setCbtStep("testing")}
                  >
                    Start CBT Examination Now <ArrowRight size={18} />
                  </Button>
                </div>
              )}

              {cbtStep === "testing" && activeCbtExam.questions.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Main Question area */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg text-sm">
                      <span className="font-semibold text-slate-700">Question {currentQIndex + 1} of {activeCbtExam.questions.length}</span>
                      <span className="text-xs text-brand-600 font-bold uppercase">Multi-Choice</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-base font-semibold text-slate-900 leading-relaxed">
                        {activeCbtExam.questions[currentQIndex]?.text}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 pl-4">
                      {activeCbtExam.questions[currentQIndex]?.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[currentQIndex] === oIdx;
                        return (
                          <label key={oIdx} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            isSelected ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-brand-600' : 'border-slate-300'
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                            </div>
                            <span className="font-bold text-slate-700 text-base w-6">{String.fromCharCode(65 + oIdx)}.</span>
                            <span className="text-base text-slate-800 font-medium">{opt}</span>
                            <input 
                              type="radio" 
                              name={`academic-cbt-${currentQIndex}`} 
                              value={opt} 
                              className="hidden" 
                              checked={isSelected}
                              onChange={() => setSelectedAnswers({ ...selectedAnswers, [currentQIndex]: oIdx })}
                            />
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <Button
                        variant="outline"
                        disabled={currentQIndex === 0}
                        onClick={() => setCurrentQIndex(currentQIndex - 1)}
                        className="gap-2"
                      >
                        <ArrowLeft size={16} /> Previous
                      </Button>

                      {currentQIndex < activeCbtExam.questions.length - 1 ? (
                        <Button
                          variant="brand"
                          onClick={() => setCurrentQIndex(currentQIndex + 1)}
                          className="gap-2"
                        >
                          Next Question <ArrowRight size={16} />
                        </Button>
                      ) : (
                        <Button
                          variant="brand"
                          onClick={submitCbt}
                          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Submit Examination
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Right Navigation & Status sidebar */}
                  <div className="space-y-4">
                    <Card className="border border-slate-200 shadow-none">
                      <CardHeader className="p-4 border-b border-slate-100 pb-3">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase">Question Navigator</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-4 gap-2">
                          {activeCbtExam.questions.map((_, idx) => {
                            const isAnswered = selectedAnswers[idx] !== undefined;
                            const isCurrent = currentQIndex === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => setCurrentQIndex(idx)}
                                className={`h-10 rounded-lg text-xs font-bold transition-all border ${
                                  isCurrent
                                    ? 'border-brand-600 bg-brand-600 text-white ring-2 ring-brand-600/30'
                                    : isAnswered
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {idx + 1}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block"></span>
                            <span>Answered ({Object.keys(selectedAnswers).length})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200 inline-block"></span>
                            <span>Unanswered ({activeCbtExam.questions.length - Object.keys(selectedAnswers).length})</span>
                          </div>
                        </div>

                        <Button 
                          variant="brand" 
                          className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={submitCbt}
                        >
                          Submit CBT Exam
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {cbtStep === "result" && (
                <div className="max-w-xl mx-auto py-6 text-center space-y-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold ${
                    cbtScore.percentage >= activeCbtExam.passMark 
                      ? 'bg-emerald-100 text-emerald-600 border-4 border-emerald-200' 
                      : 'bg-rose-100 text-rose-600 border-4 border-rose-200'
                  }`}>
                    {cbtScore.percentage}%
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold font-heading text-slate-900">
                      {cbtScore.percentage >= activeCbtExam.passMark ? "Congratulations! Exam Passed 🎉" : "Examination Completed"}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      You answered {cbtScore.score} out of {cbtScore.total} questions correctly.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
                    <div>
                      <p className="text-slate-400 font-medium">Score</p>
                      <p className="text-slate-900 font-bold text-base mt-0.5">{cbtScore.score}/{cbtScore.total}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Percentage</p>
                      <p className="text-slate-900 font-bold text-base mt-0.5">{cbtScore.percentage}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Status</p>
                      <p className={`font-bold text-base mt-0.5 ${
                        cbtScore.percentage >= activeCbtExam.passMark ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {cbtScore.percentage >= activeCbtExam.passMark ? 'PASSED' : 'FAILED'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => {
                        setCbtStep("testing");
                        setCurrentQIndex(0);
                        setSelectedAnswers({});
                      }}
                    >
                      <RefreshCw size={16} /> Retake Test
                    </Button>
                    <Button 
                      variant="brand" 
                      className="w-full"
                      onClick={() => setActiveCbtExam(null)}
                    >
                      Done & Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle>Add New Subject</CardTitle>
              <button onClick={() => setIsAddSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectName">Subject Name</Label>
                  <Input 
                    id="subjectName" 
                    required 
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    placeholder="e.g. Biology"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <select 
                    id="level" 
                    required
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={newSubject.level}
                    onChange={(e) => setNewSubject({...newSubject, level: e.target.value})}
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Junior Secondary">Junior Secondary</option>
                    <option value="Senior Secondary">Senior Secondary</option>
                    <option value="SSS Science">SSS Science</option>
                    <option value="SSS Arts">SSS Arts</option>
                    <option value="SSS Commercial">SSS Commercial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classes">Number of Classes</Label>
                  <Input 
                    id="classes" 
                    type="number"
                    min="1"
                    required 
                    value={newSubject.classes}
                    onChange={(e) => setNewSubject({...newSubject, classes: e.target.value})}
                    placeholder="e.g. 6"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setIsAddSubjectModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="brand" className="w-full">
                    Add Subject
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle>Edit Subject</CardTitle>
              <button onClick={() => setEditingSubject(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateSubject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-subjectName">Subject Name</Label>
                  <Input 
                    id="edit-subjectName" 
                    required 
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-subLevel">Level</Label>
                  <select 
                    id="edit-subLevel" 
                    required
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={editingSubject.level}
                    onChange={(e) => setEditingSubject({...editingSubject, level: e.target.value})}
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Junior Secondary">Junior Secondary</option>
                    <option value="Senior Secondary">Senior Secondary</option>
                    <option value="SSS Science">SSS Science</option>
                    <option value="SSS Arts">SSS Arts</option>
                    <option value="SSS Commercial">SSS Commercial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-subClasses">Number of Classes</Label>
                  <Input 
                    id="edit-subClasses" 
                    type="number"
                    min="1"
                    required 
                    value={editingSubject.classes}
                    onChange={(e) => setEditingSubject({...editingSubject, classes: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setEditingSubject(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="brand" className="w-full">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
