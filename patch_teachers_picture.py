import re

with open("src/pages/Teachers.tsx", "r") as f:
    content = f.read()

# Add passportUrl to Teacher interface
old_interface = """  password: string;
  systemRole?: 'Teacher' | 'Admin' | 'Admission Officer' | 'Portal Admin' | 'Super Admin';
}"""

new_interface = """  password: string;
  systemRole?: 'Teacher' | 'Admin' | 'Admission Officer' | 'Portal Admin' | 'Super Admin';
  passportUrl?: string;
}"""
content = content.replace(old_interface, new_interface)

# Add passportUrl to createStaffForm
old_create_state = """    assignedClasses: [],
    password: "",
    systemRole: "Teacher"
  });"""
new_create_state = """    assignedClasses: [],
    password: "",
    systemRole: "Teacher",
    passportUrl: ""
  });"""
content = content.replace(old_create_state, new_create_state)

old_new_staff_member = """      password: createStaffForm.password || "teacher123",
      systemRole: createStaffForm.systemRole as any
    };"""

new_new_staff_member = """      password: createStaffForm.password || "teacher123",
      systemRole: createStaffForm.systemRole as any,
      passportUrl: createStaffForm.passportUrl
    };"""
content = content.replace(old_new_staff_member, new_new_staff_member)

# In the Create Staff Form, add an image upload button.
old_create_form_grid = """              <form onSubmit={handleCreateStaffSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Full Name</Label>"""
new_create_form_grid = """              <form onSubmit={handleCreateStaffSubmit} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 group">
                    <div className="w-full h-full bg-slate-100 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-400 border-2 border-slate-200">
                      {createStaffForm.passportUrl ? (
                        <img src={createStaffForm.passportUrl} alt="Staff" className="w-full h-full object-cover" />
                      ) : (
                        createStaffForm.name.charAt(0) || <User size={40} />
                      )}
                    </div>
                    <label htmlFor="createStaffPassport" className="absolute bottom-0 right-0 w-8 h-8 bg-white text-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow border border-slate-200 hover:bg-slate-50 transition-colors">
                      <Upload size={14} />
                      <input 
                        id="createStaffPassport" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCreateStaffForm({...createStaffForm, passportUrl: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Full Name</Label>"""
content = content.replace(old_create_form_grid, new_create_form_grid)


# Add passportUrl to Edit Staff form
old_edit_form_grid = """              <form onSubmit={handleUpdateStaffSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Full Name</Label>"""

new_edit_form_grid = """              <form onSubmit={handleUpdateStaffSubmit} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 group">
                    <div className="w-full h-full bg-slate-100 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-400 border-2 border-slate-200">
                      {editingTeacher?.passportUrl ? (
                        <img src={editingTeacher.passportUrl} alt="Staff" className="w-full h-full object-cover" />
                      ) : (
                        editingTeacher?.name?.charAt(0) || <User size={40} />
                      )}
                    </div>
                    <label htmlFor="editStaffPassport" className="absolute bottom-0 right-0 w-8 h-8 bg-white text-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow border border-slate-200 hover:bg-slate-50 transition-colors">
                      <Upload size={14} />
                      <input 
                        id="editStaffPassport" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingTeacher({...editingTeacher!, passportUrl: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Full Name</Label>"""
content = content.replace(old_edit_form_grid, new_edit_form_grid)

old_table_staff_col = """                        <td className="p-3 font-semibold text-slate-900">{t.name}</td>"""

new_table_staff_col = """                        <td className="p-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden shrink-0">
                              {t.passportUrl ? (
                                <img src={t.passportUrl} alt={t.name} className="w-full h-full object-cover" />
                              ) : (
                                t.name.charAt(0)
                              )}
                            </div>
                            {t.name}
                          </div>
                        </td>"""
content = content.replace(old_table_staff_col, new_table_staff_col)

with open("src/pages/Teachers.tsx", "w") as f:
    f.write(content)
