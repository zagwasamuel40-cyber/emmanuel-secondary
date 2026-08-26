import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea } from "@/src/components/ui";
import { Building, GraduationCap, Shield, Save, Bell, Plus, Trash2 } from "lucide-react";
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
        </div>
      </div>
    </div>
  );
}
