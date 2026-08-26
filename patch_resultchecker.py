import re

with open("src/pages/public/ResultChecker.tsx", "r") as f:
    content = f.read()

imports = 'import { useSkillsDb } from "../../data/skillsData";\n'

if "useSkillsDb" not in content:
    content = content.replace(
        'import { getStoredPins, saveStoredPins } from "../../data/pinsData";',
        imports + 'import { getStoredPins, saveStoredPins } from "../../data/pinsData";'
    )

if "const [skillsDb] = useSkillsDb();" not in content:
    content = content.replace(
        "const scores = getStoredScores();",
        "const scores = getStoredScores();\n  const [skillsDb] = useSkillsDb();"
    )

old_affective_domain = """                {/* AFFECTIVE EVALUATION */}
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-2">
                  <p className="font-bold text-slate-900 text-center border-b border-slate-300 pb-1 uppercase">AFFECTIVE DOMAIN</p>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Attentiveness:</span>
                      <span className="font-bold text-slate-900">5 / 5</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Neatness & Politeness:</span>
                      <span className="font-bold text-slate-900">5 / 5</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Honesty & Reliability:</span>
                      <span className="font-bold text-slate-900">4 / 5</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">Relationship with Others:</span>
                      <span className="font-bold text-slate-900">5 / 5</span>
                    </div>
                  </div>
                </div>

                {/* PSYCHOMOTOR EVALUATION */}
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-2">
                  <p className="font-bold text-slate-900 text-center border-b border-slate-300 pb-1 uppercase">PSYCHOMOTOR DOMAIN</p>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Handwriting:</span>
                      <span className="font-bold text-slate-900">A</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Fluency / Speech:</span>
                      <span className="font-bold text-slate-900">B</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Sports & Games:</span>
                      <span className="font-bold text-slate-900">A</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">Handling Tools:</span>
                      <span className="font-bold text-slate-900">C</span>
                    </div>
                  </div>
                </div>"""

new_affective_domain = """                {/* AFFECTIVE EVALUATION */}
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-2">
                  <p className="font-bold text-slate-900 text-center border-b border-slate-300 pb-1 uppercase">AFFECTIVE DOMAIN</p>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Attentiveness:</span>
                      <span className="font-bold text-slate-900">{skillsDb[foundStudent.id]?.["Attentiveness"] || "C"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Neatness:</span>
                      <span className="font-bold text-slate-900">{skillsDb[foundStudent.id]?.["Neatness"] || "C"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Politeness:</span>
                      <span className="font-bold text-slate-900">{skillsDb[foundStudent.id]?.["Politeness"] || "C"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Honesty:</span>
                      <span className="font-bold text-slate-900">{skillsDb[foundStudent.id]?.["Honesty"] || "C"}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">Relationship with Others:</span>
                      <span className="font-bold text-slate-900">{skillsDb[foundStudent.id]?.["Rel. With Others"] || "C"}</span>
                    </div>
                  </div>
                </div>

                {/* PSYCHOMOTOR EVALUATION */}
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-2">
                  <p className="font-bold text-slate-900 text-center border-b border-slate-300 pb-1 uppercase">PSYCHOMOTOR DOMAIN</p>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Handwriting:</span>
                      <span className="font-bold text-slate-900">{skillsDb[foundStudent.id]?.["Handwriting"] || "C"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Fluency / Speech:</span>
                      <span className="font-bold text-slate-900">{skillsDb[foundStudent.id]?.["Fluency"] || "C"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-0.5">
                      <span className="text-slate-600">Sports & Games:</span>
                      <span className="font-bold text-slate-900">{skillsDb[foundStudent.id]?.["Games/Sports"] || "C"}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">Music Skills:</span>
                      <span className="font-bold text-slate-900">{skillsDb[foundStudent.id]?.["Music Skills"] || "C"}</span>
                    </div>
                  </div>
                </div>"""

content = content.replace(old_affective_domain, new_affective_domain)

with open("src/pages/public/ResultChecker.tsx", "w") as f:
    f.write(content)
