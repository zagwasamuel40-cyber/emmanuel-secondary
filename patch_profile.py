import re

with open("src/pages/Profile.tsx", "r") as f:
    content = f.read()

# Add states for password change and picture
old_states = """  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [profile, setProfile] = useState({"""

new_states = """  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [profile, setProfile] = useState({"""

content = content.replace(old_states, new_states)

old_profile_state = """    role: isPortalAdmin ? "Portal Administrator (Branding, News & Settings)" : isSuperAdmin ? "Admission Officer (Admissions & Enrollment)" : isStaff ? "Senior Teacher" : "System Administrator",
    bio: isPortalAdmin ? "Official Portal Administrator account responsible for news publishing, motto customization, portal theme colors, and student portal settings." : isSuperAdmin ? "Official Admission Officer account responsible for admissions, document verification, and student enrollment." : "Dedicated staff member."
  });"""

new_profile_state = """    role: isPortalAdmin ? "Portal Administrator (Branding, News & Settings)" : isSuperAdmin ? "Admission Officer (Admissions & Enrollment)" : isStaff ? "Senior Teacher" : "System Administrator",
    bio: isPortalAdmin ? "Official Portal Administrator account responsible for news publishing, motto customization, portal theme colors, and student portal settings." : isSuperAdmin ? "Official Admission Officer account responsible for admissions, document verification, and student enrollment." : "Dedicated staff member.",
    passportUrl: ""
  });"""

content = content.replace(old_profile_state, new_profile_state)

old_handle_save = """  const handleSave = () => {
    setSuccessMsg("Profile updated successfully!");
    setIsEditing(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };"""

new_handle_save = """  const handleSave = () => {
    setSuccessMsg("Profile updated successfully!");
    setIsEditing(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      alert("New passwords do not match!");
      return;
    }
    setSuccessMsg("Password updated successfully!");
    setPasswordForm({ current: "", new: "", confirm: "" });
    setTimeout(() => setSuccessMsg(""), 3000);
  };"""

content = content.replace(old_handle_save, new_handle_save)

old_picture = """            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>"""

new_picture = """            <CardContent className="p-6 text-center">
              <div className="relative w-32 h-32 mx-auto group mb-4">
                <div className="w-full h-full bg-brand-100 rounded-full overflow-hidden flex items-center justify-center text-4xl font-bold text-brand-700 border-4 border-brand-200">
                  {profile.passportUrl ? (
                    <img src={profile.passportUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profile.firstName[0] + profile.lastName[0]
                  )}
                </div>
                <label htmlFor="profilePassportUpload" className="absolute bottom-0 right-0 w-10 h-10 bg-white text-brand-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-slate-100 transition-colors border border-slate-200">
                  <User size={18} />
                  <input 
                    id="profilePassportUpload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfile({...profile, passportUrl: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>"""

content = content.replace(old_picture, new_picture)

old_closing = """              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}"""

new_closing = """              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key size={18} /> Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input 
                    type="password" 
                    required 
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input 
                    type="password" 
                    required 
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input 
                    type="password" 
                    required 
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  />
                </div>
                <Button type="submit" variant="brand">Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}"""

content = content.replace(old_closing, new_closing)


with open("src/pages/Profile.tsx", "w") as f:
    f.write(content)
