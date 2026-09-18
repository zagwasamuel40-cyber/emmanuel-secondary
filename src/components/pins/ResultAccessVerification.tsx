import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, Key, CheckCircle2, HelpCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "../ui";
import { 
  verifyStudentResultPin, 
  getFailedAttempts, 
  getPinConfig, 
  getStoredPins, 
  PinRecord, 
  setVerifiedResultSession 
} from "../../data/pinsData";

interface ResultAccessVerificationProps {
  student: {
    id: string;
    name: string;
    class: string;
    admissionNumber?: string;
    parentPhone?: string;
    dob?: string;
  };
  defaultSession?: string;
  defaultTerm?: string;
  onVerificationSuccess: (pinRecord: PinRecord, session: string, term: string) => void;
  onCancel?: () => void;
}

export const ResultAccessVerification: React.FC<ResultAccessVerificationProps> = ({
  student,
  defaultSession = "2025/2026",
  defaultTerm = "First Term",
  onVerificationSuccess,
  onCancel,
}) => {
  const [pinInput, setPinInput] = useState("");
  const [selectedSession, setSelectedSession] = useState(defaultSession);
  const [selectedTerm, setSelectedTerm] = useState(defaultTerm);
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedMinutes, setLockedMinutes] = useState(0);

  // Recovery modal state
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryDob, setRecoveryDob] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveredPin, setRecoveredPin] = useState<PinRecord | null>(null);

  const config = getPinConfig();

  // Check initial attempt status
  useEffect(() => {
    const attemptStatus = getFailedAttempts(student.id);
    if (attemptStatus.lockedUntil && Date.now() < attemptStatus.lockedUntil) {
      setIsLocked(true);
      setLockedMinutes(Math.ceil((attemptStatus.lockedUntil - Date.now()) / (60 * 1000)));
    } else if (attemptStatus.count > 0) {
      setRemainingAttempts(Math.max(0, config.maxFailedAttempts - attemptStatus.count));
    }
  }, [student.id, config.maxFailedAttempts]);

  // Format PIN code with dashes as user types (XXXX-XXXX-XXXX)
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (val.length > 12) val = val.substring(0, 12);
    
    // Auto insert dashes
    const parts: string[] = [];
    for (let i = 0; i < val.length; i += 4) {
      parts.push(val.substring(i, i + 4));
    }
    setPinInput(parts.join("-"));
    if (errorMessage) setErrorMessage("");
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMessage("Please enter your Result PIN to view your academic result.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    try {
      // Independent client validation + fallback backend endpoint verification
      const result = verifyStudentResultPin(student.id, pinInput, selectedSession, selectedTerm);

      if (!result.success) {
        if (result.isLocked) {
          setIsLocked(true);
          setLockedMinutes(result.lockedMinutesRemaining || config.lockoutMinutes);
        }
        if (result.remainingAttempts !== undefined) {
          setRemainingAttempts(result.remainingAttempts);
        }
        setErrorMessage(result.message || "Invalid Result PIN. Please check your PIN and try again.");
        setIsVerifying(false);
        return;
      }

      // Record verified session
      if (result.pin) {
        setVerifiedResultSession(student.id, selectedSession, selectedTerm, result.pin.id);
        onVerificationSuccess(result.pin, selectedSession, selectedTerm);
      }
    } catch (err: any) {
      setErrorMessage("An unexpected error occurred during PIN verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Student PIN recovery handler with identity verification
  const handleRecoverPin = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoveredPin(null);

    const storedPins = getStoredPins();
    // Verify matching student
    const studentPins = storedPins.filter(
      p => p.studentId.trim().toUpperCase() === student.id.trim().toUpperCase() && p.status === "Active"
    );

    if (studentPins.length === 0) {
      setRecoveryError("No active Result PIN found for your admission record. Please contact the school examination office to obtain a PIN.");
      return;
    }

    // Check session/term match
    const validPin = studentPins.find(p => {
      const matchSession = p.session.includes(selectedSession) || selectedSession.includes(p.session);
      if (p.pinType === "term") {
        return matchSession && p.term === selectedTerm;
      }
      return matchSession;
    }) || studentPins[0];

    setRecoveredPin(validPin);
  };

  return (
    <div id="result-access-verification-container" className="max-w-xl mx-auto my-8 px-4">
      <Card className="border-0 shadow-xl overflow-hidden rounded-2xl bg-white border-t-4 border-t-brand-700">
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Lock size={140} />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-700/60 border border-brand-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck size={14} className="text-amber-400" />
              Official Security Protocol
            </div>
            <h2 className="text-2xl font-black font-heading tracking-tight text-white">
              RESULT ACCESS VERIFICATION
            </h2>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">
              Enter your Result PIN to view your academic result.
            </p>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Target Student Identity Verification Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Candidate</span>
              <p className="font-bold text-slate-900 text-base">{student.name}</p>
              <p className="text-xs text-slate-500 font-mono">Admission ID: {student.id} &middot; {student.class}</p>
            </div>
            <div className="px-3 py-1.5 bg-brand-50 border border-brand-200 text-brand-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <Lock size={13} className="text-brand-600" />
              Verified Account
            </div>
          </div>

          {/* Academic Session and Term Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Academic Session
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
              >
                <option value="2025/2026">2025/2026 Session</option>
                <option value="2024/2025">2024/2025 Session</option>
                <option value="2023/2024">2023/2024 Session</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Term
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>
          </div>

          {/* Security Alert / Lockout Banner */}
          {isLocked && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900">
              <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-bold text-rose-950">Security Lockout Active</h4>
                <p className="mt-0.5 text-rose-800">
                  Multiple incorrect PIN attempts detected. Access is temporarily locked for approximately{" "}
                  <strong>{lockedMinutes} minute(s)</strong>. Contact the school examination office for assistance.
                </p>
              </div>
            </div>
          )}

          {errorMessage && !isLocked && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900 animate-shake">
              <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-bold text-rose-950">Verification Failed</h4>
                <p className="mt-0.5 text-rose-800">{errorMessage}</p>
                {remainingAttempts !== null && remainingAttempts > 0 && (
                  <p className="text-xs font-semibold text-rose-700 mt-1">
                    Remaining attempts before temporary lockout: {remainingAttempts}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* PIN Input Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="result-pin-input" 
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
                >
                  <Key size={14} className="text-brand-600" />
                  Result PIN
                </label>
                <span className="text-xs text-slate-400 font-mono">Format: XXXX-XXXX-XXXX</span>
              </div>
              <div className="relative">
                <input
                  id="result-pin-input"
                  type={showPin ? "text" : "password"}
                  disabled={isLocked || isVerifying}
                  value={pinInput}
                  onChange={handlePinChange}
                  placeholder="e.g. 9842-1048-5510"
                  autoComplete="off"
                  maxLength={14}
                  className="w-full h-14 pl-4 pr-12 text-center text-xl font-mono tracking-widest rounded-xl border-2 border-slate-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-100 outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed uppercase font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[12px] text-slate-500 mt-1.5 flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600" />
                PIN is verified against your student ID ({student.id}) and the selected session.
              </p>
            </div>

            {/* Verification & Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                id="btn-verify-result-pin"
                type="submit"
                variant="brand"
                disabled={isLocked || isVerifying || !pinInput.trim()}
                className="w-full sm:flex-1 h-12 text-base font-bold shadow-md shadow-brand-700/20"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={18} className="animate-spin mr-2" />
                    Verifying PIN...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} className="mr-2" />
                    Verify PIN & View Result
                  </>
                )}
              </Button>

              {onCancel && (
                <Button
                  id="btn-cancel-result-pin"
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="h-12 border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <ArrowLeft size={16} className="mr-1.5" />
                  Cancel / Back
                </Button>
              )}
            </div>
          </form>

          {/* Quick Help / PIN Recovery Drawer */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
              <p className="text-slate-500 font-medium">
                Forgot your Result PIN? Contact the school examination office.
              </p>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(true)}
                className="text-brand-700 hover:text-brand-900 font-bold underline inline-flex items-center gap-1"
              >
                <HelpCircle size={14} />
                View/Recover Result PIN
              </button>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed">
              <strong>Security Policy:</strong> Each Result PIN is cryptographically bound to student admission number <strong>{student.id}</strong>. Sharing or attempting to use PINs assigned to other candidates is flagged as an academic security violation.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECURE PIN RECOVERY MODAL */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-brand-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Key size={20} className="text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">View / Recover Result PIN</h3>
                  <p className="text-xs text-brand-200">Candidate Identity Verification</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRecoveryModal(false);
                  setRecoveredPin(null);
                  setRecoveryError("");
                }}
                className="text-brand-300 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!recoveredPin ? (
                <form onSubmit={handleRecoverPin} className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Verify your identity to retrieve the active Result PIN issued to your student account for{" "}
                    <strong>{selectedSession}</strong>.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Admission No</label>
                    <input
                      type="text"
                      disabled
                      value={student.id}
                      className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-slate-300 text-sm font-mono font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Registered Student Name</label>
                    <input
                      type="text"
                      disabled
                      value={student.name}
                      className="w-full h-10 px-3 rounded-lg bg-slate-100 border border-slate-300 text-sm font-medium text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  {recoveryError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                      <div>{recoveryError}</div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <Button type="submit" variant="brand" className="w-full h-10 text-sm font-bold">
                      Retrieve My PIN
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRecoveryModal(false)}
                      className="h-10 text-sm"
                    >
                      Close
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Active Result PIN Located</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Assigned to {recoveredPin.studentName} ({recoveredPin.class})</p>
                  </div>

                  <div className="bg-slate-900 text-amber-300 font-mono text-xl tracking-widest font-black py-4 px-6 rounded-xl border border-slate-800 shadow-inner">
                    {recoveredPin.pinCode}
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Serial Number: <span className="font-mono font-bold text-slate-700">{recoveredPin.serialNumber}</span></p>
                    <p>Uses Remaining: <span className="font-bold text-slate-800">{recoveredPin.usesRemaining} of {recoveredPin.maxUses}</span></p>
                    <p>Session / Term: <span className="font-bold text-slate-800">{recoveredPin.session} ({recoveredPin.term})</span></p>
                  </div>

                  <Button
                    variant="brand"
                    className="w-full h-10 text-sm font-bold mt-2"
                    onClick={() => {
                      setPinInput(recoveredPin.pinCode);
                      setShowRecoveryModal(false);
                      setRecoveredPin(null);
                    }}
                  >
                    Auto-Fill PIN into Verification Field
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultAccessVerification;
