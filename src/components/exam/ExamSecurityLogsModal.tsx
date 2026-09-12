import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  X,
  Eye,
  RotateCcw,
  Smartphone,
  Laptop,
  Globe,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { cbtSecurityClient, ExamAttemptRecord, SecurityLogsResponse } from "../../data/cbtSecurityClient";
import { Button } from "../ui";

interface ExamSecurityLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExamSecurityLogsModal: React.FC<ExamSecurityLogsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SecurityLogsResponse>({
    attempts: [],
    stats: {
      total: 0,
      active: 0,
      submitted: 0,
      autoSubmittedViolations: 0,
      totalViolationsLogged: 0
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttemptRecord | null>(null);
  const [actionNotice, setActionNotice] = useState<string>("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await cbtSecurityClient.getSecurityLogs();
      setData(res);
    } catch (err) {
      console.error("Failed to load security logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = async (attemptId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to authorize a reset and re-sit for ${studentName}? This will clear the current attempt.`)) {
      await cbtSecurityClient.resetAttempt(attemptId);
      setActionNotice(`Attempt for ${studentName} successfully reset. Student may now re-sit.`);
      setTimeout(() => setActionNotice(""), 4000);
      fetchLogs();
      if (selectedAttempt?.id === attemptId) {
        setSelectedAttempt(null);
      }
    }
  };

  const filteredAttempts = data.attempts.filter(att => {
    const matchesSearch =
      att.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.studentClass.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "ACTIVE") return att.status === "IN_PROGRESS";
    if (statusFilter === "SUBMITTED") return att.status === "SUBMITTED";
    if (statusFilter === "VIOLATION") return att.status === "AUTO_SUBMITTED_VIOLATION";

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-hidden animate-in fade-in">
      <div className="w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-inner">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-white flex items-center gap-2">
                Examination Security Logs & Anti-Cheating Monitor
              </h2>
              <p className="text-xs text-slate-400">
                Live examination audit trail, fullscreen compliance monitoring, and automatic violation submissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              title="Refresh Logs"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="bg-emerald-950/90 border-b border-emerald-800/80 px-6 py-2.5 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-6 bg-slate-950/40 border-b border-slate-800 shrink-0">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Attempts</span>
            <span className="text-2xl font-bold font-heading text-white">{data.stats.total}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-800/40">
            <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider block">Live Active</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
              <span className="text-2xl font-bold font-heading text-blue-400">{data.stats.active}</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">Submitted</span>
            <span className="text-2xl font-bold font-heading text-emerald-400">{data.stats.submitted}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/50">
            <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider block">Violations Submitted</span>
            <span className="text-2xl font-bold font-heading text-rose-400">{data.stats.autoSubmittedViolations}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/40 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block">Flagged Events</span>
            <span className="text-2xl font-bold font-heading text-amber-400">{data.stats.totalViolationsLogged}</span>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search candidate, ID, class, or exam..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === "ALL" ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All ({data.attempts.length})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === "ACTIVE" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Active ({data.stats.active})
            </button>
            <button
              onClick={() => setStatusFilter("SUBMITTED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === "SUBMITTED" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Submitted ({data.stats.submitted})
            </button>
            <button
              onClick={() => setStatusFilter("VIOLATION")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === "VIOLATION" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Violations ({data.stats.autoSubmittedViolations})
            </button>
          </div>
        </div>

        {/* MAIN BODY: TABLE & DETAIL DRILLDOWN */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* LOGS TABLE */}
          <div className="flex-1 overflow-y-auto border-r border-slate-800">
            {filteredAttempts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No examination attempts match your search or filter.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Candidate Details</th>
                    <th className="p-3.5">Exam / Subject</th>
                    <th className="p-3.5">Start & Duration</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Violations</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAttempts.map(att => {
                    const isViolation = att.status === "AUTO_SUBMITTED_VIOLATION";
                    const isActive = att.status === "IN_PROGRESS";
                    const isSelected = selectedAttempt?.id === att.id;

                    return (
                      <tr
                        key={att.id}
                        onClick={() => setSelectedAttempt(att)}
                        className={`transition-colors cursor-pointer hover:bg-slate-800/50 ${
                          isSelected ? "bg-slate-800 border-l-4 border-l-brand-500" : ""
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="font-bold text-white">{att.studentName}</div>
                          <div className="text-[11px] text-slate-400">
                            {att.studentId} &bull; <span className="text-slate-300 font-medium">{att.studentClass}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-200">{att.examTitle}</div>
                          <div className="text-[11px] text-brand-400 font-semibold">{att.subject}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-300 font-mono text-[11px]">
                            {new Date(att.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {att.durationMinutes} mins
                          </div>
                        </td>
                        <td className="p-3.5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Live Active
                            </span>
                          ) : isViolation ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <AlertTriangle size={12} /> Auto-Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 size={12} /> Completed
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {att.violationsCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40 text-[11px]">
                              {att.violationsCount} Flagged
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono">0</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAttempt(att);
                              }}
                              className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200"
                              title="View Security Incident Drilldown"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReset(att.id, att.studentName);
                              }}
                              className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200"
                              title="Authorize Re-Sit / Reset Attempt"
                            >
                              <RotateCcw size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* DRILLDOWN AUDIT PANEL */}
          <div className="w-full md:w-96 bg-slate-950/60 p-5 overflow-y-auto shrink-0 border-t md:border-t-0 border-slate-800 space-y-5">
            {selectedAttempt ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold font-heading text-white">Security Incident Audit</h3>
                    <p className="text-[11px] text-slate-400">Attempt ID: {selectedAttempt.id}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedAttempt.status === "AUTO_SUBMITTED_VIOLATION"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : selectedAttempt.status === "IN_PROGRESS"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {selectedAttempt.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-slate-400 text-[11px]">Candidate</div>
                    <div className="font-bold text-white">{selectedAttempt.studentName}</div>
                    <div className="text-slate-400 text-[11px]">{selectedAttempt.studentId} &bull; {selectedAttempt.studentClass}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-slate-400 text-[11px]">Submission Record</div>
                    <div className="text-slate-200">{selectedAttempt.submissionReason || "In progress"}</div>
                    {selectedAttempt.submissionTime && (
                      <div className="text-[10px] text-slate-400">
                        Submitted: {new Date(selectedAttempt.submissionTime).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* DEVICE & PROCTOR INFO */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="text-slate-400 text-[11px] font-bold uppercase flex items-center gap-1.5">
                      <Laptop size={13} /> Proctor & Device Telemetry
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Resolution:</span>
                        <span className="text-slate-300 font-mono">{selectedAttempt.deviceInfo?.screenResolution || "1920x1080"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Platform:</span>
                        <span className="text-slate-300">{selectedAttempt.deviceInfo?.platform || "Win32"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Client IP:</span>
                        <span className="text-slate-300 font-mono">{selectedAttempt.deviceInfo?.ip || "127.0.0.1"}</span>
                      </div>
                    </div>
                  </div>

                  {/* SECURITY VIOLATION TIMELINE */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold uppercase text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle size={13} /> Logged Violations ({selectedAttempt.violations.length})
                    </div>
                    {selectedAttempt.violations.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span>Clean session. No security violations flagged.</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedAttempt.violations.map((v, i) => (
                          <div
                            key={v.id || i}
                            className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-200 text-xs space-y-1"
                          >
                            <div className="font-bold flex items-center justify-between text-[11px]">
                              <span className="uppercase text-rose-300">{v.type.replace(/_/g, " ")}</span>
                              <span className="font-mono text-[10px] text-rose-400">
                                {new Date(v.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300">{v.details}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="pt-3">
                    <button
                      onClick={() => handleReset(selectedAttempt.id, selectedAttempt.studentName)}
                      className="w-full py-2.5 bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/60 rounded-xl text-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} /> Clear Disqualification / Grant Re-Sit
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <ShieldAlert size={36} className="text-slate-700" />
                <p className="text-xs">Select any examination candidate from the left list to view their detailed security telemetry and incident audit logs.</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs text-slate-400">
          <span>Emmanuel Secondary School CBT Proctor & Security Compliance Subsystem</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
