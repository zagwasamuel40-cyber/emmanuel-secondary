import re

with open("src/pages/public/ResultChecker.tsx", "r") as f:
    content = f.read()

old_dicebear = """                  <div className="w-24 h-24 rounded-lg border-2 border-slate-300 overflow-hidden bg-slate-100 shrink-0 shadow-inner">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${foundStudent.id}`} 
                      alt={foundStudent.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>"""

new_dicebear = """                  <div className="w-24 h-24 rounded-lg border-2 border-slate-300 overflow-hidden bg-slate-100 shrink-0 shadow-inner">
                    {foundStudent.passportUrl ? (
                      <img src={foundStudent.passportUrl} alt={foundStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${foundStudent.id}`} 
                        alt={foundStudent.name} 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>"""

content = content.replace(old_dicebear, new_dicebear)

with open("src/pages/public/ResultChecker.tsx", "w") as f:
    f.write(content)
