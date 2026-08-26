import re

with open("src/pages/student/StudentSubjects.tsx", "r") as f:
    content = f.read()

# 1. Add cbtQIndex state
if "const [cbtQIndex, setCbtQIndex]" not in content:
    content = content.replace(
        '  const [cbtAnswers, setCbtAnswers] = useState<Record<number, string>>({});',
        '  const [cbtQIndex, setCbtQIndex] = useState(0);\n  const [cbtAnswers, setCbtAnswers] = useState<Record<number, string>>({});'
    )

# 2. Add handleNext/Prev
if "const handleCbtNext =" not in content:
    handlers = """
  const handleCbtNext = () => {
    if (cbtQIndex < activeQuestions.length - 1) {
      setCbtQIndex(prev => prev + 1);
    }
  };

  const handleCbtPrev = () => {
    if (cbtQIndex > 0) {
      setCbtQIndex(prev => prev - 1);
    }
  };
"""
    content = content.replace('  const handleViewResult = () => {', handlers + '\n  const handleViewResult = () => {')

# 3. Replace the examActive block
old_exam_block = r'  if \(examActive\) \{.*?    \);\n  \}'

new_exam_block = """  if (examActive && activeQuestions.length > 0) {
    const q = activeQuestions[cbtQIndex];
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 shadow-sm flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-lg text-slate-900">First Term Examinations</h2>
            <p className="text-sm font-semibold text-brand-600">{q.subject}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-lg font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
              89:59
            </span>
            <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-bold text-slate-700 hidden sm:block">
              Question {cbtQIndex + 1} of {activeQuestions.length}
            </div>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto p-6 space-y-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <p className="font-medium text-slate-900 mb-4 text-lg">
                {cbtQIndex + 1}. {q.text}
              </p>
              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  const isSelected = cbtAnswers[q.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => setCbtAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'border-brand-500 bg-brand-50 text-brand-900 font-medium shadow-sm' 
                          : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`inline-block w-6 h-6 rounded-full text-center text-sm font-bold mr-3 ${
                        isSelected ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + i)}
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
                onClick={handleCbtPrev}
                disabled={cbtQIndex === 0}
                className="flex-1 sm:flex-none"
              >
                Previous
              </Button>
              {cbtQIndex < activeQuestions.length - 1 ? (
                <Button variant="brand" onClick={handleCbtNext} className="flex-1 sm:flex-none">
                  Next Question
                </Button>
              ) : (
                <Button variant="brand" className="bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-none" onClick={() => { setExamActive(false); setExamSubmitted(true); setCbtQIndex(0); }}>
                  Submit Exam
                </Button>
              )}
            </div>
            
            <div className="flex gap-1 overflow-x-auto px-1 hide-scrollbar max-w-full sm:max-w-[40%] order-1 sm:order-2">
              {activeQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCbtQIndex(idx)}
                  className={`w-8 h-8 shrink-0 rounded-full text-xs font-bold transition-colors ${
                    cbtQIndex === idx 
                      ? 'bg-brand-600 text-white ring-4 ring-brand-200 ring-offset-1 scale-110'
                      : cbtAnswers[activeQuestions[idx].id] 
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
      </div>
    );
  }"""

content = re.sub(old_exam_block, new_exam_block, content, flags=re.DOTALL)

with open("src/pages/student/StudentSubjects.tsx", "w") as f:
    f.write(content)
