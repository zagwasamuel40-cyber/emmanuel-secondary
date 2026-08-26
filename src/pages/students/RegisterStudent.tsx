import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { UserPlus, CheckCircle2 } from "lucide-react";
import { CLASSES } from "../../data/studentsData";

export default function RegisterStudent({ students, setStudents }: any) {
  const [successMsg, setSuccessMsg] = useState("");
  const [newStudent, setNewStudent] = useState({ 
    name: "", class: CLASSES[0], gender: "Male", address: "", email: "", parentName: "", parentNumber: "", password: "", picture: null as File | null 
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `ESS/2026/${String(students.length + 1).padStart(3, '0')}`;
    setStudents([{ 
      id, 
      status: "Active", 
      fees: "Unpaid", 
      previousClass: "None (New)", 
      enrollmentStatus: "Newly Enrolled", 
      ...newStudent 
    }, ...students]);
    
    setSuccessMsg(`Student ${newStudent.name} registered successfully with ID: ${id}`);
    setNewStudent({ name: "", class: CLASSES[0], gender: "Male", address: "", email: "", parentName: "", parentNumber: "", password: "", picture: null });
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}

      <Card className="border-0 shadow-sm max-w-2xl">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus size={20} className="text-brand-400" />
            Register New Student
          </CardTitle>
          <p className="text-slate-400 text-xs mt-1">Fill in the details below to add a new student to the system.</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} placeholder="e.g. Samuel Zagwa" required />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <select className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm" value={newStudent.class} onChange={e => setNewStudent({...newStudent, class: e.target.value})}>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <select className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm" value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Parent/Guardian Phone</Label>
                <Input value={newStudent.parentNumber} onChange={e => setNewStudent({...newStudent, parentNumber: e.target.value})} placeholder="+234..." required />
              </div>
              <div className="space-y-2">
                <Label>Parent/Guardian Full Name</Label>
                <Input value={newStudent.parentName} onChange={e => setNewStudent({...newStudent, parentName: e.target.value})} placeholder="e.g. Mr. John Zagwa" required />
              </div>
              <div className="space-y-2">
                <Label>Student Email Address</Label>
                <Input type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} placeholder="student@example.com" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Student Picture (Optional)</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {newStudent.picture ? (
                      <img src={URL.createObjectURL(newStudent.picture)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">No Img</span>
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={e => setNewStudent({...newStudent, picture: e.target.files?.[0] || null})} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Home Address</Label>
                <Input value={newStudent.address} onChange={e => setNewStudent({...newStudent, address: e.target.value})} placeholder="Full residential address" required />
              </div>
            </div>
            <Button type="submit" variant="brand" className="w-full">Complete Registration</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
