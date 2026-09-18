import React, { useState, useMemo } from "react";
import { 
  Key, 
  Sparkles, 
  Copy, 
  Check, 
  Printer, 
  UserCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw
} from "lucide-react";
import { 
  PinRecord, 
  generateRandomPinCode, 
  generateRandomSerialNumber 
} from "../../data/pinsData";
import { Student } from "../../data/studentsData";

interface GenerateIndividualPinProps {
  students: Student[];
  pins: PinRecord[];
  onPinCreated: (newPin: PinRecord) => void;
  sessions: string[];
  terms: string[];
}

export const GenerateIndividualPin: React.FC<GenerateIndividualPinProps> = ({
  students,
  pins,
  onPinCreated,
  sessions,
  terms
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [session, setSession] = useState("2025/2026");
  const [term, setTerm] = useState<"All Terms" | "First Term" | "Second Term" | "Third Term">("All Terms");
  const [pinType, setPinType] = useState<"session" | "term">("session");
  const [maxUses, setMaxUses] = useState(5);
  
  // Custom or auto-generated PIN
  const [useCustomPin, setUseCustomPin] = useState(false);
  const [customPin, setCustomPin] = useState("");
  const [previewPin, setPreviewPin] = useState(() => generateRandomPinCode());
  const [previewSerial, setPreviewSerial] = useState(() => generateRandomSerialNumber(pins.length + 1));

  const [copied, setCopied] = useState(false);
  const [createdPinReceipt, setCreatedPinReceipt] = useState<PinRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

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

  // Check if this student already has an active PIN for this session
  const existingActivePin = useMemo(() => {
    if (!selectedStudentId) return null;
    return pins.find(
      (p) => p.studentId === selectedStudentId && p.session === session && p.status === "Active"
    );
  }, [pins, selectedStudentId, session]);

  const handleRegenerateRandom = () => {
    setPreviewPin(generateRandomPinCode());
    setPreviewSerial(generateRandomSerialNumber(pins.length + 1));
  };

  const handleGenerateAndAssign = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedStudent) {
      setErrorMsg("Please select a student to assign the PIN to.");
      return;
    }

    const pinCodeToUse = useCustomPin ? customPin.trim() : previewPin;
    if (useCustomPin && (!pinCodeToUse || pinCodeToUse.length < 6)) {
      setErrorMsg("Custom PIN must contain at least 6 alphanumeric characters.");
      return;
    }

    const newPinRecord: PinRecord = {
      id: `PIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pinCode: pinCodeToUse,
      serialNumber: previewSerial,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      class: selectedStudent.class,
      session: session,
      term: term,
      pinType: pinType,
      status: "Active",
      usesRemaining: maxUses,
      maxUses: maxUses,
      dateGenerated: new Date().toISOString().split("T")[0],
      generatedBy: "Examination Admin"
    };

    onPinCreated(newPinRecord);
    setCreatedPinReceipt(newPinRecord);

    // Refresh preview for next generation
    handleRegenerateRandom();
    setCustomPin("");
  };

  const handleCopyReceipt = () => {
    if (!createdPinReceipt) return;
    navigator.clipboard.writeText(createdPinReceipt.pinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            Generate Individual PIN
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and securely bind a Result Access PIN to a specific student account.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleGenerateAndAssign} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Student Search & Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                1. Select Student Candidate
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search candidate by name, admission ID, or class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-slate-50"
                  />
                </div>

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

              {selectedStudent && (
                <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{selectedStudent.name}</span>
                    <span className="text-slate-500 ml-2">ID: {selectedStudent.id}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                      {selectedStudent.class}
                    </span>
                  </div>
                  {existingActivePin && (
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Has Active PIN ({existingActivePin.usesRemaining} uses left)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Academic Session & Term */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Academic Session
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  {sessions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Term Validity
                </label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  <option value="All Terms">All Terms (Full Session Access)</option>
                  {terms.map((t) => (
                    <option key={t} value={t}>{t} Only</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scope & Uses Allowed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  4. PIN Scope Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setPinType("session"); setTerm("All Terms"); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                      pinType === "session"
                        ? "bg-amber-400 text-slate-950 border-amber-400"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Session-Wide
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPinType("term"); setTerm("First Term"); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                      pinType === "term"
                        ? "bg-amber-400 text-slate-950 border-amber-400"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Term-Specific
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  5. Maximum Uses Allowed
                </label>
                <select
                  value={maxUses}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white font-semibold"
                >
                  <option value={1}>1 Check (Single Use Only)</option>
                  <option value={3}>3 Checks</option>
                  <option value={5}>5 Checks (Standard Recommended)</option>
                  <option value={10}>10 Checks</option>
                </select>
              </div>
            </div>

            {/* PIN Code Configuration */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  6. PIN Generation Security
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomPin(!useCustomPin)}
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold"
                >
                  {useCustomPin ? "Switch to Auto-Generated" : "Enter Custom PIN"}
                </button>
              </div>

              {useCustomPin ? (
                <input
                  type="text"
                  placeholder="e.g. 9842-1048-5510 or ALPHA-9988"
                  value={customPin}
                  onChange={(e) => setCustomPin(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 text-xs font-mono font-bold tracking-wider rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Generated 12-Digit PIN
                    </span>
                    <span className="font-mono text-base font-black tracking-widest text-slate-900">
                      {previewPin}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateRandom}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                    title="Generate New Random Code"
                  >
                    <RotateCcw size={14} />
                    New Code
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Generate & Bind PIN to Student
            </button>
          </form>
        </div>

        {/* Right Column: Live Receipt & Print Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck size={16} className="text-emerald-600" />
              Generated PIN Scratch Slip Receipt
            </h4>

            {createdPinReceipt ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    PIN Generated & Bound Successfully!
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    This PIN is now strictly attached to {createdPinReceipt.studentName} ({createdPinReceipt.studentId}).
                  </p>
                </div>

                {/* Printable Slip Card Layout */}
                <div className="border-2 border-dashed border-amber-300 bg-amber-50/30 p-5 rounded-2xl relative">
                  <div className="text-center border-b border-amber-200 pb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Emmanuel Secondary School, Makurdi
                    </p>
                    <h5 className="text-xs font-black uppercase text-slate-900 mt-0.5">
                      Academic Result Checker Scratch Card
                    </h5>
                  </div>

                  <div className="py-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Candidate:</span>
                      <span className="font-bold text-slate-900">{createdPinReceipt.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Admission No:</span>
                      <span className="font-mono font-bold text-slate-900">{createdPinReceipt.studentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Class & Session:</span>
                      <span className="font-bold text-slate-900">{createdPinReceipt.class} &bull; {createdPinReceipt.session}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Serial No:</span>
                      <span className="font-mono text-slate-600">{createdPinReceipt.serialNumber}</span>
                    </div>

                    <div className="mt-3 p-3 bg-white border border-amber-200 rounded-xl text-center shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">
                        PIN CODE (SCRATCH AREA)
                      </span>
                      <span className="font-mono text-lg font-black tracking-widest text-brand-900 select-all block mt-0.5">
                        {createdPinReceipt.pinCode}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                        Valid for {createdPinReceipt.maxUses} Result Checks
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/80 text-center">
                    <p className="text-[9px] text-slate-500">
                      Access via Student Portal &rarr; My Results. Keep PIN confidential.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyReceipt}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copied ? "Copied to Clipboard!" : "Copy PIN Code"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Printer size={14} />
                    Print Slip
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 space-y-2">
                <Key className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-medium">
                  Fill out the form on the left and click "Generate & Bind PIN" to preview and print the candidate's scratch card slip.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
