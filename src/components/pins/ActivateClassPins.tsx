import React, { useState, useMemo } from "react";
import { 
  ToggleLeft, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  RotateCcw, 
  Users,
  Check,
  X
} from "lucide-react";
import { PinRecord } from "../../data/pinsData";

interface ActivateClassPinsProps {
  pins: PinRecord[];
  onBulkUpdate: (updatedPins: PinRecord[]) => void;
  classes: string[];
  sessions: string[];
}

export const ActivateClassPins: React.FC<ActivateClassPinsProps> = ({
  pins,
  onBulkUpdate,
  classes,
  sessions
}) => {
  const [selectedClass, setSelectedClass] = useState(classes[0] || "SSS 3A");
  const [selectedSession, setSelectedSession] = useState("2025/2026");
  const [notificationMsg, setNotificationMsg] = useState("");

  const classPins = useMemo(() => {
    return pins.filter((p) => p.class === selectedClass && p.session === selectedSession);
  }, [pins, selectedClass, selectedSession]);

  const activeCount = classPins.filter((p) => p.status === "Active").length;
  const inactiveCount = classPins.filter((p) => p.status === "Inactive").length;
  const usedCount = classPins.filter((p) => p.status === "Used").length;

  const handleActivateAll = () => {
    if (classPins.length === 0) {
      alert(`No PIN records found for ${selectedClass} in session ${selectedSession}.`);
      return;
    }

    if (window.confirm(`Activate ALL ${classPins.length} Result PINs for ${selectedClass}? Students will immediately be permitted to check results.`)) {
      const updated = pins.map((p) => {
        if (p.class === selectedClass && p.session === selectedSession) {
          return {
            ...p,
            status: "Active" as const,
            revokedReason: undefined
          };
        }
        return p;
      });
      onBulkUpdate(updated);
      setNotificationMsg(`All ${classPins.length} Result PINs for ${selectedClass} have been Activated!`);
      setTimeout(() => setNotificationMsg(""), 4000);
    }
  };

  const handleDeactivateAll = () => {
    if (classPins.length === 0) {
      alert(`No PIN records found for ${selectedClass} in session ${selectedSession}.`);
      return;
    }

    if (window.confirm(`Suspend / Deactivate ALL ${classPins.length} Result PINs for ${selectedClass}? Result checks will be paused for this class.`)) {
      const updated = pins.map((p) => {
        if (p.class === selectedClass && p.session === selectedSession) {
          return {
            ...p,
            status: "Inactive" as const,
            revokedReason: "Administrative class-wide hold"
          };
        }
        return p;
      });
      onBulkUpdate(updated);
      setNotificationMsg(`All ${classPins.length} Result PINs for ${selectedClass} have been Suspended (Inactive).`);
      setTimeout(() => setNotificationMsg(""), 4000);
    }
  };

  const handleResetAllUses = () => {
    if (classPins.length === 0) {
      alert(`No PIN records found for ${selectedClass} in session ${selectedSession}.`);
      return;
    }

    if (window.confirm(`Reset remaining uses to ${5} for ALL ${classPins.length} students in ${selectedClass}?`)) {
      const updated = pins.map((p) => {
        if (p.class === selectedClass && p.session === selectedSession) {
          return {
            ...p,
            usesRemaining: p.maxUses,
            status: "Active" as const
          };
        }
        return p;
      });
      onBulkUpdate(updated);
      setNotificationMsg(`Remaining uses reset to full (5 checks) for all ${classPins.length} students in ${selectedClass}!`);
      setTimeout(() => setNotificationMsg(""), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <ToggleLeft className="w-5 h-5 text-teal-600" />
            Activate Class PINs
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk control PIN access state: instantly release or pause result access for an entire class.
          </p>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg("")} className="text-emerald-600 hover:text-emerald-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Class & Session Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Target Class
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
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Academic Session
          </label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            {sessions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Class Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Class PINs
          </span>
          <span className="text-2xl font-black text-slate-900 mt-0.5 block">{classPins.length}</span>
          <span className="text-[11px] text-slate-400">In {selectedClass}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Currently Active
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{activeCount}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Students can view results</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            Suspended / Inactive
          </span>
          <span className="text-2xl font-black text-amber-800 mt-0.5 block">{inactiveCount}</span>
          <span className="text-[11px] text-amber-600 font-medium">Access blocked</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
            Exhausted
          </span>
          <span className="text-2xl font-black text-purple-800 mt-0.5 block">{usedCount}</span>
          <span className="text-[11px] text-purple-600 font-medium">0 uses remaining</span>
        </div>
      </div>

      {/* Bulk Action Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Class-Wide Bulk State Modifiers
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 size={18} className="text-emerald-600" />
                Activate All PINs
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Enable result checking for every student in {selectedClass}. Sets all PINs to Active.
              </p>
            </div>
            <button
              onClick={handleActivateAll}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Activate All ({classPins.length}) PINs
            </button>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <ToggleLeft size={18} className="text-amber-600" />
                Deactivate All PINs
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Put all PINs in {selectedClass} on hold. Students will receive an "Administrative hold" notice.
              </p>
            </div>
            <button
              onClick={handleDeactivateAll}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Suspend All ({classPins.length}) PINs
            </button>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                <RotateCcw size={18} className="text-purple-600" />
                Reset Class Uses
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Restore remaining uses to 5 for every student in {selectedClass}, allowing new checks.
              </p>
            </div>
            <button
              onClick={handleResetAllUses}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Reset All to 5 Uses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
