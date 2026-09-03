import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNews } from "../data/newsData";
import { useSessions, TERMS } from "../data/sessionsData";
import { useStudents, useAdmissionApps } from "../data/studentsData";
import { usePins, PinRecord } from "../data/pinsData";
import { useInquiries } from "../data/inquiriesData";
import { useTeachers } from "../data/teachersData";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { 
  Users, BookOpen, GraduationCap, TrendingUp, Download, Key, ShieldCheck, 
  CheckCircle, RefreshCw, Plus, Search, Filter, Printer, Eye, EyeOff, 
  Copy, Check, Layers, UserCheck, FileSpreadsheet, Sparkles, AlertCircle, 
  X, FileText, Lock, Unlock, Clock, ArrowRight, Zap, MessageSquare
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import TeacherDashboard from "./dashboard/TeacherDashboard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PinAuditLog {
  id: string;
  studentName: string;
  studentId: string;
  class: string;
  session: string;
  pinCode: string;
  serialNumber: string;
  timestamp: string;
  ipAddress: string;
  status: "Verified Success" | "Invalid Attempt";
}

const CLASSES = ["All Classes", "JSS 1A", "JSS 1B", "JSS 1C", "JSS 1D", "JSS 2A", "JSS 2B", "JSS 2C", "JSS 2D", "JSS 3A", "JSS 3B", "JSS 3C", "JSS 3D", "SSS 1A", "SSS 1B", "SSS 1C", "SSS 1D", "SSS 2A", "SSS 2B", "SSS 2C", "SSS 2D", "SSS 3A", "SSS 3B", "SSS 3C", "SSS 3D"];

const initialAuditLogs: PinAuditLog[] = [
  { id: "LOG-501", studentName: "Oluwaseun Adebayo", studentId: "ESS/2026/001", class: "SSS 3A", session: "2025/2026 - First Term", pinCode: "9842-1048-5510", serialNumber: "SN-2026-001", timestamp: "2026-07-25 10:14 AM", ipAddress: "102.89.23.11", status: "Verified Success" },
  { id: "LOG-502", studentName: "Chioma Nwosu", studentId: "ESS/2026/002", class: "SSS 3A", session: "2025/2026 - First Term", pinCode: "3319-4820-1102", serialNumber: "SN-2026-002", timestamp: "2026-07-24 02:32 PM", ipAddress: "197.210.45.8", status: "Verified Success" },
  { id: "LOG-503", studentName: "Zainab Bello", studentId: "ESS/2026/006", class: "JSS 1A", session: "2025/2026 - First Term", pinCode: "6631-2290-7711", serialNumber: "SN-2026-006", timestamp: "2026-07-25 11:20 AM", ipAddress: "102.91.12.90", status: "Verified Success" },
  { id: "LOG-504", studentName: "Grace Okhiria", studentId: "ESS/2026/004", class: "SSS 3A", session: "2025/2026 - First Term", pinCode: "1209-5541-6677", serialNumber: "SN-2026-004", timestamp: "2026-07-25 09:15 AM", ipAddress: "41.203.77.102", status: "Verified Success" },
];

const performanceData = [
  { name: 'Jan', attendance: 92, performance: 78 },
  { name: 'Feb', attendance: 95, performance: 82 },
  { name: 'Mar', attendance: 94, performance: 85 },
  { name: 'Apr', attendance: 96, performance: 88 },
  { name: 'May', attendance: 98, performance: 86 },
  { name: 'Jun', attendance: 97, performance: 91 },
];

