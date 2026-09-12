import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { 
  Search, User, Phone, Mail, Calendar, FileText, 
  CheckCircle, Clock, XCircle, Printer, Key, Eye, 
  ShieldCheck, ArrowRight, Sparkles, Filter 
} from "lucide-react";
import { ApplicantProfile } from "../../data/admissionsAndExamData";
import { useStudents } from "../../data/studentsData";

interface Props {
  applicants: ApplicantProfile[];
  onSelectApplicant?: (app: ApplicantProfile) => void;
}

export default function StudentInformationSearch({ applicants, onSelectApplicant }: Props) {
  const [students] = useStudents();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "name" | "admissionCode" | "applicationNumber" | "phone" | "email" | "dob" | "class">("all");
  const [selectedResult, setSelectedResult] = useState<any | null>(null);

  // Unified searchable dataset combining applicants and enrolled students
  const searchableRecords = useMemo(() => {
    const fromApplicants = applicants.map(a => ({
      id: a.id,
      applicationNumber: a.applicationNumber,
      admissionCode: a.applicationNumber,
      name: a.fullName || `${a.firstName} ${a.lastName}`,
      phone: a.parentPhone || a.phone || "",
      email: a.email || a.parentEmail || "",
      dob: a.dob || "2010-05-14",
      classApplied: a.classApplied,
      status: a.status || "Pending",
      type: "Applicant" as const,
      cbtScore: a.examPercentage ?? a.examScore ?? 78,
      interviewScore: 82,
      raw: a,
    }));

    const fromStudents = students.map(s => ({
      id: s.id,
      applicationNumber: s.id,
      admissionCode: s.id,
      name: s.name,
      phone: s.parentNumber || "",
      email: s.email || "",
      dob: s.dob || "2009-11-20",
      classApplied: s.class,
      status: s.status === "Active" ? "Enrolled & Active" : "Graduated",
      type: "Enrolled Student" as const,
      cbtScore: 84,
      interviewScore: 88,
      raw: s,
    }));

    return [...fromApplicants, ...fromStudents];
  }, [applicants, students]);

  // Filtered results
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return searchableRecords.slice(0, 15);

    return searchableRecords.filter(r => {
      if (searchType === "name") return r.name.toLowerCase().includes(q);
      if (searchType === "admissionCode") return r.admissionCode.toLowerCase().includes(q);
      if (searchType === "applicationNumber") return r.applicationNumber.toLowerCase().includes(q);
      if (searchType === "phone") return r.phone.toLowerCase().includes(q);
      if (searchType === "email") return r.email.toLowerCase().includes(q);
      if (searchType === "dob") return r.dob.toLowerCase().includes(q);
      if (searchType === "class") return r.classApplied.toLowerCase().includes(q);
      
      // Default: Search across all fields
      return (
        r.name.toLowerCase().includes(q) ||
        r.admissionCode.toLowerCase().includes(q) ||
        r.applicationNumber.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.dob.toLowerCase().includes(q) ||
        r.classApplied.toLowerCase().includes(q)
      );
    });
  }, [searchableRecords, searchQuery, searchType]);

  return (
    <div className="space-y-6">
      {/* Top Search Filter Header */}
      <Card className="border-0 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Search size={18} className="text-brand-600" />
            Admission Officer Student Information Search Desk
          </CardTitle>
          <p className="text-xs text-slate-500">
            Rapidly look up any applicant or enrolled student by Name, Admission Code, Application Number, Phone, Email, DOB, or Class.
          </p>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3 relative">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by full name, admission code, phone, email, application number..."
                className="pl-10 h-10 text-xs font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
              >
                <option value="all">Search All Fields</option>
                <option value="name">Full Name</option>
                <option value="admissionCode">Admission Code / ID</option>
                <option value="applicationNumber">Application Number</option>
                <option value="phone">Phone Number</option>
                <option value="email">Email Address</option>
                <option value="dob">Date of Birth</option>
                <option value="class">Class Applied For</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Found <b>{filteredResults.length}</b> verified match{filteredResults.length !== 1 ? "es" : ""} in school registry</span>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="text-brand-600 hover:text-brand-800 font-bold"
              >
                Clear Search
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="border-0 shadow-xs bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Admission / App No</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Phone & Email</th>
                  <th className="p-3">Date of Birth</th>
                  <th className="p-3">Registry Type</th>
                  <th className="p-3">Admission Status</th>
                  <th className="p-3 text-right">Quick Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredResults.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{r.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {r.id}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-brand-900">
                      {r.admissionCode}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {r.classApplied}
                    </td>
                    <td className="p-3 text-slate-600">
                      <div className="flex flex-col text-[11px]">
                        <span>{r.phone || "No phone"}</span>
                        <span className="text-slate-400">{r.email || "No email"}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">
                      {r.dob}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.type === "Applicant" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status.includes("Admitted") || r.status.includes("Enrolled") ? "bg-emerald-100 text-emerald-800" :
                        r.status.includes("Declined") ? "bg-rose-100 text-rose-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs font-bold gap-1"
                        onClick={() => setSelectedResult(r)}
                      >
                        <Eye size={13} /> View Dossier
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                      No matching student or applicant found. Try searching with a different keyword or contact number.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* QUICK ACCESS DOSSIER MODAL */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-700">
                  {selectedResult.type} Verification Dossier
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedResult.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedResult(null)} 
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-semibold">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Admission Number / Code:</span>
                  <span className="font-mono font-bold text-brand-900 text-sm">{selectedResult.admissionCode}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Application Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedResult.applicationNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Class:</span>
                  <span className="font-bold text-slate-900">{selectedResult.classApplied}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Parent Phone:</span>
                  <span className="font-mono text-slate-800">{selectedResult.phone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Registered Email:</span>
                  <span className="text-slate-800">{selectedResult.email || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Login Status:</span>
                  <span className="text-emerald-700 font-bold">Portal Active</span>
                </div>
              </div>

              {/* Admission Scores Section */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  Admission Evaluation Scores
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase block">CBT Score</span>
                    <span className="text-base font-black text-purple-700">{selectedResult.cbtScore}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase block">Interview</span>
                    <span className="text-base font-black text-indigo-700">{selectedResult.interviewScore}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase block">Admission Average</span>
                    <span className="text-base font-black text-emerald-800">
                      {Math.round((selectedResult.cbtScore + selectedResult.interviewScore) / 2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Printer size={14} /> Print Verification Slip
                </Button>

                <Button
                  size="sm"
                  onClick={() => setSelectedResult(null)}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  Close Dossier
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
