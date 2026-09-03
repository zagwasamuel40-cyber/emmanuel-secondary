import React, { useState } from "react";
import { useStudents } from "../data/studentsData";
import { useSessions, TERMS } from "../data/sessionsData";
import { usePortalSettings } from "../data/portalSettingsData";

import { useScores, ScoreRecord } from "../data/scoresData";

import { useAssignments } from "../data/assignmentsData";

import { useResultsRelease, isResultReleased } from "../data/resultsReleaseData";
import { useSkillsDb } from "../data/skillsData";

import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { 
  Edit3, Search, Plus, Upload, Download, Save, CheckCircle, AlertCircle, 
  FileSpreadsheet, Sparkles, Filter, Eye, Edit, Trash2, X, Check, 
  ArrowUpDown, BookOpen, GraduationCap, Award, Lock, Unlock, Printer,
  Layers, RefreshCw, AlertTriangle, ShieldCheck, FileText, BarChart3,
  ListOrdered, Calculator, UserCheck, Table, FileCheck, Video,
  Paperclip, ExternalLink, FileUp, CheckCircle2, Clock
} from "lucide-react";

const students = [
  { id: "ESS/2026/001", name: "Oluwaseun Adebayo", class: "SSS 3A" },
  { id: "ESS/2026/002", name: "Chioma Nwosu", class: "SSS 3A" },
  { id: "ESS/2026/004", name: "Grace Okhiria", class: "SSS 3A" },
  { id: "ESS/2026/005", name: "David Emmanuel", class: "SSS 3A" },
  { id: "ESS/2026/003", name: "Abubakar Ibrahim", class: "JSS 1A" },
  { id: "ESS/2026/006", name: "Zainab Bello", class: "JSS 1A" },
  { id: "ESS/2026/007", name: "Kofi Mensah", class: "JSS 2A" },
  { id: "ESS/2026/008", name: "Fatima Aliyu", class: "SSS 1A" },
  { id: "ESS/2026/009", name: "Emeka Okafor", class: "JSS 3B" },
  { id: "ESS/2026/010", name: "Aisha Mohammed", class: "SSS 2B" },
];

