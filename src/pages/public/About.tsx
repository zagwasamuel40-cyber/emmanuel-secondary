import { useState } from "react";
import { useGallery, GalleryItem } from "../../data/galleryData";
import { usePortalSettings } from "../../data/portalSettingsData";
import { BookOpen, Target, Users, Play, Video, Image as ImageIcon, X, Clock, Compass, Edit3 } from "lucide-react";
import { TeamGallery } from "../../components/TeamGallery";
import { VideoPlayer } from "../../components/ui/VideoPlayer";
import { Button } from "../../components/ui";
import { Link } from "react-router-dom";

export default function About() {
  const [portalSettings] = usePortalSettings();
  const [gallery] = useGallery();
  const [activeMediaFilter, setActiveMediaFilter] = useState<"all" | "photo" | "video">("all");
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);

  const filteredGallery = gallery.filter(item => {
    if (activeMediaFilter === "photo") return item.mediaType !== "video";
    if (activeMediaFilter === "video") return item.mediaType === "video";
    return true;
  });
  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-heading text-4xl font-bold text-slate-900 mb-6">About {portalSettings.schoolName}</h1>
        <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
          {portalSettings.aboutUsText || "Founded with a vision to provide world-class education, we are dedicated to raising a generation of intellectually sound, morally upright, and socially responsible leaders."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 items-stretch">
        <div className="flex flex-col justify-center space-y-6">
          {/* Mission Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-brand-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                  <Target size={20} />
                </div>
                <h2 className="font-heading text-xl font-bold text-slate-900">Our Mission</h2>
              </div>
              <Link 
                to="/dashboard/settings" 
                title="Change Mission & Vision in Admin Settings" 
                className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1 font-medium px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
              >
                <Edit3 size={13} /> Edit
              </Link>
            </div>
            <p className="text-slate-600 leading-relaxed text-base whitespace-pre-line">
              {portalSettings.mission || "To provide comprehensive education that empowers students with the knowledge, skills, and values needed to excel in a rapidly changing world."}
            </p>
          </div>

          {/* Vision Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Compass size={20} />
                </div>
                <h2 className="font-heading text-xl font-bold text-slate-900">Our Vision</h2>
              </div>
              <Link 
                to="/dashboard/settings" 
                title="Change Mission & Vision in Admin Settings" 
                className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1 font-medium px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
              >
                <Edit3 size={13} /> Edit
              </Link>
            </div>
            <p className="text-slate-600 leading-relaxed text-base whitespace-pre-line">
              {portalSettings.vision || "To be the premier secondary educational institution in Nigeria, recognized globally for academic excellence and character development."}
            </p>
          </div>
        </div>

        <div className="bg-slate-100 rounded-2xl overflow-hidden min-h-[340px] relative shadow-inner border border-slate-200/60">
            <img 
              src={portalSettings.aboutUsImageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} 
              alt="School Campus" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
        </div>
      </div>

      
      {/* Dedicated Team Section */}
      {portalSettings.dedicatedTeam && portalSettings.dedicatedTeam.length > 0 && (
        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">Our Dedicated Team</h2>
            <p className="text-slate-600">Meet the exceptional leaders and administrators dedicated to our students' success.</p>
          </div>
          
          <TeamGallery team={portalSettings.dedicatedTeam} />
          
        </div>
      )}

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <div id="gallery" className="mt-16 pt-8 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                Multimedia Showcase
              </span>
              <h2 className="font-heading text-3xl font-bold text-slate-900 mt-2">Life & Moments at Our School</h2>
              <p className="text-slate-600 text-sm mt-1">Explore campus life, student activities, sports, and video highlights.</p>
            </div>
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setActiveMediaFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMediaFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({gallery.length})
              </button>
              <button
                onClick={() => setActiveMediaFilter("photo")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMediaFilter === "photo" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ImageIcon size={13} /> Photos ({gallery.filter(g => g.mediaType !== "video").length})
              </button>
              <button
                onClick={() => setActiveMediaFilter("video")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMediaFilter === "video" ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Video size={13} /> Videos ({gallery.filter(g => g.mediaType === "video").length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredGallery.map(item => {
              const isVideo = item.mediaType === "video";
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedMedia(item)}
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 bg-white cursor-pointer flex flex-col"
                >
                  <div className="aspect-[16/10] overflow-hidden relative bg-slate-950 flex items-center justify-center">
                    {isVideo ? (
                      <>
                        <video 
                          src={item.url} 
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-60 transition-opacity" 
                          muted 
                          playsInline 
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play size={20} className="ml-1 fill-white" />
                          </div>
                        </div>
                        <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                          <Video size={11} /> Video
                        </span>
                        {item.duration && (
                          <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono px-2 py-0.5 rounded shadow flex items-center gap-1">
                            <Clock size={11} /> {item.duration}
                          </span>
                        )}
                      </>
                    ) : (
                      <img 
                        src={item.url} 
                        alt={item.caption} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full tracking-wider mb-2">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                        {item.caption}
                      </h3>
                    </div>
                    {isVideo && (
                      <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-rose-600 font-bold flex items-center gap-1">
                        <Play size={12} className="fill-rose-600" /> Watch Video
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MEDIA PREVIEW / PLAYBACK MODAL */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedMedia.mediaType === "video" ? (
                  <span className="px-2.5 py-0.5 bg-rose-600 text-white text-xs font-black uppercase rounded-full flex items-center gap-1">
                    <Video size={12} /> School Video
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-brand-600 text-white text-xs font-black uppercase rounded-full flex items-center gap-1">
                    <ImageIcon size={12} /> Photo
                  </span>
                )}
                <span className="text-xs text-slate-400">&bull; {selectedMedia.category}</span>
              </div>
              <button 
                onClick={() => setSelectedMedia(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-black flex items-center justify-center">
              {selectedMedia.mediaType === "video" ? (
                <VideoPlayer 
                  src={selectedMedia.url} 
                  title={selectedMedia.caption} 
                  controls 
                  autoPlay 
                  className="w-full aspect-video rounded-xl overflow-hidden" 
                />
              ) : (
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.caption} 
                  className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain mx-auto" 
                />
              )}
            </div>

            <div className="p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">{selectedMedia.caption}</h3>
                {selectedMedia.duration && (
                  <p className="text-xs text-slate-400 mt-0.5">Duration: {selectedMedia.duration}</p>
                )}
              </div>
              <Button 
                variant="outline" 
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs shrink-0"
                onClick={() => setSelectedMedia(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
