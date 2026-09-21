import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Shield, 
  KeyRound, 
  Power, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  QrCode, 
  Settings, 
  Users, 
  FileText, 
  Activity, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Phone, 
  Mail,
  ExternalLink,
  Sliders,
  Save,
  Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTeachers, Teacher } from '../../data/teachersData';
import { 
  useAttendanceSettings, 
  useQRScanLogs, 
  useAttendance, 
  useStaffAttendance,
  getTodayAttendanceSummary,
  ensureStaffHasIdCard
} from '../../data/idCardAndAttendanceData';
import { useStudents } from '../../data/studentsData';
import { AttendanceOfficerPermissions } from '../../types/idCardAndAttendance';

const defaultOfficerPermissions: AttendanceOfficerPermissions = {
  canScanStudents: true,
  canScanStaff: true,
  canManualAttendance: true,
  canOverrideCheckOut: true,
  canEditRemarks: true,
  canExportReports: true,
  canViewAuditLogs: true
};

export const AttendanceOfficerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useTeachers();
  const [students] = useStudents();
  const [settings, setSettings] = useAttendanceSettings();
  const [scanLogs] = useQRScanLogs();
  const [studentAttendance] = useAttendance();
  const [staffAttendance] = useStaffAttendance();

  const [activeTab, setActiveTab] = useState<'officers' | 'activity' | 'settings' | 'reports'>('officers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Teacher | null>(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Chief Attendance Officer',
    department: 'Administration & Attendance',
    gender: 'Male' as 'Male' | 'Female',
    status: 'Active' as 'Active' | 'Inactive',
    permissions: { ...defaultOfficerPermissions }
  });

  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filter teachers with Attendance Officer role
  const attendanceOfficers = teachers.filter(t => 
    t.systemRoles?.includes('Attendance Officer') || 
    t.role?.toLowerCase().includes('attendance') ||
    t.department?.toLowerCase().includes('attendance')
  );

  const filteredOfficers = attendanceOfficers.filter(officer => {
    const matchesSearch = officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          officer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          officer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : (officer.status || 'Active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const summary = getTodayAttendanceSummary(teachers, students);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: 'officer' + Math.floor(100 + Math.random() * 900),
      role: 'Attendance Officer',
      department: 'Administration & Attendance',
      gender: 'Male',
      status: 'Active',
      permissions: { ...defaultOfficerPermissions }
    });
    setShowCreateModal(true);
  };

  const handleCreateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    // Generate next staff ID
    const nextNum = teachers.length + 1;
    const newId = `STF/2026/${String(nextNum).padStart(3, '0')}`;

    const newOfficer: Teacher = {
      id: newId,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim(),
      phone: formData.phone.trim() || '+234 800 000 0000',
      role: formData.role.trim() || 'Attendance Officer',
      department: formData.department.trim() || 'Administration & Attendance',
      gender: formData.gender,
      status: formData.status,
      address: 'Staff Quarters, Makurdi',
      assignedClasses: [],
      systemRoles: ['Attendance Officer'],
      subjects: ['Attendance Operations'],
      employmentDate: new Date().toISOString().split('T')[0]
    };

    setTeachers(prev => [newOfficer, ...prev]);
    ensureStaffHasIdCard(newOfficer);

    setShowCreateModal(false);
    showNotification(`Attendance Officer ${newOfficer.name} created successfully with ID: ${newId}!`);
  };

  const handleOpenEdit = (officer: Teacher) => {
    setSelectedOfficer(officer);
    setFormData({
      name: officer.name,
      email: officer.email,
      phone: officer.phone,
      password: officer.password || '',
      role: officer.role,
      department: officer.department,
      gender: (officer.gender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female',
      status: (officer.status as any) || 'Active',
      permissions: { ...defaultOfficerPermissions }
    });
    setShowEditModal(true);
  };

  const handleUpdateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficer) return;

    setTeachers(prev => prev.map(t => {
      if (t.id === selectedOfficer.id) {
        return {
          ...t,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          role: formData.role.trim(),
          department: formData.department.trim(),
          gender: formData.gender,
          status: formData.status
        };
      }
      return t;
    }));

    setShowEditModal(false);
    showNotification(`Attendance Officer ${formData.name} updated successfully!`);
  };

  const handleToggleStatus = (officer: Teacher) => {
    const newStatus = officer.status === 'Active' ? 'Inactive' : 'Active';
    setTeachers(prev => prev.map(t => {
      if (t.id === officer.id) {
        return { ...t, status: newStatus as any };
      }
      return t;
    }));
    showNotification(`Officer ${officer.name} is now ${newStatus}.`);
  };

  const handleOpenPasswordModal = (officer: Teacher) => {
    setSelectedOfficer(officer);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficer || !newPassword.trim()) {
      showNotification('Please enter a valid new password.', 'error');
      return;
    }

    setTeachers(prev => prev.map(t => {
      if (t.id === selectedOfficer.id) {
        return { ...t, password: newPassword.trim() };
      }
      return t;
    }));

    setShowPasswordModal(false);
    showNotification(`Password for ${selectedOfficer.name} has been reset successfully!`);
  };

  return (
    <div id="attendance-officer-management" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Super Admin Control
            </span>
            <span className="text-xs text-slate-500 font-medium">Role-Based Attendance Access</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <UserCheck className="w-7 h-7 text-emerald-600" />
            Attendance Officer Management
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Authorize attendance personnel, control scanning permissions, audit daily check-in activity, and manage work hours. All scanning tools are strictly partitioned inside the Attendance Officer Dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/attendance-officer')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors border border-slate-300"
          >
            <ExternalLink className="w-4 h-4 text-slate-600" />
            Launch Officer Dashboard
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Attendance Officer
          </button>
        </div>
      </div>

      {/* Notifications */}
      {feedbackMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium border animate-fadeIn ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Quick Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Officers</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{attendanceOfficers.length}</div>
          <p className="text-xs text-slate-500 mt-1">
            {attendanceOfficers.filter(o => (o.status || 'Active') === 'Active').length} Active &bull; {attendanceOfficers.filter(o => o.status === 'Inactive').length} Inactive
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Total Scans</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {summary.studentRecords.length + summary.staffRecords.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.studentRecords.length} Students &bull; {summary.staffRecords.length} Staff
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Attendance</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.studentsAttendanceRate}%</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {summary.studentsPresentCount} of {summary.totalStudentsCount} Present
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Attendance</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.staffAttendanceRate}%</div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.staffPresentCount + summary.staffLateCount} of {summary.totalStaffCount} Present
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-sm gap-2">
        <button
          onClick={() => setActiveTab('officers')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'officers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Attendance Officers ({attendanceOfficers.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'activity'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          Live Scan Audit Log ({scanLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          School Hours &amp; Late Cutoffs
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Attendance Executive Reports
        </button>
      </div>

      {/* TAB 1: Officers List */}
      {activeTab === 'officers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search officer by name, ID, or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive / Suspended</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Officer Profile</th>
                    <th className="px-5 py-3.5">Designation &amp; Dept</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">Account Status</th>
                    <th className="px-5 py-3.5">Active Permissions</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOfficers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="font-medium text-slate-600">No Attendance Officers found</p>
                        <p className="text-xs text-slate-400 mt-1">Click "Create Attendance Officer" above to add staff with attendance privileges.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOfficers.map(officer => {
                      const isActive = (officer.status || 'Active') === 'Active';
                      return (
                        <tr key={officer.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0">
                                {officer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{officer.name}</div>
                                <div className="text-xs font-mono text-slate-500">{officer.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">{officer.role || 'Attendance Officer'}</div>
                            <div className="text-xs text-slate-500">{officer.department || 'Administration'}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-xs flex items-center gap-1.5 text-slate-700">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {officer.email}
                            </div>
                            <div className="text-xs flex items-center gap-1.5 text-slate-500 mt-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {officer.phone}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isActive 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-medium">
                                Student Scan
                              </span>
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[11px] font-medium">
                                Staff Scan
                              </span>
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[11px] font-medium">
                                Manual Entry
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-medium">
                                Export Reports
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(officer)}
                                title="Edit Officer"
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenPasswordModal(officer)}
                                title="Reset Password"
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(officer)}
                                title={isActive ? 'Deactivate Officer' : 'Activate Officer'}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isActive 
                                    ? 'text-rose-500 hover:bg-rose-50' 
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Live Scan Audit Log */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Attendance Operations Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time chronological log of all QR scans, card verifications, and manual attendance entries performed across all gates and classrooms.
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">
              Live Synchronized
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Person Scanned</th>
                  <th className="px-4 py-3">Type / Class / Dept</th>
                  <th className="px-4 py-3">Scanned By Officer</th>
                  <th className="px-4 py-3">Scan Purpose</th>
                  <th className="px-4 py-3">Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scanLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No scans logged yet today.
                    </td>
                  </tr>
                ) : (
                  scanLogs.slice(0, 30).map((log, idx) => (
                    <tr key={`${log.id}_${idx}`} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-xs font-mono text-slate-700">{log.timestamp}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{log.studentName}</div>
                        <div className="text-xs text-slate-500">{log.studentId}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-medium text-slate-800">{log.studentClass}</span>
                        <span className="text-slate-400 block">{log.personType === 'staff' ? 'Staff Member' : 'Student'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 text-xs">{log.scannedByStaffName}</div>
                        <div className="text-[11px] text-slate-400">{log.scannedByStaffId}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{log.purpose}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          log.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'Card Deactivated'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: School Hours & Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              School Hours &amp; Automatic Attendance Rules
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure official arrival times, late cutoff thresholds, and dismissal checkout rules. Scans after the cutoff will automatically mark individuals as "Late".
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Hours */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Student Schedule Configuration
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Morning Assembly / Gate Opening
                  </label>
                  <input
                    type="time"
                    value={settings.schoolStartTime}
                    onChange={e => setSettings(s => ({ ...s, schoolStartTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-500">Normal resumption begins (default: 07:45 AM).</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 text-rose-700">
                    Student Late Cutoff Time *
                  </label>
                  <input
                    type="time"
                    value={settings.studentLateCutoff}
                    onChange={e => setSettings(s => ({ ...s, studentLateCutoff: e.target.value }))}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-rose-500 font-semibold"
                  />
                  <span className="text-[11px] text-slate-500">Any student scanning after this exact time will be automatically recorded as <strong>Late</strong>.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Dismissal / Closing Time
                  </label>
                  <input
                    type="time"
                    value={settings.studentDismissalTime}
                    onChange={e => setSettings(s => ({ ...s, studentDismissalTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Staff Hours */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Staff &amp; Teacher Work Hours
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Staff Check-In Start Time
                  </label>
                  <input
                    type="time"
                    value={settings.staffStartTime}
                    onChange={e => setSettings(s => ({ ...s, staffStartTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 text-rose-700">
                    Staff Late Arrival Cutoff *
                  </label>
                  <input
                    type="time"
                    value={settings.staffLateCutoff}
                    onChange={e => setSettings(s => ({ ...s, staffLateCutoff: e.target.value }))}
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-rose-500 font-semibold"
                  />
                  <span className="text-[11px] text-slate-500">Staff scanning after this time will be marked as Late.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Staff Work Dismissal Time
                  </label>
                  <input
                    type="time"
                    value={settings.staffDismissalTime}
                    onChange={e => setSettings(s => ({ ...s, staffDismissalTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Automated Check-In vs Check-Out */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Automatic Check-In vs Check-Out Transition Threshold
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Check-Out Switchover Time (24H)
                  </label>
                  <input
                    type="time"
                    value={settings.checkOutThreshold}
                    onChange={e => setSettings(s => ({ ...s, checkOutThreshold: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Scans <strong>before</strong> this threshold are automatically recorded as <strong>Check-In</strong>. Scans <strong>after</strong> this threshold for existing arrivals are automatically recorded as <strong>Check-Out</strong>.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.preventDuplicatePerDay}
                      onChange={e => setSettings(s => ({ ...s, preventDuplicatePerDay: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-700 font-medium">
                      Prevent accidental duplicate scans for same person on the same date/session
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableAudioFeedback}
                      onChange={e => setSettings(s => ({ ...s, enableAudioFeedback: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-700 font-medium">
                      Play instant auditory confirmation chime upon scan
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableVibrationFeedback}
                      onChange={e => setSettings(s => ({ ...s, enableVibrationFeedback: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-700 font-medium">
                      Haptic vibration feedback on mobile scanning devices
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => showNotification('School attendance hours & rules saved successfully!')}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Reports Overview */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Executive Attendance Oversight Summary
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Aggregated daily rates and institutional indicators. Comprehensive export tools (PDF, CSV, Excel) are located inside the Attendance Officer Dashboard.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/attendance-officer?section=reports')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-300"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Full Export Suite
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Today's Student Roster Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-slate-600">Total Enrolled Students</span>
                  <span className="font-bold text-slate-900">{summary.totalStudentsCount}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-emerald-700 font-medium">Present (On Time)</span>
                  <span className="font-bold text-emerald-700">{summary.studentPresentCount}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-amber-700 font-medium">Late Arrivals</span>
                  <span className="font-bold text-amber-700">{summary.studentLateCount}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-blue-700 font-medium">Excused / Approved Leaves</span>
                  <span className="font-bold text-blue-700">{summary.studentExcusedCount}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-rose-700 font-medium">Absent Unexcused</span>
                  <span className="font-bold text-rose-700">{summary.studentsAbsentCount}</span>
                </div>
              </div>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Today's Academic &amp; Non-Academic Staff</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-slate-600">Total Employed Staff</span>
                  <span className="font-bold text-slate-900">{summary.totalStaffCount}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-emerald-700 font-medium">Checked In (On Time)</span>
                  <span className="font-bold text-emerald-700">{summary.staffPresentCount}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-amber-700 font-medium">Late Arrivals</span>
                  <span className="font-bold text-amber-700">{summary.staffLateCount}</span>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-200">
                  <span className="text-blue-700 font-medium">Official Leave</span>
                  <span className="font-bold text-blue-700">{summary.staffOnLeaveCount}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-rose-700 font-medium">Absent / Not Scanned</span>
                  <span className="font-bold text-rose-700">{summary.staffAbsentCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE OFFICER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Create Attendance Officer
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOfficer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Officer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Emmanuel Terhemba"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="officer@ess.edu.ng"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 703 000 0000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Login Password *
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Officer will use this password to sign into the Attendance Officer Dashboard.</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Officer Permissions
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.permissions.canScanStudents} readOnly className="w-3.5 h-3.5 text-emerald-600 rounded" />
                    Scan Student ID
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.permissions.canScanStaff} readOnly className="w-3.5 h-3.5 text-emerald-600 rounded" />
                    Scan Staff ID
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.permissions.canManualAttendance} readOnly className="w-3.5 h-3.5 text-emerald-600 rounded" />
                    Manual Attendance
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.permissions.canExportReports} readOnly className="w-3.5 h-3.5 text-emerald-600 rounded" />
                    Export Reports
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Create Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT OFFICER MODAL */}
      {showEditModal && selectedOfficer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                Edit Attendance Officer: {selectedOfficer.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOfficer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showPasswordModal && selectedOfficer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                Reset Password: {selectedOfficer.name}
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <p className="text-xs text-slate-500">
                Enter a new secure password for Attendance Officer <strong>{selectedOfficer.name}</strong> ({selectedOfficer.email}).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 shadow-sm"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
