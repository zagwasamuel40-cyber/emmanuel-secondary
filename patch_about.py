import re

with open("src/pages/public/About.tsx", "r") as f:
    content = f.read()

imports = 'import { useGallery } from "../../data/galleryData";\n'

if "useGallery" not in content:
    content = content.replace(
        'import { usePortalSettings } from "../../data/portalSettingsData";',
        imports + 'import { usePortalSettings } from "../../data/portalSettingsData";'
    )

if "const [gallery] = useGallery();" not in content:
    content = content.replace(
        'const [portalSettings] = usePortalSettings();',
        'const [portalSettings] = usePortalSettings();\n  const [gallery] = useGallery();'
    )

gallery_section = """
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
"""

if "Our Gallery" not in content:
    content = content.replace(
        '      </div>\n    </div>',
        '      </div>\n' + gallery_section + '\n    </div>'
    )

with open("src/pages/public/About.tsx", "w") as f:
    f.write(content)
