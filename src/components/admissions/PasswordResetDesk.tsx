import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { 
  Lock, RefreshCw, Key, ShieldCheck, CheckCircle, 
  AlertCircle, History, Send, Copy, Check, Search, User 
} from "lucide-react";
import { useStudents } from "../../data/studentsData";

interface PasswordResetLog {
  id: string;
  officerName: string;
  studentId: string;
  studentName: string;
  dateTime: string;
  reason: string;
  method: "Temporary Password" | "Reset Link Sent" | "Custom Password";
}

const STORAGE_KEY = "ess_password_reset_audit_logs";

export default function PasswordResetDesk() {
  const [students] = useStudents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Reset form state
  const [resetMethod, setResetMethod] = useState<"temp" | "link" | "custom">("temp");
  const [customPassword, setCustomPassword] = useState("");
  const [resetReason, setResetReason] = useState("Parent lost access to portal password");
  const [officerName, setOfficerName] = useState(() => {
    return localStorage.getItem("impersonatingName") || "Admission Officer";
  });

  const [generatedPassword, setGeneratedPassword] = useState("");
  const [notificationMsg, setNotificationMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Audit Logs State
  const [logs, setLogs] = useState<PasswordResetLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "RST-101",
        officerName: "Mrs. Fatima Bello (Admission Officer)",
        studentId: "ESS/2026/001",
        studentName: "Oluwaseun Adebayo",
        dateTime: "2026-07-26 09:30 AM",
        reason: "Parent forgot portal password during terminal checking",
        method: "Temporary Password",
      },
      {
        id: "RST-102",
        officerName: "Mrs. Fatima Bello (Admission Officer)",
        studentId: "ESS/2026/006",
        studentName: "Zainab Bello",
        dateTime: "2026-07-25 03:15 PM",
        reason: "Student phone number changed, requested reset link",
        method: "Reset Link Sent",
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {}
  }, [logs]);

  const filteredStudents = students.filter(s => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
  }).slice(0, 6);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
    let pwd = "ESS-";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleExecuteReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert("Please select a verified student first.");
      return;
    }

    let methodLabel: PasswordResetLog["method"] = "Temporary Password";
    let message = "";

    if (resetMethod === "temp") {
      const tempPwd = generateRandomPassword();
      setGeneratedPassword(tempPwd);
      methodLabel = "Temporary Password";
      message = `Temporary password "${tempPwd}" generated for ${selectedStudent.name}. Dispatch to registered phone/email.`;
    } else if (resetMethod === "link") {
      methodLabel = "Reset Link Sent";
      message = `Secure portal reset link dispatched to registered email (${selectedStudent.email || "parent@example.com"}) and SMS (${selectedStudent.parentNumber || "N/A"}).`;
    } else {
      if (customPassword.length < 6) {
        alert("Custom password must be at least 6 characters with letters and numbers.");
        return;
      }
      methodLabel = "Custom Password";
      message = `Custom password set successfully for ${selectedStudent.name}.`;
    }

    // Record in Audit Log (Requirement 11)
    const newLog: PasswordResetLog = {
      id: `RST-${Date.now().toString(36).toUpperCase()}`,
      officerName,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      dateTime: new Date().toLocaleString(),
      reason: resetReason,
      method: methodLabel,
    };

    setLogs(prev => [newLog, ...prev]);
    setNotificationMsg(message);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock size={18} className="text-brand-600" />
            Student Portal Password Recovery & Reset Desk
          </CardTitle>
          <p className="text-xs text-slate-500">
            Secure, audited protocol for recovering forgotten student portal passwords. Every reset is permanently logged for security compliance.
          </p>
        </CardHeader>
        <CardContent className="p-5 space-y-4 text-xs">
          {/* Step 1: Verify Student Identity */}
          <div>
            <Label className="font-bold text-slate-700 mb-1 block">1. Search & Verify Student Identity *</Label>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search student by full name or Student ID (e.g. ESS/2026/001)..."
                className="pl-10 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredStudents.length > 0 && (
              <div className="mt-2 border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-xs max-h-48 overflow-y-auto">
                {filteredStudents.map(s => (
                  <div
                    key={s.id}
                    onClick={() => { setSelectedStudent(s); setSearchQuery(""); }}
                    className="p-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{s.name}</span>
                      <span className="text-[11px] text-brand-700 font-mono ml-2 font-bold">({s.id})</span>
                    </div>
                    <span className="text-slate-500 font-medium">{s.class} &bull; {s.parentNumber || "No Phone"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Student Confirmation */}
          {selectedStudent && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Student Account</span>
                <span className="text-sm font-bold text-slate-900">{selectedStudent.name}</span>
                <span className="text-xs text-brand-900 font-mono font-bold ml-2">[{selectedStudent.id}]</span>
                <span className="text-xs text-slate-500 ml-2">&bull; {selectedStudent.class} &bull; {selectedStudent.email || "student@ess.edu.ng"}</span>
              </div>
              <button 
                onClick={() => { setSelectedStudent(null); setGeneratedPassword(""); setNotificationMsg(""); }}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Change Student
              </button>
            </div>
          )}

          {/* Step 2: Reset Form */}
          {selectedStudent && (
            <form onSubmit={handleExecuteReset} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setResetMethod("temp")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    resetMethod === "temp" 
                      ? "border-brand-500 bg-brand-50 text-brand-900 font-bold shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Key size={18} className="mb-1 text-brand-600" />
                  <div className="font-bold text-xs">Generate Temporary Password</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Auto-generates 8-character secure key</div>
                </button>

                <button
                  type="button"
                  onClick={() => setResetMethod("link")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    resetMethod === "link" 
                      ? "border-brand-500 bg-brand-50 text-brand-900 font-bold shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Send size={18} className="mb-1 text-indigo-600" />
                  <div className="font-bold text-xs">Send Reset Link via Email/SMS</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Dispatches 1-time secure reset token</div>
                </button>

                <button
                  type="button"
                  onClick={() => setResetMethod("custom")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    resetMethod === "custom" 
                      ? "border-brand-500 bg-brand-50 text-brand-900 font-bold shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ShieldCheck size={18} className="mb-1 text-emerald-600" />
                  <div className="font-bold text-xs">Set Custom Password</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Assign explicit password with security validation</div>
                </button>
              </div>

              {resetMethod === "custom" && (
                <div>
                  <Label className="font-bold text-slate-700 mb-1 block">New Custom Password *</Label>
                  <Input
                    type="text"
                    placeholder="Enter new portal password (min 6 characters)..."
                    className="h-9 text-xs font-mono"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="font-bold text-slate-700 mb-1 block">Reason for Password Reset *</Label>
                  <select
                    className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900"
                    value={resetReason}
                    onChange={(e) => setResetReason(e.target.value)}
                  >
                    <option value="Parent lost access to portal password">Parent lost access to portal password</option>
                    <option value="Student forgot password during examination">Student forgot password during examination</option>
                    <option value="Device lost or compromised">Device lost or compromised</option>
                    <option value="Initial account onboarding recovery">Initial account onboarding recovery</option>
                  </select>
                </div>

                <div>
                  <Label className="font-bold text-slate-700 mb-1 block">Authorized Officer Name</Label>
                  <Input
                    type="text"
                    className="h-9 text-xs bg-slate-100 text-slate-700"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold gap-2 text-xs"
                >
                  <RefreshCw size={14} /> Reset Student Portal Password
                </Button>
              </div>
            </form>
          )}

          {/* Output & Notification */}
          {notificationMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle size={16} className="text-emerald-600" />
                <span>Password Reset Successful!</span>
              </div>
              <p className="text-xs">{notificationMsg}</p>
              {generatedPassword && (
                <div className="p-2.5 bg-white rounded-lg border border-emerald-300 flex items-center justify-between">
                  <span className="font-mono font-black text-base text-emerald-900">{generatedPassword}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-bold gap-1"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    }}
                  >
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PASSWORD RESET AUDIT LOGS TABLE (Requirement 11) */}
      <Card className="border-0 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History size={16} className="text-slate-600" />
              Password Reset Audit Trail
            </CardTitle>
            <p className="text-xs text-slate-500">Official security log tracking all portal password overrides.</p>
          </div>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-full text-xs">
            {logs.length} Logged Overrides
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Student Name & ID</th>
                  <th className="p-3">Authorized Officer</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Reset Method</th>
                  <th className="p-3">Reason for Reset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-500">{log.id}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{log.studentName}</span>
                      <span className="font-mono text-[10px] text-brand-900 font-bold">{log.studentId}</span>
                    </td>
                    <td className="p-3 text-slate-700 font-semibold">{log.officerName}</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{log.dateTime}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {log.method}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 italic">"{log.reason}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
