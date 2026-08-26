import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { Layout, Eye, Settings, MessageSquare, Plus, Trash2, X, CheckCircle2, Bell, Sparkles, Palette, Shield, Building, Globe, Phone, Mail, Award, Edit3, Image as ImageIcon, Save } from "lucide-react";
import { useAnnouncements, Announcement } from "../data/announcementsData";
import { useResultsRelease, isResultReleased } from "../data/resultsReleaseData";
import { useSessions } from "../data/sessionsData";
import { usePortalSettings, PortalSettings } from "../data/portalSettingsData";
import { FileText, Upload } from "lucide-react";
import { useGallery } from "../data/galleryData";
import { Camera } from "lucide-react";
import { useComments } from "../data/commentsData";
import { Star, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";

export default function StudentPortalManager() {
  const [announcements, setAnnouncements] = useAnnouncements();
  const [portalSettings, updatePortalSettings] = usePortalSettings();
  const [releaseMap, updateRelease] = useResultsRelease();
  const [sessions, , currentSession] = useSessions();
  const [activeTab, setActiveTab] = useState<"news" | "branding" | "features" | "comments" | "gallery">("branding");
  const resultCheckingReleased = isResultReleased(currentSession || "2025/2026", "First Term");

  // Portal Customization Form Local State
  const [schoolName, setSchoolName] = useState(portalSettings.schoolName);
  const [motto, setMotto] = useState(portalSettings.motto);
  const [primaryColor, setPrimaryColor] = useState(portalSettings.primaryColor);
  const [accentColor, setAccentColor] = useState(portalSettings.accentColor);
  const [logoUrl, setLogoUrl] = useState(portalSettings.logoUrl);
  const [welcomeBanner, setWelcomeBanner] = useState(portalSettings.welcomeBanner);
  const [portalNotice, setPortalNotice] = useState(portalSettings.portalNotice);
  const [contactPhone, setContactPhone] = useState(portalSettings.contactPhone);
  const [contactEmail, setContactEmail] = useState(portalSettings.contactEmail);
  const [address, setAddress] = useState(portalSettings.address);

  const [comments, setComments] = useComments();
  const [gallery, setGallery] = useGallery();
  const [features, setFeatures] = useState([
    { id: 1, name: "CBT Module", description: "Allow students to take Computer Based Tests", active: true },
    { id: 2, name: "Finance Tracking", description: "Allow students to view their fee balance", active: true },
    { id: 3, name: "Result Checking", description: "Allow students to check termly results", active: resultCheckingReleased },
    { id: 4, name: "Course Registration", description: "Allow students to select electives", active: false },
    { id: 5, name: "Digital ID Card Generator", description: "Allow students & staff to generate digital IDs", active: true },
    { id: 6, name: "Library Book Reservation", description: "Allow students to reserve books online", active: true },
  ]);

  // Modal State for New Announcement / News Post
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [image, setImage] = useState("");
  const [announcementDate, setAnnouncementDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Theme presets definition
  const themePresets = [
    { id: "navy", name: "Royal Navy", primary: "#0f172a", accent: "#f59e0b", bg: "bg-slate-900" },
    { id: "emerald", name: "Emerald Academic", primary: "#065f46", accent: "#10b981", bg: "bg-emerald-900" },
    { id: "purple", name: "Prestige Purple", primary: "#581c87", accent: "#a855f7", bg: "bg-purple-900" },
    { id: "crimson", name: "Leadership Crimson", primary: "#881337", accent: "#f43f5e", bg: "bg-rose-900" },
    { id: "amber", name: "Golden Amber", primary: "#78350f", accent: "#f59e0b", bg: "bg-amber-900" },
    { id: "slate", name: "Sleek Modern Slate", primary: "#1e293b", accent: "#0284c7", bg: "bg-slate-800" },
  ];

  const handleApplyPreset = (preset: typeof themePresets[0]) => {
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
    updatePortalSettings({
      primaryColor: preset.primary,
      accentColor: preset.accent,
      themePreset: preset.id as any
    });
    setSuccessMsg(`Portal theme updated to ${preset.name}!`);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updatePortalSettings({
      schoolName,
      motto,
      primaryColor,
      accentColor,
      logoUrl,
      welcomeBanner,
      portalNotice,
      contactPhone,
      contactEmail,
      address,
    });
    setSuccessMsg("School portal branding, motto, and theme saved successfully!");
    setTimeout(() => setSuccessMsg(""), 3500);
  };


  // Gallery Form State
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryCaption, setNewGalleryCaption] = useState("");
  const [newGalleryCategory, setNewGalleryCategory] = useState<"Staff" | "Facilities" | "Events" | "Students" | "Other">("Staff");

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newGalleryUrl || !newGalleryCaption) return;
    const newItem = {
      id: `GAL-${Math.floor(1000 + Math.random() * 9000)}`,
      url: newGalleryUrl,
      caption: newGalleryCaption,
      category: newGalleryCategory as any
    };
    setGallery([newItem, ...gallery]);
    setNewGalleryUrl("");
    setNewGalleryCaption("");
    setSuccessMsg("Image added to gallery!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const toggleFeature = (id: number) => {
    if (id === 3) {
      const nextStatus = updateRelease(currentSession || "2025/2026", "First Term", "All Classes");
      setFeatures(features.map(f => f.id === id ? { ...f, active: nextStatus } : f));
      setSuccessMsg(nextStatus ? "Result checking feature enabled and First Term results published!" : "Result checking feature disabled (results unpublished).");
      setTimeout(() => setSuccessMsg(""), 3500);
    } else {
      setFeatures(features.map(f => f.id === id ? { ...f, active: !f.active } : f));
    }
  };

  const deleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const toggleAnnouncementActive = (id: number) => {
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a news / announcement title.");
      return;
    }

    const newAnnouncement: Announcement = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim() || title.trim(),
      date: announcementDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      category: category || "General",
      image: image.trim() || undefined,
      active: true
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setTitle("");
    setContent("");
    setCategory("General");
    setImage("");
    setIsModalOpen(false);

    setSuccessMsg("News post / Announcement published live on school portal!");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-400/20 text-purple-200 border border-purple-400/30">
              <Sparkles size={14} className="text-amber-400" /> Portal Administrator Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              School Portal & News Manager
            </h1>
            <p className="text-purple-100/80 text-xs sm:text-sm">
              Post official news, customize school motto, change portal colors & themes, and configure student portal access.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => window.open('/', '_blank')}>
              <Globe size={16} /> Public Website
            </Button>
            <Button variant="outline" className="gap-2 bg-white text-purple-950 font-bold border-white hover:bg-purple-50" onClick={() => window.open('/student', '_blank')}>
              <Eye size={16} /> Preview Student Portal
            </Button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in shadow-sm">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span className="font-semibold text-sm">{successMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        <button 
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'branding' ? 'bg-purple-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette size={18} /> Portal Branding & Motto
        </button>
        <button 
          onClick={() => setActiveTab("news")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'news' ? 'bg-purple-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare size={18} /> Post News & Announcements
        </button>
        <button 
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'features' ? 'bg-purple-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings size={18} /> Portal Features & Modules
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'comments' ? 'bg-purple-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageCircle size={18} />
          Parent Reviews
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'gallery' ? 'bg-purple-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Camera size={18} />
          School Gallery
        </button>
      </div>

      {/* TAB 1: BRANDING & CUSTOMIZATION */}
      {activeTab === "branding" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette size={20} className="text-purple-600" />
                    <CardTitle>School Identity & Motto Customization</CardTitle>
                  </div>
                  <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-semibold border border-purple-200">
                    Live Portal Branding
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <form onSubmit={handleSaveBranding} className="space-y-6">
                  {/* School Name & Motto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Building size={16} className="text-purple-600" /> School Name
                      </Label>
                      <Input 
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g. Emmanuel Secondary School"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Award size={16} className="text-amber-500" /> School Motto
                      </Label>
                      <Input 
                        value={motto}
                        onChange={(e) => setMotto(e.target.value)}
                        placeholder="e.g. Excellence, Knowledge & Character"
                        required
                      />
                    </div>
                  </div>

                  {/* Motto Banner Message */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-purple-600" /> Portal Ticker Notice / Announcement Banner
                    </Label>
                    <Input 
                      value={portalNotice}
                      onChange={(e) => setPortalNotice(e.target.value)}
                      placeholder="e.g. 2026/2027 Entrance Examinations Registration is now open!"
                    />
                    <p className="text-xs text-slate-500">
                      Appears on the top header ticker of the public website and portal.
                    </p>
                  </div>

                  {/* Theme Presets */}
                  <div className="space-y-3 pt-2">
                    <Label className="font-semibold text-slate-900">Preset Theme Color Schemes</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {themePresets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                            primaryColor === preset.primary ? 'border-purple-600 ring-2 ring-purple-600/30 bg-purple-50/50' : 'border-slate-200 hover:border-purple-300 bg-white'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-full shrink-0 shadow-xs border border-white" style={{ backgroundColor: preset.primary }}></span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{preset.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{preset.primary}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Hex Color Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-slate-900">Custom Primary Hex Color</Label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={primaryColor} 
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                        />
                        <Input 
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="font-mono text-xs uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-semibold text-slate-900">Custom Accent Hex Color</Label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={accentColor} 
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                        />
                        <Input 
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-900">School Crest / Logo</Label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                        <Upload size={16} /> Upload
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setLogoUrl(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </Label>
                    </div>
                  </div>

                  {/* Student Welcome Banner */}
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-900">Student Portal Welcome Banner Text</Label>
                    <textarea 
                      rows={2}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      value={welcomeBanner}
                      onChange={(e) => setWelcomeBanner(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Contact Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-500" /> Portal Contact Phone
                      </Label>
                      <Input 
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Mail size={14} className="text-slate-500" /> Portal Contact Email
                      </Label>
                      <Input 
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="brand" className="w-full gap-2 bg-purple-900 hover:bg-purple-950 text-white font-bold h-11">
                    <Save size={18} /> Save & Apply Portal Customization
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Branding Preview */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-900 text-white pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-white">
                  <Eye size={16} className="text-amber-400" /> Live Header & Motto Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 bg-slate-50">
                {/* Header preview */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white overflow-hidden shrink-0" style={{ backgroundColor: primaryColor }}>
                      {logoUrl ? (
                        <img src={logoUrl} alt="Crest" className="w-full h-full object-cover" />
                      ) : (
                        <Building size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{schoolName || "School Name"}</h4>
                      <p className="text-xs font-semibold italic text-amber-600">"{motto || "School Motto"}"</p>
                    </div>
                  </div>

                  {portalNotice && (
                    <div className="p-2 rounded-lg text-xs font-semibold text-center text-white shadow-2xs flex items-center justify-center gap-1.5" style={{ backgroundColor: primaryColor }}>
                      <Sparkles size={12} style={{ color: accentColor }} />
                      <span className="truncate">{portalNotice}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-900">Welcome Banner Preview:</p>
                    <p className="italic">"{welcomeBanner}"</p>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1 text-purple-950">
                  <p className="font-bold text-purple-900 flex items-center gap-1">
                    <Shield size={14} className="text-purple-600" /> Portal Admin Control
                  </p>
                  <p className="text-slate-600">
                    Changes made here instantly apply across the public school website, student portal, and report cards.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-purple-900 text-white">
              <CardContent className="p-6 text-center space-y-3">
                <h3 className="font-bold text-lg text-white">Student Portal Direct Link</h3>
                <p className="text-xs text-purple-200">Share this link with students for instant access to their academic portal.</p>
                <div className="flex items-center p-2 bg-white/10 rounded-xl border border-white/20">
                  <code className="text-xs flex-1 text-purple-100 select-all overflow-hidden text-ellipsis whitespace-nowrap">
                    https://ess.edu.ng/student
                  </code>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-white hover:bg-white/20" onClick={() => alert("Copied student portal link!")}>
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: POST NEWS & ANNOUNCEMENTS */}
      {activeTab === "news" && (
        <div className="space-y-6 animate-in fade-in">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare size={20} className="text-purple-600" /> Manage School News & Portal Announcements
                </CardTitle>
                <p className="text-slate-500 text-xs mt-1">
                  Publish news, sports updates, academic notices, and holiday announcements to the school portal.
                </p>
              </div>
              <Button 
                size="sm" 
                className="gap-2 shadow-sm font-semibold bg-purple-900 hover:bg-purple-950 text-white"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={16} /> Post New Article
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                    {announcement.image && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                        <img src={announcement.image} alt={announcement.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 cursor-pointer min-w-0" onClick={() => setSelectedAnnouncement(announcement)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm hover:text-purple-600 transition-colors truncate">{announcement.title}</p>
                        {announcement.category && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 shrink-0">
                            {announcement.category}
                          </span>
                        )}
                        {!announcement.active && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{announcement.content || announcement.title}</p>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">{announcement.date}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleAnnouncementActive(announcement.id)}
                        title={announcement.active ? "Hide from student portal" : "Show on student portal"}
                        className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                          announcement.active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {announcement.active ? "Published" : "Hidden"}
                      </button>
                      <button 
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete announcement"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm space-y-3">
                    <p>No active school news or announcements found.</p>
                    <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
                      Post Your First Article
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: FEATURES & MODULE ACCESS */}
      {activeTab === "features" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Settings size={20} className="text-purple-600" />
                  <CardTitle>Student Portal Feature Toggles</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {features.map((feature) => (
                    <div key={feature.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-semibold text-slate-900">{feature.name}</p>
                        <p className="text-sm text-slate-500">{feature.description}</p>
                      </div>
                      <button 
                        onClick={() => toggleFeature(feature.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          feature.active ? 'bg-purple-600' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          feature.active ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-purple-50 border border-purple-200">
              <CardContent className="p-6 text-center space-y-3">
                <Sparkles size={28} className="text-purple-600 mx-auto" />
                <h3 className="font-bold text-purple-950">Module Control Info</h3>
                <p className="text-xs text-purple-800 leading-relaxed">
                  Enabling features immediately turns on student access to exam results, CBT online tests, fee statements, and elective course registration on their dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* MODAL: POST NEW NEWS / ANNOUNCEMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-purple-950 text-white flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-amber-400" />
                <CardTitle className="text-white">Post News Article / Announcement</CardTitle>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </CardHeader>
            <form onSubmit={handleCreateAnnouncement}>
              <CardContent className="p-6 space-y-4 text-sm">
                <div className="space-y-1.5">
                  <Label className="text-slate-900 font-semibold">
                    Article Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    placeholder="e.g., Annual Inter-House Sports Competition Announced" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-900 font-semibold">Category</Label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="General">General News</option>
                      <option value="Academic">Academic Notice</option>
                      <option value="Events">School Event</option>
                      <option value="Sports">Sports</option>
                      <option value="Achievement">Achievement</option>
                      <option value="Holiday">Holiday Notice</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-900 font-semibold">Publish Date</Label>
                    <Input 
                      type="text"
                      placeholder="e.g. Aug 07, 2026"
                      value={announcementDate}
                      onChange={(e) => setAnnouncementDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-900 font-semibold">Article Content / Announcement Details</Label>
                  <textarea
                    rows={4}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Write the full description, official announcement, or news article details..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 font-semibold flex items-center justify-between">
                    <span>Attach Cover Image</span>
                    <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-200 transition-colors shrink-0">
                        <Plus size={14} /> Upload Image File
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageFileUpload}
                        />
                      </label>
                      <Input 
                        placeholder="Or paste Image URL (https://...)" 
                        value={image} 
                        onChange={(e) => setImage(e.target.value)}
                        className="text-xs flex-1"
                      />
                      {image && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-rose-600 hover:text-rose-700 h-9 px-2"
                          onClick={() => setImage("")}
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    {/* Quick Image Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">Image Presets:</span>
                      <button
                        type="button"
                        onClick={() => setImage("https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80")}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 font-medium"
                      >
                        School Building
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage("https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80")}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 font-medium"
                      >
                        Library
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage("https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80")}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 font-medium"
                      >
                        Science Fair
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage("https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80")}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 font-medium"
                      >
                        Sports
                      </button>
                    </div>

                    {image && (
                      <div className="mt-2 relative rounded-xl overflow-hidden h-36 bg-slate-100 border border-slate-200">
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-xs text-purple-950">
                  <Sparkles size={16} className="text-purple-600 shrink-0" />
                  <span>This article will immediately publish live on the public school website news feed & student portal.</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="brand" className="gap-2 bg-purple-900 hover:bg-purple-950 text-white font-bold">
                    <Bell size={16} /> Publish News Article
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: VIEW DETAILS */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-purple-950 text-white flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-amber-400" />
                <CardTitle className="text-white">Published Article Preview</CardTitle>
              </div>
              <button onClick={() => setSelectedAnnouncement(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {selectedAnnouncement.image && (
                <div className="rounded-xl overflow-hidden h-48 w-full bg-slate-100 border border-slate-200">
                  <img src={selectedAnnouncement.image} alt={selectedAnnouncement.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    {selectedAnnouncement.category || "General"}
                  </span>
                  <span className="text-xs text-slate-400">{selectedAnnouncement.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{selectedAnnouncement.title}</h3>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                {selectedAnnouncement.content || selectedAnnouncement.title}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedAnnouncement(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "comments" && (
        <Card className="border border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="text-purple-600" size={20} /> Parent Testimonials & Reviews
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Approve or reject parent comments before they appear on the public homepage.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {comments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No parent comments received yet.</div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                          {comment.parentName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{comment.parentName}</h4>
                          <p className="text-xs text-slate-500">{comment.relation} &bull; {comment.date}</p>
                        </div>
                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                          comment.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          comment.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {comment.status}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm p-4 bg-white border border-slate-200 rounded-xl">
                        "{comment.comment}"
                      </p>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                      {comment.status !== 'Approved' && (
                        <Button 
                          variant="brand" 
                          size="sm" 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2"
                          onClick={() => {
                            setComments(comments.map(c => c.id === comment.id ? { ...c, status: "Approved" } : c));
                            setSuccessMsg("Comment approved successfully!");
                            setTimeout(() => setSuccessMsg(""), 3000);
                          }}
                        >
                          <ThumbsUp size={14} /> Approve
                        </Button>
                      )}
                      {comment.status !== 'Rejected' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200 flex items-center justify-center gap-2"
                          onClick={() => {
                            setComments(comments.map(c => c.id === comment.id ? { ...c, status: "Rejected" } : c));
                            setSuccessMsg("Comment rejected.");
                            setTimeout(() => setSuccessMsg(""), 3000);
                          }}
                        >
                          <ThumbsDown size={14} /> Reject
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-2"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to permanently delete this comment?")) {
                            setComments(comments.filter(c => c.id !== comment.id));
                            setSuccessMsg("Comment deleted.");
                            setTimeout(() => setSuccessMsg(""), 3000);
                          }
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}


      {activeTab === "gallery" && (
        <div className="space-y-6">
          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="text-purple-600" size={20} /> Add New Gallery Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddGalleryItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Image URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        required 
                        value={newGalleryUrl} 
                        onChange={e => setNewGalleryUrl(e.target.value)} 
                        placeholder="e.g. https://images.unsplash.com/photo-..." 
                      />
                      <Label className="cursor-pointer flex items-center justify-center bg-slate-100 border border-slate-200 rounded-md px-3 hover:bg-slate-200 transition-colors">
                        <Upload size={16} className="text-slate-500 mr-2" />
                        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Upload Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewGalleryUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                      value={newGalleryCategory}
                      onChange={e => setNewGalleryCategory(e.target.value as any)}
                    >
                      <option value="Staff">Staff</option>
                      <option value="Facilities">Facilities</option>
                      <option value="Events">Events</option>
                      <option value="Students">Students</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Image Caption</Label>
                    <Input 
                      required 
                      value={newGalleryCaption} 
                      onChange={e => setNewGalleryCaption(e.target.value)} 
                      placeholder="e.g. Our Dedicated Teaching Staff" 
                    />
                  </div>
                </div>
                <Button type="submit" variant="brand" className="w-full">
                  Add to Gallery
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="text-purple-600" size={20} /> Manage Existing Images
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {gallery.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No images in gallery.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {gallery.map(item => (
                    <div key={item.id} className="rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white flex flex-col">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={item.url} 
                          alt={item.caption} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full tracking-wider mb-1">
                            {item.category}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm truncate" title={item.caption}>{item.caption}</h3>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 p-2 h-auto shrink-0 border border-transparent hover:border-rose-100"
                          onClick={() => {
                            if(window.confirm("Are you sure you want to delete this image?")) {
                              setGallery(gallery.filter(g => g.id !== item.id));
                              setSuccessMsg("Image deleted successfully.");
                              setTimeout(() => setSuccessMsg(""), 3000);
                            }
                          }}
                          title="Delete Image"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
