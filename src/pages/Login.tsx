import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  BookOpen, 
  User, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Shield, 
  GraduationCap, 
  Users, 
  Sparkles, 
  AlertCircle, 
  Crown, 
  Briefcase, 
  Laptop, 
  UserPlus, 
  CreditCard, 
  Award, 
  QrCode, 
  BookMarked, 
  Zap, 
  Check
} from "lucide-react";
import { usePortalSettings } from "../data/portalSettingsData";
import { useTeachers } from "../data/teachersData";
import { useStudents } from "../data/studentsData";
import { logAuditEvent } from "../data/auditLogData";
import { Button, Card, CardContent, Input, Label } from "@/src/components/ui";

interface QuickAccount {
  id: string;
  roleKey: string;
  roleLabel: string;
  subLabel: string;
  name: string;
  email: string;
  staffId: string;
  defaultPassword: string;
  targetRoute: string;
  category: 'superadmin' | 'general' | 'portal' | 'admission' | 'finance' | 'exam' | 'attendance' | 'academic' | 'library' | 'teacher' | 'student';
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconBg: string;
  icon: any;
  isAdmin: boolean;
  systemRoles: string[];
}

const QUICK_ADMIN_ACCOUNTS: QuickAccount[] = [
  {
    id: "superadmin",
    roleKey: "superadmin",
    roleLabel: "Super Admin",
    subLabel: "Principal & Director",
    name: "Dr. Emmanuel A. Vershima",
    email: "principal@ess.edu.ng",
    staffId: "PRN/2026/001",
    defaultPassword: "principal123",
    targetRoute: "/dashboard",
    category: "superadmin",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-900",
    badgeBorder: "border-amber-300",
    iconBg: "bg-amber-500 text-white",
    icon: Crown,
    isAdmin: true,
    systemRoles: ['Admin', 'Super Admin', 'General Admin', 'Academic Admin'],
  },
  {
    id: "generaladmin",
    roleKey: "generaladmin",
    roleLabel: "General Admin",
    subLabel: "VP Admin & Discipline",
    name: "Mr. Kenneth O. Agbo",
    email: "vp.admin@ess.edu.ng",
    staffId: "VPA/2026/003",
    defaultPassword: "admin123",
    targetRoute: "/dashboard",
    category: "general",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-800",
    badgeBorder: "border-slate-300",
    iconBg: "bg-slate-700 text-white",
    icon: Briefcase,
    isAdmin: true,
    systemRoles: ['Admin', 'General Admin', 'HR/Staff Admin'],
  },
  {
    id: "portaladmin",
    roleKey: "portaladmin",
    roleLabel: "Portal Admin",
    subLabel: "Head of ICT & Portal",
    name: "Mr. Clement U. Oche",
    email: "admin@ess.edu.ng",
    staffId: "ADM/2026/001",
    defaultPassword: "admin123",
    targetRoute: "/dashboard/portal-manager",
    category: "portal",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-900",
    badgeBorder: "border-purple-300",
    iconBg: "bg-purple-600 text-white",
    icon: Laptop,
    isAdmin: true,
    systemRoles: ['Admin', 'Super Admin', 'General Admin', 'Portal Admin', 'HR/Staff Admin'],
  },
  {
    id: "admission",
    roleKey: "admission",
    roleLabel: "Admission Officer",
    subLabel: "Chief Registrar",
    name: "Mrs. Abigail M. Iorliam",
    email: "admission@ess.edu.ng",
    staffId: "ADM/2026/010",
    defaultPassword: "admission123",
    targetRoute: "/dashboard/admissions",
    category: "admission",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-900",
    badgeBorder: "border-rose-300",
    iconBg: "bg-rose-600 text-white",
    icon: UserPlus,
    isAdmin: true,
    systemRoles: ['Admission Officer'],
  },
  {
    id: "finance",
    roleKey: "finance",
    roleLabel: "Finance & Bursar",
    subLabel: "Chief Accounts Officer",
    name: "Mrs. Blessing K. Danladi",
    email: "bursar@ess.edu.ng",
    staffId: "BUR/2026/005",
    defaultPassword: "bursar123",
    targetRoute: "/dashboard/finance",
    category: "finance",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-900",
    badgeBorder: "border-emerald-300",
    iconBg: "bg-emerald-600 text-white",
    icon: CreditCard,
    isAdmin: true,
    systemRoles: ['Finance/Admin Officer', 'Admin'],
  },
  {
    id: "examination",
    roleKey: "examination",
    roleLabel: "Examination Admin",
    subLabel: "CBT & Exams Controller",
    name: "Mr. Babatunde Lawal",
    email: "b.lawal@staff.ess.edu.ng",
    staffId: "TCH/2026/015",
    defaultPassword: "teacher123",
    targetRoute: "/dashboard/examinations",
    category: "exam",
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-900",
    badgeBorder: "border-cyan-300",
    iconBg: "bg-cyan-600 text-white",
    icon: Award,
    isAdmin: true,
    systemRoles: ['Teacher', 'Examination Admin'],
  },
  {
    id: "academic",
    roleKey: "academic",
    roleLabel: "Academic Admin",
    subLabel: "VP Academics & Studies",
    name: "Mrs. Victoria N. Alabi",
    email: "vp.academics@ess.edu.ng",
    staffId: "VPA/2026/002",
    defaultPassword: "admin123",
    targetRoute: "/dashboard/academics",
    category: "academic",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-900",
    badgeBorder: "border-blue-300",
    iconBg: "bg-blue-600 text-white",
    icon: BookOpen,
    isAdmin: true,
    systemRoles: ['Admin', 'Academic Admin', 'Examination Admin'],
  },
  {
    id: "attendance",
    roleKey: "attendance",
    roleLabel: "Attendance Officer",
    subLabel: "Gate & Security Head",
    name: "Mr. Emmanuel Terhemba",
    email: "attendance@ess.edu.ng",
    staffId: "STF/2026/088",
    defaultPassword: "officer123",
    targetRoute: "/dashboard/attendance-officer",
    category: "attendance",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-900",
    badgeBorder: "border-orange-300",
    iconBg: "bg-orange-600 text-white",
    icon: QrCode,
    isAdmin: true,
    systemRoles: ['Attendance Officer'],
  },
  {
    id: "library",
    roleKey: "library",
    roleLabel: "Library Admin",
    subLabel: "Chief E-Librarian",
    name: "Mr. John A. Tyovenda",
    email: "library@ess.edu.ng",
    staffId: "LIB/2026/007",
    defaultPassword: "library123",
    targetRoute: "/dashboard",
    category: "library",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-900",
    badgeBorder: "border-violet-300",
    iconBg: "bg-violet-600 text-white",
    icon: BookMarked,
    isAdmin: true,
    systemRoles: ['Library Admin', 'Teacher'],
  },
];

