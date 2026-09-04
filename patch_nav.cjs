const fs = require('fs');
let code = fs.readFileSync('src/layouts/PublicLayout.tsx', 'utf-8');

code = code.replace(/<nav className="hidden lg:flex items-center gap-7 font-medium text-sm text-slate-600">[\s\S]*?<\/nav>/, `<nav className="hidden lg:flex items-center gap-3 xl:gap-5 font-medium text-[13px] text-slate-600">
            <Link to="/" className="hover:text-brand-600 transition-colors whitespace-nowrap">Home</Link>
            <Link to="/about" className="hover:text-brand-600 transition-colors whitespace-nowrap">About Us</Link>
            <Link to="/admissions" className="hover:text-brand-600 transition-colors whitespace-nowrap">Admissions</Link>
            <Link to="/academics" className="hover:text-brand-600 transition-colors whitespace-nowrap">Academics</Link>
            <a href="/#gallery" className="hover:text-brand-600 transition-colors whitespace-nowrap">Gallery</a>
            <Link to="/news" className="hover:text-brand-600 transition-colors whitespace-nowrap">News / Events</Link>
            <a href="/#team" className="hover:text-brand-600 transition-colors whitespace-nowrap">Dedicated Team</a>
            <a href="/#contact" className="hover:text-brand-600 transition-colors whitespace-nowrap">Contact Us</a>
            
            <Link to="/result-checker" className="hover:text-brand-600 transition-colors flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 font-bold shadow-2xs hover:bg-amber-100 whitespace-nowrap ml-2">
              <Award size={14} className="text-amber-600" />
              Result Checker
            </Link>
          </nav>`);

fs.writeFileSync('src/layouts/PublicLayout.tsx', code);
