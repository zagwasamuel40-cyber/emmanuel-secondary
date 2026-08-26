import re

with open("src/pages/Settings.tsx", "r") as f:
    content = f.read()

old_signature_input = """                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="principalSignatureUrl">Principal Signature URL</Label>
                    <Input id="principalSignatureUrl" value={portalSettings.principalSignatureUrl} onChange={(e) => setPortalSettings({principalSignatureUrl: e.target.value})} placeholder="https://..." />
                  </div>"""

new_signature_input = """                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="principalSignatureUrl">Principal Signature (Upload Image)</Label>
                    <div className="flex items-center gap-4">
                      {portalSettings.principalSignatureUrl && (
                        <div className="h-12 w-24 bg-slate-50 border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                          <img src={portalSettings.principalSignatureUrl} alt="Signature" className="h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input 
                          id="principalSignatureFile" 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPortalSettings({ principalSignatureUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <p className="text-xs text-slate-500 mt-1">Upload a clear image of the principal's signature with a transparent or white background.</p>
                      </div>
                    </div>
                  </div>"""

content = content.replace(old_signature_input, new_signature_input)

with open("src/pages/Settings.tsx", "w") as f:
    f.write(content)
