const fs = require('fs');

let file = fs.readFileSync('src/pages/public/Admissions.tsx', 'utf8');

// 1. Add new icons to import
file = file.replace(
  'import { UploadCloud, CheckCircle2, Trash2, ShieldAlert, FileText } from "lucide-react";',
  'import { UploadCloud, CheckCircle2, Trash2, ShieldAlert, FileText, HelpCircle, Play, XCircle, ArrowRight, Loader2 } from "lucide-react";'
);

// 2. Add new states inside the component
file = file.replace(
  'const [submitted, setSubmitted] = useState(false);',
  `const [submitted, setSubmitted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "paid">("pending");
  const [examStep, setExamStep] = useState<"not_started" | "intro" | "testing" | "result">("not_started");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);

  const questions = [
    { "id": 1, "text": "What is 25 + 47?", "options": ["62", "72", "82", "92"], "answer": "72", "subject": "Mathematics" },
    { "id": 2, "text": "If x = 5, what is 2x + 10?", "options": ["15", "20", "25", "30"], "answer": "20", "subject": "Mathematics" },
    { "id": 3, "text": "What is the square root of 144?", "options": ["10", "12", "14", "16"], "answer": "12", "subject": "Mathematics" },
    { "id": 4, "text": "Solve for y: 3y - 9 = 12", "options": ["5", "6", "7", "8"], "answer": "7", "subject": "Mathematics" },
    { "id": 5, "text": "What is 15% of 200?", "options": ["20", "25", "30", "35"], "answer": "30", "subject": "Mathematics" }
  ];

  const handlePayNow = () => {
    if (!birthCertFile || !previousResultFile || !passportPhotoFile || !firstName || !lastName || !classApplying || !parentPhone) {
      alert("Please fill all required fields and upload all documents before payment.");
      return;
    }
    setPaymentStatus("processing");
    setTimeout(() => {
      setPaymentStatus("paid");
      setExamStep("intro");
    }, 1500);
  };

  const handleStartExam = () => setExamStep("testing");
  const handleSelectOption = (idx: number, opt: string) => setSelectedAnswers({ ...selectedAnswers, [idx]: opt });
  const handleNext = () => setCurrentQIndex(i => Math.min(i + 1, questions.length - 1));
  const handlePrev = () => setCurrentQIndex(i => Math.max(i - 1, 0));
  const handleSubmitExam = () => {
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) calculatedScore += 20;
    });
    setScore(calculatedScore);
    setExamStep("result");
  };
`
);

// 3. Update section 3 and the submit button
const submitSection = `          {/* Section 3: Online Payment */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
                3. Admission Form Payment
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                A non-refundable application fee of ₦5,000 is required to process your admission.
              </p>
            </div>
            
            {paymentStatus === "pending" && (
              <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-brand-900">Application Fee</p>
                  <p className="text-2xl font-black text-brand-700">₦5,000.00</p>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <Button type="button" variant="outline" className="w-full sm:w-auto border-brand-600 text-brand-700 hover:bg-brand-100 font-bold" onClick={handlePayNow}>
                    Pay Now Online
                  </Button>
                </div>
              </div>
            )}
            {paymentStatus === "processing" && (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-brand-600" size={32} />
                <p className="text-sm font-bold text-slate-700">Processing Payment...</p>
              </div>
            )}
            {paymentStatus === "paid" && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Payment Successful</p>
                    <p className="text-xs text-emerald-700 font-medium">Fee: ₦5,000.00 Paid</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Entrance Exam (Appears after payment) */}
          {paymentStatus === "paid" && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
                  4. Entrance Examination
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  You must complete the mandatory entrance exam before you can submit your application.
                </p>
              </div>

              {examStep === "intro" && (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-brand-100 text-brand-600 rounded-full flex items-center justify-center">
                    <HelpCircle size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Start Your Entrance Exam</h4>
                    <p className="text-sm text-slate-600">5 Questions &middot; 100 Marks &middot; Pass Mark: 50%</p>
                  </div>
                  <Button type="button" variant="brand" onClick={handleStartExam} className="gap-2">
                    <Play size={18} /> Start Examination Now
                  </Button>
                </div>
              )}

              {examStep === "testing" && (
                <div className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <p className="text-sm font-bold text-slate-700">Question {currentQIndex + 1} of {questions.length}</p>
                    <p className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                      {questions[currentQIndex].subject}
                    </p>
                  </div>
                  <p className="text-base font-medium text-slate-900">
                    {currentQIndex + 1}. {questions[currentQIndex].text}
                  </p>
                  <div className="space-y-2">
                    {questions[currentQIndex].options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[currentQIndex] === opt;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQIndex, opt)}
                          className={\`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 \${
                            isSelected 
                              ? 'border-brand-500 bg-brand-50 text-brand-900 font-medium' 
                              : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 text-slate-700'
                          }\`}
                        >
                          <span className={\`inline-block w-6 h-6 rounded-full text-center text-sm font-bold mr-3 \${
                            isSelected ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-600'
                          }\`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrev} disabled={currentQIndex === 0}>
                      Previous
                    </Button>
                    {currentQIndex < questions.length - 1 ? (
                      <Button type="button" variant="brand" onClick={handleNext}>
                        Next Question
                      </Button>
                    ) : (
                      <Button type="button" variant="brand" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmitExam}>
                        Finish Exam
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {examStep === "result" && (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4">
                  <div className={\`w-16 h-16 mx-auto rounded-full flex items-center justify-center \${
                    score >= 50 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }\`}>
                    {score >= 50 ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {score >= 50 ? "Exam Passed!" : "Exam Failed"}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">Your Score: <span className="font-bold text-slate-900">{score}/100</span></p>
                    <p className="text-xs text-slate-500 mt-2">
                      {score >= 50 ? "You have met the minimum standard to apply." : "Unfortunately, you did not meet the standard to apply."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <Button 
              type="submit" 
              variant="brand" 
              className="w-full text-base h-12"
              disabled={examStep !== "result" || score < 50}
            >
              Submit Admission Application & Documents
            </Button>
            {examStep !== "result" && paymentStatus === "paid" && (
              <p className="text-xs text-center text-slate-500 mt-2">You must pass the Entrance Exam before submitting.</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}`;

const oldSubmitSection = `          {/* Section 3: Online Payment */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900 border-b border-slate-100 pb-2">
                3. Admission Form Payment
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                A non-refundable application fee of ₦5,000 is required to process your admission.
              </p>
            </div>
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-brand-900">Application Fee</p>
                <p className="text-2xl font-black text-brand-700">₦5,000.00</p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full sm:w-auto border-brand-600 text-brand-700 hover:bg-brand-100 font-bold" onClick={() => alert("Redirecting to secure payment gateway...")}>
                  Pay Now Online
                </Button>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <Button type="submit" variant="brand" className="w-full text-base h-12">
              Submit Admission Application & Documents
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}`;

file = file.replace(oldSubmitSection, submitSection);

fs.writeFileSync('src/pages/public/Admissions.tsx', file);
