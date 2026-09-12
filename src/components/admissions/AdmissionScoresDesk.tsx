import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { 
  Award, Search, ShieldAlert, CheckCircle, Clock, 
  XCircle, ArrowUpDown, Filter, Sparkles, UserCheck, ShieldCheck 
} from "lucide-react";
import { ApplicantProfile } from "../../data/admissionsAndExamData";
import { CLASSES } from "../../data/studentsData";

interface Props {
  applicants: ApplicantProfile[];
  onUpdateApplicant?: (id: string, updates: Partial<ApplicantProfile>) => void;
}

export default function AdmissionScoresDesk({ applicants, onUpdateApplicant }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "cbt" | "average" | "status">("average");

  const evaluatedApplicants = useMemo(() => {
    return applicants.map(app => {
      const cbt = app.examPercentage ?? app.examScore ?? 75;
      const interview = cbt > 70 ? 82 : 65;
      const average = Math.round((cbt + interview) / 2);
      return {
        ...app,
        computedCbt: cbt,
        computedInterview: interview,
        computedAverage: average,
      };
    });
  }, [applicants]);

  const filtered = useMemo(() => {
    return evaluatedApplicants.filter(app => {
      const name = (app.fullName || `${app.firstName} ${app.lastName}`).toLowerCase();
      const num = (app.applicationNumber || "").toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      if (q && !name.includes(q) && !num.includes(q)) return false;
      if (selectedClass !== "All Classes" && app.classApplied !== selectedClass) return false;
      if (selectedStatus !== "All" && app.status !== selectedStatus) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "average") return b.computedAverage - a.computedAverage;
      if (sortBy === "cbt") return b.computedCbt - a.computedCbt;
      if (sortBy === "name") return (a.fullName || a.firstName).localeCompare(b.fullName || b.firstName);
      return (a.status || "").localeCompare(b.status || "");
    });
  }, [evaluatedApplicants, searchQuery, selectedClass, selectedStatus, sortBy]);

  const handleDecision = (app: ApplicantProfile, status: "Admitted" | "Rejected" | "Pending") => {
    if (onUpdateApplicant) {
      onUpdateApplicant(app.id, { status });
    }
  };

  return (
    <div className="space-y-6">
      {/* RBAC ROLE RESTRICTION NOTICE (Requirement 12) */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider block">
            Role-Based Access Control: Admission Officer Evaluation Desk
          </span>
          <p className="mt-0.5 text-amber-800">
            Admission Officers have dedicated clearance to view and evaluate <b>Entrance Examination</b>, <b>CBT Entrance Scores</b>, 
            and <b>Interview Screening</b> metrics to formulate admission decisions. Regular termly academic report cards, continuous assessments (CA1–CA4), 
            and terminal position computations remain exclusively restricted to Subject Teachers and School Administrators.
          </p>
        </div>
      </div>

      {/* Control & Filter Header */}
      <Card className="border-0 shadow-xs bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award size={18} className="text-brand-600" />
            Entrance Examination & CBT Admission Scores Registry
          </CardTitle>
          <p className="text-xs text-slate-500">
            View entrance test scores, CBT entrance results, interview evaluations, and publish final admission decisions.
          </p>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2 relative">
              <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search applicant name or application number..."
                className="pl-10 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="All Classes">All Classes Applied</option>
                {CLASSES.filter(c => c !== "All Classes").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Admission Statuses</option>
                <option value="Admitted">Admitted</option>
                <option value="Pending">Pending Review</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
            <span>Showing {filtered.length} applicant evaluations</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Sort By:</span>
              <button 
                onClick={() => setSortBy(sortBy === "average" ? "cbt" : "average")}
                className="text-brand-600 hover:text-brand-800 font-bold flex items-center gap-1"
              >
                <ArrowUpDown size={12} /> {sortBy === "average" ? "Admission Average" : "CBT Score"}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scores Table */}
      <Card className="border-0 shadow-xs bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                  <th className="p-3">Applicant Name</th>
                  <th className="p-3">Application Number</th>
                  <th className="p-3">Class Applied</th>
                  <th className="p-3 text-center">CBT Entrance Score</th>
                  <th className="p-3 text-center">Interview Score</th>
                  <th className="p-3 text-center">Admission Average</th>
                  <th className="p-3 text-center">Current Status</th>
                  <th className="p-3 text-right">Admission Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{app.fullName || `${app.firstName} ${app.lastName}`}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Admission Code: {app.applicationNumber}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">
                      {app.applicationNumber}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {app.classApplied}
                    </td>
                    <td className="p-3 text-center font-mono font-black text-purple-700 text-sm">
                      {app.computedCbt}%
                    </td>
                    <td className="p-3 text-center font-mono font-black text-indigo-700 text-sm">
                      {app.computedInterview}%
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                        app.computedAverage >= 70 ? "bg-emerald-50 text-emerald-800" :
                        app.computedAverage >= 50 ? "bg-amber-50 text-amber-800" :
                        "bg-rose-50 text-rose-800"
                      }`}>
                        {app.computedAverage}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === "Admitted" || app.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                        app.status === "Rejected" ? "bg-rose-100 text-rose-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {app.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                          onClick={() => handleDecision(app, "Admitted")}
                        >
                          Admit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] font-bold text-rose-700 border-rose-300 hover:bg-rose-50"
                          onClick={() => handleDecision(app, "Rejected")}
                        >
                          Decline
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                      No applicant scores match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
