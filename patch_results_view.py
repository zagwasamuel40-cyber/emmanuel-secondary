import re

with open("src/pages/student/StudentSubjects.tsx", "r") as f:
    content = f.read()

if "StudentReportCard" not in content:
    content = content.replace(
        'import { BookOpen,',
        'import { StudentReportCard } from "../../components/StudentReportCard";\nimport { BookOpen,'
    )

old_block_regex = r'\{resultVisible && !releaseError \? \(\n\s*<div className="space-y-6">.*?<div className="p-4 bg-emerald-50.*?<div className="border border-slate-200.*?<table.*?</table>.*?</div>.*?<div className="mt-8 flex justify-end">.*?</div>\n\s*</div>\n\s*\) : \('

new_block = """{resultVisible && !releaseError ? (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-900">Term Result Released</h4>
                    <p className="text-sm text-emerald-700 mt-1">Below is the breakdown of your performance.</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100" onClick={() => window.print()}>
                    <Download size={14} className="mr-2" /> Download / Print Report Card
                  </Button>
                </div>
                
                <div className="overflow-x-auto pb-4">
                  <StudentReportCard session={resSession} term={resTerm} student={currentStudent || students[0]} />
                </div>
              </div>
            ) : ("""

content = re.sub(old_block_regex, new_block, content, flags=re.DOTALL)

with open("src/pages/student/StudentSubjects.tsx", "w") as f:
    f.write(content)
