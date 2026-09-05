import React, { useState } from "react";
import { useStudents } from "../data/studentsData";
import { useTeachers, Teacher } from "../data/teachersData";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { 
  Search, Plus, Filter, Edit, Trash2, X, Eye, 
  CheckCircle, AlertCircle, Phone, Mail, MapPin, Shield, Key, 
  Briefcase, BookOpen, UserCheck, GraduationCap, Upload, Download, 
  FileSpreadsheet, Sparkles, UserPlus, Printer, Award, FileText, 
  Check, Layers, BarChart3, Calculator, ListOrdered, ArrowRight, RefreshCw, FileCheck,
  ShieldCheck, ShieldAlert, Lock, Unlock, User, UserCog, UserMinus, Hash, KeyRound, Copy
} from "lucide-react";

// Student Record Interface for Enrollment & Results
interface Student {
  id: string;
  name: string;
  class: string;
  gender: string;
  parentNumber: string;
  address: string;
  enrollmentStatus: string;
  status: string;
  fees: string;
}

// Exam Score Record Interface
interface ScoreRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  session: string;
  ca1: number;
  ca2: number;
  ca3: number;
  ca4: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
  position?: string;
}

const initialStudentsList: Student[] = [
  { id: "ESS/2026/001", name: "Oluwaseun Adebayo", class: "SSS 3A", gender: "Male", parentNumber: "+234 803 123 4567", address: "14 High Street, Makurdi", enrollmentStatus: "Active Student", status: "Active", fees: "Paid" },
  { id: "ESS/2026/002", name: "Chioma Nwosu", class: "SSS 3A", gender: "Female", parentNumber: "+234 802 987 6543", address: "8 Commercial Avenue, Makurdi", enrollmentStatus: "Active Student", status: "Active", fees: "Paid" },
  { id: "ESS/2026/003", name: "Abubakar Ibrahim", class: "JSS 1A", gender: "Male", parentNumber: "+234 805 555 1212", address: "22 Airport Road, Makurdi", enrollmentStatus: "Newly Enrolled", status: "Active", fees: "Paid" },
  { id: "ESS/2026/004", name: "Grace Okhiria", class: "SSS 3A", gender: "Female", parentNumber: "+234 807 444 3322", address: "5 Gboko Road, Makurdi", enrollmentStatus: "Active Student", status: "Active", fees: "Partial" },
  { id: "ESS/2026/005", name: "David Emmanuel", class: "SSS 3A", gender: "Male", parentNumber: "+234 809 111 2233", address: "19 Ankpa Quarters, Makurdi", enrollmentStatus: "Active Student", status: "Active", fees: "Paid" },
];

