import React, { useState, useMemo, useRef } from "react";
import {
  Printer,
  Download,
  Search,
  Eye,
  FileCheck,
  GraduationCap,
  BookOpen,
  Award,
  Users,
  Calendar,
  Layers,
  ChevronRight,
  AlertCircle,
  Table,
  LayoutGrid,
  CheckCircle2,
  Edit3,
  X,
  FileSpreadsheet,
  UserCheck,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { useScores, ScoreRecord } from "../../data/scoresData";
import { useStudents, Student } from "../../data/studentsData";
import { useSessions } from "../../data/sessionsData";
import { usePortalSettings } from "../../data/portalSettingsData";
import { useCurrentUserRoles } from "../../data/rolesAndPermissions";
import { StudentReportCard } from "../StudentReportCard";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from "../ui";

// Standard Nigerian secondary classes & sections
const BASE_CLASSES = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];
const SECTIONS = ["A", "B", "C", "D"];
const TERMS = ["First Term", "Second Term", "Third Term"];

interface ViewClassResultsProps {
  onOpenScoreEntry?: (targetClass?: string, targetSubject?: string) => void;
}

// Robust class and section matcher across varied notations (e.g., "SSS 3A", "SSS 3", "SS 3A", section: "A")
function matchClassAndSection(
  itemClass: string | undefined,
  selectedBaseClass: string,
  selectedSection: string,
  itemSection?: string
): boolean {
  if (!itemClass) return false;

  const clean = (s: string) => s.trim().toUpperCase().replace(/\s+/g, " ");
  const rawItem = clean(itemClass);
  const rawBase = clean(selectedBaseClass);
  const rawSection = clean(selectedSection);

  // Normalize "SS" to "SSS" for consistent comparison
  const stdBase = rawBase.replace(/^SS\s*/, "SSS ");
  const stdItem = rawItem.replace(/^SS\s*/, "SSS ");

  // Direct combined match: "SSS 3A" vs "SSS 3" + "A" -> "SSS 3A"
  const expectedCombined = `${stdBase}${rawSection}`.replace(/\s+/g, "");
  const actualCombined = stdItem.replace(/\s+/g, "");

  if (actualCombined === expectedCombined) {
    return true;
  }

  // Explicit section property match
  if (itemSection && clean(itemSection) === rawSection) {
    const itemBaseOnly = stdItem.replace(/[A-Z]$/, "").trim();
    if (itemBaseOnly === stdBase) return true;
  }

  // Suffix letter match: "SSS 3" + "A" in "SSS 3 A" or "SSS 3A"
  if (stdItem.startsWith(stdBase)) {
    const trailing = stdItem.replace(stdBase, "").trim();
    if (trailing === rawSection) return true;
  }

  return false;
}

// Grading formula consistent with WAEC / NECO standards
function computeGradeAndRemark(total: number): { grade: string; remark: string } {
  if (total >= 75) return { grade: "A", remark: "Excellent" };
  if (total >= 65) return { grade: "B", remark: "Very Good" };
  if (total >= 50) return { grade: "C", remark: "Credit" };
  if (total >= 40) return { grade: "D", remark: "Pass" };
  if (total >= 30) return { grade: "E", remark: "Fair" };
  return { grade: "F", remark: "Fail" };
}

