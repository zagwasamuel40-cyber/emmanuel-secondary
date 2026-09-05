const fs = require('fs');
let code = fs.readFileSync('src/pages/AdmissionsManagement.tsx', 'utf-8');

const statsInjection = `
          {/* Dashboard Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Scheduled</p>
              <div className="text-2xl font-black text-slate-900">{exams.length} Exams</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Assigned Candidates</p>
              <div className="text-2xl font-black text-amber-600">{codes.length} Candidates</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Written Exam</p>
              <div className="text-2xl font-black text-emerald-600">
                {codes.filter(c => c.attemptStatus === "Completed" || c.attemptStatus === "Auto-Submitted").length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Yet to Write</p>
              <div className="text-2xl font-black text-blue-600">
                {codes.filter(c => c.status === "Unused" || c.status === "Activated").length}
              </div>
            </div>
          </div>
`;

if (!code.includes('Dashboard Summary Statistics')) {
  code = code.replace(
    /\{activeTab === "exams" && \(\s*<div className="space-y-6">/,
    '{activeTab === "exams" && (\n        <div className="space-y-6">\n' + statsInjection
  );
  fs.writeFileSync('src/pages/AdmissionsManagement.tsx', code);
}
