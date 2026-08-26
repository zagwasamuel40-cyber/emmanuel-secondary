import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { User, Mail, Phone, MapPin, Briefcase, Key, Save, CheckCircle2 } from "lucide-react";

export default function Profile() {
  const role = localStorage.getItem('userRole') || 'admin';
  const isStaff = role === 'teacher' || role === 'staff';
  const isSuperAdmin = role === 'superadmin' || role === 'super_admin' || role === 'admission_admin';
  const isPortalAdmin = role === 'portaladmin' || role === 'portal_admin';

  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });

  const [profile, setProfile] = useState({
    firstName: isPortalAdmin ? "Portal" : isSuperAdmin ? "Admissions" : isStaff ? "Sarah" : "Admin",
    lastName: isPortalAdmin ? "Administrator" : isSuperAdmin ? "Officer" : isStaff ? "Connor" : "User",
    email: isPortalAdmin ? "portaladmin@ess.edu.ng" : isSuperAdmin ? "admission@ess.edu.ng" : isStaff ? "s.connor@ess.edu.ng" : "admin@ess.edu.ng",
    phone: "08012345678",
    address: "123 School Road, City",
    department: isPortalAdmin ? "Portal Management & ICT" : isSuperAdmin ? "Admissions & Enrollment" : isStaff ? "Science" : "Administration",
    role: isPortalAdmin ? "Portal Administrator (Branding, News & Settings)" : isSuperAdmin ? "Admission Officer (Admissions & Enrollment)" : isStaff ? "Senior Teacher" : "System Administrator",
    bio: isPortalAdmin ? "Official Portal Administrator account responsible for news publishing, motto customization, portal theme colors, and student portal settings." : isSuperAdmin ? "Official Admission Officer account responsible for admissions, document verification, and student enrollment." : "Dedicated staff member.",
    passportUrl: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
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
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h2>
              <p className="text-brand-600 font-medium text-sm mt-1">{profile.role}</p>
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
