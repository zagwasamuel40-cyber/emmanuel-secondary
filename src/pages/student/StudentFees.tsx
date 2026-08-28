import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/src/components/ui";
import { CreditCard, Download, ShieldCheck, CheckCircle2, FileText } from "lucide-react";
import { useStudents } from "../../data/studentsData";

export default function StudentFees() {
  const [isPaid, setIsPaid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [feeBreakdowns, setFeeBreakdowns] = useState<any[]>([]);
  
  const [students] = useStudents();
  const loggedInId = localStorage.getItem('loggedInStudentId');
  const currentStudent = students.find(s => s.id === loggedInId || s.name.toLowerCase().includes((loggedInId || '').toLowerCase()));
  const studentClass = currentStudent?.class || "JSS 1";

  useEffect(() => {
    const stored = localStorage.getItem("ess_fee_breakdowns");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFeeBreakdowns(parsed.filter((f: any) => f.targetClass === studentClass || f.targetClass === "All Classes"));
      } catch (e) {
        console.error("Failed to parse fee breakdowns", e);
      }
    } else {
      const oldStored = localStorage.getItem("ess_fee_breakdown");
      if (oldStored) {
        try {
          setFeeBreakdowns([{ ...JSON.parse(oldStored), id: 'old', targetClass: "All Classes", term: "Current Term", session: "Current Session" }]);
        } catch (e) {}
      }
    }
  }, [studentClass]);

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setIsPaid(true);
      setProcessing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-slate-900">Fees & Payments</h2>
        <p className="text-slate-500 text-sm mt-1">View your fee breakdown and make online payments securely.</p>
      </div>

      {!isPaid ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Current Term Fee Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-4 border-b border-slate-200">Description</th>
                        <th className="p-4 border-b border-slate-200 text-right">Amount (₦)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-4 text-slate-900">Tuition Fee</td>
                        <td className="p-4 text-right font-medium">45,000.00</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900">Development Levy</td>
                        <td className="p-4 text-right font-medium">10,000.00</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900">ICT & Library</td>
                        <td className="p-4 text-right font-medium">5,000.00</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900">Medical Fee</td>
                        <td className="p-4 text-right font-medium">2,500.00</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-900">PTA Levy</td>
                        <td className="p-4 text-right font-medium">3,000.00</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-900">
                        <td className="p-4">TOTAL PAYABLE</td>
                        <td className="p-4 text-right text-brand-700 text-lg">65,500.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {feeBreakdowns.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h4 className="font-bold text-slate-900 text-sm">Official Fee Documents</h4>
                    {feeBreakdowns.map((fb, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Fee Scheme: {fb.term} ({fb.session})</p>
                            <p className="text-xs text-slate-500">{fb.name} &middot; {fb.size}</p>
                          </div>
                        </div>
                        <a 
                          href={fb.url} 
                          download={fb.name}
                          className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-sm font-medium rounded-lg text-brand-600 transition-colors shrink-0 shadow-sm"
                        >
                          <Download size={16} /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm bg-brand-950 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard size={20} /> Pay Online
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-brand-300 text-sm mb-1">Total Outstanding</p>
                <p className="text-3xl font-black">₦65,500.00</p>
              </div>
              <p className="text-xs text-brand-200/70">
                You will be redirected to our secure payment gateway to complete this transaction via Card, Bank Transfer, or USSD.
              </p>
              <Button 
                variant="brand" 
                className="w-full text-base h-12 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? "Processing..." : "Pay ₦65,500.00 Now"}
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-brand-400 mt-4">
                <ShieldCheck size={16} /> 100% Secure Payment
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center space-y-6 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-heading text-slate-900">Payment Successful!</h3>
              <p className="text-slate-600 mt-2">Your school fees of ₦65,500.00 for the current term have been paid successfully. Receipt #ESS-PAY-908234.</p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" className="gap-2">
                <Download size={16} /> Download Receipt
              </Button>
              <Button variant="brand" onClick={() => setIsPaid(false)}>
                Return to Fees
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
