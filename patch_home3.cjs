const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const replacement = `
      {/* Dedicated Team Section */}
      {portalSettings.dedicatedTeam && portalSettings.dedicatedTeam.length > 0 && (
        <section id="team" className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">Our Dedicated Team</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Meet the exceptional leaders and administrators dedicated to our students' success.</p>
            </div>
            
            <TeamGallery team={portalSettings.dedicatedTeam} />
            
          </div>
        </section>
      )}
`;

code = code.replace(/\{\/\* Staff Gallery Section \*\/\}[\s\S]*?activeTeachers\.slice\(0, 10\)\.map[\s\S]*?<\/section>\s*\}/, replacement.trim());

fs.writeFileSync('src/pages/Home.tsx', code);
