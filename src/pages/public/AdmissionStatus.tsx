import React, { useState } from "react";
import { Search, Award, Printer, UserCheck, AlertCircle, Clock, MapPin, Building2, ChevronRight, Download } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/src/components/ui";
import { useAdmissionApps } from "../../data/studentsData";
import { usePortalSettings, useAdmissionSettings } from "../../data/portalSettingsData";
import { useEntranceExams } from "../../data/entranceExamsData";

export default function AdmissionStatus() {
  const [apps] = useAdmissionApps();
  const { exams, codes } = useEntranceExams();
  const [portalSettings] = usePortalSettings();
  const [admissionSettings] = useAdmissionSettings();
  
  const [appIdInput, setAppIdInput] = useState("");
  const [searchedApp, setSearchedApp] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setHasSearched(true);
    
    if (!appIdInput.trim()) {
      setErrorMsg("Please enter your Application ID");
      return;
    }
    
    const found = apps.find(a => a.id.toLowerCase() === appIdInput.trim().toLowerCase());
    if (found) {
      setSearchedApp(found);
    } else {
      setSearchedApp(null);
      setErrorMsg("Application not found. Please verify your Application ID.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Admitted":
      case "Offered":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Rejected":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "Under Review":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Pending":
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Admitted":
      case "Offered":
        return <UserCheck size={18} className="text-emerald-700" />;
      case "Rejected":
        return <AlertCircle size={18} className="text-rose-700" />;
      case "Under Review":
        return <Search size={18} className="text-blue-700" />;
      case "Pending":
      default:
        return <Clock size={18} className="text-amber-700" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center print:hidden">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 mb-3">
            <Award size={14} /> 2026/2027 Admissions
          </span>
          <h1 className="text-3xl font-bold font-heading text-slate-900">Check Admission Status</h1>
          <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
            Enter your Application ID to view your current admission status, download documents, and print your offer letter.
          </p>
        </div>

        <Card className="border border-slate-200 shadow-sm print:hidden">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-bold text-slate-700">Application ID</label>
                <Input 
                  placeholder="e.g. APP-2026-001" 
                  value={appIdInput} 
                  onChange={(e) => setAppIdInput(e.target.value)}
                  className="uppercase"
                />
              </div>
              <Button type="submit" variant="brand" className="gap-2 shrink-0">
                <Search size={16} /> Check Status
              </Button>
            </form>
            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center gap-2 font-medium">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}
          </CardContent>
        </Card>

        {hasSearched && searchedApp && (
          <div className="space-y-6">
            <Card className="border border-slate-200 shadow-sm overflow-hidden print:hidden">
              <div className="bg-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-white">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Applicant Profile</p>
                  <h3 className="text-xl font-bold">{searchedApp.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-300">
                    <span className="flex items-center gap-1"><Building2 size={14} /> {searchedApp.class}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {searchedApp.state} State</span>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border font-bold text-sm bg-white ${getStatusColor(searchedApp.offerStatus || searchedApp.status)}`}>
                  {getStatusIcon(searchedApp.offerStatus || searchedApp.status)}
                  {searchedApp.offerStatus || searchedApp.status}
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Application Details</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                          <span className="text-slate-600">Application ID:</span>
                          <span className="font-bold text-slate-900 font-mono">{searchedApp.id}</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                          <span className="text-slate-600">Date Applied:</span>
                          <span className="font-bold text-slate-900">{new Date(searchedApp.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                          <span className="text-slate-600">Entrance Exam:</span>
                          <span className="font-bold text-slate-900">{searchedApp.examScore ? `${searchedApp.examScore}% (${searchedApp.examStatus})` : 'Not Taken'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Document Status</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                          <span className="text-slate-600">Birth Certificate:</span>
                          <span className={`font-bold ${searchedApp.documents?.birthCertificate === 'Verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {searchedApp.documents?.birthCertificate || 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                          <span className="text-slate-600">Academic Record:</span>
                          <span className={`font-bold ${searchedApp.documents?.academicResult === 'Verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {searchedApp.documents?.academicResult || 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                          <span className="text-slate-600">Passport Photo:</span>
                          <span className={`font-bold ${searchedApp.documents?.passportPhoto === 'Verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {searchedApp.documents?.passportPhoto || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(searchedApp.offerStatus === "Offered" || searchedApp.status === "Admitted") && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full p-8 space-y-6">

                
                <div id="print-area" className="space-y-6">
                  <div className="text-center border-b border-slate-200 pb-6 space-y-2">
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto overflow-hidden">
                      <img src={portalSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="font-heading text-2xl font-black text-slate-900 uppercase">{portalSettings.schoolName}</h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Office of the Registrar & Admissions Board</p>
                    <p className="text-xs text-slate-400">{portalSettings.address} &bull; {portalSettings.contactEmail}</p>
                  </div>

                  <div className="space-y-4 text-sm text-slate-800 leading-relaxed">
                    <div className="flex justify-between font-bold text-slate-900 border-b border-slate-100 pb-2">
                      <span>Date: {new Date().toLocaleDateString()}</span>
                      <span>App Ref: {searchedApp.id}</span>
                    </div>

                    <p>Dear <strong>Parent / Guardian of {searchedApp.name}</strong>,</p>

                    <p className="text-sm font-bold text-slate-900 bg-amber-50 p-3 rounded-lg border border-amber-200 text-center uppercase tracking-wide">
                      PROVISIONAL OFFER OF ADMISSION ({admissionSettings.activeSession} ACADEMIC SESSION)
                    </p>

                    <p>
                      We are pleased to inform you that following your child's recent entrance evaluation and document verification, <strong>{searchedApp.name}</strong> has been offered provisional admission into <strong>{searchedApp.assignedClass || searchedApp.class}</strong> at {portalSettings.schoolName} for the <strong>{admissionSettings.activeSession}</strong> academic session.
                    </p>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <p className="font-bold text-slate-900 border-b pb-1">Admission Requirements & Next Steps:</p>
                      <ul className="list-disc list-inside space-y-1 text-slate-700">
                        <li>Payment of Non-refundable Acceptance Fee of <strong>₦{parseInt(admissionSettings.acceptanceFee).toLocaleString()}</strong> within 14 days.</li>
                        <li>Submission of original copies of Birth Certificate & Previous Academic Transcripts during physical orientation.</li>
                        <li>Resumption Date: <strong>September 14, 2026</strong>.</li>
                      </ul>
                    </div>

                    <p>Congratulations on your child's admission into {portalSettings.schoolName}!</p>

                    <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
                      <div>
                        <div className="font-serif italic text-base font-bold text-slate-900">{portalSettings.admissionOfficerName || "Dr. A. O. Terungwa"}</div>
                        <p className="text-xs text-slate-500">Secretary, Admissions Board</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[11px]">
                          OFFICIALLY SEALED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="print:hidden flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => window.print()} className="gap-1.5 text-xs">
                    <Printer size={15} /> Print Offer Letter
                  </Button>
                  <Button 
                    variant="brand" 
                    onClick={() => {
                      const element = document.getElementById('print-area');
                      if (element) {
                        window.print();
                      }
                    }} 
                    className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                  >
                    <Printer size={15} /> Print / Save PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
