import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

# Birth Certificate
old_birth = """                        <div className="font-semibold text-slate-700 flex items-center justify-between">
                          <span>Birth Certificate</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            app.documents?.birthCertificate === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.documents?.birthCertificate || 'Pending'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleUpdateDocument(app.id, 'birthCertificate', app.documents?.birthCertificate === 'Verified' ? 'Pending' : 'Verified')}
                          className="w-full text-left text-[11px] font-semibold text-brand-600 hover:underline pt-1"
                        >
                          Toggle Verification
                        </button>"""

new_birth = """                        <div className="font-semibold text-slate-700 flex items-center justify-between">
                          <span>Birth Certificate</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            app.documents?.birthCertificate === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.documents?.birthCertificate || 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <button 
                            onClick={() => handleUpdateDocument(app.id, 'birthCertificate', app.documents?.birthCertificate === 'Verified' ? 'Pending' : 'Verified')}
                            className="text-[11px] font-semibold text-brand-600 hover:underline"
                          >
                            Toggle Verification
                          </button>
                          {app.documentsUrls?.birthCert && (
                            <a href={app.documentsUrls.birthCert} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </a>
                          )}
                        </div>"""
content = content.replace(old_birth, new_birth)


old_academic = """                        <div className="font-semibold text-slate-700 flex items-center justify-between">
                          <span>Academic Record</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            app.documents?.academicResult === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.documents?.academicResult || 'Pending'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleUpdateDocument(app.id, 'academicResult', app.documents?.academicResult === 'Verified' ? 'Pending' : 'Verified')}
                          className="w-full text-left text-[11px] font-semibold text-brand-600 hover:underline pt-1"
                        >
                          Toggle Verification
                        </button>"""

new_academic = """                        <div className="font-semibold text-slate-700 flex items-center justify-between">
                          <span>Academic Record</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            app.documents?.academicResult === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.documents?.academicResult || 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <button 
                            onClick={() => handleUpdateDocument(app.id, 'academicResult', app.documents?.academicResult === 'Verified' ? 'Pending' : 'Verified')}
                            className="text-[11px] font-semibold text-brand-600 hover:underline"
                          >
                            Toggle Verification
                          </button>
                          {app.documentsUrls?.previousResult && (
                            <a href={app.documentsUrls.previousResult} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </a>
                          )}
                        </div>"""
content = content.replace(old_academic, new_academic)


old_passport = """                        <div className="font-semibold text-slate-700 flex items-center justify-between">
                          <span>Passport Photo</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            app.documents?.passportPhoto === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.documents?.passportPhoto || 'Pending'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleUpdateDocument(app.id, 'passportPhoto', app.documents?.passportPhoto === 'Verified' ? 'Pending' : 'Verified')}
                          className="w-full text-left text-[11px] font-semibold text-brand-600 hover:underline pt-1"
                        >
                          Toggle Verification
                        </button>"""

new_passport = """                        <div className="font-semibold text-slate-700 flex items-center justify-between">
                          <span>Passport Photo</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            app.documents?.passportPhoto === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.documents?.passportPhoto || 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <button 
                            onClick={() => handleUpdateDocument(app.id, 'passportPhoto', app.documents?.passportPhoto === 'Verified' ? 'Pending' : 'Verified')}
                            className="text-[11px] font-semibold text-brand-600 hover:underline"
                          >
                            Toggle Verification
                          </button>
                          {app.documentsUrls?.passportPhoto && (
                            <a href={app.documentsUrls.passportPhoto} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </a>
                          )}
                        </div>"""
content = content.replace(old_passport, new_passport)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