const QUICK_OTHER_ACCOUNTS: QuickAccount[] = [
  {
    id: "teacher",
    roleKey: "teacher",
    roleLabel: "Subject Teacher",
    subLabel: "Senior English Tutor",
    name: "Mrs. Grace Adeyemi",
    email: "g.adeyemi@staff.ess.edu.ng",
    staffId: "TCH/2026/042",
    defaultPassword: "teacher123",
    targetRoute: "/dashboard/students",
    category: "teacher",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-900",
    badgeBorder: "border-teal-300",
    iconBg: "bg-teal-600 text-white",
    icon: Users,
    isAdmin: false,
    systemRoles: ['Teacher'],
  },
  {
    id: "student",
    roleKey: "student",
    roleLabel: "Student Portal",
    subLabel: "SSS 3A Senior Prefect",
    name: "David Vershima",
    email: "ESS/2026/001",
    staffId: "ESS/2026/001",
    defaultPassword: "password123",
    targetRoute: "/student",
    category: "student",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-900",
    badgeBorder: "border-indigo-300",
    iconBg: "bg-indigo-600 text-white",
    icon: GraduationCap,
    isAdmin: false,
    systemRoles: ['Student'],
  },
];

interface DetectedRoleResult {
  roleLabel: string;
  subLabel?: string;
  userName?: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: any;
  category: string;
  routeHint?: string;
}

