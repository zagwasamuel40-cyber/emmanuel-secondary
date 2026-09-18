import React from "react";
import { usePortalSettings } from "../data/portalSettingsData";
import { calculateStudentAttendanceStats } from "../data/attendanceResultConnector";
import { useScores, ScoreRecord } from "../data/scoresData";
import { useStudents } from "../data/studentsData";
import { useSkillsDb } from "../data/skillsData";

export interface StudentReportCardProps {
  session: string;
  term?: string;
  student: any;
  overrideScores?: ScoreRecord[];
  onEditScores?: () => void;
  showWatermark?: boolean;
}

export function StudentReportCard({
  session,
  term,
  student,
  overrideScores,
  onEditScores,
  showWatermark = true,
}: StudentReportCardProps) {
  const [portalSettings] = usePortalSettings();
  const [scores] = useScores();
  const [students] = useStudents();
  const [skillsDb] = useSkillsDb();

  // 1. Resolve Session and Term
  const sessionYear = session?.includes(" - ") ? session.split(" - ")[0].trim() : (session || "2025/2026");
  const termName = term || (session?.includes(" - ") ? session.split(" - ")[1].trim() : "First Term");
  const targetSession = `${sessionYear} - ${termName}`;

  // 2. Resolve Student Record from Database
  const studentId = typeof student === "string" ? student : (student?.id || student?.studentId || "");
  const studentProfile = students.find((s) => s.id === studentId) || (typeof student === "object" ? student : null);

  const studentName = studentProfile?.name || studentProfile?.studentName || student?.name || student?.studentName || "Unknown Student";
  const studentClass = studentProfile?.class || student?.class || "SSS 3A";
  const studentGender = (studentProfile?.gender || student?.gender || "Female").toUpperCase();
  const passportUrl = studentProfile?.passportUrl || student?.passportUrl || null;

  // 3. Dynamic Attendance Stats from Database
  const attendance = calculateStudentAttendanceStats(studentId, sessionYear, termName, studentClass);

  // 4. Retrieve Live Student Academic Scores (Database is Single Source of Truth)
  const allScores = overrideScores || scores;
  const studentScores: ScoreRecord[] = allScores.filter((s) => {
    const matchesId = s.studentId === studentId;
    const matchesName = s.studentName && studentName && s.studentName.trim().toLowerCase() === studentName.trim().toLowerCase();
    const isThisStudent = matchesId || matchesName;

    if (!isThisStudent) return false;

    // Match exact session + term or session year prefix
    const scoreSession = s.session || "";
    const matchesExact = scoreSession === targetSession;
    const matchesCombined = scoreSession === session;
    const matchesYearTerm = scoreSession.startsWith(sessionYear) && scoreSession.toLowerCase().includes(termName.toLowerCase());

    return matchesExact || matchesCombined || matchesYearTerm;
  });

  // 5. Grading calculation function
  const calculateGrade = (total: number) => {
    if (total >= 75) return { grade: "A", remark: "Distinction" };
    if (total >= 70) return { grade: "A", remark: "Excellent" };
    if (total >= 60) return { grade: "B", remark: "Very Good" };
    if (total >= 50) return { grade: "C", remark: "Credit" };
    if (total >= 45) return { grade: "D", remark: "Pass" };
    if (total >= 40) return { grade: "E", remark: "Fair" };
    return { grade: "F", remark: "Fail" };
  };

  // 6. Query Classmates Benchmark Scores for lowest, highest, average, and positions
  const classmatesSessionScores = allScores.filter((s) => {
    if (s.class !== studentClass) return false;
    const scoreSession = s.session || "";
    return (
      scoreSession === targetSession ||
      scoreSession === session ||
      (scoreSession.startsWith(sessionYear) && scoreSession.toLowerCase().includes(termName.toLowerCase()))
    );
  });

  // Group classmate scores by student to compute Class Position
  const classmateTotalsMap: Record<string, { total: number; count: number; studentId: string; studentName: string }> = {};
  classmatesSessionScores.forEach((rec) => {
    const sid = rec.studentId || rec.studentName;
    const caSum = (Number(rec.ca1) || 0) + (Number(rec.ca2) || 0) + (Number(rec.ca3) || 0) + (Number(rec.ca4) || 0);
    const recTotal = caSum + (Number(rec.exam) || 0);

    if (!classmateTotalsMap[sid]) {
      classmateTotalsMap[sid] = {
        total: 0,
        count: 0,
        studentId: rec.studentId,
        studentName: rec.studentName,
      };
    }
    classmateTotalsMap[sid].total += recTotal;
    classmateTotalsMap[sid].count += 1;
  });

  const rankedClassmates = Object.values(classmateTotalsMap)
    .map((item) => ({
      ...item,
      average: item.count > 0 ? item.total / item.count : 0,
    }))
    .sort((a, b) => b.average - a.average || b.total - a.total);

  const studentRankIndex = rankedClassmates.findIndex(
    (item) => item.studentId === studentId || (Boolean(item.studentName) && Boolean(studentName) && item.studentName.toLowerCase() === studentName.toLowerCase())
  );

  const classPosition =
    studentRankIndex >= 0
      ? studentRankIndex === 0
        ? "1ST"
        : studentRankIndex === 1
        ? "2ND"
        : studentRankIndex === 2
        ? "3RD"
        : `${studentRankIndex + 1}TH`
      : student?.position || "—";

  const totalClassEnrolled = students.filter((s) => s.class === studentClass).length;
  const outOfClassCount = Math.max(totalClassEnrolled, rankedClassmates.length, 1);

  // 7. Calculate Subject Results from Live Database Records
  const calculatedResults = studentScores.map((s) => {
    const ca1 = Number(s.ca1) || 0;
    const ca2 = Number(s.ca2) || 0;
    const ca3 = Number(s.ca3) || 0;
    const ca4 = Number(s.ca4) || 0;
    const caTotal = ca1 + ca2 + ca3 + ca4;
    const exam = Number(s.exam) || 0;
    const total = caTotal + exam;
    const { grade, remark } = calculateGrade(total);

    // Subject benchmarks across classmates in database
    const sameSubjectRecords = classmatesSessionScores.filter(
      (c) => c.subject?.trim().toLowerCase() === s.subject?.trim().toLowerCase()
    );

    const subjectTotals = sameSubjectRecords.map((c) => {
      const cCa = (Number(c.ca1) || 0) + (Number(c.ca2) || 0) + (Number(c.ca3) || 0) + (Number(c.ca4) || 0);
      return cCa + (Number(c.exam) || 0);
    });

    const lowest = subjectTotals.length > 0 ? Math.min(...subjectTotals) : total;
    const highest = subjectTotals.length > 0 ? Math.max(...subjectTotals) : total;
    const subjectAvg =
      subjectTotals.length > 0
        ? (subjectTotals.reduce((acc, curr) => acc + curr, 0) / subjectTotals.length).toFixed(1)
        : total.toFixed(1);

    // Dynamic Subject Position
    const sortedSameSubject = [...sameSubjectRecords].sort((a, b) => {
      const totA = (Number(a.ca1) || 0) + (Number(a.ca2) || 0) + (Number(a.ca3) || 0) + (Number(a.ca4) || 0) + (Number(a.exam) || 0);
      const totB = (Number(b.ca1) || 0) + (Number(b.ca2) || 0) + (Number(b.ca3) || 0) + (Number(b.ca4) || 0) + (Number(b.exam) || 0);
      return totB - totA;
    });

    const subRankIdx = sortedSameSubject.findIndex(
      (c) => c.studentId === studentId || (Boolean(c.studentName) && Boolean(studentName) && c.studentName?.toLowerCase() === studentName?.toLowerCase())
    );

    const position =
      subRankIdx >= 0
        ? subRankIdx === 0
          ? "1st"
          : subRankIdx === 1
          ? "2nd"
          : subRankIdx === 2
          ? "3rd"
          : `${subRankIdx + 1}th`
        : s.position || "—";

    return {
      name: s.subject,
      ca1,
      ca2,
      ca3,
      ca4,
      caTotal,
      exam,
      total,
      lowest,
      highest,
      average: subjectAvg,
      position,
      grade,
      remark,
    };
  });

  // Overall Score & Average
  const overallTotal = calculatedResults.reduce((acc, curr) => acc + curr.total, 0);
  const average = calculatedResults.length > 0 ? (overallTotal / calculatedResults.length).toFixed(1) : "0.0";
  const numAverage = parseFloat(average);

  // 8. Dynamic Term Dates
  const getTermDates = () => {
    const yr1 = parseInt(sessionYear.split("/")[0], 10) || 2025;
    const yr2 = parseInt(sessionYear.split("/")[1], 10) || yr1 + 1;
    const isFirst = (termName || "").toLowerCase().includes("first");
    const isSecond = (termName || "").toLowerCase().includes("second");

    if (isFirst) {
      return {
        termBegan: `${yr1}/9/15`,
        ended: `${yr1}/12/19`,
        nextTermBegins: `${yr2}/1/12`,
      };
    } else if (isSecond) {
      return {
        termBegan: `${yr2}/1/12`,
        ended: `${yr2}/4/10`,
        nextTermBegins: `${yr2}/5/4`,
      };
    } else {
      return {
        termBegan: `${yr2}/5/4`,
        ended: `${yr2}/7/24`,
        nextTermBegins: `${yr2}/9/14`,
      };
    }
  };
  const termDates = getTermDates();

  // 9. Dynamic Comments & Remarks based on Actual Performance
  const getDynamicRemarks = () => {
    if (numAverage >= 80) {
      return {
        teacher: "AN OUTSTANDING PERFORMANCE WITH REMARKABLE DILIGENCE. KEEP IT UP!",
        principal: "EXCELLENT RESULT. DEMONSTRATES EXCEPTIONAL ACADEMIC PROWESS.",
      };
    }
    if (numAverage >= 70) {
      return {
        teacher: "A COMMENDABLE PERFORMANCE. VERY ATTENTIVE AND CONSISTENT IN CLASS.",
        principal: "A VERY GOOD RESULT, KEEP IT UP.",
      };
    }
    if (numAverage >= 60) {
      return {
        teacher: "GOOD PERFORMANCE WITH A STEADY GRASP OF CORE SUBJECTS.",
        principal: "GOOD PROGRESS. CAPABLE OF HIGHER HONOURS WITH EXTRA DISCIPLINE.",
      };
    }
    if (numAverage >= 50) {
      return {
        teacher: "SATISFACTORY PASS. ENCOURAGED TO PUT MORE EFFORT IN WEAKER SUBJECTS.",
        principal: "FAIR RESULT. REQUIRES COMMITTED REVISION TO EXCEL NEXT TERM.",
      };
    }
    if (numAverage >= 40) {
      return {
        teacher: "MARGINAL PASS. NEEDS CLOSER ATTENTION TO DAILY HOMEWORK AND TESTS.",
        principal: "MUST WORK MUCH HARDER TO IMPROVE GRADES AND CLASS RANKING.",
      };
    }
    return {
      teacher: "POOR PERFORMANCE. FAILED TO ATTAIN EXPECTED PROMOTION BENCHMARK.",
      principal: "URGENT REMEDIAL INTERVENTION AND PARENTAL SUPERVISION REQUIRED.",
    };
  };
  const dynamicRemarks = getDynamicRemarks();

  // 10. Dynamic Affective & Psychomotor Traits from Database
  const studentSkills = skillsDb[studentId] || {};

  const affectiveTraits = [
    { n: "Attentiveness", key: "Attentiveness", defaultVal: 4 },
    { n: "Attendance", key: "Attendance", defaultVal: 5 },
    { n: "Punctuality", key: "Punctuality", defaultVal: 5 },
    { n: "Neatness", key: "Neatness", defaultVal: 5 },
    { n: "Politness", key: "Politeness", defaultVal: 4 },
    { n: "Rel. With Others", key: "Rel. With Others", defaultVal: 4 },
    { n: "Curiosity", key: "Curiosity", defaultVal: 4 },
    { n: "Honesty", key: "Honesty", defaultVal: 4 },
    { n: "Humility", key: "Humility", defaultVal: 4 },
    { n: "Tolerance", key: "Tolerance", defaultVal: 3 },
    { n: "Leadership", key: "Leadership", defaultVal: 5 },
    { n: "Courage", key: "Courage", defaultVal: 5 },
  ].map((t) => {
    const raw = studentSkills[t.key] || studentSkills[t.n];
    let val = t.defaultVal;
    if (raw !== undefined) {
      if (typeof raw === "number") val = raw;
      else if (raw === "A") val = 5;
      else if (raw === "B") val = 4;
      else if (raw === "C") val = 3;
      else if (raw === "D") val = 2;
      else if (raw === "E") val = 1;
      else {
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed)) val = parsed;
      }
    }
    return { n: t.n, v: val };
  });

  const psychomotorTraits = [
    { n: "Handwriting", key: "Handwriting", defaultVal: 5 },
    { n: "Fluency", key: "Fluency", defaultVal: 4 },
    { n: "Games/Sports", key: "Games/Sports", defaultVal: 4 },
    { n: "Music Skills", key: "Music Skills", defaultVal: 4 },
    { n: "Construction", key: "Construction", defaultVal: 5 },
  ].map((t) => {
    const raw = studentSkills[t.key] || studentSkills[t.n];
    let val = t.defaultVal;
    if (raw !== undefined) {
      if (typeof raw === "number") val = raw;
      else if (raw === "A") val = 5;
      else if (raw === "B") val = 4;
      else if (raw === "C") val = 3;
      else if (raw === "D") val = 2;
      else if (raw === "E") val = 1;
      else {
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed)) val = parsed;
      }
    }
    return { n: t.n, v: val };
  });

  return (
    <div
      className="bg-white p-4 sm:p-8 min-w-[900px] shadow-sm max-w-[1000px] mx-auto print:p-0 print:shadow-none print:w-full print:max-w-none relative"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-1">
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center relative shrink-0">
          <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20"></div>
          {portalSettings.logoUrl ? (
            <img
              src={portalSettings.logoUrl}
              alt="Logo"
              className="max-w-full max-h-full rounded-full object-cover shadow-sm p-1 bg-white border border-slate-200"
            />
          ) : (
            <div className="w-20 h-20 bg-slate-200 rounded-full border-2 border-slate-300 flex items-center justify-center font-bold text-slate-600">
              ESS
            </div>
          )}
        </div>

        <div className="flex-1 text-center px-4">
          <h1
            className="text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-1"
            style={{ color: "#88a825" }}
          >
            {portalSettings.schoolName}
          </h1>
          <p className="text-[#d4af37] font-semibold text-sm sm:text-base mb-0.5">
            {portalSettings.address}
          </p>
          <p className="text-[#d4af37] font-semibold text-sm sm:text-base mb-0.5">
            Site: {portalSettings.website || "emmanuelsecondaryschool.com"}
          </p>
          <p className="text-[#d4af37] font-semibold text-sm sm:text-base">
            Phone: {portalSettings.contactPhone}
          </p>
        </div>

        <div className="w-24 h-24 sm:w-28 sm:h-32 bg-white flex items-center justify-center overflow-hidden border-2 border-slate-300 shadow-sm shrink-0">
          {passportUrl ? (
            <img src={passportUrl} alt="Student" className="w-full h-full object-cover" />
          ) : (
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(studentId || studentName)}`}
              alt="Student Avatar"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Term/Session Banner */}
      <div className="bg-[#00ffff] text-center py-1 mb-2 font-bold text-black border-[1.5px] border-black uppercase text-sm leading-tight tracking-wide mx-auto w-[400px]">
        {termName.toUpperCase()} RESULT
        <br />
        {sessionYear} SESSION
      </div>

      {/* Student Details */}
      <div className="border-[1.5px] border-black mb-2 text-xs font-bold uppercase flex flex-col bg-white w-full max-w-[830px]">
        <div className="border-b-[1.5px] border-black p-1.5 flex justify-center gap-6 text-center">
          <span>NAME: {studentName}</span>
          <span>ADMNO: {studentId}</span>
          <span>CLASS: {studentClass}</span>
        </div>
        <div className="p-1.5 flex justify-center gap-6 text-center">
          <span>GENDER: {studentGender}</span>
          <span>SUBJECTS TAKEN: {calculatedResults.length}</span>
          <span>
            ATTENDANCE: {attendance.daysInSchool} DAYS OUT OF {attendance.totalSchoolDays} ({attendance.attendancePercentage}%)
          </span>
        </div>
      </div>

      {/* Tables Section */}
      <div className="flex gap-2">
        {/* Main Result Table */}
        <div className="flex-[1] overflow-hidden">
          <table
            className="w-full border-collapse border-[1.5px] border-black text-[10px] text-center bg-white"
            style={{ tableLayout: "fixed" }}
          >
            <thead>
              <tr className="font-bold border-b-[1.5px] border-black leading-tight bg-gray-50/70">
                <th className="border-r-[1.5px] border-black p-1 text-left w-[120px] whitespace-normal">SUBJECT</th>
                <th className="border-r-[1.5px] border-black p-1 w-7">CA1</th>
                <th className="border-r-[1.5px] border-black p-1 w-7">CA2</th>
                <th className="border-r-[1.5px] border-black p-1 w-7">CA3</th>
                <th className="border-r-[1.5px] border-black p-1 w-7">CA4</th>
                <th className="border-r-[1.5px] border-black p-1 w-[46px]">
                  CA
                  <br />
                  TOTAL
                </th>
                <th className="border-r-[1.5px] border-black p-1 w-10">EXAM</th>
                <th className="border-r-[1.5px] border-black p-1 w-11">TOTAL</th>
                <th className="border-r-[1.5px] border-black p-1 w-12">LOWEST</th>
                <th className="border-r-[1.5px] border-black p-1 w-12">HIGHEST</th>
                <th className="border-r-[1.5px] border-black p-1 w-14">AVERAGE</th>
                <th className="border-r-[1.5px] border-black p-1 w-[52px]">POSITION</th>
                <th className="border-r-[1.5px] border-black p-1 w-10">GRADE</th>
                <th className="border-black p-1 w-12">REMARK</th>
              </tr>
            </thead>
            <tbody>
              {calculatedResults.length === 0 ? (
                <tr>
                  <td colSpan={14} className="border-b-[1.5px] border-black py-10 px-4 text-center text-slate-500 font-semibold uppercase text-xs">
                    <div className="space-y-2">
                      <p className="font-bold text-slate-800">
                        No Subject Scores Recorded Yet in Database for {studentName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Session: {sessionYear} &bull; Term: {termName} &bull; Class: {studentClass}
                      </p>
                      {onEditScores && (
                        <button
                          type="button"
                          onClick={onEditScores}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded shadow-xs print:hidden"
                        >
                          Record Scores for this Student
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                calculatedResults.map((r, i) => (
                  <tr key={i} className="border-b-[1.5px] border-black hover:bg-amber-50/30 transition-colors">
                    <td
                      className="border-r-[1.5px] border-black p-1 text-left font-semibold uppercase leading-tight truncate px-1.5"
                      title={r.name}
                    >
                      {r.name}
                    </td>
                    <td className="border-r-[1.5px] border-black p-1">{r.ca1}</td>
                    <td className="border-r-[1.5px] border-black p-1">{r.ca2}</td>
                    <td className="border-r-[1.5px] border-black p-1">{r.ca3}</td>
                    <td className="border-r-[1.5px] border-black p-1">{r.ca4}</td>
                    <td className="border-r-[1.5px] border-black p-1 bg-gray-50/50 font-medium">{r.caTotal}</td>
                    <td className="border-r-[1.5px] border-black p-1">{r.exam}</td>
                    <td className="border-r-[1.5px] border-black p-1 font-bold">{r.total}</td>
                    <td className="border-r-[1.5px] border-black p-1 text-gray-700">{r.lowest}</td>
                    <td className="border-r-[1.5px] border-black p-1 text-gray-700">{r.highest}</td>
                    <td className="border-r-[1.5px] border-black p-1 text-gray-700">{r.average}</td>
                    <td className="border-r-[1.5px] border-black p-1 font-semibold">{r.position}</td>
                    <td className="border-r-[1.5px] border-black p-1 font-bold">{r.grade}</td>
                    <td className="border-black p-1">{r.remark}</td>
                  </tr>
                ))
              )}

              {/* OVERALL TOTAL */}
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px]">
                <td className="border-r-[1.5px] border-black p-1.5 text-left bg-gray-50/50" colSpan={7}>
                  OVERALL TOTAL <span className="ml-2 font-mono text-[11px] font-black">{overallTotal}</span>
                </td>
                <td className="border-r-[1.5px] border-black p-1.5 bg-gray-50/50"></td>
                <td className="border-black p-1.5 bg-gray-50/50" colSpan={6}></td>
              </tr>

              {/* AVERAGE */}
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px]">
                <td className="border-black p-1.5 text-left bg-gray-50/50" colSpan={14}>
                  AVERAGE <span className="ml-2 font-mono text-[11px] font-black">{average}%</span>
                </td>
              </tr>

              {/* POSITION & TERM DATES */}
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px]">
                <td className="border-r-[1.5px] border-black p-1.5 text-left bg-gray-50/50" colSpan={4}>
                  POSITION <span className="ml-1 text-brand-900 font-black">{classPosition}</span>
                </td>
                <td className="border-r-[1.5px] border-black p-1.5 text-left bg-gray-50/50" colSpan={4}>
                  OUT OF <span className="ml-1 font-black">{outOfClassCount}</span>
                </td>
                <td className="border-r-[1.5px] border-black p-1.5 text-left bg-gray-50/50" colSpan={3}>
                  TERM BEGAN <span className="font-medium ml-1">{termDates.termBegan}</span>
                </td>
                <td className="border-black p-1.5 text-left bg-gray-50/50" colSpan={3}>
                  ENDED <span className="font-medium ml-1">{termDates.ended}</span>
                </td>
              </tr>

              {/* NEXT TERM BEGINS */}
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px]">
                <td className="border-black p-1.5 text-left bg-gray-50/50" colSpan={14}>
                  NEXT TERM BEGINS: <span className="font-medium ml-1">{termDates.nextTermBegins}</span>
                </td>
              </tr>

              {/* CLASS TEACHER'S REMARK */}
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px]">
                <td className="border-black p-1.5 text-left bg-gray-50/50" colSpan={14}>
                  CLASS TEACHER'S REMARK:{" "}
                  <span className="font-medium ml-1 text-slate-800">{dynamicRemarks.teacher}</span>
                </td>
              </tr>

              {/* PRINCIPAL'S REMARK */}
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px]">
                <td className="border-black p-1.5 text-left bg-gray-50/50" colSpan={14}>
                  PRINCIPAL'S REMARK:{" "}
                  <span className="font-medium ml-1 text-slate-800">{dynamicRemarks.principal}</span>
                </td>
              </tr>

              {/* PRINCIPAL'S NAME & SIGNATURE */}
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px] relative">
                <td className="border-black p-1.5 text-left h-14 align-top bg-gray-50/50" colSpan={14}>
                  PRINCIPAL'S NAME:{" "}
                  <span className="font-medium ml-1">
                    {portalSettings.principalName?.toUpperCase() || "MR. ZAGWA SAMUEL"}
                  </span>
                  {portalSettings.principalSignatureUrl && (
                    <img
                      src={portalSettings.principalSignatureUrl}
                      alt="Signature"
                      className="absolute left-[30%] bottom-1 h-12 object-contain mix-blend-multiply opacity-80"
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Side Tables */}
        <div className="w-[120px] shrink-0 flex flex-col gap-0">
          {/* Affective Development */}
          <table className="w-full border-collapse border-[1.5px] border-black text-[10px] text-center bg-white">
            <thead>
              <tr className="font-bold border-b-[1.5px] border-black bg-gray-50/50">
                <th className="border-r-[1.5px] border-black p-1 leading-tight">
                  Affective
                  <br />
                  Development
                </th>
                <th className="p-1 w-6"></th>
              </tr>
            </thead>
            <tbody className="leading-tight">
              {affectiveTraits.map((a) => (
                <tr key={a.n} className="border-b-[1.5px] border-black last:border-b-0">
                  <td className="border-r-[1.5px] border-black p-[3px] text-left pl-1 font-medium text-[9px] truncate" title={a.n}>
                    {a.n}
                  </td>
                  <td className="p-[3px] font-bold text-[9px]">{a.v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Psychomotor Skills */}
          <table className="w-full border-collapse border-l-[1.5px] border-r-[1.5px] border-b-[1.5px] border-black text-[10px] text-center bg-white mt-[-1.5px]">
            <thead>
              <tr className="font-bold border-y-[1.5px] border-black bg-gray-50/50">
                <th className="border-r-[1.5px] border-black p-1 leading-tight">
                  Psychomotor
                  <br />
                  Skills
                </th>
                <th className="p-1 w-6"></th>
              </tr>
            </thead>
            <tbody className="leading-tight">
              {psychomotorTraits.map((a) => (
                <tr key={a.n} className="border-b-[1.5px] border-black last:border-b-0">
                  <td className="border-r-[1.5px] border-black p-[3px] text-left pl-1 font-medium text-[9px] truncate" title={a.n}>
                    {a.n}
                  </td>
                  <td className="p-[3px] font-bold text-[9px]">{a.v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Attendance Record Section */}
          <table className="w-full border-collapse border-l-[1.5px] border-r-[1.5px] border-b-[1.5px] border-black text-[10px] text-center bg-white mt-[-1.5px]">
            <thead>
              <tr className="font-bold border-y-[1.5px] border-black bg-cyan-100 text-black">
                <th className="border-r-[1.5px] border-black p-1 text-left pl-1 leading-tight text-[9px]">Attendance</th>
                <th className="p-1 w-9 text-right pr-1 text-[9px]">Number</th>
              </tr>
            </thead>
            <tbody className="leading-tight text-[9px]">
              <tr className="border-b-[1.5px] border-black">
                <td className="border-r-[1.5px] border-black p-[3px] text-left pl-1">Total School Days</td>
                <td className="p-[3px] font-bold text-right pr-1">{attendance.totalSchoolDays}</td>
              </tr>
              <tr className="border-b-[1.5px] border-black">
                <td className="border-r-[1.5px] border-black p-[3px] text-left pl-1">Days Present</td>
                <td className="p-[3px] font-bold text-right pr-1 text-emerald-800">{attendance.daysPresent}</td>
              </tr>
              <tr className="border-b-[1.5px] border-black">
                <td className="border-r-[1.5px] border-black p-[3px] text-left pl-1">Days Absent</td>
                <td className="p-[3px] font-bold text-right pr-1 text-rose-800">{attendance.daysAbsent}</td>
              </tr>
              <tr className="border-b-[1.5px] border-black">
                <td className="border-r-[1.5px] border-black p-[3px] text-left pl-1">Days Late</td>
                <td className="p-[3px] font-bold text-right pr-1 text-amber-800">{attendance.daysLate}</td>
              </tr>
              <tr className="border-b-[1.5px] border-black">
                <td className="border-r-[1.5px] border-black p-[3px] text-left pl-1">Days in School</td>
                <td className="p-[3px] font-bold text-right pr-1">{attendance.daysInSchool}</td>
              </tr>
              <tr className="border-b-[1.5px] border-black">
                <td className="border-r-[1.5px] border-black p-[3px] text-left pl-1">Days Out of School</td>
                <td className="p-[3px] font-bold text-right pr-1">{attendance.daysOutSchool}</td>
              </tr>
              <tr className="bg-slate-100 font-bold">
                <td className="border-r-[1.5px] border-black p-[3px] text-left pl-1">Attendance %</td>
                <td className="p-[3px] font-bold text-right pr-1 text-emerald-800">{attendance.attendancePercentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
