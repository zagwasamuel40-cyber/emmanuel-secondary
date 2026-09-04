import React, { useState, useMemo } from "react";
import { NIGERIA_STATES } from "../../data/nigeriaStates";
import { Button, Input, Label } from "@/src/components/ui";
import { useAdmissionApps } from "../../data/studentsData";
import { usePortalSettings, useAdmissionSettings } from "../../data/portalSettingsData";

import { UploadCloud, FileText, CheckCircle2, Trash2, ShieldAlert, Award, FileCheck, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Admissions() {
  const [admissionApps, setAdmissionApps] = useAdmissionApps();
  const [portalSettings] = usePortalSettings();
  const [admissionSettings] = useAdmissionSettings();
  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [previousResultFile, setPreviousResultFile] = useState<File | null>(null);
  const [passportPhotoFile, setPassportPhotoFile] = useState<File | null>(null);
  const [birthCertBase64, setBirthCertBase64] = useState<string>("");
  const [previousResultBase64, setPreviousResultBase64] = useState<string>("");
  const [passportPhotoBase64, setPassportPhotoBase64] = useState<string>("");

  const [dragActiveBirth, setDragActiveBirth] = useState(false);
  const [dragActiveResult, setDragActiveResult] = useState(false);
  const [dragActivePassport, setDragActivePassport] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "paid">("pending");
  const [examStep, setExamStep] = useState<"not_started" | "intro" | "testing" | "result">("not_started");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);

  const questions = [
    { "id": 1, "text": "What is 25 + 47?", "options": ["62", "72", "82", "92"], "answer": "72", "subject": "Mathematics" },
    { "id": 2, "text": "If x = 5, what is 2x + 10?", "options": ["15", "20", "25", "30"], "answer": "20", "subject": "Mathematics" },
    { "id": 3, "text": "What is the square root of 144?", "options": ["10", "12", "14", "16"], "answer": "12", "subject": "Mathematics" },
    { "id": 4, "text": "Solve for y: 3y - 9 = 12", "options": ["5", "6", "7", "8"], "answer": "7", "subject": "Mathematics" },
    { "id": 5, "text": "What is 15% of 200?", "options": ["20", "25", "30", "35"], "answer": "30", "subject": "Mathematics" }
  ];

  const handlePayNow = () => {
    if (!birthCertFile || !previousResultFile || !passportPhotoFile || !firstName || !lastName || !classApplying || !parentPhone) {
      alert("Please fill all required fields and upload all documents before payment.");
      return;
    }
    setPaymentStatus("processing");
    setTimeout(() => {
      setPaymentStatus("paid");
      setExamStep("intro");
    }, 1500);
  };

  const handleStartExam = () => setExamStep("testing");
  const handleSelectOption = (idx: number, opt: string) => setSelectedAnswers({ ...selectedAnswers, [idx]: opt });
  const handleNext = () => setCurrentQIndex(i => Math.min(i + 1, questions.length - 1));
  const handlePrev = () => setCurrentQIndex(i => Math.max(i - 1, 0));
  const handleSubmitExam = () => {
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) calculatedScore += 20;
    });
    setScore(calculatedScore);
    setExamStep("result");
  };

  const [appId, setAppId] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [classApplying, setClassApplying] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setBase64?: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      if (setBase64) {
        const reader = new FileReader();
        reader.onloadend = () => setBase64(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setDragState: React.Dispatch<React.SetStateAction<boolean>>,
    setBase64?: React.Dispatch<React.SetStateAction<string>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFile(file);
      if (setBase64) {
        const reader = new FileReader();
        reader.onloadend = () => setBase64(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, setDragState: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, setDragState: React.Dispatch<React.SetStateAction<boolean>>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthCertFile || !previousResultFile || !passportPhotoFile) {
      alert("Please upload all required documents (Birth Certificate, Previous Result, Passport Photograph)");
      return;
    }
    const generatedId = `APP-${Math.floor(100000 + Math.random() * 900000)}`;
    setAppId(generatedId);
    localStorage.setItem("ess_latest_app_id", generatedId);
    
    // Save to admissionApps state
    const newApp = {
      id: generatedId,
      name: `${firstName} ${lastName}`.trim(),
      class: classApplying,
      assignedClass: classApplying,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      payment: "Paid",
      phone: parentPhone,
      documentsUrls: {
        birthCert: birthCertBase64,
        previousResult: previousResultBase64,
        passportPhoto: passportPhotoBase64
      }
    };
    setAdmissionApps([newApp, ...admissionApps]);

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div id="print-area" className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200 space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center overflow-hidden">
                 <img src={portalSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900">{portalSettings.schoolName}</h2>
                <p className="text-xs text-slate-500">Application Printout</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Application No.</p>
              <p className="text-xl font-black text-brand-700">{appId}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-4 text-center">
             <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle2 size={36} />
             </div>
             <h3 className="text-2xl font-bold text-slate-900">Application Successful!</h3>
             <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">Please keep this slip and application number safe. You will need it for the entrance examination and further admission processes.</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2 text-slate-700">
            <p className="font-semibold text-slate-900 flex items-center gap-2">
              <FileCheck size={16} className="text-brand-600" /> Attached Documents Summary:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Birth Certificate: <span className="font-medium text-slate-900">{birthCertFile ? birthCertFile.name : 'Not provided'}</span></li>
              <li>Previous School Result: <span className="font-medium text-slate-900">{previousResultFile ? previousResultFile.name : 'Not provided'}</span></li>
              <li>Passport Photograph: <span className="font-medium text-slate-900">{passportPhotoFile ? passportPhotoFile.name : 'Not provided'}</span></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            Print Application Slip
          </Button>
          <Link to="/admission-status">
            <Button variant="outline" className="gap-2 border-brand-200 text-brand-700 bg-brand-50 w-full sm:w-auto">
              <Search size={16} /> Check Admission Status
            </Button>
          </Link>
          <Button variant="brand" onClick={() => {
            setSubmitted(false);
            setBirthCertFile(null);
            setPreviousResultFile(null);
            setPassportPhotoFile(null);
            setFirstName("");
            setLastName("");
            setClassApplying("");
            setParentPhone("");
            setSelectedState("");
            setSelectedLga("");
          }}>
            Submit Another Application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 mb-3">
          <Award size={14} /> 2026/2027 Admission Session
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Online Admission Application</h1>
        <p className="text-slate-600 text-base max-w-2xl mx-auto mb-6">
          Complete the form below and upload all required verification documents to apply for enrollment at {portalSettings.schoolName}.
        </p>
        <Link to="/admission-status" className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-brand-200 text-brand-700 font-bold shadow-sm hover:bg-brand-50 transition-colors">
          <Search size={16} /> Already applied? Check Admission Status
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
              1. Student & Guardian Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Student's first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Student's last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class Applying For</Label>
                <select id="class" value={classApplying} onChange={(e) => setClassApplying(e.target.value)} className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow" required>
                  <option value="">Select a class...</option>
                  <optgroup label="Junior Secondary">
                    {["JSS 1", "JSS 2", "JSS 3"].map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="Senior Secondary">
                    {["SSS 1 Science", "SSS 1 Arts", "SSS 1 Commercial", "SSS 2 Science", "SSS 2 Arts", "SSS 3"].map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State of Origin</Label>
                <select 
                  id="state" 
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedLga("");
                  }}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow" 
                  required
                >
                  <option value="">Select a state...</option>
                  {Object.keys(NIGERIA_STATES).sort().map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lga">Local Government Area</Label>
                <select 
                  id="lga" 
                  value={selectedLga}
                  onChange={(e) => setSelectedLga(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow disabled:bg-slate-100 disabled:text-slate-400" 
                  required
                  disabled={!selectedState}
                >
                  <option value="">Select an LGA...</option>
                  {selectedState && (NIGERIA_STATES as any)[selectedState]?.map((lga: string) => (
                    <option key={lga} value={lga}>{lga}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="parentEmail">Parent / Guardian Email</Label>
                <Input id="parentEmail" type="email" placeholder="parent@example.com" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="parentPhone">Parent / Guardian Phone Number</Label>
                <Input id="parentPhone" type="tel" placeholder="+234 800 000 0000" required />
              </div>
            </div>
          </div>

          {/* Section 2: Document Upload Columns */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
                2. Required Documents Upload
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please upload clear copies of the student's Birth Certificate, Previous School Result, and Passport Photograph (PDF, PNG, JPG max 5MB).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Column 1: Birth Certificate Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                  <span>Birth Certificate <span className="text-rose-500">*</span></span>
                  {birthCertFile && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Uploaded</span>}
                </Label>

                {!birthCertFile ? (
                  <div
                    onDragOver={(e) => handleDragOver(e, setDragActiveBirth)}
                    onDragLeave={(e) => handleDragLeave(e, setDragActiveBirth)}
                    onDrop={(e) => handleDrop(e, setBirthCertFile, setDragActiveBirth, setBirthCertBase64)}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[170px] ${
                      dragActiveBirth ? 'border-brand-500 bg-brand-50/50' : 'border-slate-300 hover:border-brand-400 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      id="birthCert"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, setBirthCertFile, setBirthCertBase64)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-800">
                      Drag & drop Birth Certificate
                    </p>
                    <p className="text-xs text-slate-500 mt-1">or <span className="text-brand-600 underline font-semibold">browse files</span></p>
                    <p className="text-[11px] text-slate-400 mt-2">PDF, PNG or JPG (Max 5MB)</p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-900 truncate">{birthCertFile.name}</p>
                        <p className="text-xs text-slate-500">{(birthCertFile.size / 1024 / 1024).toFixed(2)} MB &middot; Birth Certificate</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBirthCertFile(null)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      title="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Column 2: Previous School Result Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                  <span>Previous School Result / Transcript <span className="text-rose-500">*</span></span>
                  {previousResultFile && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Uploaded</span>}
                </Label>

                {!previousResultFile ? (
                  <div
                    onDragOver={(e) => handleDragOver(e, setDragActiveResult)}
                    onDragLeave={(e) => handleDragLeave(e, setDragActiveResult)}
                    onDrop={(e) => handleDrop(e, setPreviousResultFile, setDragActiveResult, setPreviousResultBase64)}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[170px] ${
                      dragActiveResult ? 'border-brand-500 bg-brand-50/50' : 'border-slate-300 hover:border-brand-400 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      id="previousResult"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, setPreviousResultFile, setPreviousResultBase64)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-800">
                      Drag & drop Previous Result
                    </p>
                    <p className="text-xs text-slate-500 mt-1">or <span className="text-brand-600 underline font-semibold">browse files</span></p>
                    <p className="text-[11px] text-slate-400 mt-2">PDF, PNG or JPG (Max 5MB)</p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-900 truncate">{previousResultFile.name}</p>
                        <p className="text-xs text-slate-500">{(previousResultFile.size / 1024 / 1024).toFixed(2)} MB &middot; Academic Record</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviousResultFile(null)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      title="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Column 3: Passport Photograph Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                  <span>Passport Photograph <span className="text-rose-500">*</span></span>
                  {passportPhotoFile && <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Uploaded</span>}
                </Label>
                {!passportPhotoFile ? (
                  <div
                    onDragOver={(e) => handleDragOver(e, setDragActivePassport)}
                    onDragLeave={(e) => handleDragLeave(e, setDragActivePassport)}
                    onDrop={(e) => handleDrop(e, setPassportPhotoFile, setDragActivePassport, setPassportPhotoBase64)}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[170px] ${
                      dragActivePassport ? 'border-brand-500 bg-brand-50/50' : 'border-slate-300 hover:border-brand-400 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      id="passportPhoto"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, setPassportPhotoFile, setPassportPhotoBase64)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-800">
                      Drag & drop Passport Photo
                    </p>
                    <p className="text-xs text-slate-500 mt-1">or <span className="text-brand-600 underline font-semibold">browse files</span></p>
                    <p className="text-[11px] text-slate-400 mt-2">PNG or JPG (Max 5MB)</p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-900 truncate">{passportPhotoFile.name}</p>
                        <p className="text-xs text-slate-500">{(passportPhotoFile.size / 1024 / 1024).toFixed(2)} MB &middot; Passport Photo</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPassportPhotoFile(null)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      title="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Document Verification Notice:</strong> Ensure uploaded documents are legible and clear. Scanned official documents will speed up your application processing.
              </span>
            </div>
          </div>

          {/* Section 3: Online Payment */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
                3. Admission Form Payment
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                A non-refundable application fee of ₦{parseInt(admissionSettings.appFee || "5000").toLocaleString()} is required to process your admission.
              </p>
            </div>
            <div className="p-5 bg-brand-50 border border-brand-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-sm font-bold text-brand-900">Application Fee</p>
                <p className="text-3xl font-black text-brand-700">₦{parseInt(admissionSettings.appFee || "5000").toLocaleString()}.00</p>
              </div>
              
              <div className="flex-1 w-full sm:w-auto bg-white p-4 rounded-lg border border-brand-100 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Direct Bank Transfer Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-600">Bank Name:</span>
                  <span className="font-bold text-slate-900">{admissionSettings.bankName || "Guaranty Trust Bank (GTB)"}</span>
                  
                  <span className="text-slate-600">Account Name:</span>
                  <span className="font-bold text-slate-900">{admissionSettings.accountName || "Emmanuel Secondary School"}</span>
                  
                  <span className="text-slate-600">Account No:</span>
                  <span className="font-bold text-slate-900 font-mono tracking-wider">{admissionSettings.accountNumber || "0123456789"}</span>
                </div>
              </div>
              
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full sm:w-auto border-brand-600 text-brand-700 hover:bg-brand-100 font-bold" onClick={() => alert("Redirecting to secure payment gateway...")}>
                  Pay Now Online
                </Button>
              </div>
            </div>
          </div>


          <div className="pt-4 border-t border-slate-100">
            <Button type="submit" variant="brand" className="w-full text-base h-12">
              Submit Admission Application & Documents
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

