import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

if 'const [isEditingInspect' not in content:
    content = content.replace(
        'const [inspectApp, setInspectApp] = useState<any | null>(null);',
        'const [inspectApp, setInspectApp] = useState<any | null>(null);\n  const [isEditingInspect, setIsEditingInspect] = useState(false);'
    )

old_inspect_header = """            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  {inspectApp.id}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1">{inspectApp.name}</h3>
              </div>
              <button onClick={() => setInspectApp(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle size={20} />
              </button>
            </div>"""

new_inspect_header = """            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex-1 mr-4">
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                  {inspectApp.id}
                </span>
                {isEditingInspect ? (
                  <Input 
                    value={inspectApp.name} 
                    onChange={(e) => setInspectApp({...inspectApp, name: e.target.value})} 
                    className="mt-2 h-8 text-sm font-bold" 
                  />
                ) : (
                  <h3 className="font-bold text-slate-900 text-lg mt-1 flex items-center gap-2">
                    {inspectApp.name}
                    <button onClick={() => setIsEditingInspect(true)} className="text-brand-600 hover:text-brand-800" title="Edit Profile">
                      <Edit2 size={14} />
                    </button>
                  </h3>
                )}
              </div>
              <button onClick={() => { setInspectApp(null); setIsEditingInspect(false); }} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle size={20} />
              </button>
            </div>"""

content = content.replace(old_inspect_header, new_inspect_header)

old_inspect_body = """            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">Class Applied</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{inspectApp.class || inspectApp.assignedClass}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">State & LGA</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{inspectApp.state || 'Benue'} ({inspectApp.lga || 'Makurdi'})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">Phone & Email</p>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{inspectApp.phone}</p>
                <p className="text-slate-500 text-[11px] truncate">{inspectApp.email || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">Exam Score</p>
                <p className="font-bold text-amber-900 text-sm mt-0.5">{inspectApp.examScore || 0}% ({inspectApp.examStatus || 'N/A'})</p>
              </div>
            </div>"""

new_inspect_body = """            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">Class Applied</p>
                {isEditingInspect ? (
                  <Input 
                    value={inspectApp.class || inspectApp.assignedClass} 
                    onChange={(e) => setInspectApp({...inspectApp, class: e.target.value, assignedClass: e.target.value})} 
                    className="mt-1 h-7 text-xs" 
                  />
                ) : (
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{inspectApp.class || inspectApp.assignedClass}</p>
                )}
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">State & LGA</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{inspectApp.state || 'Benue'} ({inspectApp.lga || 'Makurdi'})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">Phone & Email</p>
                {isEditingInspect ? (
                  <div className="space-y-1 mt-1">
                    <Input value={inspectApp.phone || ''} onChange={e => setInspectApp({...inspectApp, phone: e.target.value})} className="h-7 text-xs" placeholder="Phone" />
                    <Input value={inspectApp.email || ''} onChange={e => setInspectApp({...inspectApp, email: e.target.value})} className="h-7 text-[11px]" placeholder="Email" />
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{inspectApp.phone}</p>
                    <p className="text-slate-500 text-[11px] truncate">{inspectApp.email || 'N/A'}</p>
                  </>
                )}
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-slate-400 font-medium">Exam Score</p>
                {isEditingInspect ? (
                  <Input 
                    type="number"
                    value={inspectApp.examScore || 0} 
                    onChange={(e) => setInspectApp({...inspectApp, examScore: parseInt(e.target.value) || 0})} 
                    className="mt-1 h-7 text-xs" 
                  />
                ) : (
                  <p className="font-bold text-amber-900 text-sm mt-0.5">{inspectApp.examScore || 0}% ({inspectApp.examStatus || 'N/A'})</p>
                )}
              </div>
            </div>"""

content = content.replace(old_inspect_body, new_inspect_body)


old_inspect_footer = """            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <Button onClick={() => { setInspectApp(null); handleIssueOffer(inspectApp); }} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5">
                <Printer size={14} /> Generate Offer Letter
              </Button>
              <Button variant="outline" onClick={() => setInspectApp(null)} className="text-xs">
                Close
              </Button>
            </div>"""

new_inspect_footer = """            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              {isEditingInspect ? (
                <Button onClick={() => {
                  setApps(prev => prev.map(a => a.id === inspectApp.id ? inspectApp : a));
                  setIsEditingInspect(false);
                  showToast("Candidate profile updated successfully.");
                }} className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs">
                  <Save size={14} className="mr-1.5" /> Save Changes
                </Button>
              ) : (
                <>
                  <Button onClick={() => { setInspectApp(null); handleIssueOffer(inspectApp); }} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5">
                    <Printer size={14} /> Generate Offer Letter
                  </Button>
                  <Button variant="outline" onClick={() => { setInspectApp(null); setIsEditingInspect(false); }} className="text-xs">
                    Close
                  </Button>
                </>
              )}
            </div>"""

content = content.replace(old_inspect_footer, new_inspect_footer)

if 'Edit2' not in content:
    content = content.replace('XCircle, AlertCircle }', 'XCircle, AlertCircle, Edit2, Save }')
else:
    if 'Save' not in content:
        content = content.replace('Edit2, ', 'Edit2, Save, ')

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
