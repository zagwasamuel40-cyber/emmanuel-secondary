import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  Users, 
  UserCheck, 
  UserX, 
  QrCode, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Calendar, 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  FileSpreadsheet,
  Camera,
  CameraOff,
  Phone,
  Shield,
  Sliders,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Save,
  FileText,
  History,
  Check,
  X,
  Volume2,
  VolumeX,
  HelpCircle
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useTeachers, Teacher } from "../../data/teachersData";
import { useStudents, Student, CLASSES } from "../../data/studentsData";
import { 
  useAttendance, 
  useStaffAttendance, 
  useQRScanLogs, 
  useIdCards,
  useAttendanceSettings,
  getTodayDateString,
  getTodayAttendanceSummary,
  recordStudentAttendance,
  recordStaffAttendance,
  recordManualAttendance,
  logScanEvent,
  ensureStudentHasIdCard,
  ensureStaffHasIdCard,
  calculateLateStatus
} from "../../data/idCardAndAttendanceData";
import { extractTokenFromScan } from "../../utils/qrCodeGenerator";
import { AttendanceStatus, AttendancePeriod } from "../../types/idCardAndAttendance";

// Audio Chime Helpers using Web Audio API
function playScanSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

function playScanDuplicateAlert() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(349.23, ctx.currentTime); // F4
    osc.frequency.setValueAtTime(261.63, ctx.currentTime + 0.12); // C4
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

