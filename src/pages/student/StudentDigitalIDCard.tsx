import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStudents, findStudentByIdentifier, Student } from "../../data/studentsData";
import { 
  useIdCards, 
  useAttendance, 
  useIDCardDesignSettings,
  ensureStudentHasIdCard 
} from "../../data/idCardAndAttendanceData";
import StudentIDCard from "../../components/idcard/StudentIDCard";
import { 
  QrCode, 
  Download, 
  Printer, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Smartphone,
  Info,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/src/components/ui";

export default function StudentDigitalIDCard() {
  const [students] = useStudents();
  const [idCards] = useIdCards();
  const [attendanceRecords] = useAttendance();
  const [designSettings] = useIDCardDesignSettings();
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  useEffect(() => {
    const loggedInId = localStorage.getItem('loggedInStudentId');
    if (loggedInId) {
      const found = findStudentByIdentifier(loggedInId, students);
      setCurrentStudent(found);
    } else {
      setCurrentStudent(null);
    }
  }, [students]);

  if (!currentStudent) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Student ID Not Found</h3>
        <p className="text-slate-600 text-sm">
          Please sign in to your student account to access your official digital identity credential and attendance QR pass.
        </p>
        <Link to="/login">
          <Button className="bg-brand-900 text-white hover:bg-brand-800 mt-2">
            Sign In to Student Portal
          </Button>
        </Link>
      </div>
    );
  }

  const card = idCards.find(c => c.studentId === currentStudent.id) || ensureStudentHasIdCard(currentStudent);

  // Student's personal attendance history
  const myAttendance = attendanceRecords.filter(r => r.studentId === currentStudent.id);
  const presentCount = myAttendance.filter(r => r.status === "Present" || r.status === "Late").length;
  const totalDaysTracked = myAttendance.length || 1;
  const attendanceRate = Math.min(100, Math.round((presentCount / totalDaysTracked) * 100));

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <ShieldCheck size={14} />
            Verified Official Digital Identity Card
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading">
            {currentStudent.name}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            This digital ID card is your official credential for Emmanuel Secondary School. Present the QR code on your phone screen at the school gate or roll call for instant attendance recording.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button 
            onClick={() => window.print()}
            variant="outline"
            className="text-xs gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Printer size={15} />
            Print Physical Card
          </Button>
        </div>
      </div>

      {/* Main Content Grid: ID Card Centered / Left, Instructions & Attendance on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ID Card Display (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm flex flex-col items-center">
            <StudentIDCard
              student={currentStudent}
              cardInfo={card}
              customization={designSettings}
              showActions={true}
            />
          </div>
        </div>

        {/* Right Info Panels (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gate Verification Guide */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <Smartphone size={18} className="text-brand-600" />
                How to Use Your Digital ID Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Morning Gate & Assembly Check-in</h4>
                  <p className="mt-0.5 text-slate-500">
                    Click the <strong>"Flip to Back (QR)"</strong> button above to reveal your secure QR code. Hold your phone screen up to the staff member's scanner camera at the entrance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Instant Attendance Confirmation</h4>
                  <p className="mt-0.5 text-slate-500">
                    The scanner automatically chimes and records your arrival time. You do not need to sign manual paper sheets.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Offline & Printable Backup</h4>
                  <p className="mt-0.5 text-slate-500">
                    You can download the PNG or PDF to keep on your smartphone photo gallery, or print a laminated copy to carry in your wallet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student's Personal Attendance Summary */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-slate-900">My Attendance Overview</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Summary of attendance verified via QR code scan</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {attendanceRate}% Present
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Days Recorded</span>
                  <span className="text-xl font-bold text-slate-900">{myAttendance.length}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Days Present</span>
                  <span className="text-xl font-bold text-emerald-700">{presentCount}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Late Arrivals</span>
                  <span className="text-xl font-bold text-amber-700">
                    {myAttendance.filter(r => r.status === "Late").length}
                  </span>
                </div>
              </div>

              {/* Recent Scan History */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Recent Check-In Scans
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Time</th>
                        <th className="px-3 py-2">Session</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myAttendance.slice(0, 5).map(rec => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-800">{rec.date}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{rec.time}</td>
                          <td className="px-3 py-2 text-slate-600">{rec.period}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                              rec.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {myAttendance.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                            No attendance records logged yet this term.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