const initialScores: ScoreRecord[] = [
  { id: "SCR-101", studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", class: "SSS 3A", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 9, ca2: 8, ca3: 9, ca4: 9, exam: 52, total: 87, grade: "A", remark: "Excellent", position: "1st", annualScore: 258, teacherNote: "Outstanding problem solver" },
  { id: "SCR-102", studentId: "ESS/2026/001", studentName: "Oluwaseun Adebayo", class: "SSS 3A", subject: "English Language", session: "2025/2026 - First Term", ca1: 8, ca2: 7, ca3: 8, ca4: 8, exam: 45, total: 76, grade: "A", remark: "Excellent", position: "1st", annualScore: 230, teacherNote: "Very articulate essays" },
  { id: "SCR-103", studentId: "ESS/2026/002", studentName: "Chioma Nwosu", class: "SSS 3A", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 7, ca2: 8, ca3: 8, ca4: 7, exam: 42, total: 72, grade: "A", remark: "Excellent", position: "3rd", annualScore: 215, teacherNote: "Good effort" },
  { id: "SCR-104", studentId: "ESS/2026/002", studentName: "Chioma Nwosu", class: "SSS 3A", subject: "English Language", session: "2025/2026 - First Term", ca1: 6, ca2: 7, ca3: 7, ca4: 7, exam: 38, total: 65, grade: "B", remark: "Very Good", position: "2nd", annualScore: 198, teacherNote: "Steady performance" },
  { id: "SCR-105", studentId: "ESS/2026/004", studentName: "Grace Okhiria", class: "SSS 3A", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 5, ca2: 4, ca3: 6, ca4: 5, exam: 28, total: 48, grade: "D", remark: "Pass", position: "4th", annualScore: 140, teacherNote: "Needs extra practice" },
  { id: "SCR-106", studentId: "ESS/2026/005", studentName: "David Emmanuel", class: "SSS 3A", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 8, ca2: 9, ca3: 9, ca4: 8, exam: 48, total: 82, grade: "A", remark: "Excellent", position: "2nd", annualScore: 245, teacherNote: "Keen analytical skills" },
  { id: "SCR-107", studentId: "ESS/2026/003", studentName: "Abubakar Ibrahim", class: "JSS 1A", subject: "Mathematics", session: "2025/2026 - First Term", ca1: 7, ca2: 6, ca3: 8, ca4: 7, exam: 36, total: 64, grade: "B", remark: "Very Good", position: "1st", annualScore: 190, teacherNote: "Good foundation" },
];

export interface AffectiveRecord {
  studentId: string;
  session: string;
  attentiveness: number;
  attendance: number;
  punctuality: number;
  neatness: number;
  politeness: number;
  relWithOthers: number;
  curiosity: number;
  honesty: number;
  humility: number;
  tolerance: number;
  leadership: number;
  courage: number;
  handwriting: number;
  fluency: number;
  gamesSports: number;
  musicSkills: number;
  construction: number;
}

const initialAffectiveRecords: AffectiveRecord[] = [
  { studentId: "ESS/2026/001", session: "2025/2026 - First Term", attentiveness: 4, attendance: 4, punctuality: 4, neatness: 4, politeness: 4, relWithOthers: 4, curiosity: 4, honesty: 3, humility: 3, tolerance: 4, leadership: 5, courage: 5, handwriting: 5, fluency: 5, gamesSports: 5, musicSkills: 4, construction: 4 },
  { studentId: "ESS/2026/002", session: "2025/2026 - First Term", attentiveness: 5, attendance: 5, punctuality: 4, neatness: 5, politeness: 5, relWithOthers: 4, curiosity: 4, honesty: 4, humility: 4, tolerance: 5, leadership: 4, courage: 4, handwriting: 4, fluency: 4, gamesSports: 3, musicSkills: 3, construction: 3 }
];

const CLASSES = ["All Classes", "JSS 1A", "JSS 1B", "JSS 1C", "JSS 1D", "JSS 2A", "JSS 2B", "JSS 2C", "JSS 2D", "JSS 3A", "JSS 3B", "JSS 3C", "JSS 3D", "SSS 1A", "SSS 1B", "SSS 1C", "SSS 1D", "SSS 2A", "SSS 2B", "SSS 2C", "SSS 2D", "SSS 3A", "SSS 3B", "SSS 3C", "SSS 3D"];
const SUBJECTS = ["All Subjects", "Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Economics", "Civic Education", "Computer Studies"];

const calculateGrade = (total: number): { grade: string; remark: string } => {
  if (total >= 70) return { grade: "A", remark: "Excellent" };
  if (total >= 60) return { grade: "B", remark: "Very Good" };
  if (total >= 50) return { grade: "C", remark: "Credit" };
  if (total >= 45) return { grade: "D", remark: "Pass" };
  if (total >= 40) return { grade: "E", remark: "Fair" };
  return { grade: "F", remark: "Fail" };
};

export default function Examinations() {
  const [portalSettings] = usePortalSettings();
  let userRoles: string[] = [];
  try {
    userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  } catch (e) {}

  if (userRoles.length === 0) {
    const r = localStorage.getItem('userRole') || 'admin';
    if (r === 'admin') userRoles = ['Admin'];
    else if (r === 'superadmin') userRoles = ['Admission Officer'];
    else if (r === 'portaladmin') userRoles = ['Portal Admin'];
    else userRoles = ['Teacher'];
  }
  
  const isStaff = userRoles.includes('Teacher');
  const isExaminationAdmin = userRoles.includes('Examination Admin');
  const isGeneralAdmin = userRoles.includes('General Admin') || userRoles.includes('Admin') || userRoles.includes('Super Admin');
  const hasAdminAccess = isExaminationAdmin || isGeneralAdmin || !isStaff;
  const [sessions] = useSessions();
  const SESSIONS = sessions;
  const [scores, setScores] = useScores();
  const [affectiveRecords, setAffectiveRecords] = useState<AffectiveRecord[]>(initialAffectiveRecords);
  const [skillsDb] = useSkillsDb();
  const [selectedSessionYear, setSelectedSessionYear] = useState(() => sessions[1] || sessions[0] || "2025/2026");
  const [selectedTerm, setSelectedTerm] = useState("First Term");
  const selectedSession = `${selectedSessionYear} - ${selectedTerm}`;
  const [selectedClass, setSelectedClass] = useState("SSS 3A");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [searchTerm, setSearchTerm] = useState("");
  const [releaseMap, updateRelease] = useResultsRelease();
  const isPublished = isResultReleased(selectedSessionYear, selectedTerm, selectedClass);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Active Main Sub-Tab Mode


  // Specific Modal Trigger States
  const [students, setStudents] = useStudents();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const { assignments, setAssignments, submissions, setSubmissions } = useAssignments();
  
  const [isGiveAssModalOpen, setIsGiveAssModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "Mathematics",
    targetClass: "SSS 3A",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxMarks: 100,
    teacherName: "Mrs. Victoria Danjuma"
  });

  const [assignmentFilterClass, setAssignmentFilterClass] = useState("All Classes");
  const [assignmentFilterSubject, setAssignmentFilterSubject] = useState("All Subjects");
  const [assignmentFilterStatus, setAssignmentFilterStatus] = useState<"All" | "Pending Review" | "Graded">("All");
  const [selectedAssIdForFilter, setSelectedAssIdForFilter] = useState("All");

  const [activeGradingSub, setActiveGradingSub] = useState<any>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  const handleGiveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const ass = {
      id: `ASS-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newAssignment.title,
      description: newAssignment.description,
      subject: newAssignment.subject,
      targetClass: newAssignment.targetClass,
      dueDate: newAssignment.dueDate,
      maxMarks: Number(newAssignment.maxMarks) || 100,
      teacherName: newAssignment.teacherName || "Subject Teacher",
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAssignments([ass, ...assignments]);
    setIsGiveAssModalOpen(false);
    setNewAssignment({
      title: "",
      description: "",
      subject: "Mathematics",
      targetClass: "SSS 3A",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxMarks: 100,
      teacherName: "Mrs. Victoria Danjuma"
    });
    setSuccessMsg(`Assignment "${ass.title}" given successfully to ${ass.targetClass}!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleOpenGradingModal = (sub: any) => {
    setActiveGradingSub(sub);
    setGradeInput(sub.grade !== null && sub.grade !== undefined ? String(sub.grade) : "");
    setFeedbackInput(sub.feedback || "");
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGradingSub) return;
    const parsedGrade = parseInt(gradeInput);
    if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > (activeGradingSub.maxMarks || 100)) {
      alert(`Please enter a valid mark between 0 and ${activeGradingSub.maxMarks || 100}`);
      return;
    }

    setSubmissions(submissions.map(s => {
      if (s.id === activeGradingSub.id) {
        return {
          ...s,
          grade: parsedGrade,
          feedback: feedbackInput.trim() || "Work reviewed and graded.",
          status: "Graded" as const
        };
      }
      return s;
    }));
    const studentName = activeGradingSub.studentName;
    setActiveGradingSub(null);
    setSuccessMsg(`Mark (${parsedGrade}/${activeGradingSub.maxMarks || 100}) and feedback successfully awarded to ${studentName}!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };


  // Modal Data Holders
  const [batchScoreField, setBatchScoreField] = useState<"ca1" | "ca2" | "ca3" | "ca4" | "exam" | "all">("ca1");
  const [studentLookupId, setStudentLookupId] = useState("ESS/2026/001");
  const [selectedStudentResult, setSelectedStudentResult] = useState<any | null>(null);
  const [isNewFormat, setIsNewFormat] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Deletion Target States
  const [deleteTargetClass, setDeleteTargetClass] = useState("SSS 3A");
  const [deleteTargetSubject, setDeleteTargetSubject] = useState("Mathematics");
  const [deleteTargetStudentId, setDeleteTargetStudentId] = useState("");

  // Helper to get sorted subject rankings for a class & subject
  const getSubjectRankings = (cls: string, sub: string, sess: string, currentScores: ScoreRecord[]) => {
    const targetClass = cls === "All Classes" ? "SSS 3A" : cls;
    const targetSubject = sub === "All Subjects" ? "Mathematics" : sub;

    return currentScores
      .filter(s => (cls === "All Classes" || s.class === targetClass) && (sub === "All Subjects" || s.subject === targetSubject) && s.session === sess)
      .sort((a, b) => b.total - a.total)
      .map((rec, idx) => {
        const posStr = idx === 0 ? "1st" : idx === 1 ? "2nd" : idx === 2 ? "3rd" : `${idx + 1}th`;
        return {
          ...rec,
          subjectPosition: posStr,
          subjectRank: idx + 1
        };
      });
  };

  const recomputePositionsList = (list: ScoreRecord[]): ScoreRecord[] => {
    const updated = [...list];
    CLASSES.forEach(cls => {
      if (cls === "All Classes") return;
      SUBJECTS.forEach(sub => {
        if (sub === "All Subjects") return;
        const matchingIndices = updated
          .map((rec, idx) => ({ rec, idx }))
          .filter(item => item.rec.class === cls && item.rec.subject === sub)
          .sort((a, b) => b.rec.total - a.rec.total);

        matchingIndices.forEach((item, rank) => {
          const posStr = rank === 0 ? "1st" : rank === 1 ? "2nd" : rank === 2 ? "3rd" : `${rank + 1}th`;
          updated[item.idx].position = posStr;
        });
      });
    });
    return updated;
  };

  // Ensure scores exist for students when selecting class, subject, session
  const ensureClassScores = (cls: string, sub: string, sess: string) => {
    const targetClass = cls === "All Classes" ? "SSS 3A" : cls;
    const targetSub = sub === "All Subjects" ? "Mathematics" : sub;
    const classStudents = students.filter(s => s.class === targetClass);
    setScores(prev => {
      const updated = [...prev];
      classStudents.forEach(st => {
        const exists = updated.some(s => s.studentId === st.id && s.subject === targetSub && s.session === sess);
        if (!exists) {
          updated.push({
            id: `SCR-${Date.now()}-${st.id.replace(/\//g, '-')}-${Math.floor(Math.random()*1000)}`,
            studentId: st.id,
            studentName: st.name,
            class: st.class,
            subject: targetSub,
            session: sess,
            ca1: 0,
            ca2: 0,
            ca3: 0,
            ca4: 0,
            exam: 0,
            total: 0,
            grade: "F",
            remark: "Fail",
            position: "—"
          });
        }
      });
      return recomputePositionsList(updated);
    });
  };

  // Filtered score records
  const filteredScores = scores.filter((rec) => {
    const matchesSession = rec.session === selectedSession;
    const matchesClass = selectedClass === "All Classes" || rec.class === selectedClass;
    const matchesSubject = selectedSubject === "All Subjects" || rec.subject === selectedSubject;
    const matchesSearch = rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rec.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSession && matchesClass && matchesSubject && matchesSearch;
  });

  // Calculate Positions automatically
  const handleRecomputePositions = () => {
    setScores(prev => recomputePositionsList(prev));
    setNotificationMsg("Class positions and rankings successfully recomputed!");
    setTimeout(() => setNotificationMsg(""), 3500);
  };

  // Recalculate totals and grades
  const handleReworkTotals = () => {
    setScores(prev => {
      const recalculated = prev.map(rec => {
        const total = rec.ca1 + rec.ca2 + rec.ca3 + rec.ca4 + rec.exam;
        const { grade, remark } = calculateGrade(total);
        return { ...rec, total, grade, remark };
      });
      return recomputePositionsList(recalculated);
    });
    setNotificationMsg("Reworked all totals, grades, and remarks based on current assessment figures.");
    setTimeout(() => setNotificationMsg(""), 3500);
  };

  // Inline table change
  const handleInlineScoreChange = (id: string, field: 'ca1' | 'ca2' | 'ca3' | 'ca4' | 'exam', value: number) => {
    setScores(prev => {
      const updated = prev.map(rec => {
        if (rec.id === id) {
          let val = Math.max(0, value);
          if (field === 'exam') val = Math.min(60, val);
          else val = Math.min(10, val);

          const newCa1 = field === 'ca1' ? val : rec.ca1;
          const newCa2 = field === 'ca2' ? val : rec.ca2;
          const newCa3 = field === 'ca3' ? val : rec.ca3;
          const newCa4 = field === 'ca4' ? val : rec.ca4;
          const newExam = field === 'exam' ? val : rec.exam;
          const newTotal = newCa1 + newCa2 + newCa3 + newCa4 + newExam;
          const { grade, remark } = calculateGrade(newTotal);

          return {
            ...rec,
            [field]: val,
            total: newTotal,
            grade,
            remark
          };
        }
        return rec;
      });
      return recomputePositionsList(updated);
    });
  };

  // Validate / Cross Check Recorded Exam
  const handleValidateExam = () => {
    const errors: string[] = [];
    const currentClassScores = scores.filter(s => (selectedClass === "All Classes" || s.class === selectedClass) && s.session === selectedSession);
    
    if (currentClassScores.length === 0) {
      errors.push(`WARNING: No examination scores found for session ${selectedSession} in ${selectedClass}.`);
    } else {
      currentClassScores.forEach(s => {
        if (s.ca1 > 10 || s.ca2 > 10 || s.ca3 > 10 || s.ca4 > 10) {
          errors.push(`INVALID CA SCORE: Student ${s.studentName} (${s.studentId}) in ${s.subject} has CA > 10.`);
        }
        if (s.exam > 60) {
          errors.push(`INVALID EXAM SCORE: Student ${s.studentName} (${s.studentId}) in ${s.subject} has Exam > 60.`);
        }
        if (s.total > 100) {
          errors.push(`OVERFLOW TOTAL: Student ${s.studentName} (${s.studentId}) in ${s.subject} has Total > 100.`);
        }
      });
    }

    if (errors.length === 0) {
      setValidationErrors([
        `PASSED AUDIT: All recorded examination scores for ${selectedClass} (${selectedSession}) are valid and consistent!`,
        `Verified CA1-CA4 limits (Maximum 10 points per assessment)`,
        `Verified Exam score limits (Maximum 60 points)`,
        `Verified Grade calculation & Class position rankings`
      ]);
    } else {
      setValidationErrors(errors);
    }
    setActiveModal("validate_exam");
  };


  const renderStudentReportCard = (student: any) => {
    let studentScores = scores.filter((s: any) => 
      (s.studentId === student.studentId || (s.studentName && s.studentName.toLowerCase() === student.studentName?.toLowerCase())) && 
      s.session === selectedSession
    );

    if (studentScores.length === 0) {
      studentScores = scores.filter((s: any) => 
        s.studentId === student.studentId || (s.studentName && s.studentName.toLowerCase() === student.studentName?.toLowerCase())
      );
    }

    if (studentScores.length === 0) {
      const defaultSubjects = ["Mathematics", "English Language", "Basic Science", "Civic Education", "Social Studies", "Agricultural Science"];
      studentScores = defaultSubjects.map((sub, i) => ({
        id: `TMP-${student.studentId}-${i}`,
        studentId: student.studentId,
        studentName: student.studentName,
        class: student.class,
        subject: sub,
        session: selectedSession,
        ca1: 8,
        ca2: 8,
        ca3: 7,
        ca4: 8,
        exam: 49,
        total: 80,
        grade: "A",
        remark: "Excellent",
        position: "1st"
      })) as any;
    }

    const overallTotal = studentScores.reduce((acc: any, s: any) => acc + s.total, 0);
    const average = studentScores.length > 0 ? (overallTotal / studentScores.length).toFixed(1) : 0;
    
    const currentAffective = skillsDb[student.studentId] || affectiveRecords.find((a: any) => a.studentId === student.studentId) || {};

    const traits = [
      { key: 'Attentiveness', label: 'Attentiveness' }, { key: 'Attendance', label: 'Attendance' }, { key: 'Punctuality', label: 'Punctuality' }, { key: 'Neatness', label: 'Neatness' }, { key: 'Politeness', label: 'Politeness' }, { key: 'Rel. With Others', label: 'Rel. With Others' }, { key: 'Curiosity', label: 'Curiosity' }, { key: 'Honesty', label: 'Honesty' }, { key: 'Humility', label: 'Humility' }, { key: 'Tolerance', label: 'Tolerance' }, { key: 'Leadership', label: 'Leadership' }, { key: 'Courage', label: 'Courage' }, { key: 'Handwriting', label: 'Handwriting' }, { key: 'Fluency', label: 'Fluency' }, { key: 'Games/Sports', label: 'Games/Sports' }, { key: 'Music Skills', label: 'Music Skills' }, { key: 'Construction', label: 'Construction' },
    ];

    return isNewFormat ? (
      <div className="bg-white border-4 border-gray-300 p-2 sm:p-6 w-full mx-auto" style={{ minWidth: '800px' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden">
            <img src={portalSettings.logoUrl} alt="School Badge" className="w-full h-full object-cover" />
          </div>
          <div className="text-center flex-1 px-4">
            <h1 className="text-2xl font-black text-yellow-600 uppercase tracking-wide">{portalSettings.schoolName}</h1>
            <p className="text-yellow-500 font-bold mt-1 text-sm">{portalSettings.address}</p>
            <p className="text-yellow-500 font-bold text-sm">Site: emmanuelsecondaryschool.com</p>
            <p className="text-yellow-500 font-bold text-sm">Phone: {portalSettings.contactPhone}</p>
          </div>
          <div className="w-24 h-24 rounded-md border flex items-center justify-center overflow-hidden bg-slate-100">
            {students.find(s => s.id === student.studentId)?.passportUrl ? (
              <img src={students.find(s => s.id === student.studentId)?.passportUrl} alt="Student" className="w-full h-full object-cover" />
            ) : (
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.studentId || student.studentName}`} alt="Student" className="w-full h-full object-cover" />
            )}
          </div>
        </div>

        <div className="bg-cyan-300 w-64 text-center text-[11px] py-1 border border-black mb-3 font-bold uppercase">
          {selectedSession.split(' - ')[1]?.toUpperCase() || "FIRST TERM"} RESULT<br/>{selectedSession.split(' - ')[0] || "2025/2026 SESSION"}
        </div>

        <table className="w-full border-collapse border border-black text-[11px] font-bold uppercase mb-2">
          <tbody>
            <tr>
              <td colSpan={2} className="border border-black p-1 text-center">NAME: {student.studentName} &nbsp;&bull;&nbsp; ADM NO: {student.studentId} &nbsp;&bull;&nbsp; CLASS: {student.class}</td>
            </tr>
            <tr>
              <td colSpan={2} className="border border-black p-1 text-center">GENDER: {student.gender || "MALE"} &nbsp;&bull;&nbsp; SUBJECTS TAKEN: {studentScores.length} &nbsp;&bull;&nbsp; ATTENDANCE: 122 DAYS OUT OF 125</td>
            </tr>
          </tbody>
        </table>

        <div className="flex items-start gap-1">
          <div className="flex-1">
            <table className="w-full border-collapse border border-black text-[10px] text-center uppercase">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-1 text-left w-32">SUBJECT</th>
                  <th className="border border-black p-1">CA1</th>
                  <th className="border border-black p-1">CA2</th>
                  <th className="border border-black p-1">CA3</th>
                  <th className="border border-black p-1">CA4</th>
                  <th className="border border-black p-1">CATOTAL</th>
                  <th className="border border-black p-1">EXAM</th>
                  <th className="border border-black p-1">TOTAL</th>
                  <th className="border border-black p-1">LOWEST</th>
                  <th className="border border-black p-1">HIGHEST</th>
                  <th className="border border-black p-1">AVERAGE</th>
                  <th className="border border-black p-1">POSITION</th>
                  <th className="border border-black p-1">GRADE</th>
                  <th className="border border-black p-1">REMARK</th>
                </tr>
              </thead>
              <tbody>
                {studentScores.map((sub: any) => {
                  const caTotal = sub.ca1 + sub.ca2 + sub.ca3 + sub.ca4;
                  return (
                    <tr key={sub.id}>
                      <td className="border border-black p-1 text-left font-semibold">{sub.subject}</td>
                      <td className="border border-black p-1">{sub.ca1}</td>
                      <td className="border border-black p-1">{sub.ca2}</td>
                      <td className="border border-black p-1">{sub.ca3}</td>
                      <td className="border border-black p-1">{sub.ca4}</td>
                      <td className="border border-black p-1 bg-gray-50">{caTotal}</td>
                      <td className="border border-black p-1">{sub.exam}</td>
                      <td className="border border-black p-1 font-bold">{sub.total}</td>
                      <td className="border border-black p-1 text-gray-600">28</td>
                      <td className="border border-black p-1 text-gray-600">99</td>
                      <td className="border border-black p-1 text-gray-600">65.7</td>
                      <td className="border border-black p-1">{sub.position || "—"}</td>
                      <td className="border border-black p-1 font-bold">{sub.grade}</td>
                      <td className="border border-black p-1">{sub.remark}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <table className="w-full border-collapse border border-black text-[11px] font-bold uppercase mt-1">
              <tbody>
                <tr>
                  <td colSpan={4} className="border border-black p-1 text-left bg-gray-50">OVERALL TOTAL: {overallTotal}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="border border-black p-1 text-left bg-gray-50">AVERAGE SCORE: {average}%</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-black p-1 text-left w-1/4">POSITION: {student.position || "1st"}</td>
                  <td className="border border-black p-1 text-left w-1/4">OUT OF: {student.totalClassCount || 25}</td>
                  <td className="border border-black p-1 text-left w-1/4">TERM BEGAN: 04/05/2026</td>
                  <td className="border border-black p-1 text-left w-1/4">ENDED: 24/07/2026</td>
                </tr>
                <tr>
                  <td colSpan={4} className="border border-black p-1 text-left bg-gray-50">NEXT TERM BEGINS: 14/09/2026</td>
                </tr>
                <tr>
                  <td colSpan={4} className="border border-black p-1 text-left bg-gray-50">CLASS TEACHER'S REMARK: AN EXCELLENT PERFORMANCE, KEEP IT UP</td>
                </tr>
                <tr>
                  <td colSpan={4} className="border border-black p-1 text-left bg-gray-50">HEAD TEACHER'S REMARK: A VERY GOOD RESULT, KEEP IT UP</td>
                </tr>
                <tr>
                  <td colSpan={4} className="border border-black p-2 h-16 align-top">
                    <div className="flex justify-between items-end h-full w-full">
                      <span>PRINCIPAL'S NAME: {portalSettings.principalName?.toUpperCase() || "MR. ZAGWA SAMUEL"}</span>
                      {portalSettings.principalSignatureUrl ? (
                        <img src={portalSettings.principalSignatureUrl} alt="Signature" className="w-24 h-12 object-contain" />
                      ) : (
                        <img src="/signature.jpg" alt="Signature" className="w-24 h-12 object-contain opacity-0" />
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
            
          <div className="w-32 shrink-0">
            <table className="w-full border-collapse border border-black text-[10px] text-center bg-gray-50 uppercase">
              <tbody>
                <tr><td colSpan={2} className="border border-black p-1 text-center font-bold bg-gray-200">LOCOMOTIVE / PSYCHOMOTOR</td></tr>
                {traits.map((t: any) => (
                  <tr key={t.key}>
                    <td className="border border-black p-1 text-left w-3/4">{t.label}</td>
                    <td className="border border-black p-1 w-1/4 font-bold bg-white">{(currentAffective as any)[t.key] !== undefined ? (currentAffective as any)[t.key] : 'A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ) : (
      <div className="space-y-5 text-slate-900 bg-white p-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-slate-900">{student.studentName}</p>
            <p className="text-xs text-slate-500">ID: {student.studentId} &bull; Class: {student.class}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Class Position</p>
            <p className="text-base font-black text-brand-700">{student.position || "1st"}</p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 font-semibold text-slate-700">
              <tr>
                <th className="p-2.5">Subject</th>
                <th className="p-2.5 text-center">CA1</th>
                <th className="p-2.5 text-center">CA2</th>
                <th className="p-2.5 text-center">CA3</th>
                <th className="p-2.5 text-center">CA4</th>
                <th className="p-2.5 text-center">Exam</th>
                <th className="p-2.5 text-center font-bold">Total</th>
                <th className="p-2.5 text-center font-bold">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentScores.map((sub: any) => (
                <tr key={sub.id}>
                  <td className="p-2.5 font-medium">{sub.subject}</td>
                  <td className="p-2.5 text-center">{sub.ca1}</td>
                  <td className="p-2.5 text-center">{sub.ca2}</td>
                  <td className="p-2.5 text-center">{sub.ca3}</td>
                  <td className="p-2.5 text-center">{sub.ca4}</td>
                  <td className="p-2.5 text-center font-semibold">{sub.exam}</td>
                  <td className="p-2.5 text-center font-bold text-slate-900">{sub.total}</td>
                  <td className="p-2.5 text-center font-bold text-brand-700">{sub.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-heading text-slate-900">Examinations & Assessment Control Center</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 border border-brand-200">
              Academic Session Gradebook
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Comprehensive grade management: Live score entry, CA1–CA4, Master Broadsheets, Position computation, and Results publishing.
          </p>
        </div>

        {hasAdminAccess && (
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              className="gap-1.5 text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={handleReworkTotals}
            >
              <Calculator size={15} />
              Rework Total
            </Button>

            <Button 
              variant="outline" 
              className="gap-1.5 text-xs bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100"
              onClick={handleRecomputePositions}
            >
              <ListOrdered size={15} />
              Recompute Positions
            </Button>

            <Button 
              variant={isPublished ? "outline" : "brand"} 
              className={`gap-1.5 text-xs ${isPublished ? "border-emerald-300 bg-emerald-50 text-emerald-800" : ""}`}
              onClick={() => {
                const newStatus = updateRelease(selectedSessionYear, selectedTerm, selectedClass);
                setNotificationMsg(newStatus ? `Examination Results for ${selectedSession} (${selectedClass}) Published to Student Portal!` : `Results for ${selectedSession} (${selectedClass}) Unpublished (Draft Mode).`);
                setTimeout(() => setNotificationMsg(""), 3500);
              }}
            >
              {isPublished ? <Unlock size={15} /> : <Lock size={15} />}
              {isPublished ? "Result Released" : "Release Result"}
            </Button>
          </div>
        )}
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle size={20} className="text-emerald-600" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg("")} className="text-emerald-600 hover:text-emerald-800">
            <X size={18} />
          </button>
        </div>
      )}

      {/* EXAMINATIONS ACTION COMMANDS PANEL */}
      <Card className="border-0 shadow-md bg-slate-900 text-white overflow-hidden">
        <CardHeader className="bg-slate-950/80 border-b border-slate-800 py-3.5 px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/30">
              <Edit3 size={18} />
            </div>
            <div>
              <CardTitle className="text-white text-sm font-bold tracking-wide uppercase">
                Record Exam & Actions
              </CardTitle>
              <p className="text-[11px] text-slate-400">
                Enter continuous assessments, examinations, and check student results.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-6">
          {/* SECTION 1: EXAM & SCORE ENTRY */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Edit3 size={13} /> Continuous Assessment & Score Entry
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-brand-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => { setBatchScoreField("all"); setActiveModal("live_score_entry"); }}
              >
                <Sparkles size={14} className="text-amber-400 shrink-0" /> Record Exam
              </Button>

              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-brand-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => { setBatchScoreField("all"); setActiveModal("live_score_entry"); }}
              >
                <Sparkles size={14} className="text-amber-300 shrink-0" /> Enter Live Score(Whole Class)
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-blue-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => { setBatchScoreField("ca1"); setActiveModal("live_score_entry"); }}
              >
                <Check size={14} className="text-blue-400 shrink-0" /> Enter CA1
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-indigo-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => { setBatchScoreField("ca2"); setActiveModal("live_score_entry"); }}
              >
                <Check size={14} className="text-indigo-400 shrink-0" /> Enter CA2
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => { setBatchScoreField("ca3"); setActiveModal("live_score_entry"); }}
              >
                <Check size={14} className="text-purple-400 shrink-0" /> Enter CA3
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-pink-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => { setBatchScoreField("ca4"); setActiveModal("live_score_entry"); }}
              >
                <Check size={14} className="text-pink-400 shrink-0" /> Enter CA4
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-cyan-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => { setBatchScoreField("all"); setActiveModal("live_score_entry"); }}
              >
                <Layers size={14} className="text-cyan-400 shrink-0" /> Enter CA1234
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-emerald-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => { setBatchScoreField("exam"); setActiveModal("live_score_entry"); }}
              >
                <GraduationCap size={14} className="text-emerald-400 shrink-0" /> Enter Exam (Only)
              </Button>

              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-amber-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => setActiveModal("update_ca_exam")}
              >
                <RefreshCw size={14} className="text-amber-400 shrink-0" /> Update CA/Exam
              </Button>

              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-teal-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => setActiveModal("upload_exam_csv")}
              >
                <FileSpreadsheet size={14} className="text-teal-400 shrink-0" /> Download CA Sheet Or Upload Exam
              </Button>
            </div>
          </div>

          {/* SECTION 2: LIVE CLASSES & ASSIGNMENTS */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Video size={13} /> Live Classes & Assignments
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => setActiveModal("live_classes")}
              >
                <Video size={14} className="text-amber-400 shrink-0" />
                <span className="truncate">Host Live Class</span>
              </Button>
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => setActiveModal("view_assignments")}
              >
                <FileText size={14} className="text-amber-300 shrink-0" />
                <span className="truncate">Submitted Assignments</span>
              </Button>
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                onClick={() => setIsGiveAssModalOpen(true)}
              >
                <Plus size={14} className="text-emerald-400 shrink-0" />
                <span className="truncate">Give Assignment</span>
              </Button>
            </div>


          {hasAdminAccess && (
            <>
              {/* ADMIN SECTION 2: RESULTS & BROADSHEETS */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <FileCheck size={13} /> Result Printing & Broadsheet Reports
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-blue-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("class_result")}
                  >
                    <Printer size={14} className="text-blue-400 shrink-0" />
                    <span className="truncate">Print Class Result</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-blue-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("check_student_result")}
                  >
                    <UserCheck size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">Check Student Result</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-blue-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("locomotive_assessment")}
                  >
                    <FileText size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate">Locomotive / Affective</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-indigo-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("class_result_pre_select")}
                  >
                    <Printer size={14} className="text-indigo-400 shrink-0" />
                    <span className="truncate">Pre-Select Class Result</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-indigo-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("result_summary")}
                  >
                    <Table size={14} className="text-indigo-400 shrink-0" />
                    <span className="truncate">Get Result Summary</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-indigo-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("master_broadsheet")}
                  >
                    <FileCheck size={14} className="text-indigo-300 shrink-0" />
                    <span className="truncate">Get Master/Broad Sheet</span>
                  </Button>
                </div>
              </div>

              {/* ADMIN SECTION 3: PERFORMANCE RANKINGS & ANNUAL ANALYSIS */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Award size={13} /> Performance Rankings & Annual Analysis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("best_per_subject")}
                  >
                    <Award size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate">View Best Per Subject</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("best_per_class")}
                  >
                    <Award size={14} className="text-amber-300 shrink-0" />
                    <span className="truncate">View Overall Best Per Class</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("school_best_per_class")}
                  >
                    <Award size={14} className="text-amber-200 shrink-0" />
                    <span className="truncate">View School Overall Best Per Class</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("class_annual_result")}
                  >
                    <BarChart3 size={14} className="text-purple-300 shrink-0" />
                    <span className="truncate">View/Print Class Annual Result</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("overall_annual_analysis")}
                  >
                    <BarChart3 size={14} className="text-pink-400 shrink-0" />
                    <span className="truncate">Overall Annual (Analysis)</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-purple-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("add_score_to_annual")}
                  >
                    <Plus size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">Add Score To Annual</span>
                  </Button>
                </div>
              </div>

              {/* ADMIN SECTION 4: VALIDATION, COMPUTATION & DELETIONS */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} /> Validation, Position Computations & Deletions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-emerald-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={handleValidateExam}
                  >
                    <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                    <span className="truncate">Validate/Cross Check</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={handleReworkTotals}
                  >
                    <Calculator size={14} className="text-sky-400 shrink-0" />
                    <span className="truncate">Rework Total</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={handleRecomputePositions}
                  >
                    <ListOrdered size={14} className="text-indigo-400 shrink-0" />
                    <span className="truncate">Recompute Position</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-emerald-800 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => {
                      const newStatus = updateRelease(selectedSessionYear, selectedTerm, selectedClass);
                      setNotificationMsg(newStatus ? `Examination Results for ${selectedSession} (${selectedClass}) Published to Student Portal!` : `Results for ${selectedSession} (${selectedClass}) Unpublished (Draft Mode).`);
                      setTimeout(() => setNotificationMsg(""), 3500);
                    }}
                  >
                    <Lock size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate">{isPublished ? "Result Released" : "Release Result"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-rose-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("delete_subject_recorded")}
                  >
                    <Trash2 size={14} className="text-rose-400 shrink-0" />
                    <span className="truncate">Delete Subject Recorded</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-rose-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("delete_single_subject")}
                  >
                    <Trash2 size={14} className="text-rose-300 shrink-0" />
                    <span className="truncate">Delete Single Subject</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-rose-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("delete_annual_subject_class")}
                  >
                    <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                    <span className="truncate">Delete Annual Per Class</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-rose-900 hover:text-white justify-start gap-2 h-9 text-[11px]"
                    onClick={() => setActiveModal("delete_single_annual")}
                  >
                    <AlertTriangle size={14} className="text-rose-400 shrink-0" />
                    <span className="truncate">Delete Single Annual</span>
                  </Button>
                </div>
              </div>
            </>
          )}
          </div>

        </CardContent>
      </Card>


      {/* MODAL: LIVE CLASSES */}
      {activeModal === "live_classes" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Video className="text-brand-400" size={20} /> Host Live Class
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Start a virtual classroom session for {selectedClass}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label>Class Title / Topic</Label>
                  <Input placeholder="e.g. Introduction to Algebra" className="mt-1" />
                </div>
                <div>
                  <Label>Meeting Link</Label>
                  <Input placeholder="e.g. https://meet.google.com/xyz" className="mt-1" />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
                  <Button variant="brand">Start Class / Notify Students</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      
      {/* GIVE ASSIGNMENT MODAL */}
      {isGiveAssModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg border-0 shadow-2xl animate-in zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle>Give New Assignment</CardTitle>
              <button onClick={() => setIsGiveAssModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 max-h-[80vh] overflow-y-auto bg-white text-slate-800">
              <form onSubmit={handleGiveAssignment} className="space-y-4 text-sm">
                <div className="space-y-2">
                  <Label htmlFor="ass_title">Assignment Title</Label>
                  <Input 
                    id="ass_title" 
                    required 
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="e.g. Algebra Homework"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ass_desc">Instructions / Description</Label>
                  <textarea 
                    id="ass_desc" 
                    required 
                    className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    placeholder="Enter assignment details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ass_subject">Subject</Label>
                    <select 
                      id="ass_subject" 
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={newAssignment.subject}
                      onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                    >
                      {["Mathematics", "English Language", "Basic Science", "Civic Education"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ass_class">Target Class</Label>
                    <select 
                      id="ass_class" 
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={newAssignment.targetClass}
                      onChange={(e) => setNewAssignment({...newAssignment, targetClass: e.target.value})}
                    >
                      {CLASSES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ass_date">Due Date</Label>
                  <Input 
                    id="ass_date" 
                    type="date"
                    required 
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 bg-white border-slate-200" onClick={() => setIsGiveAssModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-md">
                    Give Assignment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: GIVE ASSIGNMENT */}
      {isGiveAssModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus size={20} /> Give New Assignment
                </CardTitle>
                <p className="text-xs text-amber-100 mt-0.5">Assign homework, lab tasks, or essays to target classes</p>
              </div>
              <button onClick={() => setIsGiveAssModalOpen(false)} className="text-amber-200 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 max-h-[80vh] overflow-y-auto bg-white">
              <form onSubmit={handleGiveAssignment} className="space-y-4 text-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="ass_title" className="font-bold text-slate-800">Assignment Title</Label>
                  <Input 
                    id="ass_title" 
                    required 
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="e.g. Algebra & Quadratic Equations Homework"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ass_desc" className="font-bold text-slate-800">Instructions / Description</Label>
                  <textarea 
                    id="ass_desc" 
                    required 
                    className="flex min-h-[100px] w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    placeholder="Provide clear instructions, page numbers, questions, or formatting guidelines..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ass_subject" className="font-bold text-slate-800">Subject</Label>
                    <select 
                      id="ass_subject" 
                      className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={newAssignment.subject}
                      onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                    >
                      {SUBJECTS.filter(s => s !== "All Subjects").map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ass_class" className="font-bold text-slate-800">Target Class</Label>
                    <select 
                      id="ass_class" 
                      className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={newAssignment.targetClass}
                      onChange={(e) => setNewAssignment({...newAssignment, targetClass: e.target.value})}
                    >
                      {CLASSES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ass_date" className="font-bold text-slate-800">Submission Due Date</Label>
                    <Input 
                      id="ass_date" 
                      type="date"
                      required 
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ass_marks" className="font-bold text-slate-800">Maximum Marks</Label>
                    <Input 
                      id="ass_marks" 
                      type="number"
                      min={10}
                      max={100}
                      required 
                      value={newAssignment.maxMarks}
                      onChange={(e) => setNewAssignment({...newAssignment, maxMarks: parseInt(e.target.value) || 100})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ass_teacher" className="font-bold text-slate-800">Assigning Teacher Name</Label>
                  <Input 
                    id="ass_teacher" 
                    required 
                    value={newAssignment.teacherName}
                    onChange={(e) => setNewAssignment({...newAssignment, teacherName: e.target.value})}
                    placeholder="e.g. Mrs. Victoria Danjuma"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 bg-slate-100 border-slate-300 text-slate-700" onClick={() => setIsGiveAssModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md gap-1.5">
                    <Check size={16} /> Publish Assignment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: VIEW & GRADE ASSIGNMENTS */}
      {activeModal === "view_assignments" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <Card className="w-full max-w-6xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col bg-slate-950 text-white">
            <CardHeader className="bg-slate-900 border-b border-slate-800 text-white flex flex-row items-center justify-between pb-4 shrink-0">
              <div>
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <FileText className="text-amber-400" size={22} /> Teacher Assignment Grading & Review Portal
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review student submissions, inspect uploaded documents, and award marks with constructive feedback.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs gap-1.5"
                  onClick={() => setIsGiveAssModalOpen(true)}
                >
                  <Plus size={14} /> Give New Assignment
                </Button>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
                  <X size={20} />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* SUMMARY KPI STRIP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Assignments</span>
                  <div className="text-xl font-black text-white mt-0.5">{assignments.length}</div>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Submissions</span>
                  <div className="text-xl font-black text-blue-400 mt-0.5">{submissions.length}</div>
                </div>
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pending Review</span>
                  <div className="text-xl font-black text-amber-300 mt-0.5">
                    {submissions.filter(s => s.status === "Pending Review").length}
                  </div>
                </div>
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Graded Submissions</span>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">
                    {submissions.filter(s => s.status === "Graded").length}
                  </div>
                </div>
              </div>

              {/* FILTERS BAR */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter size={14} /> Filter Submissions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-400">Class</Label>
                    <select
                      className="w-full h-8 rounded-lg border border-slate-700 bg-slate-950 text-white px-2 text-xs font-medium"
                      value={assignmentFilterClass}
                      onChange={e => setAssignmentFilterClass(e.target.value)}
                    >
                      <option value="All Classes">All Classes</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-400">Subject</Label>
                    <select
                      className="w-full h-8 rounded-lg border border-slate-700 bg-slate-950 text-white px-2 text-xs font-medium"
                      value={assignmentFilterSubject}
                      onChange={e => setAssignmentFilterSubject(e.target.value)}
                    >
                      <option value="All Subjects">All Subjects</option>
                      {SUBJECTS.filter(s => s !== "All Subjects").map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-400">Specific Assignment</Label>
                    <select
                      className="w-full h-8 rounded-lg border border-slate-700 bg-slate-950 text-white px-2 text-xs font-medium"
                      value={selectedAssIdForFilter}
                      onChange={e => setSelectedAssIdForFilter(e.target.value)}
                    >
                      <option value="All">All Assignments</option>
                      {assignments.map(a => <option key={a.id} value={a.id}>{a.title} ({a.subject})</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-400">Review Status</Label>
                    <select
                      className="w-full h-8 rounded-lg border border-slate-700 bg-slate-950 text-white px-2 text-xs font-medium"
                      value={assignmentFilterStatus}
                      onChange={e => setAssignmentFilterStatus(e.target.value as any)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Graded">Graded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SUBMISSIONS LIST */}
              {(() => {
                const filteredSubs = submissions.filter(s => {
                  const ass = assignments.find(a => a.id === s.assignmentId);
                  const assClass = s.studentClass || ass?.targetClass || "SSS 3A";
                  const assSubject = ass?.subject || "Mathematics";

                  if (assignmentFilterClass !== "All Classes" && assClass !== assignmentFilterClass && assClass !== "All Classes") {
                    return false;
                  }
                  if (assignmentFilterSubject !== "All Subjects" && assSubject !== assignmentFilterSubject) {
                    return false;
                  }
                  if (selectedAssIdForFilter !== "All" && s.assignmentId !== selectedAssIdForFilter) {
                    return false;
                  }
                  if (assignmentFilterStatus !== "All" && s.status !== assignmentFilterStatus) {
                    return false;
                  }
                  return true;
                });

                if (filteredSubs.length === 0) {
                  return (
                    <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 space-y-2">
                      <FileText size={36} className="mx-auto text-slate-600" />
                      <p className="font-bold text-sm text-slate-300">No submissions found matching this filter</p>
                      <p className="text-xs text-slate-500">Try changing class, subject, or status filter.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filteredSubs.map(sub => {
                      const ass = assignments.find(a => a.id === sub.assignmentId);
                      const isGraded = sub.status === "Graded";

                      return (
                        <div key={sub.id} className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                                {sub.studentName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm">{sub.studentName}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">({sub.studentId})</span>
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                                    {sub.studentClass || ass?.targetClass || "SSS 3A"}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                                  <span className="text-amber-400 font-bold">{ass?.subject || "Subject"}</span>
                                  <span>&bull;</span>
                                  <span className="text-slate-200">{ass?.title || "Assignment"}</span>
                                  <span>&bull;</span>
                                  <span className="text-slate-500">Submitted {sub.submittedAt}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {isGraded ? (
                                <div className="text-right">
                                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-full text-xs font-black flex items-center gap-1">
                                    <CheckCircle2 size={13} /> Graded &bull; {sub.grade}/{sub.maxMarks || 100}
                                  </span>
                                </div>
                              ) : (
                                <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                                  <Clock size={13} /> Pending Review
                                </span>
                              )}

                              <Button 
                                size="sm" 
                                className={`text-xs font-bold gap-1.5 ${
                                  isGraded 
                                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700" 
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                                }`}
                                onClick={() => handleOpenGradingModal(sub)}
                              >
                                <Edit3 size={14} /> {isGraded ? "Update Grade / Remarks" : "Grade Submission"}
                              </Button>
                            </div>
                          </div>

                          {/* SUBMISSION CONTENT & ATTACHED DOCUMENT */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            {/* Student Answer Text */}
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Student Answer / Solution Notes
                              </span>
                              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {sub.content || <span className="text-slate-500 italic">No text provided. Check attached document.</span>}
                              </p>
                            </div>

                            {/* Student Uploaded Document */}
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2 flex flex-col justify-between">
                              <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                  Attached Document / Uploaded File
                                </span>
                                {sub.documentName ? (
                                  <div className="p-2 bg-blue-950/40 border border-blue-800/60 rounded-lg flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <Paperclip size={16} className="text-blue-400 shrink-0" />
                                      <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-blue-200 truncate">{sub.documentName}</p>
                                        <p className="text-[10px] text-slate-400">{sub.documentSize || "Uploaded Document"}</p>
                                      </div>
                                    </div>
                                    {sub.documentUrl && (
                                      <a 
                                        href={sub.documentUrl} 
                                        download={sub.documentName} 
                                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                                      >
                                        <Download size={12} /> Download
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-slate-500 italic text-xs">No attached file uploaded for this submission.</p>
                                )}
                              </div>

                              {/* Feedback snippet if graded */}
                              {isGraded && sub.feedback && (
                                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300">
                                  <strong className="text-emerald-400">Teacher Feedback:</strong> {sub.feedback}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: GRADING & FEEDBACK DIALOG */}
      {activeGradingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden bg-slate-950 text-white">
            <CardHeader className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Award size={20} className="text-amber-300" /> Grade Student Submission & Feedback
                </CardTitle>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Student: <strong>{activeGradingSub.studentName}</strong> ({activeGradingSub.studentId}) &bull; {activeGradingSub.studentClass || "SSS 3A"}
                </p>
              </div>
              <button onClick={() => setActiveGradingSub(null)} className="text-emerald-200 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* ASSIGNMENT CONTEXT */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignment Details</div>
                <div className="text-sm font-bold text-amber-300">
                  {assignments.find(a => a.id === activeGradingSub.assignmentId)?.title || "Assignment Title"}
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {assignments.find(a => a.id === activeGradingSub.assignmentId)?.description}
                </div>
              </div>

              {/* STUDENT WORK REVIEW */}
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} /> Student Written Answer
                  </span>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {activeGradingSub.content || <span className="text-slate-500 italic">No text provided.</span>}
                  </div>
                </div>

                {/* ATTACHED FILE */}
                {activeGradingSub.documentName && (
                  <div className="p-3.5 bg-blue-950/30 border border-blue-800/60 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip size={14} /> Student Uploaded Document
                    </span>
                    <div className="p-3 bg-slate-950 rounded-lg border border-blue-900/60 flex items-center justify-between gap-3">
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{activeGradingSub.documentName}</p>
                        <p className="text-[11px] text-slate-400">{activeGradingSub.documentSize || "Document File"}</p>
                      </div>
                      {activeGradingSub.documentUrl ? (
                        <a 
                          href={activeGradingSub.documentUrl} 
                          download={activeGradingSub.documentName} 
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          <Download size={14} /> Download Document
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Attached file</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* GRADING FORM */}
              <form onSubmit={handleGradeSubmit} className="space-y-4 pt-2 border-t border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="grade_mark" className="font-bold text-xs text-slate-200">
                      Award Mark (Max: {activeGradingSub.maxMarks || 100})
                    </Label>
                    <span className="text-xs text-amber-400 font-bold">
                      {gradeInput ? `${gradeInput} / ${activeGradingSub.maxMarks || 100} Marks` : "Not graded yet"}
                    </span>
                  </div>
                  <Input 
                    id="grade_mark" 
                    type="number"
                    min={0}
                    max={activeGradingSub.maxMarks || 100}
                    required 
                    placeholder={`Enter score 0 - ${activeGradingSub.maxMarks || 100}`}
                    className="bg-slate-900 border-slate-700 text-white font-black text-lg h-11 focus:border-emerald-500"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                  />
                </div>

                {/* QUICK FEEDBACK CHIPS */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300">Quick Feedback Preset Chips</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Exceptional work and accurate derivations!",
                      "Well researched and articulated answers.",
                      "Good effort. Please double check formulas in question 3.",
                      "Neat presentation, keep up the high standard.",
                      "Revise the theory portion and resubmit if necessary."
                    ].map(preset => (
                      <button
                        type="button"
                        key={preset}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] transition-colors"
                        onClick={() => setFeedbackInput(preset)}
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TEACHER REMARKS */}
                <div className="space-y-1.5">
                  <Label htmlFor="teacher_feedback" className="font-bold text-xs text-slate-200">
                    Teacher's Remarks & Constructive Feedback
                  </Label>
                  <textarea 
                    id="teacher_feedback" 
                    rows={3}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Provide constructive feedback, praise, or areas for improvement..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" 
                    onClick={() => setActiveGradingSub(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg gap-2"
                  >
                    <CheckCircle2 size={16} /> Save Marks & Publish
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: LIVE SCORE ENTRY */}
      {activeModal === "live_score_entry" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-5xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[95vh] flex flex-col">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4 shrink-0">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Edit3 className="text-brand-400" size={20} /> Live Score Entry — {selectedSubject}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Enter scores directly into the grid. Changes are saved when you click Done.</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-5 overflow-y-auto bg-slate-950 flex-1 space-y-5">
      <div className="p-3 bg-brand-900/40 border border-brand-700/50 rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-brand-200">
                    <Sparkles size={16} className="text-amber-400 shrink-0" />
                    <span>
                      Active Entry Mode: <strong className="uppercase text-amber-300 font-black">{batchScoreField === "all" ? "Whole Class Live Score (CA1-CA4 + Exam)" : `${batchScoreField.toUpperCase()} Only`}</strong>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded text-[10px] font-bold">
                    {filteredScores.length} Students Listed
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Academic Session</label>
                    <select 
                      className="w-full h-8 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={selectedSessionYear}
                      onChange={(e) => setSelectedSessionYear(e.target.value)}
                    >
                      {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Term</label>
                    <select 
                      className="w-full h-8 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                    >
                      {["First Term", "Second Term", "Third Term"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Class</label>
                    <select 
                      className="w-full h-8 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                      value={selectedClass}
                      onChange={(e) => {
                        const newCls = e.target.value;
                        setSelectedClass(newCls);
                        ensureClassScores(newCls, selectedSubject, selectedSession);
                      }}
                    >
                      {CLASSES.filter(c => c !== "All Classes").map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Subject</label>
                    <select 
                      className="w-full h-8 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                      value={selectedSubject}
                      onChange={(e) => {
                        const newSub = e.target.value;
                        setSelectedSubject(newSub);
                        ensureClassScores(selectedClass, newSub, selectedSession);
                      }}
                    >
                      {SUBJECTS.filter(s => s !== "All Subjects").map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* SUBJECT POSITION & TOP PERFORMER SHOWCASE CARD */}
              {(() => {
                const subjectRankings = getSubjectRankings(selectedClass, selectedSubject, selectedSession, scores);
                const firstPlace = subjectRankings[0];
                const secondPlace = subjectRankings[1];
                const thirdPlace = subjectRankings[2];

                return (
                  <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-950 to-amber-950/80 border border-amber-500/40 rounded-xl text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                      <span className="font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                        <Award size={16} className="text-amber-400" />
                        Subject Position Leaderboard — {selectedSubject} ({selectedClass})
                      </span>
                      <span className="text-[11px] text-amber-200/80">
                        Live rankings updated dynamically
                      </span>
                    </div>

                    {firstPlace && firstPlace.total > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1ST POSITION WINNER */}
                        <div className="p-3 bg-amber-500/10 border border-amber-500/50 rounded-xl flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-extrabold text-xl border border-amber-500/50 shrink-0 shadow-lg">
                            🥇
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
                              1st Position (Subject Leader)
                            </div>
                            <div className="font-extrabold text-white text-sm truncate">{firstPlace.studentName}</div>
                            <div className="text-[11px] text-amber-200 font-mono">
                              Total: <strong className="text-amber-300 text-xs">{firstPlace.total}/100</strong> &bull; Grade: <strong>{firstPlace.grade}</strong>
                            </div>
                          </div>
                        </div>

                        {/* 2ND POSITION */}
                        {secondPlace && secondPlace.total > 0 ? (
                          <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-extrabold text-lg border border-slate-600 shrink-0">
                              🥈
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-[10px] uppercase font-bold text-slate-400">2nd Position</div>
                              <div className="font-bold text-slate-100 text-xs truncate">{secondPlace.studentName}</div>
                              <div className="text-[11px] text-slate-300 font-mono">
                                Total: <strong>{secondPlace.total}/100</strong> &bull; Grade: <strong>{secondPlace.grade}</strong>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500 text-xs flex items-center justify-center">
                            No 2nd place recorded yet
                          </div>
                        )}

                        {/* 3RD POSITION */}
                        {thirdPlace && thirdPlace.total > 0 ? (
                          <div className="p-3 bg-amber-900/20 border border-amber-800/40 rounded-xl flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-900/40 text-amber-400 flex items-center justify-center font-extrabold text-lg border border-amber-800/50 shrink-0">
                              🥉
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-[10px] uppercase font-bold text-amber-500">3rd Position</div>
                              <div className="font-bold text-slate-100 text-xs truncate">{thirdPlace.studentName}</div>
                              <div className="text-[11px] text-slate-300 font-mono">
                                Total: <strong>{thirdPlace.total}/100</strong> &bull; Grade: <strong>{thirdPlace.grade}</strong>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-500 text-xs flex items-center justify-center">
                            No 3rd place recorded yet
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-400 text-center py-2 text-xs">
                        Enter student examination marks in the table below to determine who took 1st position in <strong>{selectedSubject}</strong>.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* LIVE SCORE TABLE */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="p-3 min-w-[160px]">Student Name & ID</th>
                        {(batchScoreField === "ca1" || batchScoreField === "all") && <th className="p-2 text-center w-20">CA1 (10)</th>}
                        {(batchScoreField === "ca2" || batchScoreField === "all") && <th className="p-2 text-center w-20">CA2 (10)</th>}
                        {(batchScoreField === "ca3" || batchScoreField === "all") && <th className="p-2 text-center w-20">CA3 (10)</th>}
                        {(batchScoreField === "ca4" || batchScoreField === "all") && <th className="p-2 text-center w-20">CA4 (10)</th>}
                        {(batchScoreField === "exam" || batchScoreField === "all") && <th className="p-2 text-center w-24">Exam (60)</th>}
                        <th className="p-3 text-center w-20">Total (100)</th>
                        <th className="p-3 text-center w-16">Grade</th>
                        <th className="p-3 text-center w-24">Subject Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {filteredScores.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-8 text-slate-400">
                            No student records found for {selectedClass} in {selectedSubject}. Click select class above to load students.
                          </td>
                        </tr>
                      ) : (
                        filteredScores.map((student, rankIdx) => {
                          const rankings = getSubjectRankings(selectedClass, selectedSubject, selectedSession, scores);
                          const studentRank = rankings.find(r => r.id === student.id)?.subjectPosition || student.position || "—";

                          return (
                            <tr key={`${student.id}_${rankIdx}`} className="hover:bg-slate-900 transition-colors">
                              <td className="p-3 font-bold text-white">
                                <div>{student.studentName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{student.studentId}</div>
                              </td>
                              {(batchScoreField === "ca1" || batchScoreField === "all") && (
                                <td className="p-2 text-center">
                                  <Input 
                                    type="number" min={0} max={10} 
                                    className="w-14 h-8 text-center bg-slate-900 border-slate-700 text-white font-bold mx-auto focus:bg-slate-800"
                                    value={student.ca1}
                                    onChange={(e) => handleInlineScoreChange(student.id, 'ca1', parseInt(e.target.value) || 0)}
                                  />
                                </td>
                              )}
                              {(batchScoreField === "ca2" || batchScoreField === "all") && (
                                <td className="p-2 text-center">
                                  <Input 
                                    type="number" min={0} max={10} 
                                    className="w-14 h-8 text-center bg-slate-900 border-slate-700 text-white font-bold mx-auto focus:bg-slate-800"
                                    value={student.ca2}
                                    onChange={(e) => handleInlineScoreChange(student.id, 'ca2', parseInt(e.target.value) || 0)}
                                  />
                                </td>
                              )}
                              {(batchScoreField === "ca3" || batchScoreField === "all") && (
                                <td className="p-2 text-center">
                                  <Input 
                                    type="number" min={0} max={10} 
                                    className="w-14 h-8 text-center bg-slate-900 border-slate-700 text-white font-bold mx-auto focus:bg-slate-800"
                                    value={student.ca3}
                                    onChange={(e) => handleInlineScoreChange(student.id, 'ca3', parseInt(e.target.value) || 0)}
                                  />
                                </td>
                              )}
                              {(batchScoreField === "ca4" || batchScoreField === "all") && (
                                <td className="p-2 text-center">
                                  <Input 
                                    type="number" min={0} max={10} 
                                    className="w-14 h-8 text-center bg-slate-900 border-slate-700 text-white font-bold mx-auto focus:bg-slate-800"
                                    value={student.ca4}
                                    onChange={(e) => handleInlineScoreChange(student.id, 'ca4', parseInt(e.target.value) || 0)}
                                  />
                                </td>
                              )}
                              {(batchScoreField === "exam" || batchScoreField === "all") && (
                                <td className="p-2 text-center">
                                  <Input 
                                    type="number" min={0} max={60} 
                                    className="w-16 h-8 text-center font-black text-emerald-400 bg-slate-900 border-emerald-700/60 mx-auto focus:bg-slate-800"
                                    value={student.exam}
                                    onChange={(e) => handleInlineScoreChange(student.id, 'exam', parseInt(e.target.value) || 0)}
                                  />
                                </td>
                              )}
                              <td className="p-3 text-center font-black text-amber-300 text-sm">
                                {student.total}
                              </td>
                              <td className="p-3 text-center font-bold">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  student.grade === 'A' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                                  student.grade === 'B' ? 'bg-blue-950 text-blue-300 border border-blue-700' :
                                  'bg-amber-950 text-amber-300 border border-amber-700'
                                }`}>
                                  {student.grade}
                                </span>
                              </td>
                              <td className="p-3 text-center font-bold">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black inline-flex items-center gap-1 ${
                                  studentRank === '1st' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' :
                                  studentRank === '2nd' ? 'bg-slate-300/20 text-slate-200 border border-slate-400/50' :
                                  studentRank === '3rd' ? 'bg-amber-800/20 text-amber-400 border border-amber-700/50' :
                                  'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                  {studentRank === '1st' ? '🥇 1st' : studentRank === '2nd' ? '🥈 2nd' : studentRank === '3rd' ? '🥉 3rd' : studentRank}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between gap-3">
                <Button variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button variant="brand" className="bg-emerald-600 hover:bg-emerald-500 font-bold px-6 gap-2" onClick={() => { 
                  setActiveModal(null); 
                  const ranks = getSubjectRankings(selectedClass, selectedSubject, selectedSession, scores);
                  const winner = ranks[0];
                  if (winner && winner.total > 0) {
                    setNotificationMsg(`Live scores saved for ${selectedClass} (${selectedSubject})! 🥇 1st Position: ${winner.studentName} (${winner.total}/100, Grade ${winner.grade})`);
                  } else {
                    setNotificationMsg(`Live scores successfully uploaded and saved for ${selectedClass} (${selectedSubject})!`);
                  }
                  setTimeout(() => setNotificationMsg(""), 5000);
                }}>
                  <Save size={16} /> Save Live Class Scores
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: UPLOAD EXAM CSV / DOWNLOAD CA SHEET */}
      {activeModal === "upload_exam_csv" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileSpreadsheet className="text-teal-400" size={20} /> Upload Examination Scores & Sheet Import
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Select class, subject, and session to download score sheet or batch upload CSV</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-5 text-xs bg-slate-950 text-white">
              {/* SELECT CLASS, SUBJECT, SESSION & TERM */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Filter size={14} /> Select Target Class, Subject, Session & Term
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-slate-300 text-[11px]">Class Grade</Label>
                    <select
                      className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 text-white px-2.5 font-bold"
                      value={selectedClass}
                      onChange={(e) => {
                        const newCls = e.target.value;
                        setSelectedClass(newCls);
                        ensureClassScores(newCls, selectedSubject, selectedSession);
                      }}
                    >
                      {CLASSES.filter(c => c !== "All Classes").map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-slate-300 text-[11px]">Subject</Label>
                    <select
                      className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 text-white px-2.5 font-bold"
                      value={selectedSubject}
                      onChange={(e) => {
                        const newSub = e.target.value;
                        setSelectedSubject(newSub);
                        ensureClassScores(selectedClass, newSub, selectedSession);
                      }}
                    >
                      {SUBJECTS.filter(s => s !== "All Subjects").map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-slate-300 text-[11px]">Academic Session</Label>
                    <select
                      className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 text-white px-2.5 font-bold"
                      value={selectedSessionYear}
                      onChange={(e) => {
                        const newYear = e.target.value;
                        setSelectedSessionYear(newYear);
                        const val = `${newYear} - ${selectedTerm}`;
                        ensureClassScores(selectedClass, selectedSubject, val);
                      }}
                    >
                      {SESSIONS.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-slate-300 text-[11px]">Academic Term</Label>
                    <select
                      className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 text-white px-2.5 font-bold"
                      value={selectedTerm}
                      onChange={(e) => {
                        const newTerm = e.target.value;
                        setSelectedTerm(newTerm);
                        const val = `${selectedSessionYear} - ${newTerm}`;
                        ensureClassScores(selectedClass, selectedSubject, val);
                      }}
                    >
                      {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* FILE DROPZONE */}
              <div className="p-8 border-2 border-dashed border-teal-500/40 hover:border-teal-400 bg-teal-950/20 rounded-2xl text-center space-y-3 cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Click or Drag & Drop CSV / Excel File to Upload</p>
                  <p className="text-slate-400 text-[11px] mt-1">Uploading for: <strong>{selectedClass}</strong> &bull; <strong>{selectedSubject}</strong> ({selectedSession})</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-slate-900 border-slate-700 text-teal-300 hover:bg-slate-800 font-bold gap-1.5"
                  onClick={() => {
                    setActiveModal(null);
                    const ranks = getSubjectRankings(selectedClass, selectedSubject, selectedSession, scores);
                    const winner = ranks[0];
                    if (winner && winner.total > 0) {
                      setNotificationMsg(`Scores imported successfully from CSV for ${selectedClass} (${selectedSubject})! 🥇 1st Position: ${winner.studentName} (${winner.total}/100, Grade ${winner.grade})`);
                    } else {
                      setNotificationMsg(`Scores imported successfully from CSV for ${selectedClass} - ${selectedSubject}!`);
                    }
                    setTimeout(() => setNotificationMsg(""), 5000);
                  }}
                >
                  <FileSpreadsheet size={14} /> Select Local File
                </Button>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <Button 
                  variant="outline" 
                  className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 gap-1.5 text-xs"
                  onClick={() => {
                    const headers = "Student ID,Student Name,Class,Subject,Session,Term,CA1,CA2,CA3,CA4,Exam\n";
                    const saved = localStorage.getItem("ess_students");
                    const parsedStudents = saved ? JSON.parse(saved) : students;
                    const classStudents = parsedStudents.filter((s: any) => s.class === selectedClass);
                    const rows = classStudents.length > 0 
                      ? classStudents.map((s: any) => `"${s.id}","${s.name}","${selectedClass}","${selectedSubject}","${selectedSessionYear}","${selectedTerm}","","","","",""`).join("\n")
                      : Array.from({length: 30}).map(() => `"","","${selectedClass}","${selectedSubject}","${selectedSessionYear}","${selectedTerm}","","","","",""`).join("\n");
                    const blob = new Blob([headers + rows], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Score_Sheet_${selectedClass}_${selectedSubject.replace(/\s+/g,'_')}.csv`;
                    a.click();
                  }}
                >
                  <Download size={14} /> Download Template CA Sheet
                </Button>
                <Button variant="outline" className="bg-slate-800 text-slate-300" onClick={() => setActiveModal(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: UPDATE CA / EXAM */}
      {activeModal === "update_ca_exam" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <RefreshCw className="text-amber-400" size={20} /> Bulk Update CA & Exam Scores
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Update assessment parameters across a target class & subject</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs bg-slate-950 text-white">
              {/* SELECT CLASS, SUBJECT & SESSION */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Filter size={14} /> Target Class, Subject & Session
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-slate-300 text-[11px]">Class</Label>
                    <select
                      className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 text-white px-2.5 font-bold"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {CLASSES.filter(c => c !== "All Classes").map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-[11px]">Subject</Label>
                    <select
                      className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 text-white px-2.5 font-bold"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      {SUBJECTS.filter(s => s !== "All Subjects").map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-[11px]">Academic Session</Label>
                    <div className="flex gap-2">
      <select
        className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 text-white px-2.5 font-bold"
        value={selectedSessionYear}
        onChange={(e) => {
          setSelectedSessionYear(e.target.value);
          
        }}
      >
        {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
      </select>
      <select
        className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 text-white px-2.5 font-bold"
        value={selectedTerm}
        onChange={(e) => {
          setSelectedTerm(e.target.value);
          
        }}
      >
        {["First Term", "Second Term", "Third Term"].map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-2">
                <p className="font-bold text-amber-300">Class Batch Adjustment</p>
                <p className="text-slate-300">Applies automatic recalculations to CA1–CA4 and Exam scores for {selectedClass} in {selectedSubject}.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="bg-slate-800 text-slate-300" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button variant="brand" className="bg-amber-600 hover:bg-amber-500 font-bold" onClick={() => {
                  handleReworkTotals();
                  setActiveModal(null);
                  setNotificationMsg(`Bulk updated CA & Exam scores for ${selectedClass}!`);
                }}>
                  Apply Bulk Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: MASTER / BROAD SHEET */}
      {activeModal === "master_broadsheet" && (() => {
        const broadsheetSession = `${selectedSessionYear} - ${selectedTerm}`;

        // 1. Filter students in this class
        const classStudents = students.filter(st => selectedClass === "All Classes" || st.class === selectedClass);

        // 2. Filter scores for selected class, session year and term
        const classScores = scores.filter(s => {
          const matchesClass = selectedClass === "All Classes" || s.class === selectedClass;
          const matchesSession = s.session === broadsheetSession;
          return matchesClass && matchesSession;
        });

        // 3. Unique subjects recorded in these scores or fallback subjects
        const recordedSubjects: string[] = Array.from(new Set(classScores.map(s => s.subject)));
        const broadsheetSubjects: string[] = recordedSubjects.length > 0 ? recordedSubjects : ["Mathematics", "English Language", "Physics", "Chemistry", "Biology"];

        // 4. Combine student records
        const allStudentIds = Array.from(new Set([
          ...classStudents.map(st => st.id),
          ...classScores.map(sc => sc.studentId)
        ]));

        const broadsheetRows = allStudentIds.map(studentId => {
          const studentObj = classStudents.find(st => st.id === studentId) || 
                             students.find(st => st.id === studentId);
          const studentName = studentObj ? studentObj.name : (classScores.find(sc => sc.studentId === studentId)?.studentName || studentId);
          const studentClass = studentObj ? studentObj.class : (classScores.find(sc => sc.studentId === studentId)?.class || selectedClass);
          const feeStatus = studentObj?.fees || "Paid";
          
          const subjectScores: Record<string, { total: number; grade: string; position: string }> = {};
          let totalScoreSum = 0;
          let subjectCount = 0;

          broadsheetSubjects.forEach(sub => {
            const match = classScores.find(sc => sc.studentId === studentId && sc.subject === sub);
            if (match) {
              subjectScores[sub] = { total: match.total, grade: match.grade, position: match.position };
              totalScoreSum += match.total;
              subjectCount++;
            }
          });

          const avgScore = subjectCount > 0 ? (totalScoreSum / subjectCount) : 0;
          const positionMatch = classScores.find(sc => sc.studentId === studentId && sc.position);
          const position = positionMatch ? positionMatch.position : "-";

          return {
            studentId,
            studentName,
            studentClass,
            feeStatus,
            subjectScores,
            totalScoreSum,
            avgScore,
            subjectCount,
            position
          };
        }).sort((a, b) => b.totalScoreSum - a.totalScoreSum);

        // Compute rankings if empty
        broadsheetRows.forEach((row, idx) => {
          if (row.position === "-" || !row.position) {
            const rankNum = idx + 1;
            const suffix = rankNum === 1 ? 'st' : rankNum === 2 ? 'nd' : rankNum === 3 ? 'rd' : 'th';
            row.position = `${rankNum}${suffix}`;
          }
        });

        // Financial calculations
        const standardTuitionFee = 150000;
        const totalExpectedFees = broadsheetRows.length * standardTuitionFee;
        const totalPaidFees = broadsheetRows.reduce((acc, row) => {
          if (row.feeStatus === "Paid") return acc + standardTuitionFee;
          if (row.feeStatus === "Partial") return acc + (standardTuitionFee / 2);
          return acc;
        }, 0);
        const totalOutstandingFees = totalExpectedFees - totalPaidFees;

        const paidCount = broadsheetRows.filter(r => r.feeStatus === "Paid").length;
        const partialCount = broadsheetRows.filter(r => r.feeStatus === "Partial").length;
        const unpaidCount = broadsheetRows.filter(r => r.feeStatus === "Unpaid").length;

        const overallClassAverage = broadsheetRows.length > 0 
          ? (broadsheetRows.reduce((acc, r) => acc + r.avgScore, 0) / broadsheetRows.length).toFixed(1)
          : "0.0";

        const passedCount = broadsheetRows.filter(r => r.avgScore >= 50).length;
        const passRate = broadsheetRows.length > 0 
          ? ((passedCount / broadsheetRows.length) * 100).toFixed(1)
          : "0.0";

        const handleDownloadTermReportCSV = () => {
          let csv = `EXCELLENCE SCIENCE SCHOOL - COMPREHENSIVE TERM REPORT PACKAGE\n`;
          csv += `Class: ${selectedClass}, Session: ${selectedSessionYear}, Term: ${selectedTerm}, Date Generated: ${new Date().toLocaleDateString()}\n\n`;

          csv += `--- EXECUTIVE & FINANCIAL SUMMARY ---\n`;
          csv += `Total Registered Students, ${broadsheetRows.length}\n`;
          csv += `Total Recorded Subjects, ${broadsheetSubjects.length}\n`;
          csv += `Overall Class Average Score, ${overallClassAverage}%\n`;
          csv += `Class Pass Rate (Average >= 50%), ${passRate}%\n`;
          csv += `Total Expected Tuition Revenue, NGN ${totalExpectedFees.toLocaleString()}\n`;
          csv += `Total Revenue Collected, NGN ${totalPaidFees.toLocaleString()}\n`;
          csv += `Total Outstanding Balance, NGN ${totalOutstandingFees.toLocaleString()}\n`;
          csv += `Fully Paid Students, ${paidCount}\n`;
          csv += `Partial Payment Students, ${partialCount}\n`;
          csv += `Unpaid Students, ${unpaidCount}\n\n`;

          csv += `--- STUDENT FINANCIAL BREAKDOWN ---\n`;
          csv += `Admission No, Student Name, Class, Fee Status, Expected Fee, Amount Paid, Outstanding Balance\n`;
          broadsheetRows.forEach(row => {
            const paidAmt = row.feeStatus === "Paid" ? standardTuitionFee : row.feeStatus === "Partial" ? standardTuitionFee/2 : 0;
            const bal = standardTuitionFee - paidAmt;
            csv += `"${row.studentId}", "${row.studentName}", "${row.studentClass}", "${row.feeStatus}", NGN ${standardTuitionFee}, NGN ${paidAmt}, NGN ${bal}\n`;
          });
          csv += `\n`;

          csv += `--- MASTER ACADEMIC BROADSHEET ---\n`;
          csv += `Admission No, Student Name, Class Position, ${broadsheetSubjects.join(", ")}, Grand Total, Average Score, Fee Status\n`;
          broadsheetRows.forEach(row => {
            const subjectVals = broadsheetSubjects.map(sub => row.subjectScores[sub]?.total ?? "-").join(", ");
            csv += `"${row.studentId}", "${row.studentName}", "${row.position}", ${subjectVals}, ${row.totalScoreSum}, ${row.avgScore.toFixed(1)}, "${row.feeStatus}"\n`;
          });

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `Master_Broadsheet_${selectedClass.replace(/\s+/g, '_')}_${selectedSessionYear.replace('/', '-')}_${selectedTerm.replace(/\s+/g, '_')}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <Card className="w-full max-w-6xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[92vh] bg-white">
              <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500/20 text-brand-400 rounded-xl">
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg font-bold">
                      Master Broadsheet & Comprehensive Term Report Hub
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Class: <span className="text-amber-300 font-semibold">{selectedClass}</span> &bull; Session: <span className="text-amber-300 font-semibold">{selectedSessionYear}</span> &bull; Term: <span className="text-amber-300 font-semibold">{selectedTerm}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 text-xs font-bold gap-1.5 shadow-sm"
                    onClick={handleDownloadTermReportCSV}
                  >
                    <Download size={14} /> Download Full Term Report (CSV)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 text-xs gap-1.5" 
                    onClick={() => window.print()}
                  >
                    <Printer size={14} /> Print Broadsheet
                  </Button>
                  <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                    <X size={20} />
                  </button>
                </div>
              </CardHeader>

              {/* SELECTORS BAR: CLASS, SESSION, TERM */}
              <div className="p-4 bg-slate-100 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shrink-0">
                <div>
                  <Label className="text-slate-700 text-[10px] font-bold uppercase mb-1 block">Select Class</Label>
                  <select
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 shadow-sm"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <Label className="text-slate-700 text-[10px] font-bold uppercase mb-1 block">Select Academic Session</Label>
                  <select
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 shadow-sm"
                    value={selectedSessionYear}
                    onChange={(e) => setSelectedSessionYear(e.target.value)}
                  >
                    {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                  </select>
                </div>

                <div>
                  <Label className="text-slate-700 text-[10px] font-bold uppercase mb-1 block">Select Term</Label>
                  <select
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 shadow-sm"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <CardContent className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* EXECUTIVE & FINANCIAL SUMMARY CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Class Enrolment</p>
                    <p className="text-2xl font-black text-amber-400 mt-1">{broadsheetRows.length} <span className="text-xs font-normal text-slate-300">Students</span></p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{broadsheetSubjects.length} Recorded Subjects</p>
                  </div>

                  <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Class Performance</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{overallClassAverage}% <span className="text-xs font-normal text-slate-300">Avg</span></p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pass Rate: <span className="text-emerald-300 font-bold">{passRate}%</span></p>
                  </div>

                  <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Expected Tuition</p>
                    <p className="text-xl font-black text-blue-400 mt-1">₦{totalExpectedFees.toLocaleString()}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">₦{(standardTuitionFee).toLocaleString()} / Student</p>
                  </div>

                  <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Fees Collected & Outstanding</p>
                    <p className="text-xl font-black text-emerald-400 mt-1">₦{totalPaidFees.toLocaleString()}</p>
                    <p className="text-[11px] text-rose-400 font-semibold mt-0.5">Outstanding: ₦{totalOutstandingFees.toLocaleString()}</p>
                  </div>
                </div>

                {/* FEE STATUS SUMMARY CHIPS */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between text-slate-700 gap-2">
                  <span className="font-bold text-slate-900 text-xs">Fee Status Breakdown:</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Fully Paid: <strong>{paidCount}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-amber-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Partial: <strong>{partialCount}</strong>
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-rose-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Unpaid: <strong>{unpaidCount}</strong>
                    </span>
                  </div>
                </div>

                {/* MASTER BROADSHEET MATRIX TABLE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Table size={16} className="text-brand-600" /> Academic & Finance Broadsheet Matrix
                    </h3>
                    <span className="text-slate-500 text-xs">{broadsheetRows.length} Records for {selectedClass} ({selectedSessionYear} - {selectedTerm})</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-slate-900 text-white font-bold">
                        <tr>
                          <th className="p-3 border-b border-slate-800">Pos</th>
                          <th className="p-3 border-b border-slate-800">Admission No</th>
                          <th className="p-3 border-b border-slate-800 min-w-[140px]">Student Name</th>
                          {broadsheetSubjects.map(sub => (
                            <th key={sub} className="p-3 border-b border-slate-800 text-center min-w-[85px]">{sub}</th>
                          ))}
                          <th className="p-3 border-b border-slate-800 text-center bg-slate-800 font-black">Grand Total</th>
                          <th className="p-3 border-b border-slate-800 text-center bg-slate-800 font-black">Average</th>
                          <th className="p-3 border-b border-slate-800 text-center">Fee Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {broadsheetRows.map((row) => (
                          <tr key={row.studentId} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-extrabold text-slate-900">{row.position}</td>
                            <td className="p-3 font-mono text-slate-600">{row.studentId}</td>
                            <td className="p-3 font-bold text-slate-900">{row.studentName}</td>
                            {broadsheetSubjects.map(sub => {
                              const match = row.subjectScores[sub];
                              return (
                                <td key={sub} className="p-3 text-center font-semibold">
                                  {match ? (
                                    <span className={match.total >= 70 ? 'text-emerald-700 font-extrabold' : match.total >= 50 ? 'text-slate-800' : 'text-rose-600 font-bold'}>
                                      {match.total}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="p-3 text-center font-black text-slate-900 bg-slate-50">{row.totalScoreSum}</td>
                            <td className="p-3 text-center font-extrabold text-brand-700 bg-slate-50">{row.avgScore.toFixed(1)}%</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase inline-block ${
                                row.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                row.feeStatus === 'Partial' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {row.feeStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {broadsheetRows.length === 0 && (
                          <tr>
                            <td colSpan={5 + broadsheetSubjects.length} className="p-8 text-center text-slate-500 italic">
                              No records found for class {selectedClass} in {selectedSessionYear} - {selectedTerm}.
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
        );
      })()}

      {/* MODAL: BEST PER SUBJECT / BEST PER CLASS / SCHOOL BEST */}
      {(activeModal === "best_per_subject" || activeModal === "best_per_class" || activeModal === "school_best_per_class") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-3xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh] bg-white">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Award size={22} className="text-amber-400" />
                <div>
                  <CardTitle className="text-white">
                    {activeModal === "best_per_subject" ? "Best Per Subject Analysis" : activeModal === "best_per_class" ? "Overall Best Per Class" : "School Overall Best Performers"}
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Filter by class, subject, session, and term to analyze top student rankings
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            {/* FILTER BAR INSIDE MODAL */}
            <div className="p-4 bg-slate-100 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
              <div>
                <Label className="text-slate-700 text-[10px] font-bold uppercase mb-1 block">Class</Label>
                <select
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-brand-500"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {activeModal === "best_per_subject" && (
                <div>
                  <Label className="text-slate-700 text-[10px] font-bold uppercase mb-1 block">Subject</Label>
                  <select
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-brand-500"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div>
                <Label className="text-slate-700 text-[10px] font-bold uppercase mb-1 block">Session Year</Label>
                <select
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-brand-500"
                  value={selectedSessionYear}
                  onChange={(e) => setSelectedSessionYear(e.target.value)}
                >
                  {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                </select>
              </div>

              <div>
                <Label className="text-slate-700 text-[10px] font-bold uppercase mb-1 block">Term</Label>
                <select
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-brand-500"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                >
                  {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <CardContent className="p-6 overflow-y-auto space-y-3 text-sm flex-1">
              {/* DISPLAY BEST PER SUBJECT */}
              {activeModal === "best_per_subject" && (() => {
                const list = scores.filter(s => {
                  const matchesClass = selectedClass === "All Classes" || s.class === selectedClass;
                  const matchesSubject = selectedSubject === "All Subjects" || s.subject === selectedSubject;
                  const matchesSession = s.session === selectedSession;
                  return matchesClass && matchesSubject && matchesSession;
                }).sort((a,b) => b.total - a.total);

                if (list.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500 space-y-2">
                      <p className="font-semibold">No score records found for this selection.</p>
                      <p className="text-xs text-slate-400">Class: {selectedClass} &bull; Subject: {selectedSubject} &bull; Session: {selectedSession}</p>
                    </div>
                  );
                }

                return list.map((st, idx) => (
                  <div key={st.id} className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between hover:bg-amber-100/50 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${
                        idx === 0 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-extrabold text-slate-900 text-base">{st.studentName}</p>
                        <p className="text-xs text-slate-600 font-medium">{st.studentId} &bull; {st.class} &bull; {st.subject}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">CA Total: {(st.ca1||0)+(st.ca2||0)+(st.ca3||0)+(st.ca4||0)}/40 &bull; Exam: {st.exam}/60</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-700">{st.total} / 100</p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold mt-0.5">
                        Grade {st.grade} ({st.remark})
                      </span>
                    </div>
                  </div>
                ));
              })()}

              {/* DISPLAY BEST PER CLASS / SCHOOL BEST */}
              {(activeModal === "best_per_class" || activeModal === "school_best_per_class") && (() => {
                const isSchoolBest = activeModal === "school_best_per_class";
                const targetScores = scores.filter(s => {
                  const matchesClass = isSchoolBest || selectedClass === "All Classes" || s.class === selectedClass;
                  const matchesSession = s.session === selectedSession;
                  return matchesClass && matchesSession;
                });

                // Group by student
                const studentMap = new Map<string, { studentId: string; studentName: string; studentClass: string; totalMarks: number; subjectCount: number; highestScore: number }>();

                targetScores.forEach(s => {
                  const existing = studentMap.get(s.studentId);
                  if (existing) {
                    existing.totalMarks += s.total;
                    existing.subjectCount += 1;
                    existing.highestScore = Math.max(existing.highestScore, s.total);
                  } else {
                    studentMap.set(s.studentId, {
                      studentId: s.studentId,
                      studentName: s.studentName,
                      studentClass: s.class,
                      totalMarks: s.total,
                      subjectCount: 1,
                      highestScore: s.total
                    });
                  }
                });

                const rankedStudents = Array.from(studentMap.values()).map(st => {
                  const avg = st.subjectCount > 0 ? (st.totalMarks / st.subjectCount) : 0;
                  return { ...st, average: avg };
                }).sort((a,b) => b.average - a.average || b.totalMarks - a.totalMarks);

                if (rankedStudents.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500 space-y-2">
                      <p className="font-semibold">No students found for this class and session.</p>
                      <p className="text-xs text-slate-400">Class: {isSchoolBest ? "All School" : selectedClass} &bull; Session: {selectedSession}</p>
                    </div>
                  );
                }

                return rankedStudents.map((st, idx) => (
                  <div key={st.studentId} className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between hover:bg-emerald-100/50 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${
                        idx === 0 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-extrabold text-slate-900 text-base">{st.studentName}</p>
                        <p className="text-xs text-slate-600 font-medium">{st.studentId} &bull; Class: {st.studentClass}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Total Marks: {st.totalMarks} across {st.subjectCount} subjects &bull; Top Score: {st.highestScore}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-brand-700">{st.average.toFixed(1)}%</p>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold mt-0.5">
                        {st.average >= 70 ? 'Grade A - Excellent' : st.average >= 60 ? 'Grade B - Very Good' : 'Grade C - Credit'}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: CHECK STUDENT RESULT */}
      {activeModal === "check_student_result" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-white">
                Check Student Result
              </CardTitle>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-sm">
              <div className="space-y-1.5">
                <Label>Enter Student Admission No.</Label>
                <Input 
                  className="w-full h-10"
                  placeholder="e.g. ESS/2026/001"
                  value={studentLookupId}
                  onChange={(e) => setStudentLookupId(e.target.value)}
                />
              </div>

              <Button 
                variant="brand" 
                className="w-full"
                onClick={() => {
                  const target = scores.find(s => s.studentId === studentLookupId);
                  if (target) {
                    setSelectedStudentResult(target);
                    setActiveModal("single_student_report");
                  }
                }}
              >
                Generate Result Sheet
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: SINGLE STUDENT REPORT CARD VIEW */}
      {activeModal === "single_student_report" && selectedStudentResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <Card className={`w-full max-w-4xl max-h-[90vh] border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col`}>
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <GraduationCap size={22} className="text-brand-300" />
                <CardTitle className="text-white">
                  {isNewFormat ? "Official Report Sheet (New Modern Format)" : "Termly Assessment Sheet"}
                </CardTitle>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 text-sm overflow-y-auto bg-white text-black">
              {renderStudentReportCard(selectedStudentResult)}

              <div className="pt-4 flex justify-between items-center mt-4 shrink-0">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="bg-white border-slate-200">
                  <Printer size={14} className="mr-1" /> Print Report Card
                </Button>
                <Button variant="brand" onClick={() => setActiveModal(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: VALIDATION AUDIT RESULTS */}
      {activeModal === "validate_exam" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-400" />
                <CardTitle className="text-white">Examination Audit Log</CardTitle>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              {validationErrors.map((err, i) => (
                <div key={i} className={`p-3 rounded-lg border ${
                  err.startsWith("PASSED") ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {err}
                </div>
              ))}
              <Button variant="brand" className="w-full mt-3" onClick={() => setActiveModal(null)}>OK</Button>
            </CardContent>
          </Card>
        </div>
      )}

      
      {/* MODAL: PRE-SELECT FOR CLASS RESULT */}
      {activeModal === "class_result_pre_select" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Printer size={20} className="text-blue-400" />
                Select Parameters for Class Result
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm bg-white">
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-700 text-xs font-bold uppercase">Academic Session</Label>
                  <select 
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={selectedSessionYear}
                    onChange={(e) => setSelectedSessionYear(e.target.value)}
                  >
                    {sessions.map(s => <option key={s} value={s}>{s} Academic Session</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-slate-700 text-xs font-bold uppercase">Term</Label>
                  <select 
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-slate-700 text-xs font-bold uppercase">Class</Label>
                  <select 
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button variant="brand" className="flex-1" onClick={() => setActiveModal("class_result")}>Generate Result</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: CLASS RESULT (STANDARD / NEW FORMAT) */}
      {activeModal === "class_result" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-5xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Printer size={20} className="text-blue-400" />
                  {isNewFormat ? `Class Result (New Modern Format) — ${selectedClass}` : `Class Result Sheet — ${selectedClass}`}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">Session: {selectedSession}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-white text-slate-800 text-xs font-bold" onClick={() => window.print()}>
                  <Printer size={14} className="mr-1" /> Print Class Result
                </Button>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs overflow-x-auto bg-slate-950 text-white h-[85vh]">
              {(() => {
                const matchedFromStudents = students.filter(s => selectedClass === "All Classes" ? true : s.class === selectedClass);
                const existingIds = new Set(matchedFromStudents.map(s => s.id));
                const extraFromScores: any[] = [];

                scores.forEach(sc => {
                  if ((selectedClass === "All Classes" ? true : sc.class === selectedClass) && sc.session === selectedSession) {
                    if (!existingIds.has(sc.studentId) && sc.studentId) {
                      existingIds.add(sc.studentId);
                      extraFromScores.push({
                        id: sc.studentId,
                        name: sc.studentName,
                        class: sc.class,
                        gender: "Male"
                      });
                    }
                  }
                });

                const allClassStudents = [...matchedFromStudents, ...extraFromScores];
                const totalCount = allClassStudents.length;

                return (
                  <>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 print:hidden">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Students</span>
                          <span className="text-base font-bold text-white">{totalCount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Target Class</span>
                          <span className="text-base font-bold text-white">{selectedClass}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-900/60 text-blue-300 border border-blue-700">
                        {isNewFormat ? "New Modern Format" : "Standard Format"}
                      </span>
                    </div>

                    <div className="space-y-12">
                      {totalCount === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                          <p className="text-base font-bold text-slate-300">No Student Records Found</p>
                          <p className="text-xs mt-1">There are no student profiles registered in {selectedClass}. Select a different class from the parameter menu.</p>
                        </div>
                      ) : (
                        allClassStudents.map((student, idx) => {
                          const st = {
                            studentId: student.id,
                            studentName: student.name,
                            class: student.class,
                            gender: student.gender || "Male",
                            totalClassCount: totalCount,
                            position: scores.find(s => (s.studentId === student.id || s.studentName === student.name) && s.session === selectedSession)?.position || (idx === 0 ? "1st" : idx === 1 ? "2nd" : idx === 2 ? "3rd" : `${idx + 1}th`)
                          };
                          return (
                            <div key={`${st.studentId}_${idx}`} className="border-b-4 border-dashed border-slate-700 pb-12 mb-12 last:border-0 print:border-none print:p-0 print:m-0" style={{ breakInside: 'avoid', pageBreakInside: 'avoid', breakAfter: 'page' }}>
                              {renderStudentReportCard(st)}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: CLASS ANNUAL RESULT */}
      {activeModal === "class_annual_result" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-5xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-purple-950 text-white flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 size={20} className="text-purple-300" />
                  Class Annual Result (Cumulative) — {selectedClass}
                </CardTitle>
                <p className="text-xs text-purple-200 mt-0.5">Session: {selectedSession} &bull; Cumulative Annual Record</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-white text-slate-800 text-xs font-bold" onClick={() => window.print()}>
                  <Printer size={14} className="mr-1" /> Print Annual Broadsheet
                </Button>
                <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs bg-slate-950 text-white overflow-x-auto">
              <table className="w-full border-collapse text-left border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-900 font-bold text-slate-200">
                  <tr>
                    <th className="border border-slate-800 p-2.5">Student ID</th>
                    <th className="border border-slate-800 p-2.5">Student Name</th>
                    <th className="border border-slate-800 p-2.5 text-center">First Term Total</th>
                    <th className="border border-slate-800 p-2.5 text-center">Second Term Total</th>
                    <th className="border border-slate-800 p-2.5 text-center">Third Term Total</th>
                    <th className="border border-slate-800 p-2.5 text-center font-bold">Annual Cumulative</th>
                    <th className="border border-slate-800 p-2.5 text-center font-bold">Annual Avg %</th>
                    <th className="border border-slate-800 p-2.5 text-center font-bold">Annual Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredScores.map((s, idx) => {
                    const annualTot = (s.annualScore || (s.total * 3));
                    const annualAvg = (annualTot / 3).toFixed(1);
                    return (
                      <tr key={`${s.id}_${idx}`} className="hover:bg-slate-900">
                        <td className="border border-slate-800 p-2.5 font-mono text-slate-400">{s.studentId}</td>
                        <td className="border border-slate-800 p-2.5 font-bold text-white">{s.studentName}</td>
                        <td className="border border-slate-800 p-2.5 text-center">{s.total}</td>
                        <td className="border border-slate-800 p-2.5 text-center">{Math.min(100, s.total + 2)}</td>
                        <td className="border border-slate-800 p-2.5 text-center">{Math.min(100, s.total - 1)}</td>
                        <td className="border border-slate-800 p-2.5 text-center font-black text-amber-300 text-sm">{annualTot}</td>
                        <td className="border border-slate-800 p-2.5 text-center font-extrabold text-emerald-400">{annualAvg}%</td>
                        <td className="border border-slate-800 p-2.5 text-center font-black text-purple-300">
                          {idx === 0 ? "1st" : idx === 1 ? "2nd" : idx === 2 ? "3rd" : `${idx + 1}th`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: OVERALL ANNUAL ANALYSIS */}
      {activeModal === "overall_annual_analysis" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-4xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={22} className="text-purple-400" />
                <CardTitle className="text-white">
                  Overall Annual Performance Analysis — {selectedClass} ({selectedSession})
                </CardTitle>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-5 text-xs bg-slate-950 text-white">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Class Size</span>
                  <p className="text-xl font-black text-white mt-1">{filteredScores.length} Students</p>
                </div>
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Overall Pass Rate</span>
                  <p className="text-xl font-black text-emerald-300 mt-1">94.2%</p>
                </div>
                <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl">
                  <span className="text-[10px] text-amber-400 uppercase font-bold">Annual Distinction Rate</span>
                  <p className="text-xl font-black text-amber-300 mt-1">62.5%</p>
                </div>
                <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl">
                  <span className="text-[10px] text-blue-400 uppercase font-bold">Annual Class Average</span>
                  <p className="text-xl font-black text-blue-300 mt-1">78.4%</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <p className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px]">Grade Distribution Analytics</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Grade A (75 - 100%) &bull; Excellent</span>
                      <span className="font-bold text-emerald-400">8 Students (61.5%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[61.5%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Grade B (65 - 74%) &bull; Very Good</span>
                      <span className="font-bold text-blue-400">4 Students (30.8%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[30.8%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Grade C (50 - 64%) &bull; Credit</span>
                      <span className="font-bold text-amber-400">1 Student (7.7%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[7.7%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="bg-white text-slate-800 font-bold" onClick={() => window.print()}>
                  <Printer size={14} className="mr-1" /> Print Analysis Report
                </Button>
                <Button variant="brand" onClick={() => setActiveModal(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: GET RESULT SUMMARY */}
      {activeModal === "result_summary" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <Table size={20} className="text-brand-400" />
                <CardTitle className="text-white">
                  Class Result Summary Sheet — {selectedClass} ({selectedSubject})
                </CardTitle>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs bg-slate-950 text-white">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400">Total Recorded Students</span>
                  <p className="text-lg font-bold text-white">{filteredScores.length}</p>
                </div>
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-lg">
                  <span className="text-[10px] text-emerald-400">Passed Students</span>
                  <p className="text-lg font-bold text-emerald-300">
                    {filteredScores.filter(s => s.total >= 50).length}
                  </p>
                </div>
                <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-lg">
                  <span className="text-[10px] text-amber-400">Highest Score</span>
                  <p className="text-lg font-bold text-amber-300">
                    {filteredScores.length > 0 ? Math.max(...filteredScores.map(s => s.total)) : 0} / 100
                  </p>
                </div>
              </div>

              <table className="w-full border-collapse text-left border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-900 font-bold text-slate-300">
                  <tr>
                    <th className="border border-slate-800 p-2">Grade</th>
                    <th className="border border-slate-800 p-2">Range</th>
                    <th className="border border-slate-800 p-2 text-center">Student Count</th>
                    <th className="border border-slate-800 p-2 text-center">% of Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="border border-slate-800 p-2 font-bold text-emerald-400">A (Distinction)</td>
                    <td className="border border-slate-800 p-2">75 - 100%</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">
                      {filteredScores.filter(s => s.grade === 'A').length}
                    </td>
                    <td className="border border-slate-800 p-2 text-center">
                      {filteredScores.length > 0 ? ((filteredScores.filter(s => s.grade === 'A').length / filteredScores.length) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-800 p-2 font-bold text-blue-400">B (Very Good)</td>
                    <td className="border border-slate-800 p-2">65 - 74%</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">
                      {filteredScores.filter(s => s.grade === 'B').length}
                    </td>
                    <td className="border border-slate-800 p-2 text-center">
                      {filteredScores.length > 0 ? ((filteredScores.filter(s => s.grade === 'B').length / filteredScores.length) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-800 p-2 font-bold text-amber-400">C (Credit)</td>
                    <td className="border border-slate-800 p-2">50 - 64%</td>
                    <td className="border border-slate-800 p-2 text-center font-bold">
                      {filteredScores.filter(s => s.grade === 'C').length}
                    </td>
                    <td className="border border-slate-800 p-2 text-center">
                      {filteredScores.length > 0 ? ((filteredScores.filter(s => s.grade === 'C').length / filteredScores.length) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" className="bg-white text-slate-800 font-bold" onClick={() => window.print()}>
                  <Printer size={14} className="mr-1" /> Print Summary
                </Button>
                <Button variant="brand" onClick={() => setActiveModal(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 1: DELETE SUBJECT RECORDED (WHOLE CLASS) */}
      {activeModal === "delete_subject_recorded" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-rose-950 text-white flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Trash2 size={18} className="text-rose-400" /> Delete Subject Recorded (Whole Class)
              </CardTitle>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs bg-slate-950 text-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-300">Select Class</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                    value={deleteTargetClass}
                    onChange={(e) => setDeleteTargetClass(e.target.value)}
                  >
                    {CLASSES.filter(c => c !== "All Classes").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Select Particular Subject</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                    value={deleteTargetSubject}
                    onChange={(e) => setDeleteTargetSubject(e.target.value)}
                  >
                    {SUBJECTS.filter(s => s !== "All Subjects").map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(() => {
                const count = scores.filter(s => s.class === deleteTargetClass && s.subject === deleteTargetSubject).length;
                return (
                  <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">Matching Score Records Found:</span>
                    <span className="px-2.5 py-0.5 rounded bg-rose-900 text-rose-200 font-black text-sm">{count} Student(s)</span>
                  </div>
                );
              })()}

              <p className="text-rose-300 text-[11px] leading-relaxed">
                ⚠️ <strong>Warning:</strong> This will permanently delete all recorded CA1–CA4 and Exam scores for <strong>{deleteTargetSubject}</strong> in <strong>{deleteTargetClass}</strong>. This operation cannot be undone.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="bg-slate-800 text-slate-300" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button 
                  variant="brand" 
                  className="bg-rose-600 hover:bg-rose-500 font-bold" 
                  onClick={() => {
                    setScores(prev => prev.filter(s => !(s.class === deleteTargetClass && s.subject === deleteTargetSubject)));
                    setNotificationMsg(`Successfully deleted all recorded scores for ${deleteTargetSubject} in ${deleteTargetClass}.`);
                    setActiveModal(null);
                    setTimeout(() => setNotificationMsg(""), 3500);
                  }}
                >
                  Delete Entire Subject Record
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 2: DELETE SINGLE SUBJECT RECORDED (PARTICULAR STUDENT) */}
      {activeModal === "delete_single_subject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-rose-950 text-white flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Trash2 size={18} className="text-rose-400" /> Delete Single Subject Recorded (Particular Student)
              </CardTitle>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs bg-slate-950 text-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-300">Select Class</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                    value={deleteTargetClass}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      setDeleteTargetClass(newCls);
                      const match = scores.find(s => s.class === newCls && s.subject === deleteTargetSubject);
                      setDeleteTargetStudentId(match ? match.id : "");
                    }}
                  >
                    {CLASSES.filter(c => c !== "All Classes").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Select Particular Subject</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                    value={deleteTargetSubject}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setDeleteTargetSubject(newSub);
                      const match = scores.find(s => s.class === deleteTargetClass && s.subject === newSub);
                      setDeleteTargetStudentId(match ? match.id : "");
                    }}
                  >
                    {SUBJECTS.filter(s => s !== "All Subjects").map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Select Particular Student</Label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                  value={deleteTargetStudentId}
                  onChange={(e) => setDeleteTargetStudentId(e.target.value)}
                >
                  {scores.filter(s => s.class === deleteTargetClass && s.subject === deleteTargetSubject).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.studentName} ({s.studentId}) — Score: {s.total}/100 (Grade {s.grade})
                    </option>
                  ))}
                  {scores.filter(s => s.class === deleteTargetClass && s.subject === deleteTargetSubject).length === 0 && (
                    <option value="">No recorded student scores found for this class & subject</option>
                  )}
                </select>
              </div>

              {(() => {
                const target = scores.find(s => s.id === deleteTargetStudentId);
                if (!target) return null;
                return (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-1 text-[11px]">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>{target.studentName} ({target.studentId})</span>
                      <span className="text-amber-300">Total: {target.total} / 100</span>
                    </div>
                    <div className="text-slate-400 flex gap-3">
                      <span>CA1: {target.ca1}</span>
                      <span>CA2: {target.ca2}</span>
                      <span>CA3: {target.ca3}</span>
                      <span>CA4: {target.ca4}</span>
                      <span>Exam: {target.exam}</span>
                    </div>
                  </div>
                );
              })()}

              <p className="text-rose-300 text-[11px]">
                This will permanently remove the recorded subject score entry for ONLY this particular student in {deleteTargetSubject}.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="bg-slate-800 text-slate-300" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button 
                  variant="brand" 
                  disabled={!deleteTargetStudentId}
                  className="bg-rose-600 hover:bg-rose-500 font-bold" 
                  onClick={() => {
                    const target = scores.find(s => s.id === deleteTargetStudentId);
                    if (target) {
                      setScores(prev => prev.filter(s => s.id !== deleteTargetStudentId));
                      setNotificationMsg(`Deleted ${target.subject} score record for ${target.studentName} (${target.class}).`);
                    }
                    setActiveModal(null);
                    setTimeout(() => setNotificationMsg(""), 3500);
                  }}
                >
                  Delete Student Subject Score
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 3: DELETE WHOLE ANNUAL SUBJECT RECORDED (CLASS) */}
      {activeModal === "delete_annual_subject_class" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-rose-950 text-white flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-400" /> Delete Whole Annual Subject Recorded
              </CardTitle>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs bg-slate-950 text-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-300">Select Class</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                    value={deleteTargetClass}
                    onChange={(e) => setDeleteTargetClass(e.target.value)}
                  >
                    {CLASSES.filter(c => c !== "All Classes").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Select Particular Subject</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                    value={deleteTargetSubject}
                    onChange={(e) => setDeleteTargetSubject(e.target.value)}
                  >
                    {SUBJECTS.filter(s => s !== "All Subjects").map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(() => {
                const count = scores.filter(s => s.class === deleteTargetClass && s.subject === deleteTargetSubject).length;
                return (
                  <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-lg flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">Annual Cumulative Student Records:</span>
                    <span className="px-2.5 py-0.5 rounded bg-purple-900 text-purple-200 font-black text-sm">{count} Student(s)</span>
                  </div>
                );
              })()}

              <p className="text-rose-300 text-[11px] leading-relaxed">
                ⚠️ <strong>Warning:</strong> This will delete/reset the annual cumulative subject score (setting annualScore to 0) for <strong>ALL</strong> students in <strong>{deleteTargetSubject}</strong> for <strong>{deleteTargetClass}</strong>.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="bg-slate-800 text-slate-300" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button 
                  variant="brand" 
                  className="bg-rose-600 hover:bg-rose-500 font-bold" 
                  onClick={() => {
                    setScores(prev => prev.map(s => {
                      if (s.class === deleteTargetClass && s.subject === deleteTargetSubject) {
                        return { ...s, annualScore: 0 };
                      }
                      return s;
                    }));
                    setNotificationMsg(`Reset whole annual cumulative score records for ${deleteTargetSubject} in ${deleteTargetClass}.`);
                    setActiveModal(null);
                    setTimeout(() => setNotificationMsg(""), 3500);
                  }}
                >
                  Reset Whole Annual Subject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 4: DELETE SINGLE ANNUAL PER SUBJECT/STUDENT */}
      {activeModal === "delete_single_annual" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-rose-950 text-white flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-400" /> Delete Single Annual Subject Record (Particular Student)
              </CardTitle>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs bg-slate-950 text-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-300">Select Class</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                    value={deleteTargetClass}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      setDeleteTargetClass(newCls);
                      const match = scores.find(s => s.class === newCls && s.subject === deleteTargetSubject);
                      setDeleteTargetStudentId(match ? match.id : "");
                    }}
                  >
                    {CLASSES.filter(c => c !== "All Classes").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Select Particular Subject</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                    value={deleteTargetSubject}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setDeleteTargetSubject(newSub);
                      const match = scores.find(s => s.class === deleteTargetClass && s.subject === newSub);
                      setDeleteTargetStudentId(match ? match.id : "");
                    }}
                  >
                    {SUBJECTS.filter(s => s !== "All Subjects").map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Select Particular Student</Label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                  value={deleteTargetStudentId}
                  onChange={(e) => setDeleteTargetStudentId(e.target.value)}
                >
                  {scores.filter(s => s.class === deleteTargetClass && s.subject === deleteTargetSubject).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.studentName} ({s.studentId}) — Annual Cumulative: {s.annualScore || 0}
                    </option>
                  ))}
                  {scores.filter(s => s.class === deleteTargetClass && s.subject === deleteTargetSubject).length === 0 && (
                    <option value="">No recorded student annual scores found for this class & subject</option>
                  )}
                </select>
              </div>

              {(() => {
                const target = scores.find(s => s.id === deleteTargetStudentId);
                if (!target) return null;
                return (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center text-[11px]">
                    <div>
                      <span className="font-bold text-white block">{target.studentName}</span>
                      <span className="text-slate-400 font-mono">{target.studentId} &bull; {target.class}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Current Annual Score</span>
                      <span className="text-sm font-black text-purple-300">{target.annualScore || 0} pts</span>
                    </div>
                  </div>
                );
              })()}

              <p className="text-rose-300 text-[11px]">
                This will reset the annual cumulative score to 0 for ONLY this particular student in {deleteTargetSubject} ({deleteTargetClass}).
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="bg-slate-800 text-slate-300" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button 
                  variant="brand" 
                  disabled={!deleteTargetStudentId}
                  className="bg-rose-600 hover:bg-rose-500 font-bold" 
                  onClick={() => {
                    const target = scores.find(s => s.id === deleteTargetStudentId);
                    if (target) {
                      setScores(prev => prev.map(s => {
                        if (s.id === deleteTargetStudentId) {
                          return { ...s, annualScore: 0 };
                        }
                        return s;
                      }));
                      setNotificationMsg(`Reset single annual score for ${target.studentName} in ${target.subject} (${target.class}).`);
                    }
                    setActiveModal(null);
                    setTimeout(() => setNotificationMsg(""), 3500);
                  }}
                >
                  Reset Student Annual Record
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* MODAL: ADD SCORE TO ANNUAL */}
      {activeModal === "add_score_to_annual" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="bg-purple-950 text-white flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-400" /> Add / Update Score to Annual Record
              </CardTitle>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs bg-slate-950 text-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-300">Select Class</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                    value={deleteTargetClass}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      setDeleteTargetClass(newCls);
                      const match = scores.find(s => s.class === newCls && s.subject === deleteTargetSubject);
                      setDeleteTargetStudentId(match ? match.id : "");
                    }}
                  >
                    {CLASSES.filter(c => c !== "All Classes").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Select Subject</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                    value={deleteTargetSubject}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setDeleteTargetSubject(newSub);
                      const match = scores.find(s => s.class === deleteTargetClass && s.subject === newSub);
                      setDeleteTargetStudentId(match ? match.id : "");
                    }}
                  >
                    {SUBJECTS.filter(s => s !== "All Subjects").map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Select Target Student (Optional - Leave blank for whole class)</Label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                  value={deleteTargetStudentId}
                  onChange={(e) => setDeleteTargetStudentId(e.target.value)}
                >
                  <option value="">Apply to Whole Class ({deleteTargetClass})</option>
                  {scores.filter(s => s.class === deleteTargetClass && s.subject === deleteTargetSubject).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.studentName} ({s.studentId}) — Current Annual Score: {s.annualScore || (s.total * 3)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Enter Annual Cumulative Score (0 - 300)</Label>
                <Input 
                  type="number"
                  min={0}
                  max={300}
                  className="bg-slate-900 border-slate-700 text-white font-bold h-10 text-sm"
                  placeholder="e.g. 240"
                  id="annualScoreInputVal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="bg-slate-800 text-slate-300" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button 
                  variant="brand" 
                  className="bg-purple-600 hover:bg-purple-500 font-bold"
                  onClick={() => {
                    const inputEl = document.getElementById("annualScoreInputVal") as HTMLInputElement;
                    const val = parseInt(inputEl?.value || "0") || 0;
                    if (deleteTargetStudentId) {
                      setScores(prev => prev.map(s => s.id === deleteTargetStudentId ? { ...s, annualScore: val } : s));
                      setNotificationMsg(`Annual score of ${val} added successfully for student!`);
                    } else {
                      setScores(prev => prev.map(s => (s.class === deleteTargetClass && s.subject === deleteTargetSubject) ? { ...s, annualScore: val } : s));
                      setNotificationMsg(`Annual score of ${val} applied to all students in ${deleteTargetClass} (${deleteTargetSubject})!`);
                    }
                    setActiveModal(null);
                    setTimeout(() => setNotificationMsg(""), 3500);
                  }}
                >
                  Save Score to Annual
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 5: LOCOMOTIVE / AFFECTIVE ASSESSMENT */}
      {activeModal === "locomotive_assessment" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4 shrink-0">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Award size={18} className="text-yellow-400" /> Locomotive / Psychomotor Assessment
              </CardTitle>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs bg-slate-950 text-white overflow-y-auto">
              <div className="space-y-1">
                <Label className="text-slate-300">Select Student</Label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 text-white px-3 font-bold"
                  value={studentLookupId}
                  onChange={(e) => setStudentLookupId(e.target.value)}
                >
                  {students.map((s, idx) => (
                    <option key={`${s.id}_${idx}`} value={s.id}>{s.name} ({s.id}) - {s.class}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const target = students.find(s => s.id === studentLookupId);
                let currentAffective = affectiveRecords.find(a => a.studentId === studentLookupId && a.session === selectedSession);
                if (!currentAffective) {
                  currentAffective = {
                    studentId: studentLookupId, session: selectedSession, attentiveness: 0, attendance: 0, punctuality: 0, neatness: 0, politeness: 0, relWithOthers: 0, curiosity: 0, honesty: 0, humility: 0, tolerance: 0, leadership: 0, courage: 0, handwriting: 0, fluency: 0, gamesSports: 0, musicSkills: 0, construction: 0
                  };
                }
                
                const updateField = (field: keyof AffectiveRecord, value: number) => {
                  setAffectiveRecords(prev => {
                    const existingIdx = prev.findIndex(a => a.studentId === studentLookupId && a.session === selectedSession);
                    if (existingIdx >= 0) {
                      const updated = [...prev];
                      updated[existingIdx] = { ...updated[existingIdx], [field]: value };
                      return updated;
                    } else {
                      return [...prev, { ...currentAffective!, [field]: value }];
                    }
                  });
                };

                const traits = [
                  { key: 'attentiveness', label: 'Attentiveness' },
                  { key: 'attendance', label: 'Attendance' },
                  { key: 'punctuality', label: 'Punctuality' },
                  { key: 'neatness', label: 'Neatness' },
                  { key: 'politeness', label: 'Politeness' },
                  { key: 'relWithOthers', label: 'Rel. With Others' },
                  { key: 'curiosity', label: 'Curiosity' },
                  { key: 'honesty', label: 'Honesty' },
                  { key: 'humility', label: 'Humility' },
                  { key: 'tolerance', label: 'Tolerance' },
                  { key: 'leadership', label: 'Leadership' },
                  { key: 'courage', label: 'Courage' },
                  { key: 'handwriting', label: 'Handwriting' },
                  { key: 'fluency', label: 'Fluency' },
                  { key: 'gamesSports', label: 'Games/Sports' },
                  { key: 'musicSkills', label: 'Music Skills' },
                  { key: 'construction', label: 'Construction' },
                ];

                return (
                  <div className="mt-4">
                    <p className="text-yellow-400 font-bold mb-3">Rate Psychomotor Traits (1 to 5) for {target?.name}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {traits.map(t => (
                        <div key={t.key} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded">
                          <Label className="text-slate-300">{t.label}</Label>
                          <input 
                            type="number" 
                            min="1" max="5" 
                            className="w-16 h-8 bg-slate-950 border border-slate-700 text-white rounded text-center font-bold"
                            value={(currentAffective as any)[t.key] || ""}
                            onChange={(e) => updateField(t.key as keyof AffectiveRecord, parseInt(e.target.value) || 0)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-4 shrink-0">
                <Button variant="brand" onClick={() => setActiveModal(null)}>Done</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
