import re

with open("src/pages/public/EntranceExam.tsx", "r") as f:
    content = f.read()

# 1. Add currentQIndex state
if "const [currentQIndex, setCurrentQIndex]" not in content:
    content = content.replace(
        '  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});',
        '  const [currentQIndex, setCurrentQIndex] = useState(0);\n  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});'
    )

# 2. Reset on start
content = content.replace(
    '    setSelectedAnswers({});\n    setScore(0);\n  };\n',
    '    setCurrentQIndex(0);\n    setSelectedAnswers({});\n    setScore(0);\n  };\n'
)

# 3. Add handleNext and handlePrev
if "const handleNext =" not in content:
    handlers = """  const handleNext = () => {
    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
    }
  };"""
    content = content.replace('  const handleSubmit = () => {', handlers + '\n\n  const handleSubmit = () => {')

# 4. Fix testing block
testing_block_old = r'        \{step === "testing" && \(.*?        \{step === "result" && \('

testing_block_new = """        {step === "testing" && activeQuestions.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900">{selectedClass} Entrance Exam</h3>
                <p className="text-sm text-brand-600 font-semibold">{activeQuestions[currentQIndex].subject}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-lg font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                  {formatTime(timeLeft)}
                </span>
                <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-bold text-slate-700">
                  Question {currentQIndex + 1} of {questions.length}
                </div>
              </div>
            </div>
            
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <p className="text-lg font-medium text-slate-900 leading-relaxed">
                  {currentQIndex + 1}. {activeQuestions[currentQIndex].text}
                </p>
                <div className="space-y-3">
                  {activeQuestions[currentQIndex].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQIndex] === opt;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(currentQIndex, opt)}
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

            <div className="mt-6 flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex gap-4 w-full sm:w-auto order-2 sm:order-1">
                <Button 
                  variant="outline" 
                  onClick={handlePrev}
                  disabled={currentQIndex === 0}
                  className="flex-1 sm:flex-none"
                >
                  Previous
                </Button>
                {currentQIndex < activeQuestions.length - 1 ? (
                  <Button variant="brand" onClick={handleNext} className="flex-1 sm:flex-none">
                    Next Question
                  </Button>
                ) : (
                  <Button variant="brand" className="bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-none" onClick={handleSubmit}>
                    Submit Exam
                  </Button>
                )}
              </div>
              
              <div className="flex gap-1 overflow-x-auto px-1 hide-scrollbar max-w-full sm:max-w-[40%] order-1 sm:order-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-8 h-8 shrink-0 rounded-full text-xs font-bold transition-colors ${
                      currentQIndex === idx 
                        ? 'bg-brand-600 text-white ring-4 ring-brand-200 ring-offset-1 scale-110'
                        : selectedAnswers[idx] 
                          ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                          : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === "result" && ("""

content = re.sub(testing_block_old, testing_block_new, content, flags=re.DOTALL)

with open("src/pages/public/EntranceExam.tsx", "w") as f:
    f.write(content)
