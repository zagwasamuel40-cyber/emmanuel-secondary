import React, { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  Search, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  AlertCircle,
  Clock,
  Sparkles
} from "lucide-react";
import { PinRecord } from "../../data/pinsData";

interface CheckUsedPinsProps {
  pins: PinRecord[];
  onUpdatePin: (updatedPin: PinRecord) => void;
  classes: string[];
  sessions: string[];
}

export const CheckUsedPins: React.FC<CheckUsedPinsProps> = ({
  pins,
  onUpdatePin,
  classes,
  sessions
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSession, setSelectedSession] = useState("All");
  const [showPlainPins, setShowPlainPins] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter PINs that have been used (either status === 'Used' or usesRemaining < maxUses or has lastUsedAt)
  const usedPins = useMemo(() => {
    return pins.filter((p) => {
      const isUsed = p.status === "Used" || p.usesRemaining < p.maxUses || Boolean(p.lastUsedAt);
      if (!isUsed) return false;

      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = (p.studentName || "").toLowerCase().includes(q);
        const matchesId = (p.studentId || "").toLowerCase().includes(q);
        const matchesSerial = (p.serialNumber || "").toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesSerial) return false;
      }

      if (selectedClass !== "All" && p.class !== selectedClass) return false;
      if (selectedSession !== "All" && p.session !== selectedSession) return false;

      return true;
    });
  }, [pins, searchQuery, selectedClass, selectedSession]);

  const exhaustedCount = usedPins.filter((p) => p.usesRemaining === 0 || p.status === "Used").length;
  const partiallyUsedCount = usedPins.filter((p) => p.usesRemaining > 0 && p.usesRemaining < p.maxUses).length;

  const handleCopyPin = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleResetUses = (pin: PinRecord) => {
    onUpdatePin({
      ...pin,
      usesRemaining: pin.maxUses,
      status: "Active"
    });
  };

  const handleResetAllFiltered = () => {
    if (window.confirm(`Reset remaining uses to ${5} for all ${usedPins.length} filtered PINs?`)) {
      usedPins.forEach((p) => {
        onUpdatePin({
          ...p,
          usesRemaining: p.maxUses,
          status: "Active"
        });
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            Check Used PINs
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit PINs that have been redeemed or partially utilized by students to access results.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {usedPins.length > 0 && (
            <button
              onClick={handleResetAllFiltered}
              className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              Reset All Filtered PINs
            </button>
          )}
          <button
            onClick={() => setShowPlainPins(!showPlainPins)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            {showPlainPins ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPlainPins ? "Mask PINs" : "Reveal PINs"}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-sm bg-purple-50/20">
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block">
            Total Used PINs
          </span>
          <span className="text-2xl font-black text-purple-900 mt-0.5 block">{usedPins.length}</span>
          <span className="text-[11px] text-purple-600">Active or completed checks</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-rose-50/20">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">
            Fully Exhausted (0 Uses Left)
          </span>
          <span className="text-2xl font-black text-rose-800 mt-0.5 block">{exhaustedCount}</span>
          <span className="text-[11px] text-rose-600">Reached maximum 5 check limit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
            Partially Used (Active Balance)
          </span>
          <span className="text-2xl font-black text-emerald-800 mt-0.5 block">{partiallyUsedCount}</span>
          <span className="text-[11px] text-emerald-600">Still has 1 to 4 checks remaining</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, ID, or serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
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
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            <option value="All">All Sessions</option>
            {sessions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Used PINs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">PIN Code</th>
                <th className="py-3 px-4 text-center">Times Checked</th>
                <th className="py-3 px-4 text-center">Remaining</th>
                <th className="py-3 px-4">Last Checked At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usedPins.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No used PIN records match your search criteria.
                  </td>
                </tr>
              ) : (
                usedPins.map((pin) => {
                  const timesUsed = Math.max(0, pin.maxUses - pin.usesRemaining);
                  return (
                    <tr key={pin.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{pin.studentName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{pin.studentId}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {pin.class}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {pin.serialNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            {showPlainPins ? pin.pinCode : "•••• •••• ••••"}
                          </span>
                          <button
                            onClick={() => handleCopyPin(pin.id, pin.pinCode)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500"
                            title="Copy PIN Code"
                          >
                            {copiedId === pin.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-700">
                          {timesUsed} time{timesUsed === 1 ? "" : "s"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          pin.usesRemaining === 0 
                            ? "bg-rose-100 text-rose-800" 
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {pin.usesRemaining} / {pin.maxUses}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {pin.lastUsedAt || "Recently checked"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleResetUses(pin)}
                          className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[10px] transition-colors inline-flex items-center gap-1"
                        >
                          <RotateCcw size={12} />
                          Reset to 5 Uses
                        </button>
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
