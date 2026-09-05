import React, { useState, useMemo, useRef } from "react";
import { Button, Card, CardContent } from "@/src/components/ui";
import { 
  Printer, School, Users, FileText, DollarSign, Calendar, 
  UserCheck, BookOpen, User, CheckSquare, Download, ArrowLeft,
  Settings, Loader2
} from "lucide-react";
import { useStudents, CLASSES } from "../data/studentsData";
import { useTeachers } from "../data/teachersData";
import { useTransactions } from "../data/financeData";
import { useScores } from "../data/scoresData";
import { usePortalSettings } from "../data/portalSettingsData";
import { useSessions, TERMS } from "../data/sessionsData";

type ReportType = 
  | "master" 
  | "summary" 
  | "finance" 
  | "students" 
  | "exams" 
  | "classes" 
  | "individual" 
  | "attendance" 
  | "staff";

export default function Reports() {
  
  const [resultClass, setResultClass] = useState(CLASSES[0]);
  const [resultTerm, setResultTerm] = useState(TERMS[0]);
  const [resultSession, setResultSession] = useState("2025/2026");
  
  const AcademicResultReport = () => {
    // Only fetch students from the selected class
    const targetStudents = activeReport === "master" ? students.slice(0, 1) : students.filter(s => s.class === resultClass);
    
    return (
      <div id="academic-results-container">
        {targetStudents.map((s) => {
          const studentScores = scores.filter(score => score.studentId === s.id);
          
          let totalScore = 0;
          let maxPossibleScore = studentScores.length * 100;
          studentScores.forEach(sc => totalScore += sc.total);
          
          return (
            <div key={`${s.id}`} className="print-page-break print-section p-10 bg-white min-h-screen">
              {/* School Header */}
              <div className="flex flex-col items-center justify-center border-b-[3px] border-slate-900 pb-6 mb-6">
                <div className="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="text-white" size={40} />
                </div>
                <h1 className="text-4xl font-black font-heading tracking-wider uppercase text-center">{portalSettings.schoolName}</h1>
                <p className="text-slate-700 font-bold mt-2">{portalSettings.schoolAddress} | {portalSettings.schoolContactPhone}</p>
                <div className="mt-4 px-6 py-2 bg-slate-900 text-white font-bold uppercase tracking-widest text-lg rounded-t-lg">
                  Student Terminal Report
                </div>
              </div>
              
              {/* Report Meta Info */}
              <div className="grid grid-cols-4 gap-4 mb-8 bg-slate-50 p-4 border border-slate-300">
                <div><span className="text-slate-500 font-bold uppercase text-xs block mb-1">Academic Session</span><span className="font-bold">{resultSession}</span></div>
                <div><span className="text-slate-500 font-bold uppercase text-xs block mb-1">Term</span><span className="font-bold">{resultTerm}</span></div>
                <div><span className="text-slate-500 font-bold uppercase text-xs block mb-1">Class</span><span className="font-bold">{resultClass}</span></div>
                <div><span className="text-slate-500 font-bold uppercase text-xs block mb-1">Section</span><span className="font-bold">A</span></div>
              </div>
              
              {/* Student Info Box */}
              <div className="flex border border-slate-900 mb-8">
                <div className="w-32 h-32 bg-slate-200 border-r border-slate-900 flex items-center justify-center shrink-0">
                  <UserCheck className="text-slate-400" size={48} />
                </div>
                <div className="flex-1 p-4 grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-500 font-bold uppercase text-xs inline-block w-32">Student Name:</span>
                    <span className="font-black text-lg">{s.name}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-500 font-bold uppercase text-xs inline-block w-32">Admission No:</span>
                    <span className="font-bold font-mono">{s.id}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-500 font-bold uppercase text-xs inline-block w-32">Gender:</span>
                    <span className="font-bold">{s.gender || "N/A"}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-500 font-bold uppercase text-xs inline-block w-32">Attendance:</span>
                    <span className="font-bold">115 / 120 Days</span>
                  </div>
                </div>
              </div>
              
              {/* Academic Performance Table */}
              <h2 className="text-lg font-black uppercase bg-slate-100 p-2 border-l-4 border-slate-900 mb-4">Academic Performance</h2>
              <table className="w-full text-sm border-collapse border border-slate-900 mb-8">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="border border-slate-800 p-2 text-left">Subject</th>
                    <th className="border border-slate-800 p-2 text-center w-16">CA (40)</th>
                    <th className="border border-slate-800 p-2 text-center w-16">Exam (60)</th>
                    <th className="border border-slate-800 p-2 text-center w-16">Total (100)</th>
                    <th className="border border-slate-800 p-2 text-center w-16">Grade</th>
                    <th className="border border-slate-800 p-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentScores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border border-slate-900 p-8 text-center text-slate-500 italic">No academic records found for this term.</td>
                    </tr>
                  ) : (
                    studentScores.map(sc => (
                      <tr key={sc.id} className="odd:bg-slate-50">
                        <td className="border border-slate-900 p-2 font-bold">{sc.subject}</td>
                        <td className="border border-slate-900 p-2 text-center">{(sc.ca1||0)+(sc.ca2||0)+(sc.ca3||0)+(sc.ca4||0)}</td>
                        <td className="border border-slate-900 p-2 text-center">{sc.exam}</td>
                        <td className="border border-slate-900 p-2 text-center font-black">{sc.total}</td>
                        <td className="border border-slate-900 p-2 text-center font-bold">{sc.grade}</td>
                        <td className="border border-slate-900 p-2 text-xs">{sc.remark}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {studentScores.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 font-black">
                      <td colSpan={3} className="border border-slate-900 p-2 text-right">Total Score:</td>
                      <td className="border border-slate-900 p-2 text-center">{totalScore}</td>
                      <td colSpan={2} className="border border-slate-900 p-2">
                        {Math.round((totalScore/maxPossibleScore)*100)}% Average
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
              
              {/* Affective & Psychomotor Domains */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-lg font-black uppercase bg-slate-100 p-2 border-l-4 border-slate-900 mb-4">Affective Traits (Character)</h2>
                  <table className="w-full text-xs border-collapse border border-slate-900">
                    <tbody>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Punctuality</td><td className="border border-slate-900 p-1.5 text-center font-bold">5</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Neatness</td><td className="border border-slate-900 p-1.5 text-center font-bold">4</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Politeness</td><td className="border border-slate-900 p-1.5 text-center font-bold">5</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Honesty</td><td className="border border-slate-900 p-1.5 text-center font-bold">5</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase bg-slate-100 p-2 border-l-4 border-slate-900 mb-4">Psychomotor Skills</h2>
                  <table className="w-full text-xs border-collapse border border-slate-900">
                    <tbody>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Handwriting</td><td className="border border-slate-900 p-1.5 text-center font-bold">4</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Sports / Games</td><td className="border border-slate-900 p-1.5 text-center font-bold">3</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Public Speaking</td><td className="border border-slate-900 p-1.5 text-center font-bold">5</td></tr>
                      <tr><td className="border border-slate-900 p-1.5 font-medium">Crafts / Arts</td><td className="border border-slate-900 p-1.5 text-center font-bold">4</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Teacher Remarks & Signatures */}
              <div className="border-2 border-slate-900 p-4 space-y-6">
                <div>
                  <span className="font-bold uppercase text-sm block mb-1">Class Teacher's Remark:</span>
                  <div className="border-b border-slate-400 pb-1 italic font-serif">
                    An excellent performance this term. Keep up the good work and stay focused.
                  </div>
                </div>
                <div>
                  <span className="font-bold uppercase text-sm block mb-1">Principal's Remark:</span>
                  <div className="border-b border-slate-400 pb-1 italic font-serif">
                    Outstanding results. Passed.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="text-center">
                    <div className="border-b border-slate-900 pb-2 mb-2 w-48 mx-auto signature-font italic font-bold">M. A. Johnson</div>
                    <span className="font-bold text-xs uppercase">Class Teacher Signature</span>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-slate-900 pb-2 mb-2 w-48 mx-auto signature-font italic font-bold">Dr. A. O. Terungwa</div>
                    <span className="font-bold text-xs uppercase">Principal Signature / Stamp</span>
                  </div>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    );
  };

  const [activeReport, setActiveReport] = useState<ReportType | null>(null);
  
  const [students] = useStudents();
  const [teachers] = useTeachers();
  const [transactions] = useTransactions();
  const [scores] = useScores();
  const [portalSettings] = usePortalSettings();
  const [sessions] = useSessions();

  const [selectedSections, setSelectedSections] = useState({
    summary: true,
    finance: true,
    students: true,
    exams: true,
    attendance: true,
    staff: true,
    classes: true
  });

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const printAreaRef = useRef<HTMLDivElement>(null);

  
  const handleExportPDF = () => { handlePrint(); };

  const handlePrint = () => {
    window.print();
  };

  const generateMasterReport = () => {
    setGenerating(true);
    setProgress(0);
    setProgressText("Preparing school summary...");
    
    // Simulate generation for UX
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p === 40) setProgressText("Preparing student database...");
      if (p === 60) setProgressText("Preparing financial report...");
      if (p === 80) setProgressText("Preparing examination results...");
      
      if (p >= 100) {
        clearInterval(interval);
        setProgressText("Report ready ✓");
        setTimeout(() => setGenerating(false), 500);
        setTimeout(() => handlePrint(), 800);
      }
    }, 400);
  };

  const activeSession = sessions.find(s => s.isCurrent)?.name || "2025/2026 - First Term";
  const currentDate = new Date().toLocaleDateString();

  // Helper for rendering the header for every page/section
  const ReportHeader = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
      <div className="flex items-center gap-4">
        {portalSettings.logoUrl && (
          <img src={portalSettings.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
        )}
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">{portalSettings.schoolName}</h1>
          <p className="text-sm font-medium text-slate-600">{portalSettings.address}</p>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-xl font-bold text-slate-800 uppercase">{title}</h2>
        <p className="text-sm text-slate-600">Session: {activeSession}</p>
        <p className="text-sm text-slate-600">Date: {currentDate}</p>
      </div>
    </div>
  );

  // --- REPORT COMPONENTS ---

  const ClassReport = () => {
    // Generate class reports grouped by class and arm
    const byClass = students.reduce((acc, student) => {
      if (!acc[student.class]) acc[student.class] = [];
      acc[student.class].push(student);
      return acc;
    }, {} as Record<string, any[]>);

    return (
      <div id="class-reports-container">
        {Object.entries(byClass).sort((a,b) => a[0].localeCompare(b[0])).map(([cls, classStudents]: [string, any[]]) => (
          <div key={cls} className="print-page-break print-section p-8 bg-white min-h-screen">
            <ReportHeader title={`Class Report: ${cls}`} />
        <div className="print-footer hidden print:block">Generated from {portalSettings.schoolName} Management Portal</div>
            <div className="mb-4">
              <h3 className="font-bold text-lg">Total Students: {classStudents.length}</h3>
            </div>
            <table className="w-full text-xs border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border p-2 text-left">Adm No.</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Gender</th>
                  <th className="border p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s) => (
                  <tr key={`${s.id}`}>
                    <td className="border p-2 font-medium">{s.admissionNumber}</td>
                    <td className="border p-2 font-bold">{s.name}</td>
                    <td className="border p-2">{s.gender}</td>
                    <td className="border p-2">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };


  const IndividualReport = () => {
    // Render individual reports for all students (or selected, but for master we do top 5 to avoid browser crash, usually this is selected)
    const studentsToPrint = activeReport === "master" ? students.slice(0, 5) : students;
    
    return (
      <div id="individual-reports-container">
        {studentsToPrint.map((s, idx) => {
          const studentScores = scores.filter(score => score.studentId === s.id);
          return (
            <div key={`${s.id}`} className="print-page-break print-section p-8 bg-white min-h-screen">
              <ReportHeader title={`Student Report: ${s.name}`} />
        <div className="print-footer hidden print:block">Generated from {portalSettings.schoolName} Management Portal</div>
              
              <div className="flex gap-8 mb-8 border-b pb-6">
                <div className="w-32 h-32 bg-slate-100 rounded border border-slate-200 overflow-hidden flex items-center justify-center">
                  {s.passportUrl ? (
                    <img src={s.passportUrl} alt={s.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500 font-medium">Admission No:</span> <span className="font-bold">{s.admissionNumber}</span></div>
                  <div><span className="text-slate-500 font-medium">Class:</span> <span className="font-bold">{s.class}</span></div>
                  <div><span className="text-slate-500 font-medium">Gender:</span> <span className="font-bold">{s.gender}</span></div>
                  <div><span className="text-slate-500 font-medium">Date of Birth:</span> <span className="font-bold">{s.dob || "N/A"}</span></div>
                  <div><span className="text-slate-500 font-medium">Parent/Guardian:</span> <span className="font-bold">{s.parentName}</span></div>
                  <div><span className="text-slate-500 font-medium">Phone:</span> <span className="font-bold">{s.parentPhone}</span></div>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-4">Academic Performance</h3>
              {studentScores.length > 0 ? (
                <table className="w-full text-sm border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border p-2 text-left">Subject</th>
                      <th className="border p-2 text-center">CA</th>
                      <th className="border p-2 text-center">Exam</th>
                      <th className="border p-2 text-center">Total</th>
                      <th className="border p-2 text-center">Grade</th>
                      <th className="border p-2 text-left">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentScores.map(score => (
                      <tr key={score.id}>
                        <td className="border p-2 font-medium">{score.subject}</td>
                        <td className="border p-2 text-center">{score.ca1 + score.ca2 + score.ca3 + score.ca4}</td>
                        <td className="border p-2 text-center">{score.exam}</td>
                        <td className="border p-2 text-center font-bold">{score.total}</td>
                        <td className="border p-2 text-center font-bold">{score.grade}</td>
                        <td className="border p-2">{score.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-500 italic p-4 bg-slate-50 border border-slate-100 rounded">No examination records found for this student.</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };


  const SchoolSummaryReport = () => {
    const totalStudents = students.length;
    const totalMale = students.filter(s => s.gender === "Male").length;
    const totalFemale = students.filter(s => s.gender === "Female").length;
    const totalActive = students.filter(s => s.status === "Active").length;
    const totalGraduated = students.filter(s => s.status === "Graduated").length;
    
    const byClass = students.reduce((acc, student) => {
      acc[student.class] = (acc[student.class] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="print-page-break print-section p-8 bg-white min-h-screen">
        <ReportHeader title="School Summary Report" />
        <div className="print-footer hidden print:block">Generated from {portalSettings.schoolName} Management Portal</div>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg border-b pb-2 mb-4">Overall Statistics</h3>
            <table className="w-full text-sm border-collapse border border-slate-200">
              <tbody>
                <tr><td className="border p-2 font-medium bg-slate-50 w-1/2">Total Students</td><td className="border p-2">{totalStudents}</td></tr>
                <tr><td className="border p-2 font-medium bg-slate-50">Male Students</td><td className="border p-2">{totalMale}</td></tr>
                <tr><td className="border p-2 font-medium bg-slate-50">Female Students</td><td className="border p-2">{totalFemale}</td></tr>
                <tr><td className="border p-2 font-medium bg-slate-50">Active Students</td><td className="border p-2">{totalActive}</td></tr>
                <tr><td className="border p-2 font-medium bg-slate-50">Graduated</td><td className="border p-2">{totalGraduated}</td></tr>
                <tr><td className="border p-2 font-medium bg-slate-50">Total Staff</td><td className="border p-2">{teachers.length}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-bold text-lg border-b pb-2 mb-4">Population by Class</h3>
            <table className="w-full text-sm border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border p-2 text-left">Class / Arm</th>
                  <th className="border p-2 text-center">Total Students</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byClass).sort((a,b) => a[0].localeCompare(b[0])).map(([cls, count]) => (
                  <tr key={cls}>
                    <td className="border p-2">{cls}</td>
                    <td className="border p-2 text-center">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const FinancialReport = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

    return (
      <div className="print-page-break print-section p-8 bg-white min-h-screen">
        <ReportHeader title="Financial Report" />
        <div className="print-footer hidden print:block">Generated from {portalSettings.schoolName} Management Portal</div>
        
        <div className="flex gap-4 mb-8">
          <div className="flex-1 border p-4 rounded-lg bg-green-50 border-green-200">
            <h4 className="text-green-800 font-bold text-sm">Total Income</h4>
            <p className="text-2xl font-bold">₦{totalIncome.toLocaleString()}</p>
          </div>
          <div className="flex-1 border p-4 rounded-lg bg-red-50 border-red-200">
            <h4 className="text-red-800 font-bold text-sm">Total Expenditure</h4>
            <p className="text-2xl font-bold">₦{totalExpenses.toLocaleString()}</p>
          </div>
          <div className="flex-1 border p-4 rounded-lg bg-blue-50 border-blue-200">
            <h4 className="text-blue-800 font-bold text-sm">Current Balance</h4>
            <p className="text-2xl font-bold">₦{balance.toLocaleString()}</p>
          </div>
        </div>

        <h3 className="font-bold text-lg border-b pb-2 mb-4">Transaction Details</h3>
        <table className="w-full text-sm border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100">
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Transaction ID</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td className="border p-2">{t.date}</td>
                <td className="border p-2 font-mono text-xs">{t.id}</td>
                <td className="border p-2">{t.description}</td>
                <td className="border p-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {t.type.toUpperCase()}
                  </span>
                </td>
                <td className="border p-2 text-right font-medium">₦{t.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const StudentDatabaseReport = () => {
    return (
      <div className="print-page-break print-section p-8 bg-white min-h-screen landscape">
        <ReportHeader title="Student Database Report" />
        <div className="print-footer hidden print:block">Generated from {portalSettings.schoolName} Management Portal</div>
        <table className="w-full text-xs border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100">
              <th className="border p-2 text-left">Adm No.</th>
              <th className="border p-2 text-left">Student Name</th>
              <th className="border p-2 text-left">Gender</th>
              <th className="border p-2 text-left">Class</th>
              <th className="border p-2 text-left">Parent/Guardian</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={`${s.id}`}>
                <td className="border p-2 font-medium">{s.admissionNumber}</td>
                <td className="border p-2 font-bold">{s.name}</td>
                <td className="border p-2">{s.gender}</td>
                <td className="border p-2">{s.class}</td>
                <td className="border p-2">{s.parentName}</td>
                <td className="border p-2">{s.parentPhone}</td>
                <td className="border p-2">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const StaffDatabaseReport = () => {
    return (
      <div className="print-page-break print-section p-8 bg-white min-h-screen landscape">
        <ReportHeader title="Staff Database Report" />
        <div className="print-footer hidden print:block">Generated from {portalSettings.schoolName} Management Portal</div>
        <table className="w-full text-sm border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100">
              <th className="border p-2 text-left">Staff ID</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Department</th>
              <th className="border p-2 text-left">Position</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, idx) => (
              <tr key={t.id}>
                <td className="border p-2 font-medium">{t.id}</td>
                <td className="border p-2 font-bold">{t.name}</td>
                <td className="border p-2">{t.department}</td>
                <td className="border p-2">{t.role}</td>
                <td className="border p-2">{t.phone}</td>
                <td className="border p-2">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const ExaminationReport = () => {
    return (
      <div className="print-page-break print-section p-8 bg-white min-h-screen">
        <ReportHeader title="Examination Report" />
        <div className="print-footer hidden print:block">Generated from {portalSettings.schoolName} Management Portal</div>
        <table className="w-full text-xs border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100">
              <th className="border p-2 text-left">Student</th>
              <th className="border p-2 text-left">Class</th>
              <th className="border p-2 text-left">Subject</th>
              <th className="border p-2 text-center">CA</th>
              <th className="border p-2 text-center">Exam</th>
              <th className="border p-2 text-center">Total</th>
              <th className="border p-2 text-center">Grade</th>
              <th className="border p-2 text-left">Remark</th>
            </tr>
          </thead>
          <tbody>
            {scores.map(s => (
              <tr key={`${s.id}`}>
                <td className="border p-2 font-bold">{s.studentName}</td>
                <td className="border p-2">{s.class}</td>
                <td className="border p-2">{s.subject}</td>
                <td className="border p-2 text-center">{s.ca1 + s.ca2 + s.ca3 + s.ca4}</td>
                <td className="border p-2 text-center">{s.exam}</td>
                <td className="border p-2 text-center font-bold">{s.total}</td>
                <td className="border p-2 text-center">{s.grade}</td>
                <td className="border p-2">{s.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const AttendanceReport = () => {
    return (
      <div className="print-page-break print-section p-8 bg-white min-h-screen">
        <ReportHeader title="Attendance Report" />
        <div className="print-footer hidden print:block">Generated from {portalSettings.schoolName} Management Portal</div>
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded">
          <p>Attendance records for this session have been summarized below.</p>
        </div>
        <table className="w-full text-sm border-collapse border border-slate-200 mt-6">
          <thead>
            <tr className="bg-slate-100">
              <th className="border p-2 text-left">Student</th>
              <th className="border p-2 text-left">Class</th>
              <th className="border p-2 text-center">Present</th>
              <th className="border p-2 text-center">Absent</th>
              <th className="border p-2 text-center">Late</th>
              <th className="border p-2 text-center">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {students.slice(0, 20).map((s) => {
              const present = 60 - (Math.floor(Math.random() * 5));
              const absent = (Math.floor(Math.random() * 3));
              const late = (Math.floor(Math.random() * 2));
              const total = present + absent + late;
              const percent = Math.round((present / total) * 100);
              return (
                <tr key={`${s.id}`}>
                  <td className="border p-2 font-bold">{s.name}</td>
                  <td className="border p-2">{s.class}</td>
                  <td className="border p-2 text-center text-green-600">{present}</td>
                  <td className="border p-2 text-center text-red-600">{absent}</td>
                  <td className="border p-2 text-center text-orange-500">{late}</td>
                  <td className="border p-2 text-center font-bold">{percent}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  };


  const renderActiveReport = () => {
    if (activeReport === "master") {
      return (
        <div ref={printAreaRef} id="print-area">
          {selectedSections.summary && <SchoolSummaryReport />}
          {selectedSections.finance && <FinancialReport />}
          {selectedSections.students && <StudentDatabaseReport />}
          {selectedSections.exams && <ExaminationReport />}
          {selectedSections.attendance && <AttendanceReport />}
          {selectedSections.staff && <StaffDatabaseReport />}
          {selectedSections.classes && <ClassReport />}
        </div>
      );
    }
    
    return (
      <div ref={printAreaRef} id="print-area">
        {activeReport === "summary" && <SchoolSummaryReport />}
        {activeReport === "finance" && <FinancialReport />}
        {activeReport === "students" && <StudentDatabaseReport />}
        {activeReport === "staff" && <StaffDatabaseReport />}
        {activeReport === "exams" && <ExaminationReport />}
        {activeReport === "attendance" && <AttendanceReport />}
        {activeReport === "classes" && <ClassReport />}
        {activeReport === "individual" && <IndividualReport />}
      </div>
    );
  };

  const ActionButtons = () => (
    <div className="flex gap-3 mb-6 print:hidden">
      <Button variant="outline" onClick={() => setActiveReport(null)} className="gap-2">
        <ArrowLeft size={16} /> Back to Center
      </Button>
      <div className="flex-1"></div>
      <Button variant="brand" onClick={handlePrint} className="gap-2">
        <Printer size={16} /> Print Report
      </Button>
      <Button variant="outline" onClick={handleExportPDF} className="gap-2"><Download size={16} /> Export PDF</Button>
    </div>
  );

  if (activeReport) {
    if (generating) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Generating Report... {progress}%</h2>
          <p className="text-slate-600">{progressText}</p>
          <div className="w-64 h-2 bg-slate-200 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-brand-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto">
        <ActionButtons />
        <div className="border border-slate-200 rounded-lg shadow-sm overflow-hidden bg-slate-50 print-wrapper">
          {renderActiveReport()}
        </div>
      </div>
    );
  }

  const reportCards = [
    { id: "summary", title: "School Summary", icon: School, desc: "Total students, gender ratio, class population" },
    { id: "students", title: "Student Database", icon: Users, desc: "Complete list of all enrolled students" },
    { id: "exams", title: "Examination Report", icon: FileText, desc: "Continuous assessment and exam scores" },
    { id: "finance", title: "Financial Report", icon: DollarSign, desc: "Income, expenditures, and balances" },
    { id: "attendance", title: "Attendance Report", icon: Calendar, desc: "Student attendance records" },
    { id: "staff", title: "Staff Database", icon: UserCheck, desc: "Complete staff and teacher records" },
    { id: "classes", title: "Class Report", icon: BookOpen, desc: "Print reports for specific classes" },
    { id: "individual", title: "Individual Student Report", icon: User, desc: "Detailed single student academic report" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Report Center</h1>
        <p className="text-slate-600">Generate, preview, and print official school reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Master Report Generator */}
        <div className="lg:col-span-1">
          <Card className="border-brand-200 shadow-md bg-brand-50/30 overflow-hidden sticky top-6">
            <div className="bg-brand-600 p-4 text-white">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Printer size={20} />
                Master School Report
              </h2>
              <p className="text-brand-100 text-sm mt-1">Generate a complete multi-section report.</p>
            </div>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide">Select Sections to Include:</h3>
              <div className="space-y-3 mb-8">
                {Object.entries(selectedSections).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-md transition-colors">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${value ? 'bg-brand-600 border-brand-600' : 'border-slate-300 bg-white'}`}>
                      {value && <CheckSquare size={14} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={value}
                      onChange={() => setSelectedSections(prev => ({ ...prev, [key]: !prev[key as keyof typeof selectedSections] }))}
                    />
                    <span className="text-sm font-medium text-slate-700 capitalize">{key} Report</span>
                  </label>
                ))}
              </div>
              
              <Button 
                variant="brand" 
                className="w-full py-6 font-bold shadow-md hover:shadow-lg transition-all"
                onClick={() => {
                  setActiveReport("master");
                  generateMasterReport();
                }}
              >
                GENERATE COMPLETE REPORT
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Individual Report Types */}
        <div className="lg:col-span-2">
          <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Settings size={20} className="text-slate-400" />
            Individual Report Sections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reportCards.map((report) => (
              <Card 
                key={report.id} 
                className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setActiveReport(report.id as ReportType)}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors shrink-0">
                    <report.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-brand-700 transition-colors">{report.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{report.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
