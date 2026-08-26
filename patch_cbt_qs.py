import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

# Add state
if 'const [cbtQuestionCount' not in content:
    content = content.replace(
        '  const [cbtTerm, setCbtTerm] = useState(TERMS[0]);',
        '  const [cbtTerm, setCbtTerm] = useState(TERMS[0]);\n  const [cbtQuestionCount, setCbtQuestionCount] = useState<number>(50);'
    )

# Update generate handler
old_gen_msg = 'setToastMsg(`CBT questions for ${cbtClass} (${cbtSession} - ${cbtTerm}) generated successfully.`);'
new_gen_msg = 'setToastMsg(`Successfully generated ${cbtQuestionCount} CBT questions for ${cbtClass} (${cbtSession} - ${cbtTerm}).`);'
content = content.replace(old_gen_msg, new_gen_msg)

# Update the card UI
old_card_ui = '''                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Generate Questions</h3>
                    <p className="text-xs text-slate-500 mt-1">Automatically generate randomized CBT questions for candidates.</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50" onClick={handleGenerateCbt}>
                    Generate
                  </Button>'''

new_card_ui = '''                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Generate Questions</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-2">Automatically generate randomized CBT questions.</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-xs whitespace-nowrap text-slate-600">No. of Qs:</Label>
                      <Input 
                        type="number" 
                        min={1} 
                        max={500}
                        value={cbtQuestionCount}
                        onChange={(e) => setCbtQuestionCount(parseInt(e.target.value) || 50)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50" onClick={handleGenerateCbt}>
                    Generate
                  </Button>'''

content = content.replace(old_card_ui, new_card_ui)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
