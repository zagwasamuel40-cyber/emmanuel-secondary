import re

with open("src/pages/public/Admissions.tsx", "r") as f:
    content = f.read()

old_payment = """            <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-brand-900">Application Fee</p>
                <p className="text-2xl font-black text-brand-700">₦{parseInt(admissionSettings.appFee || "5000").toLocaleString()}.00</p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full sm:w-auto border-brand-600 text-brand-700 hover:bg-brand-100 font-bold" onClick={() => alert("Redirecting to secure payment gateway...")}>
                  Pay Now Online
                </Button>
              </div>
            </div>"""

new_payment = """            <div className="p-5 bg-brand-50 border border-brand-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-sm font-bold text-brand-900">Application Fee</p>
                <p className="text-3xl font-black text-brand-700">₦{parseInt(admissionSettings.appFee || "5000").toLocaleString()}.00</p>
              </div>
              
              <div className="flex-1 w-full sm:w-auto bg-white p-4 rounded-lg border border-brand-100 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Direct Bank Transfer Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-600">Bank Name:</span>
                  <span className="font-bold text-slate-900">{admissionSettings.bankName || "Guaranty Trust Bank (GTB)"}</span>
                  
                  <span className="text-slate-600">Account Name:</span>
                  <span className="font-bold text-slate-900">{admissionSettings.accountName || "Emmanuel Secondary School"}</span>
                  
                  <span className="text-slate-600">Account No:</span>
                  <span className="font-bold text-slate-900 font-mono tracking-wider">{admissionSettings.accountNumber || "0123456789"}</span>
                </div>
              </div>
              
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full sm:w-auto border-brand-600 text-brand-700 hover:bg-brand-100 font-bold" onClick={() => alert("Redirecting to secure payment gateway...")}>
                  Pay Now Online
                </Button>
              </div>
            </div>"""
content = content.replace(old_payment, new_payment)

with open("src/pages/public/Admissions.tsx", "w") as f:
    f.write(content)
