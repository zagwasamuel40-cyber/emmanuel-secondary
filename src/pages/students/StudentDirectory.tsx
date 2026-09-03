import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { Search, Filter, Edit, Trash2, Eye, X, CheckCircle, Camera } from "lucide-react";
import { CLASSES } from "../../data/studentsData";

export default function StudentDirectory({ students, setStudents }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const filteredStudents = students.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || s.status === filterStatus || s.fees === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleImpersonateStudent = (student: any) => {
    localStorage.setItem('originalAdminUserId', localStorage.getItem('loggedInUserId') || '');
    localStorage.setItem('originalAdminRoles', localStorage.getItem('userRoles') || '');
    localStorage.setItem('originalAdminRole', localStorage.getItem('userRole') || '');

    localStorage.setItem('loggedInStudentId', student.id);
    localStorage.setItem('userRole', 'student');
    localStorage.setItem('impersonatingName', student.name);
    localStorage.setItem('impersonatingType', 'student');
    
    window.location.href = '/student';
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Are you sure you want to withdraw/deactivate this student? Their historical records and dashboard will be preserved.")) {
      setStudents(students.map((s: any) => {
        if (s.id === id) {
          return { ...s, status: 'Withdrawn' };
        }
        return s;
      }));
      setSuccessMsg("Student has been marked as Withdrawn. Their records have been preserved.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleReactivate = (id: string) => {
    if(window.confirm("Are you sure you want to reactivate this student account?")) {
      setStudents(students.map((s: any) => {
        if (s.id === id) {
          return { ...s, status: 'Active' };
        }
        return s;
      }));
      setSuccessMsg("Student account has been reactivated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setStudents(students.map((s: any) => s.id === editingStudent.originalId ? {
      ...s,
      name: editingStudent.name,
      id: editingStudent.id,
      class: editingStudent.class,
      status: editingStudent.status,
      passportUrl: editingStudent.passportUrl
    } : s));
    setSuccessMsg("Student details updated successfully.");
    setEditingStudent(null);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-emerald-500" size={20} />
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
          <div className="flex flex-1 w-full gap-4 flex-col sm:flex-row">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Search by name, ID or class..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative shrink-0 sm:w-48">
              <select 
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none font-medium text-slate-700"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Graduated">Graduated</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="Suspended">Suspended</option>
                <option value="Inactive">Inactive</option>
              </select>
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Admission No.</th>
                <th className="px-6 py-4 font-semibold">Class</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student: any, idx: number) => (
                <tr key={`${student.id}_${idx}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold overflow-hidden shrink-0">
                        {student.passportUrl ? (
                          <img src={student.passportUrl} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{student.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{student.class}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      student.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                      student.status === 'Graduated' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      student.status === 'Withdrawn' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      student.status === 'Suspended' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-rose-100 text-rose-800 border-rose-200'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleImpersonateStudent(student)} 
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="View Dashboard"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => setEditingStudent({...student, originalId: student.id})} 
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Student"
                      >
                        <Edit size={16} />
                      </button>
                      {student.status === 'Active' ? (
                        <button 
                          onClick={() => handleDelete(student.id)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Withdraw / Deactivate Student"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleReactivate(student.id)} 
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Reactivate Student Account"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Edit Student Modal for Name and Admission Number */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md border-0 shadow-2xl animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white rounded-t-xl flex flex-row items-center justify-between pb-4">
              <CardTitle>Edit Student Details</CardTitle>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 group">
                    <div className="w-full h-full bg-slate-100 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-400 border-2 border-slate-200">
                      {editingStudent.passportUrl ? (
                        <img src={editingStudent.passportUrl} alt={editingStudent.name} className="w-full h-full object-cover" />
                      ) : (
                        editingStudent.name?.charAt(0) || '?'
                      )}
                    </div>
                    <label htmlFor="adminPassportUpload" className="absolute bottom-0 right-0 w-8 h-8 bg-white text-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow border border-slate-200 hover:bg-slate-50 transition-colors">
                      <Camera size={14} />
                      <input 
                        id="adminPassportUpload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingStudent({...editingStudent, passportUrl: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Student Full Name</Label>
                  <Input 
                    value={editingStudent.name} 
                    onChange={e => setEditingStudent({...editingStudent, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Admission Number (ID)</Label>
                  <Input 
                    value={editingStudent.id} 
                    onChange={e => setEditingStudent({...editingStudent, id: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                    value={editingStudent.class}
                    onChange={e => setEditingStudent({...editingStudent, class: e.target.value})}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                    value={editingStudent.status}
                    onChange={e => setEditingStudent({...editingStudent, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Withdrawn">Withdrawn</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingStudent(null)}>Cancel</Button>
                  <Button type="submit" variant="brand" className="flex-1">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
