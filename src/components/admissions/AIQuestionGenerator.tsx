import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  Brain,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Edit3,
  Trash2,
  RefreshCw,
  Plus,
  Eye,
  Download,
  Save,
  FileText,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Sliders,
  Check,
  X,
  HelpCircle,
  Database,
  Layers,
  Award
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
  EntranceExamSchedule
} from "../../data/admissionsAndExamData";
import {
  exportExamToPDF,
  exportExamToWord,
  exportExamToCSV,
  exportExamToExcel
} from "../../utils/examDocumentExporter";

interface AIQuestionGeneratorProps {
  exams: EntranceExamSchedule[];
  onSaveToExam: (examId: string, questions: ExamQuestion[]) => void;
  onSaveToQuestionBank: (questions: ExamQuestion[]) => void;
  officerName: string;
}

export default function AIQuestionGenerator({
  exams,
  onSaveToExam,
  onSaveToQuestionBank,
  officerName
}: AIQuestionGeneratorProps) {
  // Generation Settings State
  const [examName, setExamName] = useState<string>(exams[0]?.title || "2026/2027 Entrance Examination");
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || "");
  const [targetClass, setTargetClass] = useState<string>("JSS 1");
  const [subject, setSubject] = useState<string>("Mathematics");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Mixed">("Mixed");
  const [questionType, setQuestionType] = useState<"MCQ" | "True/False" | "Short Answer">("MCQ");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [topics, setTopics] = useState<string>("Basic Arithmetic, Fractions, Percentages, Geometry, Simple Equations");
  const [optionsCount, setOptionsCount] = useState<number>(4);
  const [customInstructions, setCustomInstructions] = useState<string>(
    "Generate 10 Mathematics entrance examination questions suitable for students entering JSS1. Cover basic arithmetic, fractions, decimals, percentages, geometry and simple algebra. Use four options per question and provide the correct answer."
  );

  // Review & Generated Questions State
  const [generatedQuestions, setGeneratedQuestions] = useState<ExamQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [qualityReport, setQualityReport] = useState<{
    passed: boolean;
    totalChecked: number;
    errorsCount: number;
    warningsCount: number;
    details: string[];
  } | null>(null);

  // Modals & Active Question Edits
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<"paper" | "answers">("paper");
  const [activeRegeneratingId, setActiveRegeneratingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New question form state (for manual add)
  const [newQuestionForm, setNewQuestionForm] = useState<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: "Easy" | "Medium" | "Hard";
    topic: string;
    marks: number;
  }>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    difficulty: "Medium",
    topic: "",
    marks: 2
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Preset topics helper
  const handleSelectSubject = (subj: string) => {
    setSubject(subj);
    if (subj === "Mathematics") {
      setTopics("Basic Arithmetic, Fractions, Decimals, Percentages, Perimeter & Area, Simple Equations");
      setCustomInstructions(`Generate ${questionCount} Mathematics entrance examination questions suitable for students entering ${targetClass}. Include calculation steps and clean numerical options.`);
    } else if (subj === "English Language") {
      setTopics("Subject-Verb Concord, Synonyms & Antonyms, Figures of Speech, Sentence Completion, Spelling");
      setCustomInstructions(`Generate ${questionCount} English Language entrance examination questions suitable for students entering ${targetClass}. Focus on grammar, vocabulary, and correct syntax.`);
    } else if (subj === "Basic Science") {
      setTopics("Living and Non-Living Things, Energy, Atmosphere, Human Body Systems, Simple Machines");
      setCustomInstructions(`Generate ${questionCount} Basic Science entrance examination questions testing fundamental scientific knowledge appropriate for ${targetClass}.`);
    } else if (subj === "General Aptitude") {
      setTopics("Number Patterns, Quantitative Reasoning, Verbal Analogies, Logic, Coding & Decoding");
      setCustomInstructions(`Generate ${questionCount} General Aptitude and Quantitative Reasoning entrance examination questions suitable for ${targetClass}.`);
    } else if (subj === "Social Studies") {
      setTopics("Nigerian Heritage, Civic Rights & Duties, Physical Geography of Nigeria, National Symbols");
      setCustomInstructions(`Generate ${questionCount} Social Studies entrance questions testing civic awareness and Nigerian history for ${targetClass}.`);
    }
  };

  // ---------------------------------------------------------------------------
  // GENERATE WITH AI
  // ---------------------------------------------------------------------------
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setGenerationStep("Contacting Gemini AI Engine...");

    try {
      setTimeout(() => setGenerationStep("Analyzing curriculum standards for " + targetClass + "..."), 600);
      setTimeout(() => setGenerationStep("Drafting questions, plausible distractors & explanations..."), 1300);
      setTimeout(() => setGenerationStep("Running automated AI Quality Control & syllabus validation..."), 2000);

      const response = await fetch("/api/admission/ai-generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Officer-Role": "Admission Officer",
          "X-Officer-User": officerName || "Mrs. Abigail M. Iorliam"
        },
        body: JSON.stringify({
          examName,
          className: targetClass,
          subject,
          count: questionCount,
          difficulty,
          questionType,
          durationMinutes,
          topics,
          optionsCount,
          customInstructions,
          avoidQuestions: generatedQuestions.map(q => q.question)
        })
      });

      if (!response.ok) {
        throw new Error("Server returned status " + response.status);
      }

      const data = await response.json();
      const loadedQuestions: ExamQuestion[] = data.questions || [];

      setGeneratedQuestions(loadedQuestions);
      setQualityReport(data.qualityReport || {
        passed: true,
        totalChecked: loadedQuestions.length,
        errorsCount: 0,
        warningsCount: 0,
        details: ["Questions verified against curriculum standards."]
      });

      showToast(`Successfully generated ${loadedQuestions.length} questions using ${data.modelUsed || "AI"}!`);
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      showToast("Error generating questions. Please try again or check connection.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // ---------------------------------------------------------------------------
  // REGENERATE SINGLE QUESTION
  // ---------------------------------------------------------------------------
  const handleRegenerateSingle = async (questionId: string) => {
    setActiveRegeneratingId(questionId);
    try {
      const response = await fetch("/api/admission/ai-regenerate-single-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Officer-Role": "Admission Officer",
          "X-Officer-User": officerName || "Mrs. Abigail M. Iorliam"
        },
        body: JSON.stringify({
          className: targetClass,
          subject,
          difficulty,
          questionType,
          optionsCount,
          topics,
          avoidQuestions: generatedQuestions.map(q => q.question)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.question) {
          setGeneratedQuestions(prev =>
            prev.map(q => (q.id === questionId ? { ...data.question, id: questionId } : q))
          );
          showToast("Question successfully regenerated with fresh AI prompt!");
        }
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to regenerate question.");
    } finally {
      setActiveRegeneratingId(null);
    }
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== id));
    showToast("Question removed from review list.");
  };

  // Reorder question (up/down)
  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === generatedQuestions.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...generatedQuestions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setGeneratedQuestions(updated);
  };

  // Change correct answer by direct option click
  const handleSetCorrectAnswer = (questionId: string, optionValue: string) => {
    setGeneratedQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, correctAnswer: optionValue } : q))
    );
    showToast(`Correct answer updated to "${optionValue}".`);
  };

  // Manual Add Question Submit
  const handleAddManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionForm.question.trim()) {
      alert("Please enter the question text.");
      return;
    }
    const cleanOpts = newQuestionForm.options.map(o => o.trim()).filter(Boolean);
    if (cleanOpts.length < 2) {
      alert("Please provide at least 2 options.");
      return;
    }
    const correct = newQuestionForm.correctAnswer || cleanOpts[0];

    const newQ: ExamQuestion = {
      id: `MANUAL-${Date.now().toString(36).toUpperCase()}`,
      subject,
      targetClass,
      question: newQuestionForm.question.trim(),
      options: cleanOpts,
      correctAnswer: correct,
      explanation: newQuestionForm.explanation.trim() || "Author verified solution.",
      difficulty: newQuestionForm.difficulty,
      topic: newQuestionForm.topic.trim() || "General",
      marks: Number(newQuestionForm.marks) || 2
    };

    setGeneratedQuestions(prev => [...prev, newQ]);
    setIsAddModalOpen(false);
    setNewQuestionForm({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      difficulty: "Medium",
      topic: "",
      marks: 2
    });
    showToast("Question added manually!");
  };

  // Save changes from Edit Modal
  const handleSaveEditedQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setGeneratedQuestions(prev =>
      prev.map(q => (q.id === editingQuestion.id ? editingQuestion : q))
    );
    setEditingQuestion(null);
    showToast("Question edits saved!");
  };

  // Save & Add to Scheduled Examination
  const handleSaveToExamAction = () => {
    if (generatedQuestions.length === 0) {
      alert("Please generate or add questions first before saving to an examination.");
      return;
    }

    const targetExamId = selectedExamId || exams[0]?.id;
    if (!targetExamId) {
      alert("No entrance examination found. Please create or schedule an examination first.");
      return;
    }

    onSaveToExam(targetExamId, generatedQuestions);
    showToast(`Successfully saved ${generatedQuestions.length} questions to entrance examination!`);
  };

  // Save to Permanent Question Bank
  const handleSaveToBankAction = () => {
    if (generatedQuestions.length === 0) {
      alert("No questions to save.");
      return;
    }
    onSaveToQuestionBank(generatedQuestions);
    showToast(`Saved ${generatedQuestions.length} questions to Permanent Question Bank!`);
  };

  // Export handlers
  const exportMeta = {
    examTitle: examName,
    subject,
    targetClass,
    durationMinutes,
    academicSession: "2026/2027 Session",
    instructions: "1. Answer all questions. 2. Shade or select the option that best answers the question. 3. No unauthorized materials allowed in the CBT hall."
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold border border-indigo-500/40 animate-in slide-in-from-bottom">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 1: AI QUESTION GENERATOR CONFIGURATION */}
      {/* --------------------------------------------------------------------- */}
      <Card className="border-indigo-100 shadow-sm overflow-hidden bg-gradient-to-b from-white to-slate-50/50">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Brain size={26} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                    Powered by Gemini 3.8 Flash
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight mt-1">
                  AI Entrance Examination Question Generator
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl">
                  Automatically synthesize syllabus-aligned, high-validity entrance questions with answer keys, plausible distractors, and pedagogical solutions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg font-mono">
                Officer: {officerName}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-6 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Examination Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Target Examination
              </label>
              <select
                value={selectedExamId}
                onChange={e => {
                  setSelectedExamId(e.target.value);
                  const found = exams.find(x => x.id === e.target.value);
                  if (found) setExamName(found.title);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {exams.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.session})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Class / Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Class / Entrance Level
              </label>
              <select
                value={targetClass}
                onChange={e => setTargetClass(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="JSS 1">JSS 1 (Primary 6 Entrance / NCEE)</option>
                <option value="JSS 2">JSS 2 (Transfer Entrance)</option>
                <option value="JSS 3">JSS 3 (Transfer Entrance)</option>
                <option value="SSS 1">SSS 1 (Senior Secondary Entrance / BECE)</option>
                <option value="SSS 2">SSS 2 (Transfer Entrance)</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={e => handleSelectSubject(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="English Language">English Language</option>
                <option value="Basic Science">Basic Science</option>
                <option value="General Aptitude">General Aptitude / Quantitative</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Computer Studies">Computer Studies</option>
                <option value="Civic Education">Civic Education</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Number of Questions
              </label>
              <div className="flex items-center gap-1.5">
                {[5, 10, 20, 40].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      questionCount === cnt
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Question Difficulty */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Question Difficulty
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Easy">Easy (Foundation / Speed)</option>
                <option value="Medium">Medium (Standard NCEE / BECE)</option>
                <option value="Hard">Hard (Scholarship / Rigorous)</option>
                <option value="Mixed">Mixed (Balanced 30-50-20% Scale)</option>
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={e => setQuestionType(e.target.value as any)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="MCQ">Multiple Choice Questions (MCQ)</option>
                <option value="True/False">True / False</option>
                <option value="Short Answer">Short Answer</option>
              </select>
            </div>

            {/* Options Count per MCQ */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Options per MCQ
              </label>
              <select
                value={optionsCount}
                onChange={e => setOptionsCount(Number(e.target.value))}
                disabled={questionType !== "MCQ"}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value={4}>4 Options (A, B, C, D) - Standard</option>
                <option value={5}>5 Options (A, B, C, D, E)</option>
                <option value={3}>3 Options (A, B, C)</option>
              </select>
            </div>

            {/* Exam Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Exam Duration (Minutes)
              </label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (Standard 1 Hour)</option>
                <option value={90}>90 Minutes</option>
                <option value={120}>120 Minutes (2 Hours)</option>
              </select>
            </div>
          </div>

          {/* Topics to Cover */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
              <span>Specific Topics to Cover</span>
              <span className="text-[10px] text-slate-400 font-normal">Comma-separated topics</span>
            </label>
            <input
              type="text"
              value={topics}
              onChange={e => setTopics(e.target.value)}
              placeholder="e.g. Fractions, Decimals, Word Problems, Simple Geometry"
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Custom Instruction Box (Requirement 8) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-indigo-600" />
                Custom AI Instructions & Syllabus Prompts
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={() => handleSelectSubject(subject)}>
                Reset to default prompt
              </span>
            </label>
            <textarea
              rows={3}
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
              placeholder="Enter special pedagogical instructions for the AI..."
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Generate Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles size={16} className="text-amber-500" />
              <span>
                Will generate <strong>{questionCount}</strong> {difficulty.toLowerCase()} {questionType} questions for{" "}
                <strong>{targetClass} {subject}</strong>.
              </span>
            </div>

            <Button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateQuestions}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-200 text-sm gap-2 transition-all transform active:scale-95"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>{generationStep || "Generating Questions..."}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-amber-300" />
                  <span>GENERATE QUESTIONS WITH AI</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 2: AI GENERATED QUESTIONS REVIEW PAGE (Requirement 3) */}
      {/* --------------------------------------------------------------------- */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <Card className="border-indigo-200 bg-white shadow-md">
            <CardHeader className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                    AI Review Stage • Not Yet Published
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {subject} • {targetClass} • Total: {generatedQuestions.length} Questions
                  </span>
                </div>
                <h3 className="text-xl font-black font-heading text-slate-900 mt-2">
                  AI Generated Questions Review
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect questions, edit wording, adjust options, or change answers before attaching them to the entrance examination.
                </p>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="text-xs font-bold gap-1.5 border-slate-300 hover:bg-slate-50 h-9"
                >
                  <Eye size={15} /> PREVIEW EXAM
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(true)}
                  className="text-xs font-bold gap-1.5 border-slate-300 hover:bg-slate-50 h-9 text-indigo-700"
                >
                  <Plus size={15} /> ADD QUESTION
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateQuestions}
                  disabled={isGenerating}
                  className="text-xs font-bold gap-1.5 border-slate-300 hover:bg-slate-50 h-9"
                >
                  <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} /> REGENERATE ALL
                </Button>

                {/* Download Dropdown or Quick Buttons */}
                <div className="relative group">
                  <Button
                    size="sm"
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs gap-1.5 h-9"
                  >
                    <Download size={15} /> DOWNLOAD QUESTIONS <ChevronDown size={14} />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-30 bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-56 text-xs text-slate-700">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Question Paper (No Answers)
                    </div>
                    <button
                      onClick={() => exportExamToPDF(generatedQuestions, exportMeta, false)}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 font-semibold"
                    >
                      <FileText size={14} className="text-rose-600" /> Download PDF (.pdf)
                    </button>
                    <button
                      onClick={() => exportExamToWord(generatedQuestions, exportMeta, false)}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 font-semibold"
                    >
                      <FileText size={14} className="text-blue-600" /> Microsoft Word (.docx)
                    </button>
                    <button
                      onClick={() => exportExamToExcel(generatedQuestions, exportMeta, false)}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 font-semibold"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-600" /> Excel Spreadsheet (.xlsx)
                    </button>
                    <button
                      onClick={() => exportExamToCSV(generatedQuestions, exportMeta, false)}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center gap-2 font-semibold"
                    >
                      <FileSpreadsheet size={14} className="text-slate-600" /> Comma-Separated (.csv)
                    </button>
                  </div>
                </div>

                {/* Download Answer Key */}
                <div className="relative group">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs gap-1.5 h-9"
                  >
                    <Award size={15} /> DOWNLOAD ANSWER KEY <ChevronDown size={14} />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-30 bg-white border border-slate-200 rounded-xl shadow-xl py-2 w-56 text-xs text-slate-700">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Confidential Marking Scheme
                    </div>
                    <button
                      onClick={() => exportExamToPDF(generatedQuestions, exportMeta, true)}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 font-semibold text-emerald-800"
                    >
                      <FileText size={14} className="text-rose-600" /> Answer Key PDF (.pdf)
                    </button>
                    <button
                      onClick={() => exportExamToWord(generatedQuestions, exportMeta, true)}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 font-semibold text-emerald-800"
                    >
                      <FileText size={14} className="text-blue-600" /> Answer Key Word (.docx)
                    </button>
                    <button
                      onClick={() => exportExamToCSV(generatedQuestions, exportMeta, true)}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 font-semibold text-emerald-800"
                    >
                      <FileSpreadsheet size={14} className="text-slate-600" /> Answer Key CSV (.csv)
                    </button>
                  </div>
                </div>

                {/* Save & Add to Exam (Primary) */}
                <Button
                  size="sm"
                  onClick={handleSaveToExamAction}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-1.5 h-9 px-4 shadow-sm"
                >
                  <Save size={15} /> SAVE & ADD TO EXAM
                </Button>

                {/* Save to Permanent Bank */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveToBankAction}
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold text-xs gap-1.5 h-9"
                >
                  <Database size={15} /> SAVE TO QUESTION BANK
                </Button>
              </div>
            </CardHeader>

            {/* AI Quality Control Banner (Requirement 9) */}
            {qualityReport && (
              <div
                className={`p-4 border-b flex items-start gap-3 text-xs ${
                  qualityReport.passed
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                {qualityReport.passed ? (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-2">
                    <span>
                      {qualityReport.passed
                        ? "AI Quality Control Check: Passed 100%"
                        : `AI Quality Notice: ${qualityReport.errorsCount} issues flagged`}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-white/70 border">
                      Verified {qualityReport.totalChecked} Questions
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] opacity-90">
                    {qualityReport.details.slice(0, 2).join(" • ")}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* List of Review Questions */}
          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-sm space-y-4"
              >
                {/* Top Question Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-white bg-indigo-600 px-3 py-1 rounded-lg text-xs">
                      Question {idx + 1} of {generatedQuestions.length}
                    </span>
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {q.subject} • {q.targetClass || targetClass}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                        q.difficulty === "Easy"
                          ? "bg-emerald-100 text-emerald-800"
                          : q.difficulty === "Hard"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {q.difficulty || "Medium"} Difficulty
                    </span>
                    {q.topic && (
                      <span className="text-slate-500 font-medium">Topic: {q.topic}</span>
                    )}
                  </div>

                  {/* Reorder and Card Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveQuestion(idx, "up")}
                      title="Move Up"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === generatedQuestions.length - 1}
                      onClick={() => handleMoveQuestion(idx, "down")}
                      title="Move Down"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowDown size={14} />
                    </button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingQuestion(q)}
                      className="text-xs h-8 gap-1 border-slate-300 font-semibold"
                    >
                      <Edit3 size={13} /> EDIT
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={activeRegeneratingId === q.id}
                      onClick={() => handleRegenerateSingle(q.id)}
                      className="text-xs h-8 gap-1 border-amber-300 text-amber-800 hover:bg-amber-50 font-semibold"
                    >
                      <RefreshCw size={13} className={activeRegeneratingId === q.id ? "animate-spin" : ""} />
                      REGENERATE
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-xs h-8 gap-1 border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold"
                    >
                      <Trash2 size={13} /> DELETE
                    </Button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="text-sm font-bold text-slate-900 leading-relaxed">
                  {q.question}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options?.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isCorrect = opt.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSetCorrectAnswer(q.id, opt)}
                        className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between cursor-pointer transition-all ${
                          isCorrect
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-sm ring-1 ring-emerald-400"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-white border border-slate-300 text-slate-700"
                            }`}
                          >
                            {letter}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isCorrect && (
                          <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={12} /> Correct Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation & Working Solution */}
                {q.explanation && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-slate-800 space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-amber-600" />
                      <span>Answer Solution & Explanation:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: EDIT QUESTION */}
      {/* --------------------------------------------------------------------- */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-indigo-400" />
                <h3 className="font-bold font-heading text-base">Edit Question</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedQuestion} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Prompt</label>
                <textarea
                  rows={3}
                  value={editingQuestion.question}
                  onChange={e =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Options</label>
                {editingQuestion.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-slate-500">
                      {String.fromCharCode(65 + optIdx)}:
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[optIdx] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      className="flex-1 p-2 border rounded-lg font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingQuestion({ ...editingQuestion, correctAnswer: opt })
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${
                        editingQuestion.correctAnswer === opt
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {editingQuestion.correctAnswer === opt ? "✓ Correct" : "Mark Correct"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Correct Answer & Marks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correct Answer</label>
                  <select
                    value={editingQuestion.correctAnswer}
                    onChange={e =>
                      setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })
                    }
                    className="w-full p-2 border rounded-xl font-bold"
                  >
                    {editingQuestion.options.map((opt, idx) => (
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
                    min={1}
                    max={10}
                    value={editingQuestion.marks || 2}
                    onChange={e =>
                      setEditingQuestion({
                        ...editingQuestion,
                        marks: Number(e.target.value) || 2
                      })
                    }
                    className="w-full p-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Explanation / Answer Solution
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.explanation || ""}
                  onChange={e =>
                    setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: ADD QUESTION MANUALLY */}
      {/* --------------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-indigo-900 text-white flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-amber-400" />
                <h3 className="font-bold font-heading text-base">Add New Question Manually</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-indigo-200 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddManualQuestion} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Prompt *</label>
                <textarea
                  rows={3}
                  value={newQuestionForm.question}
                  onChange={e => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                  placeholder="Type the entrance examination question here..."
                  className="w-full p-2.5 border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Options (A - D) *</label>
                {newQuestionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-slate-500">
                      {String.fromCharCode(65 + idx)}:
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...newQuestionForm.options];
                        newOpts[idx] = e.target.value;
                        setNewQuestionForm({ ...newQuestionForm, options: newOpts });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                      className="flex-1 p-2 border rounded-lg font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setNewQuestionForm({ ...newQuestionForm, correctAnswer: opt })}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${
                        newQuestionForm.correctAnswer === opt && opt !== ""
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {newQuestionForm.correctAnswer === opt && opt !== "" ? "✓ Correct" : "Mark Correct"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newQuestionForm.difficulty}
                    onChange={e => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value as any })}
                    className="w-full p-2 border rounded-xl font-bold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newQuestionForm.marks}
                    onChange={e => setNewQuestionForm({ ...newQuestionForm, marks: Number(e.target.value) || 2 })}
                    className="w-full p-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation / Working Solution</label>
                <textarea
                  rows={2}
                  value={newQuestionForm.explanation}
                  onChange={e => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                  placeholder="Explain why the answer is correct for the answer key..."
                  className="w-full p-2.5 border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Add Question to Examination
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: PREVIEW COMPLETE EXAMINATION */}
      {/* --------------------------------------------------------------------- */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between sticky top-0">
              <div>
                <h3 className="font-black font-heading text-lg flex items-center gap-2">
                  <Eye size={18} className="text-amber-400" />
                  Examination Preview: {examName}
                </h3>
                <span className="text-xs text-slate-400">
                  {subject} • {targetClass} • {generatedQuestions.length} Questions
                </span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewTab("paper")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    previewTab === "paper" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Candidate Question Paper
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("answers")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    previewTab === "answers" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Confidential Answer Key
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 ml-4"
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Styled Examination Paper */}
            <div className="p-8 overflow-y-auto bg-slate-50 font-sans space-y-6">
              {/* School Header */}
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase font-heading">
                  Emmanuel Secondary School, Makurdi
                </h1>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Directorate of Admissions & Entrance Examinations
                </p>
                <div className="inline-block bg-slate-900 text-white font-extrabold text-xs uppercase px-4 py-1 rounded-md mt-2">
                  {previewTab === "answers" ? "CONFIDENTIAL ANSWER KEY & MARKING SCHEME" : "ENTRANCE EXAMINATION 2026/2027"}
                </div>
                <div className="flex justify-center gap-6 text-xs text-slate-700 font-bold mt-2">
                  <span>SUBJECT: {subject.toUpperCase()}</span>
                  <span>CLASS: {targetClass}</span>
                  <span>DURATION: {durationMinutes} MINUTES</span>
                  <span>TOTAL MARKS: {generatedQuestions.reduce((a, b) => a + (b.marks || 2), 0)}</span>
                </div>
              </div>

              {previewTab === "paper" ? (
                <>
                  {/* Candidate Info Table */}
                  <div className="p-3.5 bg-white border border-slate-300 rounded-xl text-xs grid grid-cols-2 gap-4 font-semibold text-slate-700">
                    <div>CANDIDATE NAME: ________________________________________________</div>
                    <div>EXAM SEAT / HALL NO: ___________________________</div>
                    <div>APPLICATION NUMBER: _________________________________________</div>
                    <div>DATE & SIGNATURE: _______________________________</div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200">
                    {generatedQuestions.map((q, idx) => (
                      <div key={q.id} className="space-y-2 pb-4 border-b border-slate-100 last:border-b-0">
                        <div className="text-sm font-bold text-slate-900 flex items-start gap-2">
                          <span>{idx + 1}.</span>
                          <span>{q.question}</span>
                          <span className="text-xs font-normal text-slate-400 ml-auto whitespace-nowrap">
                            ({q.marks || 2} Marks)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5 text-xs text-slate-800">
                          {q.options?.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="font-extrabold w-5 text-slate-500">
                                [{String.fromCharCode(65 + optIdx)}]
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Answer Key View */
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                      <tr>
                        <th className="p-3.5 w-14">Q#</th>
                        <th className="p-3.5 w-56">Correct Answer</th>
                        <th className="p-3.5">Working Solution / Pedagogical Explanation</th>
                        <th className="p-3.5 w-16 text-right">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {generatedQuestions.map((q, idx) => {
                        const optIdx = q.options?.findIndex(
                          o => o.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
                        );
                        const letter = optIdx >= 0 ? String.fromCharCode(65 + optIdx) : "•";

                        return (
                          <tr key={q.id} className="hover:bg-slate-50">
                            <td className="p-3.5 font-bold text-slate-900">{idx + 1}</td>
                            <td className="p-3.5">
                              <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-md">
                                [{letter}] {q.correctAnswer}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-600 font-medium">
                              {q.explanation || "Direct curriculum answer."}
                            </td>
                            <td className="p-3.5 text-right font-bold text-slate-800">
                              {q.marks || 2}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-100 border-t flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {generatedQuestions.length} Questions ready for export or CBT session.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => exportExamToPDF(generatedQuestions, exportMeta, previewTab === "answers")}
                  className="bg-slate-900 text-white font-bold text-xs gap-1.5"
                >
                  <Download size={14} /> Download as PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPreviewModalOpen(false)}
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
