import re

with open('src/pages/StudentPortalManager.tsx', 'r') as f:
    content = f.read()

imports = """import { useAnnouncements, Announcement } from "../data/announcementsData";
import { useResultsRelease, isResultReleased } from "../data/resultsReleaseData";
import { useAdmissionApps } from "../data/studentsData";
import { FileText, Upload } from "lucide-react";"""

content = re.sub(r'import \{ useAnnouncements, Announcement \} from "../data/announcementsData";\nimport \{ useResultsRelease, isResultReleased \} from "../data/resultsReleaseData";', imports, content)

stateCode = """  const [announcements, setAnnouncements] = useAnnouncements();
  const [releaseMap, updateRelease] = useResultsRelease();
  const [activeTab, setActiveTab] = useState("features");
  const [admissionApps, setAdmissionApps] = useAdmissionApps();"""

content = re.sub(r'  const \[announcements, setAnnouncements\] = useAnnouncements\(\);\n  const \[releaseMap, updateRelease\] = useResultsRelease\(\);', stateCode, content)

tabsUI = """      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'features' ? 'bg-brand-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings size={18} /> Features & Announcements
        </button>
        <button 
          onClick={() => setActiveTab("admission")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'admission' ? 'bg-brand-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={18} /> Admission Admin
        </button>
      </div>

      {activeTab === "features" && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">"""

content = re.sub(r'      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">', tabsUI, content)

adminSection = """      </div>
      )}

      {activeTab === "admission" && (
        <Card className="border-0 shadow-sm animate-in fade-in">
          <CardHeader className="bg-slate-900 text-white rounded-t-xl">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText size={20} className="text-brand-400" />
              Admission Applications
            </CardTitle>
            <p className="text-slate-400 text-xs mt-1">Review and manage new student admission applications.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL: VIEW ANNOUNCEMENT DETAILS */}"""

content = re.sub(r'      \{\/\* MODAL: VIEW ANNOUNCEMENT DETAILS \*\/\}', adminSection, content)

with open('src/pages/StudentPortalManager.tsx', 'w') as f:
    f.write(content)

