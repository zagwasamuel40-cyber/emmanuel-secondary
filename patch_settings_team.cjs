const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

const teamBlock = `
          {activeTab === "team" && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle>Dedicated Team Management</CardTitle>
                <Button variant="brand" size="sm" onClick={() => {
                  setPortalSettings({
                    dedicatedTeam: [...(portalSettings.dedicatedTeam || []), { id: Date.now().toString(), name: "", role: "", photoUrl: "", bio: "" }]
                  });
                }} className="gap-2">
                  <Plus size={16} /> Add Member
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {(!portalSettings.dedicatedTeam || portalSettings.dedicatedTeam.length === 0) && (
                    <p className="text-slate-500 text-center py-4">No team members added yet.</p>
                  )}
                  {(portalSettings.dedicatedTeam || []).map((member, index) => (
                    <div key={member.id} className="p-4 border border-slate-200 rounded-xl relative bg-slate-50">
                      <button 
                        onClick={() => {
                          const newTeam = [...portalSettings.dedicatedTeam];
                          newTeam.splice(index, 1);
                          setPortalSettings({ dedicatedTeam: newTeam });
                        }}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mr-8">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input value={member.name} onChange={(e) => {
                            const newTeam = [...portalSettings.dedicatedTeam];
                            newTeam[index].name = e.target.value;
                            setPortalSettings({ dedicatedTeam: newTeam });
                          }} placeholder="e.g. Dr. John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label>Role/Title</Label>
                          <Input value={member.role} onChange={(e) => {
                            const newTeam = [...portalSettings.dedicatedTeam];
                            newTeam[index].role = e.target.value;
                            setPortalSettings({ dedicatedTeam: newTeam });
                          }} placeholder="e.g. Principal" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Photo (Upload or URL)</Label>
                          <div className="flex gap-4 items-center">
                            {member.photoUrl && (
                              <img src={member.photoUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-slate-300" />
                            )}
                            <div className="flex-1 flex gap-2">
                              <Input value={member.photoUrl} onChange={(e) => {
                                const newTeam = [...portalSettings.dedicatedTeam];
                                newTeam[index].photoUrl = e.target.value;
                                setPortalSettings({ dedicatedTeam: newTeam });
                              }} placeholder="https://..." />
                              <div className="relative overflow-hidden w-24">
                                <Button type="button" variant="outline" className="w-full">Upload</Button>
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const newTeam = [...portalSettings.dedicatedTeam];
                                      newTeam[index].photoUrl = reader.result;
                                      setPortalSettings({ dedicatedTeam: newTeam });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Bio/Description (Optional)</Label>
                          <Textarea value={member.bio || ""} onChange={(e) => {
                            const newTeam = [...portalSettings.dedicatedTeam];
                            newTeam[index].bio = e.target.value;
                            setPortalSettings({ dedicatedTeam: newTeam });
                          }} placeholder="Brief description..." rows={2} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}`;

code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/, `${teamBlock}\n        </div>\n      </div>\n    </div>\n  );\n}`);

fs.writeFileSync('src/pages/Settings.tsx', code);
