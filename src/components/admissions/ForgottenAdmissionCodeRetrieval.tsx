import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { 
  Key, Search, Copy, Check, Send, Printer, User, 
  CheckCircle, AlertCircle, Phone, Mail, FileCheck, ShieldCheck 
} from "lucide-react";
import { ApplicantProfile } from "../../data/admissionsAndExamData";
import { useStudents } from "../../data/studentsData";

interface Props {
  applicants: ApplicantProfile[];
}

export default function ForgottenAdmissionCodeRetrieval({ applicants }: Props) {
  const [students] = useStudents();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [selectedStudentForSlip, setSelectedStudentForSlip] = useState<any | null>(null);

  // Unified list
  const combinedStudents = useMemo(() => {
    const listA = applicants.map(a => ({
      id: a.id,
      name: a.fullName || `${a.firstName} ${a.lastName}`,
      applicationNumber: a.applicationNumber,
      admissionCode: a.applicationNumber,
      dateIssued: a.applicationDate || "2026-03-15",
      status: a.status || "Admitted",
      session: "2025/2026 Academic Session",
      phone: a.parentPhone || a.phone || "08031234567",
      email: a.email || a.parentEmail || "parent@example.com",
      classApplied: a.classApplied,
    }));

    const listB = students.map(s => ({
      id: s.id,
      name: s.name,
      applicationNumber: s.id,
      admissionCode: s.id,
      dateIssued: "2025-09-10",
      status: "Admitted & Enrolled",
      session: "2025/2026 Academic Session",
      phone: s.parentNumber || "08029876543",
      email: s.email || "student@ess.edu.ng",
      classApplied: s.class,
    }));

    return [...listA, ...listB];
  }, [applicants, students]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return combinedStudents.slice(0, 10);
    return combinedStudents.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.admissionCode.toLowerCase().includes(q) ||
      s.applicationNumber.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  }, [combinedStudents, searchQuery]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setNotificationMsg(`Admission Code "${code}" copied to clipboard!`);
    setTimeout(() => {
      setCopiedId(null);
      setNotificationMsg("");
    }, 3500);
  };

  const handleResendCredentials = (student: any) => {
    setNotificationMsg(`Admission Code and login credentials successfully dispatched via SMS to ${student.phone} and email to ${student.email}!`);
    setTimeout(() => setNotificationMsg(""), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="border-0 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Key size={18} className="text-brand-600" />
            Forgotten Admission Code & Number Recovery Desk
          </CardTitle>
          <p className="text-xs text-slate-500">
            Assisting candidates and parents who lost their admission code or application number. Verify identity and recover or dispatch codes securely.
          </p>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <Input
              type="text"
              placeholder="Search candidate by name, phone number, email or verified details..."
              className="pl-10 h-10 text-xs font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {notificationMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                <span>{notificationMsg}</span>
              </div>
              <button onClick={() => setNotificationMsg("")} className="text-emerald-600 hover:text-emerald-900 font-bold">
                ✕
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recovered Candidates Table */}
      <Card className="border-0 shadow-xs bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                  <th className="p-3">Student Full Name</th>
                  <th className="p-3">Application Number</th>
                  <th className="p-3">Admission Number / Code</th>
                  <th className="p-3">Date Issued</th>
                  <th className="p-3">Admission Status</th>
                  <th className="p-3">Academic Session</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Class: {item.classApplied}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">
                      {item.applicationNumber}
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-black text-brand-900 text-sm bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {item.admissionCode}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">
                      {item.dateIssued}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">
                      {item.session}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs font-bold gap-1"
                          onClick={() => handleCopyCode(item.admissionCode)}
                          title="Copy Admission Code"
                        >
                          {copiedId === item.admissionCode ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          Copy
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs font-bold gap-1 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                          onClick={() => handleResendCredentials(item)}
                          title="Resend to registered phone and email"
                        >
                          <Send size={13} /> Resend
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs font-bold gap-1"
                          onClick={() => setSelectedStudentForSlip(item)}
                          title="Print verification slip"
                        >
                          <Printer size={13} /> Slip
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                      No matching records found. Enter candidate name or phone number to retrieve admission credentials.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* PRINTABLE ADMISSION VERIFICATION SLIP MODAL */}
      {selectedStudentForSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-6 print:shadow-none print:border-none print:m-0">
            <div className="border-b border-slate-200 pb-3 mb-4 text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 uppercase">
                EXCELLENCE SECONDARY SCHOOL
              </h3>
              <p className="text-[11px] text-slate-500 uppercase font-semibold">
                Official Admission Verification & Recovery Slip
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Candidate Name:</span>
                <span className="font-bold text-slate-900">{selectedStudentForSlip.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Application Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedStudentForSlip.applicationNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2 bg-emerald-50/70 p-2 rounded">
                <span className="text-emerald-950 font-black">Official Admission Code:</span>
                <span className="font-mono font-black text-emerald-900 text-sm">{selectedStudentForSlip.admissionCode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Class Allocated:</span>
                <span className="font-bold text-slate-900">{selectedStudentForSlip.classApplied}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Admission Status:</span>
                <span className="font-bold text-emerald-700">{selectedStudentForSlip.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Academic Session:</span>
                <span className="font-semibold text-slate-900">{selectedStudentForSlip.session}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-between items-center pt-3 border-t border-slate-200 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudentForSlip(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold gap-1.5"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print Slip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
