import { usePortalSettings } from "../../data/portalSettingsData";
import React, { useState } from "react";
import { useStudents, findStudentByIdentifier } from "../../data/studentsData";
import { useSessions, TERMS } from "../../data/sessionsData";
import { getStoredScores, ScoreRecord } from "../../data/scoresData";
import { useSkillsDb } from "../../data/skillsData";
import { getStoredPins, saveStoredPins, verifyStudentResultPin } from "../../data/pinsData";
import { isResultReleased } from "../../data/resultsReleaseData";
import { calculateStudentAttendanceStats } from "../../data/attendanceResultConnector";
import { AttendanceRecordTable } from "../../components/AttendanceRecordTable";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { Search, Printer, Award, CheckCircle, AlertCircle, FileText, UserCheck, RefreshCw, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { StudentReportCard } from "../../components/StudentReportCard";

export default function ResultChecker() {
  const [portalSettings] = usePortalSettings();
  const [students] = useStudents();
  const [sessions, , currentSession] = useSessions();
  const scores = getStoredScores();
  const [skillsDb] = useSkillsDb();

  // Search parameters
  const [studentId, setStudentId] = useState("");
  const [selectedSessionYear, setSelectedSessionYear] = useState(() => currentSession || "2025/2026");
  const [selectedTerm, setSelectedTerm] = useState("First Term");
  const [pinCode, setPinCode] = useState("");

  // Output State
  const [foundStudent, setFoundStudent] = useState<any | null>(null);
  const [studentScores, setStudentScores] = useState<ScoreRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const targetSession = `${selectedSessionYear} - ${selectedTerm}`;

  const handleCheckResult = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    setHasSearched(false);

    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);

      const trimmedId = studentId.trim().toUpperCase();
      const trimmedPin = pinCode.trim().toUpperCase();

      if (!trimmedId) {
        setErrorMessage("Please enter a valid Student Admission / Registration Number.");
        setFoundStudent(null);
        return;
      }

      if (!trimmedPin) {
        setErrorMessage("Scratch Card PIN is required. You cannot access results without entering a valid PIN.");
        setFoundStudent(null);
        return;
      }

      if (trimmedPin.length < 4) {
        setErrorMessage("Invalid Scratch Card PIN format. Please check your scratch card and enter a valid PIN code.");
        setFoundStudent(null);
        return;
      }

      // Search student by strict identifier or normalized ID match
      const matchedStudent = findStudentByIdentifier(trimmedId, students) || students.find(s => 
        (s.id && s.id.toUpperCase() === trimmedId) || 
        (s.name && s.name.toUpperCase() === trimmedId) ||
        (s.id && s.id.replace(/\//g, "").toUpperCase() === trimmedId.replace(/\//g, "")) ||
        (s.applicationNumber && s.applicationNumber.replace(/\//g, "").toUpperCase() === trimmedId.replace(/\//g, ""))
      );

      if (!matchedStudent) {
        setErrorMessage(`No student record found matching Registration Number: "${studentId}". Please verify your admission number.`);
        setFoundStudent(null);
        return;
      }

      // Check if Admin has released results for this Session, Term, and Class first
      const released = isResultReleased(selectedSessionYear, selectedTerm, matchedStudent.class);
      if (!released) {
        setErrorMessage(`RESULT NOT RELEASED: The examination results for ${selectedSessionYear} - ${selectedTerm} (${matchedStudent.class}) have not been officially published by the school administration yet. Your Scratch Card PIN was not deducted. Please check back later.`);
        setFoundStudent(null);
        return;
      }

      // Check Scratch Card PIN validity against stored PIN records
      const verifyRes = verifyStudentResultPin(trimmedPin, matchedStudent.id, selectedSessionYear, selectedTerm);
      if (!verifyRes.success) {
        setErrorMessage(verifyRes.message);
        setFoundStudent(null);
        return;
      }

      // Fetch student's scores for selected session & term
      const matchedScores = scores.filter(sc => 
        sc.studentId === matchedStudent.id && 
        (sc.session === targetSession || sc.session.includes(selectedSessionYear))
      );

      setFoundStudent(matchedStudent);
      setStudentScores(matchedScores);
    }, 400);
  };

  // Calculations
  const totalObtained = studentScores.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const subjectCount = studentScores.length;
  const averagePercentage = subjectCount > 0 ? (totalObtained / subjectCount).toFixed(1) : "0.0";
  const overallGrade = Number(averagePercentage) >= 70 ? "A (Distinction)" : Number(averagePercentage) >= 60 ? "B (Very Good)" : Number(averagePercentage) >= 50 ? "C (Credit)" : "D (Pass)";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* TOP BRAND HEADER */}
        <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-brand-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden print:hidden">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <Award size={36} />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
                  Public Portal Access
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                  Online Student Result Checker
                </h1>
                <p className="text-slate-300 text-sm mt-1 max-w-xl">
                  Official {portalSettings.schoolName} portal. Instantly check, verify, and print academic terminal report sheets for all students.
                </p>
              </div>
            </div>

            <Link to="/login" className="shrink-0">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-bold gap-2">
                <UserCheck size={16} /> Portal Login
              </Button>
            </Link>
          </div>
        </div>

        {/* INPUT SEARCH FORM */}
        <div className="max-w-2xl mx-auto print:hidden">
          <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-5 border-b border-slate-800">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Search size={18} className="text-brand-400" />
                Enter Student Assessment & PIN Details
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <form onSubmit={handleCheckResult} className="space-y-4">
                <div>
                  <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1.5">
                    Student Reg / Admission Number <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="e.g. ESS/2026/001"
                      className="h-11 pl-10 uppercase font-mono font-semibold text-slate-900 border-slate-300 focus:ring-brand-500"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    />
                    <FileText size={18} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1.5">
                      Academic Session <span className="text-rose-500">*</span>
                    </Label>
                    <select
                      className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={selectedSessionYear}
                      onChange={(e) => setSelectedSessionYear(e.target.value)}
                    >
                      {sessions.map(s => (
                        <option key={s} value={s}>{s} Academic Session</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1.5">
                      Academic Term <span className="text-rose-500">*</span>
                    </Label>
                    <select
                      className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                    >
                      {TERMS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 text-xs font-bold uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span>Result Scratch Card PIN <span className="text-rose-500">* (Compulsory)</span></span>
                    <span className="text-[10px] text-amber-700 font-bold uppercase bg-amber-100 px-2 py-0.5 rounded">Required for Access</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter Scratch Card PIN (e.g. ESS-PIN-2026-9912)"
                      className="h-11 pl-10 font-mono text-xs border-slate-300 text-slate-900 font-semibold uppercase"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      required
                    />
                    <Key size={18} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enter the valid scratch card PIN code provided by the school administration to unlock and view the report sheet.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-3 animate-in fade-in">
                    <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Result Access Restricted</p>
                      <p className="mt-0.5">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    variant="brand"
                    disabled={isLoading}
                    className="h-11 flex-1 font-bold gap-2 text-sm shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Verifying Records & PIN...
                      </>
                    ) : (
                      <>
                        <Search size={16} /> Check Result
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 border-slate-300 text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      setStudentId("");
                      setPinCode("");
                      setFoundStudent(null);
                      setHasSearched(false);
                      setErrorMessage("");
                    }}
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* RESULT SHEET DISPLAY AREA */}
        {hasSearched && foundStudent && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle size={18} className="text-emerald-600" />
                <span>Result record successfully retrieved for {foundStudent.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-brand-900 text-white hover:bg-brand-800 font-bold gap-2"
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print Official Result Slip
              </Button>
            </div>

            {/* OFFICIAL REPORT CARD SHEET */}
            <div className="overflow-x-auto flex justify-center">
              <StudentReportCard
                student={foundStudent}
                session={selectedSessionYear}
                term={selectedTerm}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
