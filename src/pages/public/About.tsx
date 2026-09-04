import { useGallery } from "../../data/galleryData";
import { usePortalSettings } from "../../data/portalSettingsData";
import { BookOpen, Target, Users } from "lucide-react";
import { TeamGallery } from "../../components/TeamGallery";

export default function About() {
  const [portalSettings] = usePortalSettings();
  const [gallery] = useGallery();
  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-heading text-4xl font-bold text-slate-900 mb-6">About {portalSettings.schoolName}</h1>
        <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
          {portalSettings.aboutUsText || "Founded with a vision to provide world-class education, we are dedicated to raising a generation of intellectually sound, morally upright, and socially responsible leaders."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed mb-8">
            To provide comprehensive education that empowers students with the knowledge, skills, and values needed to excel in a rapidly changing world.
          </p>
          <h2 className="font-heading text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
          <p className="text-slate-600 leading-relaxed">
            To be the premier secondary educational institution in Nigeria, recognized globally for academic excellence and character development.
          </p>
        </div>
        <div className="bg-slate-100 rounded-2xl overflow-hidden min-h-[300px] relative shadow-inner">
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
        <div className="mt-16">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">Our Gallery</h2>
            <p className="text-slate-600">A glimpse into life, staff, and facilities at our school.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {gallery.map(item => (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.url} 
                    alt={item.caption} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full tracking-wider mb-2">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{item.caption}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
