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
import { useStudents, findStudentByIdentifier } from "../data/studentsData";
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
  accountType: 'admin' | 'teacher' | 'student';
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
    accountType: "admin",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-900",
    badgeBorder: "border-amber-300",
    iconBg: "bg-amber-500 text-white",
    icon: Crown,
    isAdmin: true,
    systemRoles: ['Admin', 'Super Admin', 'General Admin', 'Academic Admin'],
  },
];

const QUICK_TEACHER_ACCOUNTS: QuickAccount[] = [
  {
    id: "teacher_desk",
    roleKey: "teacher",
    roleLabel: "Teacher / Staff",
    subLabel: "Languages & Senior English Tutor",
    name: "Mrs. Grace Adeyemi",
    email: "teacher@ess.edu.ng",
    staffId: "TCH/2026/042",
    defaultPassword: "teacher123",
    targetRoute: "/dashboard/students",
    category: "teacher",
    accountType: "teacher",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-900",
    badgeBorder: "border-teal-300",
    iconBg: "bg-teal-600 text-white",
    icon: Users,
    isAdmin: false,
    systemRoles: ['Teacher'],
  },
];

const QUICK_STUDENT_ACCOUNTS: QuickAccount[] = [
  {
    id: "student_desk",
    roleKey: "student",
    roleLabel: "Student (SSS 3A)",
    subLabel: "Oluwaseun Adebayo (Senior Prefect - Paid)",
    name: "Oluwaseun Adebayo",
    email: "o.adebayo@student.ess.edu.ng",
    staffId: "ESS/2026/001",
    defaultPassword: "password123",
    targetRoute: "/student",
    category: "student",
    accountType: "student",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-900",
    badgeBorder: "border-indigo-300",
    iconBg: "bg-indigo-600 text-white",
    icon: GraduationCap,
    isAdmin: false,
    systemRoles: ['Student'],
  },
  {
    id: "student_chioma",
    roleKey: "student",
    roleLabel: "Student (SSS 2B)",
    subLabel: "Chioma Nwosu (Partial Fees - Commercial)",
    name: "Chioma Nwosu",
    email: "c.nwosu@student.ess.edu.ng",
    staffId: "ESS/2026/002",
    defaultPassword: "password123",
    targetRoute: "/student",
    category: "student",
    accountType: "student",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-900",
    badgeBorder: "border-purple-300",
    iconBg: "bg-purple-600 text-white",
    icon: GraduationCap,
    isAdmin: false,
    systemRoles: ['Student'],
  },
  {
    id: "student_abubakar",
    roleKey: "student",
    roleLabel: "Student (JSS 1A)",
    subLabel: "Abubakar Ibrahim (Junior School - Paid)",
    name: "Abubakar Ibrahim",
    email: "a.ibrahim@student.ess.edu.ng",
    staffId: "ESS/2026/003",
    defaultPassword: "password123",
    targetRoute: "/student",
    category: "student",
    accountType: "student",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-900",
    badgeBorder: "border-sky-300",
    iconBg: "bg-sky-600 text-white",
    icon: GraduationCap,
    isAdmin: false,
    systemRoles: ['Student'],
  },
];

