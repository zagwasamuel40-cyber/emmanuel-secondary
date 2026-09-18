import React, { useState, useMemo } from "react";
import { 
  UserCheck, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  RotateCcw, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  Unlock,
  Lock,
  Sparkles,
  Copy,
  Check
} from "lucide-react";
import { 
  PinRecord, 
  getFailedAttempts, 
  clearFailedAttempts,
  generateRandomPinCode,
  generateRandomSerialNumber
} from "../../data/pinsData";
import { Student } from "../../data/studentsData";

interface ActivateSingleStudentPinProps {
  students: Student[];
  pins: PinRecord[];
  onUpdatePin: (updatedPin: PinRecord) => void;
  onAddPin: (newPin: PinRecord) => void;
  sessions: string[];
}

export const ActivateSingleStudentPin: React.FC<ActivateSingleStudentPinProps> = ({
  students,
  pins,
  onUpdatePin,
  onAddPin,
  sessions
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [selectedSession, setSelectedSession] = useState("2025/2026");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students.slice(0, 30);
    const q = searchTerm.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.class.toLowerCase().includes(q)
    );
  }, [students, searchTerm]);

  // Find assigned PIN for this student & session
  const studentPin = useMemo(() => {
    if (!selectedStudentId) return null;
    return pins.find((p) => p.studentId === selectedStudentId && p.session === selectedSession);
  }, [pins, selectedStudentId, selectedSession]);

  // Security attempt record
  const attemptRecord = useMemo(() => {
    if (!selectedStudentId) return { count: 0 };
    return getFailedAttempts(selectedStudentId);
  }, [selectedStudentId, feedbackMsg]);

  const isAccountLocked = attemptRecord.lockedUntil && Date.now() < attemptRecord.lockedUntil;

  const handleToggleActive = () => {
    if (!studentPin) return;
    const newStatus = studentPin.status === "Active" ? "Inactive" : "Active";
    onUpdatePin({
      ...studentPin,
      status: newStatus as any,
      revokedReason: newStatus === "Inactive" ? "Suspended by admin" : undefined
    });
    setFeedbackMsg(`PIN status set to ${newStatus} for ${studentPin.studentName}.`);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const handleUnlockAccount = () => {
    if (!selectedStudentId) return;
    clearFailedAttempts(selectedStudentId);
    setFeedbackMsg(`Security lockout cleared and failed attempt count reset for ${selectedStudent?.name || selectedStudentId}!`);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const handleResetUses = () => {
    if (!studentPin) return;
    onUpdatePin({
      ...studentPin,
      usesRemaining: studentPin.maxUses,
      status: "Active"
    });
    setFeedbackMsg(`Result checks restored to full (${studentPin.maxUses} uses) for ${studentPin.studentName}.`);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const handleRevoke = () => {
    if (!studentPin) return;
    const reason = window.prompt(`Enter reason for revoking PIN for ${studentPin.studentName}:`, "Misplaced card / Security breach");
    if (reason !== null) {
      onUpdatePin({
        ...studentPin,
        status: "Revoked",
        revokedReason: reason || "Revoked by examination officer"
      });
      setFeedbackMsg(`PIN revoked for ${studentPin.studentName}.`);
      setTimeout(() => setFeedbackMsg(""), 3500);
    }
  };

  const handleGenerateReplacement = () => {
    if (!selectedStudent) return;
    if (studentPin) {
      // Mark old as revoked
      onUpdatePin({
        ...studentPin,
        status: "Revoked",
        revokedReason: "Replaced by new generated PIN"
      });
    }

    const replacementPin: PinRecord = {
      id: `PIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pinCode: generateRandomPinCode(),
      serialNumber: generateRandomSerialNumber(pins.length + 1),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      class: selectedStudent.class,
      session: selectedSession,
      term: "All Terms",
      pinType: "session",
      status: "Active",
      usesRemaining: 5,
      maxUses: 5,
      dateGenerated: new Date().toISOString().split("T")[0],
      generatedBy: "Single Student Activation Hub"
    };

    onAddPin(replacementPin);
    clearFailedAttempts(selectedStudent.id);
    setFeedbackMsg(`Fresh replacement PIN created and activated for ${selectedStudent.name}!`);
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            Activate Single Student's PIN
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit and modify individual student PIN status, lift security lockouts, and generate replacement cards.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Student Selection Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Search & Select Candidate
            </h4>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name, ID, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Candidate
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) — {s.class}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Academic Session
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                {sessions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Name:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Admission ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedStudent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gender:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.gender}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: PIN Status & Security Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Key size={16} className="text-amber-500" />
                Candidate PIN Record & Actions
              </h4>

              {studentPin && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  studentPin.status === "Active" ? "bg-emerald-100 text-emerald-800" :
                  studentPin.status === "Inactive" ? "bg-amber-100 text-amber-800" :
                  studentPin.status === "Used" ? "bg-blue-100 text-blue-800" :
                  "bg-rose-100 text-rose-800"
                }`}>
                  Status: {studentPin.status}
                </span>
              )}
            </div>

            {/* Lockout Warning Banner */}
            {isAccountLocked ? (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">Security Lockout Active</span>
                    <span className="text-[11px] text-rose-700">
                      Candidate exceeded maximum failed attempts ({attemptRecord.count} attempts). Result access is locked.
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleUnlockAccount}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                >
                  Unlock Candidate
                </button>
              </div>
            ) : attemptRecord.count > 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="text-amber-600" />
                  <span>{attemptRecord.count} failed PIN attempt(s) recorded for this candidate.</span>
                </div>
                <button
                  onClick={handleUnlockAccount}
                  className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg text-[11px]"
                >
                  Clear Counter
                </button>
              </div>
            ) : null}

            {studentPin ? (
              <div className="space-y-4">
                {/* Active PIN Information Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Assigned PIN Code:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                        {studentPin.pinCode}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(studentPin.pinCode);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2500);
                        }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                        title="Copy PIN"
                      >
                        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Serial Number:</span>
                    <span className="font-mono font-bold text-slate-700">{studentPin.serialNumber}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Checks:</span>
                    <span className="font-bold text-emerald-700">
                      {studentPin.usesRemaining} of {studentPin.maxUses} uses available
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Date Generated:</span>
                    <span className="text-slate-700">{studentPin.dateGenerated}</span>
                  </div>

                  {studentPin.revokedReason && (
                    <div className="flex justify-between text-rose-700 font-semibold pt-1 border-t border-slate-200">
                      <span>Revocation Note:</span>
                      <span>{studentPin.revokedReason}</span>
                    </div>
                  )}
                </div>

                {/* Individual Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleToggleActive}
                    className={`py-2.5 px-4 font-bold text-xs rounded-xl border transition-colors flex items-center justify-center gap-2 ${
                      studentPin.status === "Active"
                        ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                    }`}
                  >
                    {studentPin.status === "Active" ? <Lock size={14} /> : <Unlock size={14} />}
                    {studentPin.status === "Active" ? "Deactivate / Suspend PIN" : "Activate Candidate PIN"}
                  </button>

                  <button
                    onClick={handleResetUses}
                    className="py-2.5 px-4 bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} />
                    Reset Remaining to 5 Uses
                  </button>

                  <button
                    onClick={handleRevoke}
                    className="py-2.5 px-4 bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <ShieldAlert size={14} />
                    Revoke PIN Code
                  </button>

                  <button
                    onClick={handleGenerateReplacement}
                    className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Sparkles size={14} />
                    Generate Replacement PIN
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center space-y-3">
                <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs text-slate-500">
                  {selectedStudent?.name} has no Result PIN record for the {selectedSession} academic session.
                </p>
                <button
                  onClick={handleGenerateReplacement}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  <Key size={14} />
                  Generate Initial PIN for this Student
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
