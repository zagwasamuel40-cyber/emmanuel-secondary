import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/src/components/ui";
import { CreditCard, Download, ShieldCheck, CheckCircle2, FileText, AlertCircle, Printer, Sparkles, Receipt, ArrowRight } from "lucide-react";
import { useStudents, findStudentByIdentifier } from "../../data/studentsData";
import { safeStorage } from "../../utils/safeStorage";
import { OnlinePaymentModal, PaymentResult } from "../../components/payment/OnlinePaymentModal";

export default function StudentFees() {
  const [students, setStudents] = useStudents();
  const loggedInId = safeStorage.getItem('loggedInStudentId');
  const currentStudent = findStudentByIdentifier(loggedInId, students);
  const studentClass = currentStudent?.class || "JSS 1";

  const [isPaid, setIsPaid] = useState(() => currentStudent?.fees === "Paid");
  const [feeBreakdowns, setFeeBreakdowns] = useState<any[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any>(() => {
    const saved = safeStorage.getItem(`ess_fee_receipt_${loggedInId}`);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentStudent) {
      setIsPaid(currentStudent.fees === "Paid");
    }
  }, [currentStudent?.fees]);

  useEffect(() => {
    const stored = safeStorage.getItem("ess_fee_breakdowns");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFeeBreakdowns(parsed.filter((f: any) => f.targetClass === studentClass || f.targetClass === "All Classes"));
      } catch (e) {
        console.error("Failed to parse fee breakdowns", e);
      }
    } else {
      const oldStored = safeStorage.getItem("ess_fee_breakdown");
      if (oldStored) {
        try {
          setFeeBreakdowns([{ ...JSON.parse(oldStored), id: 'old', targetClass: "All Classes", term: "Current Term", session: "Current Session" }]);
        } catch (e) {}
      }
    }
  }, [studentClass]);

  const handlePaymentSuccess = (result: PaymentResult) => {
    setIsPaid(true);
    setActiveReceipt(result);
    if (loggedInId) {
      safeStorage.setItem(`ess_fee_receipt_${loggedInId}`, JSON.stringify(result));
    }

    if (currentStudent) {
      setStudents(prev => prev.map(s => s.id === currentStudent.id ? { 
        ...s, 
        fees: "Paid",
        feePaymentRef: result.reference,
        feePaymentDate: result.paidAt,
        feePaymentAmount: result.amount
      } : s));
    }
  };

  if (!currentStudent) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Student Verification Required</h3>
        <p className="text-slate-600 text-sm">
          Please log in to view your fee structure, outstanding balance, and fee receipts.
        </p>
        <Link to="/login">
          <Button className="bg-brand-900 text-white hover:bg-brand-800 mt-2">
            Sign In to Student Portal
          </Button>
        </Link>
      </div>
    );
  }

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
                className="w-full text-base h-12 bg-emerald-500 hover:bg-emerald-600 text-white border-0 font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <CreditCard size={18} /> Pay ₦65,500.00 Online Now
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-brand-400 mt-4">
                <ShieldCheck size={16} /> 100% Secure Payment &bull; Instant E-Receipt
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Success Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold font-heading text-slate-900">School Fees Paid Successfully!</h3>
            <p className="text-slate-600 text-sm mt-1">
              Your school fees for the current academic session have been verified and cleared by the Bursar's Office.
            </p>
          </div>

          {/* Official Printable School Fees Receipt */}
          <Card className="border border-slate-200 shadow-md overflow-hidden bg-white" id="school-fee-official-receipt">
            <div className="bg-brand-950 text-white px-6 py-4 flex items-center justify-between border-b border-brand-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold font-serif text-lg">
                  ESS
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wide">Emmanuel Secondary School</h4>
                  <p className="text-[11px] text-brand-300">Office of the Bursar &bull; Official Fee Receipt</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-full uppercase tracking-wider">
                  PAID
                </span>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Receipt Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Receipt No.</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeReceipt?.receiptNumber || `REC-2026-PAY-${currentStudent.id.replace(/\D/g, "") || "908234"}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Transaction Ref</span>
                  <span className="font-mono font-bold text-slate-900 truncate block">
                    {activeReceipt?.reference || (currentStudent as any).feePaymentRef || "ESS-PAY-908234-VERIFIED"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Student ID</span>
                  <span className="font-mono font-bold text-brand-900">{currentStudent.id}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Date</span>
                  <span className="font-medium text-slate-800">
                    {activeReceipt?.paidAt ? new Date(activeReceipt.paidAt).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>

              {/* Student Details */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center py-2 border-b border-slate-100 text-sm gap-2">
                <div>
                  <span className="text-xs text-slate-500 block">Student Name</span>
                  <span className="font-bold text-slate-900 text-base">{currentStudent.name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Current Class / Level</span>
                  <span className="font-bold text-slate-800">{studentClass}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Academic Session / Term</span>
                  <span className="font-bold text-slate-800">2025/2026 &bull; First Term</span>
                </div>
              </div>

              {/* Fee Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 font-semibold text-slate-700 text-xs border-b border-slate-200">
                    <tr>
                      <th className="p-3">Fee Item Description</th>
                      <th className="p-3 text-right">Amount (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                    <tr>
                      <td className="p-3 font-medium">Tuition & Instructional Fee</td>
                      <td className="p-3 text-right font-mono">45,000.00</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">School Infrastructure & Development Levy</td>
                      <td className="p-3 text-right font-mono">10,000.00</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Computer ICT Laboratory & Library Access</td>
                      <td className="p-3 text-right font-mono">5,000.00</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Student Clinic & Medical Insurance Fee</td>
                      <td className="p-3 text-right font-mono">2,500.00</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">PTA (Parent Teacher Association) Levy</td>
                      <td className="p-3 text-right font-mono">3,000.00</td>
                    </tr>
                    <tr className="bg-emerald-50/70 font-bold text-emerald-950 border-t border-emerald-200">
                      <td className="p-3 text-sm">TOTAL AMOUNT PAID</td>
                      <td className="p-3 text-right text-base font-mono font-black text-emerald-700">
                        ₦65,500.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures & Stamp */}
              <div className="pt-4 flex justify-between items-end text-xs text-slate-600 border-t border-slate-200">
                <div>
                  <p className="font-serif italic font-bold text-slate-900 text-sm">Mr. B. T. Orngu, CNA</p>
                  <p className="text-[11px] text-slate-500">School Bursar & Head of Accounts</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold rounded-md text-[10px] tracking-wider">
                    ELECTRONICALLY VERIFIED
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
            <Button
              variant="outline"
              className="gap-2 h-11 text-sm font-semibold border-slate-300 hover:bg-slate-50"
              onClick={() => window.print()}
            >
              <Printer size={16} /> Print / Download PDF Receipt
            </Button>
            <Button
              variant="brand"
              className="gap-2 h-11 text-sm font-semibold bg-brand-900 hover:bg-brand-800 text-white"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <CreditCard size={16} /> Pay Another Term / Fee
            </Button>
          </div>
        </div>
      )}

      {/* Online Payment Modal Plugin */}
      <OnlinePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={65500}
        title="Student Termly School Fees"
        itemDescription="Tuition, Development, ICT, Medical & PTA Levies"
        payerName={currentStudent.name}
        payerEmail="student@emmanuelsecondary.edu.ng"
        identifier={currentStudent.id}
        purpose={`School Fees (First Term 2025/2026) - ${studentClass}`}
        category="school_fee"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
