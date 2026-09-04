const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Ensure TeamGallery is imported
if (!code.includes('import { TeamGallery }')) {
  code = code.replace(/import \{ Button, Card, CardContent, Input, Label \} from "@\/src\/components\/ui";/, 'import { Button, Card, CardContent, Input, Label } from "@/src/components/ui";\nimport { TeamGallery } from "../components/TeamGallery";');
}

// Add ID to News section
code = code.replace(/<section className="py-24 bg-slate-50 border-t border-slate-100">/, '<section id="news" className="py-24 bg-slate-50 border-t border-slate-100">');

// Add ID to Contact Section
code = code.replace(/<section className="py-24 bg-slate-900 text-white relative overflow-hidden">/, '<section id="contact" className="py-24 bg-slate-900 text-white relative overflow-hidden">');

// Replace old Staff Gallery Section with Dedicated Team Section
const teamBlock = `
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

if (code.includes('{/* Staff Gallery Section */}')) {
  code = code.replace(/\{\/\* Staff Gallery Section \*\/\}[\s\S]*?<\/section>\s*\}/, teamBlock.trim());
} else if (code.includes('{/* Dedicated Team Section */}')) {
  code = code.replace(/\{\/\* Dedicated Team Section \*\/\}[\s\S]*?<\/section>\s*\}/, teamBlock.trim());
}

fs.writeFileSync('src/pages/Home.tsx', code);
