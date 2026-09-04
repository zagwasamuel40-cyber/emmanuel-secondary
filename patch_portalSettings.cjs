const fs = require('fs');
let code = fs.readFileSync('src/data/portalSettingsData.ts', 'utf-8');

code = code.replace(/export interface PortalSettings \{([\s\S]*?)aboutUsText\?: string;\n\}/, `export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  bio?: string;
}

export interface PortalSettings {$1aboutUsText?: string;
  dedicatedTeam: TeamMember[];
}`);

code = code.replace(/aboutUsText: "Founded with a vision to provide world-class education in Makurdi, Benue State, we are dedicated to raising a generation of intellectually sound, morally upright, and socially responsible leaders."\n\};/, `aboutUsText: "Founded with a vision to provide world-class education in Makurdi, Benue State, we are dedicated to raising a generation of intellectually sound, morally upright, and socially responsible leaders.",
  dedicatedTeam: [
    {
      id: "1",
      name: "Dr. A. O. Terungwa",
      role: "Principal",
      photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
      bio: "Committed to excellence in education and moral discipline."
    }
  ]
};`);

fs.writeFileSync('src/data/portalSettingsData.ts', code);
