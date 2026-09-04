import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea } from "@/src/components/ui";
import { Building, GraduationCap, Shield, Save, Bell, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useSessions, TERMS } from "../data/sessionsData";
import { usePortalSettings } from "../data/portalSettingsData";

export default function Settings() {
  const [sessions, setSessions] = useSessions();
  const [newSession, setNewSession] = useState("");
  const [portalSettings, setPortalSettings] = usePortalSettings();
  const [activeTab, setActiveTab] = useState("general");

  const handleAddSession = () => {
    if (newSession.trim() && !sessions.includes(newSession.trim())) {
      setSessions([...sessions, newSession.trim()]);
      setNewSession("");
    }
  };

  const handleRemoveSession = (sess: string) => {
    setSessions(sessions.filter(s => s !== sess));
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">System Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Configure school details, academic session, and preferences.</p>
        </div>
        <Button variant="brand" className="gap-2">
          <Save size={16} />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-2">
          <button onClick={() => setActiveTab("general")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "general" ? "bg-white border border-slate-200" : "border border-transparent hover:bg-slate-50"}`}>
            <Building size={18} className={activeTab === "general" ? "text-brand-600" : "text-slate-500"} />
            <div>
              <p className={`font-medium text-sm ${activeTab === "general" ? "text-slate-900" : "text-slate-700"}`}>General Information</p>
              <p className="text-xs text-slate-500">School name, logo, contact</p>
            </div>
          </button>
          
          <button onClick={() => setActiveTab("academic")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "academic" ? "bg-white border border-slate-200" : "border border-transparent hover:bg-slate-50"}`}>
            <GraduationCap size={18} className={activeTab === "academic" ? "text-brand-600" : "text-slate-500"} />
            <div>
              <p className={`font-medium text-sm ${activeTab === "academic" ? "text-slate-900" : "text-slate-700"}`}>Academic Settings</p>
              <p className="text-xs text-slate-500">Sessions, terms, grading</p>
            </div>
          </button>

          <button onClick={() => setActiveTab("team")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "team" ? "bg-white border border-slate-200" : "border border-transparent hover:bg-slate-50"}`}>
            <Users size={18} className={activeTab === "team" ? "text-brand-600" : "text-slate-500"} />
            <div>
              <p className={`font-medium text-sm ${activeTab === "team" ? "text-slate-900" : "text-slate-700"}`}>Dedicated Team</p>
              <p className="text-xs text-slate-500">Manage school administration team</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent text-left hover:bg-slate-50 transition-colors">
            <Shield size={18} className="text-slate-500" />
            <div>
              <p className="font-medium text-slate-700 text-sm">Security & Access</p>
              <p className="text-xs text-slate-500">Roles, passwords, backups</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent text-left hover:bg-slate-50 transition-colors">
            <Bell size={18} className="text-slate-500" />
            <div>
              <p className="font-medium text-slate-700 text-sm">Notifications</p>
              <p className="text-xs text-slate-500">Email, SMS, circulars</p>
            </div>
          </button>
        </div>

                <div className="lg:col-span-2 space-y-6">
          {activeTab === "general" && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>School Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input id="schoolName" value={portalSettings.schoolName} onChange={(e) => setPortalSettings({schoolName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motto">School Motto</Label>
                    <Input id="motto" value={portalSettings.motto} onChange={(e) => setPortalSettings({motto: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Official Email</Label>
                    <Input id="email" type="email" value={portalSettings.contactEmail} onChange={(e) => setPortalSettings({contactEmail: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={portalSettings.contactPhone} onChange={(e) => setPortalSettings({contactPhone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admissionOfficerName">Admission Officer Name (for Letters)</Label>
                    <Input id="admissionOfficerName" value={portalSettings.admissionOfficerName} onChange={(e) => setPortalSettings({admissionOfficerName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="principalName">Principal Name (for Results)</Label>
                    <Input id="principalName" value={portalSettings.principalName} onChange={(e) => setPortalSettings({principalName: e.target.value})} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="principalSignatureUrl">Principal Signature (Upload Image)</Label>
                    <div className="flex items-center gap-4">
                      {portalSettings.principalSignatureUrl && (
                        <div className="h-12 w-24 bg-slate-50 border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                          <img src={portalSettings.principalSignatureUrl} alt="Signature" className="h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input 
                          id="principalSignatureFile" 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPortalSettings({ principalSignatureUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <p className="text-xs text-slate-500 mt-1">Upload a clear image of the principal's signature with a transparent or white background.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="aboutUsText">About Us Page Text</Label>
                    <Textarea 
                      id="aboutUsText" 
                      rows={5}
                      value={portalSettings.aboutUsText || ""} 
                      onChange={(e) => setPortalSettings({aboutUsText: e.target.value})} 
                      placeholder="Founded with a vision to provide world-class education..."
                    />
                    <p className="text-xs text-slate-500 mt-1">This text will be displayed on the public About Us page.</p>
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="aboutUsImageFile">About Us Page Image (Upload Image)</Label>
                    <div className="flex items-center gap-4">
                      {portalSettings.aboutUsImageUrl && (
                        <div className="h-12 w-24 bg-slate-50 border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                          <img src={portalSettings.aboutUsImageUrl} alt="About Us" className="h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input 
                          id="aboutUsImageFile" 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPortalSettings({ aboutUsImageUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <p className="text-xs text-slate-500 mt-1">Upload an image for the public About Us page.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">School Address</Label>
                    <Input id="address" value={portalSettings.address} onChange={(e) => setPortalSettings({address: e.target.value})} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "academic" && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>Manage Academic Sessions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <Label>Available Sessions</Label>
                  <div className="flex flex-col gap-2">
                    {sessions.map(sess => (
                      <div key={sess} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                        <span className="font-medium text-slate-800">{sess}</span>
                        <button onClick={() => handleRemoveSession(sess)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Label className="mb-2 block">Create New Session</Label>
                    <div className="flex gap-3">
                      <Input 
                        placeholder="e.g. 2027/2028" 
                        value={newSession}
                        onChange={(e) => setNewSession(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button variant="brand" onClick={handleAddSession} className="gap-2">
                        <Plus size={16} /> Add Session
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        
          {activeTab === "team" && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle>Dedicated Team Management</CardTitle>
                <Button variant="brand" size="sm" onClick={() => {
                  setPortalSettings({
                    dedicatedTeam: [...(portalSettings.dedicatedTeam || []), { 
                      id: Date.now().toString(), 
                      name: "", 
                      role: "", 
                      department: "",
                      qualification: "",
                      experienceYears: "",
                      photoUrl: "", 
                      bio: "",
                      published: true,
                      displayOrder: (portalSettings.dedicatedTeam?.length || 0) + 1
                    }]
                  });
                }} className="gap-2">
                  <Plus size={16} /> Add Member
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {(!portalSettings.dedicatedTeam || portalSettings.dedicatedTeam.length === 0) && (
                    <p className="text-slate-500 text-center py-4">No team members added yet.</p>
                  )}
                  {(portalSettings.dedicatedTeam || []).map((member, index) => (
                    <div key={member.id} className="p-4 border border-slate-200 rounded-xl relative bg-slate-50">
                      <button 
                        onClick={() => {
                          const newTeam = [...portalSettings.dedicatedTeam];
                          newTeam.splice(index, 1);
                          setPortalSettings({ dedicatedTeam: newTeam });
                        }}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mr-8">
                        
                        <div className="space-y-2 lg:col-span-2">
                          <Label>Name</Label>
                          <Input value={member.name} onChange={(e) => {
                            const newTeam = [...portalSettings.dedicatedTeam];
                            newTeam[index].name = e.target.value;
                            setPortalSettings({ dedicatedTeam: newTeam });
                          }} placeholder="e.g. Dr. John Doe" />
                        </div>
                        
                        <div className="space-y-2 flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 mt-6 lg:col-span-1">
                          <div className="flex flex-col">
                            <Label className="text-sm">Published</Label>
                            <span className="text-xs text-slate-500">Show on homepage</span>
                          </div>
                          <button 
                            onClick={() => {
                              const newTeam = [...portalSettings.dedicatedTeam];
                              newTeam[index].published = !newTeam[index].published;
                              setPortalSettings({ dedicatedTeam: newTeam });
                            }}
                            className={`w-10 h-5 rounded-full transition-colors p-0.5 ${member.published ? 'bg-emerald-600' : 'bg-slate-300'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${member.published ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Role/Position</Label>
                          <Input value={member.role} onChange={(e) => {
                            const newTeam = [...portalSettings.dedicatedTeam];
                            newTeam[index].role = e.target.value;
                            setPortalSettings({ dedicatedTeam: newTeam });
                          }} placeholder="e.g. Principal" />
                        </div>
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Input value={member.department || ""} onChange={(e) => {
                            const newTeam = [...portalSettings.dedicatedTeam];
                            newTeam[index].department = e.target.value;
                            setPortalSettings({ dedicatedTeam: newTeam });
                          }} placeholder="e.g. Administration" />
                        </div>
                        <div className="space-y-2">
                          <Label>Display Order</Label>
                          <Input type="number" value={member.displayOrder || 0} onChange={(e) => {
                            const newTeam = [...portalSettings.dedicatedTeam];
                            newTeam[index].displayOrder = parseInt(e.target.value) || 0;
                            setPortalSettings({ dedicatedTeam: newTeam });
                          }} />
                        </div>

                        <div className="space-y-2">
                          <Label>Qualification</Label>
                          <Input value={member.qualification || ""} onChange={(e) => {
                            const newTeam = [...portalSettings.dedicatedTeam];
                            newTeam[index].qualification = e.target.value;
                            setPortalSettings({ dedicatedTeam: newTeam });
                          }} placeholder="e.g. Ph.D., B.Ed." />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Years of Experience</Label>
                          <Input type="text" value={member.experienceYears || ""} onChange={(e) => {
                            const newTeam = [...portalSettings.dedicatedTeam];
                            newTeam[index].experienceYears = e.target.value;
                            setPortalSettings({ dedicatedTeam: newTeam });
                          }} placeholder="e.g. 15 Years" />
                        </div>
                        
                        <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                          <Label>Photo (Upload or URL)</Label>
                          <div className="flex gap-4 items-center">
                            {member.photoUrl && (
                              <img src={member.photoUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-slate-300" />
                            )}
                            <div className="flex-1 flex gap-2">
                              <Input value={member.photoUrl} onChange={(e) => {
                                const newTeam = [...portalSettings.dedicatedTeam];
                                newTeam[index].photoUrl = e.target.value;
                                setPortalSettings({ dedicatedTeam: newTeam });
                              }} placeholder="https://..." />
                              <div className="relative overflow-hidden w-24">
                                <Button type="button" variant="outline" className="w-full">Upload</Button>
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const newTeam = [...portalSettings.dedicatedTeam];
                                      newTeam[index].photoUrl = reader.result;
                                      setPortalSettings({ dedicatedTeam: newTeam });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                          <Label>Bio/Description (Optional)</Label>
                          <Textarea value={member.bio || ""} onChange={(e) => {
                            const newTeam = [...portalSettings.dedicatedTeam];
                            newTeam[index].bio = e.target.value;
                            setPortalSettings({ dedicatedTeam: newTeam });
                          }} placeholder="Brief description..." rows={2} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
