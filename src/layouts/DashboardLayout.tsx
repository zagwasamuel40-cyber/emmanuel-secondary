import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  UserPlus,
  UserX,
  Briefcase, 
  History, 
  GraduationCap, 
  CreditCard, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  LogOut, 
  ClipboardList, 
  User, 
  FileCheck,
  QrCode,
  Clock,
  Sliders,
  Calendar,
  BookOpen,
  Printer,
  ShieldCheck,
  Building2,
  DollarSign,
  FileSpreadsheet,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Input } from "@/src/components/ui";
import { usePortalSettings } from "../data/portalSettingsData";
import { useTeachers } from "../data/teachersData";
import { useCurrentUserRoles, ALL_ROLES_METADATA, Permission } from "../data/rolesAndPermissions";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  permission?: Permission;
  badge?: string;
}

interface NavSection {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: NavItem[];
  requiredPermission?: Permission;
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roles, permissions, hasPermission, isSuperAdmin, isGeneralAdmin } = useCurrentUserRoles();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalSettings] = usePortalSettings();
  const [teachers] = useTeachers();

  const loggedInUserId = localStorage.getItem("loggedInUserId");
  const teacher = teachers.find(t => t.id === loggedInUserId);
  const impersonatingName = localStorage.getItem('impersonatingName');

  useEffect(() => {
    if (teacher && ['Resigned', 'Terminated', 'Retired', 'Suspended', 'Inactive'].includes(teacher.status)) {
      localStorage.removeItem('loggedInUserId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userRoles');
      navigate('/login?error=account_deactivated');
    }
  }, [teacher, navigate]);

  const handleStopImpersonating = () => {
    const originalUserId = localStorage.getItem('originalAdminUserId');
    const originalRoles = localStorage.getItem('originalAdminRoles');
    const originalRole = localStorage.getItem('originalAdminRole');
    
    if (originalUserId) localStorage.setItem('loggedInUserId', originalUserId);
    if (originalRoles) localStorage.setItem('userRoles', originalRoles);
    if (originalRole) localStorage.setItem('userRole', originalRole);
    
    localStorage.removeItem('impersonatingName');
    localStorage.removeItem('impersonatingType');
    localStorage.removeItem('originalAdminUserId');
    localStorage.removeItem('originalAdminRoles');
    localStorage.removeItem('originalAdminRole');
    localStorage.removeItem('loggedInStudentId');
    
    window.dispatchEvent(new Event('ess_roles_change'));
    navigate('/dashboard/teachers');
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('loggedInStudentId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userRoles');
    window.dispatchEvent(new Event('ess_roles_change'));
    navigate('/');
  };

  /**
   * Structured navigation sections according to Section 1 & Section 12:
   * 1. Staff Workspace (Base features retained by EVERY administrator)
   * 2. Departmental Sections (Displayed strictly if user holds permission for that department)
   */
  const navSections: NavSection[] = [
    // 1. Base Staff Features - Visible to all staff and admins
    {
      title: "Staff Workspace",
      icon: Briefcase,
      items: [
        { name: "My Staff Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Classes & Students", href: "/dashboard/students", icon: Users },
        { name: "Class Attendance", href: "/dashboard/attendance", icon: UserCheck },
        { name: "My Teaching Schedule", href: "/dashboard/academics?view=timetable", icon: Calendar },
        { name: "My Staff Profile", href: "/dashboard/profile", icon: User },
      ]
    },

    // 2. Admission Directorate
    {
      title: "Admissions Directorate",
      icon: FileCheck,
      requiredPermission: 'admission.view',
      items: [
        { name: "Admissions Control Desk", href: "/dashboard/admissions", icon: Sliders },
        { name: "Applicants Roster", href: "/dashboard/admissions?tab=applicants", icon: Users },
        { name: "Entrance Examination", href: "/dashboard/admissions?tab=exams", icon: Calendar },
        { name: "Admission Shortlist", href: "/dashboard/admissions?tab=shortlist", icon: ClipboardList },
        { name: "Admission Reports", href: "/dashboard/admissions?tab=reports", icon: Printer },
        { name: "Applicant ID Cards", href: "/dashboard/id-cards", icon: CreditCard },
      ]
    },

    // 3. Finance & Bursary
    {
      title: "Finance & Bursary",
      icon: DollarSign,
      requiredPermission: 'finance.view',
      items: [
        { name: "Finance Overview", href: "/dashboard/finance", icon: LayoutDashboard },
        { name: "School Fees & Tuition", href: "/dashboard/finance?tab=fees", icon: CreditCard },
        { name: "Payment Verification", href: "/dashboard/finance?tab=payments", icon: UserCheck },
        { name: "Receipts & Invoicing", href: "/dashboard/finance?tab=receipts", icon: Printer },
        { name: "Expense Management", href: "/dashboard/finance?tab=expenses", icon: FileSpreadsheet },
        { name: "Financial Reports", href: "/dashboard/finance?tab=reports", icon: History },
      ]
    },

    // 4. Examinations & CBT Center
    {
      title: "Examinations & CBT",
      icon: ClipboardList,
      requiredPermission: 'examination.view',
      items: [
        { name: "Examinations Desk", href: "/dashboard/examinations", icon: LayoutDashboard },
        { name: "CBT Question Bank", href: "/dashboard/examinations?tab=questions", icon: BookOpen },
        { name: "AI Question Generator", href: "/dashboard/examinations?tab=ai-generate", icon: Sparkles, badge: "AI" },
        { name: "Live CBT Monitoring", href: "/dashboard/examinations?tab=monitor", icon: Clock },
        { name: "Results & Approval", href: "/dashboard/examinations?tab=results", icon: CheckCircle2 },
        { name: "Term Exam Reports", href: "/dashboard/examinations?tab=reports", icon: Printer },
      ]
    },

    // 5. Academic Affairs
    {
      title: "Academic Affairs",
      icon: GraduationCap,
      requiredPermission: 'academic.view',
      items: [
        { name: "Academic Dashboard", href: "/dashboard/academics", icon: LayoutDashboard },
        { name: "Classes & Arms", href: "/dashboard/academics?tab=classes", icon: Building2 },
        { name: "Subjects & Curriculum", href: "/dashboard/academics?tab=subjects", icon: BookOpen },
        { name: "Teacher Allocation", href: "/dashboard/academics?tab=allocation", icon: UserPlus },
        { name: "Timetables & Calendar", href: "/dashboard/academics?tab=timetable", icon: Calendar },
        { name: "Student Promotion", href: "/dashboard/academics?tab=promotion", icon: Layers },
        { name: "Academic Reports", href: "/dashboard/academics?tab=reports", icon: Printer },
      ]
    },

    // 6. Attendance & Security
    {
      title: "Attendance & Gate",
      icon: QrCode,
      requiredPermission: 'attendance.view',
      items: [
        { name: "Gate Controller Hub", href: "/dashboard/attendance-officer", icon: LayoutDashboard },
        { name: "Scan Student ID", href: "/dashboard/attendance-officer?section=scan-student", icon: QrCode },
        { name: "Scan Staff ID", href: "/dashboard/attendance-officer?section=scan-staff", icon: Briefcase },
        { name: "Today's Gate Register", href: "/dashboard/attendance-officer?section=today", icon: Clock },
        { name: "Student Attendance", href: "/dashboard/attendance-officer?section=students", icon: Users },
        { name: "Staff Attendance Logs", href: "/dashboard/attendance-officer?section=staff", icon: Briefcase },
        { name: "Attendance Reports", href: "/dashboard/attendance-officer?section=reports", icon: Printer },
      ]
    },

    // 7. Portal & Website CMS
    {
      title: "Portal & Website CMS",
      icon: Globe,
      requiredPermission: 'portal.view',
      items: [
        { name: "Website Dashboard", href: "/dashboard/portal-manager", icon: LayoutDashboard },
        { name: "Homepage CMS", href: "/dashboard/portal-manager?tab=homepage", icon: Sliders },
        { name: "News & Announcements", href: "/dashboard/portal-manager?tab=news", icon: Bell },
        { name: "Photo Gallery", href: "/dashboard/portal-manager?tab=gallery", icon: Layers },
        { name: "Contact Information", href: "/dashboard/portal-manager?tab=contact", icon: Building2 },
        { name: "SEO & Web Settings", href: "/dashboard/portal-manager?tab=seo", icon: Settings },
      ]
    },

    // 8. System & School Administration (General Admin & Super Admin)
    {
      title: "System Administration",
      icon: ShieldCheck,
      requiredPermission: 'staff.manage',
      items: [
        { name: "Staff & Role Management", href: "/dashboard/teachers", icon: UserPlus },
        { name: "Student Enrollment", href: "/dashboard/enrollment", icon: UserCheck },
        { name: "Security & Audit Trail", href: "/dashboard/audit-logs", icon: History, badge: "Sec" },
        { name: "Report Center", href: "/dashboard/reports", icon: Printer },
        { name: "School Configuration", href: "/dashboard/settings", icon: Settings },
      ]
    }
  ];

  // Filter sections based on permissions
  const authorizedSections = navSections.filter(section => {
    if (!section.requiredPermission) return true; // Base staff workspace
    return hasPermission(section.requiredPermission);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className={`w-full md:w-68 bg-slate-900 text-slate-300 md:min-h-screen flex-shrink-0 flex flex-col print:hidden ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 bg-slate-950/70 border-b border-slate-800/80 justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            {portalSettings.logoUrl ? (
              <img src={portalSettings.logoUrl} alt="School Logo" className="w-8 h-8 rounded-full object-cover border border-white/20" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                ESS
              </div>
            )}
            <div className="leading-tight">
              <span className="font-heading font-bold text-white text-sm tracking-wide line-clamp-1">
                {portalSettings.schoolName || "Emmanuel Sec. School"}
              </span>
              <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold block">
                Management Portal
              </span>
            </div>
          </Link>
        </div>

        {/* User Identity Mini-Card */}
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs bg-indigo-600 text-white border border-indigo-400 flex-shrink-0">
              {teacher?.passportUrl ? (
                <img src={teacher.passportUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                teacher ? teacher.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'ST'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {impersonatingName || (teacher ? teacher.name : "Staff Member")}
              </p>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                {teacher?.id || loggedInUserId || "STF/2026/001"}
              </p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {roles.map(r => (
              <span key={r} className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-700/80 text-indigo-200 border border-slate-600">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Stream grouped by Department */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto max-h-[calc(100vh-180px)]">
          {authorizedSections.map((section, sIdx) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <section.icon size={13} className="text-indigo-400" />
                <span>{section.title}</span>
              </div>
              {section.items.map(item => {
                const currentFullUrl = location.pathname + location.search;
                const isActive = item.href.includes('?')
                  ? currentFullUrl === item.href
                  : location.pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <item.icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                        isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/30 text-indigo-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors w-full text-left"
          >
            <LogOut size={16} />
            Sign Out of Account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Impersonation Banner */}
        {impersonatingName && (
          <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md print:hidden z-50">
            <div className="flex items-center gap-2">
              <UserCheck size={16} />
              <span>Viewing account as <strong>{impersonatingName}</strong> with their departmental role permissions.</span>
            </div>
            <button 
              onClick={handleStopImpersonating}
              className="px-2.5 py-1 bg-amber-950 text-white rounded text-xs hover:bg-amber-900 transition-colors"
            >
              Exit to Admin Dashboard
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 print:hidden sticky top-0 z-40 shadow-2xs">
          <div className="flex items-center gap-3 flex-1">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>
            <div className="max-w-md w-full hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                className="pl-9 h-9 text-xs bg-slate-50 border-slate-200" 
                placeholder="Search students, subjects, classes, reports..." 
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Departmental Badges */}
            <div className="hidden sm:flex gap-1 items-center max-w-sm overflow-x-auto pr-1">
              {roles.map(r => (
                <span 
                  key={r} 
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap"
                >
                  {r}
                </span>
              ))}
            </div>

            <Link
              to="/dashboard/profile"
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors text-xs flex items-center gap-1.5 font-medium"
              title="My Account"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs bg-indigo-100 text-indigo-700 border border-indigo-200">
                {teacher?.passportUrl ? (
                  <img src={teacher.passportUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  teacher ? teacher.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'ST'
                )}
              </div>
              <span className="hidden md:inline text-slate-800 font-semibold max-w-[120px] truncate">
                {impersonatingName || (teacher ? teacher.name.split(' ')[1] || teacher.name : "Officer")}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Outlet Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// Add missing Lucide icon helper
function CheckCircle2(props: { size?: number; className?: string }) {
  return <CheckCircle size={props.size || 16} className={props.className} />;
}
