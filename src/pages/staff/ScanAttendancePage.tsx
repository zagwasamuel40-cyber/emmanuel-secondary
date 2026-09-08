import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  CameraOff, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  UserCheck, 
  Clock, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  GraduationCap,
  Briefcase,
  Calendar,
  Phone,
  RefreshCw,
  LogOut,
  LogIn,
  Layers,
  Users,
  AlertCircle,
  HelpCircle,
  Maximize2
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useStudents } from "../../data/studentsData";
import { useTeachers } from "../../data/teachersData";
import { 
  useIdCards, 
  useAttendance, 
  useStaffAttendance,
  useQRScanLogs,
  recordStudentAttendance, 
  recordStaffAttendance,
  logScanEvent,
  getTodayDateString 
} from "../../data/idCardAndAttendanceData";
import { extractTokenFromScan } from "../../utils/qrCodeGenerator";
import { AttendanceStatus } from "../../types/idCardAndAttendance";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui";

interface DetectedPerson {
  type: 'staff' | 'student';
  id: string;
  name: string;
  subtitle: string; // Department or Class
  roleOrAdmission: string;
  photoUrl?: string;
  phone?: string;
  gender?: string;
  status: string;
  cardStatus: 'active' | 'deactivated' | 'lost' | 'stolen' | 'expired' | 'unregistered';
}