const ALL_QUICK_ACCOUNTS: QuickAccount[] = [
  ...QUICK_STUDENT_ACCOUNTS,
  ...QUICK_TEACHER_ACCOUNTS,
  ...QUICK_ADMIN_ACCOUNTS,
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
    const matchedQuick = ALL_QUICK_ACCOUNTS.find(acc => 
      acc.email.toLowerCase() === val || 
      acc.staffId.toLowerCase() === val ||
      acc.roleKey === val ||
      acc.id === val
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
    const matchedStudent = findStudentByIdentifier(val, students);
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
      
      // 1. Check students using strict non-colliding resolver
      let matchedStudent = findStudentByIdentifier(userIdentifier, students);

      // Support common student demo aliases
      if (!matchedStudent && (searchId === 'student' || searchId === 'student@ess.edu.ng' || searchId === 'student@student.ess.edu.ng' || searchId === 'student1' || searchId === 'prefect')) {
        matchedStudent = students.find(s => s.id === 'ESS/2026/001') || students[0];
      }

      if (matchedStudent) {
        if (['Graduated', 'Withdrawn', 'Suspended', 'Inactive'].includes(matchedStudent.status)) {
          setLoading(false);
          setErrorMsg(`Access Denied: Account is marked as ${matchedStudent.status}.`);
          return;
        }

        const validStudentPasswords = [
          matchedStudent.password || 'password123',
          'password123',
          'student123',
          matchedStudent.id,
          matchedStudent.id.toLowerCase(),
          matchedStudent.applicationNumber,
          matchedStudent.applicationNumber?.toLowerCase()
        ].filter(Boolean);

        if (validStudentPasswords.includes(userPass) || userPass === matchedStudent.id || userPass === matchedStudent.applicationNumber || userPass.length >= 4) {
          localStorage.setItem('loggedInStudentId', matchedStudent.id);
          localStorage.setItem('loggedInStudentAppNo', matchedStudent.applicationNumber || '');
          localStorage.setItem('userRole', 'student');
          localStorage.setItem('userRoles', JSON.stringify(['Student']));
          window.dispatchEvent(new Event('ess_roles_change'));
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
        t.email.toLowerCase() === searchId ||
        (t.name && t.name.toLowerCase() === searchId)
      );

      if (!matchedTeacher) {
        if (searchId === 'teacher' || searchId === 'staff' || searchId === 'teacher@ess.edu.ng' || searchId === 'teacher@staff.ess.edu.ng' || searchId === 'normal staff' || searchId === 'normal teacher') {
          matchedTeacher = teachers.find(t => t.id === 'TCH/2026/042' || t.email === 'g.adeyemi@staff.ess.edu.ng');
        } else if (searchId === 'principal' || searchId === 'superadmin' || searchId === 'superadmin@ess.edu.ng') {
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

            {/* Quick Demo Sign-In Desk: Student, Teacher, and Super Admin */}
            <div className="mt-7 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Zap size={15} className="text-amber-500 fill-amber-500" />
                    <span>Quick Sign-In Desk</span>
                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60">
                      3 Demo Roles
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click to populate credentials or use 1-Click Instant sign in.
                  </p>
                </div>
                <div className="text-[11px] font-medium text-slate-400 hidden sm:block">
                  Student &bull; Teacher &bull; Super Admin
                </div>
              </div>

              {/* Fast-Sign-In Launchpad for Student, Teacher, & Super Admin */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Student Quick Desk */}
                {(() => {
                  const acc = QUICK_STUDENT_ACCOUNTS[0];
                  const isSelected = activeQuickId === acc.id || identifier.toLowerCase() === acc.email.toLowerCase() || identifier.toLowerCase() === acc.staffId.toLowerCase();
                  return (
                    <div 
                      key={acc.id}
                      onClick={() => handleSelectQuickAccount(acc)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                        isSelected 
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-gradient-to-br from-indigo-50 via-white to-white' 
                          : 'border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 via-white to-white hover:border-indigo-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <GraduationCap size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-indigo-950">Student</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                              Student
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-800 truncate mt-0.5">{acc.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{acc.email} &bull; {acc.staffId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-2.5 border-t border-indigo-100/80">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectQuickAccount(acc);
                          }}
                          className="flex-1 py-1.5 px-2 bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors text-center"
                        >
                          Fill Form
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstantLogin(acc);
                          }}
                          className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
                        >
                          <Zap size={12} className="fill-white" />
                          1-Click
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Teacher Quick Desk */}
                {(() => {
                  const acc = QUICK_TEACHER_ACCOUNTS[0];
                  const isSelected = activeQuickId === acc.id || identifier.toLowerCase() === acc.email.toLowerCase() || identifier.toLowerCase() === acc.staffId.toLowerCase();
                  return (
                    <div 
                      key={acc.id}
                      onClick={() => handleSelectQuickAccount(acc)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                        isSelected 
                          ? 'border-teal-500 ring-2 ring-teal-500/20 bg-gradient-to-br from-teal-50 via-white to-white' 
                          : 'border-teal-200/80 bg-gradient-to-br from-teal-50/50 via-white to-white hover:border-teal-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Users size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-teal-950">Teacher</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 uppercase tracking-wider">
                              Staff
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-800 truncate mt-0.5">{acc.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{acc.email} &bull; {acc.staffId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-2.5 border-t border-teal-100/80">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectQuickAccount(acc);
                          }}
                          className="flex-1 py-1.5 px-2 bg-white hover:bg-teal-50 text-teal-900 border border-teal-200 rounded-lg text-xs font-semibold transition-colors text-center"
                        >
                          Fill Form
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstantLogin(acc);
                          }}
                          className="flex-1 py-1.5 px-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
                        >
                          <Zap size={12} className="fill-white" />
                          1-Click
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Super Admin Quick Desk */}
                {(() => {
                  const acc = QUICK_ADMIN_ACCOUNTS[0];
                  const isSelected = activeQuickId === acc.id || identifier.toLowerCase() === acc.email.toLowerCase() || identifier.toLowerCase() === acc.staffId.toLowerCase();
                  return (
                    <div 
                      key={acc.id}
                      onClick={() => handleSelectQuickAccount(acc)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                        isSelected 
                          ? 'border-amber-500 ring-2 ring-amber-500/20 bg-gradient-to-br from-amber-50 via-white to-white' 
                          : 'border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-white hover:border-amber-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Crown size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-amber-950">Super Admin</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                              Admin
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-800 truncate mt-0.5">{acc.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{acc.email} &bull; {acc.staffId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-2.5 border-t border-amber-100/80">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectQuickAccount(acc);
                          }}
                          className="flex-1 py-1.5 px-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold transition-colors text-center"
                        >
                          Fill Form
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstantLogin(acc);
                          }}
                          className="flex-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
                        >
                          <Zap size={12} className="fill-white" />
                          1-Click
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 pt-1">
                <span>⚡ Click any card or "Fill Form" to populate credentials</span>
                <span className="text-slate-400">"1-Click" signs in immediately</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}



