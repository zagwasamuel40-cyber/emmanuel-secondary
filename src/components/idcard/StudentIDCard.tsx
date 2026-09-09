import React, { useState, useEffect, useRef } from "react";
import { 
  IDCard, 
  IDCardCustomization 
} from "../../types/idCardAndAttendance";
import { generateQRCodeDataUrl, buildSecureQRPayload } from "../../utils/qrCodeGenerator";
import { 
  ShieldCheck, 
  Download, 
  Printer, 
  RotateCw, 
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Check,
  Loader2
} from "lucide-react";
import {
  downloadCardSidePNG,
  downloadBothSidesPNG,
  downloadCardCR80PDF,
  downloadCardA4PrintablePDF
} from "../../utils/idCardDownload";

interface StudentIDCardProps {
  student: {
    id: string;
    name: string;
    class?: string;
    gender?: string;
    status?: string;
    passportUrl?: string;
    parentNumber?: string;
    email?: string;
    address?: string;
    dob?: string;
    bloodGroup?: string;
  };
  cardInfo?: IDCard;
  customization: IDCardCustomization;
  defaultSide?: "front" | "back";
  showActions?: boolean;
  onReissue?: () => void;
  className?: string;
}

export default function StudentIDCard({
  student,
  cardInfo,
  customization,
  defaultSide = "front",
  showActions = true,
  onReissue,
  className = ""
}: StudentIDCardProps) {
  const [activeSide, setActiveSide] = useState<"front" | "back">(defaultSide);

  useEffect(() => {
    setActiveSide(defaultSide);
  }, [defaultSide]);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string>("");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const frontExportRef = useRef<HTMLDivElement>(null);
  const backExportRef = useRef<HTMLDivElement>(null);

  const qrToken = cardInfo?.qrToken || `ESS-SEC-QR-${student.id}`;
  const isDeactivated = cardInfo?.cardStatus && cardInfo.cardStatus !== "active";
  const academicSession = cardInfo?.academicSession || "2025/2026";
  const expiryDate = cardInfo?.expiryDate || "31/07/2027";

  useEffect(() => {
    let isMounted = true;
    const payload = buildSecureQRPayload(qrToken);
    generateQRCodeDataUrl(payload, 360).then(url => {
      if (isMounted) setQrDataUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [qrToken]);

  // Color theme styling
  const themeClasses = {
    classic_navy: {
      cardBg: "from-slate-900 via-slate-800 to-indigo-950",
      accent: "bg-amber-500",
      accentText: "text-amber-400",
      border: "border-amber-400/40",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      headerBg: "bg-slate-950/80 border-b border-amber-500/30",
      subAccent: "text-indigo-200"
    },
    modern_emerald: {
      cardBg: "from-emerald-950 via-teal-900 to-slate-900",
      accent: "bg-emerald-400",
      accentText: "text-emerald-400",
      border: "border-emerald-400/40",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      headerBg: "bg-emerald-950/90 border-b border-emerald-400/30",
      subAccent: "text-emerald-200"
    },
    executive_gold: {
      cardBg: "from-stone-900 via-neutral-900 to-amber-950",
      accent: "bg-yellow-500",
      accentText: "text-yellow-400",
      border: "border-yellow-400/40",
      badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      headerBg: "bg-black/80 border-b border-yellow-400/30",
      subAccent: "text-amber-200"
    },
    tech_slate: {
      cardBg: "from-slate-900 via-slate-800 to-zinc-900",
      accent: "bg-cyan-400",
      accentText: "text-cyan-400",
      border: "border-cyan-400/40",
      badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      headerBg: "bg-slate-950/80 border-b border-cyan-400/30",
      subAccent: "text-cyan-200"
    }
  }[customization.templateStyle || "classic_navy"];

  const handlePrint = () => {
    window.print();
  };

  const showSuccessNotice = (msg: string) => {
    setDownloadSuccessToast(msg);
    setTimeout(() => {
      setDownloadSuccessToast(null);
    }, 4000);
  };

  // 1. Download CR-80 PVC 2-Page PDF
  const handleDownloadCR80PDF = async () => {
    setShowDownloadMenu(false);
    setIsExporting(true);
    setExportMessage("Generating CR-80 PVC Card PDF...");
    try {
      await downloadCardCR80PDF({
        frontElement: frontExportRef.current || cardRef.current,
        backElement: backExportRef.current,
        studentName: student.name,
        studentId: student.id
      });
      showSuccessNotice("Official PVC Card PDF downloaded!");
    } catch (err) {
      console.error("PDF download failed", err);
      // Fallback to active view capture
      if (cardRef.current) {
        await downloadCardSidePNG(cardRef.current, `ID_CARD_${student.id}_${activeSide}.png`);
        showSuccessNotice("Card image downloaded as PNG!");
      }
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  // 2. Download A4 Printable Sheet PDF
  const handleDownloadA4PDF = async () => {
    setShowDownloadMenu(false);
    setIsExporting(true);
    setExportMessage("Generating A4 Printable Sheet PDF...");
    try {
      const frontEl = frontExportRef.current || cardRef.current;
      const backEl = backExportRef.current || cardRef.current;
      if (frontEl && backEl) {
        await downloadCardA4PrintablePDF({
          frontElement: frontEl,
          backElement: backEl,
          studentName: student.name,
          studentId: student.id,
          studentClass: student.class
        });
        showSuccessNotice("A4 Printable Badge PDF downloaded!");
      }
    } catch (err) {
      console.error("A4 PDF download failed", err);
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  // 3. Download Front PNG
  const handleDownloadFrontPNG = async () => {
    setShowDownloadMenu(false);
    setIsExporting(true);
    setExportMessage("Generating Front PNG...");
    try {
      const targetEl = frontExportRef.current || (activeSide === "front" ? cardRef.current : null);
      if (targetEl) {
        await downloadCardSidePNG(targetEl, `ID_CARD_${student.id.replace(/[^a-zA-Z0-9]/g, '_')}_FRONT.png`);
        showSuccessNotice("Front side PNG downloaded!");
      }
    } catch (err) {
      console.error("Front PNG export failed", err);
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  // 4. Download Back PNG (with QR)
  const handleDownloadBackPNG = async () => {
    setShowDownloadMenu(false);
    setIsExporting(true);
    setExportMessage("Generating Back QR PNG...");
    try {
      const targetEl = backExportRef.current || (activeSide === "back" ? cardRef.current : null);
      if (targetEl) {
        await downloadCardSidePNG(targetEl, `ID_CARD_${student.id.replace(/[^a-zA-Z0-9]/g, '_')}_BACK_QR.png`);
        showSuccessNotice("Back side (QR) PNG downloaded!");
      }
    } catch (err) {
      console.error("Back PNG export failed", err);
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  // 5. Download Both Sides (Showcase PNG)
  const handleDownloadBothSidesPNG = async () => {
    setShowDownloadMenu(false);
    setIsExporting(true);
    setExportMessage("Generating Both Sides Showcase PNG...");
    try {
      const frontEl = frontExportRef.current || cardRef.current;
      const backEl = backExportRef.current || cardRef.current;
      if (frontEl && backEl) {
        await downloadBothSidesPNG(frontEl, backEl, `ID_CARD_${student.id.replace(/[^a-zA-Z0-9]/g, '_')}_DOUBLE_SIDED.png`);
        showSuccessNotice("Double-sided ID Card PNG downloaded!");
      }
    } catch (err) {
      console.error("Double sided export failed", err);
    } finally {
      setIsExporting(false);
      setExportMessage("");
    }
  };

  // Common Front side content renderer
  const renderFrontContent = () => (
    <div className="relative h-full flex flex-col justify-between p-4 z-10 select-none">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <img 
            src={customization.logoUrl || "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80"} 
            alt="School Crest" 
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/80 shadow-md shrink-0 bg-white" 
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-[13px] font-extrabold uppercase tracking-tight leading-tight text-white line-clamp-2">
              {customization.schoolName || "EMMANUEL SECONDARY SCHOOL"}
            </h2>
            <p className="text-[9px] text-amber-300 font-medium tracking-wide italic mt-0.5 truncate">
              {customization.schoolMotto || "Excellence, Knowledge & Moral Discipline"}
            </p>
            <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.2 rounded text-[8.5px] font-bold uppercase tracking-wider bg-white/10 text-slate-200">
              {cardInfo?.userType === 'staff' ? 'Staff Identity Card' : 'Student Identity Card'}
            </div>
          </div>
        </div>

        {/* Decorative Holographic stripe */}
        <div className="h-1 w-full mt-2.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 opacity-90" />
      </div>

      {/* Passport Photo & Chip Section */}
      <div className="my-auto flex flex-col items-center text-center">
        <div className="relative mb-2.5">
          {/* Passport Frame */}
          <div className="w-28 h-32 rounded-xl p-1 bg-gradient-to-b from-amber-400 via-slate-300 to-amber-500 shadow-lg">
            <div className="w-full h-full rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
              {student.passportUrl ? (
                <img 
                  src={student.passportUrl} 
                  alt={student.name} 
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                  <span className="text-3xl font-bold text-amber-400">
                    {student.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </span>
                  <span className="text-[9px] mt-1 text-slate-400 uppercase tracking-widest font-semibold">Passport</span>
                </div>
              )}
            </div>
          </div>

          {/* Status indicator pin */}
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-emerald-500 text-white shadow-md border border-white/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Active
          </div>

          {/* Smart Chip Graphic on left */}
          {customization.showChipGraphic && (
            <div className="absolute top-3 -left-12 w-9 h-7 rounded border border-amber-400/60 bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 shadow-inner flex items-center justify-center">
              <div className="w-7 h-5 border border-amber-700/40 rounded-[2px] grid grid-cols-2 gap-0.5 p-0.5">
                <div className="border-r border-b border-amber-800/40" />
                <div className="border-b border-amber-800/40" />
                <div className="border-r border-amber-800/40" />
                <div />
              </div>
            </div>
          )}
        </div>

        {/* Student Name */}
        <h3 className="text-base font-bold text-white tracking-wide mt-1 leading-tight line-clamp-1 max-w-[290px]">
          {student.name}
        </h3>

        {/* Admission Number */}
        <div className="mt-1 px-3 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold tracking-wider">
          {student.id}
        </div>

        {/* Class & Session Details Grid */}
        <div className="w-full grid grid-cols-2 gap-2 mt-3 text-left bg-slate-950/50 rounded-xl p-2.5 border border-white/10 text-[11px]">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">{cardInfo?.userType === 'staff' ? 'Role & Dept' : 'Class / Arm'}</span>
            <span className="font-bold text-white text-xs truncate block" title={cardInfo?.userType === 'staff' ? `${(student as any).role || 'Faculty Member'} (${(student as any).department || 'Staff'})` : student.class}>
              {cardInfo?.userType === 'staff' ? ((student as any).role || (student as any).department || 'Faculty Staff') : student.class}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Session</span>
            <span className="font-bold text-amber-300 text-xs">{academicSession}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Gender</span>
            <span className="font-medium text-slate-200">{student.gender || "Male"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">Valid Until</span>
            <span className="font-medium text-slate-200">{expiryDate}</span>
          </div>
        </div>
      </div>

      {/* Footer Notice & Flip Prompt */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
        <div className="flex items-center gap-1 text-amber-300 font-semibold">
          <ShieldCheck size={12} />
          <span>NDPR Protected & Encrypted</span>
        </div>
        <button 
          onClick={() => setActiveSide("back")} 
          className="flex items-center gap-1 hover:text-white transition-colors print:hidden"
        >
          <QrCode size={12} className="text-amber-400" />
          <span>QR on Back →</span>
        </button>
      </div>
    </div>
  );

  // Common Back side content renderer
  const renderBackContent = () => (
    <div className="relative h-full flex flex-col justify-between p-4 z-10 select-none">
      {/* Back Header */}
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Identity & Attendance QR</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">Card #{cardInfo?.id || "IDC-2026"}</span>
        </div>
      </div>

      {/* QR Code Block */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative p-2.5 bg-white rounded-2xl shadow-2xl border-2 border-amber-400/80">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="Student Security QR Code" 
              crossOrigin="anonymous"
              className="w-36 h-36 object-contain rounded-lg"
            />
          ) : (
            <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
              Generating QR...
            </div>
          )}
          {/* Center micro logo inside QR */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-lg">
            <span className="text-[9px] font-black text-amber-400">ESS</span>
          </div>
        </div>

        <div className="mt-2 text-center">
          <span className="inline-block text-[10px] font-bold text-amber-300 tracking-wider uppercase">
            Scan to Record Attendance & Verify
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">
            Authorized ESS Staff Scanner or Mobile Portal
          </p>
        </div>

        {/* Simulated Barcode */}
        <div className="mt-2.5 w-48 flex flex-col items-center">
          <div className="w-full h-7 bg-white rounded flex items-center justify-between px-2.5 py-1">
            {/* Visual barcode stripes */}
            <div className="w-full h-full flex items-stretch gap-[1.5px] justify-center overflow-hidden">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 2, 3, 1, 2, 4, 1].map((w, i) => (
                <div 
                  key={i} 
                  className="bg-black shrink-0" 
                  style={{ width: `${w}px` }} 
                />
              ))}
            </div>
          </div>
          <span className="text-[8px] font-mono text-slate-400 tracking-widest mt-0.5">
            *{student.id.replace(/[^a-zA-Z0-9]/g, '')}*
          </span>
        </div>
      </div>

      {/* Emergency Info & Terms */}
      <div className="space-y-2 text-[9px] bg-slate-950/60 p-2.5 rounded-xl border border-white/10 text-slate-300">
        <div className="grid grid-cols-2 gap-1.5 pb-1.5 border-b border-white/10">
          <div>
            <span className="text-slate-400 block text-[8px] uppercase">{cardInfo?.userType === 'staff' ? 'Staff Official Contact:' : 'Emergency Parent:'}</span>
            <span className="font-semibold text-white truncate block">{(student as any).phone || student.parentNumber || customization.contactPhone}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[8px] uppercase">Blood Group:</span>
            <span className="font-semibold text-white">{student.bloodGroup || "O+ (Verified)"}</span>
          </div>
        </div>

        <p className="text-[8px] leading-tight text-slate-400 text-justify">
          {cardInfo?.userType === 'staff' 
            ? "Official Emmanuel Secondary School Faculty Credential. Bearer is authorized for school access, gate biometric/QR attendance, and official duties. Property of ESS. If found, please return to the Principal's Office or call school security."
            : customization.customFooterNote}
        </p>

        <div className="flex items-center justify-between pt-1 text-[8px] text-slate-400 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Phone size={10} className="text-amber-400" />
            {customization.contactPhone.split('/')[0]}
          </span>
          <span className="text-amber-400 font-medium">emmanuelschoolsmkd.com</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Toast Notification when Download completes */}
      {downloadSuccessToast && (
        <div className="w-full max-w-[340px] mb-2 p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-200 shrink-0" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* Top Card Controls */}
      {showActions && (
        <div className="w-full max-w-[340px] flex items-center justify-between gap-2 mb-3 print:hidden relative">
          <button
            onClick={() => setActiveSide(activeSide === "front" ? "back" : "front")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RotateCw size={14} className="text-brand-600" />
            Flip: {activeSide === "front" ? "Back (QR)" : "Front"}
          </button>

          <div className="flex items-center gap-1.5">
            {/* Download Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                disabled={isExporting}
                title="Download ID Card Options"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span>Download</span>
                <ChevronDown size={13} className={`transition-transform ${showDownloadMenu ? "rotate-180" : ""}`} />
              </button>

              {/* Download Options Menu */}
              {showDownloadMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Choose Format
                  </div>

                  <button
                    onClick={handleDownloadCR80PDF}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                  >
                    <FileText size={15} className="text-rose-500" />
                    <div>
                      <div className="font-bold text-slate-800">PVC Card PDF (CR-80)</div>
                      <div className="text-[10px] text-slate-500 font-normal">Standard 2-page PVC plastic card size</div>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadA4PDF}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                  >
                    <Printer size={15} className="text-indigo-500" />
                    <div>
                      <div className="font-bold text-slate-800">A4 Printable Sheet (PDF)</div>
                      <div className="text-[10px] text-slate-500 font-normal">Front & back side-by-side with cut marks</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleDownloadBothSidesPNG}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                  >
                    <ImageIcon size={15} className="text-amber-500" />
                    <div>
                      <div className="font-bold text-slate-800">Both Sides (PNG Image)</div>
                      <div className="text-[10px] text-slate-500 font-normal">High-res showcase image</div>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadFrontPNG}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                  >
                    <ImageIcon size={15} className="text-emerald-500" />
                    <div>
                      <div className="font-bold text-slate-800">Front Side Only (PNG)</div>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadBackPNG}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                  >
                    <QrCode size={15} className="text-cyan-500" />
                    <div>
                      <div className="font-bold text-slate-800">Back Side with QR (PNG)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              title="Print ID Card"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-colors"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
          </div>
        </div>
      )}

      {/* Export status indicator */}
      {isExporting && (
        <div className="w-full max-w-[340px] mb-2 p-2 bg-brand-50 border border-brand-200 rounded-lg flex items-center gap-2 text-brand-700 text-xs font-semibold animate-pulse">
          <Loader2 size={14} className="animate-spin text-brand-600" />
          <span>{exportMessage || "Exporting ID card..."}</span>
        </div>
      )}

      {/* Warning if deactivated */}
      {isDeactivated && (
        <div className="w-full max-w-[340px] mb-2 p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-semibold">
          <AlertTriangle size={16} className="shrink-0 text-rose-600" />
          <span>Card is {cardInfo?.cardStatus?.toUpperCase()} — Scans will be rejected!</span>
        </div>
      )}

      {/* THE PHYSICAL VISIBLE ID CARD CONTAINER */}
      <div 
        ref={cardRef}
        id={`student-id-card-${student.id.replace(/[^a-zA-Z0-9]/g, '-')}`}
        className={`relative w-[330px] h-[520px] rounded-2xl shadow-xl overflow-hidden text-white font-sans border ${themeClasses.border} bg-gradient-to-b ${themeClasses.cardBg} transition-all duration-300 print:shadow-none print:m-0`}
      >
        {/* Anti-counterfeit security Guilloche / Watermark Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)`,
            backgroundSize: '16px 16px, 32px 32px'
          }}
        />

        {/* Diagonal security ribbon watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rotate-[-35deg] opacity-[0.06] text-center whitespace-nowrap">
          <div className="text-3xl font-extrabold tracking-widest uppercase">EMMANUEL SECONDARY SCHOOL</div>
          <div className="text-xs font-bold tracking-widest mt-1">OFFICIAL VERIFIED IDENTIFICATION CREDENTIAL</div>
        </div>

        {/* Active Side Content */}
        {activeSide === "front" ? renderFrontContent() : renderBackContent()}
      </div>

      {/* OFFSCREEN HIGH-RESOLUTION CONTAINERS (For instantaneous Front + Back double-sided export without flipping) */}
      <div 
        aria-hidden="true"
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 flex gap-4"
      >
        {/* Offscreen Front */}
        <div 
          ref={frontExportRef}
          className={`relative w-[330px] h-[520px] rounded-2xl overflow-hidden text-white font-sans border ${themeClasses.border} bg-gradient-to-b ${themeClasses.cardBg}`}
        >
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)`,
              backgroundSize: '16px 16px, 32px 32px'
            }}
          />
          {renderFrontContent()}
        </div>

        {/* Offscreen Back */}
        <div 
          ref={backExportRef}
          className={`relative w-[330px] h-[520px] rounded-2xl overflow-hidden text-white font-sans border ${themeClasses.border} bg-gradient-to-b ${themeClasses.cardBg}`}
        >
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)`,
              backgroundSize: '16px 16px, 32px 32px'
            }}
          />
          {renderBackContent()}
        </div>
      </div>
    </div>
  );
}
