import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

old_state = """  const [admissionSettings, setAdmissionSettings] = useState({
    status: "Open",
    activeSession: currentSession,
    applicationFee: "5000",
    acceptanceFee: "25000",
    entranceExamDate: "2026-08-20",
    closingDate: "2026-08-15"
  });"""

new_state = """  const [admissionSettings, setAdmissionSettings] = useState({
    status: "Open",
    activeSession: currentSession,
    applicationFee: "5000",
    acceptanceFee: "25000",
    entranceExamDate: "2026-08-20",
    closingDate: "2026-08-15"
  });
  const [previewDocument, setPreviewDocument] = useState<{ url: string; title: string } | null>(null);"""

content = content.replace(old_state, new_state)

# Replace the 'a href' tags with buttons that open the modal
old_birth_view = """                          {app.documentsUrls?.birthCert && (
                            <a href={app.documentsUrls.birthCert} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </a>
                          )}"""
new_birth_view = """                          {app.documentsUrls?.birthCert && (
                            <button onClick={() => setPreviewDocument({ url: app.documentsUrls.birthCert, title: `${app.name} - Birth Certificate` })} className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </button>
                          )}"""
content = content.replace(old_birth_view, new_birth_view)

old_academic_view = """                          {app.documentsUrls?.previousResult && (
                            <a href={app.documentsUrls.previousResult} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </a>
                          )}"""
new_academic_view = """                          {app.documentsUrls?.previousResult && (
                            <button onClick={() => setPreviewDocument({ url: app.documentsUrls.previousResult, title: `${app.name} - Academic Record` })} className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </button>
                          )}"""
content = content.replace(old_academic_view, new_academic_view)


old_passport_view = """                          {app.documentsUrls?.passportPhoto && (
                            <a href={app.documentsUrls.passportPhoto} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </a>
                          )}"""
new_passport_view = """                          {app.documentsUrls?.passportPhoto && (
                            <button onClick={() => setPreviewDocument({ url: app.documentsUrls.passportPhoto, title: `${app.name} - Passport Photo` })} className="text-[11px] font-semibold text-blue-600 hover:underline">
                              View Doc
                            </button>
                          )}"""
content = content.replace(old_passport_view, new_passport_view)


old_closing = """    </div>
  );
}"""

new_closing = """
      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{previewDocument.title}</h3>
              <button onClick={() => setPreviewDocument(null)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50 p-6 flex justify-center">
              {previewDocument.url.startsWith('data:image') ? (
                <img src={previewDocument.url} alt={previewDocument.title} className="max-w-full h-auto object-contain shadow-sm border border-slate-200" />
              ) : previewDocument.url.startsWith('data:application/pdf') ? (
                <iframe src={previewDocument.url} title={previewDocument.title} className="w-full h-[70vh] border border-slate-200 rounded shadow-sm" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 py-12">
                  <p>Document preview is not available for this format.</p>
                  <a href={previewDocument.url} download className="mt-4 text-brand-600 font-medium hover:underline">Download File</a>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <Button onClick={() => setPreviewDocument(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}"""

content = content.replace(old_closing, new_closing)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
