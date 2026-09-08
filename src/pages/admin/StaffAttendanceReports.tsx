import React, { useState, useMemo } from "react";
import { 
  Clock, 
  Filter, 
  FileText, 
  Download, 
  UserCheck, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Printer, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useStaffAttendance, useAttendance, useQRScanLogs, getTodayDateString } from "../../data/idCardAndAttendanceData";
import { useTeachers, DEPARTMENTS } from "../../data/teachersData";
import { useStudents, CLASSES } from "../../data/studentsData";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui";

export default function StaffAttendanceReports() {
  const [staffRecords] = useStaffAttendance();
  const [studentRecords] = useAttendance();
  const [scanLogs] = useQRScanLogs();
  const [teachers] = useTeachers();
  const [students] = useStudents();

  // Filters state
  const [dateFilter, setDateFilter] = useState(getTodayDateString());
  const [roleFilter, setRoleFilter] = useState<"all" | "staff" | "student">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"attendance" | "audit">("attendance");

  // Filtered Unified Records
  const unifiedData = useMemo(() => {
    const list: Array<{
      id: string;
      personId: string;
      name: string;
      role: 'staff' | 'student';
      departmentOrClass: string;
      date: string;
      checkInTime: string;
      checkOutTime?: string;
      status: string;
      method: string;
      note?: string;
      scannedBy?: string;
    }> = [];

    // Add Staff records
    if (roleFilter === "all" || roleFilter === "staff") {
      staffRecords.forEach(rec => {
        const teacher = teachers.find(t => t.id === rec.staffId);
        const dept = rec.department || teacher?.department || "Academic Staff";
        
        if (departmentFilter !== "all" && dept !== departmentFilter) return;

        list.push({
          id: rec.id,
          personId: rec.staffId,
          name: rec.staffName || teacher?.name || rec.staffId,
          role: 'staff',
          departmentOrClass: dept,
          date: rec.date,
          checkInTime: rec.checkInTime || "--:--",
          checkOutTime: rec.checkOutTime,
          status: rec.status,
          method: rec.method || "qr_scan",
          note: rec.note,
          scannedBy: rec.scannedByStaffName
        });
      });
    }

    // Add Student records
    if (roleFilter === "all" || roleFilter === "student") {
      studentRecords.forEach(rec => {
        const student = students.find(s => s.id === rec.studentId);
        const studentClass = rec.class || student?.class || "N/A";

        if (classFilter !== "all" && studentClass !== classFilter) return;

        list.push({
          id: rec.id,
          personId: rec.studentId,
          name: rec.studentName || student?.name || rec.studentId,
          role: 'student',
          departmentOrClass: `Class: ${studentClass}`,
          date: rec.date,
          checkInTime: rec.time || "--:--",
          status: rec.status,
          method: rec.method || "qr_scan",
          note: rec.note,
          scannedBy: rec.scannedByStaffName
        });
      });
    }

    return list.filter(item => {
      const matchesDate = !dateFilter || item.date === dateFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.personId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.departmentOrClass.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDate && matchesStatus && matchesSearch;
    });
  }, [staffRecords, studentRecords, teachers, students, roleFilter, departmentFilter, classFilter, dateFilter, statusFilter, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Person ID", "Name", "Role", "Department/Class", "Date", "Check In", "Check Out", "Status", "Method", "Scanned By", "Note"];
    const rows = unifiedData.map(r => [
      r.personId,
      `"${r.name}"`,
      r.role.toUpperCase(),
      `"${r.departmentOrClass}"`,
      r.date,
      r.checkInTime,
      r.checkOutTime || "",
      r.status,
      r.method,
      `"${r.scannedBy || ''}"`,
      `"${r.note || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Complete_Attendance_Report_${dateFilter || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <FileText className="text-brand-600" size={26} />
            Institutional Attendance Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete institutional check-in logs and audit trail for staff and students.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleExportCSV} 
            className="gap-2 shadow-sm border-brand-200 text-brand-700 bg-brand-50/50 hover:bg-brand-50 h-10 text-xs font-bold"
          >
            <Download size={15} />
            Export CSV / Excel
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint} 
            className="gap-2 shadow-sm h-10 text-xs font-bold"
          >
            <Printer size={15} />
            Print Report
          </Button>
        </div>
      </div>

      {/* Filter Control Box */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4 space-y-3">
          {/* Top Row: Date, Role, Department/Class, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Date */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Date</label>
              <Input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-9 text-xs border-slate-300 font-semibold"
              />
            </div>

            {/* Role Filter: Staff vs Student */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Person Role</label>
              <select
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
              >
                <option value="all">All (Staff & Students)</option>
                <option value="staff">Staff Only</option>
                <option value="student">Students Only</option>
              </select>
            </div>

            {/* Department (for staff) */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Staff Department</label>
              <select
                disabled={roleFilter === "student"}
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 disabled:opacity-50"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.filter(d => d !== "All Departments").map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Class (for students) */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Student Class</label>
              <select
                disabled={roleFilter === "staff"}
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 disabled:opacity-50"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">All Classes</option>
                {CLASSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Attendance Status</label>
              <select
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Search query & view toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="relative w-full sm:w-96">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search by name, ID number, department or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs border-slate-300"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
                <button
                  onClick={() => setViewMode("attendance")}
                  className={`px-3 py-1 rounded-md transition-all ${viewMode === "attendance" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Attendance Log ({unifiedData.length})
                </button>
                <button
                  onClick={() => setViewMode("audit")}
                  className={`px-3 py-1 rounded-md transition-all ${viewMode === "audit" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  QR Audit Scans ({scanLogs.length})
                </button>
              </div>

              {(dateFilter || searchQuery || roleFilter !== "all" || departmentFilter !== "all" || classFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFilter(getTodayDateString());
                    setRoleFilter("all");
                    setDepartmentFilter("all");
                    setClassFilter("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="h-8 text-[11px] text-slate-600"
                >
                  <RefreshCw size={12} className="mr-1" /> Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {viewMode === "attendance" ? (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Person Details</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Department / Class</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Check In</th>
                  <th className="px-5 py-3.5">Check Out</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Officer in Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {unifiedData.length > 0 ? (
                  unifiedData.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{record.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{record.personId}</div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          record.role === 'staff' 
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {record.role === 'staff' ? <Briefcase size={10} /> : <GraduationCap size={10} />}
                          {record.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                        {record.departmentOrClass}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {record.date}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 font-mono">
                          {record.checkInTime}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {record.checkOutTime ? (
                          <span className="font-bold text-slate-600 font-mono">
                            {record.checkOutTime}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          record.status === 'Present' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : record.status === 'Late' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                        {record.method === 'qr_scan' ? '📷 QR Scan' : '✍️ Manual'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {record.scannedBy || 'System Admin'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No attendance records found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Scanned Person</th>
                  <th className="px-5 py-3.5">ID / Admission</th>
                  <th className="px-5 py-3.5">Department / Class</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5">Officer</th>
                  <th className="px-5 py-3.5">Terminal Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {scanLogs.length > 0 ? (
                  scanLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          log.personType === 'staff' 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {log.personType || 'student'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {log.studentName}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {log.studentId}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {log.studentClass}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'Verified' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {log.scannedByStaffName}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {log.deviceInfo || 'Camera Terminal'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No QR scan audit records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
