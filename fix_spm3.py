import re

with open('src/pages/StudentPortalManager.tsx', 'r') as f:
    content = f.read()

# 1. Add selectedApp state
content = content.replace(
    '  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);',
    '  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);\n  const [selectedApp, setSelectedApp] = useState<any>(null);'
)

# 2. Replace the table
old_table = """            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-3">Applicant Name</th>
                    <th className="p-3">Applied For</th>
                    <th className="p-3">Previous School</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date Applied</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {admissionApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-medium text-slate-900">
                        {app.applicantName}
                        <div className="text-xs text-slate-500 font-normal">{app.email}</div>
                      </td>
                      <td className="p-3 font-medium">{app.appliedForClass}</td>
                      <td className="p-3 text-slate-500 text-xs truncate max-w-[120px]">{app.previousSchool || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          app.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                          app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-xs">{app.dateApplied}</td>
                      <td className="p-3 text-right flex items-center justify-end gap-2">
                        {app.status === 'Pending' && (
                          <>
                            <select 
                              className="text-xs border-slate-200 rounded p-1"
                              value={app.assignedClass || ''}
                              onChange={(e) => {
                                setAdmissionApps(prev => prev.map(a => a.id === app.id ? {...a, assignedClass: e.target.value} : a));
                              }}
                            >
                              <option value="">Assign Class...</option>
                              <option value="JSS 1A">JSS 1A</option>
                              <option value="JSS 1B">JSS 1B</option>
                            </select>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              onClick={() => {
                                setAdmissionApps(prev => prev.map(a => a.id === app.id ? {...a, status: 'Approved'} : a));
                                setSuccessMsg("Application Approved.");
                                setTimeout(() => setSuccessMsg(""), 3500);
                              }}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              onClick={() => {
                                setAdmissionApps(prev => prev.map(a => a.id === app.id ? {...a, status: 'Rejected'} : a));
                                setSuccessMsg("Application Rejected.");
                                setTimeout(() => setSuccessMsg(""), 3500);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {admissionApps.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                        No admission applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>"""

new_table = """            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-3">Applicant Name</th>
                    <th className="p-3">Applied For</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date Applied</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {admissionApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-medium text-slate-900">
                        {app.name}
                        <div className="text-xs text-slate-500 font-normal">{app.id}</div>
                      </td>
                      <td className="p-3 font-medium">{app.class}</td>
                      <td className="p-3 text-slate-500 text-xs">{app.phone}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          app.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                          app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-xs">{app.date}</td>
                      <td className="p-3 text-right flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 text-slate-600 border-slate-200 hover:bg-slate-50"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye size={12} /> View Data
                        </Button>
                        {app.status === 'Pending' && (
                          <>
                            <select 
                              className="text-xs border-slate-200 rounded p-1"
                              value={app.assignedClass || ''}
                              onChange={(e) => {
                                setAdmissionApps(prev => prev.map(a => a.id === app.id ? {...a, assignedClass: e.target.value} : a));
                              }}
                            >
                              <option value="">Assign Class...</option>
                              <option value="JSS 1A">JSS 1A</option>
                              <option value="JSS 1B">JSS 1B</option>
                              <option value="SSS 1A">SSS 1A</option>
                            </select>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              onClick={() => {
                                setAdmissionApps(prev => prev.map(a => a.id === app.id ? {...a, status: 'Approved'} : a));
                                setSuccessMsg("Application Approved.");
                                setTimeout(() => setSuccessMsg(""), 3500);
                              }}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              onClick={() => {
                                setAdmissionApps(prev => prev.map(a => a.id === app.id ? {...a, status: 'Rejected'} : a));
                                setSuccessMsg("Application Rejected.");
                                setTimeout(() => setSuccessMsg(""), 3500);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {admissionApps.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                        No admission applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>"""

content = content.replace(old_table, new_table)

# 3. Add the modal for selectedApp at the end
app_modal = """
      {/* MODAL: VIEW APPLICATION DETAILS */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-brand-400" />
                <CardTitle className="text-white">Applicant Data</CardTitle>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">Applicant Name</Label>
                  <p className="font-semibold text-slate-900">{selectedApp.name}</p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">Application ID</Label>
                  <p className="font-semibold text-slate-900">{selectedApp.id}</p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">Applied For Class</Label>
                  <p className="font-semibold text-slate-900">{selectedApp.class}</p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">Assigned Class</Label>
                  <p className="font-semibold text-slate-900">{selectedApp.assignedClass || 'Not Assigned'}</p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">Date Applied</Label>
                  <p className="font-semibold text-slate-900">{selectedApp.date}</p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">Phone / Contact</Label>
                  <p className="font-semibold text-slate-900">{selectedApp.phone}</p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">Application Fee</Label>
                  <p className="font-semibold text-slate-900">{selectedApp.payment}</p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs uppercase tracking-wider">Status</Label>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold inline-block mt-1 ${
                    selectedApp.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                    selectedApp.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {selectedApp.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setSelectedApp(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
"""

# Insert app modal before the last closing div
content = content.rsplit('    </div>', 1)
content = content[0] + app_modal + '    </div>' + content[1]

with open('src/pages/StudentPortalManager.tsx', 'w') as f:
    f.write(content)
