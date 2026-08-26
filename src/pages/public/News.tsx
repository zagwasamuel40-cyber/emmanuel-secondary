import { usePortalSettings } from "../../data/portalSettingsData";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/src/components/ui";
import { useAnnouncements, Announcement } from "@/src/data/announcementsData";
import { Bell, Calendar, Sparkles, X, Image as ImageIcon, FileText, Download } from "lucide-react";

const staticNewsItems = [
  {
    id: "s1",
    title: "Emmanuel Sec School Wins State Science Fair",
    date: "July 15, 2026",
    category: "Achievement",
    summary: "Our SSS 2 Science students took first place at the annual Benue State Science & Innovation Fair with their renewable energy project.",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "s2",
    title: "Admission Forms Now Available for 2026/2027",
    date: "July 01, 2026",
    category: "Announcement",
    summary: "Prospective parents can now purchase admission forms online or at the school premises for the upcoming academic session.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "s3",
    title: "Outstanding WAEC Results Released",
    date: "June 28, 2026",
    category: "Academic",
    summary: "We are proud to announce a 98% pass rate in the recently released WAEC results, with 45 students scoring straight As.",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
  }
];

export default function News() {
  const [portalSettings] = usePortalSettings();
  const [announcements] = useAnnouncements();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [newsletterFile, setNewsletterFile] = useState<{name: string, url: string, size: string} | null>(null);

  useEffect(() => {
    const storedNews = localStorage.getItem("ess_newsletter");
    if (storedNews) {
      try { setNewsletterFile(JSON.parse(storedNews)); } catch (e) {}
    }
  }, []);

  // Combine posted active announcements with static news items
  const activeAnnouncements = announcements
    .filter(a => a.active)
    .map(a => ({
      id: `ann_${a.id}`,
      title: a.title,
      date: a.date,
      category: a.category || "Announcement",
      summary: a.content || a.title,
      image: a.image,
      isAnnouncement: true
    }));

  const allNews = [...activeAnnouncements, ...staticNewsItems];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3 inline-block">
          School News & Updates
        </span>
        <h1 className="font-heading text-4xl font-extrabold text-slate-900 mb-4">Latest News & Announcements</h1>
        <p className="text-slate-600 text-lg">Stay updated with official announcements, news, and academic events at {portalSettings.schoolName}.</p>
      </div>

      {newsletterFile && (
        <Card className="border-0 shadow-md bg-gradient-to-r from-brand-900 to-indigo-900 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <FileText size={28} className="text-brand-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading mb-1">Official School Newsletter</h3>
                <p className="text-brand-100/80 text-sm max-w-md">Download the latest newsletter document for important academic updates, events, and school announcements.</p>
                <p className="text-xs text-brand-300 mt-2 font-medium">{newsletterFile.name} &middot; {newsletterFile.size}</p>
              </div>
            </div>
            <a 
              href={newsletterFile.url}
              download={newsletterFile.name}
              className="shrink-0 flex items-center gap-2 bg-white text-brand-900 px-6 py-3 rounded-xl font-bold hover:bg-brand-50 transition-colors shadow-sm"
            >
              <Download size={18} /> Download Now
            </a>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allNews.map(item => (
          <Card 
            key={item.id} 
            className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            {item.image ? (
              <div className="h-48 w-full overflow-hidden relative bg-slate-100">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => {
                    // Fallback on image error
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {item.isAnnouncement && (
                  <span className="absolute top-3 right-3 bg-brand-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow">
                    Official Notice
                  </span>
                )}
              </div>
            ) : (
              <div className="h-32 w-full bg-gradient-to-r from-brand-900 via-slate-900 to-brand-950 p-6 flex items-center justify-center text-white/20">
                <ImageIcon size={48} />
              </div>
            )}

            <CardContent className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-block px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Calendar size={12} /> {item.date}
                </span>
              </div>

              <h3 className="font-heading text-xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-brand-600 transition-colors">
                {item.title}
              </h3>

              <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                {item.summary}
              </p>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                <span>Read Full Notice</span>
                <span>&rarr;</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col bg-white">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-brand-400" />
                <CardTitle className="text-white">News Detail</CardTitle>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </CardHeader>
            <div className="overflow-y-auto p-6 space-y-4">
              {selectedItem.image && (
                <div className="rounded-xl overflow-hidden max-h-80 w-full bg-slate-100">
                  <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-extrabold uppercase">
                  {selectedItem.category}
                </span>
                <span className="text-xs text-slate-500 font-medium">{selectedItem.date}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">{selectedItem.title}</h2>
              <p className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap p-4 bg-slate-50 rounded-xl border border-slate-100">
                {selectedItem.summary}
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
