const fs = require('fs');
let code = fs.readFileSync('src/layouts/PublicLayout.tsx', 'utf-8');

// Add Menu and X icons
if (!code.includes('Menu, X')) {
  code = code.replace(/import \{ BookOpen, Award, Sparkles \} from "lucide-react";/, 'import { BookOpen, Award, Sparkles, Menu, X } from "lucide-react";');
}

// Add state for mobile menu
if (!code.includes('isMobileMenuOpen')) {
  if (!code.includes('import { useState }')) {
    code = code.replace(/import \{ Outlet, Link \} from "react-router-dom";/, 'import { Outlet, Link, useLocation } from "react-router-dom";\nimport { useState, useEffect } from "react";');
  }
  
  code = code.replace(/export default function PublicLayout\(\) \{[\s\S]*?const \[portalSettings\] = usePortalSettings\(\);/, 
    `export default function PublicLayout() {\n  const [portalSettings] = usePortalSettings();\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n  const location = useLocation();\n\n  useEffect(() => {\n    setIsMobileMenuOpen(false);\n  }, [location.pathname]);`);
}

const mobileMenuCode = `
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
              <a href="/#gallery" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-3 text-base font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg">Gallery</a>
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
      </header>`;

code = code.replace(/<div className="flex items-center gap-4">\s*<Link to="\/login">\s*<Button variant="brand">Portal Login<\/Button>\s*<\/Link>\s*<\/div>\s*<\/div>\s*<\/header>/, 
  `<div className="hidden lg:flex items-center gap-4">
            <Link to="/login">
              <Button variant="brand">Portal Login</Button>
            </Link>
          </div>
${mobileMenuCode}`);

fs.writeFileSync('src/layouts/PublicLayout.tsx', code);
