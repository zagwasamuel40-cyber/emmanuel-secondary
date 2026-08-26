import re

with open("src/pages/student/StudentSubjects.tsx", "r") as f:
    content = f.read()

if 'usePortalSettings' not in content:
    content = content.replace(
        'import { isResultReleased, useResultsRelease } from "../../data/resultsReleaseData";',
        'import { isResultReleased, useResultsRelease } from "../../data/resultsReleaseData";\nimport { usePortalSettings } from "../../data/portalSettingsData";'
    )
    
    content = content.replace(
        '  const [releaseMap] = useResultsRelease();',
        '  const [releaseMap] = useResultsRelease();\n  const [portalSettings] = usePortalSettings();'
    )

old_table_end = """                  </table>
                </div>
              </div>"""

new_table_end = """                  </table>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <div className="text-center sm:text-right border-t border-slate-200 pt-4 px-4 w-full sm:w-1/3">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Principal's Signature & Stamp:</p>
                    {portalSettings.principalSignatureUrl ? (
                      <div className="h-10 flex justify-center sm:justify-end mb-1">
                        <img src={portalSettings.principalSignatureUrl} alt="Principal Signature" className="h-full object-contain" />
                      </div>
                    ) : (
                      <div className="h-10 mb-1" />
                    )}
                    <p className="text-slate-900 font-bold text-sm uppercase">{portalSettings.principalName || "MR. ZAGWA SAMUEL"}</p>
                  </div>
                </div>

              </div>"""

content = content.replace(old_table_end, new_table_end)

with open("src/pages/student/StudentSubjects.tsx", "w") as f:
    f.write(content)