export default function Dashboard() {
  const [sessions, setSessions] = useSessions();
  const [students, setStudents] = useStudents();
  
  let userRoles: string[] = [];
  try {
    userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  } catch (e) {}

  if (userRoles.length === 0) {
    const r = localStorage.getItem('userRole') || 'admin';
    if (r === 'admin') userRoles = ['General Admin'];
    else if (r === 'superadmin') userRoles = ['Admission Officer'];
    else if (r === 'portaladmin') userRoles = ['Portal Admin'];
    else userRoles = ['Teacher'];
  }

  const isTeacher = userRoles.includes('Teacher');
  const isExaminationAdmin = userRoles.includes('Examination Admin');
  const isGeneralAdmin = userRoles.includes('General Admin') || userRoles.includes('Admin') || userRoles.includes('Super Admin');
  const isPortalAdmin = userRoles.includes('Portal Admin');
  const isAdmissionOfficer = userRoles.includes('Admission Officer');
  const isFinanceOfficer = userRoles.includes('Finance/Admin Officer');
  const isHRAdmin = userRoles.includes('HR/Staff Admin');
  const isAcademicAdmin = userRoles.includes('Academic Admin');

  const [teachers] = useTeachers();
  const loggedInUserId = localStorage.getItem('loggedInUserId');
  const teacher = teachers.find(t => t.id === loggedInUserId);

  const impersonatingName = localStorage.getItem('impersonatingName');
  const displayName = impersonatingName || (teacher ? teacher.name : "User");
  const displayTitle = userRoles.join(" | ");

  const [admissionApps, setAdmissionApps] = useAdmissionApps();
  const [pins, setPins] = usePins();
  const [newsList, setNewsList] = useNews();
  const [inquiries] = useInquiries();
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const SESSIONS = sessions;

  const stats = [
    { title: "Total Students", value: students.length.toLocaleString(), icon: Users, trend: "+12.5%", color: "text-blue-600", bg: "bg-blue-50", show: true },
    { title: "Active Teachers", value: "148", icon: BookOpen, trend: "+2.4%", color: "text-brand-600", bg: "bg-brand-50", show: isGeneralAdmin || isHRAdmin || isAcademicAdmin },
    { title: "Average Score", value: "84.5%", icon: GraduationCap, trend: "+5.1%", color: "text-purple-600", bg: "bg-purple-50", show: true },
    { title: "Fee Collection", value: "₦45.2M", icon: TrendingUp, trend: "+15.3%", color: "text-amber-600", bg: "bg-amber-50", show: isGeneralAdmin || isFinanceOfficer },
  ].filter(s => s.show);

  const isTeacherOnly = isTeacher && !isGeneralAdmin && !isPortalAdmin && !isExaminationAdmin && !isAdmissionOfficer && !isFinanceOfficer && !isHRAdmin && !isAcademicAdmin;
  if (isTeacherOnly && teacher) {
    return <TeacherDashboard teacher={teacher} stats={stats} sessions={SESSIONS} newsList={newsList} />;
  }

  // Handler: Approve Admission
  const handleApproveAdmission = (appId: string) => {
    const app = admissionApps.find(a => a.id === appId);
    if (!app) return;

    const newStudentId = `ESS/2026/${String(students.length + 1).padStart(3, '0')}`;
    const newStudent = {
      id: newStudentId,
      name: app.name,
      class: app.assignedClass || app.class,
      previousClass: "Transferred / Applicant",
      gender: "Male",
      status: "Active",
      fees: app.payment === "Paid" ? "Paid" : "Unpaid",
      email: `${app.name.toLowerCase().replace(/\s+/g, '.')}@student.ess.edu.ng`,
      parentNumber: app.phone || "+234 800 000 0000",
      address: "Makurdi, Benue State",
      password: "password123",
      enrollmentStatus: "Newly Enrolled"
    };

    setStudents([newStudent, ...students]);
    setAdmissionApps(prev => prev.map(a => a.id === appId ? { ...a, status: "Approved" } : a));

    // Automatically generate PIN
    const rawPin = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const serial = `SN-2026-${String(pins.length + 1).padStart(3, '0')}`;
    const newPin: PinRecord = {
      id: `PIN-${Date.now()}`,
      pinCode: rawPin,
      serialNumber: serial,
      studentId: newStudentId,
      studentName: app.name,
      class: app.assignedClass || app.class,
      session: `${sessions[0] || "2025/2026"} - First Term`,
      status: "Active",
      usesRemaining: 5,
      maxUses: 5,
      dateGenerated: new Date().toISOString().split('T')[0]
    };
    setPins([newPin, ...pins]);

    setNotificationMsg(`Admission Approved for ${app.name}! Assigned ID: ${newStudentId}. Scratch Card PIN Generated: ${rawPin}`);
    setTimeout(() => setNotificationMsg(""), 6000);
  };

  // PIN Management State
  const [auditLogs, setAuditLogs] = useState<PinAuditLog[]>(initialAuditLogs);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [pinViewShown, setPinViewShown] = useState(false);
  const [pinSessionFilter, setPinSessionFilter] = useState("");
  const [pinTermFilter, setPinTermFilter] = useState("");
  const [pinClassFilter, setPinClassFilter] = useState("");
  const [pinAdmFilter, setPinAdmFilter] = useState("");

  // Sub-feature View Selection
  const [activePinTab, setActivePinTab] = useState<
    | "generated_pins"
    | "generate_individual"
    | "check_used"
    | "check_class"
    | "generate_class"
    | "activate_class"
    | "activate_single"
    | "download_class"
    | "get_class_slips"
    | "checked_results_log"
  >("generated_pins");

  // Filter & Search Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("All Classes");
  const [selectedSessionFilterYear, setSelectedSessionFilterYear] = useState(() => sessions[1] || sessions[0] || "2025/2026");
  const [selectedSessionFilterTerm, setSelectedSessionFilterTerm] = useState("First Term");
  const selectedSessionFilter = `${selectedSessionFilterYear} - ${selectedSessionFilterTerm}`;
  const [revealedPins, setRevealedPins] = useState<{ [key: string]: boolean }>({});
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);

  // Form State: Generate Individual PIN
  const [indivStudentId, setIndivStudentId] = useState("ESS/2026/001");
  const [indivSessionYear, setIndivSessionYear] = useState(() => sessions[1] || sessions[0] || "2025/2026");
  const [indivSessionTerm, setIndivSessionTerm] = useState("First Term");
  const [indivMaxUses, setIndivMaxUses] = useState(5);
  const [lastGeneratedPin, setLastGeneratedPin] = useState<PinRecord | null>(null);
  const [isLastPinRevealed, setIsLastPinRevealed] = useState(false);

  // Form State: Generate Class PINs
  const [batchClass, setBatchClass] = useState("SSS 3A");
  const [batchSessionYear, setBatchSessionYear] = useState(() => sessions[1] || sessions[0] || "2025/2026");
  const [batchSessionTerm, setBatchSessionTerm] = useState("First Term");

  // Form State: Single Student Activation
  const [searchActivationTerm, setSearchActivationTerm] = useState("ESS/2026/003");
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [newSessionYear, setNewSessionYear] = useState("");
  const [newSessionTerm, setNewSessionTerm] = useState("First Term");
  
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessions.includes(newSessionYear)) {
      setSessions([...sessions, newSessionYear]);
    }
    setIsCreateSessionOpen(false);
    setNewSessionYear("");
    setNewSessionTerm("First Term");
    alert(`Academic Session ${newSessionYear} created successfully!`);
  };


  // Helper: Reveal/Hide PIN
  const toggleRevealPin = (id: string) => {
    setRevealedPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper: Copy PIN
  const handleCopyPin = (pinCode: string, id: string) => {
    navigator.clipboard.writeText(pinCode);
    setCopiedPinId(id);
    setTimeout(() => setCopiedPinId(null), 2000);
  };

  // 1. Feature: Generate Individual PIN
  const handleGenerateIndividualPin = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === indivStudentId) || students[0];
    const rawPin = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const serial = `SN-2026-${String(pins.length + 1).padStart(3, '0')}`;

    const newPin: PinRecord = {
      id: `PIN-${Date.now()}`,
      pinCode: rawPin,
      serialNumber: serial,
      studentId: st.id,
      studentName: st.name,
      class: st.class,
      session: `${indivSessionYear} - ${indivSessionTerm}`,
      status: "Active",
      usesRemaining: indivMaxUses,
      maxUses: indivMaxUses,
      dateGenerated: new Date().toISOString().split('T')[0]
    };

    setPins([newPin, ...pins]);
    setLastGeneratedPin(newPin);
    setIsLastPinRevealed(false);
    setNotificationMsg(`Successfully generated Individual Result Checking PIN for ${st.name} (${st.id})! PIN: ${rawPin}`);
    setTimeout(() => setNotificationMsg(""), 5000);
  };

  // 5. Feature: Generate Class PINs (Batch)
  const handleGenerateClassPins = (cls: string, session: string) => {
    const classStudents = students.filter(s => s.class === cls || cls === "All Classes");
    if (classStudents.length === 0) {
      setNotificationMsg(`No students registered under class ${cls}`);
      setTimeout(() => setNotificationMsg(""), 4000);
      return;
    }

    const createdList: PinRecord[] = classStudents.map((st, idx) => {
      const rawPin = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        id: `PIN-CLS-${Date.now()}-${idx}`,
        pinCode: rawPin,
        serialNumber: `SN-2026-${String(pins.length + idx + 1).padStart(3, '0')}`,
        studentId: st.id,
        studentName: st.name,
        class: st.class,
        session: session,
        status: "Active",
        usesRemaining: 5,
        maxUses: 5,
        dateGenerated: new Date().toISOString().split('T')[0]
      };
    });

    setPins([...createdList, ...pins]);
    setNotificationMsg(`Success! Created ${createdList.length} Class Result PINs for ${cls} (${session})`);
    setActivePinTab("generated_pins");
    setTimeout(() => setNotificationMsg(""), 5000);
  };

  // 6. Feature: Activate Class PINs
  const handleActivateClassPins = (cls: string) => {
    let count = 0;
    setPins(prev => prev.map(p => {
      if ((p.class === cls || cls === "All Classes") && p.status === "Inactive") {
        count++;
        return { ...p, status: "Active" };
      }
      return p;
    }));

    setNotificationMsg(`Activated ${count} PINs for ${cls}! All students in this class can now check results.`);
    setTimeout(() => setNotificationMsg(""), 5000);
  };

  // 7. Feature: Activate Single Student's PIN
  const handleToggleSinglePinStatus = (pinId: string) => {
    setPins(prev => prev.map(p => {
      if (p.id === pinId) {
        const nextStatus = p.status === "Active" ? "Inactive" : "Active";
        setNotificationMsg(`PIN status for ${p.studentName} updated to ${nextStatus}.`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  // 8. Feature: Download Class PINs (CSV)
  const handleDownloadClassPinsCsv = (cls: string) => {
    const list = pins.filter(p => cls === "All Classes" || p.class === cls);
    if (list.length === 0) {
      alert(`No PINs available to download for ${cls}`);
      return;
    }

    const headers = "Serial Number,PIN Code,Student Name,Admission ID,Class,Session,Status,Uses Remaining\n";
    const rows = list.map(p => 
      `"${p.serialNumber}","${p.pinCode}","${p.studentName}","${p.studentId}","${p.class}","${p.session}","${p.status}","${p.usesRemaining}/${p.maxUses}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Class_PINs_${cls.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setNotificationMsg(`Downloaded CSV file containing ${list.length} PINs for ${cls}!`);
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  // Filtered PIN records
  const filteredPins = pins.filter(p => {
    const matchesSearch = p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.pinCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClassFilter === "All Classes" || p.class === selectedClassFilter;
    const matchesSession = selectedSessionFilter === "All Sessions" || p.session === selectedSessionFilter;
    return matchesSearch && matchesClass && matchesSession;
  });

  // Filtered Used PINs
  const usedPins = pins.filter(p => p.status === "Used" || p.usesRemaining < p.maxUses);

  // Single Student Search Activation Target
  const singleActivationTarget = pins.find(p => 
    p.studentId.toLowerCase() === searchActivationTerm.toLowerCase() || 
    p.studentName.toLowerCase().includes(searchActivationTerm.toLowerCase()) ||
    p.serialNumber.toLowerCase() === searchActivationTerm.toLowerCase() ||
    p.pinCode.toLowerCase() === searchActivationTerm.toLowerCase()
  ) || pins[0];

  // Slips Class List
  const slipsPinsList = pins.filter(p => selectedClassFilter === "All Classes" ? true : p.class === selectedClassFilter);

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">Dashboard & Control Center</h2>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            Welcome back, {displayName}. 
            <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
              {displayTitle}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          {(isGeneralAdmin || isAcademicAdmin) && (
            <Button variant="brand" className="gap-2" onClick={() => setIsCreateSessionOpen(true)}>
              <Plus size={16} />
              Create Academic Session
            </Button>
          )}
          <Button variant="outline" className="gap-2 bg-white" onClick={() => window.print()}>
            <Download size={16} />
            Print Report / Page
          </Button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg("")} className="text-emerald-600 hover:text-emerald-800">
            <X size={18} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                  <h4 className="text-2xl font-bold font-heading text-slate-900">{stat.value}</h4>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-600 font-medium">{stat.trend}</span>
                <span className="text-slate-400 ml-2">vs last term</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* EXPLICIT REQUESTED PIN GENERATION & RESULT PIN CONTROL CENTER */}
      {/* ========================================================================= */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white overflow-hidden">
        <CardHeader className="py-5 px-6 border-b border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
              <Key size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                Generate PIN & Result Access PINs Management Center
              </CardTitle>
              <p className="text-xs text-slate-300 mt-0.5">
                Full 10-in-1 PIN Suite: Individual & Class PIN generation, activation controls, slip printing, and audit logs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Active PIN Engine Online
            </span>
          </div>
        </CardHeader>

        {/* 10 Sub-Feature Navigation Toolbar */}
        <div className="bg-slate-900/90 p-2.5 border-b border-slate-800 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max text-xs font-bold">
            {/* 1. Generated PINs */}
            <button
              onClick={() => { setActivePinTab("generated_pins"); setPinViewShown(false); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activePinTab === "generated_pins" 
                  ? "bg-brand-600 text-white shadow-md" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Key size={14} className="text-amber-400" />
              Generated PINs ({pins.length})
            </button>

            {/* 2. Generate Individual PIN */}
            <button
              onClick={() => { setActivePinTab("generate_individual"); setPinViewShown(false); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activePinTab === "generate_individual" 
                  ? "bg-brand-600 text-white shadow-md" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Plus size={14} className="text-emerald-400" />
              Generate Individual PIN
            </button>

            {/* 3. Check Used PINs */}
            <button
              onClick={() => { setActivePinTab("check_used"); setPinViewShown(false); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activePinTab === "check_used" 
                  ? "bg-brand-600 text-white shadow-md" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <CheckCircle size={14} className="text-cyan-400" />
              Check Used PINs ({usedPins.length})
            </button>

            {/* 4. Check Class PINs */}
            <button
              onClick={() => { setActivePinTab("check_class"); setPinViewShown(false); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activePinTab === "check_class" 
                  ? "bg-brand-600 text-white shadow-md" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Layers size={14} className="text-indigo-400" />
              Check Class PINs
            </button>

            {/* 5. Generate Class PINs */}
            <button
              onClick={() => { setActivePinTab("generate_class"); setPinViewShown(false); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activePinTab === "generate_class" 
                  ? "bg-brand-600 text-white shadow-md" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Zap size={14} className="text-amber-300" />
              Generate Class PINs
            </button>

            {/* 6. Activate Class PINs */}
            <button
              onClick={() => { setActivePinTab("activate_class"); setPinViewShown(false); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activePinTab === "activate_class" 
                  ? "bg-brand-600 text-white shadow-md" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Unlock size={14} className="text-emerald-300" />
              Activate Class PINs
            </button>

            {/* 7. Activate Single Student's PIN */}
            <button
              onClick={() => { setActivePinTab("activate_single"); setPinViewShown(false); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activePinTab === "activate_single" 
                  ? "bg-brand-600 text-white shadow-md" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <UserCheck size={14} className="text-teal-300" />
              Activate Single Student's PIN
            </button>

            {/* 8. Download Class PINs */}
            <button
              onClick={() => { setActivePinTab("download_class"); setPinViewShown(false); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activePinTab === "download_class" 
                  ? "bg-brand-600 text-white shadow-md" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Download size={14} className="text-purple-300" />
              Download Class PINs
            </button>

            {/* 9. GetClass PIN Slips */}
            <button
              onClick={() => { setActivePinTab("get_class_slips"); setPinViewShown(false); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activePinTab === "get_class_slips" 
                  ? "bg-brand-600 text-white shadow-md" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Printer size={14} className="text-rose-300" />
              GetClass PIN Slips
            </button>

            {/* 10. Checked Results Via PIN Use */}
            <button
              onClick={() => { setActivePinTab("checked_results_log"); setPinViewShown(false); }}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                activePinTab === "checked_results_log" 
                  ? "bg-brand-600 text-white shadow-md" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <FileSpreadsheet size={14} className="text-blue-300" />
              Checked Results Via PIN Use ({auditLogs.length})
            </button>
          </div>
        </div>

        <CardContent className="p-6 bg-slate-950 text-slate-100">
          {/* ========================================================================= */}
          {/* 1. SUB-FEATURE: GENERATED PINS */}
          {/* ========================================================================= */}
          {activePinTab === "generated_pins" && (

            !pinViewShown ? (
              <div className="max-w-md mx-auto mt-10">
                <Card className="border-0 shadow-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <CardHeader className="border-b border-slate-800 pb-4 bg-slate-800/50">
                    <CardTitle className="text-white text-lg">Generated PINs</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">Select parameters to view generated PINs.</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Academic Session</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinSessionFilter || sessions[0]} onChange={(e) => setPinSessionFilter(e.target.value)}>
                        {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Term</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinTermFilter || TERMS[0]} onChange={(e) => setPinTermFilter(e.target.value)}>
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Class</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinClassFilter || CLASSES[0]} onChange={(e) => setPinClassFilter(e.target.value)}>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    
                    <Button variant="brand" className="w-full mt-4" onClick={() => {
                      if (!pinSessionFilter) setPinSessionFilter(sessions[0]);
                      if (!pinTermFilter) setPinTermFilter(TERMS[0]);
                      if (!pinClassFilter) setPinClassFilter(CLASSES[0]);
                      setPinViewShown(true);
                    }}>Continue</Button>
                  </CardContent>
                </Card>
              </div>
            ) : (

            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Key size={18} className="text-amber-400" />
                    Generated PINs Roster
                  </h3>
                  <p className="text-xs text-slate-400">Master repository of all result checking PIN codes and serial numbers</p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                    <Input 
                      placeholder="Search name, PIN, serial..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 w-48 text-xs bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <select
                    className="h-9 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 text-xs font-semibold"
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <Button 
                    variant="brand" 
                    size="sm" 
                    className="h-9 text-xs gap-1.5"
                    onClick={() => { setActivePinTab("generate_individual"); setPinViewShown(false); }}
                  >
                    <Plus size={14} /> Generate New PIN
                  </Button>
                </div>
              </div>

              {/* Generated PINs Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/90">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="p-3">Serial No</th>
                        <th className="p-3">PIN Code</th>
                        <th className="p-3">Student Name & ID</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">Academic Session</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Uses Remaining</th>
                        <th className="p-3 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {filteredPins.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                            No generated PINs found matching search parameters.
                          </td>
                        </tr>
                      ) : (
                        filteredPins.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/60 transition-colors">
                            <td className="p-3 font-mono text-emerald-400 font-bold">{p.serialNumber}</td>
                            <td className="p-3 font-mono font-black text-amber-300 text-sm">
                              {revealedPins[p.id] ? p.pinCode : "••••-••••-••••"}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-white">{p.studentName}</div>
                              <div className="text-[11px] font-mono text-slate-400">{p.studentId}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-brand-900/60 text-brand-300 font-semibold border border-brand-700/50">
                                {p.class}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300">{p.session}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                p.status === "Active" ? "bg-emerald-950 text-emerald-300 border border-emerald-700" :
                                p.status === "Used" ? "bg-cyan-950 text-cyan-300 border border-cyan-700" :
                                "bg-rose-950 text-rose-300 border border-rose-700"
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-300">
                              {p.usesRemaining} / {p.maxUses}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => toggleRevealPin(p.id)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                                  title="Reveal PIN"
                                >
                                  {revealedPins[p.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>

                                <button
                                  onClick={() => handleCopyPin(p.pinCode, p.id)}
                                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                                  title="Copy PIN"
                                >
                                  {copiedPinId === p.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                </button>

                                <button
                                  onClick={() => handleToggleSinglePinStatus(p.id)}
                                  className={`px-2 py-1 rounded text-[11px] font-bold ${
                                    p.status === "Active" ? "bg-rose-900/60 text-rose-200 border border-rose-700" : "bg-emerald-900/60 text-emerald-200 border border-emerald-700"
                                  }`}
                                >
                                  {p.status === "Active" ? "Disable" : "Activate"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) )}

          {/* ========================================================================= */}
          {/* 2. SUB-FEATURE: GENERATE INDIVIDUAL PIN */}
          {/* ========================================================================= */}
          {activePinTab === "generate_individual" && (

            !pinViewShown ? (
              <div className="max-w-md mx-auto mt-10">
                <Card className="border-0 shadow-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <CardHeader className="border-b border-slate-800 pb-4 bg-slate-800/50">
                    <CardTitle className="text-white text-lg">Generate Individual PIN</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">Provide details to generate.</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Academic Session</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinSessionFilter || sessions[0]} onChange={(e) => setPinSessionFilter(e.target.value)}>
                        {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Term</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinTermFilter || TERMS[0]} onChange={(e) => setPinTermFilter(e.target.value)}>
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Admission Number</Label>
                      <Input placeholder="e.g. ESS/2026/001" className="h-10 border-slate-700 bg-slate-950 text-white" value={pinAdmFilter} onChange={(e) => setPinAdmFilter(e.target.value)} />
                    </div>
                    <Button variant="brand" className="w-full mt-4" onClick={() => {
                      if (!pinSessionFilter) setPinSessionFilter(sessions[0]);
                      if (!pinTermFilter) setPinTermFilter(TERMS[0]);
                      if (!pinClassFilter) setPinClassFilter(CLASSES[0]);
                      setPinViewShown(true);
                    }}>Continue</Button>
                  </CardContent>
                </Card>
              </div>
            ) : (

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border border-slate-800 bg-slate-900/90 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Generate Individual PIN</h3>
                    <p className="text-xs text-slate-400">Issue a single custom result checking PIN for a specific student</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateIndividualPin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300">Select Student</Label>
                    <select
                      className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 text-sm font-semibold"
                      value={indivStudentId}
                      onChange={(e) => setIndivStudentId(e.target.value)}
                    >
                      {students.map((st, idx) => (
                        <option key={`${st.id}_${idx}`} value={st.id}>{st.name} ({st.id} - {st.class})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Academic Year</Label>
                      <select
                        className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 text-sm font-semibold"
                        value={indivSessionYear}
                        onChange={(e) => setIndivSessionYear(e.target.value)}
                      >
                        {SESSIONS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Term</Label>
                      <select
                        className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 text-sm font-semibold"
                        value={indivSessionTerm}
                        onChange={(e) => setIndivSessionTerm(e.target.value)}
                      >
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Maximum Usage Limit</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={indivMaxUses}
                        onChange={(e) => setIndivMaxUses(parseInt(e.target.value) || 5)}
                        className="bg-slate-950 border-slate-700 text-white font-bold"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="brand" className="w-full h-11 text-sm font-bold gap-2 bg-emerald-600 hover:bg-emerald-500">
                    <Zap size={18} /> Generate Individual PIN Now
                  </Button>
                </form>

                {lastGeneratedPin && (
                  <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">PIN Generated Successfully!</span>
                      <span className="text-xs font-mono text-emerald-300">{lastGeneratedPin.serialNumber}</span>
                    </div>
                    <div className="text-2xl font-black font-mono text-amber-300 bg-slate-950 p-3 rounded-lg border border-amber-500/30 flex items-center justify-between">
                      <span>{isLastPinRevealed ? lastGeneratedPin.pinCode : "••••-••••-••••"}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-800 text-white border-slate-700 gap-1" onClick={() => setIsLastPinRevealed(!isLastPinRevealed)}>
                          {isLastPinRevealed ? <EyeOff size={14} /> : <Eye size={14} />} 
                        </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-800 text-white border-slate-700 gap-1" onClick={() => handleCopyPin(lastGeneratedPin.pinCode, lastGeneratedPin.id)}>
                          <Copy size={14} /> Copy Code
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">
                      Assigned to: <strong>{lastGeneratedPin.studentName}</strong> ({lastGeneratedPin.studentId}) &middot; Class: <strong>{lastGeneratedPin.class}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) )}

          {/* ========================================================================= */}
          {/* 3. SUB-FEATURE: CHECK USED PINS */}
          {/* ========================================================================= */}
          {activePinTab === "check_used" && (

            !pinViewShown ? (
              <div className="max-w-md mx-auto mt-10">
                <Card className="border-0 shadow-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <CardHeader className="border-b border-slate-800 pb-4 bg-slate-800/50">
                    <CardTitle className="text-white text-lg">Check Used PINs</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">Filter used PINs.</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Academic Session</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinSessionFilter || sessions[0]} onChange={(e) => setPinSessionFilter(e.target.value)}>
                        {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Term</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinTermFilter || TERMS[0]} onChange={(e) => setPinTermFilter(e.target.value)}>
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Class</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinClassFilter || CLASSES[0]} onChange={(e) => setPinClassFilter(e.target.value)}>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    
                    <Button variant="brand" className="w-full mt-4" onClick={() => {
                      if (!pinSessionFilter) setPinSessionFilter(sessions[0]);
                      if (!pinTermFilter) setPinTermFilter(TERMS[0]);
                      if (!pinClassFilter) setPinClassFilter(CLASSES[0]);
                      setPinViewShown(true);
                    }}>Continue</Button>
                  </CardContent>
                </Card>
              </div>
            ) : (

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle size={18} className="text-cyan-400" />
                    Check Used & Redeemed PINs ({usedPins.length})
                  </h3>
                  <p className="text-xs text-slate-400">PINs that have been checked or fully exhausted by students</p>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-300 font-bold uppercase border-b border-slate-700">
                    <tr>
                      <th className="p-3">Serial No</th>
                      <th className="p-3">PIN Code</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Usage Count</th>
                      <th className="p-3">Last Checked Timestamp</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {usedPins.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400">No used PINs recorded yet.</td>
                      </tr>
                    ) : (
                      usedPins.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/60">
                          <td className="p-3 font-mono text-cyan-400 font-bold">{p.serialNumber}</td>
                          <td className="p-3 font-mono text-amber-300 font-bold cursor-pointer" onClick={() => toggleRevealPin(p.id)} title="Click to reveal/hide">
                            {revealedPins[p.id] ? p.pinCode : "••••-••••-••••"}
                          </td>
                          <td className="p-3 font-bold text-white">{p.studentName} ({p.studentId})</td>
                          <td className="p-3">{p.class}</td>
                          <td className="p-3 font-mono text-rose-300 font-bold">{p.maxUses - p.usesRemaining} / {p.maxUses} Used</td>
                          <td className="p-3 text-slate-400">{p.lastUsedAt || "Recently Checked"}</td>
                          <td className="p-3 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700 uppercase">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) )}

          {/* ========================================================================= */}
          {/* 4. SUB-FEATURE: CHECK CLASS PINS */}
          {/* ========================================================================= */}
          {activePinTab === "check_class" && (

            !pinViewShown ? (
              <div className="max-w-md mx-auto mt-10">
                <Card className="border-0 shadow-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <CardHeader className="border-b border-slate-800 pb-4 bg-slate-800/50">
                    <CardTitle className="text-white text-lg">Check Class PINs</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">Select class parameters.</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Academic Session</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinSessionFilter || sessions[0]} onChange={(e) => setPinSessionFilter(e.target.value)}>
                        {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Term</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinTermFilter || TERMS[0]} onChange={(e) => setPinTermFilter(e.target.value)}>
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Class</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinClassFilter || CLASSES[0]} onChange={(e) => setPinClassFilter(e.target.value)}>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    
                    <Button variant="brand" className="w-full mt-4" onClick={() => {
                      if (!pinSessionFilter) setPinSessionFilter(sessions[0]);
                      if (!pinTermFilter) setPinTermFilter(TERMS[0]);
                      if (!pinClassFilter) setPinClassFilter(CLASSES[0]);
                      setPinViewShown(true);
                    }}>Continue</Button>
                  </CardContent>
                </Card>
              </div>
            ) : (

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers size={18} className="text-indigo-400" />
                    Check Class PINs & Distribution Metrics
                  </h3>
                  <p className="text-xs text-slate-400">Filter and view assigned result PINs per class grade level</p>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs text-slate-400 font-bold">Select Class:</Label>
                  <select
                    className="h-9 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 text-xs font-semibold"
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Class Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Class Filter Target</span>
                  <h4 className="text-xl font-bold text-white">{selectedClassFilter}</h4>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Total PINs in Class</span>
                  <h4 className="text-xl font-bold text-emerald-400">
                    {pins.filter(p => selectedClassFilter === "All Classes" || p.class === selectedClassFilter).length} PINs
                  </h4>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Active Status Count</span>
                  <h4 className="text-xl font-bold text-amber-300">
                    {pins.filter(p => (selectedClassFilter === "All Classes" || p.class === selectedClassFilter) && p.status === "Active").length} Active
                  </h4>
                </div>
              </div>

              {/* Class PINs Roster */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-300 font-bold uppercase border-b border-slate-700">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Admission No</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Serial No</th>
                      <th className="p-3">PIN Code</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {pins.filter(p => selectedClassFilter === "All Classes" || p.class === selectedClassFilter).map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/60">
                        <td className="p-3 font-bold text-white">{p.studentName}</td>
                        <td className="p-3 font-mono text-slate-400">{p.studentId}</td>
                        <td className="p-3">{p.class}</td>
                        <td className="p-3 font-mono text-emerald-400">{p.serialNumber}</td>
                        <td className="p-3 font-mono text-amber-300 font-bold cursor-pointer" onClick={() => toggleRevealPin(p.id)} title="Click to reveal/hide">
                          {revealedPins[p.id] ? p.pinCode : "••••-••••-••••"}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            p.status === "Active" ? "bg-emerald-950 text-emerald-300" : "bg-rose-950 text-rose-300"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) )}

          {/* ========================================================================= */}
          {/* 5. SUB-FEATURE: GENERATE CLASS PINS */}
          {/* ========================================================================= */}
          {activePinTab === "generate_class" && (

            !pinViewShown ? (
              <div className="max-w-md mx-auto mt-10">
                <Card className="border-0 shadow-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <CardHeader className="border-b border-slate-800 pb-4 bg-slate-800/50">
                    <CardTitle className="text-white text-lg">Generate Class PINs</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">Select class to generate for.</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Academic Session</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinSessionFilter || sessions[0]} onChange={(e) => setPinSessionFilter(e.target.value)}>
                        {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Term</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinTermFilter || TERMS[0]} onChange={(e) => setPinTermFilter(e.target.value)}>
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Class</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinClassFilter || CLASSES[0]} onChange={(e) => setPinClassFilter(e.target.value)}>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    
                    <Button variant="brand" className="w-full mt-4" onClick={() => {
                      if (!pinSessionFilter) setPinSessionFilter(sessions[0]);
                      if (!pinTermFilter) setPinTermFilter(TERMS[0]);
                      if (!pinClassFilter) setPinClassFilter(CLASSES[0]);
                      setPinViewShown(true);
                    }}>Continue</Button>
                  </CardContent>
                </Card>
              </div>
            ) : (

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border border-slate-800 bg-slate-900/90 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Generate Class PINs (Batch Operation)</h3>
                    <p className="text-xs text-slate-400">Batch create result checking PINs for every registered student in a class</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300">Select Target Class</Label>
                    <select
                      className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 text-sm font-semibold"
                      value={batchClass}
                      onChange={(e) => setBatchClass(e.target.value)}
                    >
                      {CLASSES.filter(c => c !== "All Classes").map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300">Academic Year</Label>
                    <select
                      className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 text-sm font-semibold"
                      value={batchSessionYear}
                      onChange={(e) => setBatchSessionYear(e.target.value)}
                    >
                      {SESSIONS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300">Term</Label>
                    <select
                      className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 text-sm font-semibold"
                      value={batchSessionTerm}
                      onChange={(e) => setBatchSessionTerm(e.target.value)}
                    >
                      {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <Button 
                    type="button" 
                    variant="brand" 
                    className="w-full h-11 text-sm font-bold gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950"
                    onClick={() => handleGenerateClassPins(batchClass, `${batchSessionYear} - ${batchSessionTerm}`)}
                  >
                    <Zap size={18} /> Generate All Class PINs for {batchClass}
                  </Button>
                </div>
              </div>
            </div>
          ) )}

          {/* ========================================================================= */}
          {/* 6. SUB-FEATURE: ACTIVATE CLASS PINS */}
          {/* ========================================================================= */}
          {activePinTab === "activate_class" && (

            !pinViewShown ? (
              <div className="max-w-md mx-auto mt-10">
                <Card className="border-0 shadow-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <CardHeader className="border-b border-slate-800 pb-4 bg-slate-800/50">
                    <CardTitle className="text-white text-lg">Activate Class PINs</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">Select class to activate.</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Academic Session</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinSessionFilter || sessions[0]} onChange={(e) => setPinSessionFilter(e.target.value)}>
                        {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Term</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinTermFilter || TERMS[0]} onChange={(e) => setPinTermFilter(e.target.value)}>
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Class</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinClassFilter || CLASSES[0]} onChange={(e) => setPinClassFilter(e.target.value)}>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    
                    <Button variant="brand" className="w-full mt-4" onClick={() => {
                      if (!pinSessionFilter) setPinSessionFilter(sessions[0]);
                      if (!pinTermFilter) setPinTermFilter(TERMS[0]);
                      if (!pinClassFilter) setPinClassFilter(CLASSES[0]);
                      setPinViewShown(true);
                    }}>Continue</Button>
                  </CardContent>
                </Card>
              </div>
            ) : (

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border border-slate-800 bg-slate-900/90 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <Unlock size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Activate Class PINs</h3>
                    <p className="text-xs text-slate-400">Bulk enable and activate result checking permissions for a whole class</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300">Select Class to Activate</Label>
                    <select
                      className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 text-sm font-semibold"
                      value={batchClass}
                      onChange={(e) => setBatchClass(e.target.value)}
                    >
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <Button 
                    type="button" 
                    variant="brand" 
                    className="w-full h-11 text-sm font-bold gap-2 bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => handleActivateClassPins(batchClass)}
                  >
                    <Unlock size={18} /> Bulk Activate All Inactive PINs for {batchClass}
                  </Button>
                </div>
              </div>
            </div>
          ) )}

          {/* ========================================================================= */}
          {/* 7. SUB-FEATURE: ACTIVATE SINGLE STUDENT'S PIN */}
          {/* ========================================================================= */}
          {activePinTab === "activate_single" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border border-slate-800 bg-slate-900/90 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Activate Single Student's PIN</h3>
                    <p className="text-xs text-slate-400">Find any student or PIN serial to toggle individual activation status</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300">Search Student ID, Name or Serial Number</Label>
                    <Input
                      placeholder="e.g. ESS/2026/003 or Chioma"
                      value={searchActivationTerm}
                      onChange={(e) => setSearchActivationTerm(e.target.value)}
                      className="bg-slate-950 border-slate-700 text-white font-semibold"
                    />
                  </div>

                  {singleActivationTarget && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-bold text-white">{singleActivationTarget.studentName}</h4>
                          <p className="text-xs text-slate-400">ID: {singleActivationTarget.studentId} &middot; Class: {singleActivationTarget.class}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-xs font-extrabold ${
                          singleActivationTarget.status === "Active" ? "bg-emerald-950 text-emerald-300 border border-emerald-700" : "bg-rose-950 text-rose-300 border border-rose-700"
                        }`}>
                          {singleActivationTarget.status}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-lg text-xs space-y-1 font-mono text-slate-300">
                        <p>Serial Number: <strong className="text-emerald-400">{singleActivationTarget.serialNumber}</strong></p>
                        <p className="cursor-pointer select-none" onClick={() => toggleRevealPin(singleActivationTarget.id)} title="Click to reveal/hide">
                          PIN Code: <strong className="text-amber-300">
                            {revealedPins[singleActivationTarget.id] ? singleActivationTarget.pinCode : "••••-••••-••••"}
                          </strong>
                        </p>
                      </div>

                      <Button
                        onClick={() => handleToggleSinglePinStatus(singleActivationTarget.id)}
                        className={`w-full text-xs font-bold gap-2 ${
                          singleActivationTarget.status === "Active" ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
                        }`}
                      >
                        {singleActivationTarget.status === "Active" ? <Lock size={16} /> : <Unlock size={16} />}
                        {singleActivationTarget.status === "Active" ? "Deactivate Student PIN" : "Activate Student PIN"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. SUB-FEATURE: DOWNLOAD CLASS PINS */}
          {/* ========================================================================= */}
          {activePinTab === "download_class" && (

            !pinViewShown ? (
              <div className="max-w-md mx-auto mt-10">
                <Card className="border-0 shadow-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <CardHeader className="border-b border-slate-800 pb-4 bg-slate-800/50">
                    <CardTitle className="text-white text-lg">Download Class PINs</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">Select class PINs to download.</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Academic Session</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinSessionFilter || sessions[0]} onChange={(e) => setPinSessionFilter(e.target.value)}>
                        {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Term</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinTermFilter || TERMS[0]} onChange={(e) => setPinTermFilter(e.target.value)}>
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Class</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinClassFilter || CLASSES[0]} onChange={(e) => setPinClassFilter(e.target.value)}>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    
                    <Button variant="brand" className="w-full mt-4" onClick={() => {
                      if (!pinSessionFilter) setPinSessionFilter(sessions[0]);
                      if (!pinTermFilter) setPinTermFilter(TERMS[0]);
                      if (!pinClassFilter) setPinClassFilter(CLASSES[0]);
                      setPinViewShown(true);
                    }}>Continue</Button>
                  </CardContent>
                </Card>
              </div>
            ) : (

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border border-slate-800 bg-slate-900/90 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                    <Download size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Download Class PINs</h3>
                    <p className="text-xs text-slate-400">Export Class Result Access PIN roster as a CSV spreadsheet</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300">Select Class to Export</Label>
                    <select
                      className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 text-sm font-semibold"
                      value={batchClass}
                      onChange={(e) => setBatchClass(e.target.value)}
                    >
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <Button 
                    type="button" 
                    variant="brand" 
                    className="w-full h-11 text-sm font-bold gap-2 bg-purple-600 hover:bg-purple-500"
                    onClick={() => handleDownloadClassPinsCsv(batchClass)}
                  >
                    <Download size={18} /> Download Class PINs CSV ({batchClass})
                  </Button>
                </div>
              </div>
            </div>
          ) )}

          {/* ========================================================================= */}
          {/* 9. SUB-FEATURE: GETCLASS PIN SLIPS */}
          {/* ========================================================================= */}
          {activePinTab === "get_class_slips" && (

            !pinViewShown ? (
              <div className="max-w-md mx-auto mt-10">
                <Card className="border-0 shadow-2xl overflow-hidden bg-slate-900 border border-slate-800">
                  <CardHeader className="border-b border-slate-800 pb-4 bg-slate-800/50">
                    <CardTitle className="text-white text-lg">Get Class PIN Slips</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">Select class to generate slips.</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Academic Session</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinSessionFilter || sessions[0]} onChange={(e) => setPinSessionFilter(e.target.value)}>
                        {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Term</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinTermFilter || TERMS[0]} onChange={(e) => setPinTermFilter(e.target.value)}>
                        {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-slate-300 text-xs font-bold uppercase mb-1.5 block">Class</Label>
                      <select className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 text-white px-3 focus:outline-none focus:ring-1 focus:ring-brand-500" value={pinClassFilter || CLASSES[0]} onChange={(e) => setPinClassFilter(e.target.value)}>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    
                    <Button variant="brand" className="w-full mt-4" onClick={() => {
                      if (!pinSessionFilter) setPinSessionFilter(sessions[0]);
                      if (!pinTermFilter) setPinTermFilter(TERMS[0]);
                      if (!pinClassFilter) setPinClassFilter(CLASSES[0]);
                      setPinViewShown(true);
                    }}>Continue</Button>
                  </CardContent>
                </Card>
              </div>
            ) : (

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Printer size={18} className="text-rose-400" />
                    GetClass PIN Slips & Scratch Cards
                  </h3>
                  <p className="text-xs text-slate-400">Printable PIN slips for students and guardians in selected class</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    className="h-9 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 text-xs font-semibold"
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <Button variant="outline" className="bg-slate-800 border-slate-700 text-white text-xs gap-1.5 font-bold hover:bg-slate-700" onClick={() => {
                    const headers = "Serial Number,PIN Code,Student Name,Admission No,Class,Session\n";
                    const rows = slipsPinsList.map(p => `"${p.serialNumber}","${p.pinCode}","${p.studentName}","${p.studentId}","${p.class}","${p.session}"`).join("\n");
                    const blob = new Blob([headers + rows], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Class_PINs_${selectedClassFilter.replace(/\s+/g,'_')}.csv`;
                    a.click();
                  }}>
                    <Download size={16} /> Download CSV
                  </Button>
                  <Button variant="outline" className="bg-red-600 border-red-700 text-white text-xs gap-1.5 font-bold hover:bg-red-700" onClick={async () => {
                    const input = document.getElementById('slips-print-area');
                    if (!input) return;
                    try {
                      // We temporarily remove some classes that might affect html2canvas rendering incorrectly on mobile view,
                      // but it's fine since we render it as it's shown.
                      const imgData = await toPng(input, { pixelRatio: 2, cacheBust: true });
                      
                      // html-to-image doesn't give us a canvas height directly from the wrapper so we can get it from the input dimensions
                      const inputRect = input.getBoundingClientRect();
                      const canvasWidth = inputRect.width * 2;
                      const canvasHeight = inputRect.height * 2;
                      
                      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                      const pdfWidth = pdf.internal.pageSize.getWidth();
                      let pdfHeight = (canvasHeight * pdfWidth) / canvasWidth;
                      
                      // Handle multi-page if content is too long
                      const pageHeight = pdf.internal.pageSize.getHeight();
                      let heightLeft = pdfHeight;
                      let position = 0;

                      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                      heightLeft -= pageHeight;

                      while (heightLeft >= 0) {
                        position = heightLeft - pdfHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                        heightLeft -= pageHeight;
                      }

                      pdf.save(`Class_PIN_Slips_${selectedClassFilter.replace(/\s+/g,'_')}.pdf`);
                    } catch (error) {
                      console.error("PDF generation failed", error);
                    }
                  }}>
                    <Download size={16} /> Download PDF
                  </Button>
                  <Button variant="outline" className="bg-white text-slate-900 text-xs gap-1.5 font-bold hover:bg-slate-100" onClick={() => window.print()}>
                    <Printer size={16} /> Print Class PIN Slips
                  </Button>
                </div>
              </div>

              
  <style dangerouslySetInnerHTML={{ __html: `
    @media print {
      body * { visibility: hidden; }
      .slips-print-area, .slips-print-area * { visibility: visible; }
      .slips-print-area { position: absolute; left: 0; top: 0; width: 100%; }
      @page { margin: 10mm; }
    }
  `}} />

              {/* Grid of Slips */}
              <div id="slips-print-area" className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-y-[2.5rem] print:gap-x-4 print:w-[100%] print:m-0 slips-print-area p-4 bg-slate-50">
                {slipsPinsList.map((p) => (
                  <div key={p.id} className="bg-white text-slate-900 p-5 rounded-2xl border-2 border-brand-600 shadow-md space-y-3 print:break-inside-avoid print:shadow-none print:h-[220px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="font-extrabold text-brand-900 text-sm uppercase tracking-wide">EMMANUEL SECONDARY SCHOOL</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">OFFICIAL RESULT ACCESS PIN SLIP</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-brand-100 text-brand-800 border border-brand-300">
                        {p.session}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Student Name</span>
                        <p className="font-bold text-slate-900">{p.studentName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Admission No</span>
                        <p className="font-mono font-bold text-brand-700">{p.studentId}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">SERIAL NUMBER</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">{p.serialNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">SCRATCH PIN CODE</span>
                        <span className="font-mono font-black text-amber-300 text-sm tracking-wider">{p.pinCode}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Valid for {p.maxUses} Result Check Operations</span>
                      <span className="font-bold text-emerald-700">Status: {p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) )}

          {/* ========================================================================= */}
          {/* 10. SUB-FEATURE: CHECKED RESULTS VIA PIN USE */}
          {/* ========================================================================= */}
          {activePinTab === "checked_results_log" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet size={18} className="text-blue-400" />
                    Checked Results Via PIN Use (Audit Log)
                  </h3>
                  <p className="text-xs text-slate-400">Real-time log of student report cards accessed via verified PINs</p>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-300 font-bold uppercase border-b border-slate-700">
                    <tr>
                      <th className="p-3">Log ID</th>
                      <th className="p-3">Student Name & ID</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Academic Session</th>
                      <th className="p-3">Serial & PIN Used</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/60">
                        <td className="p-3 font-mono text-slate-400">{log.id}</td>
                        <td className="p-3 font-bold text-white">{log.studentName} ({log.studentId})</td>
                        <td className="p-3">{log.class}</td>
                        <td className="p-3 text-slate-300">{log.session}</td>
                        <td className="p-3 font-mono text-amber-300">
                          {log.serialNumber} &middot; {log.pinCode}
                        </td>
                        <td className="p-3 text-slate-400">{log.timestamp}</td>
                        <td className="p-3 text-right">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-700">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Chart & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="col-span-1 lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle>Academic Performance vs Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAttendance)" />
                  <Area type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPerformance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Admissions & Quick Approval */}
        <Card className="col-span-1 border-0 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck size={18} className="text-brand-600" />
                Admission Approval Center
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">Review & approve newly registered student admissions</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
              {admissionApps.filter(a => a.status === 'Pending').length} Pending
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {admissionApps.map((app) => (
                <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{app.name}</p>
                      <p className="text-xs text-slate-500">{app.class || app.assignedClass} • {app.phone || app.id}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  {app.status === 'Pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button 
                        size="sm" 
                        className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                        onClick={() => handleApproveAdmission(app.id)}
                      >
                        <Check size={14} />
                        Approve Admission & Generate PIN
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {admissionApps.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  No admission applications submitted yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Inquiries & Notices */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare size={18} className="text-amber-600" />
                Recent Student & Parent Inquiries
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">Latest messages received from the public website</p>
            </div>
            <Link to="/dashboard/admissions">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                View All <ArrowRight size={14} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {inquiries.slice(0, 3).map((inquiry) => (
                <div key={inquiry.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inquiry.status === "Unread" ? "bg-amber-100 text-amber-800" :
                        inquiry.status === "Replied" ? "bg-emerald-100 text-emerald-800" :
                        "bg-slate-100 text-slate-800"
                      }`}>
                        {inquiry.status}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(inquiry.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{inquiry.subject}</p>
                    <p className="text-xs text-slate-500 mt-0.5">From: {inquiry.name} ({inquiry.email})</p>
                  </div>
                  <div className="text-sm text-slate-600 max-w-lg truncate">
                    "{inquiry.message}"
                  </div>
                </div>
              ))}
              {inquiries.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  No recent inquiries.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isCreateSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl border-0 animate-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-slate-100 pb-4 relative">
              <button 
                className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                onClick={() => setIsCreateSessionOpen(false)}
              >
                <X size={18} />
              </button>
              <CardTitle className="text-xl">Create Academic Session</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Configure a new session and term for the school system.</p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Input 
                    placeholder="e.g. 2026/2027" 
                    value={newSessionYear}
                    onChange={(e) => setNewSessionYear(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={newSessionTerm}
                    onChange={(e) => setNewSessionTerm(e.target.value)}
                  >
                    <option>First Term</option>
                    <option>Second Term</option>
                    <option>Third Term</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsCreateSessionOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="brand">
                    Create Academic Session
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