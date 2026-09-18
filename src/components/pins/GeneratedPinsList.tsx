import React, { useState, useMemo } from "react";
import { 
  Key, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { PinRecord } from "../../data/pinsData";

interface GeneratedPinsListProps {
  pins: PinRecord[];
  onUpdatePin: (updatedPin: PinRecord) => void;
  onDeletePin: (pinId: string) => void;
  classes: string[];
  sessions: string[];
}

export const GeneratedPinsList: React.FC<GeneratedPinsListProps> = ({
  pins,
  onUpdatePin,
  onDeletePin,
  classes,
  sessions
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSession, setSelectedSession] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showPlainPins, setShowPlainPins] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredPins = useMemo(() => {
    return pins.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = (p.studentName || "").toLowerCase().includes(q);
        const matchesId = (p.studentId || "").toLowerCase().includes(q);
        const matchesSerial = (p.serialNumber || "").toLowerCase().includes(q);
        const matchesPin = (p.pinCode || "").toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesSerial && !matchesPin) return false;
      }

      if (selectedClass !== "All" && p.class !== selectedClass) return false;
      if (selectedSession !== "All" && p.session !== selectedSession) return false;
      if (selectedStatus !== "All" && p.status !== selectedStatus) return false;

      return true;
    });
  }, [pins, searchQuery, selectedClass, selectedSession, selectedStatus]);

  const totalPages = Math.ceil(filteredPins.length / itemsPerPage) || 1;
  const paginatedPins = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPins.slice(start, start + itemsPerPage);
  }, [filteredPins, currentPage]);

  const handleCopyPin = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleStatus = (pin: PinRecord) => {
    const newStatus = pin.status === "Active" ? "Inactive" : "Active";
    onUpdatePin({
      ...pin,
      status: newStatus as any,
    });
  };

  const handleResetUses = (pin: PinRecord) => {
    onUpdatePin({
      ...pin,
      usesRemaining: pin.maxUses,
      status: "Active"
    });
  };

  const handleRevokePin = (pin: PinRecord) => {
    const reason = window.prompt(`Enter reason for revoking PIN for ${pin.studentName || "candidate"}:`, "Administrative review");
    if (reason !== null) {
      onUpdatePin({
        ...pin,
        status: "Revoked",
        revokedReason: reason || "Administrative hold"
      });
    }
  };

  const renderStatusBadge = (status: PinRecord["status"]) => {
    switch (status) {
      case "Active":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            Active
          </span>
        );
      case "Inactive":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            Inactive
          </span>
        );
      case "Used":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            Used
          </span>
        );
      case "Revoked":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            Revoked
          </span>
        );
      case "Expired":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            Generated PINs Directory
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database of all generated Result PINs ({filteredPins.length} records matching).
          </p>
        </div>

        <button
          onClick={() => setShowPlainPins(!showPlainPins)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          {showPlainPins ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPlainPins ? "Mask PIN Codes" : "Reveal PIN Codes"}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, ID, serial or PIN..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
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
            onChange={(e) => { setSelectedSession(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            <option value="All">All Sessions</option>
            {sessions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Used">Used</option>
            <option value="Revoked">Revoked</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Master PIN Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">PIN Code</th>
                <th className="py-3 px-4">Assigned Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Session & Term</th>
                <th className="py-3 px-4 text-center">Uses Remaining</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPins.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No Result PIN records match the specified filters.
                  </td>
                </tr>
              ) : (
                paginatedPins.map((pin) => (
                  <tr key={pin.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {pin.serialNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 tracking-wider">
                          {showPlainPins ? pin.pinCode : "•••• •••• ••••"}
                        </span>
                        <button
                          onClick={() => handleCopyPin(pin.id, pin.pinCode)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          title="Copy PIN Code"
                        >
                          {copiedId === pin.id ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">
                        {pin.studentName || "Unassigned"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {pin.studentId}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {pin.class || "All"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span className="block font-semibold">{pin.session}</span>
                      <span className="text-[11px] text-slate-400">{pin.term}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-bold ${
                        pin.usesRemaining === 0 ? "text-rose-600" : pin.usesRemaining <= 2 ? "text-amber-600" : "text-emerald-700"
                      }`}>
                        {pin.usesRemaining} / {pin.maxUses}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {renderStatusBadge(pin.status)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(pin)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                            pin.status === "Active"
                              ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          }`}
                          title={pin.status === "Active" ? "Deactivate PIN" : "Activate PIN"}
                        >
                          {pin.status === "Active" ? "Suspend" : "Activate"}
                        </button>

                        <button
                          onClick={() => handleResetUses(pin)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded border border-slate-200 transition-colors"
                          title="Reset Uses to 5"
                        >
                          <RotateCcw size={13} />
                        </button>

                        <button
                          onClick={() => handleRevokePin(pin)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded border border-rose-200 transition-colors"
                          title="Revoke PIN"
                        >
                          <ShieldAlert size={13} />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete PIN record ${pin.serialNumber}?`)) {
                              onDeletePin(pin.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {paginatedPins.length} of {filteredPins.length} PINs
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-bold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
