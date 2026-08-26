import re

with open("src/pages/public/AdmissionStatus.tsx", "r") as f:
    content = f.read()

# Remove old buttons
old_buttons = """                <div className="print:hidden mb-6 flex justify-end gap-3 pb-4 border-b border-slate-100">
                  <Button variant="outline" onClick={() => window.print()} className="gap-2">
                    <Printer size={16} /> Print Admission Letter
                  </Button>
                  <Button 
                    variant="brand" 
                    onClick={() => {
                      const element = document.getElementById('print-area');
                      if (element) {
                        const opt = {
                          margin:       0.5,
                          filename:     `${searchedApp?.name?.replace(/\\s+/g, '_')}_Admission_Letter.pdf`,
                          image:        { type: 'jpeg' as const, quality: 0.98 },
                          html2canvas:  { scale: 2, useCORS: true },
                          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
                        };
                        import('html2pdf.js').then((html2pdf) => {
                          html2pdf.default().set(opt).from(element).save();
                        });
                      }
                    }} 
                    className="gap-2"
                  >
                    <Download size={16} /> Download PDF
                  </Button>
                </div>"""
content = content.replace(old_buttons, "")

# Add buttons at the bottom inside the white box, matching admin styles
old_bottom = """                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md text-xs border border-emerald-300">
                          OFFICIALLY SEALED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>"""

new_bottom = """                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[11px]">
                          OFFICIALLY SEALED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="print:hidden flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => window.print()} className="gap-1.5 text-xs">
                    <Printer size={15} /> Print Offer Letter
                  </Button>
                  <Button 
                    variant="brand" 
                    onClick={() => {
                      const element = document.getElementById('print-area');
                      if (element) {
                        const opt = {
                          margin:       0.5,
                          filename:     `${searchedApp?.name?.replace(/\\s+/g, '_')}_Admission_Letter.pdf`,
                          image:        { type: 'jpeg' as const, quality: 0.98 },
                          html2canvas:  { scale: 2, useCORS: true },
                          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
                        };
                        import('html2pdf.js').then((html2pdf) => {
                          html2pdf.default().set(opt).from(element).save();
                        });
                      }
                    }} 
                    className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                  >
                    <Download size={15} /> Download PDF
                  </Button>
                </div>
              </div>"""
content = content.replace(old_bottom, new_bottom)

with open("src/pages/public/AdmissionStatus.tsx", "w") as f:
    f.write(content)
