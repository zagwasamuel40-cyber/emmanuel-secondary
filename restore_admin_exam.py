import re

with open("src/pages/Examinations.tsx", "r") as f:
    content = f.read()

# 1. Section 2: Results & Broadsheets
results_section = """
          {!isStaff && (
            <>
              {/* ADMIN SECTION 2: RESULTS & BROADSHEETS */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <FileCheck size={13} /> Result Printing & Broadsheet Reports
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-blue-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("class_result")}
                  >
                    <Printer size={14} className="text-blue-400 shrink-0" />
                    <span className="truncate">Print Class Result</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-blue-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("check_student_result")}
                  >
                    <UserCheck size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">Check Student Result</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-blue-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("locomotive_assessment")}
                  >
                    <FileText size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate">Locomotive / Affective</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-indigo-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("class_result_pre_select")}
                  >
                    <Printer size={14} className="text-indigo-400 shrink-0" />
                    <span className="truncate">Pre-Select Class Result</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-indigo-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("result_summary")}
                  >
                    <Table size={14} className="text-indigo-400 shrink-0" />
                    <span className="truncate">Get Result Summary</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-indigo-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("master_broadsheet")}
                  >
                    <FileCheck size={14} className="text-indigo-300 shrink-0" />
                    <span className="truncate">Get Master/Broad Sheet</span>
                  </Button>
                </div>
              </div>

              {/* ADMIN SECTION 3: PERFORMANCE RANKINGS & ANNUAL ANALYSIS */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Award size={13} /> Performance Rankings & Annual Analysis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("best_per_subject")}
                  >
                    <Award size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate">View Best Per Subject</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("best_per_class")}
                  >
                    <Award size={14} className="text-amber-300 shrink-0" />
                    <span className="truncate">View Overall Best Per Class</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("school_best_per_class")}
                  >
                    <Award size={14} className="text-amber-200 shrink-0" />
                    <span className="truncate">View School Overall Best Per Class</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("class_annual_result")}
                  >
                    <BarChart3 size={14} className="text-purple-300 shrink-0" />
                    <span className="truncate">View/Print Class Annual Result</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("overall_annual_analysis")}
                  >
                    <BarChart3 size={14} className="text-pink-400 shrink-0" />
                    <span className="truncate">Overall Annual (Analysis)</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("add_score_to_annual")}
                  >
                    <Plus size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">Add Score To Annual</span>
                  </Button>
                </div>
              </div>

              {/* ADMIN SECTION 4: VALIDATION, COMPUTATION & DELETIONS */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} /> Validation, Position Computations & Deletions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-emerald-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={handleValidateExam}
                  >
                    <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">Validate/Cross Check</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={handleReworkTotals}
                  >
                    <Calculator size={14} className="text-sky-400 shrink-0" />
                    <span className="truncate">Rework Total</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={handleRecomputePositions}
                  >
                    <ListOrdered size={14} className="text-indigo-400 shrink-0" />
                    <span className="truncate">Recompute Position</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-emerald-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => {
                      const newStatus = updateRelease(selectedSessionYear, selectedTerm, selectedClass);
                      setNotificationMsg(newStatus ? `Examination Results for ${selectedSession} (${selectedClass}) Published to Student Portal!` : `Results for ${selectedSession} (${selectedClass}) Unpublished (Draft Mode).`);
                      setTimeout(() => setNotificationMsg(""), 3500);
                    }}
                  >
                    <Lock size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate">{isPublished ? "Result Released" : "Release Result"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-rose-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("delete_subject_recorded")}
                  >
                    <Trash2 size={14} className="text-rose-400 shrink-0" />
                    <span className="truncate">Delete Subject Recorded</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-rose-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("delete_single_subject")}
                  >
                    <Trash2 size={14} className="text-rose-300 shrink-0" />
                    <span className="truncate">Delete Single Subject</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-rose-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("delete_annual_subject_class")}
                  >
                    <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                    <span className="truncate">Delete Annual Per Class</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-rose-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("delete_single_annual")}
                  >
                    <AlertTriangle size={14} className="text-rose-400 shrink-0" />
                    <span className="truncate">Delete Single Annual</span>
                  </Button>
                </div>
              </div>
            </>
          )}
"""

pattern = re.compile(r'(          \{\/\* SECTION 2: LIVE CLASSES \& ASSIGNMENTS \*\/\}.*?          <\/div>\n)', re.DOTALL)
content = pattern.sub(r'\1' + "\n" + results_section, content, count=1)

with open("src/pages/Examinations.tsx", "w") as f:
    f.write(content)
