import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { UserPlus, CheckCircle2, QrCode, Printer, Download, Eye, Sparkles } from "lucide-react";
import { CLASSES, generateNextStudentId } from "../../data/studentsData";
import { ensureStudentHasIdCard, useIDCardDesignSettings } from "../../data/idCardAndAttendanceData";
import StudentIDCard from "../../components/idcard/StudentIDCard";

export default function RegisterStudent({ students, setStudents }: any) {
  const [designSettings] = useIDCardDesignSettings();
  const [successMsg, setSuccessMsg] = useState("");
  const [registeredStudent, setRegisteredStudent] = useState<any | null>(null);
  const [registeredCard, setRegisteredCard] = useState<any | null>(null);
  const [showIdPreviewModal, setShowIdPreviewModal] = useState(false);

  const [newStudent, setNewStudent] = useState({ 
    name: "", 
    class: CLASSES[0], 
    gender: "Male", 
    address: "", 
    email: "", 
    parentName: "", 
    parentNumber: "", 
    password: "", 
    dob: "2012-05-14",
    bloodGroup: "O+",
    picture: null as File | null,
    passportUrl: ""
  });

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStudent(prev => ({
          ...prev,
          picture: file,
          passportUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate student IDs by calculating next unique index
    const id = generateNextStudentId(students);

    const studentRecord = { 
      id, 
      status: "Active", 
      fees: "Unpaid", 
      previousClass: "None (New)", 
      enrollmentStatus: "Newly Enrolled", 
      name: newStudent.name,
      class: newStudent.class,
      gender: newStudent.gender,
      address: newStudent.address,
      email: newStudent.email || `${newStudent.name.toLowerCase().replace(/\s+/g, '.')}.ess@gmail.com`,
      parentName: newStudent.parentName,
      parentNumber: newStudent.parentNumber,
      dob: newStudent.dob,
      bloodGroup: newStudent.bloodGroup,
      passportUrl: newStudent.passportUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80"
    };

    // Automatically create unique ID card and unique QR code
    const card = ensureStudentHasIdCard(studentRecord);

    // Save student to global roster
    setStudents([studentRecord, ...students]);
    
    setRegisteredStudent(studentRecord);
    setRegisteredCard(card);
    setShowIdPreviewModal(true);
    setSuccessMsg(`Student ${newStudent.name} registered successfully with ID: ${id}. Official digital ID card & secure QR Code generated!`);

    // Reset form
    setNewStudent({ 
      name: "", 
      class: CLASSES[0], 
      gender: "Male", 
      address: "", 
      email: "", 
      parentName: "", 
      parentNumber: "", 
      password: "", 
      dob: "2012-05-14",
      bloodGroup: "O+",
      picture: null,
      passportUrl: "" 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={22} />
            <div>
              <p className="font-bold text-sm">Registration Complete & ID Card Generated</p>
              <p className="text-xs text-emerald-700 mt-0.5">{successMsg}</p>
            </div>
          </div>
          {registeredStudent && (
            <Button
              size="sm"
              variant="brand"
              onClick={() => setShowIdPreviewModal(true)}
              className="text-xs gap-1.5 shrink-0"
            >
              <Eye size={14} />
              View ID Card
            </Button>
          )}
        </div>
      )}

      <Card className="border-0 shadow-sm max-w-2xl">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus size={20} className="text-amber-400" />
              Register New Student & Issue ID Card
            </CardTitle>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Auto QR Generation
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Fill in the details below. An official printable/digital ID card and unique scannable QR code will be generated automatically upon submission.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student Full Name</Label>
                <Input 
                  value={newStudent.name} 
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})} 
                  placeholder="e.g. Samuel Terungwa Zagwa" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Class / Arm</Label>
                <select 
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm" 
                  value={newStudent.class} 
                  onChange={e => setNewStudent({...newStudent, class: e.target.value})}
                >
                  {CLASSES.filter(c => !c.includes("Graduated")).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <select 
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm" 
                  value={newStudent.gender} 
                  onChange={e => setNewStudent({...newStudent, gender: e.target.value})}
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input 
                  type="date"
                  value={newStudent.dob} 
                  onChange={e => setNewStudent({...newStudent, dob: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <select 
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm" 
                  value={newStudent.bloodGroup} 
                  onChange={e => setNewStudent({...newStudent, bloodGroup: e.target.value})}
                >
                  <option value="O+">O+ (Positive)</option>
                  <option value="O-">O- (Negative)</option>
                  <option value="A+">A+ (Positive)</option>
                  <option value="A-">A- (Negative)</option>
                  <option value="B+">B+ (Positive)</option>
                  <option value="B-">B- (Negative)</option>
                  <option value="AB+">AB+ (Positive)</option>
                  <option value="AB-">AB- (Negative)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Parent/Guardian Phone</Label>
                <Input 
                  value={newStudent.parentNumber} 
                  onChange={e => setNewStudent({...newStudent, parentNumber: e.target.value})} 
                  placeholder="+234..." 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Parent/Guardian Full Name</Label>
                <Input 
                  value={newStudent.parentName} 
                  onChange={e => setNewStudent({...newStudent, parentName: e.target.value})} 
                  placeholder="e.g. Mr. John Zagwa" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Student Email Address</Label>
                <Input 
                  type="email" 
                  value={newStudent.email} 
                  onChange={e => setNewStudent({...newStudent, email: e.target.value})} 
                  placeholder="student@ess.edu.ng" 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Passport Photograph (For ID Card)</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                    {newStudent.passportUrl ? (
                      <img src={newStudent.passportUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold text-center p-1">No Photo</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePictureChange} 
                      className="text-xs" 
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Clear passport photo on white/neutral background recommended for physical ID card.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Home Address</Label>
                <Input 
                  value={newStudent.address} 
                  onChange={e => setNewStudent({...newStudent, address: e.target.value})} 
                  placeholder="Full residential address in Makurdi/Benue State" 
                  required 
                />
              </div>
            </div>

            <Button type="submit" variant="brand" className="w-full gap-2 shadow-sm">
              <Sparkles size={16} />
              Register Student & Auto-Generate ID Card
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* INSTANT ID CARD PREVIEW MODAL */}
      {showIdPreviewModal && registeredStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 max-w-md w-full relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  New Student ID Card Issued!
                </h3>
                <p className="text-xs text-slate-500">
                  Ready to print, download, or view in student portal.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIdPreviewModal(false)}
                className="h-8 text-xs"
              >
                Done
              </Button>
            </div>

            <StudentIDCard
              student={registeredStudent}
              cardInfo={registeredCard}
              customization={designSettings}
              showActions={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
