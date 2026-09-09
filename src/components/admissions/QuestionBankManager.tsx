import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Download,
  Share2,
  CheckSquare,
  Square,
  Sparkles,
  Award,
  Layers,
  ChevronDown,
  CheckCircle2,
  Calendar,
  X,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button
} from "@/src/components/ui";
import {
  ExamQuestion,
  EntranceExamSchedule,
  QuestionBankItem,
  useAdmissionQuestionBank
} from "../../data/admissionsAndExamData";
import {
  exportExamToPDF,
  exportExamToWord,
  exportExamToCSV,
  exportExamToExcel
} from "../../utils/examDocumentExporter";

interface QuestionBankManagerProps {
  exams: EntranceExamSchedule[];
  onAddQuestionsToExam: (examId: string, questions: ExamQuestion[]) => void;
  officerName: string;
}

export default function QuestionBankManager({
  exams,
  onAddQuestionsToExam,
  officerName
}: QuestionBankManagerProps) {
  const {
    bankQuestions,
    addQuestionToBank,
    updateBankQuestion,
    deleteBankQuestion
  } = useAdmissionQuestionBank();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");

  // Multi-select for reuse / export
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [targetExamForAdd, setTargetExamForAdd] = useState<string>(exams[0]?.id || "");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<QuestionBankItem | null>(null);

  // New Question Form State
  const [manualForm, setManualForm] = useState<{
    subject: string;
    targetClass: string;
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    marks: number;
  }>({
    subject: "Mathematics",
    targetClass: "JSS 1",
    topic: "General",
    difficulty: "Medium",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    marks: 2
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return bankQuestions.filter(q => {
      const matchSearch =
        searchTerm === "" ||
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.options.some(o => o.toLowerCase().includes(searchTerm.toLowerCase())) ||
        q.explanation?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSubj = selectedSubject === "all" || q.subject === selectedSubject;
      const matchClass = selectedClass === "all" || q.targetClass === selectedClass;
      const matchDiff = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
      const matchSource = selectedSource === "all" || q.source === selectedSource;

      return matchSearch && matchSubj && matchClass && matchDiff && matchSource;
    });
  }, [bankQuestions, searchTerm, selectedSubject, selectedClass, selectedDifficulty, selectedSource]);

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedBankIds.length === filteredQuestions.length) {
      setSelectedBankIds([]);
    } else {
      setSelectedBankIds(filteredQuestions.map(q => q.bankId));
    }
  };

  const toggleSelectOne = (bankId: string) => {
    setSelectedBankIds(prev =>
      prev.includes(bankId) ? prev.filter(id => id !== bankId) : [...prev, bankId]
    );
  };

  // Add selected questions into scheduled examination (Reuse Workflow)
  const handleAddSelectedToExam = () => {
    if (selectedBankIds.length === 0) {
      alert("Please select at least one question to add.");
      return;
    }
    if (!targetExamForAdd) {
      alert("Please select a target entrance examination.");
      return;
    }

    const selectedQuestions = bankQuestions.filter(q => selectedBankIds.includes(q.bankId));
    onAddQuestionsToExam(targetExamForAdd, selectedQuestions);
    showToast(`Added ${selectedQuestions.length} questions to examination!`);
    setSelectedBankIds([]);
  };

  // Delete selected questions
  const handleDeleteSelected = () => {
    if (selectedBankIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedBankIds.length} questions from the Question Bank?`)) {
      selectedBankIds.forEach(id => deleteBankQuestion(id));
      setSelectedBankIds([]);
      showToast("Selected questions removed from Question Bank.");
    }
  };

  // Export handlers
  const handleExport = (format: "pdf" | "word" | "csv", isAnswerKey = false) => {
    const toExport =
      selectedBankIds.length > 0
        ? bankQuestions.filter(q => selectedBankIds.includes(q.bankId))
        : filteredQuestions;

    if (toExport.length === 0) {
      alert("No questions available to export.");
      return;
    }

    const meta = {
      examTitle: `Question Bank Extract (${toExport.length} Questions)`,
      subject: selectedSubject === "all" ? "Combined Subjects" : selectedSubject,
      targetClass: selectedClass === "all" ? "All Levels" : selectedClass,
      academicSession: "2026/2027 Session"
    };

    if (format === "pdf") {
      exportExamToPDF(toExport, meta, isAnswerKey);
    } else if (format === "word") {
      exportExamToWord(toExport, meta, isAnswerKey);
    } else {
      exportExamToCSV(toExport, meta, isAnswerKey);
    }

    showToast(`Exported ${toExport.length} questions as ${format.toUpperCase()}!`);
  };

  // Submit manual add question
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.question.trim()) {
      alert("Please enter a question prompt.");
      return;
    }
    const cleanOpts = manualForm.options.map(o => o.trim()).filter(Boolean);
    if (cleanOpts.length < 2) {
      alert("Please provide at least 2 options.");
      return;
    }

    addQuestionToBank({
      id: `QB-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      subject: manualForm.subject,
      targetClass: manualForm.targetClass,
      topic: manualForm.topic.trim() || "General",
      difficulty: manualForm.difficulty,
      type: "MCQ",
      question: manualForm.question.trim(),
      options: cleanOpts,
      correctAnswer: manualForm.correctAnswer || cleanOpts[0],
      explanation: manualForm.explanation.trim() || "Author verified solution.",
      marks: Number(manualForm.marks) || 2,
      source: "Manual",
      addedBy: officerName,
      timesUsed: 0
    });

    setIsAddModalOpen(false);
    setManualForm({
      subject: "Mathematics",
      targetClass: "JSS 1",
      topic: "General",
      difficulty: "Medium",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      marks: 2
    });
    showToast("Question saved to Permanent Question Bank!");
  };

  // Submit edit
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateBankQuestion(editingItem.bankId, {
      question: editingItem.question,
      options: editingItem.options,
      correctAnswer: editingItem.correctAnswer,
      explanation: editingItem.explanation,
      marks: editingItem.marks,
      difficulty: editingItem.difficulty,
      topic: editingItem.topic
    });

    setEditingItem(null);
    showToast("Question updated in bank!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold border border-indigo-500/40 animate-in slide-in-from-bottom">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <Card className="border-slate-200">
        <CardHeader className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                Permanent Repository
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Total Questions in Bank: <strong>{bankQuestions.length}</strong>
              </span>
            </div>
            <CardTitle className="text-xl font-black font-heading text-slate-900 mt-1 flex items-center gap-2">
              <BookOpen className="text-indigo-600" />
              Admission Officer Question Bank
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Archive and reuse validated examination items across entrance testing cycles, or export complete question papers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-9"
            >
              <Plus size={15} /> Add Question Manually
            </Button>

            {/* Export Dropdown */}
            <div className="relative group">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs gap-1.5 h-9"
              >
                <Download size={14} /> Export ({selectedBankIds.length || filteredQuestions.length}) <ChevronDown size={13} />
              </Button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-30 bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-56 text-xs text-slate-700">
                <button
                  onClick={() => handleExport("pdf", false)}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 font-semibold"
                >
                  <FileText size={14} className="text-rose-600" /> Question Paper PDF (.pdf)
                </button>
                <button
                  onClick={() => handleExport("pdf", true)}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 font-semibold text-emerald-800"
                >
                  <FileText size={14} className="text-emerald-600" /> Answer Key PDF (.pdf)
                </button>
                <button
                  onClick={() => handleExport("word", false)}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 font-semibold"
                >
                  <FileText size={14} className="text-blue-600" /> Microsoft Word (.docx)
                </button>
                <button
                  onClick={() => handleExport("csv", false)}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 font-semibold"
                >
                  <FileSpreadsheet size={14} className="text-slate-600" /> Export CSV (.csv)
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Filter Controls */}
        <CardContent className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search questions or topics..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Subject Filter */}
            <div>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium"
              >
                <option value="all">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English Language">English Language</option>
                <option value="Basic Science">Basic Science</option>
                <option value="General Aptitude">General Aptitude</option>
                <option value="Social Studies">Social Studies</option>
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium"
              >
                <option value="all">All Target Classes</option>
                <option value="JSS 1">JSS 1</option>
                <option value="JSS 2">JSS 2</option>
                <option value="JSS 3">JSS 3</option>
                <option value="SSS 1">SSS 1</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <select
                value={selectedSource}
                onChange={e => setSelectedSource(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium"
              >
                <option value="all">All Sources</option>
                <option value="AI Generated">AI Generated</option>
                <option value="Manual">Manual Author</option>
              </select>
            </div>
          </div>

          {/* Bulk Selection Actions Bar */}
          {selectedBankIds.length > 0 && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-900">
                <CheckCircle2 size={16} className="text-indigo-600" />
                <span>{selectedBankIds.length} question(s) selected</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Add to:</span>
                <select
                  value={targetExamForAdd}
                  onChange={e => setTargetExamForAdd(e.target.value)}
                  className="p-1.5 border rounded-lg bg-white font-semibold text-xs"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={handleAddSelectedToExam}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8"
                >
                  Add to Exam
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteSelected}
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs h-8"
                >
                  <Trash2 size={13} /> Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {/* Question Items List */}
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 font-bold hover:text-slate-900"
            >
              {selectedBankIds.length === filteredQuestions.length && filteredQuestions.length > 0 ? (
                <CheckSquare size={16} className="text-indigo-600" />
              ) : (
                <Square size={16} />
              )}
              <span>Select All Displayed ({filteredQuestions.length})</span>
            </button>
            <span>
              Showing {filteredQuestions.length} of {bankQuestions.length} repository questions
            </span>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium border border-dashed rounded-xl space-y-2">
              <BookOpen size={32} className="mx-auto text-slate-300" />
              <p>No questions matched your search or filters.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubject("all");
                  setSelectedClass("all");
                  setSelectedDifficulty("all");
                }}
                className="text-xs"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const isSelected = selectedBankIds.includes(q.bankId);

              return (
                <div
                  key={q.bankId}
                  className={`p-4 sm:p-5 rounded-xl border transition-all text-xs space-y-3 ${
                    isSelected
                      ? "bg-indigo-50/50 border-indigo-400 ring-1 ring-indigo-400"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => toggleSelectOne(q.bankId)}
                        className="text-slate-500 hover:text-indigo-600"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-indigo-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>

                      <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {q.subject}
                      </span>
                      <span className="font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {q.targetClass || "JSS 1"}
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          q.difficulty === "Easy"
                            ? "bg-emerald-100 text-emerald-800"
                            : q.difficulty === "Hard"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {q.difficulty || "Medium"}
                      </span>
                      {q.topic && (
                        <span className="text-slate-400 text-[11px]">Topic: {q.topic}</span>
                      )}
                      {q.source && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          [{q.source}]
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingItem(q)}
                        className="text-[11px] h-7 px-2"
                      >
                        <Edit3 size={12} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm("Delete this question from bank?")) {
                            deleteBankQuestion(q.bankId);
                            showToast("Question deleted.");
                          }
                        }}
                        className="text-[11px] h-7 px-2 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-slate-900 leading-snug">{q.question}</p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options?.map((opt, optIdx) => {
                      const isCorrect =
                        opt.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-lg border flex items-center justify-between ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400 w-4">
                              {String.fromCharCode(65 + optIdx)}:
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isCorrect && (
                            <span className="text-[10px] text-emerald-700 font-bold">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-md">
                      <strong>Solution:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: ADD QUESTION TO BANK */}
      {/* --------------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between sticky top-0">
              <h3 className="font-bold text-base">Add New Question to Permanent Bank</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitManual} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={manualForm.subject}
                    onChange={e => setManualForm({ ...manualForm, subject: e.target.value })}
                    className="w-full p-2 border rounded-xl font-bold"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="English Language">English Language</option>
                    <option value="Basic Science">Basic Science</option>
                    <option value="General Aptitude">General Aptitude</option>
                    <option value="Social Studies">Social Studies</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Class</label>
                  <select
                    value={manualForm.targetClass}
                    onChange={e => setManualForm({ ...manualForm, targetClass: e.target.value })}
                    className="w-full p-2 border rounded-xl font-bold"
                  >
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SSS 1">SSS 1</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Text</label>
                <textarea
                  rows={3}
                  value={manualForm.question}
                  onChange={e => setManualForm({ ...manualForm, question: e.target.value })}
                  placeholder="Enter the entrance exam question..."
                  className="w-full p-2.5 border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Options</label>
                {manualForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 font-bold text-slate-500">{String.fromCharCode(65 + idx)}:</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...manualForm.options];
                        newOpts[idx] = e.target.value;
                        setManualForm({ ...manualForm, options: newOpts });
                      }}
                      className="flex-1 p-2 border rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, correctAnswer: opt })}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] ${
                        manualForm.correctAnswer === opt && opt !== ""
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {manualForm.correctAnswer === opt && opt !== "" ? "✓ Correct" : "Mark"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={manualForm.difficulty}
                    onChange={e => setManualForm({ ...manualForm, difficulty: e.target.value as any })}
                    className="w-full p-2 border rounded-xl font-bold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={manualForm.topic}
                    onChange={e => setManualForm({ ...manualForm, topic: e.target.value })}
                    className="w-full p-2 border rounded-xl font-medium"
                    placeholder="e.g. Fractions"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={manualForm.marks}
                    onChange={e => setManualForm({ ...manualForm, marks: Number(e.target.value) || 2 })}
                    className="w-full p-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation</label>
                <textarea
                  rows={2}
                  value={manualForm.explanation}
                  onChange={e => setManualForm({ ...manualForm, explanation: e.target.value })}
                  className="w-full p-2 border rounded-xl font-medium"
                  placeholder="Solution steps for marking guide..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Save to Question Bank
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: EDIT QUESTION IN BANK */}
      {/* --------------------------------------------------------------------- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between sticky top-0">
              <h3 className="font-bold text-base">Edit Question in Bank</h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Prompt</label>
                <textarea
                  rows={3}
                  value={editingItem.question}
                  onChange={e => setEditingItem({ ...editingItem, question: e.target.value })}
                  className="w-full p-2.5 border rounded-xl font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Options</label>
                {editingItem.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 font-bold text-slate-500">{String.fromCharCode(65 + idx)}:</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...editingItem.options];
                        newOpts[idx] = e.target.value;
                        setEditingItem({ ...editingItem, options: newOpts });
                      }}
                      className="flex-1 p-2 border rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, correctAnswer: opt })}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] ${
                        editingItem.correctAnswer === opt
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {editingItem.correctAnswer === opt ? "✓ Correct" : "Mark"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correct Answer</label>
                  <select
                    value={editingItem.correctAnswer}
                    onChange={e => setEditingItem({ ...editingItem, correctAnswer: e.target.value })}
                    className="w-full p-2 border rounded-xl font-bold"
                  >
                    {editingItem.options.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        Option {String.fromCharCode(65 + idx)}: {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    value={editingItem.marks || 2}
                    onChange={e => setEditingItem({ ...editingItem, marks: Number(e.target.value) || 2 })}
                    className="w-full p-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation</label>
                <textarea
                  rows={2}
                  value={editingItem.explanation || ""}
                  onChange={e => setEditingItem({ ...editingItem, explanation: e.target.value })}
                  className="w-full p-2 border rounded-xl font-medium"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Update Question
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