export default function ScanAttendancePage() {
  const [students] = useStudents();
  const [teachers] = useTeachers();
  const [idCards] = useIdCards();
  const [studentAttendance] = useAttendance();
  const [staffAttendance] = useStaffAttendance();
  const [, setScanLogs] = useQRScanLogs();

  // Scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [scanMode, setScanMode] = useState<'all' | 'staff' | 'student'>('all');
  
  // Last Scanned Result State
  const [lastScannedPerson, setLastScannedPerson] = useState<DetectedPerson | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'duplicate' | 'error' | 'security_alert';
    title: string;
    message: string;
    timestamp: string;
    action?: 'check_in' | 'check_out';
  } | null>(null);

  // Manual fallback search
  const [manualQuery, setManualQuery] = useState("");
  const [sessionScans, setSessionScans] = useState<Array<{
    id: string;
    name: string;
    type: 'staff' | 'student';
    subtitle: string;
    time: string;
    status: string;
    isDuplicate?: boolean;
  }>>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "auto-attendance-scanner-container";
  const cooldownTimerRef = useRef<any>(null);

  // Logged-in Officer or Staff
  const loggedInUserId = localStorage.getItem("loggedInUserId") || "STF/2026/088";
  const currentStaff = teachers.find(t => t.id === loggedInUserId) || {
    id: loggedInUserId,
    name: "Attendance Officer",
    role: "Attendance Officer"
  };

  // Sound effects
  const playAudioTone = (toneType: 'success' | 'duplicate' | 'error') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();

      if (toneType === 'success') {
        // High, cheerful double beep (880Hz -> 1320Hz)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.12);

        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(1320, audioCtx.currentTime);
          gain2.gain.setValueAtTime(0.2, audioCtx.currentTime);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.18);
        }, 120);
      } else if (toneType === 'duplicate') {
        // Amber warning tone (440Hz -> 380Hz)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        // Low error buzzer (220Hz)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {}
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError("");
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }
      if (html5QrCodeRef.current.isScanning) {
        setIsScanning(true);
        return;
      }

      // Check for mediaDevices support first
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is not supported by this browser environment. You can enter the Student ID or Token manually below.");
        setIsScanning(false);
        return;
      }

      // Query available camera devices safely
      const devices = await Html5Qrcode.getCameras().catch(() => []);
      if (!devices || devices.length === 0) {
        setCameraError("No physical camera detected on this device. You can enter the Student ID or Token manually below.");
        setIsScanning(false);
        return;
      }

      // If available, prefer back/environment camera, else use the first detected camera ID
      const backCamera = devices.find(d => /back|rear|environment/i.test(d.label));
      const cameraId = backCamera ? backCamera.id : devices[0].id;

      await html5QrCodeRef.current.start(
        cameraId,
        {
          fps: 15, // Smooth responsive frame rate
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleAutoScanDecoded(decodedText);
        },
        () => {
          // Frame callback without error
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      const errStr = String(err?.message || err?.name || err);
      const isNotFound = /NotFoundError|Requested device not found|device not found|no camera/i.test(errStr);
      const isNotAllowed = /NotAllowedError|Permission denied|PermissionDismissed/i.test(errStr);

      if (isNotFound) {
        setCameraError("No physical camera detected on this device. Please use the Manual ID / Barcode Search below.");
      } else if (isNotAllowed) {
        setCameraError("Camera permission was denied. Please allow camera access in your browser or use manual entry below.");
      } else {
        setCameraError(err?.message || "Could not access camera. Please use manual entry below.");
      }
      setIsScanning(false);
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
      setIsScanning(false);
    }
  };

  // Auto-start camera on component mount
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        startCamera();
      }
    }, 400);

    return () => {
      mounted = false;
      clearTimeout(timer);
      clearInterval(cooldownTimerRef.current);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Cooldown countdown
  const startCooldown = (seconds = 3) => {
    setCooldownRemaining(seconds);
    clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          setIsProcessing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetCooldownNow = () => {
    clearInterval(cooldownTimerRef.current);
    setCooldownRemaining(0);
    setIsProcessing(false);
  };

  // Core Automatic QR Identification & Attendance Recording
  const handleAutoScanDecoded = (rawText: string) => {
    // If cooldown is active, ignore further frames
    if (isProcessing) return;
    setIsProcessing(true);

    const token = extractTokenFromScan(rawText);
    processIdentification(token);
  };

  const processIdentification = (tokenOrId: string) => {
    const cleanQuery = tokenOrId.trim();
    if (!cleanQuery) {
      setIsProcessing(false);
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    // Step 1: Check ID Cards Registry
    const matchedCard = idCards.find(c => 
      c.qrToken === cleanQuery || 
      c.studentId.toLowerCase() === cleanQuery.toLowerCase() ||
      c.barcode.toLowerCase() === cleanQuery.toLowerCase()
    );

    let isStaffEntity = false;
    let matchedTeacher: any = null;
    let matchedStudent: any = null;

    if (matchedCard?.userType === 'staff' || cleanQuery.startsWith('STAFF-') || cleanQuery.startsWith('TCH/') || cleanQuery.startsWith('ADM/') || cleanQuery.startsWith('STF/')) {
      isStaffEntity = true;
      const targetId = matchedCard ? matchedCard.studentId : cleanQuery;
      matchedTeacher = teachers.find(t => 
        t.id.toLowerCase() === targetId.toLowerCase() || 
        t.name.toLowerCase() === cleanQuery.toLowerCase()
      );
    } else {
      const targetId = matchedCard ? matchedCard.studentId : cleanQuery;
      matchedStudent = students.find(s => 
        s.id.toLowerCase() === targetId.toLowerCase() || 
        s.name.toLowerCase() === cleanQuery.toLowerCase()
      );
      // Fallback: If not found in students, check teachers
      if (!matchedStudent) {
        matchedTeacher = teachers.find(t => 
          t.id.toLowerCase() === targetId.toLowerCase()
        );
        if (matchedTeacher) isStaffEntity = true;
      }
    }

    // Unrecognized code
    if (!matchedTeacher && !matchedStudent) {
      playAudioTone('error');
      setFeedback({
        type: 'error',
        title: 'Unrecognized QR Code',
        message: 'This QR code is not registered with Emmanuel Secondary School.',
        timestamp: timeStr
      });
      startCooldown(3);
      return;
    }

    // Step 2: Security Verification (Deactivated / Lost / Stolen)
    if (matchedCard && matchedCard.cardStatus !== 'active') {
      playAudioTone('error');
      const personName = matchedTeacher ? matchedTeacher.name : matchedStudent.name;
      const personId = matchedTeacher ? matchedTeacher.id : matchedStudent.id;
      
      setLastScannedPerson({
        type: isStaffEntity ? 'staff' : 'student',
        id: personId,
        name: personName,
        subtitle: isStaffEntity ? (matchedTeacher.department || 'Staff') : (matchedStudent.class || 'Student'),
        roleOrAdmission: isStaffEntity ? matchedTeacher.role : matchedStudent.id,
        photoUrl: matchedTeacher?.passportUrl,
        status: 'Deactivated',
        cardStatus: matchedCard.cardStatus
      });

      setFeedback({
        type: 'security_alert',
        title: `SECURITY ALERT: Card is ${matchedCard.cardStatus.toUpperCase()}`,
        message: `This ID card has been reported as ${matchedCard.cardStatus}. Access denied. Please confiscate or escort to admin.`,
        timestamp: timeStr
      });

      // Audit log security incident
      logScanEvent(
        matchedCard.qrToken,
        matchedTeacher || matchedStudent,
        currentStaff,
        "Identity Verification",
        "Card Deactivated",
        "Attendance Officer Camera Scanner",
        isStaffEntity ? 'staff' : 'student'
      );

      startCooldown(4);
      return;
    }

    // Step 3: Record Attendance
    if (isStaffEntity && matchedTeacher) {
      // Build Person Details
      const person: DetectedPerson = {
        type: 'staff',
        id: matchedTeacher.id,
        name: matchedTeacher.name,
        subtitle: matchedTeacher.department || 'Academic Department',
        roleOrAdmission: matchedTeacher.role || 'Staff',
        photoUrl: matchedTeacher.passportUrl,
        phone: matchedTeacher.phone,
        status: matchedTeacher.status,
        cardStatus: matchedCard?.cardStatus || 'active'
      };
      setLastScannedPerson(person);

      // Call Staff Attendance Engine
      const result = recordStaffAttendance({
        staff: matchedTeacher,
        status: "Present",
        method: "qr_scan",
        mode: "auto",
        staffUser: currentStaff
      });

      // Log event
      logScanEvent(
        matchedCard?.qrToken || `STAFF-MANUAL-${matchedTeacher.id}`,
        matchedTeacher,
        currentStaff,
        "Attendance Recording",
        "Verified",
        "Attendance Officer Camera Scanner",
        'staff'
      );

      if (result.duplicate) {
        playAudioTone('duplicate');
        setFeedback({
          type: 'duplicate',
          title: 'Attendance Already Recorded Today',
          message: `${matchedTeacher.name} was already marked Present today at ${result.record?.checkInTime || 'Morning Resumption'}.`,
          timestamp: timeStr,
          action: 'check_in'
        });

        // Add to session scans feed
        setSessionScans(prev => [
          {
            id: matchedTeacher.id,
            name: matchedTeacher.name,
            type: 'staff',
            subtitle: matchedTeacher.department,
            time: timeStr,
            status: 'Already Checked In',
            isDuplicate: true
          },
          ...prev.slice(0, 9)
        ]);
      } else {
        playAudioTone('success');
        setFeedback({
          type: 'success',
          title: 'Attendance Recorded Successfully',
          message: `${matchedTeacher.name} – Attendance successfully recorded at ${timeStr}.`,
          timestamp: timeStr,
          action: result.action
        });

        // Add to session scans feed
        setSessionScans(prev => [
          {
            id: matchedTeacher.id,
            name: matchedTeacher.name,
            type: 'staff',
            subtitle: matchedTeacher.department,
            time: timeStr,
            status: 'Present',
            isDuplicate: false
          },
          ...prev.slice(0, 9)
        ]);
      }

      startCooldown(3);
    } else if (matchedStudent) {
      // Build Person Details
      const person: DetectedPerson = {
        type: 'student',
        id: matchedStudent.id,
        name: matchedStudent.name,
        subtitle: `Class: ${matchedStudent.class}`,
        roleOrAdmission: `Adm No: ${matchedStudent.id}`,
        photoUrl: undefined, // placeholder avatar
        phone: matchedStudent.parentNumber,
        gender: matchedStudent.gender,
        status: matchedStudent.status,
        cardStatus: matchedCard?.cardStatus || 'active'
      };
      setLastScannedPerson(person);

      // Call Student Attendance Engine
      const result = recordStudentAttendance({
        student: matchedStudent,
        status: "Present",
        period: "Morning Assembly",
        method: "qr_scan",
        staffUser: currentStaff
      });

      // Log scan event
      logScanEvent(
        matchedCard?.qrToken || `STUDENT-MANUAL-${matchedStudent.id}`,
        matchedStudent,
        currentStaff,
        "Attendance Recording",
        "Verified",
        "Attendance Officer Camera Scanner",
        'student'
      );

      if (result.duplicate) {
        playAudioTone('duplicate');
        setFeedback({
          type: 'duplicate',
          title: 'Attendance Already Recorded Today',
          message: `${matchedStudent.name} was already marked Present today at ${result.record?.time || 'Morning Assembly'}.`,
          timestamp: timeStr
        });

        setSessionScans(prev => [
          {
            id: matchedStudent.id,
            name: matchedStudent.name,
            type: 'student',
            subtitle: matchedStudent.class,
            time: timeStr,
            status: 'Already Present',
            isDuplicate: true
          },
          ...prev.slice(0, 9)
        ]);
      } else {
        playAudioTone('success');
        setFeedback({
          type: 'success',
          title: 'Attendance Recorded Successfully',
          message: `${matchedStudent.name} – Attendance successfully recorded at ${timeStr}.`,
          timestamp: timeStr
        });

        setSessionScans(prev => [
          {
            id: matchedStudent.id,
            name: matchedStudent.name,
            type: 'student',
            subtitle: matchedStudent.class,
            time: timeStr,
            status: 'Present',
            isDuplicate: false
          },
          ...prev.slice(0, 9)
        ]);
      }

      startCooldown(3);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    setIsProcessing(true);
    processIdentification(manualQuery.trim());
    setManualQuery("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-600/20 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
                <QrCode size={24} />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Live Attendance QR Scanner
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Instant Auto-Detect Attendance Terminal for Staff & Students
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2">
              <UserCheck size={16} className="text-emerald-400" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Officer</span>
                <span className="font-bold text-white line-clamp-1">{currentStaff.name}</span>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2">
              <Clock size={16} className="text-brand-400" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Session Date</span>
                <span className="font-bold text-white">{getTodayDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scanner Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Camera Viewfinder (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 py-3.5 px-4 sm:px-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900">
                  Live Camera Scanner
                </CardTitle>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  Auto-Detect Active
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isScanning ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={stopCamera} 
                    className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <CameraOff size={14} className="mr-1.5" /> Pause Camera
                  </Button>
                ) : (
                  <Button 
                    variant="brand" 
                    size="sm" 
                    onClick={startCamera} 
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Camera size={14} className="mr-1.5" /> Start Camera
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center relative min-h-[380px] overflow-hidden">
              {/* html5-qrcode target container */}
              <div 
                id={scannerContainerId} 
                className="w-full max-w-[340px] sm:max-w-[420px] aspect-square rounded-2xl overflow-hidden bg-black shadow-inner relative"
              />

              {/* Viewfinder Target Framing Overlay */}
              {isScanning && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-dashed border-emerald-400/70 rounded-2xl relative flex items-center justify-center animate-pulse">
                    {/* Corner Accent Brackets */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                    
                    {/* Laser scanning line */}
                    <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] absolute top-1/2 -translate-y-1/2 animate-bounce" />
                  </div>
                </div>
              )}

              {/* Camera Error Message fallback */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white z-20">
                  <AlertTriangle size={36} className="text-amber-400 mb-2" />
                  <p className="font-bold text-sm text-slate-100 mb-1">Camera Feed Unavailable</p>
                  <p className="text-xs text-slate-400 max-w-xs mb-4">{cameraError}</p>
                  <Button size="sm" variant="brand" onClick={startCamera}>
                    <RefreshCw size={14} className="mr-1.5" /> Try Reconnecting Camera
                  </Button>
                </div>
              )}

              {/* Cooldown progress indicator when scan was just recorded */}
              {cooldownRemaining > 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 flex items-center justify-between text-white z-30 shadow-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
                      {cooldownRemaining}s
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-100">Ready for next card</p>
                      <p className="text-[11px] text-slate-400">Position next ID card in front of camera</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={resetCooldownNow}
                    className="h-8 text-xs bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                  >
                    Scan Now
                  </Button>
                </div>
              )}
            </CardContent>

            {/* Quick Manual Entry Bar below scanner */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    type="text" 
                    placeholder="Manual Fallback: Type Staff ID or Student ID (e.g. TCH/2026/042 or ESS/2026/001)..."
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    className="pl-9 bg-white border-slate-300 text-xs sm:text-sm h-10"
                  />
                </div>
                <Button type="submit" variant="brand" className="h-10 px-4 text-xs font-bold gap-1.5 whitespace-nowrap">
                  Record Attendance <ArrowRight size={14} />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Right Column: Person Profile & Attendance Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Status Feedback Banner */}
          {feedback ? (
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all shadow-sm ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                : feedback.type === 'duplicate'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : feedback.type === 'security_alert'
                ? 'bg-rose-50 border-rose-400 text-rose-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}>
              <div className="mt-0.5 shrink-0">
                {feedback.type === 'success' && <CheckCircle2 size={24} className="text-emerald-600" />}
                {feedback.type === 'duplicate' && <Clock size={24} className="text-amber-600" />}
                {feedback.type === 'security_alert' && <AlertTriangle size={24} className="text-rose-600" />}
                {feedback.type === 'error' && <AlertCircle size={24} className="text-red-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold tracking-tight line-clamp-1">
                    {feedback.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                    {feedback.timestamp}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed text-slate-700">
                  {feedback.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-slate-500 text-center py-6">
              <QrCode size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">Awaiting ID Card Scan</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Present any Staff or Student ID card in front of the camera lens.
              </p>
            </div>
          )}

          {/* Identified Person ID Card Preview */}
          {lastScannedPerson ? (
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className={`h-2.5 w-full ${lastScannedPerson.type === 'staff' ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-4">
                  {/* Avatar / Photo */}
                  <div className="relative shrink-0">
                    {lastScannedPerson.photoUrl ? (
                      <img 
                        src={lastScannedPerson.photoUrl} 
                        alt={lastScannedPerson.name} 
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm ${
                        lastScannedPerson.type === 'staff' ? 'bg-indigo-700' : 'bg-emerald-700'
                      }`}>
                        {lastScannedPerson.name.charAt(0)}
                      </div>
                    )}
                    <span className={`absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow-sm ${
                      lastScannedPerson.type === 'staff' ? 'bg-indigo-900' : 'bg-emerald-900'
                    }`}>
                      {lastScannedPerson.type}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">
                      {lastScannedPerson.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {lastScannedPerson.id}
                      </span>
                      <span className="text-xs text-slate-500">
                        {lastScannedPerson.roleOrAdmission}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 mt-1">
                      {lastScannedPerson.subtitle}
                    </p>
                  </div>
                </div>

                {/* Badges and metadata */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">ID Card Status</span>
                    <span className={`font-bold inline-flex items-center gap-1 mt-0.5 ${
                      lastScannedPerson.cardStatus === 'active' ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      <CheckCircle2 size={12} /> {lastScannedPerson.cardStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Account Status</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {lastScannedPerson.status || 'Active'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Session History Feed */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Users size={16} className="text-brand-600" />
                Scanned This Session ({sessionScans.length})
              </CardTitle>
              <span className="text-[10px] text-slate-400">Latest scans in memory</span>
            </CardHeader>

            <CardContent className="p-0 max-h-60 overflow-y-auto divide-y divide-slate-100">
              {sessionScans.length === 0 ? (
                <div className="p-5 text-center text-slate-400 text-xs">
                  No attendance scans recorded in this browser session yet.
                </div>
              ) : (
                sessionScans.map((scan, idx) => (
                  <div key={idx} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${scan.type === 'staff' ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 line-clamp-1">{scan.name}</p>
                        <p className="text-[11px] text-slate-500">{scan.id} • {scan.subtitle}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        scan.isDuplicate 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {scan.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{scan.time}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
