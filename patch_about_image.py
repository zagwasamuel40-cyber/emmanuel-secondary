import re

with open("src/pages/public/About.tsx", "r") as f:
    content = f.read()

old_image = """        <div className="bg-slate-100 rounded-2xl overflow-hidden min-h-[300px] relative shadow-inner">
            <img src="/about-image.png" alt="Students in computer lab" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-sm z-10 opacity-100 hover:opacity-0 transition-opacity duration-300">
               <p className="text-slate-600 text-sm font-medium px-4 text-center">Please upload your image as "about-image.png" into the public folder via the File Explorer.</p>
            </div>
        </div>"""

new_image = """        <div className="bg-slate-100 rounded-2xl overflow-hidden min-h-[300px] relative shadow-inner">
            <img 
              src={portalSettings.aboutUsImageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} 
              alt="School Campus" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
        </div>"""

content = content.replace(old_image, new_image)

with open("src/pages/public/About.tsx", "w") as f:
    f.write(content)
