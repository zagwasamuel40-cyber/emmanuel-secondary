import re

with open("src/pages/public/Admissions.tsx", "r") as f:
    content = f.read()

# Add link in header navigation
old_intro = """        <p className="text-slate-600 text-base max-w-2xl mx-auto">
          Complete the form below and upload all required verification documents to apply for enrollment at {portalSettings.schoolName}.
        </p>
      </div>"""
new_intro = """        <p className="text-slate-600 text-base max-w-2xl mx-auto mb-6">
          Complete the form below and upload all required verification documents to apply for enrollment at {portalSettings.schoolName}.
        </p>
        <Link to="/admission-status" className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-brand-200 text-brand-700 font-bold shadow-sm hover:bg-brand-50 transition-colors">
          <Search size={16} /> Already applied? Check Admission Status
        </Link>
      </div>"""
content = content.replace(old_intro, new_intro)

old_import = 'import { BookOpen, Award, FileCheck, CheckCircle2, ChevronRight, UploadCloud, FileText } from "lucide-react";'
new_import = 'import { BookOpen, Award, FileCheck, CheckCircle2, ChevronRight, UploadCloud, FileText, Search } from "lucide-react";\nimport { Link } from "react-router-dom";'
content = content.replace(old_import, new_import)

with open("src/pages/public/Admissions.tsx", "w") as f:
    f.write(content)