export default function AttendanceOfficerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Primary data hooks
  const [teachers] = useTeachers();
  const [students] = useStudents();
  const [studentRecords] = useAttendance();
  const [staffRecords] = useStaffAttendance();
  const [scanLogs] = useQRScanLogs();
  const [idCards] = useIdCards();
  const [settings, setSettings] = useAttendanceSettings();

  // Active section from query param, defaults to 'overview'
  const activeSection = searchParams.get("section") || "overview";
  const setSection = (section: string) => {
    setSearchParams({ section });
  };

  // Today Date & Officer details
  const todayStr = getTodayDateString();
  const loggedInUserId = localStorage.getItem("loggedInUserId") || "STF/2026/088";
  const loggedInOfficer = teachers.find(t => t.id === loggedInUserId) || {
    id: "STF/2026/088",
    name: "Mr. Emmanuel Terhemba",
    role: "Chief Attendance Officer"
  };

  // Live summary
  const summary = useTodaySummary(teachers, students);

  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [isCameraSupported, setIsCameraSupported] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<{
    type: 'success' | 'duplicate' | 'error';
    title: string;
    message: string;
    person?: any;
    personType?: 'Student' | 'Staff';
    action?: 'check_in' | 'check_out';
    time?: string;
    status?: string;
  } | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const cooldownTimerRef = useRef<any>(null);

  // Filters & Search for tables
  const [tableSearch, setTableSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportRange, setReportRange] = useState<string>("today");

  // Manual Attendance Modal / Form
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualPersonType, setManualPersonType] = useState<'student' | 'staff'>('student');
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('Present');
  const [manualReason, setManualReason] = useState('');
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  // Clean up scanner on unmount or section change
  useEffect(() => {
    return () => {
      stopCameraScanner();
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [activeSection]);

  // Check hardware camera availability
  const checkCameraAvailability = async (): Promise<boolean> => {
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsCameraSupported(false);
        setCameraError("Camera API is not supported on this browser or environment.");
        return false;
      }
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setIsCameraSupported(false);
        setCameraError("No physical camera device was detected. You can use the Manual Attendance feature below.");
        return false;
      }
      setIsCameraSupported(true);
      return true;
    } catch (err: any) {
      setIsCameraSupported(false);
      setCameraError(err?.message || "Failed to initialize camera. Check device camera permissions.");
      return false;
    }
  };

  // Start Camera
  const startCameraScanner = async (targetType: 'student' | 'staff') => {
    setCameraError("");
    setScanFeedback(null);

    const hasCamera = await checkCameraAvailability();
    if (!hasCamera) return;

    const elementId = targetType === 'student' ? 'student-camera-reader' : 'staff-camera-reader';
    const element = document.getElementById(elementId);
    if (!element) {
      setTimeout(() => startCameraScanner(targetType), 150);
      return;
    }

    try {
      if (html5QrCodeRef.current) {
        await stopCameraScanner();
      }

      const qrScanner = new Html5Qrcode(elementId);
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleDecodedQR(decodedText, targetType);
        },
        () => {
          // Ignore transient frame misses
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      setIsScanning(false);
      setCameraError(err?.message || "Unable to start video feed. Ensure camera permissions are granted.");
    }
  };

  // Stop Camera
  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {}
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  // Handle Decoded QR code
  const handleDecodedQR = (rawText: string, targetType: 'student' | 'staff') => {
    if (isProcessing) return;
    setIsProcessing(true);

    const token = extractTokenFromScan(rawText);

    // 1. Locate card in stored ID cards
    const card = idCards.find(c => c.qrToken === token || c.studentId === token || c.barcode === token);

    let foundPerson: any = null;
    let personType: 'Student' | 'Staff' = targetType === 'student' ? 'Student' : 'Staff';

    if (targetType === 'student') {
      // Find student
      if (card && card.userType !== 'staff') {
        foundPerson = students.find(s => s.id === card.studentId);
      }
      if (!foundPerson) {
        foundPerson = students.find(s => s.id === token || s.name.toLowerCase() === rawText.toLowerCase());
      }

      if (!foundPerson) {
        if (settings.enableAudioFeedback) playScanDuplicateAlert();
        setScanFeedback({
          type: 'error',
          title: 'Student Not Found',
          message: `The scanned QR code is not associated with any registered student.`
        });
        resumeScanningAfterDelay();
        return;
      }

      personType = 'Student';
      const res = recordStudentAttendance({
        student: foundPerson,
        method: 'qr_scan',
        mode: 'auto',
        staffUser: { id: loggedInOfficer.id, name: loggedInOfficer.name }
      });

      // Audit Log
      logScanEvent(
        token,
        foundPerson,
        { id: loggedInOfficer.id, name: loggedInOfficer.name },
        'Attendance Recording',
        card?.cardStatus === 'deactivated' ? 'Card Deactivated' : 'Verified',
        'Attendance Officer Gate Terminal (Mobile/Web)',
        'student'
      );

      if (res.success) {
        if (settings.enableAudioFeedback) playScanSuccessChime();
        if (settings.enableVibrationFeedback && navigator.vibrate) navigator.vibrate(100);

        setScanFeedback({
          type: 'success',
          title: 'Attendance Recorded Successfully',
          message: res.message,
          person: foundPerson,
          personType: 'Student',
          action: res.action,
          time: res.record?.time,
          status: res.record?.status
        });
      } else {
        if (settings.enableAudioFeedback) playScanDuplicateAlert();
        setScanFeedback({
          type: 'duplicate',
          title: 'Duplicate Scan Detected',
          message: res.message,
          person: foundPerson,
          personType: 'Student',
          action: 'duplicate'
        });
      }

    } else {
      // Target: Staff
      if (card && card.userType === 'staff') {
        foundPerson = teachers.find(t => t.id === card.studentId);
      }
      if (!foundPerson) {
        foundPerson = teachers.find(t => t.id === token || t.name.toLowerCase() === rawText.toLowerCase());
      }

      if (!foundPerson) {
        if (settings.enableAudioFeedback) playScanDuplicateAlert();
        setScanFeedback({
          type: 'error',
          title: 'Staff Member Not Recognized',
          message: `The scanned QR code is not associated with any registered teacher or staff member.`
        });
        resumeScanningAfterDelay();
        return;
      }

      personType = 'Staff';
      const res = recordStaffAttendance({
        staff: foundPerson,
        method: 'qr_scan',
        mode: 'auto',
        staffUser: { id: loggedInOfficer.id, name: loggedInOfficer.name }
      });

      // Audit Log
      logScanEvent(
        token,
        foundPerson,
        { id: loggedInOfficer.id, name: loggedInOfficer.name },
        'Attendance Recording',
        card?.cardStatus === 'deactivated' ? 'Card Deactivated' : 'Verified',
        'Attendance Officer Gate Terminal (Mobile/Web)',
        'staff'
      );

      if (res.success) {
        if (settings.enableAudioFeedback) playScanSuccessChime();
        if (settings.enableVibrationFeedback && navigator.vibrate) navigator.vibrate(100);

        setScanFeedback({
          type: 'success',
          title: 'Staff Attendance Recorded Successfully',
          message: res.message,
          person: foundPerson,
          personType: 'Staff',
          action: res.action,
          time: res.record?.checkInTime,
          status: res.record?.status
        });
      } else {
        if (settings.enableAudioFeedback) playScanDuplicateAlert();
        setScanFeedback({
          type: 'duplicate',
          title: 'Staff Attendance Duplicate',
          message: res.message,
          person: foundPerson,
          personType: 'Staff',
          action: 'duplicate'
        });
      }
    }

    resumeScanningAfterDelay();
  };

  const resumeScanningAfterDelay = () => {
    const delay = (settings.autoResumeDelaySeconds || 2.5) * 1000;
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => {
      setIsProcessing(false);
    }, delay);
  };

  // Auto-start scanner when switching to student or staff scanner section
  useEffect(() => {
    if (activeSection === 'scan-student') {
      startCameraScanner('student');
    } else if (activeSection === 'scan-staff') {
      startCameraScanner('staff');
    } else {
      stopCameraScanner();
    }
  }, [activeSection]);

  // Execute Manual Attendance
  const handleRecordManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;

    const res = recordManualAttendance({
      personType: manualPersonType,
      person: selectedPerson,
      status: manualStatus,
      period: "Morning Assembly",
      officer: { id: loggedInOfficer.id, name: loggedInOfficer.name },
      reason: manualReason,
      forceOverride: true
    });

    if (res.success) {
      setManualSuccessMsg(`Attendance for ${selectedPerson.name} recorded manually as ${manualStatus}.`);
      setSelectedPerson(null);
      setManualReason('');
      setTimeout(() => {
        setManualSuccessMsg('');
        setShowManualModal(false);
      }, 2500);
    }
  };

  // Export CSV Helper
  const handleExportCSV = (type: 'all' | 'students' | 'staff') => {
    let rows: string[][] = [];
    let filename = `ess_attendance_${type}_${todayStr}.csv`;

    if (type === 'students' || type === 'all') {
      rows.push(["Record ID", "Student ID", "Full Name", "Class", "Date", "Check-In Time", "Check-Out Time", "Status", "Late Minutes", "Method", "Recorded By"]);
      studentRecords.forEach(r => {
        rows.push([
          r.id,
          r.studentId,
          `"${r.studentName}"`,
          r.class,
          r.date,
          r.time,
          r.checkOutTime || "N/A",
          r.status,
          String(r.lateMinutes || 0),
          r.method,
          `"${r.scannedByStaffName}"`
        ]);
      });
    }

    if (type === 'staff' || type === 'all') {
      if (type === 'staff') {
        rows.push(["Record ID", "Staff ID", "Full Name", "Department", "Role", "Date", "Check-In Time", "Check-Out Time", "Status", "Late Minutes", "Method", "Recorded By"]);
      }
      staffRecords.forEach(r => {
        rows.push([
          r.id,
          r.staffId,
          `"${r.staffName}"`,
          `"${r.department}"`,
          r.role,
          r.date,
          r.checkInTime,
          r.checkOutTime || "N/A",
          r.status,
          String(r.lateMinutes || 0),
          r.method,
          `"${r.scannedByStaffName || 'Officer'}"`
        ]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="attendance-officer-dashboard-root" className="space-y-6 pb-12">
      {/* Officer Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                Official Attendance Terminal
              </span>
              <span className="text-xs text-emerald-200">
                Emmanuel Secondary School &bull; Gate &amp; Assembly Ops
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="w-7 h-7 text-emerald-300" />
              Attendance Officer Dashboard
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              Officer On Duty: <strong className="text-white">{loggedInOfficer.name}</strong> ({loggedInOfficer.id}) &bull; Active Academic Session 2025/2026
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 bg-black/20 rounded-xl border border-white/10 text-xs font-mono">
              <div className="text-emerald-200 text-[10px] uppercase font-bold">Today's Date</div>
              <div className="font-semibold text-white">{todayStr}</div>
            </div>

            {activeSection !== 'overview' && (
              <button
                onClick={() => setSection('overview')}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl text-sm transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            )}

            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-all shadow-sm"
            >
              <Users className="w-4 h-4" />
              Manual Entry
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW DASHBOARD (Main Landing) */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* THE 10 PROMINENT, MOBILE-FRIENDLY BUTTONS / CARDS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-600" />
                Attendance Control &amp; Quick Actions
              </h2>
              <span className="text-xs text-slate-500">Tap any tile to launch</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* 1. Scan Student ID (High Priority Hero) */}
              <button
                onClick={() => setSection('scan-student')}
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-center border border-emerald-500/30 overflow-hidden"
              >
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-400/30 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                  Live Camera
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-2.5 group-hover:bg-white group-hover:text-emerald-700 transition-colors">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="font-bold text-base leading-tight">Scan Student ID</span>
                <span className="text-[11px] text-emerald-100 mt-1">Instant QR Check-In</span>
              </button>

              {/* 2. Scan Teacher/Staff ID (High Priority Hero) */}
              <button
                onClick={() => setSection('scan-staff')}
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-center border border-blue-500/30 overflow-hidden"
              >
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-blue-400/30 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                  Check In/Out
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-2.5 group-hover:bg-white group-hover:text-blue-700 transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="font-bold text-base leading-tight">Scan Staff ID</span>
                <span className="text-[11px] text-blue-100 mt-1">Faculty &amp; Employees</span>
              </button>

              {/* 3. Student Attendance */}
              <button
                onClick={() => setSection('students')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/50 hover:scale-[1.02] transition-all text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-slate-900">Student Attendance</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Classes &amp; Rosters</span>
              </button>

              {/* 4. Staff/Teacher Attendance */}
              <button
                onClick={() => setSection('staff')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 hover:scale-[1.02] transition-all text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-slate-900">Staff Attendance</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Departments &amp; Times</span>
              </button>

              {/* 5. Today's Attendance */}
              <button
                onClick={() => setSection('today')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm hover:border-amber-300 hover:bg-amber-50/50 hover:scale-[1.02] transition-all text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-slate-900">Today's Attendance</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Live Real-time Log</span>
              </button>

              {/* 6. Attendance Reports */}
              <button
                onClick={() => setSection('reports')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm hover:border-purple-300 hover:bg-purple-50/50 hover:scale-[1.02] transition-all text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-slate-900">Attendance Reports</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Summary &amp; Export</span>
              </button>

              {/* 7. Attendance History */}
              <button
                onClick={() => setSection('history')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:scale-[1.02] transition-all text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
                  <History className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-slate-900">Attendance History</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Past Terms &amp; Days</span>
              </button>

              {/* 8. Absent Students */}
              <button
                onClick={() => setSection('absent-students')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm hover:border-rose-300 hover:bg-rose-50/50 hover:scale-[1.02] transition-all text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                  <UserX className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-slate-900">Absent Students</span>
                <span className="text-[11px] text-rose-600 font-semibold mt-0.5">{summary.studentsAbsentCount} Not Scanned</span>
              </button>

              {/* 9. Absent Staff */}
              <button
                onClick={() => setSection('absent-staff')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm hover:border-rose-300 hover:bg-rose-50/50 hover:scale-[1.02] transition-all text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                  <UserX className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-slate-900">Absent Staff</span>
                <span className="text-[11px] text-rose-600 font-semibold mt-0.5">{summary.staffAbsentCount} Unreported</span>
              </button>

              {/* 10. Attendance Settings */}
              <button
                onClick={() => setSection('settings')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:scale-[1.02] transition-all text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
                  <Sliders className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-slate-900">Attendance Settings</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Late Cutoffs &amp; Hours</span>
              </button>
            </div>
          </div>

          {/* REAL-TIME ATTENDANCE COUNTERS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Counts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Today's Students Attendance</h3>
                    <p className="text-xs text-slate-500">Live gate and roll-call counts</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-emerald-600">{summary.studentsAttendanceRate}%</span>
                  <span className="text-xs text-slate-400 block font-medium">Turnout Rate</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-500 font-medium">Total</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">{summary.totalStudentsCount}</div>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <div className="text-xs text-emerald-700 font-medium">Present</div>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">{summary.studentPresentCount}</div>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <div className="text-xs text-amber-700 font-medium">Late</div>
                  <div className="text-lg font-bold text-amber-700 mt-0.5">{summary.studentLateCount}</div>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <div className="text-xs text-blue-700 font-medium">Excused</div>
                  <div className="text-lg font-bold text-blue-700 mt-0.5">{summary.studentExcusedCount}</div>
                </div>
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <div className="text-xs text-rose-700 font-medium">Absent</div>
                  <div className="text-lg font-bold text-rose-700 mt-0.5">{summary.studentsAbsentCount}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Allowed Arrival Cutoff: <strong>{settings.studentLateCutoff} AM</strong></span>
                <button
                  onClick={() => setSection('students')}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                >
                  View Student List <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Staff Counts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Today's Staff / Teachers Attendance</h3>
                    <p className="text-xs text-slate-500">Academic and Administrative faculty</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">{summary.staffAttendanceRate}%</span>
                  <span className="text-xs text-slate-400 block font-medium">Faculty Turnout</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-xs text-slate-500 font-medium">Total</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">{summary.totalStaffCount}</div>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <div className="text-xs text-emerald-700 font-medium">Present</div>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">{summary.staffPresentCount}</div>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <div className="text-xs text-amber-700 font-medium">Late</div>
                  <div className="text-lg font-bold text-amber-700 mt-0.5">{summary.staffLateCount}</div>
                </div>
                <div className="p-2.5 bg-purple-50 rounded-xl">
                  <div className="text-xs text-purple-700 font-medium">On Leave</div>
                  <div className="text-lg font-bold text-purple-700 mt-0.5">{summary.staffOnLeaveCount}</div>
                </div>
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <div className="text-xs text-rose-700 font-medium">Absent</div>
                  <div className="text-lg font-bold text-rose-700 mt-0.5">{summary.staffAbsentCount}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Staff Cutoff: <strong>{settings.staffLateCutoff} AM</strong> &bull; Checkout Threshold: <strong>{settings.checkOutThreshold}</strong></span>
                <button
                  onClick={() => setSection('staff')}
                  className="text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  View Staff List <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* TODAY'S RECENT SCANS TICKER */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Recent Gate &amp; Check-In Scans
                </h3>
                <p className="text-xs text-slate-500">Real-time scan logs recorded by Attendance Officers</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCSV('all')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export All CSV
                </button>
                <button
                  onClick={() => setSection('today')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  Full Attendance Table <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Scan Time</th>
                    <th className="px-4 py-3">Person Name</th>
                    <th className="px-4 py-3">ID Number</th>
                    <th className="px-4 py-3">Type / Class / Dept</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.recentLogs.slice(0, 8).map((log, idx) => (
                    <tr key={`${log.id}_${idx}`} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-slate-800 font-medium">{log.time}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{log.studentName}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{log.studentId}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">{log.studentClass}</span>
                        <span className="text-[10px] text-slate-400 block">{log.personType === 'staff' ? 'Staff' : 'Student'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          log.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{log.scannedByStaffName}</td>
                    </tr>
                  ))}
                  {summary.recentLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No scans recorded today yet. Click "Scan Student ID" or "Scan Staff ID" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SCAN STUDENT ID */}
      {activeSection === 'scan-student' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSection('overview')}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  Student ID Camera Scanner
                </h2>
                <p className="text-xs text-slate-500">
                  Point device camera directly at the student's ID card QR code.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  stopCameraScanner();
                  startCameraScanner('student');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restart Camera
              </button>
              <button
                onClick={() => setSection('scan-staff')}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
              >
                Switch to Staff Scanner &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Camera Feed Viewport */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col items-center justify-center">
              <div className="w-full max-w-md aspect-square bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center border-2 border-emerald-500/50">
                {/* HTML5 QR Container */}
                <div id="student-camera-reader" className="w-full h-full" />

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white z-20">
                    <CameraOff className="w-12 h-12 text-rose-400 mb-3" />
                    <h3 className="font-bold text-base text-rose-300">Camera Unavailable</h3>
                    <p className="text-xs text-slate-300 mt-2 max-w-xs">{cameraError}</p>
                    <button
                      onClick={() => setShowManualModal(true)}
                      className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Use Manual Student Attendance
                    </button>
                  </div>
                )}

                {/* Animated Scanner Laser overlay */}
                {isScanning && !cameraError && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
                    <div className="w-64 h-64 border-2 border-dashed border-emerald-400 rounded-2xl relative animate-pulse">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] absolute top-1/2 -translate-y-1/2 animate-bounce" />
                    </div>
                    <span className="mt-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-emerald-300 text-xs font-mono font-medium rounded-full">
                      Scanning for Student QR...
                    </span>
                  </div>
                )}
              </div>

              <div className="w-full max-w-md mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Continuous Auto-Detection
                </span>
                <span>Cutoff: {settings.studentLateCutoff} AM</span>
              </div>
            </div>

            {/* Right: Last Scanned Student Result Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Latest Scan Verification
              </h3>

              {scanFeedback ? (
                <div className={`p-4 rounded-xl border animate-fadeIn space-y-3 ${
                  scanFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : scanFeedback.type === 'duplicate'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {scanFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    )}
                    <span>{scanFeedback.title}</span>
                  </div>

                  <p className="text-xs leading-relaxed">{scanFeedback.message}</p>

                  {/* Student Card Info */}
                  {scanFeedback.person && (
                    <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-200/60 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-emerald-100 border border-emerald-300 overflow-hidden shrink-0 flex items-center justify-center font-bold text-emerald-800 text-lg">
                        {scanFeedback.person.passportPhoto ? (
                          <img 
                            src={scanFeedback.person.passportPhoto} 
                            alt={scanFeedback.person.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          scanFeedback.person.name.substring(0, 2)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 truncate">
                          {scanFeedback.person.name}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          {scanFeedback.person.id}
                        </div>
                        <div className="text-xs text-slate-700 mt-0.5">
                          Class: <strong className="text-emerald-700">{scanFeedback.person.class}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Gender: {scanFeedback.person.gender} &bull; Recorded by: {loggedInOfficer.name}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Scan cooldown active ({settings.autoResumeDelaySeconds}s)</span>
                    <span className="font-mono text-slate-600">Ready for next student</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <QrCode className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600" />
                  <p className="font-medium text-slate-700 text-sm">Awaiting Student QR Scan</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Hold a student's ID card 15–20cm in front of the camera. The scanner will automatically detect and verify the card.
                  </p>
                </div>
              )}

              {/* Quick Fallback to manual entry */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setManualPersonType('student');
                    setShowManualModal(true);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Search Student Manually If Card Is Damaged/Lost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SCAN TEACHER/STAFF ID */}
      {activeSection === 'scan-staff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSection('overview')}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Staff / Faculty Camera Scanner
                </h2>
                <p className="text-xs text-slate-500">
                  Scan teacher and administrative staff ID cards for automated check-in and checkout.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  stopCameraScanner();
                  startCameraScanner('staff');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restart Camera
              </button>
              <button
                onClick={() => setSection('scan-student')}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
              >
                Switch to Student Scanner &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Camera Feed Viewport */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col items-center justify-center">
              <div className="w-full max-w-md aspect-square bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center border-2 border-blue-500/50">
                {/* HTML5 QR Container */}
                <div id="staff-camera-reader" className="w-full h-full" />

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white z-20">
                    <CameraOff className="w-12 h-12 text-rose-400 mb-3" />
                    <h3 className="font-bold text-base text-rose-300">Camera Unavailable</h3>
                    <p className="text-xs text-slate-300 mt-2 max-w-xs">{cameraError}</p>
                    <button
                      onClick={() => {
                        setManualPersonType('staff');
                        setShowManualModal(true);
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Use Manual Staff Attendance
                    </button>
                  </div>
                )}

                {/* Animated Scanner Laser overlay */}
                {isScanning && !cameraError && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
                    <div className="w-64 h-64 border-2 border-dashed border-blue-400 rounded-2xl relative animate-pulse">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_#60a5fa] absolute top-1/2 -translate-y-1/2 animate-bounce" />
                    </div>
                    <span className="mt-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-blue-300 text-xs font-mono font-medium rounded-full">
                      Scanning Staff ID Card...
                    </span>
                  </div>
                )}
              </div>

              <div className="w-full max-w-md mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Staff Cutoff: {settings.staffLateCutoff} AM</span>
                <span>Checkout Switchover: {settings.checkOutThreshold}</span>
              </div>
            </div>

            {/* Right: Last Scanned Staff Result Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Staff Attendance Verification
              </h3>

              {scanFeedback ? (
                <div className={`p-4 rounded-xl border animate-fadeIn space-y-3 ${
                  scanFeedback.type === 'success'
                    ? 'bg-blue-50 text-blue-900 border-blue-200'
                    : scanFeedback.type === 'duplicate'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {scanFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    )}
                    <span>{scanFeedback.title}</span>
                  </div>

                  <p className="text-xs leading-relaxed">{scanFeedback.message}</p>

                  {/* Staff Card Info */}
                  {scanFeedback.person && (
                    <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/60 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-blue-100 border border-blue-300 overflow-hidden shrink-0 flex items-center justify-center font-bold text-blue-800 text-lg">
                        {scanFeedback.person.name.substring(0, 2)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 truncate">
                          {scanFeedback.person.name}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          {scanFeedback.person.id}
                        </div>
                        <div className="text-xs text-slate-700 mt-0.5">
                          Department: <strong className="text-blue-700">{scanFeedback.person.department}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Role: {scanFeedback.person.role} &bull; Recorded by: {loggedInOfficer.name}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Scan cooldown active ({settings.autoResumeDelaySeconds}s)</span>
                    <span className="font-mono text-slate-600">Ready for next staff member</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-600" />
                  <p className="font-medium text-slate-700 text-sm">Awaiting Staff ID Card Scan</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Position staff member's ID card QR code in front of the lens. Check-in or Check-out will be calculated automatically.
                  </p>
                </div>
              )}

              {/* Quick Fallback to manual entry */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setManualPersonType('staff');
                    setShowManualModal(true);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  Search Staff Member Manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: TODAY'S ATTENDANCE */}
      {activeSection === 'today' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Today's Complete Attendance Table ({todayStr})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consolidated real-time roll of all student arrivals and staff check-ins logged today.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV('all')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export Today's Attendance (CSV)
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID number, or class/department..."
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present (On Time)</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Unified Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Person Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Class / Department</th>
                  <th className="px-4 py-3">Check-In Time</th>
                  <th className="px-4 py-3">Check-Out Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Attendance Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Students */}
                {studentRecords
                  .filter(r => r.date === todayStr)
                  .filter(r => {
                    const matchesSearch = r.studentName.toLowerCase().includes(tableSearch.toLowerCase()) ||
                                          r.studentId.toLowerCase().includes(tableSearch.toLowerCase()) ||
                                          r.class.toLowerCase().includes(tableSearch.toLowerCase());
                    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((rec, idx) => (
                    <tr key={`stud_${rec.id}_${idx}`} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{rec.studentName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{rec.studentId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium text-[11px]">
                          Student
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{rec.class}</td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">{rec.time}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{rec.checkOutTime || '--:--'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          rec.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.status} {rec.lateMinutes ? `(+${rec.lateMinutes}m)` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">{rec.method}</td>
                      <td className="px-4 py-3 text-slate-700">{rec.scannedByStaffName}</td>
                    </tr>
                  ))}

                {/* Staff */}
                {staffRecords
                  .filter(r => r.date === todayStr)
                  .filter(r => {
                    const matchesSearch = r.staffName.toLowerCase().includes(tableSearch.toLowerCase()) ||
                                          r.staffId.toLowerCase().includes(tableSearch.toLowerCase()) ||
                                          r.department.toLowerCase().includes(tableSearch.toLowerCase());
                    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((rec, idx) => (
                    <tr key={`stf_${rec.id}_${idx}`} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{rec.staffName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{rec.staffId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-medium text-[11px]">
                          Staff
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{rec.department} ({rec.role})</td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">{rec.checkInTime}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{rec.checkOutTime || '--:--'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          rec.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {rec.status} {rec.lateMinutes ? `(+${rec.lateMinutes}m)` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">{rec.method}</td>
                      <td className="px-4 py-3 text-slate-700">{rec.scannedByStaffName || 'Attendance Officer'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: STUDENT ATTENDANCE SECTION */}
      {activeSection === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Student Attendance Records &amp; Class Rosters
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track individual student turnout, search by admission number, review late records, and add authorized remarks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV('students')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
              >
                <Download className="w-3.5 h-3.5" />
                Export Student CSV
              </button>
              <button
                onClick={() => setSection('scan-student')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Open Student Scanner
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student name or ID..."
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Classes</option>
              {CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Attendance Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
            </select>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Check-In</th>
                  <th className="px-4 py-3">Check-Out</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRecords
                  .filter(r => {
                    const matchesSearch = r.studentName.toLowerCase().includes(tableSearch.toLowerCase()) ||
                                          r.studentId.toLowerCase().includes(tableSearch.toLowerCase());
                    const matchesClass = classFilter === 'all' || r.class === classFilter;
                    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
                    return matchesSearch && matchesClass && matchesStatus;
                  })
                  .slice(0, 50)
                  .map((rec, idx) => (
                    <tr key={`${rec.id}_${idx}`} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{rec.studentName}</div>
                        <div className="font-mono text-slate-400">{rec.studentId}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{rec.class}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{rec.date}</td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">{rec.time}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{rec.checkOutTime || '--:--'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          rec.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.status} {rec.lateMinutes ? `(+${rec.lateMinutes}m)` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{rec.note || 'None'}</td>
                      <td className="px-4 py-3 text-slate-700">{rec.scannedByStaffName}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 6: STAFF / TEACHER ATTENDANCE SECTION */}
      {activeSection === 'staff' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Staff &amp; Teacher Attendance Records
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor teacher arrivals, departmental compliance, late hours, and departure timestamps.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV('staff')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
              >
                <Download className="w-3.5 h-3.5" />
                Export Staff CSV
              </button>
              <button
                onClick={() => setSection('scan-staff')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Open Staff Scanner
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name, ID, or department..."
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Attendance Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Department &amp; Designation</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Check-In</th>
                  <th className="px-4 py-3">Check-Out</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffRecords
                  .filter(r => {
                    const matchesSearch = r.staffName.toLowerCase().includes(tableSearch.toLowerCase()) ||
                                          r.staffId.toLowerCase().includes(tableSearch.toLowerCase()) ||
                                          r.department.toLowerCase().includes(tableSearch.toLowerCase());
                    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .slice(0, 50)
                  .map((rec, idx) => (
                    <tr key={`${rec.id}_${idx}`} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{rec.staffName}</div>
                        <div className="font-mono text-slate-400">{rec.staffId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">{rec.department}</span>
                        <span className="text-[11px] text-slate-500 block">{rec.role}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{rec.date}</td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">{rec.checkInTime}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{rec.checkOutTime || '--:--'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          rec.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {rec.status} {rec.lateMinutes ? `(+${rec.lateMinutes}m)` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{rec.note || 'None'}</td>
                      <td className="px-4 py-3 text-slate-700">{rec.scannedByStaffName || 'Attendance Officer'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 7: ATTENDANCE REPORTS & EXPORTS */}
      {activeSection === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Attendance Reports &amp; Analytics
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate reports by day, week, month, term, or custom ranges. Export in standard formats.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
              >
                <Printer className="w-3.5 h-3.5" />
                Print View
              </button>
              <button
                onClick={() => handleExportCSV('all')}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Spreadsheet (CSV)
              </button>
            </div>
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'today', label: "Today" },
              { id: 'yesterday', label: "Yesterday" },
              { id: 'this_week', label: "This Week" },
              { id: 'this_month', label: "This Month" },
              { id: 'term', label: "Current Term" },
              { id: 'session', label: "2025/2026 Session" }
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => setReportRange(tf.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  reportRange === tf.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="text-xs text-purple-700 font-semibold uppercase">Total Recorded Days</div>
              <div className="text-2xl font-bold text-purple-900 mt-1">
                {new Set(studentRecords.map(r => r.date)).size}
              </div>
              <p className="text-[11px] text-purple-600 mt-0.5">Logged attendance sessions</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-xs text-emerald-700 font-semibold uppercase">Average Student Rate</div>
              <div className="text-2xl font-bold text-emerald-900 mt-1">{summary.studentsAttendanceRate}%</div>
              <p className="text-[11px] text-emerald-600 mt-0.5">Punctual &amp; present</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-xs text-blue-700 font-semibold uppercase">Average Staff Rate</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{summary.staffAttendanceRate}%</div>
              <p className="text-[11px] text-blue-600 mt-0.5">Faculty arrival rate</p>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-xs text-amber-700 font-semibold uppercase">Total Late Scans</div>
              <div className="text-2xl font-bold text-amber-900 mt-1">
                {summary.studentLateCount + summary.staffLateCount}
              </div>
              <p className="text-[11px] text-amber-600 mt-0.5">After cutoff threshold</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 8: ATTENDANCE HISTORY */}
      {activeSection === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-700" />
                Comprehensive Attendance History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Full chronological archive of all attendance marks, check-ins, and departures.
              </p>
            </div>
            <button
              onClick={() => handleExportCSV('all')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
            >
              <Download className="w-3.5 h-3.5" />
              Download History (CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Person Name</th>
                  <th className="px-4 py-3">Role / Class</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Officer</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRecords.slice(0, 60).map((r, idx) => (
                  <tr key={`hist_${r.id}_${idx}`} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-medium text-slate-700">{r.date}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{r.time}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{r.studentName} ({r.studentId})</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{r.class} (Student)</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        r.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.scannedByStaffName}</td>
                    <td className="px-4 py-3 text-slate-500 italic truncate max-w-xs">{r.note || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 9: ABSENT STUDENTS */}
      {activeSection === 'absent-students' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-600" />
                Absent Students Roster ({todayStr})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Students who have not yet checked in through gate scanners today ({summary.absentStudentsList.length} students).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setManualPersonType('student');
                  setShowManualModal(true);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Manual Student Check-In
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Admission Number</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Guardian / Phone</th>
                  <th className="px-4 py-3">Parent Contact Action</th>
                  <th className="px-4 py-3 text-right">Officer Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.absentStudentsList.map((stud, idx) => (
                  <tr key={`abs_stud_${stud.id}_${idx}`} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold text-slate-900">{stud.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{stud.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{stud.class}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-medium">{stud.parentName || 'Parent / Guardian'}</div>
                      <div className="text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {stud.parentPhone || '+234 800 000 0000'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`tel:${stud.parentPhone || '+2348000000000'}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        Call Parent
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedPerson(stud);
                          setManualPersonType('student');
                          setManualStatus('Excused');
                          setShowManualModal(true);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Mark Excused / Late
                      </button>
                    </td>
                  </tr>
                ))}

                {summary.absentStudentsList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-emerald-600 font-medium">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                      100% Student Attendance! Every registered student is accounted for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 10: ABSENT STAFF */}
      {activeSection === 'absent-staff' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-600" />
                Absent Staff &amp; Faculty ({todayStr})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff members with no check-in recorded for today ({summary.absentStaffList.length} staff).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setManualPersonType('staff');
                  setShowManualModal(true);
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Manual Staff Check-In
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Staff Name</th>
                  <th className="px-4 py-3">Staff ID</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Designation / Role</th>
                  <th className="px-4 py-3">Phone Number</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.absentStaffList.map((stf, idx) => (
                  <tr key={`abs_stf_${stf.id}_${idx}`} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold text-slate-900">{stf.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{stf.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{stf.department}</td>
                    <td className="px-4 py-3 text-slate-600">{stf.role}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{stf.phone}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedPerson(stf);
                          setManualPersonType('staff');
                          setManualStatus('On Leave');
                          setShowManualModal(true);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Record Leave / Late
                      </button>
                    </td>
                  </tr>
                ))}

                {summary.absentStaffList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-emerald-600 font-medium">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                      All employed staff members have checked in today!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 11: ATTENDANCE SETTINGS */}
      {activeSection === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-slate-700" />
              Attendance Settings &amp; Scanner Calibration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize arrival thresholds, auto check-in/out transition hours, audio chimes, and cooldown delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Operating Hours &amp; Cutoffs</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Late Arrival Cutoff (24H format)
                </label>
                <input
                  type="time"
                  value={settings.studentLateCutoff}
                  onChange={e => setSettings(s => ({ ...s, studentLateCutoff: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold text-rose-700"
                />
                <span className="text-[11px] text-slate-500">Scans after this time are automatically marked Late.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Late Arrival Cutoff (24H format)
                </label>
                <input
                  type="time"
                  value={settings.staffLateCutoff}
                  onChange={e => setSettings(s => ({ ...s, staffLateCutoff: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold text-rose-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Check-Out Transition Time Threshold
                </label>
                <input
                  type="time"
                  value={settings.checkOutThreshold}
                  onChange={e => setSettings(s => ({ ...s, checkOutThreshold: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold text-blue-700"
                />
                <span className="text-[11px] text-slate-500">Scans after this hour will record as departure Check-Out.</span>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Scanner Hardware &amp; Audio Feedback</h3>

              <div className="space-y-3 pt-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableAudioFeedback}
                    onChange={e => setSettings(s => ({ ...s, enableAudioFeedback: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Play confirmation chime on successful scan
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableVibrationFeedback}
                    onChange={e => setSettings(s => ({ ...s, enableVibrationFeedback: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Mobile haptic vibration feedback
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.preventDuplicatePerDay}
                    onChange={e => setSettings(s => ({ ...s, preventDuplicatePerDay: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Prevent accidental duplicate scans for same person today
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scanner Auto-Resume Delay: {settings.autoResumeDelaySeconds} seconds
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={settings.autoResumeDelaySeconds}
                  onChange={e => setSettings(s => ({ ...s, autoResumeDelaySeconds: parseFloat(e.target.value) }))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ATTENDANCE MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Manual Attendance Recording
              </h3>
              <button
                onClick={() => {
                  setShowManualModal(false);
                  setSelectedPerson(null);
                  setManualSuccessMsg('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {manualSuccessMsg ? (
              <div className="my-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{manualSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleRecordManual} className="mt-4 space-y-4">
                {/* Person Type Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualPersonType('student');
                      setSelectedPerson(null);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      manualPersonType === 'student'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualPersonType('staff');
                      setSelectedPerson(null);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      manualPersonType === 'staff'
                        ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Staff / Teacher
                  </button>
                </div>

                {/* Search / Select Person */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Search {manualPersonType === 'student' ? 'Student' : 'Staff'} by Name or ID *
                  </label>
                  <input
                    type="text"
                    placeholder="Type name or ID to search..."
                    value={manualSearchQuery}
                    onChange={e => setManualSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />

                  {/* Dropdown list of results */}
                  {manualSearchQuery.trim().length > 1 && !selectedPerson && (
                    <div className="max-h-40 overflow-y-auto mt-1 border border-slate-200 rounded-lg bg-white divide-y divide-slate-100 shadow-lg">
                      {manualPersonType === 'student'
                        ? students
                            .filter(s => s.name.toLowerCase().includes(manualSearchQuery.toLowerCase()) || s.id.toLowerCase().includes(manualSearchQuery.toLowerCase()))
                            .slice(0, 5)
                            .map(s => (
                              <div
                                key={s.id}
                                onClick={() => {
                                  setSelectedPerson(s);
                                  setManualSearchQuery('');
                                }}
                                className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs"
                              >
                                <div className="font-bold text-slate-800">{s.name}</div>
                                <div className="text-slate-400 font-mono">{s.id} &bull; {s.class}</div>
                              </div>
                            ))
                        : teachers
                            .filter(t => t.name.toLowerCase().includes(manualSearchQuery.toLowerCase()) || t.id.toLowerCase().includes(manualSearchQuery.toLowerCase()))
                            .slice(0, 5)
                            .map(t => (
                              <div
                                key={t.id}
                                onClick={() => {
                                  setSelectedPerson(t);
                                  setManualSearchQuery('');
                                }}
                                className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs"
                              >
                                <div className="font-bold text-slate-800">{t.name}</div>
                                <div className="text-slate-400 font-mono">{t.id} &bull; {t.department}</div>
                              </div>
                            ))}
                    </div>
                  )}
                </div>

                {/* Selected Person Card */}
                {selectedPerson && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-emerald-950">{selectedPerson.name}</div>
                      <div className="text-xs font-mono text-emerald-700">
                        {selectedPerson.id} &bull; {selectedPerson.class || selectedPerson.department}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPerson(null)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Attendance Status *
                  </label>
                  <select
                    value={manualStatus}
                    onChange={e => setManualStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium"
                  >
                    <option value="Present">Present (On Time)</option>
                    <option value="Late">Late Arrival</option>
                    <option value="Excused">Excused (Medical / Official)</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                {/* Remarks / Reason */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason / Authorized Officer Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Broken card, verified by gate pass"
                    value={manualReason}
                    onChange={e => setManualReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Recorded By: <strong>{loggedInOfficer.name}</strong> ({loggedInOfficer.id}). This entry will be permanently marked as "manual".
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualModal(false);
                      setSelectedPerson(null);
                    }}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedPerson}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                  >
                    Record Attendance
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper hook for today's summary stats
function useTodaySummary(teachers: Teacher[], students: Student[]) {
  const [studentRecords] = useAttendance();
  const [staffRecords] = useStaffAttendance();
  const [scanLogs] = useQRScanLogs();

  return useMemo(() => {
    return getTodayAttendanceSummary(teachers, students);
  }, [teachers, students, studentRecords, staffRecords, scanLogs]);
}
