import React, { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Edit, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  BarChart2,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar,
  Legend
} from "recharts";
import { useStudents, CLASSES } from "../../data/studentsData";
import { 
  useAttendance, 
  getTodayDateString, 
  recordStudentAttendance 
} from "../../data/idCardAndAttendanceData";
import { AttendanceStatus, AttendanceRecord } from "../../types/idCardAndAttendance";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui";

export default function AttendanceDashboard() {
  const [students] = useStudents();
  const [attendanceRecords, setAttendanceRecords] = useAttendance();

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "absent" | "late">("daily");
  const [successToast, setSuccessToast] = useState<string>("");

  // Filter records for the selected date
  const dateRecords = useMemo(() => {
    return attendanceRecords.filter(r => r.date === selectedDate);
  }, [attendanceRecords, selectedDate]);

  // Merge registered active students with today's attendance records to discover absent students
  const activeStudents = useMemo(() => {
    return students.filter(s => s.status === "Active" || !s.status);
  }, [students]);

  // Map each active student to their attendance status on the selected date
  const studentAttendanceMap = useMemo(() => {
    return activeStudents.map(student => {
      const rec = dateRecords.find(r => r.studentId === student.id);
      return {
        student,
        record: rec || null,
        status: (rec?.status || "Absent") as AttendanceStatus,
        time: rec?.time || "--:--",
        method: rec?.method || "system",
        note: rec?.note || ""
      };
    });
  }, [activeStudents, dateRecords]);

  // Overall Statistics for the selected date
  const totalStudents = activeStudents.length;
  const presentCount = studentAttendanceMap.filter(s => s.status === "Present").length;
  const lateCount = studentAttendanceMap.filter(s => s.status === "Late").length;
  const excusedCount = studentAttendanceMap.filter(s => s.status === "Excused").length;
  const absentCount = studentAttendanceMap.filter(s => s.status === "Absent").length;
  const attendanceRate = totalStudents ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

  // Filtered List based on user selections
  const filteredList = useMemo(() => {
    return studentAttendanceMap.filter(({ student, status }) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === "All" || student.class === selectedClass;
      const matchesStatus = selectedStatus === "All" || status === selectedStatus;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [studentAttendanceMap, searchTerm, selectedClass, selectedStatus]);

  // Class by Class Attendance Breakdown
  const classBreakdown = useMemo(() => {
    const map: Record<string, { total: number; present: number; rate: number }> = {};
    activeStudents.forEach(s => {
      if (!map[s.class]) map[s.class] = { total: 0, present: 0, rate: 0 };
      map[s.class].total++;
    });
    studentAttendanceMap.forEach(item => {
      if (item.status === "Present" || item.status === "Late") {
        if (map[item.student.class]) {
          map[item.student.class].present++;
        }
      }
    });
    return Object.entries(map).map(([className, data]) => ({
      className,
      total: data.total,
      present: data.present,
      rate: data.total ? Math.round((data.present / data.total) * 100) : 0
    }));
  }, [activeStudents, studentAttendanceMap]);

  // Mock Weekly/Monthly Trend Data
  const weeklyTrendData = [
    { day: "Mon", present: 94, late: 3, absent: 3 },
    { day: "Tue", present: 96, late: 2, absent: 2 },
    { day: "Wed", present: 92, late: 4, absent: 4 },
    { day: "Thu", present: 97, late: 2, absent: 1 },
    { day: "Fri", present: presentCount || 95, late: lateCount || 3, absent: absentCount || 2 },
  ];

  // Quick action: manually toggle or correct attendance status
  const handleQuickStatusChange = (student: any, newStatus: AttendanceStatus) => {
    const staffId = localStorage.getItem("loggedInUserId") || "ADM/2026/001";
    const res = recordStudentAttendance({
      student,
      status: newStatus,
      method: "manual",
      staffUser: { id: staffId, name: "Attendance Officer" },
      forceOverride: true
    });

    setSuccessToast(`Attendance for ${student.name} updated to "${newStatus}"`);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Admission No", "Student Name", "Class", "Date", "Time", "Status", "Method", "Parent Phone"];
    const rows = filteredList.map(({ student, status, time, method }) => [
      `"${student.id}"`,
      `"${student.name}"`,
      `"${student.class}"`,
      `"${selectedDate}"`,
      `"${time}"`,
      `"${status}"`,
      `"${method}"`,
      `"${student.parentNumber || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ESS_Attendance_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <CheckCircle2 size={20} />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
              Emmanuel Secondary School • Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">Session: 2025/2026</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 mt-1">
            Student Attendance Management & Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time tracking of student presence, late arrivals, absences, and class participation rates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="text-xs gap-1.5 shadow-sm"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            Export CSV Report
          </Button>
          <Button 
            onClick={() => window.print()}
            variant="outline" 
            className="text-xs gap-1.5 shadow-sm"
          >
            <Printer size={15} />
            Print Roll Call
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{attendanceRate}%</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <TrendingUp size={12} />
                {(presentCount + lateCount)} of {totalStudents} Active Students
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marked Present</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{presentCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Scanned on time</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Late Arrivals</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{lateCount}</h3>
              <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Arrived after assembly</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Absent Students</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{absentCount}</h3>
              <p className="text-[11px] text-rose-700 font-semibold mt-0.5">Requires notification</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <UserX size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        {/* Tab buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Button
            size="sm"
            variant={activeTab === "daily" ? "brand" : "outline"}
            onClick={() => setActiveTab("daily")}
            className="text-xs font-bold"
          >
            Daily Roll Call ({filteredList.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === "weekly" ? "brand" : "outline"}
            onClick={() => setActiveTab("weekly")}
            className="text-xs font-bold"
          >
            Weekly Trends
          </Button>
          <Button
            size="sm"
            variant={activeTab === "absent" ? "brand" : "outline"}
            onClick={() => {
              setActiveTab("absent");
              setSelectedStatus("Absent");
            }}
            className={`text-xs font-bold ${activeTab === "absent" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
          >
            Absent Students ({absentCount})
          </Button>
          <Button
            size="sm"
            variant={activeTab === "late" ? "brand" : "outline"}
            onClick={() => {
              setActiveTab("late");
              setSelectedStatus("Late");
            }}
            className={`text-xs font-bold ${activeTab === "late" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
          >
            Late Arrivals ({lateCount})
          </Button>
        </div>

        {/* Date & Class Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <CalendarIcon size={14} className="text-slate-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-slate-700 outline-none text-xs"
            />
          </div>

          {/* Class Select */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
          >
            <option value="All">All Classes</option>
            {CLASSES.filter(c => !c.includes("Graduated")).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="Excused">Excused</option>
          </select>
        </div>
      </div>

      {/* TAB CONTENT: WEEKLY TRENDS */}
      {activeTab === "weekly" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 size={18} className="text-brand-600" />
                5-Day Attendance Distribution (%)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrendData}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tickLine={false} />
                  <YAxis domain={[80, 100]} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="present" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" name="Present (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Class Performance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-auto max-h-72 pr-2">
              {classBreakdown.map(cb => (
                <div key={cb.className} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{cb.className}</span>
                    <span className="text-brand-600">{cb.rate}% ({cb.present}/{cb.total})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        cb.rate >= 90 ? 'bg-emerald-500' : cb.rate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${cb.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: DAILY ATTENDANCE ROSTER */}
      {(activeTab === "daily" || activeTab === "absent" || activeTab === "late") && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="Search by student name or admission ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{filteredList.length}</span> students for {selectedDate}
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Student Information</th>
                  <th className="px-4 py-3.5">Admission No.</th>
                  <th className="px-4 py-3.5">Class</th>
                  <th className="px-4 py-3.5">Check-in Time</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Verification</th>
                  <th className="px-6 py-3.5 text-right">Quick Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map(({ student, status, time, method }, idx) => (
                  <tr key={`${student.id}_${idx}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 overflow-hidden shrink-0 border border-slate-200">
                          {student.passportUrl ? (
                            <img src={student.passportUrl} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{student.name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Phone size={10} />
                            {student.parentNumber || "No parent contact"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">{student.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{student.class}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{time}</td>
                    
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        status === 'Present' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        status === 'Late' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        status === 'Excused' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {status === 'Present' && <CheckCircle2 size={11} />}
                        {status === 'Late' && <Clock size={11} />}
                        {status === 'Absent' && <UserX size={11} />}
                        {status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500 text-[10px]">
                      {method === 'qr_scan' ? (
                        <span className="text-brand-600 font-semibold">⚡ Verified QR</span>
                      ) : method === 'manual' ? (
                        <span>✍️ Manual Correction</span>
                      ) : (
                        <span className="text-slate-400">Not Scanned</span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleQuickStatusChange(student, "Present")}
                          className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
                            status === "Present" 
                              ? 'bg-emerald-600 text-white border-emerald-600' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title="Mark Present"
                        >
                          P
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(student, "Late")}
                          className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
                            status === "Late" 
                              ? 'bg-amber-600 text-white border-amber-600' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                          title="Mark Late"
                        >
                          L
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(student, "Excused")}
                          className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
                            status === "Excused" 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                          title="Mark Excused"
                        >
                          E
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(student, "Absent")}
                          className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
                            status === "Absent" 
                              ? 'bg-rose-600 text-white border-rose-600' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                          title="Mark Absent"
                        >
                          A
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No students found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
