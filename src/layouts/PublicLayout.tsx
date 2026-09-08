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

      <header className="border-b border-slate-200 sticky top-0 z-50 bg-white shadow-xs print:hidden">
        {/* Top Tier: School Name, Crest, Motto & Action at the Top */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3 sm:gap-4 group min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-900 rounded-xl flex items-center justify-center text-white overflow-hidden shrink-0 shadow-sm border border-brand-800 group-hover:scale-105 transition-transform">
              {portalSettings.logoUrl ? (
                <img src={portalSettings.logoUrl} alt="School Crest" className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={28} />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-heading font-extrabold text-lg sm:text-2xl lg:text-3xl text-slate-900 leading-tight tracking-tight truncate group-hover:text-brand-700 transition-colors">
                {portalSettings.schoolName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5">
                {portalSettings.motto && (
                  <p className="text-xs sm:text-sm font-semibold text-amber-600 italic truncate">
                    "{portalSettings.motto}"
                  </p>
                )}
                {portalSettings.address && (
                  <span className="text-[11px] text-slate-500 hidden md:inline-block truncate">
                    • {portalSettings.address}
                  </span>
                )}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link to="/result-checker" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/90 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs">
              <Award size={14} className="text-amber-600" />
              <span>Result Checker</span>
            </Link>
            <Link to="/login">
              <Button variant="brand" className="h-9 sm:h-10 px-3.5 sm:px-5 text-xs sm:text-sm font-semibold shadow-xs">
                Portal Login
              </Button>
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg focus:outline-none transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Bottom Tier: Full Navigation Menu Under the School Name */}
        <div className="hidden lg:block bg-slate-50/90 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-start gap-1 py-1.5 font-medium text-[13px] text-slate-700">
              <Link 
                to="/" 
                className={`px-3 py-1.5 rounded-md transition-all ${
                  location.pathname === '/' 
                    ? 'bg-brand-600 text-white font-semibold shadow-2xs' 
                    : 'hover:text-brand-700 hover:bg-white'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={`px-3 py-1.5 rounded-md transition-all ${
                  location.pathname === '/about' 
                    ? 'bg-brand-600 text-white font-semibold shadow-2xs' 
                    : 'hover:text-brand-700 hover:bg-white'
                }`}
              >
                About Us
              </Link>
              <Link 
                to="/admissions" 
                className={`px-3 py-1.5 rounded-md transition-all ${
                  location.pathname === '/admissions' 
                    ? 'bg-brand-600 text-white font-semibold shadow-2xs' 
                    : 'hover:text-brand-700 hover:bg-white'
                }`}
              >
                Admissions
              </Link>
              <Link 
                to="/academics" 
                className={`px-3 py-1.5 rounded-md transition-all ${
                  location.pathname === '/academics' 
                    ? 'bg-brand-600 text-white font-semibold shadow-2xs' 
                    : 'hover:text-brand-700 hover:bg-white'
                }`}
              >
                Academics
              </Link>
              <a 
                href="/about#gallery" 
                className="px-3 py-1.5 rounded-md hover:text-brand-700 hover:bg-white transition-all"
              >
                Gallery
              </a>
              <Link 
                to="/news" 
                className={`px-3 py-1.5 rounded-md transition-all ${
                  location.pathname === '/news' 
                    ? 'bg-brand-600 text-white font-semibold shadow-2xs' 
                    : 'hover:text-brand-700 hover:bg-white'
                }`}
              >
                News &amp; Events
              </Link>
              <a 
                href="/#team" 
                className="px-3 py-1.5 rounded-md hover:text-brand-700 hover:bg-white transition-all"
              >
                Dedicated Team
              </a>
              <a 
                href="/#contact" 
                className="px-3 py-1.5 rounded-md hover:text-brand-700 hover:bg-white transition-all"
              >
                Contact Us
              </a>

              <div className="ml-auto flex items-center gap-2">
                <Link 
                  to="/result-checker" 
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    location.pathname === '/result-checker'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-amber-100 text-amber-900 border border-amber-300/80 hover:bg-amber-200'
                  }`}
                >
                  <Award size={14} className={location.pathname === '/result-checker' ? 'text-white' : 'text-amber-700'} />
                  <span>Terminal Result Portal</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
        
        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl max-h-[calc(100vh-100px)] overflow-y-auto z-50">
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
