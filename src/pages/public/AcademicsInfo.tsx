export default function AcademicsInfo() {
  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-heading text-4xl font-bold text-slate-900 mb-6">Academic Excellence</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Our rigorous curriculum is designed to challenge students and prepare them for outstanding success in BECE, WAEC, and NECO examinations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-heading text-2xl font-bold text-slate-900 mb-4">Junior Secondary (JSS 1-3)</h3>
          <p className="text-slate-600 mb-6">A broad-based foundational curriculum preparing students for the Basic Education Certificate Examination (BECE).</p>
          <ul className="space-y-3 text-slate-700 font-medium">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Mathematics & English Language</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Basic Science & Technology</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Pre-Vocational Studies</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> National Values Education</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Cultural & Creative Arts</li>
          </ul>
        </div>
        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-heading text-2xl font-bold text-slate-900 mb-4">Senior Secondary (SSS 1-3)</h3>
          <p className="text-slate-600 mb-6">Specialized tracks in Science, Arts, and Commercial studies preparing students for WAEC and NECO.</p>
          <ul className="space-y-3 text-slate-700 font-medium">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Core: Math, English, Civic Education</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Sciences: Physics, Chemistry, Biology</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Arts: Literature, Government, History</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Commercial: Accounting, Commerce</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
