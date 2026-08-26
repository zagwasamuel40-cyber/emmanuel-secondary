import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

import_sessions = 'import { useSessions, TERMS } from "../data/sessionsData";\n'
if 'useSessions' not in content:
    content = content.replace('import { useInquiries } from "../data/inquiriesData";', import_sessions + 'import { useInquiries } from "../data/inquiriesData";')

# Find where state is declared
if 'const [cbtClass, setCbtClass]' not in content:
    state_decl = '''  const [inquiries, setInquiries] = useInquiries();
  const [sessions, , currentSession] = useSessions();
  const [cbtClass, setCbtClass] = useState(CLASSES[0]);
  const [cbtSession, setCbtSession] = useState(() => currentSession || "2025/2026");
  const [cbtTerm, setCbtTerm] = useState(TERMS[0]);'''
    content = content.replace('  const [inquiries, setInquiries] = useInquiries();', state_decl)

old_cbt = '''            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center space-y-3">'''

new_cbt = '''            <CardContent className="pt-6">
              {/* CBT Selectors */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-white/50 border border-amber-200/50 rounded-xl">
                <div className="flex-1 space-y-1 text-left">
                  <Label className="text-xs text-amber-950 font-bold">Class</Label>
                  <select 
                    value={cbtClass}
                    onChange={(e) => setCbtClass(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-1 text-left">
                  <Label className="text-xs text-amber-950 font-bold">Academic Session</Label>
                  <select 
                    value={cbtSession}
                    onChange={(e) => setCbtSession(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-1 text-left">
                  <Label className="text-xs text-amber-950 font-bold">Term</Label>
                  <select 
                    value={cbtTerm}
                    onChange={(e) => setCbtTerm(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center space-y-3">'''

content = content.replace(old_cbt, new_cbt)

# Update the buttons to alert with the selected variables
btn_generate = '''onClick={() => alert("CBT questions generated successfully.")}'''
btn_generate_new = '''onClick={() => alert(`CBT questions for ${cbtClass} (${cbtSession} - ${cbtTerm}) generated successfully.`)}'''
content = content.replace(btn_generate, btn_generate_new)

btn_upload = '''onChange={() => alert("Questions uploaded successfully.")}'''
btn_upload_new = '''onChange={() => alert(`Questions for ${cbtClass} (${cbtSession} - ${cbtTerm}) uploaded successfully.`)}'''
content = content.replace(btn_upload, btn_upload_new)

btn_download = '''onClick={() => alert("Downloading CBT questions...")}'''
btn_download_new = '''onClick={() => alert(`Downloading CBT questions for ${cbtClass} (${cbtSession} - ${cbtTerm})...`)}'''
content = content.replace(btn_download, btn_download_new)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
