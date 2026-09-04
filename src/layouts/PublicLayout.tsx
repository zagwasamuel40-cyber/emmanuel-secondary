import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { BookOpen, Award, Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/src/components/ui";
import { usePortalSettings } from "../data/portalSettingsData";

export default function PublicLayout() {
  const [portalSettings] = usePortalSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Notice Banner */}
      {portalSettings.portalNotice && (
        <div className="bg-slate-900 text-amber-300 px-4 py-2 text-xs font-semibold text-center border-b border-amber-500/20 flex items-center justify-center gap-2">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span>{portalSettings.portalNotice}</span>
        </div>
      )}

      <header className="border-b border-slate-100 sticky top-0 z-50 bg-white/80 backdrop-blur-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-900 rounded-lg flex items-center justify-center text-white overflow-hidden shrink-0">
              {portalSettings.logoUrl ? (
                <img src={portalSettings.logoUrl} alt="School Crest" className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={24} />
              )}
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-slate-900 leading-tight">{portalSettings.schoolName}</h1>
              <p className="text-xs font-semibold text-amber-600 italic">"{portalSettings.motto}"</p>
              <p className="text-[9px] text-slate-500 hidden sm:block">{portalSettings.address}</p>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-3 xl:gap-5 font-medium text-[13px] text-slate-600">
            <Link to="/" className="hover:text-brand-600 transition-colors whitespace-nowrap">Home</Link>
            <Link to="/about" className="hover:text-brand-600 transition-colors whitespace-nowrap">About Us</Link>
            <Link to="/admissions" className="hover:text-brand-600 transition-colors whitespace-nowrap">Admissions</Link>
            <Link to="/academics" className="hover:text-brand-600 transition-colors whitespace-nowrap">Academics</Link>
            <Link to="/about#gallery" className="hover:text-brand-600 transition-colors whitespace-nowrap">Gallery</Link>
            <Link to="/news" className="hover:text-brand-600 transition-colors whitespace-nowrap">News / Events</Link>
            <Link to="/#team" className="hover:text-brand-600 transition-colors whitespace-nowrap">Dedicated Team</Link>
            <Link to="/#contact" className="hover:text-brand-600 transition-colors whitespace-nowrap">Contact Us</Link>
            
            <Link to="/result-checker" className="hover:text-brand-600 transition-colors flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 font-bold shadow-2xs hover:bg-amber-100 whitespace-nowrap ml-2">
              <Award size={14} className="text-amber-600" />
              Result Checker
            </Link>
          </nav>
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login">
              <Button variant="brand">Portal Login</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-4">
            <Link to="/login" className="hidden sm:block">
              <Button variant="brand" size="sm">Portal Login</Button>
            </Link>
            <button 
              className="p-2 text-slate-600 hover:text-brand-600 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-200 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto">
            <nav className="flex flex-col px-4 pt-2 pb-6 space-y-1">
              <Link to="/" className="px-3 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg">Home</Link>
              <Link to="/about" className="px-3 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg">About Us</Link>
              <Link to="/admissions" className="px-3 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg">Admissions</Link>
              <Link to="/academics" className="px-3 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg">Academics</Link>
              <a href="/about#gallery" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg">Gallery</a>
              <Link to="/news" className="px-3 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg">News / Events</Link>
              <a href="/#team" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg">Dedicated Team</a>
              <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg">Contact Us</a>
              
              <Link to="/result-checker" className="px-3 py-3 text-base font-bold text-amber-600 hover:bg-amber-50 rounded-lg flex items-center gap-2">
                <Award size={18} />
                Result Checker
              </Link>
              
              <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link to="/login" className="w-full">
                  <Button variant="brand" className="w-full">Portal Login</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-300 py-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h2 className="font-heading font-bold text-2xl text-white mb-2">{portalSettings.schoolName}</h2>
            <p className="text-amber-400 font-semibold text-sm mb-4 italic">"{portalSettings.motto}"</p>
            <p className="max-w-sm text-xs text-slate-400 leading-relaxed">Dedicated to academic excellence, character development, and shaping the future leaders of Nigeria.</p>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/result-checker" className="hover:text-amber-400 text-amber-300 font-bold flex items-center gap-1"><Award size={14} /> Check Results Online</Link></li>
              <li><Link to="/login" className="hover:text-brand-500">Student Portal</Link></li>
              <li><Link to="/login" className="hover:text-brand-500">Parent Portal</Link></li>
              <li><Link to="/news" className="hover:text-brand-500">Latest School News</Link></li>
              <li><Link to="/entrance-exam" className="hover:text-brand-500">Entrance Exam Registration</Link></li>
              <li><Link to="/admission-status" className="hover:text-brand-500">Check Admission Status</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Contact Info</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Address: {portalSettings.address}</li>
              <li>Phone: {portalSettings.contactPhone}</li>
              <li>Email: {portalSettings.contactEmail}</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
