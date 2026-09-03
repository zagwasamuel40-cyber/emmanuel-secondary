import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { User, Mail, Phone, MapPin, Briefcase, Key, Save, CheckCircle2 } from "lucide-react";
import { useTeachers } from "../data/teachersData";

export default function Profile() {
  let userRoles: string[] = [];
  try {
    userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  } catch (e) {}

  if (userRoles.length === 0) {
    const r = localStorage.getItem('userRole') || 'admin';
    if (r === 'admin') userRoles = ['Admin'];
    else if (r === 'superadmin') userRoles = ['Admission Officer'];
    else if (r === 'portaladmin') userRoles = ['Portal Admin'];
    else userRoles = ['Teacher'];
  }

  const [teachers, setTeachers] = useTeachers();
  const loggedInUserId = localStorage.getItem('loggedInUserId');
  const teacher = teachers.find(t => t.id === loggedInUserId);

  const isStaff = userRoles.includes('Teacher');
  const isSuperAdmin = userRoles.includes('Admission Officer');
  const isPortalAdmin = userRoles.includes('Portal Admin');

  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });

  const [profile, setProfile] = useState({
    firstName: teacher ? teacher.name.split(' ')[0] : (isPortalAdmin ? "Portal" : isSuperAdmin ? "Admissions" : "Admin"),
    lastName: teacher ? teacher.name.split(' ').slice(1).join(' ') : (isPortalAdmin ? "Administrator" : isSuperAdmin ? "Officer" : "User"),
    email: teacher ? teacher.email : (isPortalAdmin ? "portaladmin@ess.edu.ng" : isSuperAdmin ? "admission@ess.edu.ng" : "admin@ess.edu.ng"),
    phone: teacher ? teacher.phone : "08012345678",
    address: teacher ? teacher.address : "123 School Road, City",
    department: teacher ? teacher.department : (isPortalAdmin ? "Portal Management & ICT" : isSuperAdmin ? "Admissions & Enrollment" : "Administration"),
    role: teacher ? teacher.role : (isPortalAdmin ? "Portal Administrator (Branding, News & Settings)" : isSuperAdmin ? "Admission Officer (Admissions & Enrollment)" : "System Administrator"),
    bio: teacher ? "Dedicated staff member." : "Official account.",
    passportUrl: teacher ? (teacher.passportUrl || "") : ""
  });

  useEffect(() => {
    if (teacher) {
      setProfile({
        firstName: teacher.name.split(' ')[0],
        lastName: teacher.name.split(' ').slice(1).join(' '),
        email: teacher.email,
        phone: teacher.phone || "08012345678",
        address: teacher.address || "123 School Road, City",
        department: teacher.department,
        role: teacher.role,
        bio: "Dedicated staff member.",
        passportUrl: teacher.passportUrl || ""
      });
    }
  }, [teacher]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    if (teacher) {
      setTeachers(prev => prev.map(t => {
        if (t.id === teacher.id) {
          return {
            ...t,
            name: `${profile.firstName} ${profile.lastName}`,
            email: profile.email,
            phone: profile.phone,
            address: profile.address,
            passportUrl: profile.passportUrl
          };
        }
        return t;
      }));
    }
    setSuccessMsg("Profile updated successfully!");
    setIsEditing(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      alert("New passwords do not match!");
      return;
    }
    if (teacher) {
      if (passwordForm.current !== teacher.password) {
        alert("Current password is incorrect!");
        return;
      }
      setTeachers(prev => prev.map(t => {
        if (t.id === teacher.id) {
          return { ...t, password: passwordForm.new };
        }
        return t;
      }));
    }
    setSuccessMsg("Password updated successfully!");
    setPasswordForm({ current: "", new: "", confirm: "" });
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">View and update your personal information and account settings.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative w-32 h-32 mx-auto group mb-4">
                <div className="w-full h-full bg-brand-100 rounded-full overflow-hidden flex items-center justify-center text-4xl font-bold text-brand-700 border-4 border-brand-200">
                  {profile.passportUrl ? (
                    <img src={profile.passportUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profile.firstName[0] + profile.lastName[0]
                  )}
                </div>
                <label htmlFor="profilePassportUpload" className="absolute bottom-0 right-0 w-10 h-10 bg-white text-brand-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-slate-100 transition-colors border border-slate-200">
                  <User size={18} />
                  <input 
                    id="profilePassportUpload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfile({...profile, passportUrl: reader.result as string});
                          setIsEditing(true);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h2>
              
              <div className="flex flex-wrap gap-1.5 justify-center mt-3 mb-1">
                {userRoles.map((r, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 border border-brand-200 uppercase tracking-wider">
                    {r}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-sm">
                <Briefcase size={16} />
                {profile.department} Department
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button variant="brand" size="sm" onClick={handleSave}>
                    <Save size={16} className="mr-2" /> Save Changes
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      name="firstName" 
                      value={profile.firstName} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      name="lastName" 
                      value={profile.lastName} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      name="email" 
                      type="email"
                      value={profile.email} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      name="phone" 
                      value={profile.phone} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      name="address" 
                      value={profile.address} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key size={18} /> Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input 
                    type="password" 
                    required 
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input 
                    type="password" 
                    required 
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input 
                    type="password" 
                    required 
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  />
                </div>
                <Button type="submit" variant="brand">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
