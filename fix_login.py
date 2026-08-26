import re

with open("src/pages/Login.tsx", "r") as f:
    content = f.read()

# Fix grid class
content = content.replace('grid-cols-2 sm:grid-cols-5 gap-2', 'grid-cols-3 gap-2')

# Remove Super Admin button
superadmin_btn = r'''                <button
                  type="button"
                  onClick={() => fillDemo('superadmin')}
                  className="p-2 border border-amber-300 bg-amber-50/60 hover:bg-amber-100/80 rounded-lg text-xs font-bold text-amber-900 flex flex-col items-center gap-1 transition-all shadow-sm"
                >
                  <Shield size={16} className="text-amber-600" />
                  <span>Admission</span>
                </button>'''
content = content.replace(superadmin_btn, '')

# Remove Portal Admin button
portaladmin_btn = r'''                <button
                  type="button"
                  onClick={() => fillDemo('portaladmin')}
                  className="p-2 border border-purple-300 bg-purple-50/60 hover:bg-purple-100/80 rounded-lg text-xs font-bold text-purple-900 flex flex-col items-center gap-1 transition-all shadow-sm"
                >
                  <Sparkles size={16} className="text-purple-600" />
                  <span>Portal Admin</span>
                </button>'''
content = content.replace(portaladmin_btn, '')

# Remove Portal Admin & Admission Login Detail Box completely
detail_box = r'''              {/* Portal Admin & Admission Login Detail Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl text-xs space-y-1 text-purple-950">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900">
                    <Sparkles size={14} className="text-purple-600 shrink-0" />
                    <span>Portal Admin Credentials</span>
                  </div>
                  <p className="text-[11px] text-purple-900 leading-tight">
                    User: <code className="bg-purple-100 px-1 py-0.5 rounded font-mono font-bold text-purple-950">portaladmin@ess.edu.ng</code>
                  </p>
                  <p className="text-[11px] text-purple-900 leading-tight">
                    Pass: <code className="bg-purple-100 px-1 py-0.5 rounded font-mono font-bold text-purple-950">portal123</code>
                  </p>
                  <p className="text-[10px] text-purple-800 font-medium italic mt-0.5">
                    &bull; Post news, change motto, colors & portal theme.
                  </p>
                </div>

                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Shield size={14} className="text-amber-600 shrink-0" />
                    <span>Admission Officer</span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 leading-tight">
                    User: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-950">admission@ess.edu.ng</code>
                  </p>
                  <p className="text-[11px] text-amber-800/90 leading-tight">
                    Pass: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-950">admission123</code>
                  </p>
                  <p className="text-[10px] text-amber-700 font-medium italic mt-0.5">
                    &bull; Review applicants & issue offers.
                  </p>
                </div>
              </div>'''
content = content.replace(detail_box, '')

# Cleanup empty lines left behind by the removal
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

with open("src/pages/Login.tsx", "w") as f:
    f.write(content)
