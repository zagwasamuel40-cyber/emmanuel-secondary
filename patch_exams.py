import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

# Make sure we add UploadCloud if we want to use it
if 'UploadCloud' not in content:
    content = content.replace('Download,', 'Download, UploadCloud,')

old_exams_tab = '''      {/* TAB 3: ENTRANCE EXAM & ASSESSMENT */}
      {activeTab === "exams" && (
        <Card className="border border-slate-200">'''

new_exams_tab = '''      {/* TAB 3: ENTRANCE EXAM & ASSESSMENT */}
      {activeTab === "exams" && (
        <div className="space-y-6">
          {/* CBT Management Card */}
          <Card className="border border-amber-200 bg-amber-50/30">
            <CardHeader className="border-b border-amber-200/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-amber-950 flex items-center gap-2">
                    <Sparkles className="text-amber-600" size={18} /> Entrance Examination CBT Management
                  </CardTitle>
                  <p className="text-xs text-amber-800/80 mt-1">Generate, upload, or download computer-based test (CBT) questions for the entrance examination.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center space-y-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Generate Questions</h3>
                    <p className="text-xs text-slate-500 mt-1">Automatically generate randomized CBT questions for candidates.</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => alert("CBT questions generated successfully.")}>
                    Generate
                  </Button>
                </div>
                
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center space-y-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Upload Questions</h3>
                    <p className="text-xs text-slate-500 mt-1">Upload an Excel or CSV file containing custom CBT questions.</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => document.getElementById('cbt-upload')?.click()}>
                    Upload File
                  </Button>
                  <input type="file" id="cbt-upload" className="hidden" accept=".csv, .xlsx" onChange={() => alert("Questions uploaded successfully.")} />
                </div>
                
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center space-y-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Download size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Download Questions</h3>
                    <p className="text-xs text-slate-500 mt-1">Export the current question bank for offline review or backup.</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => alert("Downloading CBT questions...")}>
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        <Card className="border border-slate-200">'''

content = content.replace(old_exams_tab, new_exams_tab)

old_close = '''                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}'''

new_close = '''                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </div>
      )}'''

content = content.replace(old_close, new_close)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
