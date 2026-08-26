import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { User, Mail, Phone, MapPin, Save, CheckCircle2, Upload, Camera } from "lucide-react";
import { useStudents } from "../../data/studentsData";

export default function StudentProfile() {
  const [students, setStudentsState] = useStudents();
  const [student, setStudent] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loggedInId = localStorage.getItem('loggedInStudentId');
    if (loggedInId) {
      const found = students.find(s => s.id === loggedInId || s.name.toLowerCase().includes(loggedInId.toLowerCase()));
      if (found) setStudent(found);
      else setStudent(students[0]);
    } else {
      setStudent(students[0]);
    }
  }, [students]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    
    // Update global state
    const updatedStudents = students.map(s => s.id === student.id ? student : s);
    setStudentsState(updatedStudents);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!student) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold font-heading text-slate-900">My Profile</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your personal information and contact details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm md:col-span-1 bg-brand-900 text-white text-center">
          <CardContent className="p-8 space-y-4">
            <div className="relative w-32 h-32 mx-auto group">
              <div className="w-full h-full bg-brand-800 rounded-full overflow-hidden flex items-center justify-center text-4xl font-bold text-brand-100 border-4 border-brand-700">
                {student.passportUrl ? (
                  <img src={student.passportUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  student.name.charAt(0)
                )}
              </div>
              <label htmlFor="passportUpload" className="absolute bottom-0 right-0 w-10 h-10 bg-white text-brand-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-slate-100 transition-colors border border-slate-200">
                <Camera size={18} />
                <input 
                  id="passportUpload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setStudent({...student, passportUrl: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <h3 className="font-bold text-lg">{student.name}</h3>
              <p className="text-brand-300 text-sm">{student.id}</p>
            </div>
            <div className="inline-block px-3 py-1 bg-brand-800 rounded-full text-xs font-semibold uppercase tracking-wider text-brand-200">
              Class: {student.class}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm md:col-span-2">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <User size={18} className="text-brand-600" /> Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={student.name} 
                    onChange={e => setStudent({...student, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select 
                    id="gender"
                    value={student.gender}
                    onChange={e => setStudent({...student, gender: e.target.value})}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400"/> Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={student.email || ""} 
                    onChange={e => setStudent({...student, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400"/> Parent/Guardian Phone</Label>
                  <Input 
                    id="phone" 
                    value={student.parentNumber || ""} 
                    onChange={e => setStudent({...student, parentNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address" className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400"/> Contact Address</Label>
                  <Input 
                    id="address" 
                    value={student.address || ""} 
                    onChange={e => setStudent({...student, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {saved ? (
                  <span className="text-emerald-600 font-medium text-sm flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Profile Updated
                  </span>
                ) : (
                  <span></span>
                )}
                <Button type="submit" variant="brand" className="gap-2">
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
