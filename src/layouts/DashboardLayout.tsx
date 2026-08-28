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
  const role = localStorage.getItem('userRole') || 'admin';
  const [portalSettings] = usePortalSettings();
  const isStaff = role === 'teacher' || role === 'staff';
  const isSuperAdmin = role === 'superadmin' || role === 'super_admin' || role === 'admission_admin';
  const isPortalAdmin = role === 'portaladmin' || role === 'portal_admin';

  const handleLogout = () => {
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('loggedInStudentId');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const allowedStaffPaths = ['/dashboard/students', '/dashboard/enrollment', '/dashboard/examinations', '/dashboard/profile'];
  const allowedSuperAdminPaths = ['/dashboard/admissions', '/dashboard/enrollment', '/dashboard/profile'];
  const allowedPortalAdminPaths = ['/dashboard/portal-manager', '/dashboard/settings', '/dashboard/profile'];

  if (isPortalAdmin && !allowedPortalAdminPaths.includes(location.pathname)) {
    return <Navigate to="/dashboard/portal-manager" replace />;
  }

  if (isSuperAdmin && !allowedSuperAdminPaths.includes(location.pathname)) {
    return <Navigate to="/dashboard/admissions" replace />;
  }

  if (isStaff && !allowedStaffPaths.includes(location.pathname)) {
    return <Navigate to="/dashboard/students" replace />;
  }

  const filteredNavigation = navigation.filter(item => {
    if (isPortalAdmin) {
      return item.href === '/dashboard/portal-manager' || item.href === '/dashboard/settings' || item.href === '/dashboard/profile';
    }
    if (isSuperAdmin) {
      return item.href === '/dashboard/admissions' || item.href === '/dashboard/enrollment' || item.href === '/dashboard/profile';
    }
    if (isStaff) {
      return item.name === 'Students' || item.name === 'Enrollment' || item.name === 'Examinations & CA' || item.name === 'My Profile';
    }
    return true;
  });

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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 print:hidden">
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden text-slate-500 hover:text-slate-700">
              <Menu size={24} />
            </button>
            {isPortalAdmin ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 text-purple-900 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                Portal Admin Mode: News & Portal Customization
              </div>
            ) : isSuperAdmin ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Admission Officer Access Mode: Admissions & Enrollment
              </div>
            ) : (
              <div className="max-w-md w-full hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input className="pl-10 bg-slate-50 border-slate-200" placeholder="Search students, staff..." />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border border-white"></span>
            </button>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              isPortalAdmin ? 'bg-purple-100 text-purple-900 border border-purple-300' :
              isSuperAdmin ? 'bg-amber-100 text-amber-800 border border-amber-300' :
              isStaff ? 'bg-emerald-100 text-emerald-800' :
              'bg-brand-100 text-brand-700'
            }`}>
              {isPortalAdmin ? 'PA' : isSuperAdmin ? 'AO' : isStaff ? 'ST' : 'AD'}
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
