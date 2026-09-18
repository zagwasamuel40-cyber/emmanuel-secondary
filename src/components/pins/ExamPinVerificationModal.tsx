import React, { useState } from "react";
import { ShieldAlert, Key, CheckCircle2, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { Button, Card, CardContent } from "../ui";
import { getStoredPins, normalizePin, getPinConfig } from "../../data/pinsData";

interface ExamPinVerificationModalProps {
  isOpen: boolean;
  student: {
    id: string;
    name: string;
    class: string;
  };
  exam: {
    id?: string;
    title?: string;
    subject?: string;
    duration?: string;
    accessCode?: string;
  };
  onVerified: () => void;
  onCancel: () => void;
}

export const ExamPinVerificationModal: React.FC<ExamPinVerificationModalProps> = ({
  isOpen,
  student,
  exam,
  onVerified,
  onCancel,
}) => {
  const [pinInput, setPinInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (val.length > 12) val = val.substring(0, 12);
    
    // Auto format
    const parts: string[] = [];
    for (let i = 0; i < val.length; i += 4) {
      parts.push(val.substring(i, i + 4));
    }
    setPinInput(parts.join("-"));
    if (errorMessage) setErrorMessage("");
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEntered = normalizePin(pinInput);
    if (!cleanEntered) {
      setErrorMessage("Please enter your Examination / CBT Access PIN.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    setTimeout(() => {
      // Check if matches either exam.accessCode OR any valid student PIN issued to this candidate
      const allPins = getStoredPins();
      const studentPins = allPins.filter(
        p => p.studentId.trim().toUpperCase() === student.id.trim().toUpperCase() && p.status === "Active"
      );

      const matchesStudentPin = studentPins.some(p => normalizePin(p.pinCode) === cleanEntered);
      
      // Also accept standard CBT test codes or test PINs (e.g. CBT-2026, 984210485510, etc.)
      const isExamCode = exam.accessCode && normalizePin(exam.accessCode) === cleanEntered;
      const isMasterCbtCode = cleanEntered === "CBT2026" || cleanEntered === "ESS2026";

      if (matchesStudentPin || isExamCode || isMasterCbtCode) {
        setIsVerifying(false);
        onVerified();
      } else {
        setIsVerifying(false);
        setErrorMessage("Invalid CBT Examination PIN. Please verify the PIN issued to your student account or check with the exam invigilator.");
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Key size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">CBT & Examination Access PIN</h3>
              <p className="text-xs text-slate-400">Security Gate & Candidate Authentication</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Subject / Exam:</span>
              <span className="font-bold text-slate-900">{exam.title || exam.subject || "CBT Assessment"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Candidate:</span>
              <span className="font-mono font-bold text-slate-900">{student.name} ({student.id})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Class:</span>
              <span className="font-bold text-slate-900">{student.class}</span>
            </div>
          </div>

          <div className="text-xs text-slate-600">
            Enter your active <strong>Student PIN</strong> or the <strong>CBT Access Code</strong> provided by the examination officer to unlock this examination.
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Enter Examination / CBT PIN
              </label>
              <input
                type="text"
                value={pinInput}
                onChange={handlePinChange}
                placeholder="e.g. 9842-1048-5510 or CBT-2026"
                autoFocus
                className="w-full h-12 px-4 text-center font-mono text-lg font-bold tracking-widest uppercase border-2 border-slate-300 rounded-xl focus:border-brand-600 focus:ring-4 focus:ring-brand-100 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                variant="brand"
                disabled={isVerifying || !pinInput.trim()}
                className="flex-1 h-11 font-bold"
              >
                {isVerifying ? "Verifying..." : "Authorize & Launch Exam"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-11 border-slate-300 text-slate-700"
              >
                Cancel
              </Button>
            </div>
          </form>

          <p className="text-[11px] text-slate-400 text-center">
            Need an examination PIN? Ask the CBT supervisor or school examination officer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamPinVerificationModal;
