const fs = require('fs');
let code = fs.readFileSync('src/pages/public/About.tsx', 'utf-8');

const teamBlock = `
      {/* Dedicated Team Section */}
      {portalSettings.dedicatedTeam && portalSettings.dedicatedTeam.length > 0 && (
        <div className="mb-24">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">Our Dedicated Team</h2>
            <p className="text-slate-600">Meet the exceptional leaders and administrators dedicated to our students' success.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {portalSettings.dedicatedTeam.map(member => (
              <div key={member.id} className="text-center group">
                <div className="mb-4 relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-slate-100 shadow-sm group-hover:border-brand-200 transition-colors">
                  <img 
                    src={member.photoUrl || "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80"} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900">{member.name}</h3>
                <p className="text-brand-600 font-medium text-sm mb-2">{member.role}</p>
                {member.bio && (
                  <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
`;

code = code.replace(/\{\/\* Gallery Section \*\/\}/, `${teamBlock}\n      {/* Gallery Section */}`);

fs.writeFileSync('src/pages/public/About.tsx', code);
