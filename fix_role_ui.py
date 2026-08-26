import re

with open("src/pages/Teachers.tsx", "r") as f:
    content = f.read()

# 1. Fix the remaining t.isAdmin
content = content.replace("t.isAdmin", '(t.systemRole && t.systemRole !== "Teacher")')

# 2. Add selectedTeacherForRoleChange state
content = re.sub(
    r'const \[selectedTeacherForIdChange, setSelectedTeacherForIdChange\] = useState<Teacher \| null>\(null\);',
    r'const [selectedTeacherForIdChange, setSelectedTeacherForIdChange] = useState<Teacher | null>(null);\n  const [selectedTeacherForRoleChange, setSelectedTeacherForRoleChange] = useState<Teacher | null>(null);\n  const [newRoleInput, setNewRoleInput] = useState<string>("Teacher");',
    content
)

# 3. Replace the button at ~920
old_button_1 = r'''                            {/\* Make / Remove Admin Toggle \*/}
                            <Button
                              size="sm"
                              variant="outline"
                              className=\{`h-8 text-xs gap-1 \$\{
                                \(teacher.systemRole && teacher.systemRole !== "Teacher"\)
                                  \? "border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100" 
                                  : "border-indigo-200 text-indigo-800 bg-indigo-50 hover:bg-indigo-100"
                              \}`}
                              onClick=\{\(\) => handleToggleAdminStatus\(teacher.id\)\}
                              title=\{\(teacher.systemRole && teacher.systemRole !== "Teacher"\) \? "Remove Admin Privileges" : "Make Admin Staff"\}
                            >
                              <ShieldCheck size=\{13\} />
                              \{\(teacher.systemRole && teacher.systemRole !== "Teacher"\) \? "Remove Admin" : "Make Admin"\}
                            </Button>'''
new_button_1 = r'''                            {/* Assign Role */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1 border-indigo-200 text-indigo-800 bg-indigo-50 hover:bg-indigo-100"
                              onClick={() => {
                                setSelectedTeacherForRoleChange(teacher);
                                setNewRoleInput(teacher.systemRole || "Teacher");
                                setActiveModal("assign_role");
                              }}
                              title="Assign Role"
                            >
                              <UserCog size={13} />
                              Assign Role
                            </Button>'''
content = re.sub(old_button_1, new_button_1, content)

# 4. Replace the button at ~1310
old_button_2 = r'''                        <Button
                          size="sm"
                          variant="outline"
                          className=\{`h-8 text-xs font-bold gap-1.5 \$\{
                            \(t.systemRole && t.systemRole !== "Teacher"\) 
                              \? "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100" 
                              : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                          \}`}
                          onClick=\{\(\) => handleToggleAdminStatus\(t.id\)\}
                        >
                          <ShieldCheck size=\{14\} />
                          \{\(t.systemRole && t.systemRole !== "Teacher"\) \? "Remove Admin" : "Make Admin"\}
                        </Button>'''
new_button_2 = r'''                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-bold gap-1.5 border-indigo-200 text-indigo-800 bg-indigo-50 hover:bg-indigo-100"
                          onClick={() => {
                            setSelectedTeacherForRoleChange(t);
                            setNewRoleInput(t.systemRole || "Teacher");
                            setActiveModal("assign_role");
                          }}
                        >
                          <UserCog size={14} />
                          Assign Role
                        </Button>'''
content = re.sub(old_button_2, new_button_2, content)

# 5. Add the assign_role modal at the bottom
modal_string = r'''
      {/* MODAL: ASSIGN ROLE */}
      {activeModal === "assign_role" && selectedTeacherForRoleChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-sm border-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-slate-900 text-white pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <UserCog size={18} className="text-amber-400" />
                Assign System Role
              </CardTitle>
              <button onClick={() => { setActiveModal(null); setSelectedTeacherForRoleChange(null); }} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Staff Member</p>
                <p className="font-bold text-slate-900">{selectedTeacherForRoleChange.name}</p>
                <p className="text-xs text-slate-500">{selectedTeacherForRoleChange.id}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select Access Role</Label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={newRoleInput}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                >
                  <option value="Teacher">Teacher (Standard)</option>
                  <option value="Admin">Admin (Full Access)</option>
                  <option value="Admission Officer">Admission Officer</option>
                  <option value="Portal Admin">Portal Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
                <p className="text-xs text-slate-500 pt-1">
                  This role determines their system access level across the platform.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => { setActiveModal(null); setSelectedTeacherForRoleChange(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="brand"
                  className="w-full bg-brand-600 hover:bg-brand-700"
                  onClick={() => {
                    handleAssignRole(selectedTeacherForRoleChange.id, newRoleInput);
                    setActiveModal(null);
                    setSelectedTeacherForRoleChange(null);
                  }}
                >
                  <Check size={16} className="mr-2" />
                  Save Role
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
'''

content = content.replace('{/* MODAL: RESET PASSWORD */}', modal_string + '\n      {/* MODAL: RESET PASSWORD */}')

with open("src/pages/Teachers.tsx", "w") as f:
    f.write(content)
