import React, { useState, useMemo } from "react";
import { 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check,
  FileText
} from "lucide-react";
import { jsPDF } from "jspdf";
import { PinRecord } from "../../data/pinsData";

interface DownloadClassPinsProps {
  pins: PinRecord[];
  classes: string[];
  sessions: string[];
}

export const DownloadClassPins: React.FC<DownloadClassPinsProps> = ({
  pins,
  classes,
  sessions
}) => {
  const [selectedClass, setSelectedClass] = useState(classes[0] || "SSS 3A");
  const [selectedSession, setSelectedSession] = useState("2025/2026");
  const [copied, setCopied] = useState(false);

  const classPins = useMemo(() => {
    return pins.filter((p) => p.class === selectedClass && p.session === selectedSession);
  }, [pins, selectedClass, selectedSession]);

  const handleDownloadCsv = () => {
    if (classPins.length === 0) {
      alert(`No PIN records available to export for ${selectedClass} in ${selectedSession}.`);
      return;
    }

    const headers = [
      "Serial Number",
      "Result PIN",
      "Admission ID",
      "Candidate Full Name",
      "Class",
      "Academic Session",
      "Term Validity",
      "Max Uses",
      "Uses Remaining",
      "Status",
      "Date Generated",
      "Last Checked"
    ];

    const rows = classPins.map((p) => [
      `"${p.serialNumber}"`,
      `"${p.pinCode}"`,
      `"${p.studentId || ""}"`,
      `"${p.studentName || ""}"`,
      `"${p.class || ""}"`,
      `"${p.session}"`,
      `"${p.term}"`,
      p.maxUses,
      p.usesRemaining,
      `"${p.status}"`,
      `"${p.dateGenerated}"`,
      `"${p.lastUsedAt || "Never"}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ESS_${selectedClass.replace(/\s+/g, "_")}_PINs_${selectedSession.replace("/", "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (classPins.length === 0) {
      alert(`No PIN records available to export for ${selectedClass} in ${selectedSession}.`);
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 26, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("EMMANUEL SECONDARY SCHOOL, MAKURDI", 14, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(245, 158, 11); // amber-400
    doc.text(`CONFIDENTIAL CLASS RESULT PIN REGISTER • ${selectedClass} • SESSION: ${selectedSession}`, 14, 18);

    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Total Records: ${classPins.length} | Generated: ${new Date().toLocaleDateString()}`, 196, 18, { align: "right" });

    // Table Header
    let y = 34;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, 182, 7, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text("#", 17, y + 4.8);
    doc.text("STUDENT NAME", 26, y + 4.8);
    doc.text("ADMISSION ID", 80, y + 4.8);
    doc.text("SERIAL NUMBER", 112, y + 4.8);
    doc.text("RESULT PIN", 148, y + 4.8);
    doc.text("STATUS", 182, y + 4.8);

    y += 7;

    classPins.forEach((p, idx) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y, 182, 7, "F");
        doc.setDrawColor(203, 213, 225);
        doc.rect(14, y, 182, 7, "S");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(51, 65, 85);
        doc.text("#", 17, y + 4.8);
        doc.text("STUDENT NAME", 26, y + 4.8);
        doc.text("ADMISSION ID", 80, y + 4.8);
        doc.text("SERIAL NUMBER", 112, y + 4.8);
        doc.text("RESULT PIN", 148, y + 4.8);
        doc.text("STATUS", 182, y + 4.8);
        y += 7;
      }

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 6.5, "F");
      }
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, y, 182, 6.5, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(String(idx + 1), 17, y + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(p.studentName.substring(0, 28), 26, y + 4.5);

      doc.setFont("courier", "normal");
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      doc.text(p.studentId || "—", 80, y + 4.5);
      doc.text(p.serialNumber, 112, y + 4.5);

      doc.setFont("courier", "bold");
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text(p.pinCode, 148, y + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      if (p.status === "Active") {
        doc.setTextColor(16, 185, 129);
      } else if (p.status === "Used") {
        doc.setTextColor(100, 116, 139);
      } else {
        doc.setTextColor(239, 68, 68);
      }
      doc.text(p.status.toUpperCase(), 182, y + 4.5);

      y += 6.5;
    });

    const fileName = `ESS_${selectedClass.replace(/\s+/g, "_")}_PIN_Register_${selectedSession.replace("/", "-")}.pdf`;
    doc.save(fileName);
  };

  const handleCopySummary = () => {
    if (classPins.length === 0) return;
    const text = classPins.map((p) => `${p.studentName}\t${p.studentId}\t${p.pinCode}\t${p.serialNumber}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-rose-600" />
            Download Class PINs
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Export secure PIN registers for school records, spreadsheet processing, or administrative archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            disabled={classPins.length === 0}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? "Copied Roster!" : "Copy Tab-Separated"}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={classPins.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs disabled:opacity-40 flex items-center gap-1.5 transition-colors"
          >
            <FileText size={14} className="text-amber-400" />
            Download PDF ({classPins.length})
          </button>

          <button
            onClick={handleDownloadCsv}
            disabled={classPins.length === 0}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs disabled:opacity-40 flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet size={14} />
            Download CSV ({classPins.length} PINs)
          </button>
        </div>
      </div>

      {/* Selector Row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Class to Export
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

      {/* Export Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800">
              Class Roster Preview: {selectedClass} &bull; {selectedSession}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
              {classPins.length} Records
            </span>
          </div>

          <button
            onClick={() => window.print()}
            className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
          >
            <Printer size={13} />
            Print Roster
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Admission ID</th>
                <th className="py-2.5 px-4">Candidate Full Name</th>
                <th className="py-2.5 px-4">Serial Number</th>
                <th className="py-2.5 px-4">PIN Code</th>
                <th className="py-2.5 px-4 text-center">Remaining</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classPins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No Result PIN records found for {selectedClass} in session {selectedSession}.
                  </td>
                </tr>
              ) : (
                classPins.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{p.studentId}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{p.studentName}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{p.serialNumber}</td>
                    <td className="py-2.5 px-4 font-mono font-black text-slate-900 tracking-wider">{p.pinCode}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-emerald-700">{p.usesRemaining} / {p.maxUses}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === "Active" ? "bg-emerald-100 text-emerald-800" :
                        p.status === "Inactive" ? "bg-amber-100 text-amber-800" :
                        "bg-rose-100 text-rose-800"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
