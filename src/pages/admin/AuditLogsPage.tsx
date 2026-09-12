import React, { useState } from "react";
import { useAuditLogs, AuditLogEntry, AuditModule, logAuditEvent } from "../../data/auditLogData";
import { 
  ShieldCheck, Search, Filter, Download, History, 
  Calendar, User, Laptop, FileText, CheckCircle, AlertTriangle, 
  RefreshCw, Sparkles, SlidersHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/src/components/ui";

const MODULES: (AuditModule | 'All')[] = [
  'All',
  'Admission',
  'Finance & Bursary',
  'Examinations & CBT',
  'Academics & Classes',
  'Attendance & Gate',
  'Portal & Website',
  'Staff & Roles',
  'Students & Records',
  'System Settings'
];

export default function AuditLogsPage() {
  const logs = useAuditLogs();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<AuditModule | 'All'>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<'All' | 'Info' | 'Warning' | 'Critical'>('All');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordAffected.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = selectedModule === 'All' || log.module === selectedModule;
    const matchesSeverity = selectedSeverity === 'All' || log.severity === selectedSeverity;

    return matchesSearch && matchesModule && matchesSeverity;
  });

  const exportCSV = () => {
    const headers = ["ID,Date,Time,User,Staff ID,Role,Module,Action,Record Affected,Previous Value,New Value,IP Address,Device"];
    const rows = filteredLogs.map(l => 
      `"${l.id}","${l.formattedDate}","${l.formattedTime}","${l.userName}","${l.userId}","${l.role}","${l.module}","${l.action.replace(/"/g, '""')}","${l.recordAffected.replace(/"/g, '""')}","${l.previousValue || ''}","${l.newValue || ''}","${l.ipAddress || ''}","${l.device || ''}"`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ESS_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck size={16} /> Compliance & Security Subsystem
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading">System Audit Trail & Activity Logs</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Real-time immutable log of administrative transactions, departmental approvals, role assignments, financial postings, and grade publications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={exportCSV}
            variant="outline" 
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm gap-2"
          >
            <Download size={16} /> Export Audit Log (.CSV)
          </Button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Logged Actions</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{logs.length}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <History size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Today's Transactions</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {logs.filter(l => l.formattedDate.includes("12 Sept 2026") || l.formattedDate.includes(new Date().getDate().toString())).length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Officers Tracked</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {new Set(logs.map(l => l.userId)).size}
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <User size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Critical Role Operations</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {logs.filter(l => l.severity === 'Critical').length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <ShieldCheck size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Search by staff name, ID, role, action, or affected record..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedModule}
                onChange={e => setSelectedModule(e.target.value as any)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium"
              >
                {MODULES.map(m => (
                  <option key={m} value={m}>
                    {m === 'All' ? 'All Departments & Modules' : m}
                  </option>
                ))}
              </select>
              <select
                value={selectedSeverity}
                onChange={e => setSelectedSeverity(e.target.value as any)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium"
              >
                <option value="All">All Severities</option>
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical (Role/System)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Records Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-200 py-3.5 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" />
            Audit Records Stream ({filteredLogs.length} events found)
          </CardTitle>
          <span className="text-xs text-slate-500 font-medium">Automatic tamper-evident recording</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/75 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Officer / User</th>
                  <th className="py-3 px-4">Department / Role</th>
                  <th className="py-3 px-4">Action Performed</th>
                  <th className="py-3 px-4">Affected Record</th>
                  <th className="py-3 px-4">Change Delta</th>
                  <th className="py-3 px-4">Terminal / IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No audit events match your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                        <div className="font-semibold text-slate-800">{log.formattedDate}</div>
                        <div>{log.formattedTime}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <div className="text-xs text-slate-500 font-mono">{log.userId}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {log.role}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">{log.module}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-slate-800 leading-snug">{log.action}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-700">
                        <span className="font-semibold">{log.recordAffected}</span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {log.previousValue || log.newValue ? (
                          <div className="space-y-0.5">
                            {log.previousValue && (
                              <div className="text-rose-600 line-through text-[11px] font-mono">
                                Prev: {log.previousValue}
                              </div>
                            )}
                            {log.newValue && (
                              <div className="text-emerald-700 font-semibold font-mono text-[11px]">
                                New: {log.newValue}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                        <div>{log.ipAddress}</div>
                        <div className="text-[10px] text-slate-400">{log.device}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