export default function Login() {
  const [portalSettings] = usePortalSettings();
  const [teachers] = useTeachers();
  const [students] = useStudents();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'account_deactivated') return "Access Denied: Your account has been deactivated.";
    return "";
  });

  // Active quick card selection state for visual feedback
  const [activeQuickId, setActiveQuickId] = useState<string | null>(null);
  const [quickRoleFilter, setQuickRoleFilter] = useState<'admins' | 'all'>('admins');

  // Forgot Password State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code, 3: New Pass, 4: Success
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setForgotStep(2);
    }, 1500);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setForgotStep(3);
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setForgotStep(4);
    }, 1500);
  };

  const [detectedRole, setDetectedRole] = useState<DetectedRoleResult | null>(null);

  // Helper to determine role from credentials
  const detectRoleFromInput = (inputVal: string): DetectedRoleResult | null => {
    const val = inputVal.trim().toLowerCase();
    if (val.length < 2) return null;

    // 1. Direct match with our registered quick accounts
    const matchedQuick = [...QUICK_ADMIN_ACCOUNTS, ...QUICK_OTHER_ACCOUNTS].find(acc => 
      acc.email.toLowerCase() === val || 
      acc.staffId.toLowerCase() === val ||
      acc.roleKey === val
    );
    if (matchedQuick) {
      return {
        roleLabel: matchedQuick.roleLabel,
        subLabel: matchedQuick.subLabel,
        userName: matchedQuick.name,
        badgeBg: matchedQuick.badgeBg,
        badgeText: matchedQuick.badgeText,
        badgeBorder: matchedQuick.badgeBorder,
        icon: matchedQuick.icon,
        category: matchedQuick.category,
        routeHint: matchedQuick.targetRoute
      };
    }

    // 2. Check if matches any teacher in the full teacher store
    const matchedStaff = teachers.find(t => 
      t.id.toLowerCase() === val || 
      t.email.toLowerCase() === val
    );
    if (matchedStaff) {
      const roles = matchedStaff.systemRoles || ['Teacher'];
      const isSuper = roles.includes('Super Admin');
      const isAdmission = roles.includes('Admission Officer');
      const isFinance = roles.includes('Finance/Admin Officer');
      const isPortal = roles.includes('Portal Admin');
      const isAttendance = roles.includes('Attendance Officer');
      const isExam = roles.includes('Examination Admin');
      const isAcademic = roles.includes('Academic Admin');
      const isGeneral = roles.includes('General Admin') || roles.includes('Admin');
      const isLibrary = roles.includes('Library Admin');

      if (isSuper) {
        return {
          roleLabel: "Super Admin",
          subLabel: matchedStaff.role || "Executive Leadership",
          userName: matchedStaff.name,
          badgeBg: "bg-amber-100",
          badgeText: "text-amber-900",
          badgeBorder: "border-amber-300",
          icon: Crown,
          category: "superadmin",
          routeHint: "/dashboard"
        };
      }
      if (isAdmission) {
        return {
          roleLabel: "Admission Officer",
          subLabel: matchedStaff.role || "Registrar & Admissions Desk",
          userName: matchedStaff.name,
          badgeBg: "bg-rose-100",
          badgeText: "text-rose-900",
          badgeBorder: "border-rose-300",
          icon: UserPlus,
          category: "admission",
          routeHint: "/dashboard/admissions"
        };
      }
      if (isFinance) {
        return {
          roleLabel: "Finance & Bursar",
          subLabel: matchedStaff.role || "Accounts & Bursary",
          userName: matchedStaff.name,
          badgeBg: "bg-emerald-100",
          badgeText: "text-emerald-900",
          badgeBorder: "border-emerald-300",
          icon: CreditCard,
          category: "finance",
          routeHint: "/dashboard/finance"
        };
      }
      if (isAttendance) {
        return {
          roleLabel: "Attendance Officer",
          subLabel: matchedStaff.role || "Gate Clocking & Security",
          userName: matchedStaff.name,
          badgeBg: "bg-orange-100",
          badgeText: "text-orange-900",
          badgeBorder: "border-orange-300",
          icon: QrCode,
          category: "attendance",
          routeHint: "/dashboard/attendance-officer"
        };
      }
      if (isPortal) {
        return {
          roleLabel: "Portal Admin",
          subLabel: matchedStaff.role || "ICT Systems & Settings",
          userName: matchedStaff.name,
          badgeBg: "bg-purple-100",
          badgeText: "text-purple-900",
          badgeBorder: "border-purple-300",
          icon: Laptop,
          category: "portal",
          routeHint: "/dashboard/portal-manager"
        };
      }
      if (isExam) {
        return {
          roleLabel: "Examination Admin",
          subLabel: matchedStaff.role || "Examinations & CBT Office",
          userName: matchedStaff.name,
          badgeBg: "bg-cyan-100",
          badgeText: "text-cyan-900",
          badgeBorder: "border-cyan-300",
          icon: Award,
          category: "exam",
          routeHint: "/dashboard/examinations"
        };
      }
      if (isAcademic) {
        return {
          roleLabel: "Academic Admin",
          subLabel: matchedStaff.role || "Curriculum & Academic Office",
          userName: matchedStaff.name,
          badgeBg: "bg-blue-100",
          badgeText: "text-blue-900",
          badgeBorder: "border-blue-300",
          icon: BookOpen,
          category: "academic",
          routeHint: "/dashboard/academics"
        };
      }
      if (isLibrary) {
        return {
          roleLabel: "Library Admin",
          subLabel: matchedStaff.role || "E-Library & Archives",
          userName: matchedStaff.name,
          badgeBg: "bg-violet-100",
          badgeText: "text-violet-900",
          badgeBorder: "border-violet-300",
          icon: BookMarked,
          category: "library",
          routeHint: "/dashboard"
        };
      }
      if (isGeneral) {
        return {
          roleLabel: "General Admin",
          subLabel: matchedStaff.role || "School Administration",
          userName: matchedStaff.name,
          badgeBg: "bg-slate-100",
          badgeText: "text-slate-800",
          badgeBorder: "border-slate-300",
          icon: Briefcase,
          category: "general",
          routeHint: "/dashboard"
        };
      }
      return {
        roleLabel: "Subject Teacher",
        subLabel: matchedStaff.department ? `${matchedStaff.department} Dept` : "Teaching Faculty",
        userName: matchedStaff.name,
        badgeBg: "bg-teal-100",
        badgeText: "text-teal-900",
        badgeBorder: "border-teal-300",
        icon: Users,
        category: "teacher",
        routeHint: "/dashboard/students"
      };
    }

    // 3. Check students store
    const matchedStudent = students.find(s => 
      s.id.toLowerCase() === val || 
      (s.email && s.email.toLowerCase() === val)
    );
    if (matchedStudent) {
      return {
        roleLabel: "Student Portal",
        subLabel: matchedStudent.class || "Enrolled Student",
        userName: matchedStudent.name,
        badgeBg: "bg-indigo-100",
        badgeText: "text-indigo-900",
        badgeBorder: "border-indigo-300",
        icon: GraduationCap,
        category: "student",
        routeHint: "/student"
      };
    }

    // 4. Heuristics based on keyword patterns in input
    if (val.includes('principal') || val.includes('superadmin') || val.includes('director') || val.startsWith('prn/')) {
      return {
        roleLabel: "Super Admin",
        subLabel: "Principal & Director detected",
        badgeBg: "bg-amber-100",
        badgeText: "text-amber-900",
        badgeBorder: "border-amber-300",
        icon: Crown,
        category: "superadmin",
        routeHint: "/dashboard"
      };
    }
    if (val.includes('admission') || val.includes('registrar') || val.includes('applicant')) {
      return {
        roleLabel: "Admission Officer",
        subLabel: "Admissions Directorate detected",
        badgeBg: "bg-rose-100",
        badgeText: "text-rose-900",
        badgeBorder: "border-rose-300",
        icon: UserPlus,
        category: "admission",
        routeHint: "/dashboard/admissions"
      };
    }
    if (val.includes('bursar') || val.includes('finance') || val.includes('account') || val.startsWith('bur/')) {
      return {
        roleLabel: "Finance & Bursar",
        subLabel: "Finance & Accounts detected",
        badgeBg: "bg-emerald-100",
        badgeText: "text-emerald-900",
        badgeBorder: "border-emerald-300",
        icon: CreditCard,
        category: "finance",
        routeHint: "/dashboard/finance"
      };
    }
    if (val.includes('attendance') || val.includes('gate') || val.includes('security') || val.startsWith('stf/')) {
      return {
        roleLabel: "Attendance Officer",
        subLabel: "Gate Clocking & Attendance detected",
        badgeBg: "bg-orange-100",
        badgeText: "text-orange-900",
        badgeBorder: "border-orange-300",
        icon: QrCode,
        category: "attendance",
        routeHint: "/dashboard/attendance-officer"
      };
    }
    if (val.includes('exam') || val.includes('cbt') || val.includes('test')) {
      return {
        roleLabel: "Examination Admin",
        subLabel: "CBT & Exams Controller detected",
        badgeBg: "bg-cyan-100",
        badgeText: "text-cyan-900",
        badgeBorder: "border-cyan-300",
        icon: Award,
        category: "exam",
        routeHint: "/dashboard/examinations"
      };
    }
    if (val.includes('portal') || val.includes('ict') || val.includes('web') || val.startsWith('adm/')) {
      return {
        roleLabel: "Portal Admin",
        subLabel: "ICT & Systems Administrator detected",
        badgeBg: "bg-purple-100",
        badgeText: "text-purple-900",
        badgeBorder: "border-purple-300",
        icon: Laptop,
        category: "portal",
        routeHint: "/dashboard/portal-manager"
      };
    }
    if (val.includes('academic') || val.includes('curriculum') || val.includes('vpa/')) {
      return {
        roleLabel: "Academic Admin",
        subLabel: "Academic Affairs detected",
        badgeBg: "bg-blue-100",
        badgeText: "text-blue-900",
        badgeBorder: "border-blue-300",
        icon: BookOpen,
        category: "academic",
        routeHint: "/dashboard/academics"
      };
    }
    if (val.includes('library') || val.startsWith('lib/')) {
      return {
        roleLabel: "Library Admin",
        subLabel: "Library Directorate detected",
        badgeBg: "bg-violet-100",
        badgeText: "text-violet-900",
        badgeBorder: "border-violet-300",
        icon: BookMarked,
        category: "library",
        routeHint: "/dashboard"
      };
    }
    if (val.includes('teacher') || val.includes('staff') || val.startsWith('tch/') || val.includes('@staff.') || val.includes('@teacher.')) {
      return {
        roleLabel: "Subject Teacher",
        subLabel: "Staff & Teacher Account detected",
        badgeBg: "bg-teal-100",
        badgeText: "text-teal-900",
        badgeBorder: "border-teal-300",
        icon: Users,
        category: "teacher",
        routeHint: "/dashboard/students"
      };
    }
    if (val.includes('student') || val.startsWith('ess') || /^\d+$/.test(val) || val.includes('@student.')) {
      return {
        roleLabel: "Student Portal",
        subLabel: "Student ID / Portal detected",
        badgeBg: "bg-indigo-100",
        badgeText: "text-indigo-900",
        badgeBorder: "border-indigo-300",
        icon: GraduationCap,
        category: "student",
        routeHint: "/student"
      };
    }
    if (val.includes('admin') || val === 'admin') {
      return {
        roleLabel: "School Administrator",
        subLabel: "Administrative privileges",
        badgeBg: "bg-brand-100",
        badgeText: "text-brand-900",
        badgeBorder: "border-brand-300",
        icon: Shield,
        category: "general",
        routeHint: "/dashboard"
      };
    }

    return null;
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdentifier(value);
    setActiveQuickId(null);
    if (value.trim().length > 1) {
      setDetectedRole(detectRoleFromInput(value));
    } else {
      setDetectedRole(null);
    }
  };

  const executeLogin = (userIdentifier: string, userPass: string, explicitRoute?: string) => {
    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      const searchId = userIdentifier.trim().toLowerCase();
      
      // 1. Check students
      const matchedStudent = students.find(s => 
        s.id.toLowerCase() === searchId || 
        (s.email && s.email.toLowerCase() === searchId)
      );

      if (matchedStudent) {
        if (['Graduated', 'Withdrawn', 'Suspended', 'Inactive'].includes(matchedStudent.status)) {
          setLoading(false);
          setErrorMsg(`Access Denied: Account is marked as ${matchedStudent.status}.`);
          return;
        }

        if (userPass === 'password123' || userPass === matchedStudent.id || userPass.length >= 4) {
          localStorage.setItem('loggedInStudentId', matchedStudent.id);
          localStorage.setItem('userRole', 'student');
          localStorage.setItem('userRoles', JSON.stringify(['Student']));
          setLoading(false);
          navigate(explicitRoute || '/student');
          return;
        } else {
          setLoading(false);
          setErrorMsg("Invalid password for student account. (Default: password123)");
          return;
        }
      }

      // 2. Check teachers & staff (with alias resolution)
      let matchedTeacher = teachers.find(t => 
        t.id.toLowerCase() === searchId || 
        t.email.toLowerCase() === searchId
      );

      if (!matchedTeacher) {
        if (searchId === 'principal' || searchId === 'superadmin' || searchId === 'superadmin@ess.edu.ng') {
          matchedTeacher = teachers.find(t => t.email === 'principal@ess.edu.ng' || t.id === 'PRN/2026/001');
        } else if (searchId === 'admin' || searchId === 'portal' || searchId === 'portaladmin' || searchId === 'portaladmin@ess.edu.ng' || searchId === 'ict@ess.edu.ng') {
          matchedTeacher = teachers.find(t => t.email === 'admin@ess.edu.ng' || t.id === 'ADM/2026/001');
        } else if (searchId === 'admission' || searchId === 'registrar' || searchId === 'admission@ess.edu.ng') {
          matchedTeacher = teachers.find(t => t.email === 'admission@ess.edu.ng' || t.id === 'ADM/2026/010');
        } else if (searchId === 'bursar' || searchId === 'finance' || searchId === 'bursar@ess.edu.ng') {
          matchedTeacher = teachers.find(t => t.email === 'bursar@ess.edu.ng' || t.id === 'BUR/2026/005');
        } else if (searchId === 'attendance' || searchId === 'attendance@ess.edu.ng' || searchId === 'gate') {
          matchedTeacher = teachers.find(t => t.email === 'attendance@ess.edu.ng' || t.id === 'STF/2026/088');
        } else if (searchId === 'exam' || searchId === 'exam@ess.edu.ng' || searchId === 'examinations@ess.edu.ng') {
          matchedTeacher = teachers.find(t => t.id === 'TCH/2026/015' || t.email === 'b.lawal@staff.ess.edu.ng');
        } else if (searchId === 'academic' || searchId === 'academics' || searchId === 'vp.academics@ess.edu.ng') {
          matchedTeacher = teachers.find(t => t.email === 'vp.academics@ess.edu.ng' || t.id === 'VPA/2026/002');
        } else if (searchId === 'vp.admin' || searchId === 'generaladmin' || searchId === 'vp.admin@ess.edu.ng' || searchId === 'hr') {
          matchedTeacher = teachers.find(t => t.email === 'vp.admin@ess.edu.ng' || t.id === 'VPA/2026/003');
        } else if (searchId === 'library' || searchId === 'library@ess.edu.ng') {
          matchedTeacher = teachers.find(t => t.email === 'library@ess.edu.ng' || t.id === 'LIB/2026/007');
        }
      }

      if (matchedTeacher) {
        const validPasswords = [
          matchedTeacher.password,
          'admin123',
          'teacher123',
          'principal123',
          'officer123',
          'bursar123',
          'admission123',
          'library123',
          'portal123'
        ];

        if (validPasswords.includes(userPass)) {
          if (['Resigned', 'Terminated', 'Retired', 'Suspended', 'Inactive'].includes(matchedTeacher.status)) {
            setLoading(false);
            setErrorMsg(`Access Denied: Account is marked as ${matchedTeacher.status}.`);
            return;
          }

          localStorage.setItem('loggedInUserId', matchedTeacher.id);
          const roles = matchedTeacher.systemRoles || ['Teacher'];
          localStorage.setItem('userRoles', JSON.stringify(roles));
          localStorage.setItem('userRole', roles[0] || 'Teacher');
          window.dispatchEvent(new Event('ess_roles_change'));

          logAuditEvent({
            action: `Staff member signed in with roles: [${roles.join(', ')}]`,
            module: 'Staff & Roles',
            recordAffected: `${matchedTeacher.name} (${matchedTeacher.id})`,
            role: roles[0] || 'Teacher',
            userId: matchedTeacher.id,
            userName: matchedTeacher.name,
          });

          setLoading(false);

          if (explicitRoute) {
            navigate(explicitRoute);
            return;
          }

          // Route intelligently to the primary specialty portal
          if (searchId.includes('attendance') || (roles.includes('Attendance Officer') && !roles.includes('Super Admin') && !roles.includes('General Admin'))) {
            navigate('/dashboard/attendance-officer');
          } else if (searchId.includes('admission') || (roles.includes('Admission Officer') && !roles.includes('Super Admin') && !roles.includes('General Admin'))) {
            navigate('/dashboard/admissions');
          } else if (searchId.includes('portal') || (roles.includes('Portal Admin') && !roles.includes('Super Admin') && !roles.includes('General Admin'))) {
            navigate('/dashboard/portal-manager');
          } else if (searchId.includes('bursar') || searchId.includes('finance') || (roles.includes('Finance/Admin Officer') && !roles.includes('Super Admin') && !roles.includes('General Admin'))) {
            navigate('/dashboard/finance');
          } else if (searchId.includes('exam') || (roles.includes('Examination Admin') && !roles.includes('Super Admin') && !roles.includes('General Admin'))) {
            navigate('/dashboard/examinations');
          } else if (searchId.includes('academic') || (roles.includes('Academic Admin') && !roles.includes('Super Admin') && !roles.includes('General Admin'))) {
            navigate('/dashboard/academics');
          } else if (roles.includes('HR/Staff Admin') && !roles.includes('Super Admin') && !roles.includes('General Admin')) {
            navigate('/dashboard/teachers');
          } else if (roles.includes('General Admin') || roles.includes('Admin') || roles.includes('Super Admin')) {
            navigate('/dashboard');
          } else {
            navigate('/dashboard/students'); // default to teacher
          }
          return;
        } else {
          setLoading(false);
          setErrorMsg("Invalid password for staff account.");
          return;
        }
      }

      // Fallback for hardcoded admin if not in DB (for safety)
      if (searchId === 'admin' || searchId === 'admin@ess.edu.ng') {
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userRoles', JSON.stringify(['Admin', 'Super Admin', 'General Admin', 'Portal Admin']));
        setLoading(false);
        navigate(explicitRoute || '/dashboard');
        return;
      }

      setLoading(false);
      setErrorMsg("Account not found. Please check your credentials.");
    }, 600);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(identifier, password);
  };

  // Quick Sign In Selector
  const handleSelectQuickAccount = (acc: QuickAccount) => {
    setIdentifier(acc.email);
    setPassword(acc.defaultPassword);
    setActiveQuickId(acc.id);
    setDetectedRole({
      roleLabel: acc.roleLabel,
      subLabel: acc.subLabel,
      userName: acc.name,
      badgeBg: acc.badgeBg,
      badgeText: acc.badgeText,
      badgeBorder: acc.badgeBorder,
      icon: acc.icon,
      category: acc.category,
      routeHint: acc.targetRoute
    });
    setErrorMsg("");
  };

  // 1-Click Instant Sign-In
  const handleInstantLogin = (acc: QuickAccount) => {
    handleSelectQuickAccount(acc);
    executeLogin(acc.email, acc.defaultPassword, acc.targetRoute);
  };

  const displayedAccounts = quickRoleFilter === 'admins' 
    ? QUICK_ADMIN_ACCOUNTS 
    : [...QUICK_ADMIN_ACCOUNTS, ...QUICK_OTHER_ACCOUNTS];

  return (
    <>
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-sm border-0 shadow-2xl animate-in zoom-in-95">
            <CardContent className="p-6">
              {forgotStep === 1 && (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                      <Lock size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
                    <p className="text-sm text-slate-500">Enter your email or ID to receive a code.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Email or ID</Label>
                    <Input required value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="e.g. johndoe@school.edu.ng" />
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setForgotModalOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={resetLoading}>
                      {resetLoading ? "Sending..." : "Send Code"}
                    </Button>
                  </div>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                      <Shield size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Enter Verification Code</h3>
                    <p className="text-sm text-slate-500">We sent a 6-digit code to your email.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <Input required value={resetCode} onChange={e => setResetCode(e.target.value)} placeholder="123456" className="text-center tracking-widest text-lg font-bold" maxLength={6} />
                    <p className="text-xs text-center text-slate-500 mt-2">Use <span className="font-bold text-slate-700">123456</span> for demo.</p>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setForgotStep(1)}>Back</Button>
                    <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={resetLoading || resetCode.length < 4}>
                      {resetLoading ? "Verifying..." : "Verify Code"}
                    </Button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                      <Lock size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Create New Password</h3>
                    <p className="text-sm text-slate-500">Enter a new secure password.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input required type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="pt-2">
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={resetLoading || newPass.length < 6}>
                      {resetLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </form>
              )}

              {forgotStep === 4 && (
                <div className="text-center space-y-4 py-4">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Password Reset!</h3>
                  <p className="text-sm text-slate-500">Your password has been successfully reset. You can now login.</p>
                  <Button className="w-full mt-4" variant="brand" onClick={() => setForgotModalOpen(false)}>
                    Back to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    <div className="min-h-screen flex items-center justify-center bg-slate-50/80 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="w-16 h-16 bg-brand-900 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-900/20">
            <BookOpen size={32} />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
            Unified Portal Access
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {portalSettings.schoolName} Management System
          </p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/60 bg-white">
          <CardContent className="p-6 sm:p-8">
            <form className="space-y-5" onSubmit={handleLogin}>
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-start gap-2 text-sm font-medium animate-in fade-in">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <Label htmlFor="identifier" className="text-slate-800 font-semibold text-xs sm:text-sm">
                      Staff Email / ID / Username / Admission No
                    </Label>
                    
                    {detectedRole && (
                      <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-sm transition-all animate-in fade-in zoom-in-95 ${detectedRole.badgeBg} ${detectedRole.badgeText} ${detectedRole.badgeBorder}`}>
                        <detectedRole.icon size={13} className="shrink-0 animate-pulse" />
                        <span className="font-bold">{detectedRole.roleLabel}</span>
                        {detectedRole.userName && (
                          <span className="opacity-80 text-[10px] hidden sm:inline">• {detectedRole.userName}</span>
                        )}
                        <span className="text-[10px] bg-white/70 px-1 py-0.2 rounded font-medium ml-0.5 text-slate-700">Auto-Detected</span>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User size={18} />
                    </div>
                    <Input
                      id="identifier"
                      name="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={handleIdentifierChange}
                      className="pl-10 h-11 text-sm bg-slate-50/50 focus:bg-white transition-colors"
                      placeholder="e.g. principal@ess.edu.ng, admission@ess.edu.ng, bursar..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-800 font-semibold text-xs sm:text-sm">Password</Label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setForgotModalOpen(true); 
                        setForgotStep(1); 
                        setResetEmail(''); 
                        setResetCode(''); 
                        setNewPass('');
                      }} 
                      className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setActiveQuickId(null);
                      }}
                      className="pl-10 h-11 text-sm bg-slate-50/50 focus:bg-white transition-colors font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="brand" 
                className="w-full h-11 text-sm sm:text-base font-bold shadow-md shadow-brand-900/10"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Authenticating Role & Access...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In to Portal
                    <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Demo Sign-In (Auto-Detects Role) with ALL ADMINS */}
            <div className="mt-7 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Zap size={15} className="text-amber-500 fill-amber-500" />
                    <span>Quick Sign-In Desk</span>
                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60">
                      Auto-Detects Role
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click any administrator card to populate credentials and detect their exact role & permissions.
                  </p>
                </div>

                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuickRoleFilter('admins')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      quickRoleFilter === 'admins'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    👑 All Admins ({QUICK_ADMIN_ACCOUNTS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickRoleFilter('all')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      quickRoleFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    👥 All Roles ({QUICK_ADMIN_ACCOUNTS.length + QUICK_OTHER_ACCOUNTS.length})
                  </button>
                </div>
              </div>

              {/* Grid of All Admin & Staff Accounts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {displayedAccounts.map((acc) => {
                  const isSelected = activeQuickId === acc.id || identifier.toLowerCase() === acc.email.toLowerCase() || identifier.toLowerCase() === acc.staffId.toLowerCase();
                  const RoleIcon = acc.icon;

                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectQuickAccount(acc)}
                      className={`group relative p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-offset-1 ring-slate-900'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isSelected ? 'bg-white/20 text-white' : `${acc.iconBg}`
                        }`}>
                          <RoleIcon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs truncate leading-tight block">
                              {acc.roleLabel}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] bg-emerald-500 text-white rounded-full p-0.5 shrink-0">
                                <Check size={10} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] truncate block leading-tight ${
                            isSelected ? 'text-slate-300' : 'text-slate-500'
                          }`}>
                            {acc.subLabel}
                          </span>
                        </div>
                      </div>

                      <div className={`pt-1.5 border-t text-[10px] flex items-center justify-between ${
                        isSelected ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-500'
                      }`}>
                        <div className="truncate font-medium">
                          {acc.name.split(" ")[0]} {acc.name.split(" ")[1] || ""}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstantLogin(acc);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-brand-600 hover:text-white'
                          }`}
                          title={`Instant 1-Click login as ${acc.roleLabel}`}
                        >
                          <Zap size={10} className="shrink-0" />
                          <span>Instant</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>⚡ Click any account to fill & auto-detect role</span>
                <span className="text-slate-400">Default demo password filled automatically</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}



