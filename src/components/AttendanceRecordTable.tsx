import React from "react";
import { StudentAttendanceSummary } from "../data/attendanceResultConnector";
import { CalendarCheck, Clock, Award } from "lucide-react";

interface AttendanceRecordTableProps {
  attendance: StudentAttendanceSummary;
  compact?: boolean;
  className?: string;
  showBadge?: boolean;
}

export function AttendanceRecordTable({
  attendance,
  compact = false,
  className = "",
  showBadge = true,
}: AttendanceRecordTableProps) {
  if (compact) {
    return (
      <div className={`border border-black text-[10px] bg-white ${className}`}>
        <div className="bg-slate-100 font-bold border-b border-black px-2 py-1 flex items-center justify-between">
          <span className="uppercase tracking-wider">Attendance Record</span>
          <span className="text-emerald-700 font-extrabold">{attendance.attendancePercentage}%</span>
        </div>
        <table className="w-full border-collapse text-left">
          <tbody>
            <tr className="border-b border-black">
              <td className="p-1 font-semibold border-r border-black">Total School Days</td>
              <td className="p-1 text-right font-bold">{attendance.totalSchoolDays}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1 font-semibold border-r border-black">Days Present</td>
              <td className="p-1 text-right font-bold text-emerald-700">{attendance.daysPresent}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1 font-semibold border-r border-black">Days Absent</td>
              <td className="p-1 text-right font-bold text-rose-700">{attendance.daysAbsent}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1 font-semibold border-r border-black">Days Late</td>
              <td className="p-1 text-right font-bold text-amber-700">{attendance.daysLate}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1 font-semibold border-r border-black">Days in School</td>
              <td className="p-1 text-right font-bold">{attendance.daysInSchool}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1 font-semibold border-r border-black">Days Out of School</td>
              <td className="p-1 text-right font-bold">{attendance.daysOutSchool}</td>
            </tr>
            <tr className="bg-slate-50 font-bold">
              <td className="p-1 border-r border-black">Attendance Percentage</td>
              <td className="p-1 text-right text-emerald-800">{attendance.attendancePercentage}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xs ${className}`}>
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck size={16} className="text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Attendance Record</h4>
        </div>
        {showBadge && (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Award size={12} /> {attendance.attendancePercentage}% Rate
          </span>
        )}
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-left">
            <th className="p-2.5 border-r border-slate-300">Attendance Parameter</th>
            <th className="p-2.5 text-right w-36">Number / Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          <tr className="hover:bg-slate-50">
            <td className="p-2.5 font-medium text-slate-800">Total School Days</td>
            <td className="p-2.5 text-right font-bold text-slate-900 font-mono">{attendance.totalSchoolDays} Days</td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="p-2.5 font-medium text-slate-800">Days Present</td>
            <td className="p-2.5 text-right font-bold text-emerald-700 font-mono">{attendance.daysPresent} Days</td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="p-2.5 font-medium text-slate-800">Days Absent</td>
            <td className="p-2.5 text-right font-bold text-rose-700 font-mono">{attendance.daysAbsent} Days</td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="p-2.5 font-medium text-slate-800">Days Late</td>
            <td className="p-2.5 text-right font-bold text-amber-700 font-mono">{attendance.daysLate} Days</td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="p-2.5 font-medium text-slate-800">Days in School</td>
            <td className="p-2.5 text-right font-bold text-indigo-700 font-mono">{attendance.daysInSchool} Days</td>
          </tr>
          <tr className="hover:bg-slate-50">
            <td className="p-2.5 font-medium text-slate-800">Days Out of School</td>
            <td className="p-2.5 text-right font-bold text-slate-600 font-mono">{attendance.daysOutSchool} Days</td>
          </tr>
          <tr className="bg-emerald-50/50 font-bold border-t border-slate-300">
            <td className="p-2.5 text-slate-900">Attendance Percentage</td>
            <td className="p-2.5 text-right text-emerald-800 font-mono text-sm">{attendance.attendancePercentage}%</td>
          </tr>
        </tbody>
      </table>
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 italic">
        * Figures dynamically aggregated from official Daily Rollcall & QR Scan Records for {attendance.session} ({attendance.term}).
      </div>
    </div>
  );
}