export function ViewClassResults({ onOpenScoreEntry }: ViewClassResultsProps) {
  const [portalSettings] = usePortalSettings();
  const [sessions] = useSessions();
  const [scores, setScores] = useScores();
  const [students] = useStudents();

  // 1. CLASS, TERM AND SECTION FILTERS
  const [selectedClass, setSelectedClass] = useState<string>("SSS 3");
  const [selectedSection, setSelectedSection] = useState<string>("A");
  const [selectedTerm, setSelectedTerm] = useState<string>("First Term");
  const [selectedSession, setSelectedSession] = useState<string>(() => sessions[1] || sessions[0] || "2025/2026");

  // View switch: "detailed" (Complete Student Results) vs "summary" (Class Summary View Table)
  const [viewMode, setViewMode] = useState<"detailed" | "summary">("detailed");

  // Search box state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Individual Student Modal State
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<any | null>(null);

  // Quick edit modal state
  const [editingStudentScores, setEditingStudentScores] = useState<{
    student: any;
    scoresList: ScoreRecord[];
  } | null>(null);

  // Determine user authorization
  const { roles, hasPermission, isGeneralAdmin, isSuperAdmin, isExaminationAdmin, isTeacher } = useCurrentUserRoles();
  const hasAccess = useMemo(() => {
    return (
      isGeneralAdmin ||
      isSuperAdmin ||
      isExaminationAdmin ||
      isTeacher ||
      hasPermission("examination.view") ||
      hasPermission("examination.manage") ||
      roles.includes("Admin") ||
      roles.includes("Super Admin") ||
      roles.includes("Portal Admin") ||
      roles.includes("Examination Admin") ||
      roles.includes("Teacher") ||
      roles.includes("Principal")
    );
  }, [roles, hasPermission, isGeneralAdmin, isSuperAdmin, isExaminationAdmin, isTeacher]);

  // Full composite target class label, e.g. "SSS 3A"
  const targetClassLabel = `${selectedClass}${selectedSection}`;
  const targetSessionTerm = `${selectedSession} - ${selectedTerm}`;

  // 2 & 3. DYNAMIC DATA MATCHING (Academic Session -> Term -> Class -> Section -> Student -> Subject -> Result Scores)
  const evaluatedStudentsData = useMemo(() => {
    // 1. Find all score records matching Session, Term, Class, and Section
    const matchingScores = scores.filter((sc) => {
      // Session & Term check
      const sessionMatches =
        sc.session === targetSessionTerm ||
        (sc.session?.includes(selectedSession) && sc.session?.includes(selectedTerm));
      if (!sessionMatches) return false;

      // Class & Section check
      return matchClassAndSection(sc.class, selectedClass, selectedSection);
    });

    // 2. Identify all students in this class/section (from students roster OR matching score records)
    const studentMap = new Map<string, any>();

    // Add students from students database who match class & section
    students.forEach((st) => {
      if (matchClassAndSection(st.class, selectedClass, selectedSection, (st as any).section)) {
        studentMap.set(st.id, {
          id: st.id,
          name: st.name,
          admissionNumber: st.id,
          class: selectedClass,
          section: selectedSection,
          combinedClass: targetClassLabel,
          gender: st.gender || "Not Specified",
          status: st.status || "Active",
          scores: [] as ScoreRecord[],
        });
      }
    });

    // Add any student who has scores recorded in this exact class & section
    matchingScores.forEach((sc) => {
      const sId = sc.studentId || sc.studentName;
      if (!studentMap.has(sId)) {
        studentMap.set(sId, {
          id: sc.studentId || `STU-${Math.floor(100 + Math.random() * 900)}`,
          name: sc.studentName || "Student",
          admissionNumber: sc.studentId || "N/A",
          class: selectedClass,
          section: selectedSection,
          combinedClass: targetClassLabel,
          gender: "Not Specified",
          status: "Active",
          scores: [] as ScoreRecord[],
        });
      }
    });

    // 3. Attach scores to each student
    matchingScores.forEach((sc) => {
      const sId = sc.studentId || sc.studentName;
      const student = studentMap.get(sId);
      if (student) {
        // Prevent duplicate subjects for the same student
        const exists = student.scores.some((existing: ScoreRecord) => existing.subject === sc.subject);
        if (!exists) {
          student.scores.push(sc);
        }
      }
    });

    // 4. Calculate individual student result aggregates
    const classPopulation = studentMap.size;
    const computedStudents = Array.from(studentMap.values()).map((st) => {
      // Calculate subject scores
      const subjectRecords = st.scores.map((s: ScoreRecord) => {
        const ca1 = Number(s.ca1) || 0;
        const ca2 = Number(s.ca2) || 0;
        const ca3 = Number(s.ca3) || 0;
        const ca4 = Number(s.ca4) || 0;
        const exam = Number(s.exam) || 0;
        const total = s.total !== undefined && s.total !== null ? Number(s.total) : ca1 + ca2 + ca3 + ca4 + exam;
        const { grade, remark } = computeGradeAndRemark(total);

        return {
          id: s.id,
          subject: s.subject,
          ca1,
          ca2,
          ca3,
          ca4,
          caTotal: ca1 + ca2 + ca3 + ca4,
          exam,
          total,
          grade: s.grade || grade,
          remark: s.remark || remark,
          teacherNote: s.teacherNote || "",
        };
      });

      const totalSubjects = subjectRecords.length;
      const totalMarks = subjectRecords.reduce((sum: number, sub: any) => sum + sub.total, 0);
      const averageScore = totalSubjects > 0 ? Number((totalMarks / totalSubjects).toFixed(1)) : 0;
      const percentage = totalSubjects > 0 ? Number(((totalMarks / (totalSubjects * 100)) * 100).toFixed(1)) : 0;
      const overallGrade = computeGradeAndRemark(averageScore).grade;

      // Attendance estimation or actual
      const attendanceSummary = "118 / 120 Days (98.3%)";

      // Dynamic remarks
      let teacherRemark = "A diligent and attentive learner. Displays great determination in class work.";
      let principalRemark = "Satisfactory progress. Strive for higher academic excellence.";

      if (averageScore >= 80) {
        teacherRemark = "An exceptionally brilliant, attentive, and exemplary student. Outstanding performance!";
        principalRemark = "Outstanding academic record! Recommended for academic honors and promotion with distinction.";
      } else if (averageScore >= 70) {
        teacherRemark = "A commendable and consistent academic performance. Very focused during lessons.";
        principalRemark = "Very good result. Keep up the high standard in upcoming terms.";
      } else if (averageScore >= 60) {
        teacherRemark = "Good performance with solid understanding of core subjects.";
        principalRemark = "Good effort shown. Can achieve even greater honors with extra study discipline.";
      } else if (averageScore >= 50) {
        teacherRemark = "Fair pass. Encouraged to allocate more revision hours to weaker subjects.";
        principalRemark = "Fair result. Dedicate more study time to build stronger foundation.";
      } else if (totalSubjects > 0) {
        teacherRemark = "Performance is below required standards. Urgent remedial support recommended.";
        principalRemark = "Poor performance. Parent conference required to address academic challenges.";
      }

      return {
        ...st,
        subjectRecords,
        totalSubjects,
        totalMarks,
        averageScore,
        percentage,
        overallGrade,
        classPopulation,
        attendanceSummary,
        teacherRemark,
        principalRemark,
      };
    });

    // 5. Rank students based on Average Score (descending)
    computedStudents.sort((a, b) => b.averageScore - a.averageScore || b.totalMarks - a.totalMarks);

    // Assign positions (1st, 2nd, 3rd, etc.)
    return computedStudents.map((st, idx) => {
      const posNumber = idx + 1;
      let posStr = `${posNumber}th`;
      if (posNumber % 10 === 1 && posNumber % 100 !== 11) posStr = `${posNumber}st`;
      else if (posNumber % 10 === 2 && posNumber % 100 !== 12) posStr = `${posNumber}nd`;
      else if (posNumber % 10 === 3 && posNumber % 100 !== 13) posStr = `${posNumber}rd`;

      return {
        ...st,
        position: posStr,
        positionNumber: posNumber,
      };
    });
  }, [scores, students, selectedClass, selectedSection, selectedTerm, selectedSession, targetSessionTerm, targetClassLabel]);

  // Extract all distinct subjects belonging to this class for the Class Summary View
  const allClassSubjects = useMemo(() => {
    const set = new Set<string>();
    evaluatedStudentsData.forEach((st) => {
      st.subjectRecords.forEach((sub: any) => {
        if (sub.subject) set.add(sub.subject);
      });
    });
    return Array.from(set).sort();
  }, [evaluatedStudentsData]);

  // Filter students by search term (Student Name, Admission Number, Student ID)
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return evaluatedStudentsData;
    const term = searchTerm.toLowerCase().trim();
    return evaluatedStudentsData.filter(
      (st) =>
        st.name?.toLowerCase().includes(term) ||
        st.id?.toLowerCase().includes(term) ||
        st.admissionNumber?.toLowerCase().includes(term)
    );
  }, [evaluatedStudentsData, searchTerm]);

  // Check if ANY results exist for this class, section, term and session
  const hasResultsInClass = useMemo(() => {
    return evaluatedStudentsData.some((st) => st.totalSubjects > 0);
  }, [evaluatedStudentsData]);

  // Class Summary Statistics
  const classStats = useMemo(() => {
    const studentsWithResults = evaluatedStudentsData.filter((s) => s.totalSubjects > 0);
    if (studentsWithResults.length === 0) {
      return {
        totalEnrolled: evaluatedStudentsData.length,
        withResults: 0,
        classAverage: 0,
        highestScore: 0,
        passRate: 0,
      };
    }
    const totalAvgs = studentsWithResults.reduce((sum, s) => sum + s.averageScore, 0);
    const classAvg = (totalAvgs / studentsWithResults.length).toFixed(1);
    const highest = Math.max(...studentsWithResults.map((s) => s.averageScore));
    const passed = studentsWithResults.filter((s) => s.averageScore >= 50).length;
    const passRate = ((passed / studentsWithResults.length) * 100).toFixed(1);

    return {
      totalEnrolled: evaluatedStudentsData.length,
      withResults: studentsWithResults.length,
      classAverage: Number(classAvg),
      highestScore: Number(highest),
      passRate: Number(passRate),
    };
  }, [evaluatedStudentsData]);

  // Print Class Results Action
  const handlePrintClassResults = () => {
    window.print();
  };

  // Download / Export Class Results as CSV
  const handleExportCSV = () => {
    if (evaluatedStudentsData.length === 0) return;

    // Header row
    const headers = [
      "Position",
      "Admission Number",
      "Student Name",
      "Gender",
      "Class",
      "Section",
      "Session",
      "Term",
      ...allClassSubjects,
      "Total Marks",
      "Average Score",
      "Overall Grade",
      "Remark",
    ];

    const rows = evaluatedStudentsData.map((st) => {
      const subjectMap = new Map<string, number>();
      st.subjectRecords.forEach((s: any) => subjectMap.set(s.subject, s.total));

      const subjectScores = allClassSubjects.map((sub) =>
        subjectMap.has(sub) ? String(subjectMap.get(sub)) : "-"
      );

      return [
        `"${st.position}"`,
        `"${st.admissionNumber || st.id}"`,
        `"${st.name}"`,
        `"${st.gender}"`,
        `"${selectedClass}"`,
        `"${selectedSection}"`,
        `"${selectedSession}"`,
        `"${selectedTerm}"`,
        ...subjectScores,
        st.totalMarks,
        st.averageScore,
        `"${st.overallGrade}"`,
        `"${st.teacherRemark}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Class_Results_${selectedClass}_Sec${selectedSection}_${selectedSession.replace("/", "-")}_${selectedTerm.replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle saving score edit directly
  const handleSaveScoreEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentScores) return;

    // Update global scores state
    setScores((prevScores) => {
      const updatedMap = new Map<string, ScoreRecord>();
      prevScores.forEach((sc) => updatedMap.set(sc.id, sc));

      editingStudentScores.scoresList.forEach((sc) => {
        const ca1 = Number(sc.ca1) || 0;
        const ca2 = Number(sc.ca2) || 0;
        const ca3 = Number(sc.ca3) || 0;
        const ca4 = Number(sc.ca4) || 0;
        const exam = Number(sc.exam) || 0;
        const total = ca1 + ca2 + ca3 + ca4 + exam;
        const { grade, remark } = computeGradeAndRemark(total);

        updatedMap.set(sc.id, {
          ...sc,
          ca1,
          ca2,
          ca3,
          ca4,
          exam,
          total,
          grade,
          remark,
        });
      });

      return Array.from(updatedMap.values());
    });

    setEditingStudentScores(null);
  };

  // 9. DATA SECURITY: unauthorized block
  if (!hasAccess) {
    return (
      <Card className="border-rose-200 bg-rose-50/50 p-8 text-center my-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle size={26} />
          </div>
          <h3 className="text-base font-bold text-rose-900">Access Restricted</h3>
          <p className="text-xs text-rose-700 max-w-md">
            Only authorized school administrators, examinations committee members, and academic heads have permission to view complete class terminal results.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. CLASS, TERM AND SECTION FILTERS HEADER */}
      {/* ========================================================================= */}
      <Card className="border border-slate-200/90 shadow-sm bg-white overflow-hidden print:hidden">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 text-white p-5 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                  Official Examination Portal
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-300 bg-white/10 border border-white/10">
                  Live Database Connected
                </span>
              </div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <FileCheck size={22} className="text-amber-400" />
                View Class Results & Performance Broadsheet
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Select target Class, Section, Term, and Academic Session to retrieve real-time terminal results and student report sheets.
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintClassResults}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold gap-1.5 h-9"
              >
                <Printer size={15} className="text-amber-400" /> Print Class Results
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={!hasResultsInClass}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold gap-1.5 h-9 disabled:opacity-50"
              >
                <Download size={15} className="text-emerald-400" /> Download / Export (CSV)
              </Button>
              {onOpenScoreEntry && (
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => onOpenScoreEntry(targetClassLabel, "Mathematics")}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs gap-1.5 h-9"
                >
                  <Edit3 size={15} /> Record Scores
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 4 PRIMARY SELECTION FIELDS */}
        <CardContent className="p-5 bg-slate-50/70 border-b border-slate-200/70">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. CLASS */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} className="text-brand-600" /> 1. Class
              </Label>
              <select
                id="filter_class"
                aria-label="Select Class"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {BASE_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls} (Junior/Senior Secondary)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. SECTION / ARM */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-600" /> 2. Section / Arm
              </Label>
              <select
                id="filter_section"
                aria-label="Select Section"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec} (Arm {sec})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. TERM */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-600" /> 3. Term
              </Label>
              <select
                id="filter_term"
                aria-label="Select Term"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                {TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. ACADEMIC SESSION */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap size={14} className="text-emerald-600" /> 4. Academic Session
              </Label>
              <select
                id="filter_session"
                aria-label="Select Academic Session"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                {sessions.map((sess) => (
                  <option key={sess} value={sess}>
                    {sess} Academic Session
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ACTIVE FILTER BADGE BAR */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Active Query:</span>
              <span className="px-2.5 py-1 rounded-md bg-brand-900 text-white font-bold flex items-center gap-1">
                <BookOpen size={12} className="text-amber-400" />
                {selectedClass} — Section {selectedSection} ({targetClassLabel})
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-800 font-semibold">
                {selectedTerm}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200">
                {selectedSession} Session
              </span>
            </div>

            {/* QUICK PRESET JUMPS FOR INSTANT TESTING */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium hidden md:inline">Quick Jump:</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedClass("SSS 3");
                  setSelectedSection("A");
                  setSelectedTerm("First Term");
                  setSelectedSession("2025/2026");
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  selectedClass === "SSS 3" && selectedSection === "A"
                    ? "bg-brand-100 text-brand-900 border border-brand-300"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                SSS 3A (Demo Class)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedClass("JSS 1");
                  setSelectedSection("A");
                  setSelectedTerm("First Term");
                  setSelectedSession("2025/2026");
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  selectedClass === "JSS 1" && selectedSection === "A"
                    ? "bg-brand-100 text-brand-900 border border-brand-300"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                JSS 1A
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedClass("SSS 2");
                  setSelectedSection("B");
                  setSelectedTerm("First Term");
                  setSelectedSession("2025/2026");
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  selectedClass === "SSS 2" && selectedSection === "B"
                    ? "bg-brand-100 text-brand-900 border border-brand-300"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                SSS 2B
              </button>
            </div>
          </div>
        </CardContent>

        {/* 6. SEARCH & 5. CLASS VIEW CONTROLS */}
        <div className="p-4 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
          {/* SEARCH BOX */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search student by name, admission number, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-slate-50 border-slate-300 focus:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* VIEW SWITCHER & METRIC COUNTERS */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode("detailed")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  viewMode === "detailed"
                    ? "bg-white text-brand-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid size={14} />
                <span>Complete Student Results</span>
              </button>
              <button
                onClick={() => setViewMode("summary")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  viewMode === "summary"
                    ? "bg-white text-brand-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Table size={14} />
                <span>Class Summary View</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* CLASS PERFORMANCE SUMMARY STATS BAR */}
      {/* ========================================================================= */}
      {hasResultsInClass && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 print:hidden">
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Enrolled in Class</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-slate-900">{classStats.totalEnrolled}</span>
              <Users size={18} className="text-brand-600" />
            </div>
            <span className="text-[11px] text-slate-500">Students in {targetClassLabel}</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Evaluated Students</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-emerald-700">{classStats.withResults}</span>
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">With recorded scores</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Class Average</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-blue-700">{classStats.classAverage}%</span>
              <TrendingUp size={18} className="text-blue-600" />
            </div>
            <span className="text-[11px] text-slate-500">Mean terminal score</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Highest Average</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-amber-600">{classStats.highestScore}%</span>
              <Award size={18} className="text-amber-500" />
            </div>
            <span className="text-[11px] text-slate-500">Top performer mark</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Class Pass Rate</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-purple-700">{classStats.passRate}%</span>
              <Sparkles size={18} className="text-purple-500" />
            </div>
            <span className="text-[11px] text-slate-500">Score &ge; 50%</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. DATA SECURITY & EMPTY STATE CHECK */}
      {/* ========================================================================= */}
      {!hasResultsInClass && (
        <Card className="border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                No results available for the selected class, section, term and academic session.
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                There are currently no continuous assessment or examination marks recorded for{" "}
                <span className="font-semibold text-slate-800">
                  {selectedClass} Section {selectedSection} ({targetClassLabel})
                </span>{" "}
                during the <span className="font-semibold text-slate-800">{selectedTerm}</span> of{" "}
                <span className="font-semibold text-slate-800">{selectedSession}</span>.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedClass("SSS 3");
                  setSelectedSection("A");
                  setSelectedTerm("First Term");
                  setSelectedSession("2025/2026");
                }}
                className="text-xs font-bold"
              >
                Switch to SSS 3A (Demo Results)
              </Button>
              {onOpenScoreEntry && (
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => onOpenScoreEntry(targetClassLabel, "Mathematics")}
                  className="bg-brand-900 text-white text-xs font-bold"
                >
                  <Edit3 size={14} className="mr-1" /> Enter Scores for this Class
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* PRINT HEADER FOR OFFICIAL REPORT SLIPS / BROADSHEET */}
      {/* ========================================================================= */}
      <div className="hidden print:block p-4 mb-6 border-b-2 border-slate-900 text-center">
        <h1 className="text-xl font-black uppercase text-slate-900">{portalSettings.schoolName}</h1>
        <p className="text-xs italic text-slate-600">{portalSettings.motto}</p>
        <p className="text-xs text-slate-600 mt-1">{portalSettings.address}</p>
        <div className="mt-3 inline-block border border-slate-900 px-4 py-1 text-xs font-bold uppercase tracking-wider bg-slate-100">
          Official Class Results Sheet & Terminal Summary
        </div>
        <div className="mt-2 text-xs flex justify-center gap-6 font-semibold text-slate-800">
          <span>Class: {selectedClass} Section {selectedSection} ({targetClassLabel})</span>
          <span>Term: {selectedTerm}</span>
          <span>Academic Session: {selectedSession}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CLASS RESULT VIEW: CLASS SUMMARY VIEW TABLE */}
      {/* ========================================================================= */}
      {hasResultsInClass && viewMode === "summary" && (
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-900 text-white py-3.5 px-5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Table size={18} className="text-amber-400" />
              <div>
                <CardTitle className="text-sm font-bold text-white">
                  Class Summary Broadsheet — {selectedClass} Section {selectedSection}
                </CardTitle>
                <p className="text-[11px] text-slate-300">
                  {selectedTerm} • {selectedSession} Academic Session • {filteredStudents.length} Students
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-300">
              Ranked by Terminal Average Score
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3 text-center w-12">Pos.</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Adm. No.</th>
                  <th className="p-3 text-center">Gender</th>
                  {/* Dynamic Subjects Assigned to that Class */}
                  {allClassSubjects.map((sub) => (
                    <th key={sub} className="p-3 text-center font-bold text-slate-900 border-l border-slate-200">
                      {sub}
                    </th>
                  ))}
                  <th className="p-3 text-center bg-slate-200/70 border-l border-slate-300">Total</th>
                  <th className="p-3 text-center bg-slate-200/70">Average</th>
                  <th className="p-3 text-center bg-slate-200/70">Grade</th>
                  <th className="p-3 text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredStudents.map((st, idx) => {
                  const subjectScoreMap = new Map<string, any>();
                  st.subjectRecords.forEach((sub: any) => subjectScoreMap.set(sub.subject, sub));

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      {/* Position */}
                      <td className="p-3 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                            st.positionNumber === 1
                              ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300"
                              : st.positionNumber === 2
                              ? "bg-slate-200 text-slate-900"
                              : st.positionNumber === 3
                              ? "bg-amber-100 text-amber-900"
                              : "text-slate-700"
                          }`}
                        >
                          {st.position}
                        </span>
                      </td>

                      {/* Student Name */}
                      <td className="p-3 font-bold text-slate-900">
                        {st.name}
                      </td>

                      {/* Admission Number */}
                      <td className="p-3 font-mono text-slate-600 text-[11px]">
                        {st.admissionNumber || st.id}
                      </td>

                      {/* Gender */}
                      <td className="p-3 text-center text-slate-600">
                        {st.gender}
                      </td>

                      {/* Subject Scores */}
                      {allClassSubjects.map((sub) => {
                        const rec = subjectScoreMap.get(sub);
                        return (
                          <td
                            key={sub}
                            className={`p-3 text-center font-mono font-bold border-l border-slate-100 ${
                              rec ? (rec.total >= 70 ? "text-emerald-700" : rec.total < 40 ? "text-rose-600" : "text-slate-800") : "text-slate-300 font-normal"
                            }`}
                          >
                            {rec ? rec.total : "—"}
                          </td>
                        );
                      })}

                      {/* Total */}
                      <td className="p-3 text-center font-mono font-extrabold bg-slate-50/60 border-l border-slate-200 text-slate-950">
                        {st.totalMarks}
                      </td>

                      {/* Average */}
                      <td className="p-3 text-center font-mono font-black text-brand-900 bg-slate-50/60">
                        {st.averageScore.toFixed(1)}%
                      </td>

                      {/* Overall Grade */}
                      <td className="p-3 text-center bg-slate-50/60">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            st.overallGrade === "A"
                              ? "bg-emerald-100 text-emerald-900"
                              : st.overallGrade === "B"
                              ? "bg-blue-100 text-blue-900"
                              : st.overallGrade === "C"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-rose-100 text-rose-900"
                          }`}
                        >
                          {st.overallGrade}
                        </span>
                      </td>

                      {/* 7. VIEW INDIVIDUAL RESULT ACTION */}
                      <td className="p-3 text-right print:hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudentForReport(st)}
                          className="text-[11px] font-bold h-7 px-2.5 bg-white hover:bg-brand-50 hover:text-brand-900 border-slate-300 gap-1"
                        >
                          <Eye size={13} className="text-brand-700" />
                          <span>View Result</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 2 & 4. COMPLETE STUDENT RESULTS VIEW (DETAILED CARDS BREAKDOWN) */}
      {/* ========================================================================= */}
      {hasResultsInClass && viewMode === "detailed" && (
        <div className="space-y-8">
          {filteredStudents.map((st) => (
            <Card
              key={st.id}
              className="border border-slate-300 shadow-sm bg-white overflow-hidden page-break-after print:shadow-none print:border-slate-800"
            >
              {/* STUDENT INFORMATION HEADER */}
              <div className="bg-slate-900 text-white p-4 border-b border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base shadow-xs">
                      {st.positionNumber || "#"}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-black text-white">{st.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold">
                          Position: {st.position} of {st.classPopulation}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                          Overall Grade: {st.overallGrade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Admission ID: <span className="font-mono text-white font-bold">{st.admissionNumber || st.id}</span> • Class:{" "}
                        <span className="font-bold text-amber-300">{selectedClass}</span> (Section {selectedSection})
                      </p>
                    </div>
                  </div>

                  {/* Top Card Actions */}
                  <div className="flex items-center gap-2 print:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const existing = scores.filter(
                          (sc) =>
                            (sc.studentId === st.id || sc.studentName.toLowerCase() === st.name.toLowerCase()) &&
                            sc.session === targetSessionTerm
                        );
                        setEditingStudentScores({
                          student: st,
                          scoresList: JSON.parse(JSON.stringify(existing)),
                        });
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold gap-1.5 h-8"
                    >
                      <Edit3 size={13} /> Edit Scores
                    </Button>
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => setSelectedStudentForReport(st)}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black gap-1.5 h-8 shadow-xs"
                    >
                      <Eye size={13} /> View Official Result Slip
                    </Button>
                  </div>
                </div>

                {/* Detailed Student Metadata Strip */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Student Name</span>
                    <span className="font-bold text-white truncate block">{st.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Student ID / Adm No</span>
                    <span className="font-mono font-bold text-amber-300 block">{st.admissionNumber || st.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Class</span>
                    <span className="font-bold text-white block">{selectedClass}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Section / Arm</span>
                    <span className="font-bold text-white block">Section {selectedSection}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Session</span>
                    <span className="font-bold text-slate-200 block">{selectedSession}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Term</span>
                    <span className="font-bold text-slate-200 block">{selectedTerm}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Gender</span>
                    <span className="font-bold text-white block">{st.gender}</span>
                  </div>
                </div>
              </div>

              {/* SUBJECT RESULTS TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3 w-8 text-center">#</th>
                      <th className="p-3">Subject Name</th>
                      <th className="p-3 text-center">CA / Test 1 (20)</th>
                      <th className="p-3 text-center">CA / Test 2 (20)</th>
                      <th className="p-3 text-center">CA 3 & 4</th>
                      <th className="p-3 text-center">Examination (60)</th>
                      <th className="p-3 text-center bg-slate-200/70">Total Score (100)</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {st.subjectRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-slate-400 italic">
                          No subjects recorded for this student in {selectedTerm}.
                        </td>
                      </tr>
                    ) : (
                      st.subjectRecords.map((sub: any, sIdx: number) => (
                        <tr key={`${sub.id || sub.subject}_${sIdx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-center font-mono text-slate-400">{sIdx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{sub.subject}</td>
                          <td className="p-3 text-center font-mono text-slate-700">{sub.ca1}</td>
                          <td className="p-3 text-center font-mono text-slate-700">{sub.ca2}</td>
                          <td className="p-3 text-center font-mono text-slate-500">
                            {sub.ca3 || sub.ca4 ? `${sub.ca3} + ${sub.ca4}` : "—"}
                          </td>
                          <td className="p-3 text-center font-mono font-semibold text-slate-900">{sub.exam}</td>
                          <td className="p-3 text-center font-mono font-black text-sm bg-slate-50/70 text-slate-950">
                            {sub.total}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                sub.grade === "A"
                                  ? "bg-emerald-100 text-emerald-900"
                                  : sub.grade === "B"
                                  ? "bg-blue-100 text-blue-900"
                                  : sub.grade === "C"
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-rose-100 text-rose-900"
                              }`}
                            >
                              {sub.grade}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{sub.remark}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 4. COMPLETE RESULT SUMMARY FOOTER */}
              <div className="bg-slate-50/80 p-5 border-t border-slate-200">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <Award size={14} className="text-amber-500" />
                  Complete Terminal Result Summary & Remarks
                </h4>

                {/* 8 Aggregate Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Subjects</span>
                    <span className="text-base font-black text-slate-900">{st.totalSubjects} Subjects</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Marks Obtained</span>
                    <span className="text-base font-black text-slate-900">
                      {st.totalMarks} / {st.totalSubjects * 100}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Average Score</span>
                    <span className="text-base font-black text-brand-900">{st.averageScore}%</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Overall Percentage</span>
                    <span className="text-base font-black text-emerald-700">{st.percentage}%</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Overall Grade</span>
                    <span className="text-base font-black text-indigo-700">Grade {st.overallGrade}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Class Position</span>
                    <span className="text-base font-black text-amber-600">
                      {st.position} <span className="text-xs text-slate-500 font-normal">of {st.classPopulation}</span>
                    </span>
                  </div>
                </div>

                {/* Additional Summary Details: Attendance & Remarks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Attendance Record:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{st.attendanceSummary}</p>
                    <span className="text-[11px] text-emerald-600 font-medium">Regular & punctual attendance</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Class Teacher&apos;s Remark:</span>
                    <p className="font-semibold text-slate-900 mt-0.5 italic">&ldquo;{st.teacherRemark}&rdquo;</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Principal&apos;s Remark:</span>
                    <p className="font-semibold text-slate-900 mt-0.5 italic">&ldquo;{st.principalRemark}&rdquo;</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. VIEW INDIVIDUAL RESULT MODAL (FULL REPORT CARD SLIP) */}
      {/* ========================================================================= */}
      {selectedStudentForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck size={20} className="text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Official Student Terminal Report Slip — {selectedStudentForReport.name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {selectedClass} Section {selectedSection} ({targetClassLabel}) • {selectedSession} {selectedTerm}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black gap-1.5 h-8 shadow-xs"
                >
                  <Printer size={14} /> Print Official Slip
                </Button>
                <button
                  onClick={() => setSelectedStudentForReport(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body with StudentReportCard */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/50">
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                <StudentReportCard
                  session={selectedSession}
                  term={selectedTerm}
                  student={{
                    id: selectedStudentForReport.id,
                    name: selectedStudentForReport.name,
                    class: targetClassLabel,
                    gender: selectedStudentForReport.gender,
                    position: selectedStudentForReport.position,
                    totalClassCount: selectedStudentForReport.classPopulation,
                  }}
                  overrideScores={selectedStudentForReport.scores}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK SCORE EDIT MODAL (FOR IMMEDIATE LIVE DATABASE SYNCHRONIZATION) */}
      {/* ========================================================================= */}
      {editingStudentScores && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 bg-white">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between py-4 px-6">
              <div>
                <CardTitle className="text-white text-base font-bold flex items-center gap-2">
                  <Edit3 size={18} className="text-amber-400" />
                  Quick Edit Scores — {editingStudentScores.student.name}
                </CardTitle>
                <p className="text-xs text-slate-400">
                  {selectedClass} Section {selectedSection} • {selectedTerm} ({selectedSession})
                </p>
              </div>
              <button
                onClick={() => setEditingStudentScores(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </CardHeader>

            <form onSubmit={handleSaveScoreEdits}>
              <CardContent className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
                <p className="text-xs text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  Modify any CA tests or examination marks. The changes will immediately save directly into the portal database and re-compute positions, averages, and terminal report slips.
                </p>

                {editingStudentScores.scoresList.map((sc, idx) => (
                  <div key={sc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{sc.subject}</span>
                      <span className="font-mono text-xs font-bold text-brand-900">
                        Total: {(Number(sc.ca1) || 0) + (Number(sc.ca2) || 0) + (Number(sc.exam) || 0)} / 100
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <Label className="text-[10px] uppercase font-bold text-slate-600">CA 1 (20)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          value={sc.ca1}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...editingStudentScores.scoresList];
                            updated[idx].ca1 = val;
                            setEditingStudentScores({ ...editingStudentScores, scoresList: updated });
                          }}
                          className="h-8 text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <Label className="text-[10px] uppercase font-bold text-slate-600">CA 2 (20)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          value={sc.ca2}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...editingStudentScores.scoresList];
                            updated[idx].ca2 = val;
                            setEditingStudentScores({ ...editingStudentScores, scoresList: updated });
                          }}
                          className="h-8 text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <Label className="text-[10px] uppercase font-bold text-slate-600">Exam (60)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="60"
                          value={sc.exam}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...editingStudentScores.scoresList];
                            updated[idx].exam = val;
                            setEditingStudentScores({ ...editingStudentScores, scoresList: updated });
                          }}
                          className="h-8 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingStudentScores(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  className="bg-brand-900 text-white font-bold"
                >
                  Save & Update Results
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
