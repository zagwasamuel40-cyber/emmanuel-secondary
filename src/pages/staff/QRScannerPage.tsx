import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  CameraOff, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  Search, 
  UserCheck, 
  Clock, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  Phone,
  RefreshCw,
  Award,
  ChevronRight,
  X
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useStudents } from "../../data/studentsData";
import { useScores } from "../../data/scoresData";
import { useTeachers } from "../../data/teachersData";
import { 
  useIdCards, 
  useAttendance, 
  useQRScanLogs,
  recordStudentAttendance, 
  logScanEvent,
  getTodayDateString 
} from "../../data/idCardAndAttendanceData";
import { extractTokenFromScan } from "../../utils/qrCodeGenerator";
import { AttendanceStatus, AttendancePeriod } from "../../types/idCardAndAttendance";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui";

export default function QRScannerPage() {
  const [students] = useStudents();
  const [scores] = useScores();
  const [teachers] = useTeachers();
  const [idCards] = useIdCards();
  const [attendanceRecords] = useAttendance();
  const [, setScanLogs] = useQRScanLogs();

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [pendingAttendance, setPendingAttendance] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState<{ text: string; isError?: boolean; isDuplicate?: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<AttendancePeriod>("Morning Assembly");
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>("Present");
  const [lateMinutesInput, setLateMinutesInput] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<"profile" | "attendance" | "academics">("profile");
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState("2025/2026 - First Term");

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "reader-container";

  // Current logged in user details
  const loggedInUserId = localStorage.getItem("loggedInUserId") || "ADM/2026/001";
  const staff = teachers.find(t => t.id === loggedInUserId) || {
    id: loggedInUserId,
    name: "Authorized Staff Member",
    systemRoles: ["Teacher", "Admin"]
  };

  // Get current user's roles
  let userRoles: string[] = [];
  try {
    userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
  } catch {}
  if (userRoles.length === 0) {
    userRoles = staff.systemRoles || ['Teacher'];
  }
  const canViewResults = userRoles.some(r => 
    ['Admin', 'Super Admin', 'General Admin', 'Teacher', 'Examination Admin', 'Academic Admin'].includes(r)
  );

  // Play audio chime on successful scan
  const playBeep = (isError = false) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = isError ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(isError ? 220 : 880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + (isError ? 0.35 : 0.15));
    } catch {}
  };

  // Clean up scanner on unmount and auto-start on mount
  useEffect(() => {
    let isMounted = true;
    
    // Slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (isMounted && !isScanning) {
        startCamera();
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError("");
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      // Check for mediaDevices support first
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is not supported by this browser environment. You can scan by uploading an ID card photo or using manual input.");
        setIsScanning(false);
        return;
      }

      // Query available camera devices safely
      const devices = await Html5Qrcode.getCameras().catch(() => []);
      if (!devices || devices.length === 0) {
        setCameraError("No physical camera detected on this device. You can scan by uploading an ID card photo or using manual input.");
        setIsScanning(false);
        return;
      }

      // If available, prefer back/environment camera, else use the first detected camera ID
      const backCamera = devices.find(d => /back|rear|environment/i.test(d.label));
      const cameraId = backCamera ? backCamera.id : devices[0].id;

      await html5QrCodeRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScannedText(decodedText);
        },
        () => {
          // Frame error, safe to ignore
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      const errStr = String(err?.message || err?.name || err);
      const isNotFound = /NotFoundError|Requested device not found|device not found|no camera/i.test(errStr);
      const isNotAllowed = /NotAllowedError|Permission denied|PermissionDismissed/i.test(errStr);

      if (isNotFound) {
        setCameraError(
          "No physical camera detected on this device. You can scan by uploading an ID card photo or using manual input."
        );
      } else if (isNotAllowed) {
        setCameraError(
          "Camera permission was denied. Please grant camera access in browser settings or use manual input."
        );
      } else {
        setCameraError(
          err?.message || "Could not access device camera. Please grant camera permission or use the file/manual input below."
        );
      }
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }
      const result = await html5QrCodeRef.current.scanFile(file, true);
      handleScannedText(result);
    } catch (err) {
      alert("No valid QR code found in this image. Please upload a clear photo of the student's ID card QR code.");
    }
  };

  // Core scan processing logic
  const handleScannedText = (rawText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const token = extractTokenFromScan(rawText);

    // Locate the student ID card by qrToken or fallback student ID
    const matchedCard = idCards.find(c => c.qrToken === token) || 
      idCards.find(c => c.studentId.toLowerCase() === token.toLowerCase());

    let matchedStudent = null;
    if (matchedCard) {
      matchedStudent = students.find(s => s.id === matchedCard.studentId);
    } else {
      matchedStudent = students.find(s => 
        s.id.toLowerCase() === token.toLowerCase() || 
        s.name.toLowerCase().includes(token.toLowerCase())
      );
    }

    if (!matchedStudent) {
      playBeep(true);
      setAttendanceMessage({
        text: `Invalid or Unrecognized QR Token ("${token.substring(0, 18)}..."). Record not found in school database.`,
        isError: true
      });
      setIsProcessing(false);
      return;
    }

    // Check if card is marked as stolen or deactivated
    if (matchedCard && matchedCard.cardStatus !== "active") {
      playBeep(true);
      logScanEvent(
        token,
        matchedStudent,
        { id: staff.id, name: staff.name },
        "Identity Verification",
        "Card Deactivated",
        "Camera Scanner"
      );
      setScannedResult({
        student: matchedStudent,
        card: matchedCard,
        deactivated: true
      });
      setAttendanceMessage({
        text: `SECURITY ALERT: This ID Card was reported ${matchedCard.cardStatus.toUpperCase()}! Scans are rejected. Confiscate the card.`,
        isError: true
      });
      setIsProcessing(false);
      return;
    }

    // Valid student & active card!
    playBeep(false);

    // 1. Log the scan event for NDPR audit trail
    logScanEvent(
      token,
      matchedStudent,
      { id: staff.id, name: staff.name },
      "Attendance Recording",
      "Verified",
      "Staff Portal Scanner"
    );

    // Pause the scanner so the staff can select the attendance status
    if (isScanning && html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.pause(true);
      } catch {}
    }

    setScannedResult({
      student: matchedStudent,
      card: matchedCard,
      deactivated: false
    });
    setAttendanceMessage(null);
    setPendingAttendance(true);
    setIsProcessing(false);
  };

  const handleSaveAttendance = (newStatus: AttendanceStatus) => {
    if (!scannedResult?.student) return;
    setIsProcessing(true);
    const res = recordStudentAttendance({
      student: scannedResult.student,
      status: newStatus,
      period: selectedPeriod,
      method: "manual",
      staffUser: { id: staff.id, name: staff.name },
      lateMinutes: newStatus === "Late" ? lateMinutesInput : undefined,
    });
    
    setScannedResult({
      ...scannedResult,
      attendanceRecord: res.record
    });
    setAttendanceMessage({
      text: res.message,
      isError: false,
      isDuplicate: res.duplicate
    });
    setPendingAttendance(false);

    // Briefly show the success message, then resume scanning for the next student
    setTimeout(() => {
      if (isScanning && html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.resume();
        } catch {}
      }
      setIsProcessing(false);
    }, 2500);
  };

  const handleUpdateStatus = (newStatus: AttendanceStatus) => {
    if (!scannedResult?.student) return;
    const res = recordStudentAttendance({
      student: scannedResult.student,
      status: newStatus,
      period: selectedPeriod,
      method: "manual",
      staffUser: { id: staff.id, name: staff.name },
      lateMinutes: newStatus === "Late" ? lateMinutesInput : undefined,
      forceOverride: true
    });
    setScannedResult({
      ...scannedResult,
      attendanceRecord: res.record
    });
    setAttendanceMessage({
      text: res.message,
      isError: false
    });
  };

  // Student academic results filter
  const studentScores = scores.filter(
    sc => sc.studentId === scannedResult?.student?.id && sc.session === selectedTerm
  );
  const totalScoreSum = studentScores.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const averageScore = studentScores.length ? (totalScoreSum / studentScores.length).toFixed(1) : "0";

  // Today's attendance list for quick reference
  const todayDate = getTodayDateString();
  const todayScans = attendanceRecords.filter(r => r.date === todayDate);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
              Staff Portal • QR Attendance & Verification
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock size={13} className="text-brand-600" />
              {todayDate}
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 mt-1">
            Student QR Code Scanner
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Scan student digital/printed ID cards to instantly record attendance and verify student identity.
          </p>
        </div>

        {/* Staff identifier badge */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <div className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
            {staff.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900">{staff.name}</div>
            <div className="text-[11px] text-slate-500">{staff.id} • {userRoles[0] || 'Staff'}</div>
          </div>
        </div>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Camera & Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera size={18} className="text-amber-400" />
                Live Camera Scanner
              </CardTitle>
              {isScanning && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white animate-pulse">
                  Scanning Active
                </span>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Camera viewfinder box */}
              <div className="relative w-full aspect-square bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-800 flex flex-col items-center justify-center">
                <div id={scannerContainerId} className="w-full h-full" />
                
                {!isScanning && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-white space-y-3 z-10">
                    <div className="w-16 h-16 rounded-full bg-brand-900/60 border border-brand-500/40 flex items-center justify-center text-amber-400 animate-pulse">
                      <QrCode size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Initializing Scanner...</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Please wait while camera starts automatically.
                      </p>
                    </div>
                  </div>
                )}
                
                {!isScanning && cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-white space-y-3 z-10">
                    <div className="w-16 h-16 rounded-full bg-rose-900/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <AlertTriangle size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Camera Error</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        {cameraError}
                      </p>
                    </div>
                    <Button 
                      onClick={startCamera} 
                      variant="brand" 
                      className="gap-2 shadow-lg"
                    >
                      <RefreshCw size={16} />
                      Retry Camera
                    </Button>
                  </div>
                )}

                {/* Target overlay reticle when scanning */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="w-48 h-48 border-2 border-amber-400/80 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400" />
                      {/* Scanning laser line animation */}
                      <div className="w-full h-0.5 bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,1)] animate-bounce mt-24" />
                    </div>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <span className="font-semibold block">Camera Access Notice</span>
                    {cameraError}
                  </div>
                </div>
              )}

              {/* Alternate Scan Mode: Image Upload & Quick Select */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Alternate Input Options</span>
                </div>

                {/* Upload QR Image file */}
                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg border border-dashed border-slate-300 hover:border-brand-500 bg-slate-50/50 hover:bg-brand-50/30 cursor-pointer text-xs font-medium text-slate-600 transition-colors">
                  <Upload size={14} className="text-brand-600" />
                  <span>Upload QR Image / Photo from Device</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>

                {/* Quick Student Selector fallback */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Manual Lookup (ID or Name):</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. ESS/2026/001 or Adebayo"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && manualInput.trim()) {
                          handleScannedText(manualInput.trim());
                        }
                      }}
                      className="text-xs"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (manualInput.trim()) handleScannedText(manualInput.trim());
                      }}
                      disabled={!manualInput.trim()}
                    >
                      <Search size={14} />
                    </Button>
                  </div>
                </div>

                {/* Session & Period presets */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div>
                    <label className="text-slate-500 text-[11px] font-semibold block mb-1">Attendance Period:</label>
                    <select 
                      className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value as AttendancePeriod)}
                    >
                      <option value="Morning Assembly">Morning Assembly</option>
                      <option value="Daily Attendance">Daily Attendance</option>
                      <option value="Afternoon Rollcall">Afternoon Rollcall</option>
                      <option value="Exam Session">Exam Hall Check</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 text-[11px] font-semibold block mb-1">Default Status:</label>
                    <select 
                      className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as AttendanceStatus)}
                    >
                      <option value="Present">Present (Standard)</option>
                      <option value="Late">Late Arrival</option>
                      <option value="Excused">Excused / Permission</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Verified Student Card & Results (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Status Message Banner */}
          {attendanceMessage && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
              attendanceMessage.isError 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : attendanceMessage.isDuplicate
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              {attendanceMessage.isError ? (
                <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
              ) : attendanceMessage.isDuplicate ? (
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              ) : (
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              )}
              <div className="flex-1">
                <div className="font-bold text-sm">
                  {attendanceMessage.isError 
                    ? "Verification Notice" 
                    : attendanceMessage.isDuplicate
                    ? "Duplicate Attendance Detected"
                    : "Attendance Recorded Successfully"}
                </div>
                <div className="text-xs mt-0.5 leading-relaxed">{attendanceMessage.text}</div>
              </div>
              <button 
                onClick={() => setAttendanceMessage(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* VERIFIED STUDENT PROFILE DISPLAY */}
          {scannedResult?.student ? (
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-amber-400" />
                    <div>
                      <CardTitle className="text-lg">Verified Student Identity</CardTitle>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Authenticated against Emmanuel Secondary School central registry
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    scannedResult.deactivated 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {scannedResult.deactivated ? 'Card Deactivated' : 'Verified Active'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Profile Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-amber-400/80 overflow-hidden shadow-md shrink-0 flex items-center justify-center">
                    {scannedResult.student.passportUrl ? (
                      <img 
                        src={scannedResult.student.passportUrl} 
                        alt={scannedResult.student.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-3xl font-black text-slate-400">
                        {scannedResult.student.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                      {scannedResult.student.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {scannedResult.student.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                        Class: {scannedResult.student.class}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Session: {scannedResult.card?.academicSession || "2025/2026"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Gender</span>
                        <span className="font-medium text-slate-800">{scannedResult.student.gender || "Male"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Enrollment</span>
                        <span className="font-medium text-slate-800">{scannedResult.student.enrollmentStatus || "Enrolled"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Parent Contact</span>
                        <span className="font-medium text-slate-800 truncate block">{scannedResult.student.parentNumber || "+234..."}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Action & Override Controls */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${pendingAttendance ? 'text-amber-600 animate-pulse' : 'text-slate-700'}`}>
                      <Clock size={14} className={pendingAttendance ? 'text-amber-600' : 'text-brand-600'} />
                      {pendingAttendance ? `Select Attendance to Save & Continue (${selectedPeriod})` : `Attendance Status for Today (${selectedPeriod})`}
                    </span>
                    {!pendingAttendance && scannedResult.attendanceRecord && (
                      <span className="text-xs font-semibold text-slate-500">
                        Recorded Time: {scannedResult.attendanceRecord.time}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {(["Present", "Late", "Excused", "Absent"] as AttendanceStatus[]).map((status) => {
                      const isCurrent = !pendingAttendance && scannedResult.attendanceRecord?.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => pendingAttendance ? handleSaveAttendance(status) : handleUpdateStatus(status)}
                          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                            isCurrent
                              ? status === 'Present'
                                ? 'bg-emerald-600 text-white shadow-emerald-200'
                                : status === 'Late'
                                ? 'bg-amber-600 text-white shadow-amber-200'
                                : status === 'Excused'
                                ? 'bg-blue-600 text-white shadow-blue-200'
                                : 'bg-rose-600 text-white shadow-rose-200'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isCurrent && <CheckCircle2 size={13} />}
                          Mark {status}
                        </button>
                      );
                    })}
                  </div>

                  {!pendingAttendance && scannedResult.attendanceRecord?.status === "Late" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-xs text-amber-800">
                      <span>Minutes late:</span>
                      <input 
                        type="number"
                        min={1}
                        max={180}
                        value={lateMinutesInput}
                        onChange={(e) => setLateMinutesInput(Number(e.target.value))}
                        className="w-16 h-7 px-2 border rounded bg-white text-center font-bold text-xs"
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs"
                        onClick={() => handleUpdateStatus("Late")}
                      >
                        Save Minutes
                      </Button>
                    </div>
                  )}
                </div>

                {/* Academic Results Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {canViewResults ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        Role Authorized: You have permission to view this student's academic records.
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Academic records view requires Teacher/Admin permissions.
                      </span>
                    )}
                  </div>

                  {canViewResults && (
                    <Button 
                      onClick={() => setShowResultsModal(true)}
                      variant="brand"
                      className="w-full sm:w-auto gap-2 shadow-sm"
                    >
                      <BookOpen size={16} />
                      View Academic Results & Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Standby Card when no student is yet scanned */
            <Card className="border-0 shadow-sm border-dashed border-2 border-slate-200 bg-white">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                  <QrCode size={40} className="text-brand-500" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-lg font-bold text-slate-800 font-heading">Ready to Scan Student ID Cards</h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Point camera at the QR code on the back of the student's ID card or digital phone screen. 
                    The verified profile, passport, and attendance confirmation will appear here immediately.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                    1. Open Camera
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                    2. Scan QR
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                    3. Auto-Attendance
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                    4. View Records
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Scan Activity Quick List */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Today's Scanned Roll Call</CardTitle>
                <p className="text-[11px] text-slate-500 mt-0.5">Students scanned today ({todayDate})</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                {todayScans.length} Recorded
              </span>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Time</th>
                    <th className="px-4 py-2.5 font-semibold">Student</th>
                    <th className="px-4 py-2.5 font-semibold">Class</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-4 py-2.5 font-semibold">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayScans.slice(0, 6).map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-mono text-slate-600">{rec.time}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">{rec.studentName}</td>
                      <td className="px-4 py-2.5 text-slate-600">{rec.class}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                          rec.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                          rec.status === 'Excused' ? 'bg-blue-100 text-blue-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono text-[10px]">
                        {rec.method === 'qr_scan' ? '⚡ QR Scan' : '✍️ Manual'}
                      </td>
                    </tr>
                  ))}
                  {todayScans.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        No students scanned yet today. Start the camera to record attendance.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SECURE ACADEMIC RESULTS MODAL (Role Protected) */}
      {showResultsModal && scannedResult?.student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="text-amber-400" size={24} />
                <div>
                  <h3 className="text-lg font-bold">Academic Performance & Result Slip</h3>
                  <p className="text-xs text-slate-400">
                    {scannedResult.student.name} • {scannedResult.student.id} • {scannedResult.student.class}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowResultsModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Term Selector & Quick Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Academic Term:</label>
                  <select 
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                  >
                    <option value="2025/2026 - First Term">2025/2026 - First Term</option>
                    <option value="2024/2025 - Third Term">2024/2025 - Third Term</option>
                    <option value="2024/2025 - Second Term">2024/2025 - Second Term</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Subjects</span>
                    <span className="font-bold text-slate-900 text-sm">{studentScores.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Term Average</span>
                    <span className="font-bold text-brand-600 text-sm">{averageScore}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Overall Grade</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {Number(averageScore) >= 70 ? 'A (Distinction)' : Number(averageScore) >= 60 ? 'B (Very Good)' : 'C (Credit)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold">Subject</th>
                      <th className="px-3 py-3 font-semibold text-center">CA1 (10)</th>
                      <th className="px-3 py-3 font-semibold text-center">CA2 (10)</th>
                      <th className="px-3 py-3 font-semibold text-center">CA3 (10)</th>
                      <th className="px-3 py-3 font-semibold text-center">CA4 (10)</th>
                      <th className="px-3 py-3 font-semibold text-center">Exam (60)</th>
                      <th className="px-3 py-3 font-bold text-center">Total (100)</th>
                      <th className="px-3 py-3 font-bold text-center">Grade</th>
                      <th className="px-3 py-3 font-semibold text-center">Pos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentScores.map((score) => (
                      <tr key={score.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{score.subject}</td>
                        <td className="px-3 py-3 text-center text-slate-600">{score.ca1}</td>
                        <td className="px-3 py-3 text-center text-slate-600">{score.ca2}</td>
                        <td className="px-3 py-3 text-center text-slate-600">{score.ca3}</td>
                        <td className="px-3 py-3 text-center text-slate-600">{score.ca4}</td>
                        <td className="px-3 py-3 text-center font-medium text-slate-800">{score.exam}</td>
                        <td className="px-3 py-3 text-center font-bold text-slate-900">{score.total}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            score.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                            score.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                            score.grade === 'C' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {score.grade}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-600 font-medium">
                          {score.position || "-"}
                        </td>
                      </tr>
                    ))}
                    {studentScores.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                          No assessment scores published for this term yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Remarks Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block text-xs uppercase mb-1">
                    Form Teacher's Assessment & Remark:
                  </span>
                  <p className="text-slate-600 italic">
                    "An exceptionally dedicated and disciplined student with remarkable potential. Keep up the high standard."
                  </p>
                  <span className="block text-[11px] font-semibold text-slate-500 mt-2">
                    — Class Form Master
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block text-xs uppercase mb-1">
                    Principal's Official Remark:
                  </span>
                  <p className="text-slate-600 italic">
                    "Very satisfactory result. Approved for promotion/academic excellence commendation."
                  </p>
                  <span className="block text-[11px] font-semibold text-slate-500 mt-2">
                    — IORTYER EMMANUEL (Principal)
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                Authorized Staff Access Only • Emmanuel Secondary School Security Policy
              </span>
              <Button 
                onClick={() => setShowResultsModal(false)}
                variant="outline"
                size="sm"
              >
                Close View
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
