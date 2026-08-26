import re

with open("src/pages/Examinations.tsx", "r") as f:
    content = f.read()

imports = 'import { useSkillsDb } from "../data/skillsData";\n'
if "useSkillsDb" not in content:
    content = content.replace(
        'import { useResultsRelease, isResultReleased } from "../data/resultsReleaseData";',
        'import { useResultsRelease, isResultReleased } from "../data/resultsReleaseData";\n' + imports
    )

if "const [skillsDb] = useSkillsDb();" not in content:
    content = content.replace(
        "const [affectiveRecords, setAffectiveRecords] = useState<AffectiveRecord[]>(initialAffectiveRecords);",
        "const [affectiveRecords, setAffectiveRecords] = useState<AffectiveRecord[]>(initialAffectiveRecords);\n  const [skillsDb] = useSkillsDb();"
    )

old_lookup_block = """              <div className="space-y-1.5">
                <Label>Select Student / Admission No.</Label>
                <select 
                  className="w-full h-10 border rounded-lg px-3 text-sm"
                  value={studentLookupId}
                  onChange={(e) => setStudentLookupId(e.target.value)}
                >
                  {scores.map(s => <option key={s.id} value={s.studentId}>{s.studentName} ({s.studentId})</option>)}
                </select>
              </div>"""

new_lookup_block = """              <div className="space-y-1.5">
                <Label>Enter Student Admission No.</Label>
                <Input 
                  className="w-full h-10"
                  placeholder="e.g. ESS/2026/001"
                  value={studentLookupId}
                  onChange={(e) => setStudentLookupId(e.target.value)}
                />
              </div>"""

content = content.replace(old_lookup_block, new_lookup_block)

# Now fix affective mapping inside renderStudentReportCard
# The keys in `skillsDb[studentId]` are things like "Attentiveness", "Attendance", "Punctuality", etc.

old_affective_code = """    const currentAffective = affectiveRecords.find((a: any) => a.studentId === student.studentId) || {
      attentiveness: 'A', attendance: 'A', punctuality: 'A', neatness: 'A', politeness: 'A', relWithOthers: 'A', curiosity: 'B', honesty: 'A', humility: 'A', tolerance: 'A', leadership: 'A', courage: 'B', handwriting: 'B', fluency: 'A', gamesSports: 'A', musicSkills: 'B', construction: 'B'
    };

    const traits = [
      { key: 'attentiveness', label: 'Attentiveness' }, { key: 'attendance', label: 'Attendance' }, { key: 'punctuality', label: 'Punctuality' }, { key: 'neatness', label: 'Neatness' }, { key: 'politeness', label: 'Politeness' }, { key: 'relWithOthers', label: 'Rel. With Others' }, { key: 'curiosity', label: 'Curiosity' }, { key: 'honesty', label: 'Honesty' }, { key: 'humility', label: 'Humility' }, { key: 'tolerance', label: 'Tolerance' }, { key: 'leadership', label: 'Leadership' }, { key: 'courage', label: 'Courage' }, { key: 'handwriting', label: 'Handwriting' }, { key: 'fluency', label: 'Fluency' }, { key: 'gamesSports', label: 'Games/Sports' }, { key: 'musicSkills', label: 'Music Skills' }, { key: 'construction', label: 'Construction' },
    ];"""

new_affective_code = """    const currentAffective = skillsDb[student.studentId] || affectiveRecords.find((a: any) => a.studentId === student.studentId) || {};

    const traits = [
      { key: 'Attentiveness', label: 'Attentiveness' }, { key: 'Attendance', label: 'Attendance' }, { key: 'Punctuality', label: 'Punctuality' }, { key: 'Neatness', label: 'Neatness' }, { key: 'Politeness', label: 'Politeness' }, { key: 'Rel. With Others', label: 'Rel. With Others' }, { key: 'Curiosity', label: 'Curiosity' }, { key: 'Honesty', label: 'Honesty' }, { key: 'Humility', label: 'Humility' }, { key: 'Tolerance', label: 'Tolerance' }, { key: 'Leadership', label: 'Leadership' }, { key: 'Courage', label: 'Courage' }, { key: 'Handwriting', label: 'Handwriting' }, { key: 'Fluency', label: 'Fluency' }, { key: 'Games/Sports', label: 'Games/Sports' }, { key: 'Music Skills', label: 'Music Skills' }, { key: 'Construction', label: 'Construction' },
    ];"""

# Also we need to make sure the rendering uses currentAffective[t.label] or t.key
# Let's check how traits are rendered.
content = content.replace(old_affective_code, new_affective_code)

with open("src/pages/Examinations.tsx", "w") as f:
    f.write(content)
