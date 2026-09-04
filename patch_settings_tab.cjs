const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

code = code.replace(/import \{ Building, GraduationCap, Shield, Save, Bell, Plus, Trash2 \} from "lucide-react";/, `import { Building, GraduationCap, Shield, Save, Bell, Plus, Trash2, Users } from "lucide-react";`);

code = code.replace(/<button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent text-left hover:bg-slate-50 transition-colors">\s*<Shield size=\{18\} className="text-slate-500" \/>\s*<div>\s*<p className="font-medium text-slate-700 text-sm">Security & Access<\/p>\s*<p className="text-xs text-slate-500">Roles, passwords, backups<\/p>\s*<\/div>\s*<\/button>/, `<button onClick={() => setActiveTab("team")} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors \${activeTab === "team" ? "bg-white border border-slate-200" : "border border-transparent hover:bg-slate-50"}\`}>
            <Users size={18} className={activeTab === "team" ? "text-brand-600" : "text-slate-500"} />
            <div>
              <p className={\`font-medium text-sm \${activeTab === "team" ? "text-slate-900" : "text-slate-700"}\`}>Dedicated Team</p>
              <p className="text-xs text-slate-500">Manage school administration team</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent text-left hover:bg-slate-50 transition-colors">
            <Shield size={18} className="text-slate-500" />
            <div>
              <p className="font-medium text-slate-700 text-sm">Security & Access</p>
              <p className="text-xs text-slate-500">Roles, passwords, backups</p>
            </div>
          </button>`);

fs.writeFileSync('src/pages/Settings.tsx', code);
