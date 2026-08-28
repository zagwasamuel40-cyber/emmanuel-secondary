import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useStudents } from "../data/studentsData";
import { usePortalSettings } from "../data/portalSettingsData";
import { 
  Home, 
  BookOpen, 
  CreditCard, 
  User,
  Bell,
  Menu,
  LogOut,
  Calendar
} from "lucide-react";

const navigation = [
  { name: 'My Dashboard', href: '/student', icon: Home },
  { name: 'My Subjects & CBT', href: '/student/subjects', icon: BookOpen },
  { name: 'Fees & Payments', href: '/student/fees', icon: CreditCard },
  { name: 'Timetable', href: '/student/timetable', icon: Calendar },
  { name: 'Profile', href: '/student/profile', icon: User },
];

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [portalSettings] = usePortalSettings();
  const [students] = useStudents();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const loggedInId = localStorage.getItem('loggedInStudentId');
    if (loggedInId) {
      const found = students.find(s => s.id === loggedInId || s.name.toLowerCase().includes(loggedInId.toLowerCase()));
      if (found) setStudent(found);
      else setStudent(students[0]);
    } else {
      setStudent(students[0]);
    }
  }, [students]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUserId');
    localStorage.removeItem('loggedInStudentId');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-brand-900 text-slate-300 md:min-h-screen flex-shrink-0 flex flex-col print:hidden">
        <div className="h-16 flex items-center px-6 bg-brand-950/50 justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout} title="Click to logout">
            {portalSettings.logoUrl && <img src={portalSettings.logoUrl} alt="School Logo" className="w-8 h-8 rounded-full object-cover" />}
            <span className="font-heading font-bold text-white text-lg tracking-wide line-clamp-1">Student Portal</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/student' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-brand-600 text-white' 
                    : 'hover:bg-brand-800 hover:text-white'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'text-brand-300'} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-brand-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white transition-colors w-full text-left">
            <LogOut size={18} className="text-brand-300" />
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
            <div className="font-medium text-slate-900">
              Welcome back, {student?.name?.split(' ')[0] || "Student"}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm overflow-hidden">
              {student?.passportUrl ? (
                <img src={student.passportUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                student?.name?.charAt(0) || "S"
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
