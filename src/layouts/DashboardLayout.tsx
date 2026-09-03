import React, { useEffect } from "react";
import { Outlet, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck,
  UserPlus,
  GraduationCap, 
  CreditCard, 
  Settings,
  Bell,
  Search,
  Menu,
  LogOut,
  ClipboardList,
  User,
  FileCheck
} from "lucide-react";
import { Input } from "@/src/components/ui";
import { usePortalSettings } from "../data/portalSettingsData";
import { useTeachers } from "../data/teachersData";


const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Admissions', href: '/dashboard/admissions', icon: FileCheck },
  { name: 'Enrollment', href: '/dashboard/enrollment', icon: UserCheck },
  { name: 'Students', href: '/dashboard/students', icon: Users },
  { name: 'Staff & Teachers', href: '/dashboard/teachers', icon: UserPlus },
  { name: 'Academics', href: '/dashboard/academics', icon: GraduationCap },
  { name: 'Examinations & CA', href: '/dashboard/examinations', icon: ClipboardList },
  { name: 'Finance', href: '/dashboard/finance', icon: CreditCard },
  { name: 'Portal Manager', href: '/dashboard/portal-manager', icon: Settings },
  { name: 'My Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  let roles: string[] = [];
  try {
    roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  } catch (e) {}

  if (roles.length === 0) {
    const r = localStorage.getItem('userRole') || 'admin';
    if (r === 'admin') roles = ['Admin'];
    else if (r === 'superadmin') roles = ['Admission Officer'];
    else if (r === 'portaladmin') roles = ['Portal Admin'];
    else roles = ['Teacher'];
  }

  // Determine role booleans for layout UI (like colored tags or headers)
  // Even if a user has multiple roles, we can use the highest precedence or combine them.
  const isAdmin = roles.includes('Admin') || roles.includes('Super Admin') || roles.includes('General Admin');
  const isSuperAdmin = roles.includes('Admission Officer');
  const isPortalAdmin = roles.includes('Portal Admin');
  const isStaff = roles.includes('Teacher');

  const routeAccessMap: Record<string, string[]> = {
    '/dashboard': ['Admin', 'Super Admin', 'General Admin', 'Teacher', 'Examination Admin', 'Admission Officer', 'Portal Admin', 'Finance/Admin Officer', 'Academic Admin', 'HR/Staff Admin'],
    '/dashboard/admissions': ['Admin', 'Super Admin', 'General Admin', 'Admission Officer'],
    '/dashboard/enrollment': ['Admin', 'Super Admin', 'General Admin', 'Admission Officer', 'Teacher', 'Academic Admin'],
    '/dashboard/students': ['Admin', 'Super Admin', 'General Admin', 'Teacher', 'Academic Admin'],
    '/dashboard/teachers': ['Admin', 'Super Admin', 'General Admin', 'HR/Staff Admin'],
    '/dashboard/academics': ['Admin', 'Super Admin', 'General Admin', 'Academic Admin'],
    '/dashboard/examinations': ['Admin', 'Super Admin', 'General Admin', 'Teacher', 'Examination Admin'],
    '/dashboard/finance': ['Admin', 'Super Admin', 'General Admin', 'Finance/Admin Officer'],
    '/dashboard/portal-manager': ['Admin', 'Super Admin', 'General Admin', 'Portal Admin'],
    '/dashboard/settings': ['Admin', 'Super Admin', 'General Admin', 'Portal Admin'],
    '/dashboard/profile': ['*'],
  };

  const hasAccessToRoute = (path: string, userRoles: string[]) => {
    // Check if any defined route matches the path, longest paths first
    const sortedKeys = Object.keys(routeAccessMap).sort((a, b) => b.length - a.length);
    const matchingKey = sortedKeys.find(key => path === key || path.startsWith(key + '/'));
    if (!matchingKey) return true; // Default allow if not explicitly restricted

    const allowedRoles = routeAccessMap[matchingKey];
    if (allowedRoles.includes('*')) return true;

    return userRoles.some(role => allowedRoles.includes(role));
  };

  const [portalSettings] = usePortalSettings();
  const [teachers] = useTeachers();
  const teacher = teachers.find(t => t.id === localStorage.getItem("loggedInUserId"));
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
    
    navigate('/dashboard/teachers');
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('loggedInStudentId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userRoles');
    navigate('/');
  };

  // Check redirects if user lacks access to current route
  if (!hasAccessToRoute(location.pathname, roles)) {
    // Find the first accessible route
    const firstAllowedItem = navigation.find(item => hasAccessToRoute(item.href, roles));
    if (firstAllowedItem) {
      return <Navigate to={firstAllowedItem.href} replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  const filteredNavigation = navigation.filter(item => hasAccessToRoute(item.href, roles));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen flex-shrink-0 flex flex-col print:hidden">
        <div className="h-16 flex items-center px-6 bg-slate-950/50 justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout} title="Click to logout">
            {portalSettings.logoUrl && <img src={portalSettings.logoUrl} alt="School Logo" className="w-8 h-8 rounded-full object-cover" />}
            <span className="font-heading font-bold text-white text-sm tracking-wide line-clamp-1">
              {portalSettings.schoolName || "Admin Dashboard"}
            </span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-brand-600 text-white' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white transition-colors w-full text-left">
            <LogOut size={18} className="text-slate-400" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {impersonatingName && (
          <div className="bg-amber-500 text-amber-950 px-4 py-2 text-sm font-semibold flex items-center justify-between shadow-md print:hidden z-50">
            <div className="flex items-center gap-2">
              <UserCheck size={18} />
              <span>Administrator View — You are viewing this account as {impersonatingName}.</span>
            </div>
            <button 
              onClick={handleStopImpersonating}
              className="px-3 py-1 bg-amber-900 text-amber-50 rounded hover:bg-amber-950 transition-colors text-xs"
            >
              Return to Admin Dashboard
            </button>
          </div>
        )}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 print:hidden">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden text-slate-500 hover:text-slate-700">
              <Menu size={24} />
            </button>
            <div className="max-w-md w-full hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input className="pl-10 bg-slate-50 border-slate-200" placeholder="Search students, staff..." />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-1.5 items-center max-w-sm overflow-x-auto pr-2 hide-scrollbar">
              {roles.map(r => (
                <span key={r} className="whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                  {r}
                </span>
              ))}
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm bg-brand-100 text-brand-700 border border-brand-200">
              {teacher?.passportUrl ? (
                <img src={teacher.passportUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                teacher ? teacher.name.split(' ').map(n => n[0]).slice(0, 2).join('') : (roles.includes('General Admin') || roles.includes('Super Admin') ? 'AD' : roles.length ? roles[0].substring(0, 2).toUpperCase() : 'U')
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
