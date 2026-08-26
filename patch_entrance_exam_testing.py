import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

# Replace the "testing" block
testing_block_old_pattern = r'        \{step === "testing" && \(\n.*?        \{step === "result" && \('

testing_block_new = """        {step === "testing" && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md pb-4 pt-2 border-b border-slate-200 mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">{selectedClass} Entrance Exam</h3>
                <p className="text-sm text-brand-600 font-semibold">{questions.length} Questions</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-lg font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                  {formatTime(timeLeft)}
                </span>
                <Button variant="brand" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmit}>
                  Submit Exam
                </Button>
              </div>
            </div>
            
            {activeQuestions.map((q, qIdx) => (
              <Card key={qIdx} className="border-0 shadow-md">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <p className="text-lg font-medium text-slate-900 leading-relaxed pr-4">
                      {qIdx + 1}. {q.text}
                    </p>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded whitespace-nowrap">
                      {q.subject}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[qIdx] === opt;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(qIdx, opt)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected 
                              ? 'border-brand-500 bg-brand-50 text-brand-900 font-medium shadow-sm' 
                              : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className={`inline-block w-6 h-6 rounded-full text-center text-sm font-bold mr-3 ${
                            isSelected ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {step === "result" && ("""

content = re.sub(testing_block_old_pattern, testing_block_new, content, flags=re.DOTALL)

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
