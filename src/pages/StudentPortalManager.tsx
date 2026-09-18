import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { Layout, Eye, Settings, MessageSquare, Plus, Trash2, X, CheckCircle2, Bell, Sparkles, Palette, Shield, Building, Globe, Phone, Mail, Award, Edit3, Image as ImageIcon, Save, Target, Compass } from "lucide-react";
import { useAnnouncements, Announcement } from "../data/announcementsData";
import { useResultsRelease, isResultReleased } from "../data/resultsReleaseData";
import { useSessions } from "../data/sessionsData";
import { usePortalSettings, PortalSettings } from "../data/portalSettingsData";
import { FileText, Upload, Calendar as CalendarIcon, Download, UploadCloud } from "lucide-react";
import { useGallery, GalleryItem } from "../data/galleryData";
import { Camera, Video, Film, PlayCircle, Play, EyeOff, Filter, Check } from "lucide-react";
import { VideoPlayer } from "../components/ui/VideoPlayer";
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
  const [mission, setMission] = useState(portalSettings.mission || "To provide comprehensive education that empowers students with the knowledge, skills, and values needed to excel in a rapidly changing world.");
  const [vision, setVision] = useState(portalSettings.vision || "To be the premier secondary educational institution in Nigeria, recognized globally for academic excellence and character development.");

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
      mission,
      vision,
      primaryColor,
      accentColor,
      logoUrl,
      welcomeBanner,
      portalNotice,
      contactPhone,
      contactEmail,
      address,
    });
    setSuccessMsg("School portal branding, motto, vision & mission saved successfully!");
    setTimeout(() => setSuccessMsg(""), 3500);
  };


  // Gallery Form State
  const [newsletterFile, setNewsletterFile] = useState<{name: string, url: string, size: string} | null>(null);
  const [timetableFile, setTimetableFile] = useState<{name: string, url: string, size: string} | null>(null);
  const newsletterInputRef = useRef<HTMLInputElement>(null);
  const timetableInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedNews = localStorage.getItem("ess_newsletter");
    if (storedNews) {
      try { setNewsletterFile(JSON.parse(storedNews)); } catch (e) {}
    }
    const storedTime = localStorage.getItem("ess_timetable");
    if (storedTime) {
      try { setTimetableFile(JSON.parse(storedTime)); } catch (e) {}
    }
  }, []);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'newsletter' | 'timetable') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const fileData = {
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          url: dataUrl
        };
        if (type === 'newsletter') {
          setNewsletterFile(fileData);
          localStorage.setItem("ess_newsletter", JSON.stringify(fileData));
          setSuccessMsg("Newsletter uploaded successfully!");
        } else {
          setTimetableFile(fileData);
          localStorage.setItem("ess_timetable", JSON.stringify(fileData));
          setSuccessMsg("Timetable uploaded successfully!");
        }
        setTimeout(() => setSuccessMsg(""), 3500);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDocument = (type: 'newsletter' | 'timetable') => {
    if (type === 'newsletter') {
      setNewsletterFile(null);
      localStorage.removeItem("ess_newsletter");
      setSuccessMsg("Newsletter removed.");
    } else {
      setTimetableFile(null);
      localStorage.removeItem("ess_timetable");
      setSuccessMsg("Timetable removed.");
    }
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryCaption, setNewGalleryCaption] = useState("");
  const [newGalleryCategory, setNewGalleryCategory] = useState<"Staff" | "Facilities" | "Events" | "Students" | "Other">("Events");
  const [galleryMediaType, setGalleryMediaType] = useState<"image" | "video">("video");
  const [newGalleryDuration, setNewGalleryDuration] = useState("");
  const [videoFileMeta, setVideoFileMeta] = useState<{ name: string; size: string } | null>(null);
  const [galleryFilter, setGalleryFilter] = useState<"all" | "images" | "videos">("all");
  const [activeVideoModal, setActiveVideoModal] = useState<GalleryItem | null>(null);
  const galleryVideoInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

  // News Video State
  const [newsMediaType, setNewsMediaType] = useState<"none" | "image" | "video">("none");
  const [newsVideoUrl, setNewsVideoUrl] = useState("");
  const [newsVideoFileMeta, setNewsVideoFileMeta] = useState<{ name: string; size: string } | null>(null);
  const newsVideoInputRef = useRef<HTMLInputElement>(null);

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeStr = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(1)} KB` 
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    setVideoFileMeta({ name: file.name, size: sizeStr });

    const objUrl = URL.createObjectURL(file);
    setNewGalleryUrl(objUrl);
    setGalleryMediaType("video");

    if (!newGalleryCaption) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setNewGalleryCaption(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    if (file.size < 6 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewGalleryUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewsVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeStr = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(1)} KB` 
      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    setNewsVideoFileMeta({ name: file.name, size: sizeStr });

    const objUrl = URL.createObjectURL(file);
    setNewsVideoUrl(objUrl);
    setNewsMediaType("video");

    if (file.size < 6 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewsVideoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newGalleryUrl || !newGalleryCaption) return;
    const newItem: GalleryItem = {
      id: `GAL-${galleryMediaType === 'video' ? 'VID-' : ''}${Math.floor(1000 + Math.random() * 9000)}`,
      url: newGalleryUrl,
      caption: newGalleryCaption,
      category: newGalleryCategory as any,
      mediaType: galleryMediaType,
      videoSource: videoFileMeta ? "upload" : "direct",
      duration: newGalleryDuration || undefined,
      fileSize: videoFileMeta?.size,
      createdAt: new Date().toISOString().split("T")[0]
    };
    setGallery([newItem, ...gallery]);
    setNewGalleryUrl("");
    setNewGalleryCaption("");
    setNewGalleryDuration("");
    setVideoFileMeta(null);
    setSuccessMsg(galleryMediaType === "video" ? "Video uploaded and published to gallery!" : "Image added to gallery!");
    setTimeout(() => setSuccessMsg(""), 3500);
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
      image: newsMediaType === "image" ? image.trim() || undefined : undefined,
      videoUrl: newsMediaType === "video" ? (newsVideoUrl.trim() || undefined) : undefined,
      mediaType: newsMediaType === "none" ? undefined : newsMediaType,
      active: true
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setTitle("");
    setContent("");
    setCategory("General");
    setImage("");
    setNewsVideoUrl("");
    setNewsVideoFileMeta(null);
    setNewsMediaType("none");
    setIsModalOpen(false);

    setSuccessMsg(newsMediaType === "video" ? "News story with video published live on portal!" : "News post / Announcement published live on school portal!");
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
          <Video size={18} />
          Media & Video Gallery
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

                  {/* School Mission & Vision */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Target size={15} className="text-purple-600" /> School Mission Statement
                        </Label>
                        <span className="text-[11px] text-slate-400 font-mono">{mission.length} chars</span>
                      </div>
                      <textarea 
                        rows={3}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={mission}
                        onChange={(e) => setMission(e.target.value)}
                        placeholder="Enter the official school mission statement..."
                      ></textarea>
                      <p className="text-[11px] text-slate-500">Displayed on the public About Us page and institutional documents.</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Compass size={15} className="text-amber-500" /> School Vision Statement
                        </Label>
                        <span className="text-[11px] text-slate-400 font-mono">{vision.length} chars</span>
                      </div>
                      <textarea 
                        rows={3}
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={vision}
                        onChange={(e) => setVision(e.target.value)}
                        placeholder="Enter the official school vision statement..."
                      ></textarea>
                      <p className="text-[11px] text-slate-500">Displayed on the public About Us page and institutional documents.</p>
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

                  {/* Vision & Mission Preview */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Target size={13} className="text-purple-600" /> Mission Preview:
                      </div>
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">{mission}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Compass size={13} className="text-amber-500" /> Vision Preview:
                      </div>
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">{vision}</p>
                    </div>
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

          {/* DOCUMENT & TIMETABLE UPLOAD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" /> Upload School Newsletter
                </CardTitle>
                <p className="text-xs text-slate-500">Upload the latest newsletter document (PDF, Word) for students to download.</p>
              </CardHeader>
              <CardContent className="p-4">
                {newsletterFile ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 truncate">{newsletterFile.name}</p>
                        <p className="text-xs text-slate-500">{newsletterFile.size} &middot; Uploaded</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <a 
                        href={newsletterFile.url} 
                        download={newsletterFile.name}
                        className="flex-1 inline-flex justify-center items-center gap-2 h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors"
                      >
                        <Download size={14} /> Download
                      </a>
                      <button 
                        onClick={() => removeDocument('newsletter')}
                        className="h-9 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center justify-center"
                        title="Remove Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => newsletterInputRef.current?.click()}>
                    <input 
                      type="file" 
                      ref={newsletterInputRef}
                      className="hidden" 
                      accept=".pdf,.doc,.docx" 
                      onChange={(e) => handleDocumentUpload(e, 'newsletter')} 
                    />
                    <UploadCloud size={32} className="mx-auto text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" />
                    <p className="text-sm font-bold text-slate-900 mb-1">Upload Newsletter</p>
                    <p className="text-xs text-slate-500">PDF or Word (Max 5MB)</p>
                    <Button size="sm" variant="outline" className="mt-4 rounded-full bg-white font-medium text-xs">
                      Browse Files
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon size={18} className="text-emerald-600" /> Upload Class Timetable
                </CardTitle>
                <p className="text-xs text-slate-500">Upload the official timetable document for students to view or download.</p>
              </CardHeader>
              <CardContent className="p-4">
                {timetableFile ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CalendarIcon size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 truncate">{timetableFile.name}</p>
                        <p className="text-xs text-slate-500">{timetableFile.size} &middot; Uploaded</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <a 
                        href={timetableFile.url} 
                        download={timetableFile.name}
                        className="flex-1 inline-flex justify-center items-center gap-2 h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors"
                      >
                        <Download size={14} /> Download
                      </a>
                      <button 
                        onClick={() => removeDocument('timetable')}
                        className="h-9 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center justify-center"
                        title="Remove Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => timetableInputRef.current?.click()}>
                    <input 
                      type="file" 
                      ref={timetableInputRef}
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.jpg,.png" 
                      onChange={(e) => handleDocumentUpload(e, 'timetable')} 
                    />
                    <UploadCloud size={32} className="mx-auto text-slate-400 group-hover:text-emerald-500 mb-3 transition-colors" />
                    <p className="text-sm font-bold text-slate-900 mb-1">Upload Timetable</p>
                    <p className="text-xs text-slate-500">PDF, Word, or Image (Max 5MB)</p>
                    <Button size="sm" variant="outline" className="mt-4 rounded-full bg-white font-medium text-xs">
                      Browse Files
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-900 font-semibold">Attach Media (Photo or Video)</Label>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => { setNewsMediaType("none"); setImage(""); setNewsVideoUrl(""); setNewsVideoFileMeta(null); }}
                        className={`px-2.5 py-1 rounded-md transition-colors ${newsMediaType === "none" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
                      >
                        None
                      </button>
                      <button
                        type="button"
                        onClick={() => { setNewsMediaType("image"); setNewsVideoUrl(""); setNewsVideoFileMeta(null); }}
                        className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${newsMediaType === "image" ? "bg-white text-purple-700 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
                      >
                        <Camera size={13} /> Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => { setNewsMediaType("video"); setImage(""); }}
                        className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${newsMediaType === "video" ? "bg-purple-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
                      >
                        <Video size={13} /> Video
                      </button>
                    </div>
                  </div>

                  {/* IMAGE ATTACHMENT MODE */}
                  {newsMediaType === "image" && (
                    <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-200 transition-colors shrink-0 shadow-xs">
                          <Upload size={14} className="text-purple-600" /> Browse Image
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
                          className="text-xs flex-1 bg-white"
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

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] text-slate-400 font-medium">Presets:</span>
                        <button
                          type="button"
                          onClick={() => setImage("https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80")}
                          className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-purple-50 hover:text-purple-700 border border-slate-200 font-medium"
                        >
                          Building
                        </button>
                        <button
                          type="button"
                          onClick={() => setImage("https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80")}
                          className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-purple-50 hover:text-purple-700 border border-slate-200 font-medium"
                        >
                          Science Fair
                        </button>
                        <button
                          type="button"
                          onClick={() => setImage("https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80")}
                          className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-purple-50 hover:text-purple-700 border border-slate-200 font-medium"
                        >
                          Staff & Sports
                        </button>
                      </div>

                      {image && (
                        <div className="mt-2 relative rounded-xl overflow-hidden h-36 bg-slate-100 border border-slate-200">
                          <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* VIDEO ATTACHMENT MODE */}
                  {newsMediaType === "video" && (
                    <div className="space-y-3 p-3 bg-purple-50/50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <Video size={14} className="text-purple-600" /> Video File or Online Stream
                        </span>
                        {newsVideoFileMeta && (
                          <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            {newsVideoFileMeta.name} ({newsVideoFileMeta.size})
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <label className="cursor-pointer px-3 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs">
                          <Upload size={14} /> Upload Video File
                          <input 
                            ref={newsVideoInputRef}
                            type="file" 
                            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*" 
                            className="hidden" 
                            onChange={handleNewsVideoSelect}
                          />
                        </label>
                        <Input 
                          placeholder="Or paste Video URL (YouTube, Vimeo, MP4)..." 
                          value={newsVideoUrl} 
                          onChange={(e) => setNewsVideoUrl(e.target.value)}
                          className="text-xs flex-1 bg-white"
                        />
                        {newsVideoUrl && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-rose-600 hover:text-rose-700 h-9 px-2"
                            onClick={() => { setNewsVideoUrl(""); setNewsVideoFileMeta(null); }}
                          >
                            Clear
                          </Button>
                        )}
                      </div>

                      {/* Video Quick Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[11px] text-slate-500 font-medium">Sample Videos:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewsVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
                            setNewsVideoFileMeta({ name: "SportsDayHighlights.mp4", size: "14.8 MB" });
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 font-medium flex items-center gap-1"
                        >
                          <Play size={10} /> Sports Day Reel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewsVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
                            setNewsVideoFileMeta({ name: "ScienceFairWalkthrough.mp4", size: "19.2 MB" });
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 font-medium flex items-center gap-1"
                        >
                          <Play size={10} /> Science Exhibition
                        </button>
                      </div>

                      {/* Live Video Preview in Modal */}
                      {newsVideoUrl && (
                        <div className="space-y-1.5 pt-2">
                          <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                            <Eye size={12} /> Video Player Preview:
                          </p>
                          <div className="max-w-md mx-auto rounded-xl overflow-hidden shadow-sm">
                            <VideoPlayer src={newsVideoUrl} title="Preview Video" controls />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
          {/* UPLOAD NEW MEDIA CARD */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 via-slate-50 to-white border-b border-slate-200 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Video className="text-purple-600" size={20} /> Publish Campus Media & Videos
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload sports day reels, science fair videos, classroom clips, and campus photos to the public website and student portal.
                  </p>
                </div>
                {/* Media Type Selector */}
                <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryMediaType("video");
                      setNewGalleryUrl("");
                      setVideoFileMeta(null);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      galleryMediaType === "video"
                        ? "bg-purple-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Video size={14} /> Video / Clip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryMediaType("image");
                      setNewGalleryUrl("");
                      setVideoFileMeta(null);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      galleryMediaType === "image"
                        ? "bg-purple-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Camera size={14} /> Photograph
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddGalleryItem} className="space-y-5">
                {/* VIDEO UPLOAD FORM */}
                {galleryMediaType === "video" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-slate-900 font-semibold flex items-center justify-between">
                          <span>Video File Upload</span>
                          {videoFileMeta && (
                            <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                              Selected: {videoFileMeta.name} ({videoFileMeta.size})
                            </span>
                          )}
                        </Label>

                        {/* Dropzone Container */}
                        <div 
                          onClick={() => galleryVideoInputRef.current?.click()}
                          className="border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <UploadCloud size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              Click or Drag & Drop Video File to Upload
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Supports MP4, WebM, OGG, MOV (QuickTime) video formats
                            </p>
                          </div>
                          <input 
                            ref={galleryVideoInputRef}
                            type="file" 
                            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*" 
                            className="hidden" 
                            onChange={handleVideoFileSelect}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-slate-900 font-semibold">Or Stream from URL (YouTube, Vimeo, or MP4 URL)</Label>
                        <div className="flex gap-2">
                          <Input 
                            value={newGalleryUrl} 
                            onChange={e => {
                              setNewGalleryUrl(e.target.value);
                              setVideoFileMeta(null);
                            }} 
                            placeholder="e.g. https://www.youtube.com/watch?v=... or https://commondatastorage.googleapis.com/...mp4" 
                            className="text-xs"
                          />
                          {newGalleryUrl && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => { setNewGalleryUrl(""); setVideoFileMeta(null); }}
                              className="text-xs text-rose-600"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                        {/* Quick video sample chips */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[11px] text-slate-400 font-medium">Quick Video Samples:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewGalleryUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
                              setNewGalleryCaption("Campus Sports Day 4x100m Relay Finals");
                              setNewGalleryCategory("Events");
                              setNewGalleryDuration("0:15");
                              setVideoFileMeta({ name: "SportsRelayFinals.mp4", size: "14.8 MB" });
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-purple-100 text-purple-900 font-semibold border border-slate-200 transition-colors flex items-center gap-1"
                          >
                            <Play size={10} /> Sports Day Relay (14 MB)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewGalleryUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
                              setNewGalleryCaption("Modern Chemistry Laboratory Tour");
                              setNewGalleryCategory("Facilities");
                              setNewGalleryDuration("9:56");
                              setVideoFileMeta({ name: "ChemistryLabTour.mp4", size: "19.2 MB" });
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-purple-100 text-purple-900 font-semibold border border-slate-200 transition-colors flex items-center gap-1"
                          >
                            <Play size={10} /> Chemistry Lab Tour
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-slate-900 font-semibold">Video Title / Caption <span className="text-rose-500">*</span></Label>
                        <Input 
                          required 
                          value={newGalleryCaption} 
                          onChange={e => setNewGalleryCaption(e.target.value)} 
                          placeholder="e.g. 2026 Inter-House Football Championship Highlights" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-slate-900 font-semibold">Category</Label>
                          <select
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-purple-500"
                            value={newGalleryCategory}
                            onChange={e => setNewGalleryCategory(e.target.value as any)}
                          >
                            <option value="Events">School Events & Sports</option>
                            <option value="Facilities">Campus & Facilities</option>
                            <option value="Students">Student Activities</option>
                            <option value="Staff">Faculty & Staff</option>
                            <option value="Other">Other Documentaries</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-slate-900 font-semibold">Duration (optional)</Label>
                          <Input 
                            value={newGalleryDuration} 
                            onChange={e => setNewGalleryDuration(e.target.value)} 
                            placeholder="e.g. 2:45 or 12 mins" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* LIVE VIDEO PREVIEW IN UPLOADER */}
                    {newGalleryUrl && (
                      <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Eye size={14} className="text-purple-400" /> Live Video Preview & Player Test:
                          </span>
                          <span>Ready to publish</span>
                        </div>
                        <div className="max-w-xl mx-auto rounded-xl overflow-hidden shadow-xl bg-black">
                          <VideoPlayer src={newGalleryUrl} title={newGalleryCaption || "Video Preview"} controls />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* IMAGE UPLOAD FORM */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-slate-900 font-semibold">Photograph URL or Upload</Label>
                        <div className="flex gap-2">
                          <Input 
                            required 
                            value={newGalleryUrl} 
                            onChange={e => setNewGalleryUrl(e.target.value)} 
                            placeholder="e.g. https://images.unsplash.com/photo-..." 
                          />
                          <Label className="cursor-pointer flex items-center justify-center bg-slate-100 border border-slate-200 rounded-lg px-4 hover:bg-slate-200 transition-colors shrink-0">
                            <Upload size={16} className="text-slate-600 mr-2" />
                            <span className="text-xs text-slate-700 font-semibold whitespace-nowrap">Browse File</span>
                            <input 
                              ref={galleryImageInputRef}
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setNewGalleryUrl(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                            />
                          </Label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-900 font-semibold">Category</Label>
                        <select
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
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
                      <div className="space-y-1.5">
                        <Label className="text-slate-900 font-semibold">Image Caption</Label>
                        <Input 
                          required 
                          value={newGalleryCaption} 
                          onChange={e => setNewGalleryCaption(e.target.value)} 
                          placeholder="e.g. Our Dedicated Science Teachers" 
                        />
                      </div>
                    </div>

                    {newGalleryUrl && (
                      <div className="relative rounded-xl overflow-hidden h-44 max-w-sm border border-slate-200 shadow-sm bg-slate-50">
                        <img src={newGalleryUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={!newGalleryUrl || !newGalleryCaption}
                  className="w-full h-11 bg-purple-900 hover:bg-purple-950 text-white font-bold gap-2 text-sm shadow-sm"
                >
                  {galleryMediaType === "video" ? (
                    <>
                      <Video size={18} /> Publish Video to Campus Gallery
                    </>
                  ) : (
                    <>
                      <Camera size={18} /> Publish Photo to Campus Gallery
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* MANAGE EXISTING GALLERY MEDIA */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Film className="text-purple-600" size={20} /> Campus Media Library ({gallery.length})
                </CardTitle>

                {/* Filter Buttons */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setGalleryFilter("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      galleryFilter === "all" ? "bg-white text-purple-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All Media ({gallery.length})
                  </button>
                  <button
                    onClick={() => setGalleryFilter("videos")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      galleryFilter === "videos" ? "bg-purple-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Video size={12} /> Videos ({gallery.filter(g => g.mediaType === "video").length})
                  </button>
                  <button
                    onClick={() => setGalleryFilter("images")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      galleryFilter === "images" ? "bg-white text-purple-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Camera size={12} /> Photos ({gallery.filter(g => g.mediaType !== "video").length})
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {gallery.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Film size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">No media items in gallery.</p>
                  <p className="text-xs text-slate-400 mt-1">Upload a video or photo using the form above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {gallery
                    .filter(item => {
                      if (galleryFilter === "videos") return item.mediaType === "video";
                      if (galleryFilter === "images") return item.mediaType !== "video";
                      return true;
                    })
                    .map(item => {
                      const isVideo = item.mediaType === "video";

                      return (
                        <div 
                          key={item.id} 
                          className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200 bg-white flex flex-col group"
                        >
                          {/* Media Thumbnail Container */}
                          <div className="aspect-[16/10] overflow-hidden relative bg-slate-900">
                            {isVideo ? (
                              <div 
                                className="w-full h-full relative cursor-pointer group/vid flex items-center justify-center"
                                onClick={() => setActiveVideoModal(item)}
                              >
                                {item.thumbnail ? (
                                  <img 
                                    src={item.thumbnail} 
                                    alt={item.caption} 
                                    className="w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-purple-950 to-indigo-950 flex flex-col items-center justify-center p-4">
                                    <Video size={36} className="text-purple-400 opacity-60 mb-1" />
                                    <span className="text-[11px] text-purple-200/80 font-medium">Video Stream</span>
                                  </div>
                                )}
                                
                                {/* Glowing Play Overlay */}
                                <div className="absolute inset-0 bg-black/40 group-hover/vid:bg-black/20 flex items-center justify-center transition-colors">
                                  <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg group-hover/vid:scale-115 group-hover/vid:bg-purple-500 transition-all">
                                    <Play size={20} className="fill-current ml-0.5" />
                                  </div>
                                </div>

                                {/* Video Badge */}
                                <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-purple-500/30">
                                  <Video size={11} /> VIDEO
                                </div>

                                {item.duration && (
                                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    {item.duration}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-full relative">
                                <img 
                                  src={item.url} 
                                  alt={item.caption} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Camera size={11} /> PHOTO
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Info Footer */}
                          <div className="p-4 flex flex-col justify-between flex-1">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase rounded-md tracking-wider border border-purple-100">
                                  {item.category}
                                </span>
                                {item.fileSize && (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {item.fileSize}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug" title={item.caption}>
                                {item.caption}
                              </h3>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              {isVideo ? (
                                <button
                                  type="button"
                                  onClick={() => setActiveVideoModal(item)}
                                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                                >
                                  <PlayCircle size={14} /> Play Video
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400">Photo Asset</span>
                              )}

                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 p-1.5 h-8 w-8 rounded-lg shrink-0 border border-transparent hover:border-rose-100"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete this ${isVideo ? "video" : "image"}?`)) {
                                    setGallery(gallery.filter(g => g.id !== item.id));
                                    setSuccessMsg(`${isVideo ? "Video" : "Image"} deleted successfully.`);
                                    setTimeout(() => setSuccessMsg(""), 3000);
                                  }
                                }}
                                title={`Delete ${isVideo ? "Video" : "Image"}`}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* POPUP VIDEO PLAYER MODAL */}
      {activeVideoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveVideoModal(null)}
        >
          <div 
            className="w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Video size={18} className="text-purple-400" />
                <h3 className="font-bold text-sm sm:text-base text-slate-100 truncate max-w-lg">
                  {activeVideoModal.caption}
                </h3>
              </div>
              <button 
                onClick={() => setActiveVideoModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Video Player Body */}
            <div className="bg-black aspect-video flex items-center justify-center">
              <VideoPlayer 
                src={activeVideoModal.url} 
                title={activeVideoModal.caption} 
                autoPlay={true}
                controls={true}
              />
            </div>

            {/* Modal Footer Info */}
            <div className="p-4 sm:p-5 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-purple-950 text-purple-300 rounded-full font-semibold border border-purple-800">
                  {activeVideoModal.category}
                </span>
                {activeVideoModal.duration && (
                  <span className="text-slate-400 font-medium">
                    Duration: <strong className="text-slate-200">{activeVideoModal.duration}</strong>
                  </span>
                )}
                {activeVideoModal.fileSize && (
                  <span className="text-slate-400 font-medium">
                    Size: <strong className="text-slate-200">{activeVideoModal.fileSize}</strong>
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveVideoModal(null)}
                className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                Close Player
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
