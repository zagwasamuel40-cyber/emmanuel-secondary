import re

with open("src/pages/student/StudentProfile.tsx", "r") as f:
    content = f.read()

if 'Upload, Camera' not in content:
    content = content.replace('User, Mail, Phone, MapPin, Save, CheckCircle2 }', 'User, Mail, Phone, MapPin, Save, CheckCircle2, Upload, Camera }')

old_pic = """            <div className="w-24 h-24 bg-brand-800 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-brand-100 border-4 border-brand-700">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg">{student.name}</h3>"""

new_pic = """            <div className="relative w-32 h-32 mx-auto group">
              <div className="w-full h-full bg-brand-800 rounded-full overflow-hidden flex items-center justify-center text-4xl font-bold text-brand-100 border-4 border-brand-700">
                {student.passportUrl ? (
                  <img src={student.passportUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  student.name.charAt(0)
                )}
              </div>
              <label htmlFor="passportUpload" className="absolute bottom-0 right-0 w-10 h-10 bg-white text-brand-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-slate-100 transition-colors border border-slate-200">
                <Camera size={18} />
                <input 
                  id="passportUpload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setStudent({...student, passportUrl: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <h3 className="font-bold text-lg">{student.name}</h3>"""

content = content.replace(old_pic, new_pic)

with open("src/pages/student/StudentProfile.tsx", "w") as f:
    f.write(content)
