import React, { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RotateCcw, 
  Copy, 
  Check, 
  Eye, 
  EyeOff,
  Sparkles
} from "lucide-react";
import { PinRecord, generateRandomPinCode, generateRandomSerialNumber } from "../../data/pinsData";
import { Student } from "../../data/studentsData";

interface CheckClassPinsProps {
  students: Student[];
  pins: PinRecord[];
  onUpdatePin: (updatedPin: PinRecord) => void;
  onAddPin: (newPin: PinRecord) => void;
  classes: string[];
  sessions: string[];
}

export const CheckClassPins: React.FC<CheckClassPinsProps> = ({
  students,
  pins,
  onUpdatePin,
  onAddPin,
  classes,
  sessions
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || "SSS 3A");
  const [selectedSession, setSelectedSession] = useState("2025/2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPlainPins, setShowPlainPins] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Students in chosen class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.class === selectedClass);
  }, [students, selectedClass]);

  // Map student ID to their assigned PIN for this session
  const studentPinMap = useMemo(() => {
    const map = new Map<string, PinRecord>();
    pins.forEach((p) => {
      if (p.session === selectedSession && p.studentId) {
        map.set(p.studentId, p);
      }
    });
    return map;
  }, [pins, selectedSession]);

  // Statistics for this class
  const classStats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let used = 0;
    let missing = 0;

    classStudents.forEach((s) => {
      const pin = studentPinMap.get(s.id);
      if (!pin) {
        missing++;
      } else if (pin.status === "Active") {
        if (pin.usesRemaining < pin.maxUses) used++;
        else active++;
      } else if (pin.status === "Inactive") {
        inactive++;
      } else if (pin.status === "Used") {
        used++;
      }
    });

    const total = classStudents.length;
    const coveragePercent = total > 0 ? Math.round(((total - missing) / total) * 100) : 0;

    return { total, active, inactive, used, missing, coveragePercent };
  }, [classStudents, studentPinMap]);

  // Filtered roster for table
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    const q = searchQuery.toLowerCase();
    return classStudents.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }, [classStudents, searchQuery]);

  const handleCopyPin = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleGenerateMissingPin = (student: Student) => {
    const newPin: PinRecord = {
      id: `PIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pinCode: generateRandomPinCode(),
      serialNumber: generateRandomSerialNumber(pins.length + 1),
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      session: selectedSession,
      term: "All Terms",
      pinType: "session",
      status: "Active",
      usesRemaining: 5,
      maxUses: 5,
      dateGenerated: new Date().toISOString().split("T")[0],
      generatedBy: "Class Checker Tool"
    };
    onAddPin(newPin);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" />
            Check Class PINs
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit PIN coverage, assigned codes, and verification status for all candidates in a selected class.
          </p>
        </div>

        <button
          onClick={() => setShowPlainPins(!showPlainPins)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          {showPlainPins ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPlainPins ? "Mask PINs" : "Reveal PINs"}
        </button>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Target Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
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

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Search Candidate
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or admission ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
            />
          </div>
        </div>
      </div>

      {/* Class Coverage KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Class Enrollment
          </span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">{classStats.total}</span>
          <span className="text-[10px] text-slate-400">Students in {selectedClass}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Active Assigned PINs
          </span>
          <span className="text-xl font-black text-emerald-700 mt-0.5 block">{classStats.active}</span>
          <span className="text-[10px] text-emerald-600 font-medium">Ready to check</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
            Used / Redeemed
          </span>
          <span className="text-xl font-black text-purple-800 mt-0.5 block">{classStats.used}</span>
          <span className="text-[10px] text-purple-600 font-medium">Results checked</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            Inactive / Hold
          </span>
          <span className="text-xl font-black text-amber-800 mt-0.5 block">{classStats.inactive}</span>
          <span className="text-[10px] text-amber-600 font-medium">Suspended</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
            Missing PIN
          </span>
          <span className="text-xl font-black text-rose-800 mt-0.5 block">{classStats.missing}</span>
          <span className="text-[10px] text-rose-600 font-medium">{classStats.coveragePercent}% coverage</span>
        </div>
      </div>

      {/* Class Student-by-Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Admission ID</th>
                <th className="py-3 px-4">PIN Code</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4 text-center">Remaining Uses</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students found in {selectedClass}.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const pin = studentPinMap.get(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {student.name}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500">
                        {student.id}
                      </td>

                      <td className="py-3 px-4">
                        {pin ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              {showPlainPins ? pin.pinCode : "•••• •••• ••••"}
                            </span>
                            <button
                              onClick={() => handleCopyPin(pin.id, pin.pinCode)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-500"
                              title="Copy PIN"
                            >
                              {copiedId === pin.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No PIN generated</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {pin ? pin.serialNumber : "—"}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {pin ? (
                          <span className="font-mono font-bold text-slate-700">
                            {pin.usesRemaining} / {pin.maxUses}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {pin ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            pin.status === "Active" ? "bg-emerald-100 text-emerald-800" :
                            pin.status === "Inactive" ? "bg-amber-100 text-amber-800" :
                            pin.status === "Used" ? "bg-blue-100 text-blue-800" :
                            "bg-rose-100 text-rose-800"
                          }`}>
                            {pin.status}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {pin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                onUpdatePin({
                                  ...pin,
                                  status: pin.status === "Active" ? "Inactive" : "Active"
                                });
                              }}
                              className="px-2 py-1 rounded text-[10px] font-bold border transition-colors hover:bg-slate-50"
                            >
                              {pin.status === "Active" ? "Suspend" : "Activate"}
                            </button>

                            <button
                              onClick={() => {
                                onUpdatePin({
                                  ...pin,
                                  usesRemaining: pin.maxUses,
                                  status: "Active"
                                });
                              }}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 border"
                              title="Reset Uses to 5"
                            >
                              <RotateCcw size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateMissingPin(student)}
                            className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            <Plus size={12} />
                            Generate PIN
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
