import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

old_settings_tab = """              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Application Fee (₦)</Label>
                  <Input 
                    type="number"
                    value={admissionSettings.appFee}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, appFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Acceptance Fee (₦)</Label>
                  <Input 
                    type="number"
                    value={admissionSettings.acceptanceFee}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, acceptanceFee: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">"""

new_settings_tab = """              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Application Fee (₦)</Label>
                  <Input 
                    type="number"
                    value={admissionSettings.appFee}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, appFee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Acceptance Fee (₦)</Label>
                  <Input 
                    type="number"
                    value={admissionSettings.acceptanceFee}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, acceptanceFee: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="col-span-3">
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Online Payment Account Details</h4>
                  <p className="text-xs text-slate-500 mb-2">Applicants will see these details for offline bank transfers when applying for admission.</p>
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input 
                    type="text"
                    value={admissionSettings.bankName || ""}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, bankName: e.target.value })}
                    placeholder="e.g. GTB"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input 
                    type="text"
                    value={admissionSettings.accountName || ""}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, accountName: e.target.value })}
                    placeholder="School Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input 
                    type="text"
                    value={admissionSettings.accountNumber || ""}
                    onChange={(e) => setAdmissionSettings({ ...admissionSettings, accountNumber: e.target.value })}
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">"""
content = content.replace(old_settings_tab, new_settings_tab)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
