import React, { useState, useMemo } from "react";
import { 
  useAdmissionApps, 
  useStudents, 
  CLASSES 
} from "../data/studentsData";
import { useSessions, TERMS } from "../data/sessionsData";
import { useInquiries } from "../data/inquiriesData";
import { usePortalSettings, useAdmissionSettings } from "../data/portalSettingsData";
import { useCbtQuestions } from "../data/cbtQuestions";

import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Label 
} from "@/src/components/ui";
import { 
  FileCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Award, 
  UserCheck, 
  UserPlus, 
  Download, UploadCloud, 
  Printer, 
  Eye, 
  ShieldCheck, 
  CreditCard, 
  Sliders, 
  AlertCircle, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap,
  Sparkles,
  Check,
  Send,
  MessageSquare,
  X,
  Edit2,
  Save
} from "lucide-react";

export default function AdmissionsManagement() {
  const [apps, setApps] = useAdmissionApps();
  const [students, setStudents] = useStudents();
  const [inquiries, setInquiries] = useInquiries();
  const [sessions, , currentSession] = useSessions();
  const [cbtClass, setCbtClass] = useState(CLASSES[0]);
  const [cbtSession, setCbtSession] = useState(() => currentSession || "2025/2026");
  const [cbtTerm, setCbtTerm] = useState(TERMS[0]);
  const [cbtQuestionCount, setCbtQuestionCount] = useState<number>(50);
  const [isGeneratingCbt, setIsGeneratingCbt] = useState(false);
  const [portalSettings] = usePortalSettings();
  const [questionsByClass, updateQuestionsForClass] = useCbtQuestions();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<"applicants" | "verification" | "exams" | "offers" | "transfer" | "settings" | "inquiries">("applicants");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  // Selection for Batch Actions
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Selected App for Detail Inspector / Modal
  const [inspectApp, setInspectApp] = useState<any | null>(null);
  const [isEditingInspect, setIsEditingInspect] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerApp, setOfferApp] = useState<any | null>(null);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{ url: string; title: string } | null>(null);

  // New Application Form State
  const [newApplicant, setNewApplicant] = useState({
    firstName: "",
    lastName: "",
    gender: "Male",
    class: "JSS 1A",
    phone: "",
    email: "",
    state: "Benue",
    lga: "Makurdi",
    payment: "Paid",
  });

  // Settings state
  const [admissionSettings, updateAdmissionSettings] = useAdmissionSettings();
  const setAdmissionSettings = updateAdmissionSettings;

  // Notifications / Feedback
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Filtered applicants list
  const filteredApps = useMemo(() => {
    return apps.filter(a => {
      const nameMatch = (a.name || `${a.firstName || ''} ${a.lastName || ''}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.phone && a.phone.includes(searchQuery));
      const statusMatch = statusFilter === "all" || a.status === statusFilter;
      const classMatch = classFilter === "all" || a.class === classFilter || a.assignedClass === classFilter;
      return nameMatch && statusMatch && classMatch;
    });
  }, [apps, searchQuery, statusFilter, classFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = apps.length;
    const pending = apps.filter(a => a.status === "Pending" || a.status === "Under Review").length;
    const examPassed = apps.filter(a => (a.examScore >= admissionSettings.passCutoff) || a.examStatus === "Passed").length;
    const offered = apps.filter(a => a.offerStatus === "Offered" || a.offerStatus === "Accepted").length;
    const admitted = apps.filter(a => a.status === "Admitted" || a.isTransferredToRoster).length;
    return { total, pending, examPassed, offered, admitted };
  }, [apps, admissionSettings]);

  // Batch toggle
  const toggleSelectAll = () => {
    if (selectedAppIds.length === filteredApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApps.map(a => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedAppIds.includes(id)) {
      setSelectedAppIds(selectedAppIds.filter(i => i !== id));
    } else {
      setSelectedAppIds([...selectedAppIds, id]);
    }
  };

  // Single Action Handlers
  const handleUpdateStatus = (id: string, newStatus: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    showToast(`Application ${id} status updated to '${newStatus}'.`);
  };

  const handleUpdateExamScore = (id: string, score: number) => {
    const passed = score >= admissionSettings.passCutoff;
    setApps(prev => prev.map(a => a.id === id ? {
      ...a,
      examScore: score,
      examStatus: passed ? "Passed" : "Failed",
      offerStatus: passed ? (a.offerStatus === "None" ? "Offered" : a.offerStatus) : "Rejected"
    } : a));
    showToast(`Exam score updated for ${id}: ${score}% (${passed ? 'PASSED' : 'FAILED'}).`);
  };

  const handleUpdateDocument = (id: string, docKey: string, docStatus: string) => {
    setApps(prev => prev.map(a => {
      if (a.id === id) {
        const updatedDocs = { ...(a.documents || {}), [docKey]: docStatus };
        return { ...a, documents: updatedDocs };
      }
      return a;
    }));
    showToast(`Document state updated for candidate.`);
  };

  const handleIssueOffer = (app: any) => {
    setApps(prev => prev.map(a => a.id === app.id ? { ...a, offerStatus: "Offered", status: "Approved" } : a));
    setOfferApp(app);
    setShowOfferModal(true);
    showToast(`Provisional Admission Offer generated for ${app.name}!`);
  };

  const handleMarkAcceptanceFee = (id: string, feeStatus: "Paid" | "Unpaid") => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, acceptanceFee: feeStatus, offerStatus: feeStatus === "Paid" ? "Accepted" : a.offerStatus } : a));
    showToast(`Acceptance fee status for ${id} set to ${feeStatus}.`);
  };

  const handleTransferToStudentRoster = (app: any) => {
    if (app.isTransferredToRoster) {
      showToast(`Student ${app.name} has already been enrolled into student roster.`);
      return;
    }

    // Generate Student ID
    const studentCount = students.length + 1;
    const generatedStudentId = `ESS/2026/${String(studentCount).padStart(3, '0')}`;

    const newStudentObj = {
      id: generatedStudentId,
      name: app.name || `${app.firstName} ${app.lastName}`,
      class: app.assignedClass || app.class || "JSS 1A",
      previousClass: "New Applicant / Transfer",
      gender: app.gender || "Male",
      status: "Active",
      fees: app.acceptanceFee === "Paid" ? "Paid" : "Partial",
      email: app.email || `${app.firstName?.toLowerCase() || 'student'}.admission@student.ess.edu.ng`,
      parentNumber: app.phone || "+234 800 000 0000",
      address: `${app.lga || 'Makurdi'}, ${app.state || 'Benue State'}`,
      password: "password123",
      enrollmentStatus: "Newly Admitted"
    };

    // Update Students List
    setStudents(prev => [newStudentObj, ...prev]);

    // Mark Application as Admitted and Transferred
    setApps(prev => prev.map(a => a.id === app.id ? { 
      ...a, 
      status: "Admitted", 
      isTransferredToRoster: true,
      enrolledStudentId: generatedStudentId
    } : a));

    showToast(`Success! Candidate ${app.name} officially admitted and transferred to Active Student Roster with ID: ${generatedStudentId}!`);
  };

  // Batch Operations
  const handleBatchApprove = () => {
    if (selectedAppIds.length === 0) return;
    setApps(prev => prev.map(a => selectedAppIds.includes(a.id) ? { ...a, status: "Under Review" } : a));
    showToast(`Updated ${selectedAppIds.length} applications to 'Under Review'.`);
    setSelectedAppIds([]);
  };

  const handleBatchIssueOffer = () => {
    if (selectedAppIds.length === 0) return;
    setApps(prev => prev.map(a => selectedAppIds.includes(a.id) ? { ...a, offerStatus: "Offered", status: "Approved" } : a));
    showToast(`Issued admission offers to ${selectedAppIds.length} candidates.`);
    setSelectedAppIds([]);
  };

  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApplicant.firstName || !newApplicant.lastName) {
      alert("Please provide candidate's full name.");
      return;
    }
    const generatedId = `APP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const createdObj = {
      id: generatedId,
      name: `${newApplicant.firstName} ${newApplicant.lastName}`.trim(),
      firstName: newApplicant.firstName,
      lastName: newApplicant.lastName,
      gender: newApplicant.gender,
      class: newApplicant.class,
      assignedClass: newApplicant.class,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      payment: newApplicant.payment,
      acceptanceFee: "Unpaid",
      phone: newApplicant.phone || "+234 800 123 4567",
      email: newApplicant.email || "parent@gmail.com",
      state: newApplicant.state,
      lga: newApplicant.lga,
      examScore: 0,
      examStatus: "Not Taken",
      documents: {
        birthCertificate: "Submitted",
        academicResult: "Submitted",
        passportPhoto: "Submitted",
        medicalForm: "Pending"
      },
      offerStatus: "None",
      reviewerNotes: "Manually registered offline applicant by Admission Officer.",
      isTransferredToRoster: false
    };

    setApps(prev => [createdObj, ...prev]);
    setShowNewAppModal(false);
    setNewApplicant({
      firstName: "",
      lastName: "",
      gender: "Male",
      class: "JSS 1A",
      phone: "",
      email: "",
      state: "Benue",
      lga: "Makurdi",
      payment: "Paid",
    });
    showToast(`New manual applicant ${createdObj.name} registered successfully!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Application ID", "Name", "Class", "Phone", "Email", "State", "Status", "Exam Score", "Offer Status", "Transferred"];
    const rows = apps.map(a => [
      a.id,
      `"${a.name || ''}"`,
      a.class || a.assignedClass,
      a.phone || '',
      a.email || '',
      a.state || '',
      a.status,
      a.examScore || 0,
      a.offerStatus || 'None',
      a.isTransferredToRoster ? 'Yes' : 'No'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ESS_Admissions_Applicants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Admissions records exported to CSV!");
  };

  const handleGenerateCbt = async () => {
    setIsGeneratingCbt(true);
    setToastMsg(`Generating ${cbtQuestionCount} AI questions for ${cbtClass}... This may take a moment.`);
    
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          className: cbtClass,
          count: cbtQuestionCount
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }
      
      if (data.questions && Array.isArray(data.questions)) {
        // Map to format with unique IDs
        const formattedQuestions = data.questions.map((q: any, i: number) => ({
          id: i + 1,
          text: q.text,
          options: q.options || ["Option A", "Option B", "Option C", "Option D"],
          answer: q.answer,
          subject: q.subject || "General Knowledge"
        }));
        
        updateQuestionsForClass(cbtClass, formattedQuestions);
        
        // Save config
        const cbtConfig = {
          class: cbtClass,
          session: cbtSession,
          term: cbtTerm,
          questionCount: formattedQuestions.length
        };
        const key = `cbt_config_${cbtClass}_${cbtSession}_${cbtTerm}`;
        localStorage.setItem(key, JSON.stringify(cbtConfig));

        setToastMsg(`Successfully generated ${formattedQuestions.length} AI CBT questions for ${cbtClass}!`);
      } else {
        throw new Error("Invalid format received from server");
      }
    } catch (err: any) {
      console.error(err);
      setToastMsg(`Error: ${err.message}. Make sure GEMINI_API_KEY is configured.`);
    } finally {
      setTimeout(() => setToastMsg(null), 5000);
      setIsGeneratingCbt(false);
    }
  };

  const handleDownloadCbt = () => {
    const questions = questionsByClass[cbtClass] || [];
    if (questions.length === 0) {
      setToastMsg(`No questions available for ${cbtClass}. Generate or upload some first.`);
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    let textContent = `Entrance Examination Questions - ${cbtClass}\nSession: ${cbtSession} | Term: ${cbtTerm}\n\n`;
    
    questions.forEach((q, index) => {
      textContent += `${index + 1}. ${q.text}\n`;
      const optionLabels = ['A', 'B', 'C', 'D', 'E'];
      q.options.forEach((opt: string, optIdx: number) => {
        textContent += `${optionLabels[optIdx] || '*'}. ${opt}\n`;
      });
      textContent += `Correct Answer: ${q.answer}\n\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `entrance_cbt_${cbtClass.replace(/\s+/g, '_')}_${questions.length}Qs.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setToastMsg(`Downloaded ${questions.length} CBT questions for ${cbtClass}.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUploadCbt = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const rows = text.split('\n').filter(row => row.trim() !== '');
          // Skip header row
          const questionRows = rows.slice(1);
          
          if (questionRows.length > 0) {
            const parsedQuestions = questionRows.map((row, index) => {
              // Simple CSV split (not handling quotes, just basic comma separation)
              const columns = row.split(',');
              return {
                id: index + 1,
                text: columns[0] || `Question ${index + 1}`,
                options: [
                  columns[1] || 'Option A',
                  columns[2] || 'Option B',
                  columns[3] || 'Option C',
                  columns[4] || 'Option D'
                ],
                answer: columns[5]?.trim() || (columns[1] || 'Option A'),
                subject: 'General Knowledge'
              };
            });
            
            updateQuestionsForClass(cbtClass, parsedQuestions);
            
            setToastMsg(`Successfully imported ${parsedQuestions.length} questions for ${cbtClass}.`);
            setTimeout(() => setToastMsg(null), 3000);
          }
        } catch (error) {
          console.error("Error parsing CBT file", error);
          setToastMsg(`Failed to parse file. Please use the correct CSV format.`);
          setTimeout(() => setToastMsg(null), 3000);
        }
      };
      
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="text-amber-400 shrink-0" size={18} />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <ShieldCheck size={240} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <ShieldCheck size={14} /> Admission Officer Control Console
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading">Admissions Management</h1>
              <p className="text-amber-100/80 text-xs sm:text-sm max-w-2xl">
                Full lifecycle management for student applications: application submission review, document verification, entrance exam scoring, offer letters, and automatic student roster transfer.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleExportCSV}
                className="bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700 text-xs gap-1.5"
              >
                <Download size={14} /> Export CSV
              </Button>
              <Button 
                onClick={() => setShowNewAppModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-lg shadow-amber-500/20 border-0"
              >
                <UserPlus size={15} /> Add Manual Candidate
              </Button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
              <p className="text-[11px] text-amber-200 uppercase font-semibold tracking-wider">Total Apps</p>
              <p className="text-2xl font-black text-white mt-0.5">{metrics.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
              <p className="text-[11px] text-amber-200 uppercase font-semibold tracking-wider">Pending Review</p>
              <p className="text-2xl font-black text-amber-300 mt-0.5">{metrics.pending}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
              <p className="text-[11px] text-amber-200 uppercase font-semibold tracking-wider">Exam Passed</p>
              <p className="text-2xl font-black text-emerald-300 mt-0.5">{metrics.examPassed}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
              <p className="text-[11px] text-amber-200 uppercase font-semibold tracking-wider">Offers Issued</p>
              <p className="text-2xl font-black text-indigo-300 mt-0.5">{metrics.offered}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <p className="text-[11px] text-amber-200 uppercase font-semibold tracking-wider">Admitted & Roster</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">{metrics.admitted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 scrollbar-none bg-white p-1.5 rounded-xl border">
        <button
          onClick={() => setActiveTab("applicants")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "applicants"
              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText size={16} /> All Applicants ({apps.length})
        </button>
        <button
          onClick={() => setActiveTab("verification")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "verification"
              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck size={16} /> Document Verification
        </button>
        <button
          onClick={() => setActiveTab("exams")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "exams"
              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Award size={16} /> Entrance Exams
        </button>
        <button
          onClick={() => setActiveTab("offers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "offers"
              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <GraduationCap size={16} /> Offer Letters & Fees
        </button>
        <button
          onClick={() => setActiveTab("transfer")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "transfer"
              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <UserCheck size={16} /> Final Roster Transfer
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "settings"
              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Sliders size={16} /> Admissions Settings
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === "inquiries"
              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <MessageSquare size={16} /> Student Inquiries
        </button>
      </div>

      {/* TAB 1: ALL APPLICANTS DIRECTORY */}
      {activeTab === "applicants" && (
        <Card className="border border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="text-amber-600" size={18} /> Candidate Applications Master Directory
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Filter, review, and execute batch approval actions across all candidates.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <Input 
                    placeholder="Search candidate, ID, phone..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs h-9"
                  />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 text-xs border border-slate-300 rounded-lg px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Exam Scheduled">Exam Scheduled</option>
                  <option value="Approved">Approved</option>
                  <option value="Admitted">Admitted</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <select 
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="h-9 text-xs border border-slate-300 rounded-lg px-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Classes</option>
                  {CLASSES.slice(0, 24).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Batch Bar */}
            {selectedAppIds.length > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-950 animate-in fade-in">
                <div className="font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-600" />
                  <span>{selectedAppIds.length} candidates selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleBatchApprove} size="sm" className="h-8 bg-amber-600 hover:bg-amber-700 text-white text-xs">
                    Mark Under Review
                  </Button>
                  <Button onClick={handleBatchIssueOffer} size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                    Issue Offers
                  </Button>
                  <Button onClick={() => setSelectedAppIds([])} variant="ghost" size="sm" className="h-8 text-xs text-slate-600">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <th className="p-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedAppIds.length === filteredApps.length && filteredApps.length > 0} 
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                    </th>
                    <th className="p-3">App ID</th>
                    <th className="p-3">Candidate Name</th>
                    <th className="p-3">Target Class</th>
                    <th className="p-3">App Date</th>
                    <th className="p-3">Exam Score</th>
                    <th className="p-3">App Fee</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Offer Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-500">
                        No admission applications match your current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedAppIds.includes(app.id)}
                            onChange={() => toggleSelectOne(app.id)}
                            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-900">{app.id}</td>
                        <td className="p-3 font-semibold text-slate-900">
                          <div>{app.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{app.phone} &bull; {app.state || 'N/A'}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800 font-medium">
                            {app.assignedClass || app.class}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{app.date}</td>
                        <td className="p-3">
                          <span className={`font-bold ${
                            app.examScore >= admissionSettings.passCutoff ? 'text-emerald-600' : app.examScore > 0 ? 'text-rose-600' : 'text-slate-400'
                          }`}>
                            {app.examScore ? `${app.examScore}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            app.payment === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {app.payment}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            app.status === 'Admitted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            app.status === 'Approved' ? 'bg-indigo-100 text-indigo-800' :
                            app.status === 'Under Review' ? 'bg-amber-100 text-amber-900' :
                            app.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            app.offerStatus === 'Offered' ? 'bg-indigo-100 text-indigo-800' :
                            app.offerStatus === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                            app.offerStatus === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {app.offerStatus || 'None'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => setInspectApp(app)}
                              className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg transition-colors"
                              title="Inspect Candidate"
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              onClick={() => handleIssueOffer(app)}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                              title="Generate Offer Letter"
                            >
                              <Printer size={15} />
                            </button>
                            {!app.isTransferredToRoster ? (
                              <button 
                                onClick={() => handleTransferToStudentRoster(app)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                title="Transfer to Student Roster"
                              >
                                <UserCheck size={15} />
                              </button>
                            ) : (
                              <span className="p-1 text-emerald-600 font-bold text-[10px]" title="Transferred">
                                &check; Roster
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: DOCUMENT VERIFICATION */}
      {activeTab === "verification" && (
        <div className="space-y-6">
          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-amber-600" size={18} /> Document Verification Hub
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Audit candidate uploads: Birth Certificate, Previous Academic Record, Passport Photo, and Medical Clearances.</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {apps.map(app => (
                  <div key={app.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {app.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{app.name}</h4>
                        <p className="text-xs text-slate-500">Applying for: {app.class || app.assignedClass} &bull; {app.state || 'Benue'}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        app.status === 'Approved' || app.status === 'Admitted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Document Verification Matrix */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Birth Certificate */}
                      <div className="p-2.5 border rounded-lg bg-slate-50/50 space-y-1">
                        <div className="font-semibold text-slate-700 flex items-center justify-between">
                          <span>Birth Certificate</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            app.documents?.birthCertificate === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.documents?.birthCertificate || 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <button 
                            onClick={() => handleUpdateDocument(app.id, 'birthCertificate', app.documents?.birthCertificate === 'Verified' ? 'Pending' : 'Verified')}
                            className="text-[11px] font-semibold text-brand-600 hover:underline"
                          >
                            Toggle Verification
                          </button>
                          {app.documentsUrls?.birthCert && (
                            <button onClick={() => setPreviewDocument({ url: app.documentsUrls.birthCert, title: `${app.name} - Birth Certificate` })} className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Academic Result */}
                      <div className="p-2.5 border rounded-lg bg-slate-50/50 space-y-1">
                        <div className="font-semibold text-slate-700 flex items-center justify-between">
                          <span>Academic Record</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            app.documents?.academicResult === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.documents?.academicResult || 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <button 
                            onClick={() => handleUpdateDocument(app.id, 'academicResult', app.documents?.academicResult === 'Verified' ? 'Pending' : 'Verified')}
                            className="text-[11px] font-semibold text-brand-600 hover:underline"
                          >
                            Toggle Verification
                          </button>
                          {app.documentsUrls?.previousResult && (
                            <button onClick={() => setPreviewDocument({ url: app.documentsUrls.previousResult, title: `${app.name} - Academic Record` })} className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Passport Photo */}
                      <div className="p-2.5 border rounded-lg bg-slate-50/50 space-y-1">
                        <div className="font-semibold text-slate-700 flex items-center justify-between">
                          <span>Passport Photo</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            app.documents?.passportPhoto === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.documents?.passportPhoto || 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <button 
                            onClick={() => handleUpdateDocument(app.id, 'passportPhoto', app.documents?.passportPhoto === 'Verified' ? 'Pending' : 'Verified')}
                            className="text-[11px] font-semibold text-brand-600 hover:underline"
                          >
                            Toggle Verification
                          </button>
                          {app.documentsUrls?.passportPhoto && (
                            <button onClick={() => setPreviewDocument({ url: app.documentsUrls.passportPhoto, title: `${app.name} - Passport Photo` })} className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Medical Form */}
                      <div className="p-2.5 border rounded-lg bg-slate-50/50 space-y-1">
                        <div className="font-semibold text-slate-700 flex items-center justify-between">
                          <span>Medical Form</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            app.documents?.medicalForm === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.documents?.medicalForm || 'Pending'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleUpdateDocument(app.id, 'medicalForm', app.documents?.medicalForm === 'Verified' ? 'Pending' : 'Verified')}
                          className="w-full text-left text-[11px] font-semibold text-brand-600 hover:underline pt-1"
                        >
                          Toggle Verification
                        </button>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-100/70 rounded text-[11px] text-slate-600 italic">
                      Notes: {app.reviewerNotes || 'All primary verification items received.'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: ENTRANCE EXAM & ASSESSMENT */}
      {activeTab === "exams" && (
        <div className="space-y-6">
          {/* CBT Management Card */}
          <Card className="border border-amber-200 bg-amber-50/30">
            <CardHeader className="border-b border-amber-200/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-amber-950 flex items-center gap-2">
                    <Sparkles className="text-amber-600" size={18} /> Entrance Examination CBT Management
                  </CardTitle>
                  <p className="text-xs text-amber-800/80 mt-1">Generate, upload, or download computer-based test (CBT) questions for the entrance examination.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* CBT Selectors */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-white/50 border border-amber-200/50 rounded-xl">
                <div className="flex-1 space-y-1 text-left">
                  <Label className="text-xs text-amber-950 font-bold">Class</Label>
                  <select 
                    value={cbtClass}
                    onChange={(e) => setCbtClass(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-1 text-left">
                  <Label className="text-xs text-amber-950 font-bold">Academic Session</Label>
                  <select 
                    value={cbtSession}
                    onChange={(e) => setCbtSession(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-1 text-left">
                  <Label className="text-xs text-amber-950 font-bold">Term</Label>
                  <select 
                    value={cbtTerm}
                    onChange={(e) => setCbtTerm(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center space-y-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Generate Questions</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-2">Automatically generate randomized CBT questions.</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-xs whitespace-nowrap text-slate-600">No. of Qs:</Label>
                      <Input 
                        type="number" 
                        min={1} 
                        max={500}
                        value={cbtQuestionCount}
                        onChange={(e) => setCbtQuestionCount(parseInt(e.target.value) || 50)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50" onClick={handleGenerateCbt} disabled={isGeneratingCbt}>
                    {isGeneratingCbt ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></span>
                        Generating...
                      </span>
                    ) : (
                      "Generate via AI"
                    )}
                  </Button>
                </div>
                
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center space-y-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Upload Questions</h3>
                    <p className="text-xs text-slate-500 mt-1">Upload an Excel or CSV file containing custom CBT questions.</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => document.getElementById('cbt-upload')?.click()}>
                    Upload File
                  </Button>
                  <input type="file" id="cbt-upload" className="hidden" accept=".csv, .xlsx" onChange={handleUploadCbt} />
                </div>
                
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center space-y-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Download size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Download Questions</h3>
                    <p className="text-xs text-slate-500 mt-1">Export the current question bank for offline review or backup.</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={handleDownloadCbt}>
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        <Card className="border border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="text-amber-600" size={18} /> Entrance Examination Score Management
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Record assessment test results, verify pass cut-off ({admissionSettings.passCutoff}%), and approve candidates.</p>
              </div>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600" />
                Current Pass Cut-Off: {admissionSettings.passCutoff}%
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 font-bold text-slate-700 uppercase">
                    <th className="p-3">App ID</th>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Applied Class</th>
                    <th className="p-3">Exam Status</th>
                    <th className="p-3">Score (% Score)</th>
                    <th className="p-3">Assessment Outcome</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {apps.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-amber-900">{app.id}</td>
                      <td className="p-3 font-semibold text-slate-900">{app.name}</td>
                      <td className="p-3">{app.class || app.assignedClass}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          app.examStatus === 'Passed' ? 'bg-emerald-100 text-emerald-800' :
                          app.examStatus === 'Failed' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {app.examStatus || 'Scheduled'}
                        </span>
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          min={0}
                          max={100}
                          defaultValue={app.examScore || 0}
                          onBlur={(e) => handleUpdateExamScore(app.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-slate-300 rounded font-bold text-center focus:ring-2 focus:ring-amber-500"
                        />
                      </td>
                      <td className="p-3 font-bold">
                        {app.examScore >= admissionSettings.passCutoff ? (
                          <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14} /> Qualified</span>
                        ) : app.examScore > 0 ? (
                          <span className="text-rose-600 flex items-center gap-1"><XCircle size={14} /> Below Cut-off</span>
                        ) : (
                          <span className="text-slate-400">Pending Assessment</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Button 
                          onClick={() => handleIssueOffer(app)}
                          disabled={app.examScore < admissionSettings.passCutoff}
                          size="sm"
                          className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold disabled:opacity-40"
                        >
                          Generate Offer
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

      {/* TAB 4: OFFER LETTERS & ACCEPTANCE FEES */}
      {activeTab === "offers" && (
        <Card className="border border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="text-amber-600" size={18} /> Offer Letters & Acceptance Fee Control
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Print official admission offer letters and confirm candidate acceptance fee payments (₦{parseInt(admissionSettings.acceptanceFee).toLocaleString()}).</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 font-bold text-slate-700 uppercase">
                    <th className="p-3">App ID</th>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Assigned Class</th>
                    <th className="p-3">Offer Status</th>
                    <th className="p-3">Acceptance Fee</th>
                    <th className="p-3">Official Offer Letter</th>
                    <th className="p-3 text-right">Fee Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {apps.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-amber-900">{app.id}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        <div>{app.name}</div>
                        <div className="text-[10px] text-slate-500">{app.email}</div>
                      </td>
                      <td className="p-3 font-medium">{app.assignedClass || app.class}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          app.offerStatus === 'Offered' ? 'bg-indigo-100 text-indigo-800' :
                          app.offerStatus === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {app.offerStatus || 'Not Issued'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          app.acceptanceFee === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {app.acceptanceFee === 'Paid' ? '₦15,000 Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button 
                          onClick={() => handleIssueOffer(app)}
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1 text-slate-800 border-slate-300"
                        >
                          <Printer size={13} /> View & Print Letter
                        </Button>
                      </td>
                      <td className="p-3 text-right">
                        {app.acceptanceFee === 'Paid' ? (
                          <span className="text-emerald-600 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 size={14} /> Confirmed
                          </span>
                        ) : (
                          <Button 
                            onClick={() => handleMarkAcceptanceFee(app.id, 'Paid')}
                            size="sm"
                            className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            Mark Fee Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: FINAL ROSTER TRANSFER */}
      {activeTab === "transfer" && (
        <Card className="border border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="text-amber-600" size={18} /> Final Admission Roster & Active Student Integration
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Approved candidates who have fulfilled requirements can be converted directly into the main Student Directory in one click.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map(app => (
                <div key={app.id} className="p-4 border rounded-xl bg-slate-50/50 flex flex-col justify-between gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        {app.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-1">{app.name}</h4>
                      <p className="text-xs text-slate-500">Class: <span className="font-semibold text-slate-800">{app.assignedClass || app.class}</span> &bull; {app.phone}</p>
                    </div>
                    {app.isTransferredToRoster ? (
                      <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Enrolled
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">
                        Ready for Roster
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-slate-400">Exam Score:</p>
                      <p className="font-bold text-slate-800">{app.examScore || 0}% ({app.examStatus || 'N/A'})</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Acceptance Fee:</p>
                      <p className={`font-bold ${app.acceptanceFee === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {app.acceptanceFee || 'Unpaid'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    {app.isTransferredToRoster ? (
                      <span className="text-xs text-slate-500 font-mono">
                        Student ID: <strong className="text-slate-900">{app.enrolledStudentId || 'ESS/2026/XXX'}</strong>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Auto-assigns next available ESS Student ID</span>
                    )}
                    <Button 
                      onClick={() => handleTransferToStudentRoster(app)}
                      disabled={app.isTransferredToRoster}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 disabled:opacity-50"
                    >
                      <UserCheck size={14} /> {app.isTransferredToRoster ? 'Already Transferred' : 'Transfer to Student Roster'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: ADMISSIONS SETTINGS */}
      {activeTab === "settings" && (
        <Card className="border border-slate-200 max-w-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="text-amber-600" size={18} /> Admissions Session & Policy Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Active Admission Academic Session</Label>
                <Input 
                  value={admissionSettings.activeSession}
                  onChange={(e) => setAdmissionSettings({ ...admissionSettings, activeSession: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Application Fee (₦)</Label>
                  <Input 
                    type="number"
                    value={admissionSettings.appFee}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, appFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Acceptance Fee (₦)</Label>
                  <Input 
                    type="number"
                    value={admissionSettings.acceptanceFee}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, acceptanceFee: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="col-span-3">
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Online Payment Account Details</h4>
                  <p className="text-xs text-slate-500 mb-2">Applicants will see these details for offline bank transfers when applying for admission.</p>
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input 
                    type="text"
                    value={admissionSettings.bankName || ""}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, bankName: e.target.value })}
                    placeholder="e.g. GTB"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input 
                    type="text"
                    value={admissionSettings.accountName || ""}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, accountName: e.target.value })}
                    placeholder="School Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input 
                    type="text"
                    value={admissionSettings.accountNumber || ""}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, accountNumber: e.target.value })}
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <Label>Entrance Exam Cut-Off Score (% Pass Mark)</Label>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  value={admissionSettings.passCutoff}
                  onChange={(e) => setAdmissionSettings({ ...admissionSettings, passCutoff: parseInt(e.target.value) || 50 })}
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Online Admission Application Portal</h4>
                  <p className="text-xs text-slate-500">Allow parents/public applicants to submit new online admission applications.</p>
                </div>
                <button 
                  onClick={() => setAdmissionSettings({ ...admissionSettings, portalOpen: !admissionSettings.portalOpen })}
                  className={`w-12 h-6 rounded-full transition-colors p-1 ${
                    admissionSettings.portalOpen ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    admissionSettings.portalOpen ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">Admission Application Guidelines</h4>
                <p className="text-xs text-slate-500 mb-2">This text will be displayed in the guidelines modal on the admission portal.</p>
                <textarea 
                  className="w-full min-h-[200px] text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={admissionSettings.guidelines}
                  onChange={(e) => setAdmissionSettings({ ...admissionSettings, guidelines: e.target.value })}
                  placeholder="Enter the guidelines text (Markdown supported)..."
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">Admission Inquiry Gallery</h4>
                <p className="text-xs text-slate-500 mb-2">Add image URLs for the sliding gallery on the admission page (comma separated).</p>
                <textarea 
                  className="w-full min-h-[80px] text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={(admissionSettings.galleryImages || []).join(',\n')}
                  onChange={(e) => setAdmissionSettings({ ...admissionSettings, galleryImages: e.target.value.split(',').map(url => url.trim()).filter(Boolean) })}
                  placeholder="https://example.com/image1.jpg,&#10;https://example.com/image2.jpg"
                />
              </div>

              <Button onClick={() => alert("Admissions configuration saved!")} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold w-full">
                Save Admissions Policy Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 7: INQUIRIES */}
      {activeTab === "inquiries" && (
        <Card className="border-0 shadow-sm border border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="text-amber-600" size={18} /> Student Inquiries & Contact Forms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <th className="p-4">Date</th>
                    <th className="p-4">Name / Email</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-slate-500 font-medium">{new Date(inquiry.date).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{inquiry.name}</div>
                        <div className="text-xs text-slate-500">{inquiry.email}</div>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">{inquiry.subject}</td>
                      <td className="p-4 text-slate-600 max-w-[300px] truncate">{inquiry.message}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          inquiry.status === "Unread" ? "bg-amber-100 text-amber-800" :
                          inquiry.status === "Replied" ? "bg-emerald-100 text-emerald-800" :
                          "bg-slate-100 text-slate-800"
                        }`}>
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const updated = inquiries.map(i => i.id === inquiry.id ? { ...i, status: "Read" as const } : i);
                            setInquiries(updated);
                            alert(`Message from ${inquiry.name}:\n\n${inquiry.message}`);
                          }}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => {
                            const updated = inquiries.map(i => i.id === inquiry.id ? { ...i, status: "Replied" as const } : i);
                            setInquiries(updated);
                            showToast(`Marked inquiry from ${inquiry.name} as replied.`);
                          }}
                        >
                          Reply
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {inquiries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        <MessageSquare className="mx-auto mb-2 text-slate-300" size={32} />
                        No inquiries received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* INSPECT CANDIDATE MODAL */}
      {inspectApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex-1 mr-4">
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  {inspectApp.id}
                </span>
                {isEditingInspect ? (
                  <Input 
                    value={inspectApp.name} 
                    onChange={(e) => setInspectApp({...inspectApp, name: e.target.value})} 
                    className="mt-2 h-8 text-sm font-bold" 
                  />
                ) : (
                  <h3 className="font-bold text-slate-900 text-lg mt-1 flex items-center gap-2">
                    {inspectApp.name}
                    <button onClick={() => setIsEditingInspect(true)} className="text-brand-600 hover:text-brand-800" title="Edit Profile">
                      <Edit2 size={14} />
                    </button>
                  </h3>
                )}
              </div>
              <button onClick={() => { setInspectApp(null); setIsEditingInspect(false); }} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">Class Applied</p>
                {isEditingInspect ? (
                  <Input 
                    value={inspectApp.class || inspectApp.assignedClass} 
                    onChange={(e) => setInspectApp({...inspectApp, class: e.target.value, assignedClass: e.target.value})} 
                    className="mt-1 h-7 text-xs" 
                  />
                ) : (
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{inspectApp.class || inspectApp.assignedClass}</p>
                )}
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">State & LGA</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{inspectApp.state || 'Benue'} ({inspectApp.lga || 'Makurdi'})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">Phone & Email</p>
                {isEditingInspect ? (
                  <div className="space-y-1 mt-1">
                    <Input value={inspectApp.phone || ''} onChange={e => setInspectApp({...inspectApp, phone: e.target.value})} className="h-7 text-xs" placeholder="Phone" />
                    <Input value={inspectApp.email || ''} onChange={e => setInspectApp({...inspectApp, email: e.target.value})} className="h-7 text-[11px]" placeholder="Email" />
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{inspectApp.phone}</p>
                    <p className="text-slate-500 text-[11px] truncate">{inspectApp.email || 'N/A'}</p>
                  </>
                )}
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">Exam Score</p>
                {isEditingInspect ? (
                  <Input 
                    type="number"
                    value={inspectApp.examScore || 0} 
                    onChange={(e) => setInspectApp({...inspectApp, examScore: parseInt(e.target.value) || 0})} 
                    className="mt-1 h-7 text-xs" 
                  />
                ) : (
                  <p className="font-bold text-amber-900 text-sm mt-0.5">{inspectApp.examScore || 0}% ({inspectApp.examStatus || 'N/A'})</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-900">Reviewer & Administrative Notes</Label>
              <textarea 
                defaultValue={inspectApp.reviewerNotes || ""}
                onBlur={(e) => {
                  setApps(prev => prev.map(a => a.id === inspectApp.id ? { ...a, reviewerNotes: e.target.value } : a));
                  showToast("Reviewer notes saved.");
                }}
                className="w-full h-20 text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                placeholder="Enter administrative review notes..."
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <Button onClick={() => { setInspectApp(null); handleIssueOffer(inspectApp); }} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5">
                <Printer size={14} /> Generate Offer Letter
              </Button>
              <Button variant="outline" onClick={() => setInspectApp(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PROVISIONAL OFFER LETTER MODAL */}
      {showOfferModal && offerApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-8 space-y-6 animate-in zoom-in-95 my-8">
            <div className="text-center border-b border-slate-200 pb-6 space-y-2">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto overflow-hidden">
                <img src={portalSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-heading text-2xl font-black text-slate-900 uppercase">{portalSettings.schoolName}</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Office of the Registrar & Admissions Board</p>
              <p className="text-xs text-slate-400">{portalSettings.address} &bull; {portalSettings.contactEmail}</p>
            </div>

            <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
              <div className="flex justify-between font-bold text-slate-900 border-b border-slate-100 pb-2">
                <span>Date: {new Date().toLocaleDateString()}</span>
                <span>App Ref: {offerApp.id}</span>
              </div>

              <p>Dear <strong>Parent / Guardian of {offerApp.name}</strong>,</p>

              <p className="text-sm font-bold text-slate-900 bg-amber-50 p-3 rounded-lg border border-amber-200 text-center uppercase tracking-wide">
                PROVISIONAL OFFER OF ADMISSION ({admissionSettings.activeSession} ACADEMIC SESSION)
              </p>

              <p>
                We are pleased to inform you that following your child's recent entrance evaluation and document verification, <strong>{offerApp.name}</strong> has been offered provisional admission into <strong>{offerApp.assignedClass || offerApp.class}</strong> at {portalSettings.schoolName} for the <strong>{admissionSettings.activeSession}</strong> academic session.
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-900 border-b pb-1">Admission Requirements & Next Steps:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Payment of Non-refundable Acceptance Fee of <strong>₦{parseInt(admissionSettings.acceptanceFee).toLocaleString()}</strong> within 14 days.</li>
                  <li>Submission of original copies of Birth Certificate & Previous Academic Transcripts during physical orientation.</li>
                  <li>Resumption Date: <strong>September 14, 2026</strong>.</li>
                </ul>
              </div>

              <p>Congratulations on your child's admission into {portalSettings.schoolName}!</p>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                <div>
                  <div className="font-serif italic text-base font-bold text-slate-900">{portalSettings.admissionOfficerName || "Dr. A. O. Terungwa"}</div>
                  <p className="text-[10px] text-slate-500">Secretary, Admissions Board</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[11px]">
                    OFFICIALLY SEALED
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => window.print()} className="gap-1.5 text-xs">
                <Printer size={15} /> Print Offer Letter
              </Button>
              <Button onClick={() => setShowOfferModal(false)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                Close Window
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* NEW MANUAL APPLICANT MODAL */}
      {showNewAppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus size={18} className="text-amber-600" /> Manual Offline Application Registration
              </h3>
              <button onClick={() => setShowNewAppModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Candidate First Name *</Label>
                  <Input 
                    value={newApplicant.firstName}
                    onChange={(e) => setNewApplicant({ ...newApplicant, firstName: e.target.value })}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Candidate Last Name *</Label>
                  <Input 
                    value={newApplicant.lastName}
                    onChange={(e) => setNewApplicant({ ...newApplicant, lastName: e.target.value })}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Class Applying For</Label>
                  <select 
                    value={newApplicant.class}
                    onChange={(e) => setNewApplicant({ ...newApplicant, class: e.target.value })}
                    className="w-full h-10 border border-slate-300 rounded-lg px-2.5 bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    {CLASSES.slice(0, 24).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Gender</Label>
                  <select 
                    value={newApplicant.gender}
                    onChange={(e) => setNewApplicant({ ...newApplicant, gender: e.target.value })}
                    className="w-full h-10 border border-slate-300 rounded-lg px-2.5 bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Guardian Phone Number</Label>
                  <Input 
                    value={newApplicant.phone}
                    onChange={(e) => setNewApplicant({ ...newApplicant, phone: e.target.value })}
                    placeholder="+234 800 000 0000"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Guardian Email</Label>
                  <Input 
                    type="email"
                    value={newApplicant.email}
                    onChange={(e) => setNewApplicant({ ...newApplicant, email: e.target.value })}
                    placeholder="parent@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>State of Origin</Label>
                  <Input 
                    value={newApplicant.state}
                    onChange={(e) => setNewApplicant({ ...newApplicant, state: e.target.value })}
                    placeholder="e.g. Benue"
                  />
                </div>
                <div className="space-y-1">
                  <Label>LGA</Label>
                  <Input 
                    value={newApplicant.lga}
                    onChange={(e) => setNewApplicant({ ...newApplicant, lga: e.target.value })}
                    placeholder="e.g. Makurdi"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowNewAppModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                  Register Applicant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{previewDocument.title}</h3>
              <button onClick={() => setPreviewDocument(null)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50 p-6 flex justify-center">
              {previewDocument.url.startsWith('data:image') ? (
                <img src={previewDocument.url} alt={previewDocument.title} className="max-w-full h-auto object-contain shadow-sm border border-slate-200" />
              ) : previewDocument.url.startsWith('data:application/pdf') ? (
                <iframe src={previewDocument.url} title={previewDocument.title} className="w-full h-[70vh] border border-slate-200 rounded shadow-sm" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 py-12">
                  <p>Document preview is not available for this format.</p>
                  <a href={previewDocument.url} download className="mt-4 text-brand-600 font-medium hover:underline">Download File</a>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <Button onClick={() => setPreviewDocument(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
