import React, { useState } from "react";
import { Clock, Filter, FileText, Download, UserCheck, Calendar } from "lucide-react";
import { useStaffAttendance, getTodayDateString } from "../../data/idCardAndAttendanceData";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui";

export default function StaffAttendanceReports() {
  const [records] = useStaffAttendance();
  const [dateFilter, setDateFilter] = useState(getTodayDateString());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = records.filter(record => {
    const matchesDate = !dateFilter || record.date === dateFilter;
    const matchesSearch = !searchQuery || 
      record.staffName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      record.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDate && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <FileText className="text-brand-600" size={24} />
            Staff Attendance Reports
          </h1>
          <p className="text-slate-500 text-sm mt-1">View and export daily check-in/out records for all staff members.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 shadow-sm border-brand-200 text-brand-700 bg-brand-50/50 hover:bg-brand-50">
            <Download size={16} />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2 shadow-sm">
            <Download size={16} />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="mb-6 shadow-sm border-slate-200">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <Input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-10 border-slate-200 text-sm font-medium"
            />
          </div>
          <div className="flex-1 w-full">
            <Input 
              placeholder="Search by Name, ID, or Department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 border-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record: any) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{record.staffName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{record.staffId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                        {record.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {record.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-emerald-600 flex items-center gap-1 text-xs">
                        <Clock size={12} /> {record.checkInTime}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {record.checkOutTime ? (
                        <span className="font-semibold text-amber-600 flex items-center gap-1 text-xs">
                          <Clock size={12} /> {record.checkOutTime}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        <UserCheck size={10} /> {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Calendar className="mx-auto mb-3 opacity-50" size={32} />
                    <p className="font-medium text-slate-500">No attendance records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
