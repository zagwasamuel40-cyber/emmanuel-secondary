import React, { useState, useEffect, useRef } from "react";
import { Camera, CameraOff, QrCode, CheckCircle2, AlertTriangle, Search, LogIn, LogOut, FileText, UserCheck } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useTeachers } from "../../data/teachersData";
import { useIdCards, getTodayDateString, useStaffAttendance } from "../../data/idCardAndAttendanceData";
import { extractTokenFromScan } from "../../utils/qrCodeGenerator";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui";

export default function StaffQRScannerPage() {
  const [teachers] = useTeachers();
  const [idCards] = useIdCards();
  const [attendanceRecords, setAttendanceRecords] = useStaffAttendance();

  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [manualInput, setManualInput] = useState("");

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "staff-reader-container";

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted && !isScanning) startCamera();
    }, 500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

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

  const startCamera = async () => {
    setCameraError("");
    try {
      if (!html5QrCodeRef.current) html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);

      // Check for mediaDevices support first
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is not supported by this browser. Please use the Manual ID / Staff Code entry below.");
        setIsScanning(false);
        return;
      }

      // Query available camera devices safely
      const devices = await Html5Qrcode.getCameras().catch(() => []);
      if (!devices || devices.length === 0) {
        setCameraError("No physical camera detected on this device. Please use the Manual ID / Staff Code entry below.");
        setIsScanning(false);
        return;
      }

      // If available, prefer back/environment camera, else use the first detected camera ID
      const backCamera = devices.find(d => /back|rear|environment/i.test(d.label));
      const cameraId = backCamera ? backCamera.id : devices[0].id;

      await html5QrCodeRef.current.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => handleScannedText(decodedText),
        () => {}
      );
      setIsScanning(true);
    } catch (err: any) {
      const errStr = String(err?.message || err?.name || err);
      const isNotFound = /NotFoundError|Requested device not found|device not found|no camera/i.test(errStr);
      const isNotAllowed = /NotAllowedError|Permission denied|PermissionDismissed/i.test(errStr);

      if (isNotFound) {
        setCameraError("No physical camera detected on this device. Please use the Manual ID / Staff Code entry below.");
      } else if (isNotAllowed) {
        setCameraError("Camera permission was denied. Please allow camera access in your browser or use manual entry below.");
      } else {
        setCameraError(err?.message || "Could not access device camera. Please use manual entry below.");
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

  const handleScannedText = (rawText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const token = extractTokenFromScan(rawText);
    if (!token.startsWith("STAFF-")) {
      playBeep(true);
      setAttendanceMessage({ text: "Invalid QR code. This is not a Staff QR code.", isError: true });
      setTimeout(() => { setIsProcessing(false); setAttendanceMessage(null); }, 3000);
      return;
    }

    const matchedCard = idCards.find(c => c.qrToken === token && c.userType === 'staff');
    let matchedStaff = null;
    if (matchedCard) {
      matchedStaff = teachers.find(t => t.id === matchedCard.studentId);
    } else {
      matchedStaff = teachers.find(t => t.id.toLowerCase() === token.toLowerCase());
    }

    if (!matchedStaff) {
      playBeep(true);
      setAttendanceMessage({ text: "Staff member not found.", isError: true });
      setTimeout(() => { setIsProcessing(false); setAttendanceMessage(null); }, 3000);
      return;
    }

    if (matchedCard && matchedCard.cardStatus !== "active") {
      playBeep(true);
      setAttendanceMessage({ text: `SECURITY ALERT: Card is ${matchedCard.cardStatus.toUpperCase()}!`, isError: true });
      setTimeout(() => { setIsProcessing(false); setAttendanceMessage(null); }, 3000);
      return;
    }

    playBeep(false);
    recordAttendance(matchedStaff);
  };

  const recordAttendance = (staff: any) => {
    const today = getTodayDateString();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const existingIdx = attendanceRecords.findIndex(r => r.staffId === staff.id && r.date === today);
    let message = "";

    if (existingIdx !== -1) {
      // Check out
      if (attendanceRecords[existingIdx].checkOutTime) {
        message = `${staff.name} already checked out today at ${attendanceRecords[existingIdx].checkOutTime}.`;
        playBeep(true);
      } else {
        const updated = [...attendanceRecords];
        updated[existingIdx].checkOutTime = timeStr;
        setAttendanceRecords(updated);
        message = `${staff.name} checked out successfully at ${timeStr}.`;
      }
    } else {
      // Check in
      const newRecord = {
        id: `ATT-STF-${Date.now()}`,
        staffId: staff.id,
        staffName: staff.name,
        department: staff.systemRoles?.[0] || 'Staff',
        role: staff.systemRoles?.[0] || 'Staff',
        date: today,
        checkInTime: timeStr,
        status: "Present",
        method: "qr_scan",
        lateMinutes: 0
      };
      setAttendanceRecords([newRecord, ...attendanceRecords]);
      message = `${staff.name} checked in successfully at ${timeStr}.`;
    }

    setScannedResult(staff);
    setAttendanceMessage({ text: message });
    
    setTimeout(() => {
      setScannedResult(null);
      setAttendanceMessage(null);
      setIsProcessing(false);
    }, 3500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <UserCheck className="text-brand-600" size={24} />
            Staff Attendance Scanner
          </h1>
          <p className="text-slate-500 text-sm mt-1">Scan staff ID cards to record check-in and check-out times.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 overflow-hidden shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera size={18} className="text-brand-600" />
                QR Code Scanner
              </CardTitle>
              <Button
                variant={isScanning ? "outline" : "brand"}
                size="sm"
                onClick={isScanning ? stopCamera : startCamera}
                className="h-8 gap-1"
              >
                {isScanning ? (
                  <><CameraOff size={14} /> Stop Scanner</>
                ) : (
                  <><Camera size={14} /> Start Scanner</>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative bg-black aspect-square max-h-[500px] w-full flex items-center justify-center">
            {cameraError ? (
              <div className="text-center p-6 text-white">
                <AlertTriangle className="mx-auto mb-2 text-rose-500" size={32} />
                <p className="text-sm">{cameraError}</p>
                <Button onClick={startCamera} variant="outline" className="mt-4 border-white/20 hover:bg-white/10 text-white">
                  Try Again
                </Button>
              </div>
            ) : (
              <div id={scannerContainerId} className="w-full h-full [&>video]:object-cover" />
            )}
            
            {!isScanning && !cameraError && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center">
                  <QrCode size={48} className="mx-auto text-white/50 mb-3" />
                  <p className="text-white/70 font-medium">Camera is turned off</p>
                </div>
              </div>
            )}
            
            {attendanceMessage && (
              <div className={`absolute bottom-6 left-6 right-6 p-4 rounded-xl text-center shadow-lg font-bold ${
                attendanceMessage.isError ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
              } animate-in fade-in slide-in-from-bottom-4`}>
                <div className="flex items-center justify-center gap-2">
                  {attendanceMessage.isError ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                  {attendanceMessage.text}
                </div>
              </div>
            )}
          </CardContent>
          <div className="p-4 border-t border-slate-100 bg-slate-50">
             <div className="flex gap-2">
               <Input 
                 placeholder="Manual Staff ID Entry (e.g. TCH/2026/001)"
                 value={manualInput}
                 onChange={e => setManualInput(e.target.value)}
                 className="h-9"
               />
               <Button onClick={() => handleScannedText(manualInput)} className="h-9 whitespace-nowrap">
                 Submit
               </Button>
             </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">Today's Check-ins ({getTodayDateString()})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {attendanceRecords.filter(r => r.date === getTodayDateString()).length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {attendanceRecords.filter(r => r.date === getTodayDateString()).map((record: any) => (
                      <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <div className="font-bold text-slate-800">{record.staffName}</div>
                          <div className="text-xs text-slate-500">{record.staffId} • {record.department}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold flex items-center gap-1 text-emerald-600 justify-end">
                            <LogIn size={14} /> {record.checkInTime}
                          </div>
                          {record.checkOutTime && (
                            <div className="text-xs font-semibold flex items-center gap-1 text-rose-600 justify-end mt-1">
                              <LogOut size={12} /> {record.checkOutTime}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <FileText className="mx-auto mb-2 opacity-50" size={32} />
                    <p>No staff check-ins recorded today.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
