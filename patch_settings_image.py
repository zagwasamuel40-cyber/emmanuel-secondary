import re

with open("src/pages/Settings.tsx", "r") as f:
    content = f.read()

old_upload = """                  <div className="space-y-2 sm:col-span-2">
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

new_upload = """                  <div className="space-y-2 sm:col-span-2">
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
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="aboutUsImageFile">About Us Page Image (Upload Image)</Label>
                    <div className="flex items-center gap-4">
                      {portalSettings.aboutUsImageUrl && (
                        <div className="h-12 w-24 bg-slate-50 border border-slate-200 rounded flex items-center justify-center overflow-hidden">
                          <img src={portalSettings.aboutUsImageUrl} alt="About Us" className="h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input 
                          id="aboutUsImageFile" 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPortalSettings({ aboutUsImageUrl: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <p className="text-xs text-slate-500 mt-1">Upload an image for the public About Us page.</p>
                      </div>
                    </div>
                  </div>"""

content = content.replace(old_upload, new_upload)

with open("src/pages/Settings.tsx", "w") as f:
    f.write(content)
