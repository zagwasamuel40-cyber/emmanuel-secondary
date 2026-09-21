import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea } from "@/src/components/ui";
import { Building, GraduationCap, Shield, Save, Bell, Plus, Trash2, Users, Database, CheckCircle2, AlertTriangle, Download, ArrowRight, Server, Target, Compass, Eye, Sparkles, RotateCcw, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSessions, TERMS } from "../data/sessionsData";
import { usePortalSettings } from "../data/portalSettingsData";
import { useDatabaseSync, exportFullDatabaseJson } from "../lib/databaseSync";
import { testSupabaseConnection } from "../lib/supabase";

export default function Settings() {
  const [sessions, setSessions] = useSessions();
  const [newSession, setNewSession] = useState("");
  const [portalSettings, setPortalSettings] = usePortalSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [saveFeedback, setSaveFeedback] = useState("");

  const { config, isConnected, saveCredentials, disconnectDatabase } = useDatabaseSync();
  const [dbUrl, setDbUrl] = useState(config.url || "");
  const [dbKey, setDbKey] = useState(config.anonKey || "");
  const [dbTesting, setDbTesting] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleAddSession = () => {
    if (newSession.trim() && !sessions.includes(newSession.trim())) {
      setSessions([...sessions, newSession.trim()]);
      setNewSession("");
    }
  };

  const handleRemoveSession = (sess: string) => {
    setSessions(sessions.filter(s => s !== sess));
  };

  const handleSaveChanges = () => {
    setSaveFeedback("Settings saved successfully!");
    setTimeout(() => setSaveFeedback(""), 4000);
  };

  const handleTestDb = async () => {
    setDbTesting(true);
    setDbTestResult(null);
    try {
      const res = await testSupabaseConnection(dbUrl, dbKey);
      setDbTestResult(res);
    } finally {
      setDbTesting(false);
    }
  };

  const handleSaveDb = () => {
    saveCredentials(dbUrl, dbKey);
    setSaveFeedback("Database credentials updated!");
    setTimeout(() => setSaveFeedback(""), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">System Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Configure school details, academic session, and preferences.</p>
        </div>
        <Button variant="brand" className="gap-2" onClick={handleSaveChanges}>
          <Save size={16} />
          Save Changes
        </Button>
      </div>

      {saveFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {saveFeedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-2">
          <button onClick={() => setActiveTab("general")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "general" ? "bg-white border border-slate-200" : "border border-transparent hover:bg-slate-50"}`}>
            <Building size={18} className={activeTab === "general" ? "text-brand-600" : "text-slate-500"} />
            <div>
              <p className={`font-medium text-sm ${activeTab === "general" ? "text-slate-900" : "text-slate-700"}`}>General Information</p>
              <p className="text-xs text-slate-500">School name, logo, contact</p>
            </div>
          </button>

          <button onClick={() => setActiveTab("vision_mission")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "vision_mission" ? "bg-white border border-slate-200" : "border border-transparent hover:bg-slate-50"}`}>
            <Target size={18} className={activeTab === "vision_mission" ? "text-brand-600" : "text-slate-500"} />
            <div>
              <p className={`font-medium text-sm ${activeTab === "vision_mission" ? "text-slate-900" : "text-slate-700"}`}>Vision &amp; Mission</p>
              <p className="text-xs text-slate-500">School philosophy &amp; purpose</p>
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
          <button onClick={() => setActiveTab("database")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "database" ? "bg-white border border-slate-200" : "border border-transparent hover:bg-slate-50"}`}>
            <Database size={18} className={activeTab === "database" ? "text-brand-600" : "text-slate-500"} />
            <div>
              <p className={`font-medium text-sm ${activeTab === "database" ? "text-slate-900" : "text-slate-700"}`}>Database & Cloud</p>
              <p className="text-xs text-slate-500">Postgres / Supabase connection</p>
            </div>
          </button>

          <button onClick={() => setActiveTab("security")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "security" ? "bg-white border border-slate-200" : "border border-transparent hover:bg-slate-50"}`}>
            <Shield size={18} className={activeTab === "security" ? "text-brand-600" : "text-slate-500"} />
            <div>
              <p className={`font-medium text-sm ${activeTab === "security" ? "text-slate-900" : "text-slate-700"}`}>Security & Access</p>
              <p className="text-xs text-slate-500">Roles, passwords, backups</p>
            </div>
          </button>

          <button onClick={() => setActiveTab("notifications")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "notifications" ? "bg-white border border-slate-200" : "border border-transparent hover:bg-slate-50"}`}>
            <Bell size={18} className={activeTab === "notifications" ? "text-brand-600" : "text-slate-500"} />
            <div>
              <p className={`font-medium text-sm ${activeTab === "notifications" ? "text-slate-900" : "text-slate-700"}`}>Notifications</p>
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

                  {/* School Vision & Mission Statements */}
                  <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
                          <Target size={18} className="text-brand-600" />
                          School Vision &amp; Mission Statements
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Displayed publicly on the About Us page, homepage, and official school portal.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("vision_mission")}
                        className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 hover:underline"
                      >
                        Advanced Editor &amp; Preview <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="generalMission" className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <Target size={15} className="text-brand-600" /> Our Mission
                        </Label>
                        <Textarea 
                          id="generalMission" 
                          rows={4}
                          value={portalSettings.mission || ""} 
                          onChange={(e) => setPortalSettings({mission: e.target.value})} 
                          placeholder="To provide comprehensive education that empowers students with knowledge, skills, and values..."
                        />
                        <p className="text-[11px] text-slate-500">The core purpose and actionable commitment of the school.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="generalVision" className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <Compass size={15} className="text-amber-600" /> Our Vision
                        </Label>
                        <Textarea 
                          id="generalVision" 
                          rows={4}
                          value={portalSettings.vision || ""} 
                          onChange={(e) => setPortalSettings({vision: e.target.value})} 
                          placeholder="To be the premier secondary educational institution in Nigeria, recognized globally..."
                        />
                        <p className="text-[11px] text-slate-500">The long-term institutional aspiration and future benchmark.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "vision_mission" && (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-900">
                        <Target size={20} className="text-brand-600" />
                        School Vision &amp; Mission Statements
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-1">
                        Define and customize the core educational philosophy, mission statement, and long-term vision for {portalSettings.schoolName}.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link 
                        to="/about" 
                        target="_blank" 
                        className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        <ExternalLink size={14} /> View Public Page
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Inspirational Template Chips */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <p className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" /> Quick Preset Inspiration (Click to load):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPortalSettings({
                            mission: "To provide holistic, high-standard secondary education that empowers young minds with intellectual vigor, moral discipline, and technological literacy.",
                            vision: "To be recognized as a premier center of academic excellence and character building, nurturing transformative leaders for Nigeria and the world."
                          });
                        }}
                        className="text-xs px-3 py-1.5 bg-white hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors shadow-2xs"
                      >
                        Academic &amp; Character Leadership
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPortalSettings({
                            mission: "To cultivate a rigorous learning environment prioritizing STEM, creative critical thinking, and character molding for 21st-century problem solvers.",
                            vision: "To be a leading science, innovation, and digital excellence hub among secondary institutions in West Africa."
                          });
                        }}
                        className="text-xs px-3 py-1.5 bg-white hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors shadow-2xs"
                      >
                        STEM &amp; Innovation Focus
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPortalSettings({
                            mission: "To provide comprehensive education that empowers students with the knowledge, skills, and values needed to excel in a rapidly changing world.",
                            vision: "To be the premier secondary educational institution in Nigeria, recognized globally for academic excellence and character development."
                          });
                        }}
                        className="text-xs px-3 py-1.5 bg-white hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors shadow-2xs flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> Reset to Default
                      </button>
                    </div>
                  </div>

                  {/* Mission Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="schoolMission" className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-md bg-brand-50 text-brand-700 flex items-center justify-center">
                          <Target size={14} />
                        </div>
                        Our Mission Statement
                      </Label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {(portalSettings.mission || "").length} characters
                      </span>
                    </div>
                    <Textarea 
                      id="schoolMission" 
                      rows={4}
                      value={portalSettings.mission || ""} 
                      onChange={(e) => setPortalSettings({mission: e.target.value})} 
                      placeholder="Enter your school's official mission statement here..."
                      className="text-sm leading-relaxed"
                    />
                    <p className="text-xs text-slate-500">
                      States what your school does today, whom it serves, and how it delivers educational excellence.
                    </p>
                  </div>

                  {/* Vision Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="schoolVision" className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
                          <Compass size={14} />
                        </div>
                        Our Vision Statement
                      </Label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {(portalSettings.vision || "").length} characters
                      </span>
                    </div>
                    <Textarea 
                      id="schoolVision" 
                      rows={4}
                      value={portalSettings.vision || ""} 
                      onChange={(e) => setPortalSettings({vision: e.target.value})} 
                      placeholder="Enter your school's long-term vision statement here..."
                      className="text-sm leading-relaxed"
                    />
                    <p className="text-xs text-slate-500">
                      States where your school aspires to be in the future and the legacy it aims to build.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="brand" className="gap-2" onClick={handleSaveChanges}>
                      <Save size={16} /> Save Vision &amp; Mission
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Live Public Display Preview */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-900 text-white pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2 text-white">
                      <Eye size={16} className="text-amber-400" />
                      Live Public Display Preview (As seen on About Us &amp; Homepage)
                    </CardTitle>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
                      Real-time sync
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mission Preview Box */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                          <Target size={18} />
                        </div>
                        <h4 className="font-heading text-lg font-bold text-slate-900">Our Mission</h4>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                        {portalSettings.mission || <span className="text-slate-400 italic">No mission statement provided. Enter one above.</span>}
                      </p>
                    </div>

                    {/* Vision Preview Box */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                          <Compass size={18} />
                        </div>
                        <h4 className="font-heading text-lg font-bold text-slate-900">Our Vision</h4>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                        {portalSettings.vision || <span className="text-slate-400 italic">No vision statement provided. Enter one above.</span>}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                                      newTeam[index].photoUrl = reader.result as string;
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

          {activeTab === "database" && (
            <Card className="border-0 shadow-sm space-y-6">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="text-indigo-600" size={20} />
                      Cloud Database & Supabase Configuration
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure your PostgreSQL or Supabase backend to sync all 18 institutional collections.
                    </p>
                  </div>
                  <Link to="/dashboard/database">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                      Open Database Center <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  isConnected 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}>
                  <div className="flex items-center gap-3">
                    {isConnected ? (
                      <CheckCircle2 size={20} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={20} className="text-amber-600" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">
                        {isConnected ? "Connected to Cloud Database" : "Local Storage Fallback Mode"}
                      </p>
                      <p className="text-xs opacity-80">
                        {isConnected ? `Active URL: ${config.url}` : "Currently operating offline with local persistence."}
                      </p>
                    </div>
                  </div>
                  {isConnected && (
                    <Button variant="outline" size="sm" onClick={disconnectDatabase} className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50">
                      Disconnect
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="settingsDbUrl">Supabase / Postgres URL</Label>
                    <Input 
                      id="settingsDbUrl" 
                      placeholder="https://xyzcompany.supabase.co" 
                      value={dbUrl} 
                      onChange={(e) => setDbUrl(e.target.value)} 
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="settingsDbKey">Anon Public API Key</Label>
                    <Input 
                      id="settingsDbKey" 
                      type="password" 
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                      value={dbKey} 
                      onChange={(e) => setDbKey(e.target.value)} 
                      className="font-mono text-xs"
                    />
                  </div>

                  {dbTestResult && (
                    <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                      dbTestResult.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}>
                      {dbTestResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span>{dbTestResult.message}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <Button variant="outline" size="sm" onClick={handleTestDb} disabled={dbTesting || !dbUrl} className="gap-2 text-xs">
                      <Server size={14} />
                      {dbTesting ? "Testing..." : "Test Connection"}
                    </Button>
                    <Button variant="brand" size="sm" onClick={handleSaveDb} disabled={!dbUrl || !dbKey} className="gap-2 text-xs">
                      <Save size={14} />
                      Update Database Connection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="border-0 shadow-sm space-y-6">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="text-indigo-600" size={20} />
                  Security & Authentication Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-sm font-semibold text-slate-800">Role-Based Access Control (RBAC)</h4>
                    <p className="text-xs text-slate-500">
                      System roles strictly compartmentalize features while granting every administrator normal Staff/Teacher workspace features.
                    </p>
                    <div className="pt-2">
                      <Link to="/dashboard/teachers">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5">
                          Manage Staff Roles & Permissions <ArrowRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-sm font-semibold text-slate-800">Database Disaster Recovery</h4>
                    <p className="text-xs text-slate-500">
                      Export an instantaneous, full snapshot of all 18 school tables to your local device.
                    </p>
                    <div className="pt-2">
                      <Button variant="brand" size="sm" onClick={() => {
                        const json = exportFullDatabaseJson();
                        const blob = new Blob([json], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `ESS_Backup_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }} className="text-xs gap-1.5">
                        <Download size={14} /> Download Full System Backup
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="border-0 shadow-sm space-y-6">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="text-indigo-600" size={20} />
                  Portal & Communications Notification Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="portalNotice">Public Portal Marquee Notice</Label>
                  <Textarea 
                    id="portalNotice" 
                    value={portalSettings.portalNotice} 
                    onChange={(e) => setPortalSettings({ portalNotice: e.target.value })} 
                    rows={3}
                  />
                  <p className="text-xs text-slate-400">
                    This notice appears at the top of the public homepage and student admission landing portal.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button variant="brand" size="sm" onClick={handleSaveChanges} className="gap-2 text-xs">
                    <Save size={14} />
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
