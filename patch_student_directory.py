import re

with open("src/pages/students/StudentDirectory.tsx", "r") as f:
    content = f.read()

if 'Camera' not in content:
    content = content.replace('X, CheckCircle }', 'X, CheckCircle, Camera }')

old_table_name = """                  <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>"""

new_table_name = """                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold overflow-hidden shrink-0">
                        {student.passportUrl ? (
                          <img src={student.passportUrl} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          student.name.charAt(0)
                        )}
                      </div>
                      {student.name}
                    </div>
                  </td>"""

content = content.replace(old_table_name, new_table_name)

old_edit_form = """              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div className="space-y-2">
                  <Label>Student Full Name</Label>"""

new_edit_form = """              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 group">
                    <div className="w-full h-full bg-slate-100 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-400 border-2 border-slate-200">
                      {editingStudent.passportUrl ? (
                        <img src={editingStudent.passportUrl} alt={editingStudent.name} className="w-full h-full object-cover" />
                      ) : (
                        editingStudent.name?.charAt(0) || '?'
                      )}
                    </div>
                    <label htmlFor="adminPassportUpload" className="absolute bottom-0 right-0 w-8 h-8 bg-white text-slate-700 rounded-full flex items-center justify-center cursor-pointer shadow border border-slate-200 hover:bg-slate-50 transition-colors">
                      <Camera size={14} />
                      <input 
                        id="adminPassportUpload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingStudent({...editingStudent, passportUrl: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Student Full Name</Label>"""

content = content.replace(old_edit_form, new_edit_form)


old_update_logic = """    setStudents(students.map((s: any) => s.id === editingStudent.originalId ? {
      ...s,
      name: editingStudent.name,
      id: editingStudent.id,
      class: editingStudent.class,
      status: editingStudent.status
    } : s));"""

new_update_logic = """    setStudents(students.map((s: any) => s.id === editingStudent.originalId ? {
      ...s,
      name: editingStudent.name,
      id: editingStudent.id,
      class: editingStudent.class,
      status: editingStudent.status,
      passportUrl: editingStudent.passportUrl
    } : s));"""

content = content.replace(old_update_logic, new_update_logic)

with open("src/pages/students/StudentDirectory.tsx", "w") as f:
    f.write(content)
