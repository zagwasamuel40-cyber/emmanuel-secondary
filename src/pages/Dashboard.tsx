import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNews } from "../data/newsData";
import { useSessions } from "../data/sessionsData";
import { useStudents, useAdmissionApps, generateNextStudentId } from "../data/studentsData";
import { useTeachers, Teacher } from "../data/teachersData";
import { useAuditLogs, logAuditEvent } from "../data/auditLogData";
import { useCurrentUserRoles, ALL_ROLES_METADATA, Permission } from "../data/rolesAndPermissions";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/src/components/ui";
import { 
  Users, BookOpen, GraduationCap, TrendingUp, Download, Key, ShieldCheck, 
  CheckCircle, RefreshCw, Plus, Search, Filter, Printer, Eye, EyeOff, 
  Copy, Check, Layers, UserCheck, FileSpreadsheet, Sparkles, AlertCircle, 
  X, FileText, Lock, Unlock, Clock, ArrowRight, Zap, MessageSquare,
  DollarSign, Briefcase, QrCode, Globe, Calendar, Sliders, ChevronRight,
  Shield, UserCog, Award, CheckCircle2, UserX, AlertTriangle
} from "lucide-react";
import TeacherDashboard from "./dashboard/TeacherDashboard";
import AttendanceOfficerDashboard from "./staff/AttendanceOfficerDashboard";
import StaffRoleModal from "../components/admin/StaffRoleModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    roles, 
    permissions, 
    hasPermission, 
    isSuperAdmin, 
    isGeneralAdmin, 
    isAdmissionOfficer, 
    isFinanceOfficer, 
    isExaminationAdmin, 
    isAcademicAdmin, 
    isAttendanceOfficer, 
    isPortalAdmin, 
    isTeacher 
  } = useCurrentUserRoles();

  const [sessions] = useSessions();
  const [students, setStudents] = useStudents();
  const [teachers, setTeachers] = useTeachers();
  const [admissionApps, setAdmissionApps] = useAdmissionApps();
  const [newsList] = useNews();
  const auditLogs = useAuditLogs();

  const loggedInUserId = localStorage.getItem("loggedInUserId");
  const teacher = teachers.find(t => t.id === loggedInUserId);
  const impersonatingName = localStorage.getItem('impersonatingName');
  const displayName = impersonatingName || (teacher ? teacher.name : "Staff Member");
  const staffId = teacher?.id || loggedInUserId || "STF/2026/001";
  const userDepartment = teacher?.department || "Administration";

  // Notification Banner
  const [notificationMsg, setNotificationMsg] = useState("");
  const notify = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(""), 5000);
  };

  // State for Staff Role Modal (Super Admin / General Admin management)
  const [selectedStaffForRoles, setSelectedStaffForRoles] = useState<Teacher | null>(null);

  // Admission Portal toggle state
  const [portalOpen, setPortalOpen] = useState(true);
  const [admissionOpeningDate, setAdmissionOpeningDate] = useState("2026-08-01");
  const [admissionClosingDate, setAdmissionClosingDate] = useState("2026-10-31");

  // Determine available dashboard views based on assigned permissions
  const availableViews = useMemo(() => {
    const views: { id: string; label: string; icon: any; permission?: Permission }[] = [
      // Base Staff Workspace is ALWAYS available to every administrator and teacher
      { id: "staff_workspace", label: "Staff Workspace", icon: Briefcase },
    ];

    if (hasPermission('admission.view')) {
      views.push({ id: "admissions", label: "Admissions Directorate", icon: FileText, permission: 'admission.view' });
    }
    if (hasPermission('finance.view')) {
      views.push({ id: "finance", label: "Finance & Bursary", icon: DollarSign, permission: 'finance.view' });
    }
    if (hasPermission('examination.view')) {
      views.push({ id: "examinations", label: "Examinations & CBT", icon: GraduationCap, permission: 'examination.view' });
    }
    if (hasPermission('academic.view')) {
      views.push({ id: "academics", label: "Academic Affairs", icon: BookOpen, permission: 'academic.view' });
    }
    if (hasPermission('attendance.view')) {
      views.push({ id: "attendance", label: "Gate & Attendance", icon: QrCode, permission: 'attendance.view' });
    }
    if (hasPermission('portal.view')) {
      views.push({ id: "portal", label: "Portal & Website CMS", icon: Globe, permission: 'portal.view' });
    }
    if (isGeneralAdmin || isSuperAdmin) {
      views.push({ id: "executive_oversight", label: "Executive System Oversight", icon: ShieldCheck });
    }

    return views;
  }, [hasPermission, isGeneralAdmin, isSuperAdmin]);

  // Set default view based on primary role
  const defaultViewId = useMemo(() => {
    if (isSuperAdmin || isGeneralAdmin) return "executive_oversight";
    if (isAdmissionOfficer) return "admissions";
    if (isFinanceOfficer) return "finance";
    if (isExaminationAdmin) return "examinations";
    if (isAcademicAdmin) return "academics";
    if (isAttendanceOfficer) return "attendance";
    if (isPortalAdmin) return "portal";
    return "staff_workspace";
  }, [isSuperAdmin, isGeneralAdmin, isAdmissionOfficer, isFinanceOfficer, isExaminationAdmin, isAcademicAdmin, isAttendanceOfficer, isPortalAdmin]);

  const [activeView, setActiveView] = useState<string>(defaultViewId);

  // If activeView is not among availableViews, fall back to first available
  const effectiveView = availableViews.some(v => v.id === activeView) ? activeView : availableViews[0]?.id || "staff_workspace";

  // Effective teacher fallback for staff features
  const effectiveTeacher: Teacher = teacher || {
    id: staffId,
    name: displayName,
    department: userDepartment,
    role: roles.join(", "),
    status: "Active",
    email: `${displayName.toLowerCase().replace(/[^a-z]/g, '')}@staff.ess.edu.ng`,
    phone: "+234 803 000 1234",
    address: "Emmanuel Secondary School Staff Quarters, Makurdi",
    subjects: ["Civic Education", "Mathematics"],
    assignedClasses: ["SSS 3A", "SSS 2B"],
    password: "password123",
    systemRoles: roles as any,
  };

  // Handler: Approve Admission Applicant
  const handleApproveApplicant = (appId: string) => {
    const app = admissionApps.find(a => a.id === appId);
    if (!app) return;

    const newStudentId = generateNextStudentId(students);
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

    logAuditEvent({
      action: `Approved admission application and registered student ${app.name}`,
      module: 'Admission',
      recordAffected: `Applicant ${app.id} (${app.name}) -> Assigned ID ${newStudentId}`,
      previousValue: "Under Review",
      newValue: "Approved & Enrolled"
    });

    notify(`Admission Approved for ${app.name}! Assigned ID: ${newStudentId}. Notification sent.`);
  };

  // Handler: Toggle Admission Portal
  const handleToggleAdmissionPortal = () => {
    const nextState = !portalOpen;
    setPortalOpen(nextState);
    logAuditEvent({
      action: `${nextState ? 'Opened' : 'Closed'} public admissions application portal`,
      module: 'Admission',
      recordAffected: "Admissions Portal Gateway",
      previousValue: portalOpen ? "Open" : "Closed",
      newValue: nextState ? "Open" : "Closed",
      severity: 'Warning'
    });
    notify(`Admissions portal is now ${nextState ? 'OPEN for new applicants' : 'CLOSED to incoming submissions'}.`);
  };

  // Handler: Save Role Changes for Staff (Super Admin feature)
  const handleSaveStaffRoles = (teacherId: string, updatedRoles: any) => {
    setTeachers(prev => prev.map(t => {
      if (t.id === teacherId) {
        return { ...t, systemRoles: updatedRoles };
      }
      return t;
    }));
    notify(`Roles & permissions updated successfully for staff member.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-sm animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg("")} className="text-white/80 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Profile & Role Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden flex items-center justify-center font-bold text-xl text-white flex-shrink-0 shadow-inner">
              {teacher?.passportUrl ? (
                <img src={teacher.passportUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.split(' ').map(n => n[0]).slice(0, 2).join('')
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading">{displayName}</h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/10">
                  {staffId}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1 flex items-center gap-2">
                <span>{teacher?.role || "Staff Member"}</span>
                <span>•</span>
                <span className="text-slate-300">{userDepartment}</span>
              </p>

              {/* Active Assigned Role Pills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {roles.map(role => {
                  const meta = ALL_ROLES_METADATA.find(m => m.id === role);
                  return (
                    <span 
                      key={role}
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 flex items-center gap-1 shadow-2xs"
                    >
                      <Shield size={12} className="text-indigo-300" />
                      {role}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <Link
              to="/dashboard/profile"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-white/20 transition-colors"
            >
              <UserCheck size={16} /> My Staff Profile
            </Link>
            {(isSuperAdmin || isGeneralAdmin) && (
              <Link
                to="/dashboard/audit-logs"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <ShieldCheck size={16} /> Security Audit Trail
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Role Departmental Tab Switcher */}
      {availableViews.length > 1 && (
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex gap-1.5 overflow-x-auto">
          {availableViews.map(view => {
            const isSelected = effectiveView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <view.icon size={15} />
                {view.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 
        ================================================================
        VIEW 1: STAFF & TEACHING WORKSPACE (Present for EVERY Admin/Staff)
        ================================================================
      */}
      {effectiveView === "staff_workspace" && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-indigo-900">Standard Staff & Academic Workspace</h3>
                <p className="text-xs text-indigo-700">
                  Assigned Teaching Classes: <span className="font-semibold">{effectiveTeacher.assignedClasses?.join(", ") || "SSS 3A"}</span> • Subjects: <span className="font-semibold">{effectiveTeacher.subjects?.join(", ") || "Mathematics"}</span>
                </p>
              </div>
            </div>
            <Link
              to="/dashboard/attendance"
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-2xs"
            >
              Class Attendance Register →
            </Link>
          </div>

          <TeacherDashboard 
            teacher={effectiveTeacher} 
            sessions={sessions} 
            newsList={newsList} 
          />
        </div>
      )}

      {/* 
        ================================================================
        VIEW 2: ADMISSION OFFICER DASHBOARD
        ================================================================
      */}
      {effectiveView === "admissions" && hasPermission('admission.view') && (
        <div className="space-y-6">
          {/* Portal Control Strip */}
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-white shadow-sm">
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                  <Sliders size={14} /> Admissions Gateway Status
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Public Application Portal is currently {portalOpen ? (
                    <span className="text-emerald-700 font-extrabold underline">OPEN for Candidates</span>
                  ) : (
                    <span className="text-rose-700 font-extrabold underline">CLOSED</span>
                  )}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Accepting applications for 2026/2027 Academic Session (Open: {admissionOpeningDate} to {admissionClosingDate})
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleToggleAdmissionPortal}
                  variant={portalOpen ? "outline" : "default"}
                  className={`text-xs font-bold gap-2 ${portalOpen ? 'border-rose-300 text-rose-700 hover:bg-rose-50' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                >
                  {portalOpen ? <Lock size={14} /> : <Unlock size={14} />}
                  {portalOpen ? "Close Admission Portal" : "Open Admission Portal"}
                </Button>
                <Link to="/dashboard/admissions">
                  <Button className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold">
                    Full Admissions Desk →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Admission Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Total Applicants</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{admissionApps.length}</p>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">↑ 18 new this week</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Pending Review</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {admissionApps.filter(a => a.status === 'Pending' || a.status === 'Under Review').length}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Require document verification</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Entrance Exam Scheduled</span>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {admissionApps.filter(a => a.examScore !== undefined || a.status === 'Approved').length + 8}
                </p>
                <p className="text-[11px] text-indigo-600 mt-1 font-medium">CBT Code: ESS-ENTR-2026</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Approved & Admitted</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {admissionApps.filter(a => a.status === 'Approved').length}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Letters ready for download</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applicants Roster with Quick Actions */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-200 py-3.5 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users size={16} className="text-emerald-600" />
                Recent Applicants Requiring Officer Action
              </CardTitle>
              <Link to="/dashboard/admissions?tab=applicants" className="text-xs font-bold text-emerald-700 hover:underline">
                View All {admissionApps.length} Applicants →
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/75 text-slate-600 text-xs font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Application Code</th>
                      <th className="py-3 px-4">Candidate Name</th>
                      <th className="py-3 px-4">Applying Class</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Entrance Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Officer Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {admissionApps.slice(0, 6).map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">
                          {app.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{app.name}</div>
                          <div className="text-xs text-slate-500">{app.phone}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{app.class}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            app.payment === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.payment}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {app.examScore ? `${app.examScore}%` : <span className="text-slate-400 font-normal">Pending</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {app.status !== 'Approved' && (
                            <Button 
                              onClick={() => handleApproveApplicant(app.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5"
                            >
                              Approve & Enroll
                            </Button>
                          )}
                          <Link to={`/dashboard/admissions?tab=applicants&search=${app.id}`}>
                            <Button variant="outline" className="text-xs h-8 px-2.5">
                              Review Dossier
                            </Button>
                          </Link>
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

      {/* 
        ================================================================
        VIEW 3: FINANCE & BURSAR DASHBOARD
        ================================================================
      */}
      {effectiveView === "finance" && hasPermission('finance.view') && (
        <div className="space-y-6">
          {/* Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Term Tuition Assessment</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">₦68,450,000</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">1,248 Registered Students</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Total Revenue Collected</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">₦48,920,000</p>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">71.4% Collection Rate</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Outstanding Tuition Debt</span>
                <p className="text-2xl font-bold text-rose-600 mt-1">₦19,530,000</p>
                <p className="text-[11px] text-rose-600 mt-1 font-medium">356 Students Pending Full Pay</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Term Expenditures</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">₦14,810,000</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Approved by Bursary</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Action Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/dashboard/finance?tab=payments">
              <Card className="hover:border-indigo-400 cursor-pointer transition-all shadow-2xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Verify Student Payment</h4>
                    <p className="text-xs text-slate-500">Reconcile bank teller or online transfer</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/finance?tab=receipts">
              <Card className="hover:border-indigo-400 cursor-pointer transition-all shadow-2xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Printer size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Issue Official Receipt</h4>
                    <p className="text-xs text-slate-500">Generate stamped PDF tuition receipt</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/finance?tab=reports">
              <Card className="hover:border-indigo-400 cursor-pointer transition-all shadow-2xs">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Bursary Financial Report</h4>
                    <p className="text-xs text-slate-500">Export income, expenditure & balance sheet</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Bursary Direct Route Button */}
          <div className="flex justify-end">
            <Link to="/dashboard/finance">
              <Button className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold">
                Open Full Bursary & Finance Suite →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 
        ================================================================
        VIEW 4: EXAMINATION ADMIN DASHBOARD
        ================================================================
      */}
      {effectiveView === "examinations" && hasPermission('examination.view') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Active Examinations</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">14 CBT Tests</p>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">First Term Exam Period</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">CBT Question Bank</span>
                <p className="text-2xl font-bold text-indigo-600 mt-1">1,840 Questions</p>
                <p className="text-[11px] text-indigo-600 mt-1 font-medium">Across 18 Subjects</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Pending Result Approvals</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">6 Subject Drafts</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Submitted by Teachers</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Published Broad-Sheets</span>
                <p className="text-2xl font-bold text-purple-600 mt-1">18 Classes</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Live on Result Checker</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles size={14} /> AI-Powered CBT Engine
              </div>
              <h3 className="text-lg font-bold">Launch Examination Controller & AI Question Suite</h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Generate WAEC/NECO aligned CBT test questions, schedule computer examinations with full-screen lockdown, proctor active submissions, and publish verified terminal result sheets.
              </p>
            </div>
            <Link to="/dashboard/examinations">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold whitespace-nowrap">
                Open Examination Center →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 
        ================================================================
        VIEW 5: ACADEMIC ADMIN DASHBOARD
        ================================================================
      */}
      {effectiveView === "academics" && hasPermission('academic.view') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Active Academic Session</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{sessions[0] || "2025/2026"}</p>
                <p className="text-[11px] text-indigo-600 mt-1 font-medium">First Term in Session</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Registered Classes & Arms</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">24 Arms</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">JSS 1 to SSS 3</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Curriculum Subjects</span>
                <p className="text-2xl font-bold text-indigo-600 mt-1">32 Subjects</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Approved by Ministry of Ed.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">Teacher Allocations</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">100% Allocated</p>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">All subjects staffed</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Link to="/dashboard/academics">
              <Button className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold">
                Open Academic Affairs Suite →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 
        ================================================================
        VIEW 6: ATTENDANCE & GATE COMMAND (Attendance Officer)
        ================================================================
      */}
      {effectiveView === "attendance" && hasPermission('attendance.view') && (
        <AttendanceOfficerDashboard />
      )}

      {/* 
        ================================================================
        VIEW 7: PORTAL & WEBSITE CMS (Portal Admin)
        ================================================================
      */}
      {effectiveView === "portal" && hasPermission('portal.view') && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Globe size={14} /> Portal & Public Website Management
              </div>
              <h3 className="text-lg font-bold">Official Website & Content Management Suite</h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Update homepage banners, publish school news, maintain photo gallery, edit contact details, and customize school social media channels.
              </p>
            </div>
            <Link to="/dashboard/portal-manager">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold whitespace-nowrap">
                Open Website CMS →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 
        ================================================================
        VIEW 8: EXECUTIVE SYSTEM OVERSIGHT (General Admin & Super Admin)
        ================================================================
      */}
      {effectiveView === "executive_oversight" && (isGeneralAdmin || isSuperAdmin) && (
        <div className="space-y-6">
          {/* Institutional Health Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Total Student Body</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{students.length}</p>
                  <p className="text-[11px] text-indigo-600 mt-0.5">Active Academic Roster</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Users size={22} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Academic & Non-Teaching Staff</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{teachers.length}</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Active Officers & Teachers</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Briefcase size={22} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Departmental Operations</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">9 Officers</p>
                  <p className="text-[11px] text-purple-600 mt-0.5">Role-Based Segregation</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <ShieldCheck size={22} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Security Audit Events</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{auditLogs.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Immutable Activity Log</p>
                </div>
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                  <Clock size={22} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff & Role Promotion Hub (Requirement 15: Never duplicate accounts) */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-200 py-3.5 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <UserCog size={16} className="text-indigo-600" />
                  Staff Role Assignment & Promotion Center
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Promote existing staff to specialized administrative roles without creating duplicate accounts or wiping out teaching classes.
                </p>
              </div>
              <Link to="/dashboard/teachers" className="text-xs font-bold text-indigo-600 hover:underline">
                Full Staff Directory →
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/75 text-slate-600 text-xs font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Staff ID</th>
                      <th className="py-3 px-4">Staff Name & Title</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Assigned Roles</th>
                      <th className="py-3 px-4">Teaching Allocation</th>
                      <th className="py-3 px-4 text-right">Role Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {teachers.slice(0, 7).map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-slate-700">{t.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-xs text-slate-500">{t.role}</div>
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-600">{t.department}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(t.systemRoles || ['Staff/Teacher']).map(r => (
                              <span key={r} className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {t.assignedClasses?.length ? (
                            <span>{t.assignedClasses.slice(0, 2).join(", ")} ({t.subjects?.slice(0, 1).join("")})</span>
                          ) : (
                            <span className="text-slate-400 italic">Administrative</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            onClick={() => setSelectedStaffForRoles(t)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 gap-1.5"
                          >
                            <Shield size={13} />
                            Assign / Promote Role
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Quick Shortcuts to Departmental Desks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/dashboard/admissions">
              <Button variant="outline" className="w-full text-xs font-semibold py-3 h-auto flex-col gap-1.5 hover:border-emerald-300">
                <FileText size={18} className="text-emerald-600" />
                <span>Admissions Desk</span>
              </Button>
            </Link>
            <Link to="/dashboard/finance">
              <Button variant="outline" className="w-full text-xs font-semibold py-3 h-auto flex-col gap-1.5 hover:border-amber-300">
                <DollarSign size={18} className="text-amber-600" />
                <span>Finance & Bursary</span>
              </Button>
            </Link>
            <Link to="/dashboard/examinations">
              <Button variant="outline" className="w-full text-xs font-semibold py-3 h-auto flex-col gap-1.5 hover:border-rose-300">
                <GraduationCap size={18} className="text-rose-600" />
                <span>Examinations Center</span>
              </Button>
            </Link>
            <Link to="/dashboard/academics">
              <Button variant="outline" className="w-full text-xs font-semibold py-3 h-auto flex-col gap-1.5 hover:border-indigo-300">
                <BookOpen size={18} className="text-indigo-600" />
                <span>Academic Affairs</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Staff Role Modal (Super Admin / General Admin) */}
      {selectedStaffForRoles && (
        <StaffRoleModal
          teacher={selectedStaffForRoles}
          isOpen={!!selectedStaffForRoles}
          onClose={() => setSelectedStaffForRoles(null)}
          onSave={handleSaveStaffRoles}
        />
      )}
    </div>
  );
}