const initialScoresList: ScoreRecord[] = [
  { id: "SCR-101", studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", class: "SSS 3A", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 9, ca2: 8, ca3: 9, ca4: 9, exam: 52, total: 87, grade: "A", remark: "Excellent", position: "1st" },
  { id: "SCR-102", studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", class: "SSS 3A", subject: "English Language", session: "2025/2026 - First Term", ca1: 8, ca2: 7, ca3: 8, ca4: 8, exam: 45, total: 76, grade: "A", remark: "Excellent", position: "1st" },
  { id: "SCR-103", studentId: "ESS/2026/002", studentName: "Chioma Nwosu", class: "SSS 3A", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 7, ca2: 8, ca3: 8, ca4: 7, exam: 42, total: 72, grade: "A", remark: "Excellent", position: "3rd" },
  { id: "SCR-104", studentId: "ESS/2026/002", studentName: "Chioma Nwosu", class: "SSS 3A", subject: "English Language", session: "2025/2026 - First Term", ca1: 6, ca2: 7, ca3: 7, ca4: 7, exam: 38, total: 65, grade: "B", remark: "Very Good", position: "2nd" },
  { id: "SCR-105", studentId: "ESS/2026/004", studentName: "Grace Okhiria", class: "SSS 3A", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 5, ca2: 4, ca3: 6, ca4: 5, exam: 28, total: 48, grade: "D", remark: "Pass", position: "4th" },
  { id: "SCR-106", studentId: "ESS/2026/005", studentName: "David Emmanuel", class: "SSS 3A", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 8, ca2: 9, ca3: 9, ca4: 8, exam: 48, total: 82, grade: "A", remark: "Excellent", position: "2nd" },
];

const DEPARTMENTS = ["All Departments", "Sciences", "Mathematics", "Arts & Humanities", "Commercials", "Vocational & Tech"];
const CLASSES = ["JSS 1A", "JSS 1B", "JSS 1C", "JSS 1D", "JSS 2A", "JSS 2B", "JSS 2C", "JSS 2D", "JSS 3A", "JSS 3B", "JSS 3C", "JSS 3D", "SSS 1A", "SSS 1B", "SSS 1C", "SSS 1D", "SSS 2A", "SSS 2B", "SSS 2C", "SSS 2D", "SSS 3A", "SSS 3B", "SSS 3C", "SSS 3D"];
const SUBJECTS = ["Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Economics", "Further Mathematics", "Computer Studies"];

const calculateGrade = (total: number): { grade: string; remark: string } => {
  if (total >= 70) return { grade: "A", remark: "Excellent" };
  if (total >= 60) return { grade: "B", remark: "Very Good" };
  if (total >= 50) return { grade: "C", remark: "Credit" };
  if (total >= 45) return { grade: "D", remark: "Pass" };
  if (total >= 40) return { grade: "E", remark: "Fair" };
  return { grade: "F", remark: "Fail" };
};

export default function Teachers() {
  // Main view switcher: "dashboard" or "directory"
  const [activeMainTab, setActiveMainTab] = useState<"dashboard" | "directory">("dashboard");

  // Selected Logged-in Staff perspective
  const [teachers, setTeachers] = useTeachers();
  const [activeStaffId, setActiveStaffId] = useState<string>("TCH/2026/001");
  const currentStaff = teachers.find(t => t.id === activeStaffId) || teachers[0];

  // Students roster & Scores state
  const [students, setStudents] = useStudents();
  const [scores, setScores] = useState<ScoreRecord[]>(initialScoresList);

  // General Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [filterStatus, setFilterStatus] = useState("All");
  const [notificationMsg, setNotificationMsg] = useState("");

  // Modals for Staff Dashboard & Exam/Enrollment Workflows
  const [activeModal, setActiveModal] = useState<
    | "upload_exam" 
    | "enroll_student" 
    | "create_staff" 
    | "registered_staff" 
    | "reset_password" 
    | "admin_management" 
    | "my_profile" 
    | "change_staff_number" 
    | null
  >(null);

  // Modal 1: Upload Exam State
  const [uploadMode, setUploadMode] = useState<"batch" | "csv">("batch");
  const [examClass, setExamClass] = useState("SSS 3A");
  const [examSubject, setExamSubject] = useState("Mathematics");
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Modal 2: Enroll Student State
  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    class: "SSS 1A",
    gender: "Male",
    parentNumber: "",
    address: "",
    enrollmentStatus: "Newly Enrolled"
  });

  // Specific Modal Target Holders for Staff Management
  const [selectedTeacherForReset, setSelectedTeacherForReset] = useState<Teacher | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [selectedTeacherForIdChange, setSelectedTeacherForIdChange] = useState<Teacher | null>(null);
  const [selectedTeacherForStatusChange, setSelectedTeacherForStatusChange] = useState<Teacher | null>(null);
  const [newStatusInput, setNewStatusInput] = useState<any>("Active");
  const [selectedTeacherForRoleChange, setSelectedTeacherForRoleChange] = useState<Teacher | null>(null);
  const [newRoleInput, setNewRoleInput] = useState<string>("Teacher");
  const [newStaffNumberInput, setNewStaffNumberInput] = useState("");

  // Create Staff Form State
  const [createStaffForm, setCreateStaffForm] = useState<{
    name: string;
    department: string;
    role: string;
    status: 'Active' | 'On Leave' | 'Inactive';
    email: string;
    phone: string;
    address: string;
    subjects: string[];
    assignedClasses: string[];
    password: string;
    isAdmin: boolean;
    customId: string;
    passportUrl?: string;
  }>({
    name: "",
    department: "Sciences",
    role: "Subject Teacher",
    status: "Active",
    email: "",
    phone: "",
    address: "",
    subjects: ["Mathematics"],
    assignedClasses: ["SSS 1A"],
    password: "pass" + Math.floor(1000 + Math.random() * 9000),
    isAdmin: false,
    customId: ""
  });

  // Handler: Create Staff
  const handleCreateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createStaffForm.name.trim()) return;

    const assignedId = createStaffForm.customId.trim() || `TCH/2026/${String(teachers.length + 1).padStart(3, '0')}`;
    const newStaffMember: Teacher = {
      id: assignedId,
      name: createStaffForm.name.trim(),
      department: createStaffForm.department,
      role: createStaffForm.role,
      status: createStaffForm.status,
      email: createStaffForm.email.trim() || `${createStaffForm.name.toLowerCase().replace(/\s+/g, '.')}@staff.ess.edu.ng`,
      phone: createStaffForm.phone || "+234 800 000 0000",
      address: createStaffForm.address || "Executive Staff Quarters",
      subjects: createStaffForm.subjects,
      assignedClasses: createStaffForm.assignedClasses,
      password: createStaffForm.password || "teacher123",
      systemRoles: createStaffForm.isAdmin ? ["Teacher", "Admin"] : ["Teacher"],
      passportUrl: createStaffForm.passportUrl
    };

    setTeachers([newStaffMember, ...teachers]);
    setActiveModal(null);
    setCreateStaffForm({
      name: "",
      department: "Sciences",
      role: "Subject Teacher",
      status: "Active",
      email: "",
      phone: "",
      address: "",
      subjects: ["Mathematics"],
      assignedClasses: ["SSS 1A"],
      password: "pass" + Math.floor(1000 + Math.random() * 9000),
      isAdmin: false,
      customId: "",
      passportUrl: undefined
    });

    setNotificationMsg(`Success: Created Staff Profile for ${newStaffMember.name} (${newStaffMember.id})!`);
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  // Handler: Reset Password
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForReset || !newPasswordInput.trim()) return;

    setTeachers(prev => prev.map(t => {
      if (t.id === selectedTeacherForReset.id) {
        return { ...t, password: newPasswordInput.trim() };
      }
      return t;
    }));

    setNotificationMsg(`Password successfully reset for ${selectedTeacherForReset.name} (${selectedTeacherForReset.id}) to "${newPasswordInput}"`);
    setActiveModal(null);
    setSelectedTeacherForReset(null);
    setNewPasswordInput("");
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  
  const logAudit = (action: string, staffName: string, previousRoles: string[], newRoles: string[]) => {
    const log = {
      timestamp: new Date().toISOString(),
      administrator: localStorage.getItem('impersonatingName') || 'System Administrator',
      action,
      targetStaff: staffName,
      previousRoles,
      newRoles
    };
    console.log("[AUDIT LOG]", log);
    // In a real app, send this to the backend
  };

  // Handler: Assign System Role (Update Roles Array)
  const handleAssignRole = (teacherId: string, newRole: string) => {
    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId) {
        setNotificationMsg(`Added ${newRole} role to ${t.name}.`);
        const roles = t.systemRoles || ['Teacher'];
        if (!roles.includes(newRole as any)) {
          const newRoles = [...roles, newRole as any];
          logAudit('ADD_ROLE', t.name, roles, newRoles);
          return { ...t, systemRoles: newRoles };
        }
        return t;
      }
      return t;
    }));
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  const handleRemoveRole = (teacherId: string, roleToRemove: string) => {
    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId) {
        setNotificationMsg(`Removed ${roleToRemove} role from ${t.name}.`);
        const roles = t.systemRoles || ['Teacher'];
        const newRoles = roles.filter(r => r !== roleToRemove);
        logAudit('REMOVE_ROLE', t.name, roles, newRoles);
        return { ...t, systemRoles: newRoles };
      }
      return t;
    }));
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  const handleImpersonateTeacher = (teacher: Teacher) => {
    localStorage.setItem('originalAdminUserId', localStorage.getItem('loggedInUserId') || '');
    localStorage.setItem('originalAdminRoles', localStorage.getItem('userRoles') || '');
    localStorage.setItem('originalAdminRole', localStorage.getItem('userRole') || '');

    localStorage.setItem('loggedInUserId', teacher.id);
    const roles = teacher.systemRoles || ['Teacher'];
    localStorage.setItem('userRoles', JSON.stringify(roles));
    localStorage.setItem('userRole', roles[0] || 'Teacher');

    localStorage.setItem('impersonatingName', teacher.name);
    localStorage.setItem('impersonatingType', 'teacher');
    
    // Determine best initial route
    if (roles.includes('General Admin') || roles.includes('Admin') || roles.includes('Super Admin')) window.location.href = '/dashboard';
    else if (roles.includes('Admission Officer')) window.location.href = '/dashboard/admissions';
    else if (roles.includes('Portal Admin')) window.location.href = '/dashboard/portal-manager';
    else if (roles.includes('HR/Staff Admin')) window.location.href = '/dashboard/teachers';
    else if (roles.includes('Examination Admin')) window.location.href = '/dashboard/examinations';
    else if (roles.includes('Finance/Admin Officer')) window.location.href = '/dashboard/finance';
    else if (roles.includes('Academic Admin')) window.location.href = '/dashboard/academics';
    else window.location.href = '/dashboard/students'; // default to teacher
  };

  const handleChangeStatus = (teacherId: string, newStatus: any) => {
    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId) {
        setNotificationMsg(`Status changed to ${newStatus} for ${t.name}.`);
        return { ...t, status: newStatus };
      }
      return t;
    }));
    setTimeout(() => setNotificationMsg(""), 4000);
  };


  // Handler: Change Staff Number
  const handleChangeStaffNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForIdChange || !newStaffNumberInput.trim()) return;

    const oldId = selectedTeacherForIdChange.id;
    const newId = newStaffNumberInput.trim();

    // Check if new ID is already taken by another teacher
    if (teachers.some(t => t.id === newId && t.id !== oldId)) {
      alert(`Staff Number ${newId} is already assigned to another staff member!`);
      return;
    }

    setTeachers(prev => prev.map(t => {
      if (t.id === oldId) {
        return { ...t, id: newId };
      }
      return t;
    }));

    if (activeStaffId === oldId) {
      setActiveStaffId(newId);
    }

    setNotificationMsg(`Staff Number updated for ${selectedTeacherForIdChange.name}: From ${oldId} to ${newId}`);
    setActiveModal(null);
    setSelectedTeacherForIdChange(null);
    setNewStaffNumberInput("");
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  // Handler: Add New Student (Enrollment)
  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name.trim()) return;

    const newId = `ESS/2026/${String(students.length + 1).padStart(3, '0')}`;
    const enrolled: Student = {
      id: newId,
      name: newStudentForm.name.trim(),
      class: newStudentForm.class,
      gender: newStudentForm.gender,
      parentNumber: newStudentForm.parentNumber,
      address: newStudentForm.address,
      enrollmentStatus: newStudentForm.enrollmentStatus,
      status: "Active",
      fees: "Paid"
    };

    setStudents([enrolled, ...students]);
    setActiveModal(null);
    setNewStudentForm({
      name: "",
      class: "SSS 1A",
      gender: "Male",
      parentNumber: "",
      address: "",
      enrollmentStatus: "Newly Enrolled"
    });

    setNotificationMsg(`Success: ${enrolled.name} successfully enrolled in ${enrolled.class} with Admission No. ${enrolled.id}`);
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  // Handler: Save Exam Scores
  const handleInlineScoreChange = (scoreId: string, field: 'ca1' | 'ca2' | 'ca3' | 'ca4' | 'exam', val: number) => {
    setScores(prev => prev.map(s => {
      if (s.id === scoreId) {
        const value = Math.max(0, val);
        const ca1 = field === 'ca1' ? Math.min(10, value) : s.ca1;
        const ca2 = field === 'ca2' ? Math.min(10, value) : s.ca2;
        const ca3 = field === 'ca3' ? Math.min(10, value) : s.ca3;
        const ca4 = field === 'ca4' ? Math.min(10, value) : s.ca4;
        const exam = field === 'exam' ? Math.min(60, value) : s.exam;
        const total = ca1 + ca2 + ca3 + ca4 + exam;
        const { grade, remark } = calculateGrade(total);

        return { ...s, ca1, ca2, ca3, ca4, exam, total, grade, remark };
      }
      return s;
    }));
  };

  // Handler: CSV Mock Upload
  const handleCsvUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    setActiveModal(null);
    setCsvFile(null);
    setNotificationMsg(`CSV Exam score file successfully imported and updated for ${examSubject} (${examClass})!`);
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  // Staff directory logic
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDepartment === "All Departments" || t.department === selectedDepartment;
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-600/30 text-brand-300 rounded-xl border border-brand-500/30">
              <Briefcase size={20} />
            </span>
            <h2 className="text-2xl font-bold font-heading text-white">Staff Management & Teacher Portal</h2>
          </div>
          <p className="text-slate-300 text-sm mt-1">
            Comprehensive Staff Workspace: Create staff, view registered staff, reset passwords, manage admin status, check profile, and change staff numbers.
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveMainTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeMainTab === "dashboard"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            <Sparkles size={16} /> Activated Staff Dashboard
          </button>

          <button
            onClick={() => setActiveMainTab("directory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeMainTab === "directory"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            <UserCheck size={16} /> Registered Staff Directory ({teachers.length})
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg("")} className="text-emerald-600 hover:text-emerald-800">
            <X size={18} />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* EXPLICIT USER REQUESTED STAFF COMMAND BAR */}
      {/* ======================================================== */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCog size={18} className="text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Staff Control Toolbar</span>
            </div>
            <span className="text-[11px] text-slate-300 font-medium">Quick access to all 6 requested staff management actions</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
            {/* 1. Create Staff */}
            <Button
              variant="outline"
              className="bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-brand-600 hover:text-white justify-start gap-1.5 h-11 px-3"
              onClick={() => setActiveModal("create_staff")}
            >
              <UserPlus size={15} className="text-emerald-400 shrink-0" />
              <span className="truncate font-semibold">Create Staff</span>
            </Button>

            {/* 2. Registered Staff */}
            <Button
              variant="outline"
              className="bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-brand-600 hover:text-white justify-start gap-1.5 h-11 px-3"
              onClick={() => setActiveModal("registered_staff")}
            >
              <UserCheck size={15} className="text-cyan-400 shrink-0" />
              <span className="truncate font-semibold">Registered Staff</span>
            </Button>

            {/* 3. Reset A Staff's Password */}
            <Button
              variant="outline"
              className="bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-amber-600 hover:text-white justify-start gap-1.5 h-11 px-3"
              onClick={() => {
                setSelectedTeacherForReset(teachers[0]);
                setNewPasswordInput("staff" + Math.floor(1000 + Math.random() * 9000));
                setActiveModal("reset_password");
              }}
            >
              <KeyRound size={15} className="text-amber-400 shrink-0" />
              <span className="truncate font-semibold">Reset Password</span>
            </Button>

            {/* 4. Make/Remove Admin Staff */}
            <Button
              variant="outline"
              className="bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-indigo-600 hover:text-white justify-start gap-1.5 h-11 px-3"
              onClick={() => setActiveModal("admin_management")}
            >
              <ShieldCheck size={15} className="text-purple-400 shrink-0" />
              <span className="truncate font-semibold">Make/Remove Admin</span>
            </Button>

            {/* 5. My Profile */}
            <Button
              variant="outline"
              className="bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-brand-600 hover:text-white justify-start gap-1.5 h-11 px-3"
              onClick={() => setActiveModal("my_profile")}
            >
              <User size={15} className="text-brand-400 shrink-0" />
              <span className="truncate font-semibold">My Profile</span>
            </Button>

            {/* 6. Change Staff Numb */}
            <Button
              variant="outline"
              className="bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-teal-600 hover:text-white justify-start gap-1.5 h-11 px-3"
              onClick={() => {
                setSelectedTeacherForIdChange(currentStaff);
                setNewStaffNumberInput(currentStaff.id);
                setActiveModal("change_staff_number");
              }}
            >
              <Hash size={15} className="text-teal-400 shrink-0" />
              <span className="truncate font-semibold">Change Staff Numb</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* MAIN TAB 1: ACTIVATED STAFF DASHBOARD */}
      {/* ======================================================== */}
      {activeMainTab === "dashboard" && (
        <div className="space-y-6">
          {/* Logged in Staff Switcher Bar */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-800 font-black text-sm flex items-center justify-center border-2 border-brand-300">
                  {currentStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{currentStaff.name}</h3>
                    {currentStaff.systemRoles?.some(r => r !== "Teacher") && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <ShieldCheck size={12} /> Admin Staff
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      currentStaff.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : currentStaff.status === 'On Leave'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : currentStaff.status === 'Suspended'
                        ? 'bg-orange-100 text-orange-800 border-orange-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}>
                      {currentStaff.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {currentStaff.role} &middot; <span className="font-mono text-brand-600 font-bold">{currentStaff.id}</span>
                  </p>
                </div>
              </div>

              {/* Staff Quick Action Buttons for Active Logged In Staff */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 text-xs bg-brand-50 text-brand-800 border-brand-200"
                  onClick={() => handleImpersonateTeacher(currentStaff)}
                  title="View Dashboard as this Staff"
                >
                  <Eye size={14} /> View Dashboard
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 text-xs bg-slate-50"
                  onClick={() => setActiveModal("my_profile")}
                >
                  <User size={14} /> My Profile
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 text-xs bg-teal-50 text-teal-800 border-teal-200"
                  onClick={() => {
                    setSelectedTeacherForIdChange(currentStaff);
                    setNewStaffNumberInput(currentStaff.id);
                    setActiveModal("change_staff_number");
                  }}
                >
                  <Hash size={14} /> Change Staff Numb
                </Button>

                <div className="flex items-center gap-2">
                  <Label className="text-xs text-slate-500 shrink-0 uppercase font-bold">Switch Active Staff:</Label>
                  <select
                    className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={activeStaffId}
                    onChange={(e) => setActiveStaffId(e.target.value)}
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Assigned Classes</p>
                  <h3 className="text-xl font-bold text-slate-900">{currentStaff.assignedClasses.join(", ")}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BookOpen size={22} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Subjects Taught</p>
                  <h3 className="text-xl font-bold text-slate-900">{currentStaff.subjects.join(", ")}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <UserPlus size={22} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Active Registered Staff</p>
                  <h3 className="text-2xl font-bold text-slate-900">{teachers.length} Members</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Admin Staff Count</p>
                  <h3 className="text-2xl font-bold text-amber-700">
                    {teachers.filter(t => t.systemRoles?.some(r => r !== "Teacher")).length} System Staff
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Academic & Staff Workflows Hub */}
          <Card className="border-0 shadow-sm bg-slate-900 text-white">
            <CardHeader className="py-4 px-6 border-b border-slate-800">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Sparkles size={20} className="text-amber-400" />
                Staff Operations & Workflows
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Action 1: Upload Student Exams */}
                <div 
                  onClick={() => setActiveModal("upload_exam")}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 hover:border-brand-500 hover:bg-slate-800 transition-all cursor-pointer group space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-brand-300 flex items-center gap-2">
                      Upload Student Exams
                      <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Record CA1–CA4 & Exam scores for your classes, or upload batch results via CSV template.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-brand-400 font-medium">
                    <span>Batch or Single Entry</span>
                    <span className="underline">Launch Entry &rarr;</span>
                  </div>
                </div>

                {/* Action 2: Enroll Student */}
                <div 
                  onClick={() => setActiveModal("enroll_student")}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 hover:border-emerald-500 hover:bg-slate-800 transition-all cursor-pointer group space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-emerald-300 flex items-center gap-2">
                      Enroll Student
                      <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Register new student profiles, assign admission numbers, classes, and guardian contact info.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-emerald-400 font-medium">
                    <span>New Roster Entry</span>
                    <span className="underline">Enroll Now &rarr;</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN TAB 2: REGISTERED STAFF DIRECTORY */}
      {/* ======================================================== */}
      {activeMainTab === "directory" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold font-heading text-slate-900">Registered Staff Directory</h3>
              <p className="text-slate-500 text-sm mt-0.5">Manage staff profiles, permissions, passwords, and staff numbers.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="brand" className="gap-2" onClick={() => setActiveModal("create_staff")}>
                <UserPlus size={18} />
                Create Staff Member
              </Button>
            </div>
          </div>

          {/* Search & Filter */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  placeholder="Search by staff name, ID, subject..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <Filter size={18} className="text-slate-400 shrink-0" />
                <select 
                  className="flex h-10 w-full md:w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium shrink-0"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                
                <select 
                  className="flex h-10 w-full md:w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium shrink-0"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Terminated">Terminated</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Retired">Retired</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Staff Directory Table */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Staff Numb & Name</th>
                      <th className="p-4">Department & Role</th>
                      <th className="p-4">Admin Status</th>
                      <th className="p-4">Portal Credentials</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Staff Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm bg-white">
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-xs shrink-0">
                              {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{teacher.name}</p>
                              <p className="text-xs text-brand-600 font-mono font-bold flex items-center gap-1">
                                <Hash size={12} /> {teacher.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-slate-800">{teacher.department}</p>
                          <p className="text-xs text-slate-500">{teacher.role}</p>
                        </td>
                        <td className="p-4 flex flex-wrap gap-1">
                          {teacher.systemRoles?.map(role => (
                            <span key={role} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              role === 'Teacher' 
                                ? 'bg-slate-100 text-slate-600 border-slate-200 font-medium'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              {role !== 'Teacher' && <ShieldCheck size={12} />}
                              {role}
                            </span>
                          ))}
                          {(!teacher.systemRoles || teacher.systemRoles.length === 0) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Teacher
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-xs space-y-0.5">
                            <p className="text-slate-600 font-mono truncate max-w-[180px]">{teacher.email}</p>
                            <p className="text-slate-800 font-mono">Password: <span className="font-bold text-brand-700">{teacher.password}</span></p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            teacher.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : teacher.status === 'On Leave'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : teacher.status === 'Suspended'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {teacher.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* View Dashboard Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1 border-brand-200 text-brand-800 bg-brand-50 hover:bg-brand-100"
                              onClick={() => handleImpersonateTeacher(teacher)}
                              title="View Dashboard as this Staff"
                            >
                              <Eye size={13} /> View Dashboard
                            </Button>

                            {/* Reset Password Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1 border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100"
                              onClick={() => {
                                setSelectedTeacherForReset(teacher);
                                setNewPasswordInput("pass" + Math.floor(1000 + Math.random() * 9000));
                                setActiveModal("reset_password");
                              }}
                              title="Reset Staff Password"
                            >
                              <KeyRound size={13} /> Reset Pass
                            </Button>

                            {/* Make / Remove Admin Toggle */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1 border-indigo-200 text-indigo-800 bg-indigo-50 hover:bg-indigo-100"
                              onClick={() => {
                                setSelectedTeacherForRoleChange(teacher);
                                setNewRoleInput(teacher.systemRoles?.[0] || "Teacher");
                                setActiveModal("assign_role");
                              }}
                              title="Assign Role"
                            >
                              <UserCog size={13} />
                              Assign Role
                            </Button>

                            {/* Change Staff Status */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1 border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100"
                              onClick={() => {
                                setSelectedTeacherForStatusChange(teacher);
                                setNewStatusInput(teacher.status);
                                setActiveModal("change_status");
                              }}
                              title="Change Staff Status"
                            >
                              <UserMinus size={13} /> Status
                            </Button>

                            {/* Change Staff Numb */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1 border-teal-200 text-teal-800 bg-teal-50 hover:bg-teal-100"
                              onClick={() => {
                                setSelectedTeacherForIdChange(teacher);
                                setNewStaffNumberInput(teacher.id);
                                setActiveModal("change_staff_number");
                              }}
                              title="Change Staff Number"
                            >
                              <Hash size={13} /> Staff Numb
                            </Button>
                          </div>
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

      {/* ======================================================== */}
      {/* MODAL: 1. CREATE STAFF */}
      {/* ======================================================== */}
      {activeModal === "create_staff" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserPlus size={20} className="text-brand-400" />
                  Create New Staff Profile
                </CardTitle>
                <p className="text-xs text-slate-300 mt-1">Register new academic or administrative staff member</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleCreateStaffSubmit} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 group">
                    <div className="w-full h-full bg-slate-100 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-400 border-2 border-slate-200">
                      {createStaffForm.passportUrl ? (
                        <img src={createStaffForm.passportUrl} alt="Staff" className="w-full h-full object-cover" />
                      ) : (
                        createStaffForm.name.charAt(0) || <User size={40} />
                      )}
                    </div>
                    <label htmlFor="createStaffPassport" className="absolute bottom-0 right-0 w-8 h-8 bg-white text-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow border border-slate-200 hover:bg-slate-50 transition-colors">
                      <Upload size={14} />
                      <input 
                        id="createStaffPassport" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCreateStaffForm({...createStaffForm, passportUrl: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Full Name</Label>
                    <Input 
                      placeholder="e.g. Dr. Ahmed Aliyu"
                      required
                      value={createStaffForm.name}
                      onChange={(e) => setCreateStaffForm({ ...createStaffForm, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Staff Number / ID (Optional Custom)</Label>
                    <Input 
                      placeholder={`Auto e.g. TCH/2026/${String(teachers.length + 1).padStart(3, '0')}`}
                      value={createStaffForm.customId}
                      onChange={(e) => setCreateStaffForm({ ...createStaffForm, customId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Department</Label>
                    <select
                      className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium"
                      value={createStaffForm.department}
                      onChange={(e) => setCreateStaffForm({ ...createStaffForm, department: e.target.value })}
                    >
                      {DEPARTMENTS.filter(d => d !== "All Departments").map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Role Title</Label>
                    <Input 
                      placeholder="e.g. Subject Teacher / HOD Science"
                      value={createStaffForm.role}
                      onChange={(e) => setCreateStaffForm({ ...createStaffForm, role: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                    <Input 
                      type="email"
                      placeholder="e.g. a.aliyu@staff.ess.edu.ng"
                      value={createStaffForm.email}
                      onChange={(e) => setCreateStaffForm({ ...createStaffForm, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Phone Number</Label>
                    <Input 
                      placeholder="+234 803 000 0000"
                      value={createStaffForm.phone}
                      onChange={(e) => setCreateStaffForm({ ...createStaffForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Portal Password</Label>
                    <Input 
                      type="text"
                      value={createStaffForm.password}
                      onChange={(e) => setCreateStaffForm({ ...createStaffForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-center">
                    <Label className="text-xs font-bold text-slate-700 mb-2">Administrative Privileges</Label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={createStaffForm.isAdmin}
                        onChange={(e) => setCreateStaffForm({ ...createStaffForm, isAdmin: e.target.checked })}
                        className="w-4 h-4 text-brand-600 rounded border-slate-300"
                      />
                      <span>Make this user an Administrative Staff Member</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setActiveModal(null)}>Cancel</Button>
                  <Button type="submit" variant="brand" className="w-full gap-2">
                    <Check size={16} /> Register Staff
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 2. REGISTERED STAFF LIST */}
      {/* ======================================================== */}
      {activeModal === "registered_staff" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-4xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserCheck size={20} className="text-cyan-400" />
                  All Registered Staff Members ({teachers.length})
                </CardTitle>
                <p className="text-xs text-slate-300 mt-1">Complete academic staff roster and credentials directory</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="p-2.5 border-b">Staff Numb & Name</th>
                    <th className="p-2.5 border-b">Department / Role</th>
                    <th className="p-2.5 border-b">Admin Privileges</th>
                    <th className="p-2.5 border-b">Email & Password</th>
                    <th className="p-2.5 border-b text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teachers.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                        <div className="font-mono text-brand-600 font-bold">{t.id}</div>
                      </td>
                      <td className="p-2.5">
                        <div className="font-semibold text-slate-800">{t.department}</div>
                        <div className="text-slate-500">{t.role}</div>
                      </td>
                      <td className="p-2.5">
                        {t.systemRoles?.some(r => r !== "Teacher") ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                            Admin Staff
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono">
                        <div>{t.email}</div>
                        <div className="text-brand-700 font-bold">Pass: {t.password}</div>
                      </td>
                      <td className="p-2.5 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] px-2"
                          onClick={() => {
                            setSelectedTeacherForReset(t);
                            setNewPasswordInput("pass" + Math.floor(1000 + Math.random() * 9000));
                            setActiveModal("reset_password");
                          }}
                        >
                          Reset Pass
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] px-2"
                          onClick={() => {
                            setSelectedTeacherForIdChange(t);
                            setNewStaffNumberInput(t.id);
                            setActiveModal("change_staff_number");
                          }}
                        >
                          Change Numb
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-2 flex justify-end">
                <Button variant="outline" onClick={() => setActiveModal(null)}>Close Roster</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 3. RESET A STAFF'S PASSWORD */}
      {/* ======================================================== */}
      {activeModal === "reset_password" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-amber-950 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <KeyRound size={20} className="text-amber-400" />
                  Reset Staff Portal Password
                </CardTitle>
                <p className="text-xs text-amber-200 mt-1">Assign new login credentials for staff access</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-amber-300 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-sm">
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Select Staff Member</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold"
                    value={selectedTeacherForReset?.id || teachers[0]?.id}
                    onChange={(e) => {
                      const found = teachers.find(t => t.id === e.target.value);
                      if (found) setSelectedTeacherForReset(found);
                    }}
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                    ))}
                  </select>
                </div>

                {selectedTeacherForReset && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p>Current Staff: <strong className="text-slate-900">{selectedTeacherForReset.name}</strong></p>
                    <p>Staff Number: <strong className="font-mono text-brand-600">{selectedTeacherForReset.id}</strong></p>
                    <p>Current Password: <strong className="font-mono text-emerald-700">{selectedTeacherForReset.password}</strong></p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">New Password</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="text"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      required
                      placeholder="Type new password..."
                      className="font-mono"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="shrink-0 text-xs"
                      onClick={() => setNewPasswordInput("pass" + Math.floor(1000 + Math.random() * 9000))}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setActiveModal(null)}>Cancel</Button>
                  <Button type="submit" variant="brand" className="w-full gap-2 bg-amber-600 hover:bg-amber-700">
                    <KeyRound size={16} /> Save New Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 4. MAKE / REMOVE ADMIN STAFF */}
      {/* ======================================================== */}
      {activeModal === "admin_management" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-indigo-950 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShieldCheck size={20} className="text-purple-300" />
                  Make / Remove Admin Staff Permissions
                </CardTitle>
                <p className="text-xs text-purple-200 mt-1">Grant or revoke administrative authority across portal modules</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-purple-200 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="p-2.5 border-b">Staff Member</th>
                    <th className="p-2.5 border-b">Department</th>
                    <th className="p-2.5 border-b">Current Role</th>
                    <th className="p-2.5 border-b text-right">Admin Privilege Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teachers.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                        <div className="font-mono text-brand-600 font-bold">{t.id}</div>
                      </td>
                      <td className="p-2.5 font-medium">{t.department}</td>
                      <td className="p-2.5">
                        {t.systemRoles?.some(r => r !== "Teacher") ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Administrative Staff
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600">
                            Subject Teacher
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-bold gap-1.5 border-indigo-200 text-indigo-800 bg-indigo-50 hover:bg-indigo-100"
                          onClick={() => {
                            setSelectedTeacherForRoleChange(t);
                            setNewRoleInput(t.systemRoles?.[0] || "Teacher");
                            setActiveModal("assign_role");
                          }}
                        >
                          <UserCog size={14} />
                          Assign Role
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-2 flex justify-end">
                <Button variant="outline" onClick={() => setActiveModal(null)}>Done</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 5. MY PROFILE */}
      {/* ======================================================== */}
      {activeModal === "my_profile" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-brand-950 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <User size={20} className="text-brand-300" />
                  My Active Staff Profile Card
                </CardTitle>
                <p className="text-xs text-brand-200 mt-1">Logged in staff credential & subject assignments</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-brand-200 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-5 text-sm">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="w-16 h-16 rounded-full bg-brand-900 text-white font-black text-xl flex items-center justify-center border-2 border-brand-500 shadow-md">
                  {currentStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{currentStaff.name}</h3>
                  <p className="text-xs font-semibold text-slate-500">{currentStaff.role}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-mono text-xs font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      Staff Numb: {currentStaff.id}
                    </span>
                    {currentStaff.systemRoles?.some(r => r !== "Teacher") && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Admin User
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-medium">Department:</span>
                  <p className="font-bold text-slate-800 text-sm">{currentStaff.department}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-medium">Account Status:</span>
                  <p className={`font-bold text-sm ${
                      currentStaff.status === 'Active' 
                        ? 'text-emerald-700' 
                        : currentStaff.status === 'On Leave'
                        ? 'text-amber-700'
                        : currentStaff.status === 'Suspended'
                        ? 'text-orange-700'
                        : 'text-rose-700'
                  }`}>{currentStaff.status}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-medium">Email Address:</span>
                  <p className="font-bold text-slate-800 font-mono">{currentStaff.email}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-medium">Phone Contact:</span>
                  <p className="font-bold text-slate-800 font-mono">{currentStaff.phone}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Assigned Subjects Taught:</Label>
                <div className="flex flex-wrap gap-1.5">
                  {currentStaff.subjects.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-brand-50 text-brand-800 border border-brand-200 rounded-lg text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Assigned Classes Supervised:</Label>
                <div className="flex flex-wrap gap-1.5">
                  {currentStaff.assignedClasses.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="brand" className="w-full" onClick={() => setActiveModal(null)}>Close Profile</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ASSIGN SYSTEM ROLE */}
      {/* ======================================================== */}
      {activeModal === "assign_role" && selectedTeacherForRoleChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm border-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-slate-900 text-white pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UserCog size={18} className="text-amber-400" />
                Assign System Role
              </CardTitle>
              <button onClick={() => { setActiveModal(null); setSelectedTeacherForRoleChange(null); }} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Staff Member</p>
                <p className="font-bold text-slate-900">{selectedTeacherForRoleChange.name}</p>
                <p className="text-xs text-slate-500">{selectedTeacherForRoleChange.id}</p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Assign System Roles</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {[
                    'Teacher', 
                    'General Admin', 
                    'Examination Admin', 
                    'Admission Officer', 
                    'Portal Admin', 
                    'Finance/Admin Officer', 
                    'Academic Admin', 
                    'HR/Staff Admin', 
                    'Library Admin', 
                    'Inventory Admin'
                  ].map(role => {
                    const hasRole = selectedTeacherForRoleChange.systemRoles?.includes(role as any);
                    return (
                      <label key={role} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                          checked={hasRole}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleAssignRole(selectedTeacherForRoleChange.id, role);
                            } else {
                              handleRemoveRole(selectedTeacherForRoleChange.id, role);
                            }
                          }}
                        />
                        <span className="text-sm font-medium text-slate-700">{role}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  Staff can hold multiple roles simultaneously. Check to assign, uncheck to revoke. Changes are saved immediately.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <Button 
                  variant="brand"
                  className="w-full bg-brand-600 hover:bg-brand-700"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedTeacherForRoleChange(null);
                  }}
                >
                  <Check size={16} className="mr-2" />
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CHANGE STAFF STATUS */}
      {/* ======================================================== */}
      {activeModal === "change_status" && selectedTeacherForStatusChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm border-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-rose-950 text-white pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UserMinus size={18} className="text-rose-400" />
                Change Staff Status
              </CardTitle>
              <button onClick={() => { setActiveModal(null); setSelectedTeacherForStatusChange(null); }} className="text-rose-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Staff Member</p>
                <p className="font-bold text-slate-900">{selectedTeacherForStatusChange.name}</p>
                <p className="text-xs text-slate-500">{selectedTeacherForStatusChange.id}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select Employment Status</Label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={newStatusInput}
                  onChange={(e) => setNewStatusInput(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Terminated">Terminated</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Retired">Retired</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <p className="text-xs text-slate-500 pt-1">
                  Changing status to Terminated, Resigned, Retired, Suspended, or Inactive will immediately revoke login access.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => { setActiveModal(null); setSelectedTeacherForStatusChange(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="brand"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={() => {
                    handleChangeStatus(selectedTeacherForStatusChange.id, newStatusInput);
                    setActiveModal(null);
                    setSelectedTeacherForStatusChange(null);
                  }}
                >
                  <Check size={16} className="mr-2" />
                  Save Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 6. CHANGE STAFF NUMB */}
      {/* ======================================================== */}
      {activeModal === "change_staff_number" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-teal-950 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Hash size={20} className="text-teal-300" />
                  Change Staff Number (ID)
                </CardTitle>
                <p className="text-xs text-teal-200 mt-1">Reassign unique institutional Staff ID number</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-teal-200 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-sm">
              <form onSubmit={handleChangeStaffNumberSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Select Staff Member</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold"
                    value={selectedTeacherForIdChange?.id || currentStaff.id}
                    onChange={(e) => {
                      const found = teachers.find(t => t.id === e.target.value);
                      if (found) {
                        setSelectedTeacherForIdChange(found);
                        setNewStaffNumberInput(found.id);
                      }
                    }}
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                    ))}
                  </select>
                </div>

                {selectedTeacherForIdChange && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-1 text-teal-900">
                    <p>Staff Name: <strong>{selectedTeacherForIdChange.name}</strong></p>
                    <p>Current Staff Number: <strong className="font-mono text-teal-800">{selectedTeacherForIdChange.id}</strong></p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">New Staff Number / ID</Label>
                  <Input 
                    type="text"
                    value={newStaffNumberInput}
                    onChange={(e) => setNewStaffNumberInput(e.target.value)}
                    required
                    placeholder="e.g. STAFF/2026/088"
                    className="font-mono font-bold"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setActiveModal(null)}>Cancel</Button>
                  <Button type="submit" variant="brand" className="w-full gap-2 bg-teal-700 hover:bg-teal-800">
                    <Check size={16} /> Update Staff Number
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: UPLOAD STUDENT EXAMS */}
      {/* ======================================================== */}
      {activeModal === "upload_exam" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-3xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload size={20} className="text-brand-400" />
                  Upload Student Exam Marks & Continuous Assessment
                </CardTitle>
                <p className="text-xs text-slate-300 mt-1">Instructor: {currentStaff.name}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-5 text-sm max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setUploadMode("batch")}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    uploadMode === "batch" ? "bg-brand-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Interactive Batch Gradebook Entry
                </button>
                <button
                  onClick={() => setUploadMode("csv")}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    uploadMode === "csv" ? "bg-brand-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Upload CSV / Excel File
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Target Class</Label>
                  <select 
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800"
                    value={examClass}
                    onChange={(e) => setExamClass(e.target.value)}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Subject Assessment</Label>
                  <select 
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800"
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {uploadMode === "batch" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-600 shrink-0" />
                    <span>Enter CA1–CA4 (Max 10 each) and Exam score (Max 60). Totals and Grades calculate automatically.</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 font-bold text-slate-700">
                        <tr>
                          <th className="p-2 text-left">Student Name</th>
                          <th className="p-2 text-center w-14">CA1</th>
                          <th className="p-2 text-center w-14">CA2</th>
                          <th className="p-2 text-center w-14">CA3</th>
                          <th className="p-2 text-center w-14">CA4</th>
                          <th className="p-2 text-center w-16">Exam</th>
                          <th className="p-2 text-center w-16">Total</th>
                          <th className="p-2 text-center w-12">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {scores.slice(0, 5).map((scoreRec) => (
                          <tr key={scoreRec.id}>
                            <td className="p-2 font-semibold text-slate-900">{scoreRec.studentName}</td>
                            <td className="p-2 text-center">
                              <Input 
                                type="number" min={0} max={10} 
                                className="w-12 h-7 text-center mx-auto text-xs" 
                                value={scoreRec.ca1}
                                onChange={(e) => handleInlineScoreChange(scoreRec.id, 'ca1', parseInt(e.target.value) || 0)}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <Input 
                                type="number" min={0} max={10} 
                                className="w-12 h-7 text-center mx-auto text-xs" 
                                value={scoreRec.ca2}
                                onChange={(e) => handleInlineScoreChange(scoreRec.id, 'ca2', parseInt(e.target.value) || 0)}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <Input 
                                type="number" min={0} max={10} 
                                className="w-12 h-7 text-center mx-auto text-xs" 
                                value={scoreRec.ca3}
                                onChange={(e) => handleInlineScoreChange(scoreRec.id, 'ca3', parseInt(e.target.value) || 0)}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <Input 
                                type="number" min={0} max={10} 
                                className="w-12 h-7 text-center mx-auto text-xs" 
                                value={scoreRec.ca4}
                                onChange={(e) => handleInlineScoreChange(scoreRec.id, 'ca4', parseInt(e.target.value) || 0)}
                              />
                            </td>
                            <td className="p-2 text-center">
                              <Input 
                                type="number" min={0} max={60} 
                                className="w-14 h-7 text-center font-bold text-emerald-800 mx-auto text-xs" 
                                value={scoreRec.exam}
                                onChange={(e) => handleInlineScoreChange(scoreRec.id, 'exam', parseInt(e.target.value) || 0)}
                              />
                            </td>
                            <td className="p-2 text-center font-bold text-slate-900">{scoreRec.total}</td>
                            <td className="p-2 text-center font-bold text-emerald-700">{scoreRec.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-3 flex gap-3 border-t border-slate-100">
                    <Button variant="outline" className="w-full" onClick={() => setActiveModal(null)}>Cancel</Button>
                    <Button variant="brand" className="w-full gap-2" onClick={() => {
                      setActiveModal(null);
                      setNotificationMsg(`Successfully recorded & updated examination marks for ${examSubject} (${examClass})!`);
                      setTimeout(() => setNotificationMsg(""), 4000);
                    }}>
                      <Check size={16} /> Commit & Save Exam Scores
                    </Button>
                  </div>
                </div>
              )}

              {uploadMode === "csv" && (
                <form onSubmit={handleCsvUpload} className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3 bg-slate-50 hover:bg-white transition-colors">
                    <FileSpreadsheet size={40} className="mx-auto text-brand-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Drag and drop your Exam CSV File here</p>
                      <p className="text-xs text-slate-500 mt-0.5">Supports .csv, .xlsx formatted score sheets</p>
                    </div>

                    <input 
                      type="file" 
                      accept=".csv, .xlsx"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="hidden" 
                      id="exam-csv-input"
                    />

                    <label 
                      htmlFor="exam-csv-input"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-900 text-white text-xs font-semibold cursor-pointer hover:bg-brand-800"
                    >
                      Browse Files
                    </label>

                    {csvFile && (
                      <p className="text-xs font-mono font-bold text-emerald-700 pt-2">
                        Selected File: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button type="button" variant="outline" className="w-full" onClick={() => setActiveModal(null)}>Cancel</Button>
                    <Button type="submit" variant="brand" className="w-full gap-2" disabled={!csvFile}>
                      <Upload size={16} /> Import Scores from File
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ENROLL STUDENT */}
      {/* ======================================================== */}
      {activeModal === "enroll_student" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-emerald-900 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserPlus size={20} className="text-emerald-300" />
                  Enroll New Student Profile
                </CardTitle>
                <p className="text-xs text-emerald-200 mt-1">Academic Session: 2025/2026 - Executive Secondary School</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-emerald-200 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleEnrollStudent} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Student Full Name</Label>
                  <Input 
                    placeholder="e.g. Chukwuemeka Okojie"
                    required
                    value={newStudentForm.name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Assigned Class</Label>
                    <select 
                      className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium"
                      value={newStudentForm.class}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, class: e.target.value })}
                    >
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Gender</Label>
                    <select 
                      className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium"
                      value={newStudentForm.gender}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Parent / Guardian Contact Phone</Label>
                  <Input 
                    placeholder="+234 803 000 0000"
                    required
                    value={newStudentForm.parentNumber}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parentNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Home Address</Label>
                  <Input 
                    placeholder="Residential address"
                    value={newStudentForm.address}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, address: e.target.value })}
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setActiveModal(null)}>Cancel</Button>
                  <Button type="submit" variant="brand" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <UserPlus size={16} /> Complete Enrollment
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
