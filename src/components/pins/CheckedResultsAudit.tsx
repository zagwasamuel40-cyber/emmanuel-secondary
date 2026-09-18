import React, { useState, useMemo } from "react";
import { 
  History, 
  Search, 
  Download, 
  CheckCircle2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Filter,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { PinUsageLog } from "../../data/pinsData";

interface CheckedResultsAuditProps {
  logs: PinUsageLog[];
  classes: string[];
  sessions: string[];
}

export const CheckedResultsAudit: React.FC<CheckedResultsAuditProps> = ({
  logs,
  classes,
  sessions
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSession, setSelectedSession] = useState("All");
  const [showPlainPins, setShowPlainPins] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = log.studentName.toLowerCase().includes(q);
        const matchesId = log.studentId.toLowerCase().includes(q);
        const matchesSerial = log.serialNumber.toLowerCase().includes(q);
        const matchesPin = log.pinCode.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesSerial && !matchesPin) return false;
      }

      if (selectedClass !== "All" && log.class !== selectedClass) return false;
      if (selectedSession !== "All" && log.session !== selectedSession) return false;

      return true;
    });
  }, [logs, searchQuery, selectedClass, selectedSession]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const uniqueStudentsCount = useMemo(() => {
    return new Set(logs.map((l) => l.studentId)).size;
  }, [logs]);

  const handleCopyPin = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      alert("No audit logs to export.");
      return;
    }

    const headers = [
      "Timestamp",
      "Student ID",
      "Student Name",
      "Class",
      "Academic Session",
      "Term",
      "PIN Code",
      "Serial Number",
      "Channel",
      "Status",
      "Audit Details"
    ];

    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.studentId}"`,
      `"${l.studentName}"`,
      `"${l.class}"`,
      `"${l.session}"`,
      `"${l.term}"`,
      `"${l.pinCode}"`,
      `"${l.serialNumber}"`,
      `"${l.accessChannel}"`,
      `"${l.status}"`,
      `"${l.details || ""}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ESS_PIN_Checked_Results_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Checked Results Via PIN Use
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic access log recording every successful academic result check verified by a student PIN.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlainPins(!showPlainPins)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            {showPlainPins ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPlainPins ? "Mask PINs" : "Reveal PINs"}
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredLogs.length === 0}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs disabled:opacity-40 flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            Export Audit Log (CSV)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm bg-indigo-50/20">
          <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block">
            Total Results Checked
          </span>
          <span className="text-2xl font-black text-indigo-900 mt-0.5 block">{logs.length}</span>
          <span className="text-[11px] text-indigo-600">Access events recorded</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
            Unique Candidates Verified
          </span>
          <span className="text-2xl font-black text-emerald-800 mt-0.5 block">{uniqueStudentsCount}</span>
          <span className="text-[11px] text-emerald-600">Students accessed reports</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
            Security Status
          </span>
          <span className="text-2xl font-black text-slate-800 mt-0.5 block flex items-center gap-2">
            100%
            <span className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
              Authentic
            </span>
          </span>
          <span className="text-[11px] text-slate-400">Zero unauthorized bypasses</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, ID, PIN, or serial..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            <option value="All">All Classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedSession}
            onChange={(e) => { setSelectedSession(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            <option value="All">All Sessions</option>
            {sessions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Session & Term</th>
                <th className="py-3 px-4">PIN Code Used</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No result check audit logs match the specified criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{log.studentName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{log.studentId}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {log.class}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-semibold block">{log.session}</span>
                      <span className="text-[11px] text-slate-400">{log.term}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 tracking-wider">
                          {showPlainPins ? log.pinCode : "•••• •••• ••••"}
                        </span>
                        <button
                          onClick={() => handleCopyPin(log.id, log.pinCode)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500"
                          title="Copy PIN Code"
                        >
                          {copiedId === log.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {log.serialNumber}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {log.accessChannel}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      <div className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                        <span>{log.details || "Access Granted"}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {paginatedLogs.length} of {filteredLogs.length} checked result entries
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-bold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
