import React, { useState, useEffect, useRef } from "react";
import { NIGERIA_STATES } from "../../data/nigeriaStates";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui";
import { useAdmissionApps } from "../../data/studentsData";
import { usePortalSettings, useAdmissionSettings } from "../../data/portalSettingsData";
import { UploadCloud, FileText, CheckCircle2, Trash2, ShieldAlert, Award, FileCheck, Search, Image as ImageIcon, ClipboardList, LogIn, Save, ArrowRight, Eye, Check, Monitor } from "lucide-react";
import { Link } from "react-router-dom";

export default function Admissions() {
  const [admissionApps, setAdmissionApps] = useAdmissionApps();
  const [portalSettings] = usePortalSettings();
  const [admissionSettings] = useAdmissionSettings();

  const [view, setView] = useState<"inquiry" | "guidelines" | "resume" | "apply" | "review" | "success" | "cbt">("inquiry");

  const [galleryIndex, setGalleryIndex] = useState(0);

  // Form Data
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dob: "",
    placeOfBirth: "",
    nationality: "Nigerian",
    state: "",
    lga: "",
    address: "",
    phone: "",
    email: "",
    parentName: "",
    parentRelationship: "",
    parentPhone: "",
    parentEmail: "",
    parentOccupation: "",
    parentAddress: "",
    previousSchool: "",
    previousClass: "",
    lastClassAttended: "",
    examResults: "",
    yearOfCompletion: "",
    classApplying: "",
    preferredSession: "2026/2027"
  });

  const [draftAppId, setDraftAppId] = useState("");
  const [draftPassword, setDraftPassword] = useState("");
  
  const [resumeAppId, setResumeAppId] = useState("");
  const [resumePassword, setResumePassword] = useState("");
  const [resumeError, setResumeError] = useState("");

  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [previousResultFile, setPreviousResultFile] = useState<File | null>(null);
  const [passportPhotoFile, setPassportPhotoFile] = useState<File | null>(null);
  const [birthCertBase64, setBirthCertBase64] = useState<string>("");
  const [previousResultBase64, setPreviousResultBase64] = useState<string>("");
  const [passportPhotoBase64, setPassportPhotoBase64] = useState<string>("");
  const [transferCertFile, setTransferCertFile] = useState<File | null>(null);
  const [transferCertBase64, setTransferCertBase64] = useState<string>("");
  const [primaryCertFile, setPrimaryCertFile] = useState<File | null>(null);
  const [primaryCertBase64, setPrimaryCertBase64] = useState<string>("");
  const [medicalCertFile, setMedicalCertFile] = useState<File | null>(null);
  const [medicalCertBase64, setMedicalCertBase64] = useState<string>("");
  const [otherDocFile, setOtherDocFile] = useState<File | null>(null);
  const [otherDocBase64, setOtherDocBase64] = useState<string>("");

  const [confirmed, setConfirmed] = useState(false);

  // Image Gallery Effect
  useEffect(() => {
    if (view === "inquiry" && admissionSettings.galleryImages?.length > 1) {
      const intervalId = setInterval(() => {
        setGalleryIndex((prev) => (prev + 1) % admissionSettings.galleryImages.length);
      }, (admissionSettings.imageRotationInterval || 2) * 1000);
      return () => clearInterval(intervalId);
    }
  }, [view, admissionSettings.galleryImages, admissionSettings.imageRotationInterval]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-save logic (if we are in "apply" view)
    if (view === "apply") {
       if (!draftAppId) {
         const newId = `APP-${Math.floor(10000000 + Math.random() * 90000000)}`;
         const newPass = Math.random().toString(36).slice(-8);
         setDraftAppId(newId);
         setDraftPassword(newPass);
         
         // In a real app we'd save to database here, for now we save to local storage
         const newApp = {
           id: newId,
           password: newPass,
           status: "Draft",
           ...formData,
           [name]: value // updated field
         };
         setAdmissionApps([newApp, ...admissionApps]);
       } else {
         // Update existing draft
         const updatedApps = admissionApps.map(app => {
           if (app.id === draftAppId) {
             return { ...app, ...formData, [name]: value };
           }
           return app;
         });
         setAdmissionApps(updatedApps);
       }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>, setBase64: React.Dispatch<React.SetStateAction<string>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
         const b64 = reader.result as string;
         setBase64(b64);
         if (draftAppId) {
             const updatedApps = admissionApps.map(app => {
               if (app.id === draftAppId) {
                 return { 
                   ...app, 
                   documentsUrls: { 
                     ...app.documentsUrls,
                     [e.target.name]: b64
                   } 
                 };
               }
               return app;
             });
             setAdmissionApps(updatedApps);
         }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResume = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = admissionApps.find(a => a.id === resumeAppId && a.password === resumePassword);
    if (existing) {
      if (existing.status === "Submitted") {
        setResumeError("This application has already been submitted. Please check admission status instead.");
        return;
      }
      setDraftAppId(existing.id);
      setDraftPassword(existing.password);
      setFormData({
        firstName: existing.firstName || "",
        middleName: existing.middleName || "",
        lastName: existing.lastName || "",
        gender: existing.gender || "",
        dob: existing.dob || "",
        placeOfBirth: existing.placeOfBirth || "",
        nationality: existing.nationality || "Nigerian",
        state: existing.state || "",
        lga: existing.lga || "",
        address: existing.address || "",
        phone: existing.phone || "",
        email: existing.email || "",
        parentName: existing.parentName || "",
        parentRelationship: existing.parentRelationship || "",
        parentPhone: existing.parentPhone || "",
        parentEmail: existing.parentEmail || "",
        parentOccupation: existing.parentOccupation || "",
        parentAddress: existing.parentAddress || "",
        previousSchool: existing.previousSchool || "",
        previousClass: existing.previousClass || "",
        lastClassAttended: existing.lastClassAttended || "",
        examResults: existing.examResults || "",
        yearOfCompletion: existing.yearOfCompletion || "",
        classApplying: existing.classApplying || existing.class || "",
        preferredSession: existing.preferredSession || "2026/2027"
      });
      if (existing.documentsUrls) {
        setBirthCertBase64(existing.documentsUrls.birthCert || "");
        setPreviousResultBase64(existing.documentsUrls.previousResult || "");
        setPassportPhotoBase64(existing.documentsUrls.passportPhoto || "");
        setTransferCertBase64(existing.documentsUrls.transferCert || "");
        setPrimaryCertBase64(existing.documentsUrls.primaryCert || "");
        setMedicalCertBase64(existing.documentsUrls.medicalCert || "");
        setOtherDocBase64(existing.documentsUrls.otherDoc || "");
      }
      setView("apply");
    } else {
      setResumeError("Invalid Application Code or Password.");
    }
  };

  const submitFinal = () => {
    if (!confirmed) return;
    const updatedApps = admissionApps.map(app => {
      if (app.id === draftAppId) {
        return { 
          ...app, 
          status: "Submitted",
          date: new Date().toISOString().split("T")[0],
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          class: formData.classApplying,
          payment: "Pending" // Assuming payment comes next or separate
        };
      }
      return app;
    });
    setAdmissionApps(updatedApps);
    setView("success");
  };

  const copyAppCode = () => {
    navigator.clipboard.writeText(`App Code: ${draftAppId} | Password: ${draftPassword}`);
    alert("Copied to clipboard!");
  };

  if (view === "inquiry") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 mb-3">
            <Award size={14} /> 2026/2027 Admission Session
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-slate-900 mb-4">Admission Inquiry</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Welcome to {portalSettings.schoolName}. Start your journey with us today.
          </p>
        </div>

        {admissionSettings.galleryImages && admissionSettings.galleryImages.length > 0 && (
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-xl mb-12">
            {admissionSettings.galleryImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Gallery image ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === galleryIndex ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <h2 className="text-white text-2xl font-bold">Discover Excellence</h2>
            </div>
            {admissionSettings.galleryImages.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {admissionSettings.galleryImages.map((_, idx) => (
                  <div key={idx} className={`w-2.5 h-2.5 rounded-full ${idx === galleryIndex ? "bg-white" : "bg-white/40"}`} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button size="lg" variant="brand" className="w-full sm:w-auto text-lg gap-2 px-8" onClick={() => setView("guidelines")}>
            <ClipboardList size={20} /> 📋 GUIDELINES
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg gap-2 px-8 border-slate-300" onClick={() => setView("resume")}>
            <LogIn size={20} /> Resume Application
          </Button>
          <Link to="/admission-status">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg gap-2 px-8 bg-brand-50 border-brand-200 text-brand-700">
              <Search size={20} /> Check Admission Status
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (view === "guidelines") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
            <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-brand-600" /> ADMISSION APPLICATION GUIDELINES
            </h2>
          </div>
          <div className="p-8 overflow-y-auto prose prose-slate max-w-none prose-headings:font-heading prose-headings:text-slate-900 prose-a:text-brand-600">
            {admissionSettings.guidelines ? (
              <div dangerouslySetInnerHTML={{ __html: admissionSettings.guidelines.replace(/\n/g, '<br/>').replace(/### (.*?)\n/g, '<h3>$1</h3>').replace(/## (.*?)\n/g, '<h2>$1</h2>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ) : (
              <p>No guidelines configured.</p>
            )}
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4 justify-end sticky bottom-0 z-10">
            <Button variant="outline" onClick={() => setView("inquiry")} className="px-8">
              CLOSE
            </Button>
            <Button variant="brand" onClick={() => setView("apply")} className="px-8 gap-2 text-base font-bold">
              APPLY NOW <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "resume") {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="text-brand-600" /> Resume Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResume} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resumeAppId">Application Code</Label>
                <Input id="resumeAppId" required value={resumeAppId} onChange={(e) => setResumeAppId(e.target.value)} placeholder="e.g. APP-12345678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resumePassword">Password</Label>
                <Input id="resumePassword" type="password" required value={resumePassword} onChange={(e) => setResumePassword(e.target.value)} placeholder="********" />
              </div>
              {resumeError && <p className="text-sm text-red-600 font-medium">{resumeError}</p>}
              <div className="pt-4 flex gap-3 flex-col">
                <Button type="submit" variant="brand" className="w-full">Continue Application</Button>
                <Button type="button" variant="ghost" onClick={() => setView("inquiry")}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "apply") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Application Status: <span className="text-amber-600">Draft / Incomplete</span></h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Your application is automatically saved as a draft. You can leave and return later using the details below.
            </p>
          </div>
          {draftAppId && (
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm min-w-[250px]">
              <div className="flex justify-between items-center mb-2 border-b pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Save Your Details</span>
                <button onClick={copyAppCode} className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1">
                  <Save size={12} /> COPY
                </button>
              </div>
              <p className="text-sm flex justify-between"><span className="text-slate-500">App Code:</span> <strong className="text-slate-900">{draftAppId}</strong></p>
              <p className="text-sm flex justify-between"><span className="text-slate-500">Password:</span> <strong className="text-slate-900">{draftPassword}</strong></p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={(e) => { e.preventDefault(); setView("review"); }} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
                Applicant's Main Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>First Name <span className="text-red-500">*</span></Label>
                  <Input name="firstName" required value={formData.firstName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Middle Name</Label>
                  <Input name="middleName" value={formData.middleName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name <span className="text-red-500">*</span></Label>
                  <Input name="lastName" required value={formData.lastName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth <span className="text-red-500">*</span></Label>
                  <Input name="dob" type="date" required value={formData.dob} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Place of Birth <span className="text-red-500">*</span></Label>
                  <Input name="placeOfBirth" required value={formData.placeOfBirth} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Nationality <span className="text-red-500">*</span></Label>
                  <Input name="nationality" required value={formData.nationality} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Gender <span className="text-red-500">*</span></Label>
                  <select name="gender" required value={formData.gender} onChange={handleInputChange as any} className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number <span className="text-red-500">*</span></Label>
                  <Input name="phone" required value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className="space-y-2 sm:col-span-3">
                  <Label>Email Address</Label>
                  <Input name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-2 sm:col-span-3">
                  <Label>Residential Address <span className="text-red-500">*</span></Label>
                  <Input name="address" required value={formData.address} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>State of Origin <span className="text-red-500">*</span></Label>
                  <select name="state" required value={formData.state} onChange={handleInputChange as any} className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">Select State</option>
                    {Object.keys(NIGERIA_STATES).map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Local Government Area</Label>
                  <Input name="lga" value={formData.lga} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
                Parent/Guardian Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Parent/Guardian Name <span className="text-red-500">*</span></Label>
                  <Input name="parentName" required value={formData.parentName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Relationship <span className="text-red-500">*</span></Label>
                  <Input name="parentRelationship" required value={formData.parentRelationship} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number <span className="text-red-500">*</span></Label>
                  <Input name="parentPhone" required value={formData.parentPhone} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input name="parentEmail" type="email" value={formData.parentEmail} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input name="parentOccupation" value={formData.parentOccupation} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Address <span className="text-red-500">*</span></Label>
                  <Input name="parentAddress" required value={formData.parentAddress} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Previous School</Label>
                  <Input name="previousSchool" value={formData.previousSchool} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Previous Class</Label>
                  <Input name="previousClass" value={formData.previousClass} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Last Class Attended</Label>
                  <Input name="lastClassAttended" value={formData.lastClassAttended} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label>Year of Completion</Label>
                  <Input name="yearOfCompletion" value={formData.yearOfCompletion} onChange={handleInputChange} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Examination/Academic Results</Label>
                  <Input name="examResults" value={formData.examResults} onChange={handleInputChange} placeholder="e.g. Common Entrance Score: 85%" />
                </div>
                <div className="space-y-2">
                  <Label>Class Applying For <span className="text-red-500">*</span></Label>
                  <select name="classApplying" required value={formData.classApplying} onChange={handleInputChange as any} className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">Select Class</option>
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="SSS 1">SSS 1</option>
                    <option value="SSS 2">SSS 2</option>
                  </select>
                </div>
                
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
                Document Uploads
              </h3>
              <p className="text-sm text-slate-500 mb-4">Please upload clear copies of the required documents.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3"><ImageIcon size={20} /></div>
                  <Label className="block text-sm font-bold text-slate-700 mb-1">Passport Photo <span className="text-red-500">*</span></Label>
                  <input type="file" name="passportPhoto" required={!passportPhotoBase64} accept="image/*" onChange={(e) => handleFileChange(e, setPassportPhotoFile, setPassportPhotoBase64)} className="text-xs w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold" />
                  {passportPhotoBase64 && <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1"><Check size={14}/> Uploaded</div>}
                </div>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3"><FileText size={20} /></div>
                  <Label className="block text-sm font-bold text-slate-700 mb-1">Birth Certificate <span className="text-red-500">*</span></Label>
                  <input type="file" name="birthCert" required={!birthCertBase64} accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setBirthCertFile, setBirthCertBase64)} className="text-xs w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold" />
                  {birthCertBase64 && <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1"><Check size={14}/> Uploaded</div>}
                </div>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3"><FileCheck size={20} /></div>
                  <Label className="block text-sm font-bold text-slate-700 mb-1">Previous Result <span className="text-red-500">*</span></Label>
                  <input type="file" name="previousResult" required={!previousResultBase64} accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setPreviousResultFile, setPreviousResultBase64)} className="text-xs w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold" />
                  {previousResultBase64 && <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1"><Check size={14}/> Uploaded</div>}
                </div>
              
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3"><FileText size={20} /></div>
                  <Label className="block text-sm font-bold text-slate-700 mb-1">Transfer Certificate</Label>
                  <input type="file" name="transferCert" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setTransferCertFile, setTransferCertBase64)} className="text-xs w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold" />
                  {transferCertBase64 && <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1"><Check size={14}/> Uploaded</div>}
                </div>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3"><Award size={20} /></div>
                  <Label className="block text-sm font-bold text-slate-700 mb-1">Primary School Cert.</Label>
                  <input type="file" name="primaryCert" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setPrimaryCertFile, setPrimaryCertBase64)} className="text-xs w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold" />
                  {primaryCertBase64 && <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1"><Check size={14}/> Uploaded</div>}
                </div>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3"><FileText size={20} /></div>
                  <Label className="block text-sm font-bold text-slate-700 mb-1">Medical/Health Cert.</Label>
                  <input type="file" name="medicalCert" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, setMedicalCertFile, setMedicalCertBase64)} className="text-xs w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold" />
                  {medicalCertBase64 && <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center justify-center gap-1"><Check size={14}/> Uploaded</div>}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setView("inquiry")} className="flex-1">Save & Exit</Button>
              <Button type="submit" variant="brand" className="flex-1">Review Application <ArrowRight size={16} className="ml-2"/></Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === "review") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold font-heading text-slate-900 mb-6 text-center">Review Your Application</h2>
        <Card className="mb-8">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-xl">Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div><span className="text-slate-500 text-sm">Full Name:</span> <p className="font-bold text-slate-900">{formData.firstName} {formData.middleName} {formData.lastName}</p></div>
              <div><span className="text-slate-500 text-sm">Date of Birth:</span> <p className="font-bold text-slate-900">{formData.dob}</p></div>
              <div><span className="text-slate-500 text-sm">Gender:</span> <p className="font-bold text-slate-900">{formData.gender}</p></div>
              <div><span className="text-slate-500 text-sm">Class Applying:</span> <p className="font-bold text-slate-900">{formData.classApplying}</p></div>
              <div><span className="text-slate-500 text-sm">Phone:</span> <p className="font-bold text-slate-900">{formData.phone}</p></div>
              <div><span className="text-slate-500 text-sm">Email:</span> <p className="font-bold text-slate-900">{formData.email || 'N/A'}</p></div>
              <div className="sm:col-span-2"><span className="text-slate-500 text-sm">Address:</span> <p className="font-bold text-slate-900">{formData.address}</p></div>
              <div><span className="text-slate-500 text-sm">Parent Name:</span> <p className="font-bold text-slate-900">{formData.parentName}</p></div>
              <div><span className="text-slate-500 text-sm">Parent Phone:</span> <p className="font-bold text-slate-900">{formData.parentPhone}</p></div>
              <div><span className="text-slate-500 text-sm">Nationality:</span> <p className="font-bold text-slate-900">{formData.nationality}</p></div>
              <div><span className="text-slate-500 text-sm">State & LGA:</span> <p className="font-bold text-slate-900">{formData.state} - {formData.lga}</p></div>
              <div><span className="text-slate-500 text-sm">Previous School:</span> <p className="font-bold text-slate-900">{formData.previousSchool}</p></div>
            </div>
            
            <h4 className="mt-8 mb-4 font-bold text-slate-900 border-b pb-2">Uploaded Documents</h4>
            <div className="flex gap-6 flex-wrap">
              {passportPhotoBase64 ? <span className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg"><Check size={16}/> Passport Photo</span> : <span className="text-red-500 font-bold">Missing Passport Photo</span>}
              {birthCertBase64 ? <span className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg"><Check size={16}/> Birth Certificate</span> : <span className="text-red-500 font-bold">Missing Birth Certificate</span>}
              {previousResultBase64 ? <span className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg"><Check size={16}/> Previous Result</span> : <span className="text-red-500 font-bold">Missing Previous Result</span>}
            
              {transferCertBase64 ? <span className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg"><Check size={16}/> Transfer Certificate</span> : null}
              {primaryCertBase64 ? <span className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg"><Check size={16}/> Primary School Cert.</span> : null}
              {medicalCertBase64 ? <span className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg"><Check size={16}/> Medical/Health Cert.</span> : null}
            </div>
          </CardContent>
        </Card>

        <div className="bg-brand-50 border border-brand-200 rounded-xl p-6 mb-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-slate-300" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            <span className="text-slate-800 font-medium">I confirm that the information and documents provided are correct and belong to me. I understand that incorrect information or invalid documents may result in the rejection of my application.</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" size="lg" onClick={() => setView("apply")}>Back to Edit</Button>
          <Button variant="brand" size="lg" disabled={!confirmed} onClick={submitFinal}>SUBMIT APPLICATION</Button>
        </div>
      </div>
    );
  }

  if (view === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold font-heading text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-600 mb-6 text-lg">Your application has been successfully submitted and is now under review.</p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 text-left">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Your Application Code</p>
            <p className="text-3xl font-black text-brand-700 mb-4">{draftAppId}</p>
            <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
              <strong>IMPORTANT:</strong> Please keep this code safe. You will need it to check your admission status and access your CBT examination dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="brand" size="lg" onClick={() => {
              // Usually we might log them into the applicant dashboard here.
              // We'll redirect to the CBT view in this flow for demo purposes.
              setView("cbt");
            }}>
              Go to Applicant Dashboard (CBT)
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Print Application Slip
            </Button>
            <Link to="/admission-status">
              <Button variant="ghost" className="w-full text-slate-500">
                Check Admission Status
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (view === "cbt") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => setView("success")} className="gap-2 text-slate-500">
            ← Back
          </Button>
          <h2 className="text-2xl font-bold font-heading text-slate-900">Applicant Dashboard</h2>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-bold text-sm">Submitted</span>
              <p className="text-slate-600">Application Code: <strong>{draftAppId}</strong></p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-brand-200 shadow-md">
          <CardHeader className="bg-brand-50 border-b border-brand-100">
            <CardTitle className="text-brand-900 flex items-center gap-2">
              <Monitor size={20} className="text-brand-600" /> CBT Examination
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 uppercase font-bold">Exam Date</span>
                <p className="font-bold text-slate-900 text-lg">{admissionSettings.entranceExamDate || "TBA"}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 uppercase font-bold">Time</span>
                <p className="font-bold text-slate-900 text-lg">9:00 AM Prompt</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 sm:col-span-2">
                <span className="text-xs text-slate-500 uppercase font-bold">Venue</span>
                <p className="font-bold text-slate-900 text-lg">School Main ICT Lab</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 mt-4">
              <strong>Instructions:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Arrive at least 30 minutes before the scheduled time.</li>
                <li>Bring a printed copy of your application slip.</li>
                <li>No calculators or mobile devices allowed in the exam hall.</li>
              </ul>
            </div>
            
            {/* The actual CBT link or action would go here */}
            <div className="pt-4 text-center">
               <Link to="/entrance-exam">
                 <Button variant="brand" size="lg" className="w-full sm:w-auto">Take CBT Examination</Button>
               </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
