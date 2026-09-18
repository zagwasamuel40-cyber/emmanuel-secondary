import React, { useState, useMemo } from "react";
import { 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Printer, 
  Download, 
  AlertCircle,
  Key,
  RotateCcw
} from "lucide-react";
import { PinRecord, generateRandomPinCode, generateRandomSerialNumber } from "../../data/pinsData";
import { Student } from "../../data/studentsData";

interface GenerateClassPinsProps {
  students: Student[];
  pins: PinRecord[];
  onBatchCreated: (newPins: PinRecord[]) => void;
  onNavigateTab: (tab: string) => void;
  classes: string[];
  sessions: string[];
  terms: string[];
}

export const GenerateClassPins: React.FC<GenerateClassPinsProps> = ({
  students,
  pins,
  onBatchCreated,
  onNavigateTab,
  classes,
  sessions,
  terms
}) => {
  const [selectedClass, setSelectedClass] = useState(classes[0] || "SSS 3A");
  const [session, setSession] = useState("2025/2026");
  const [term, setTerm] = useState<"All Terms" | "First Term" | "Second Term" | "Third Term">("All Terms");
  const [mode, setMode] = useState<"auto_assign" | "custom_quantity">("auto_assign");
  const [customQuantity, setCustomQuantity] = useState(25);
  const [maxUses, setMaxUses] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdBatch, setCreatedBatch] = useState<PinRecord[]>([]);

  // Students in chosen class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.class === selectedClass);
  }, [students, selectedClass]);

  // Students who currently lack an active PIN in this session
  const studentsWithoutActivePin = useMemo(() => {
    const activeStudentIds = new Set(
      pins
        .filter((p) => p.session === session && p.status === "Active" && p.class === selectedClass)
        .map((p) => p.studentId)
    );
    return classStudents.filter((s) => !activeStudentIds.has(s.id));
  }, [classStudents, pins, session, selectedClass]);

  const handleGenerateClassPins = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      const newPins: PinRecord[] = [];
      const nowStr = new Date().toISOString().split("T")[0];

      if (mode === "auto_assign") {
        // Generate for students without active PIN (or all class students if all already have, create new term/session batch)
        const targetStudents = studentsWithoutActivePin.length > 0 ? studentsWithoutActivePin : classStudents;
        
        targetStudents.forEach((student, index) => {
          newPins.push({
            id: `PIN-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
            pinCode: generateRandomPinCode(),
            serialNumber: generateRandomSerialNumber(pins.length + index + 1),
            studentId: student.id,
            studentName: student.name,
            class: student.class,
            session: session,
            term: term,
            pinType: term === "All Terms" ? "session" : "term",
            status: "Active",
            usesRemaining: maxUses,
            maxUses: maxUses,
            dateGenerated: nowStr,
            generatedBy: "Class Batch Generator"
          });
        });
      } else {
        // Generate arbitrary quantity of batch scratch cards for this class
        const qty = Math.max(1, Math.min(100, customQuantity));
        for (let i = 0; i < qty; i++) {
          const student = classStudents[i % classStudents.length];
          newPins.push({
            id: `PIN-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
            pinCode: generateRandomPinCode(),
            serialNumber: generateRandomSerialNumber(pins.length + i + 1),
            studentId: student?.id || `ESS/${session.slice(0, 4)}/${String(i + 1).padStart(3, "0")}`,
            studentName: student?.name || `Student Candidate ${i + 1}`,
            class: selectedClass,
            session: session,
            term: term,
            pinType: term === "All Terms" ? "session" : "term",
            status: "Active",
            usesRemaining: maxUses,
            maxUses: maxUses,
            dateGenerated: nowStr,
            generatedBy: "Class Batch Generator"
          });
        }
      }

      onBatchCreated(newPins);
      setCreatedBatch(newPins);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Generate Class PINs
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Batch generate and assign Result Access PINs to all students in an entire class cohort.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Configuration */}
        <div className="lg:col-span-7">
          <form onSubmit={handleGenerateClassPins} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                1. Target Class Cohort
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                <Users size={14} className="text-slate-400" />
                <span>
                  {classStudents.length} total students enrolled in {selectedClass} &bull;{" "}
                  <strong className="text-emerald-700 font-semibold">{studentsWithoutActivePin.length}</strong> currently without an active PIN.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Academic Session
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
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
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  <option value="All Terms">All Terms (Session-Wide Access)</option>
                  {terms.map((t) => (
                    <option key={t} value={t}>{t} Only</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generation Strategy Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                4. Batch Generation Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("auto_assign")}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    mode === "auto_assign"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950 ring-1 ring-emerald-400"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="font-bold text-xs block">Smart Class Auto-Assign</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Generates 1 PIN for each student ({studentsWithoutActivePin.length > 0 ? studentsWithoutActivePin.length : classStudents.length} PINs)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("custom_quantity")}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    mode === "custom_quantity"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950 ring-1 ring-emerald-400"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="font-bold text-xs block">Custom Scratch Batch</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Enter a specific number of cards to print
                  </span>
                </button>
              </div>
            </div>

            {mode === "custom_quantity" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Batch Scratch Card Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                5. Allowed Result Checks Per PIN
              </label>
              <select
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                <option value={1}>1 Check</option>
                <option value={3}>3 Checks</option>
                <option value={5}>5 Checks (Standard Recommended)</option>
                <option value={10}>10 Checks</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              {isGenerating ? "Generating Class Batch..." : `Batch Generate PINs for ${selectedClass}`}
            </button>
          </form>
        </div>

        {/* Results & Quick Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Batch Output & Distribution
            </h4>

            {createdBatch.length > 0 ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="font-bold text-emerald-900 text-xs block">
                    Successfully Generated {createdBatch.length} PINs!
                  </span>
                  <span className="text-[11px] text-emerald-700 mt-0.5 block">
                    Class {selectedClass} &bull; Session {session} &bull; {term}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-56 overflow-y-auto space-y-1 text-xs">
                  {createdBatch.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                      <span className="font-bold text-slate-800">{idx + 1}. {p.studentName}</span>
                      <span className="font-mono text-slate-500">{p.serialNumber}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => onNavigateTab("get_class_pin_slips")}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer size={14} />
                    GetClass PIN Slips (Print Ready)
                  </button>

                  <button
                    onClick={() => onNavigateTab("download_class_pins")}
                    className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    Download Class PINs (CSV)
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 space-y-2">
                <Layers className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs">
                  Select a class on the left and click "Batch Generate PINs" to produce fresh scratch cards.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
