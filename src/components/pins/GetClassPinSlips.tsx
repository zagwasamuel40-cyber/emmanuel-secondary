import React, { useState, useMemo, useEffect } from "react";
import { 
  Printer, 
  Download, 
  Scissors, 
  Key, 
  ShieldCheck, 
  Search, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  FileText, 
  QrCode, 
  Layers, 
  SlidersHorizontal, 
  CheckSquare, 
  Square,
  Sparkles,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { jsPDF } from "jspdf";
import { PinRecord } from "../../data/pinsData";
import { generateQRCodeDataUrl } from "../../utils/qrCodeGenerator";
import { captureElementAsDataUrl, triggerBrowserDownload } from "../../utils/idCardDownload";

interface GetClassPinSlipsProps {
  pins: PinRecord[];
  classes: string[];
  sessions: string[];
}

export const GetClassPinSlips: React.FC<GetClassPinSlipsProps> = ({
  pins,
  classes,
  sessions
}) => {
  const [selectedClass, setSelectedClass] = useState(classes[0] || "SSS 3A");
  const [selectedSession, setSelectedSession] = useState("2025/2026");
  const [showMasked, setShowMasked] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Layout & Styling Options
  const [slipsPerPage, setSlipsPerPage] = useState<4 | 6>(4);
  const [printTheme, setPrintTheme] = useState<"color" | "mono">("color");
  const [showQRCode, setShowQRCode] = useState(true);
  const [includeSignatureLine, setIncludeSignatureLine] = useState(true);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Async QR codes cache: pinId -> dataUrl
  const [qrCodeUrls, setQrCodeUrls] = useState<Record<string, string>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filtered class pins
  const classPins = useMemo(() => {
    return pins.filter((p) => {
      if (p.class !== selectedClass) return false;
      if (p.session !== selectedSession) return false;
      if (activeOnly && p.status !== "Active") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.studentName.toLowerCase().includes(q);
        const matchesId = p.studentId.toLowerCase().includes(q);
        const matchesSerial = p.serialNumber.toLowerCase().includes(q);
        const matchesPin = p.pinCode.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesSerial && !matchesPin) return false;
      }
      return true;
    });
  }, [pins, selectedClass, selectedSession, activeOnly, searchQuery]);

  // Keep selected IDs in sync by default when class changes
  useEffect(() => {
    setSelectedIds(new Set(classPins.map((p) => p.id)));
  }, [classPins]);

  // Generate QR codes for visible pins
  useEffect(() => {
    if (!showQRCode) return;
    let isMounted = true;

    const generateQrs = async () => {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://ess.edu.ng";
      const newUrls: Record<string, string> = { ...qrCodeUrls };

      for (const pin of classPins) {
        if (!newUrls[pin.id]) {
          const payload = `${origin}/result-checker?studentId=${encodeURIComponent(pin.studentId)}&pin=${encodeURIComponent(pin.pinCode)}`;
          try {
            const url = await generateQRCodeDataUrl(payload, 200);
            if (url) {
              newUrls[pin.id] = url;
            }
          } catch {
            // ignore
          }
        }
      }

      if (isMounted) {
        setQrCodeUrls(newUrls);
      }
    };

    generateQrs();
    return () => {
      isMounted = false;
    };
  }, [classPins, showQRCode]);

  const targetPins = useMemo(() => {
    if (selectedIds.size === 0) return classPins;
    return classPins.filter((p) => selectedIds.has(p.id));
  }, [classPins, selectedIds]);

  const allSelected = classPins.length > 0 && targetPins.length === classPins.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(classPins.map((p) => p.id)));
    }
  };

  const togglePinSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleCopyPin = (id: string, code: string, serial: string) => {
    navigator.clipboard.writeText(`PIN: ${code} | Serial: ${serial}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
    showNotification(`Copied PIN and Serial to clipboard!`);
  };

  // --- PRINT ENGINE (ISOLATED IFRAME FOR 100% PERFECT A4 OUTPUT) ---
  const printSlipsIsolated = (slipsToPrint: PinRecord[]) => {
    if (slipsToPrint.length === 0) {
      alert("No slips selected for printing.");
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const cardsPerPage = slipsPerPage;
    const isMono = printTheme === "mono";

    // Split slips into chunks of cardsPerPage
    const pages: PinRecord[][] = [];
    for (let i = 0; i < slipsToPrint.length; i += cardsPerPage) {
      pages.push(slipsToPrint.slice(i, i + cardsPerPage));
    }

    const pagesHtml = pages.map((pageSlips, pageIdx) => `
      <div class="print-page ${pageIdx < pages.length - 1 ? 'page-break' : ''}">
        <div class="page-meta">
          <span>EMMANUEL SECONDARY SCHOOL, MAKURDI &bull; ${selectedClass} RESULT PIN SLIPS</span>
          <span>SESSION: ${selectedSession} &bull; Page ${pageIdx + 1} of ${pages.length}</span>
        </div>
        <div class="slips-grid ${cardsPerPage === 6 ? 'grid-6' : 'grid-4'}">
          ${pageSlips.map((pin) => {
            const qrData = qrCodeUrls[pin.id] || "";
            return `
              <div class="slip-card">
                <!-- Top Header -->
                <div class="slip-header">
                  <div class="school-brand">
                    <div class="logo-box">ESS</div>
                    <div>
                      <div class="school-name">EMMANUEL SECONDARY SCHOOL</div>
                      <div class="school-sub">OFFICIAL RESULT ACCESS VOUCHER</div>
                    </div>
                  </div>
                  <div class="session-badge">
                    <div class="session-title">${pin.session}</div>
                    <div class="term-title">${pin.term}</div>
                  </div>
                </div>

                <!-- Candidate Info -->
                <div class="candidate-info">
                  <div class="info-row">
                    <span class="info-label">Candidate:</span>
                    <span class="info-val candidate-name">${pin.studentName}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Admission No:</span>
                    <span class="info-val font-mono">${pin.studentId}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Class:</span>
                    <span class="info-val">${pin.class}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Serial Number:</span>
                    <span class="info-val font-mono">${pin.serialNumber}</span>
                  </div>
                </div>

                <!-- Scratch PIN Box -->
                <div class="scratch-box">
                  <div class="scratch-title">&#9733; SCRATCH HERE FOR RESULT PIN &#9733;</div>
                  <div class="pin-digits ${showMasked ? 'masked' : ''}">
                    ${showMasked ? '&#9618;&#9618;&#9618;&#9618; - &#9618;&#9618;&#9618;&#9618; - &#9618;&#9618;&#9618;&#9618;' : pin.pinCode}
                  </div>
                  <div class="pin-validity">
                    Valid for ${pin.maxUses} Result Checks &bull; Authorized Candidate Only
                  </div>
                </div>

                <!-- Footer & QR Code & Cut Line -->
                <div class="slip-footer">
                  <div class="portal-link">
                    <strong>Portal:</strong> ess.edu.ng/result-checker<br/>
                    Enter Admission No. &amp; PIN to view result
                  </div>
                  ${showQRCode && qrData ? `
                    <div class="qr-container">
                      <img src="${qrData}" alt="QR" class="qr-img" />
                    </div>
                  ` : ''}
                </div>

                ${includeSignatureLine ? `
                  <div class="signature-row">
                    <span>Authorized Signature &amp; Stamp: ___________________</span>
                    <span>Status: ${pin.status.toUpperCase()}</span>
                  </div>
                ` : ''}

                <div class="cut-indicator">&#9986; Cut along dotted border</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ESS Result PIN Slips - ${selectedClass}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            body {
              background: #fff;
              color: #0f172a;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-page {
              width: 100%;
              min-height: 275mm;
              display: flex;
              flex-direction: column;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
            }
            .page-meta {
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              color: #64748b;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding-bottom: 4px;
              margin-bottom: 6px;
              border-bottom: 1px dashed #cbd5e1;
            }
            .slips-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8mm;
              flex: 1;
            }
            .grid-4 {
              grid-template-rows: 1fr 1fr;
            }
            .grid-6 {
              grid-template-rows: 1fr 1fr 1fr;
              gap: 5mm;
            }
            .slip-card {
              border: 2px dashed ${isMono ? '#000' : '#d97706'};
              border-radius: 10px;
              padding: ${cardsPerPage === 6 ? '10px 12px' : '14px 16px'};
              background: ${isMono ? '#ffffff' : '#fffbeb'};
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .slip-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid ${isMono ? '#000' : '#0f172a'};
              padding-bottom: 6px;
            }
            .school-brand {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .logo-box {
              width: 28px;
              height: 28px;
              background: ${isMono ? '#000' : '#f59e0b'};
              color: ${isMono ? '#fff' : '#000'};
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 900;
              font-size: 11px;
            }
            .school-name {
              font-weight: 900;
              font-size: ${cardsPerPage === 6 ? '10px' : '12px'};
              color: #0f172a;
              line-height: 1.1;
              letter-spacing: -0.2px;
            }
            .school-sub {
              font-size: 8px;
              font-weight: 800;
              color: ${isMono ? '#555' : '#b45309'};
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-top: 1px;
            }
            .session-badge {
              text-align: right;
            }
            .session-title {
              font-size: 9px;
              font-weight: 800;
              font-family: monospace;
              color: #334155;
            }
            .term-title {
              font-size: 8px;
              font-weight: 800;
              color: ${isMono ? '#000' : '#047857'};
              text-transform: uppercase;
            }
            .candidate-info {
              margin: ${cardsPerPage === 6 ? '6px 0' : '10px 0'};
              font-size: ${cardsPerPage === 6 ? '10px' : '11px'};
              display: flex;
              flex-direction: column;
              gap: ${cardsPerPage === 6 ? '2px' : '4px'};
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .info-label {
              color: #64748b;
              font-size: 9px;
              font-weight: 600;
            }
            .info-val {
              font-weight: 700;
              color: #0f172a;
            }
            .candidate-name {
              font-weight: 900;
              color: #000;
              font-size: ${cardsPerPage === 6 ? '11px' : '12px'};
            }
            .font-mono {
              font-family: "Courier New", Courier, monospace;
            }
            .scratch-box {
              background: ${isMono ? '#f1f5f9' : '#fef3c7'};
              border: 1.5px solid ${isMono ? '#000' : '#f59e0b'};
              border-radius: 8px;
              padding: ${cardsPerPage === 6 ? '6px' : '8px'};
              text-align: center;
              margin: ${cardsPerPage === 6 ? '4px 0' : '8px 0'};
            }
            .scratch-title {
              font-size: 8px;
              font-weight: 900;
              color: ${isMono ? '#000' : '#92400e'};
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .pin-digits {
              font-family: "Courier New", Courier, monospace;
              font-size: ${cardsPerPage === 6 ? '14px' : '16px'};
              font-weight: 900;
              letter-spacing: 2px;
              color: #000;
              margin: 2px 0;
            }
            .pin-digits.masked {
              color: #64748b;
            }
            .pin-validity {
              font-size: 8px;
              font-weight: 600;
              color: #475569;
            }
            .slip-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #cbd5e1;
              padding-top: 4px;
              font-size: 8px;
            }
            .portal-link {
              color: #475569;
              line-height: 1.3;
            }
            .qr-container {
              width: 32px;
              height: 32px;
              flex-shrink: 0;
            }
            .qr-img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .signature-row {
              display: flex;
              justify-content: space-between;
              font-size: 7.5px;
              color: #64748b;
              font-weight: 600;
              margin-top: 4px;
              border-top: 1px dotted #cbd5e1;
              padding-top: 3px;
            }
            .cut-indicator {
              font-size: 7px;
              color: #94a3b8;
              text-align: right;
              font-weight: 600;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          ${pagesHtml}
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1500);
    }, 400);

    showNotification(`Sent ${slipsToPrint.length} PIN slips to printer!`);
  };

  // --- DOWNLOAD PDF SLIPS (VECTOR MULTI-PAGE GENERATOR) ---
  const handleDownloadPdf = async () => {
    if (targetPins.length === 0) {
      alert("No PIN slips selected to download.");
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = 210;
      const marginX = 10;
      const marginTop = 12;
      const cols = 2;
      const rows = slipsPerPage === 4 ? 2 : 3;
      const cardsPerPage = cols * rows;

      const gapX = 8;
      const gapY = slipsPerPage === 4 ? 12 : 8;
      const slipWidth = (pageWidth - (marginX * 2) - gapX) / cols; // ~91mm
      const slipHeight = slipsPerPage === 4 ? 124 : 80;

      for (let i = 0; i < targetPins.length; i++) {
        const pin = targetPins[i];
        const indexOnPage = i % cardsPerPage;
        if (i > 0 && indexOnPage === 0) {
          doc.addPage();
        }

        const colIndex = indexOnPage % cols;
        const rowIndex = Math.floor(indexOnPage / cols);

        const x = marginX + colIndex * (slipWidth + gapX);
        const y = marginTop + rowIndex * (slipHeight + gapY);

        // --- DRAW SINGLE SLIP ---
        // Outer Card Box
        if (printTheme === "mono") {
          doc.setDrawColor(0, 0, 0);
          doc.setFillColor(255, 255, 255);
        } else {
          doc.setDrawColor(245, 158, 11); // amber-500
          doc.setFillColor(255, 251, 235); // amber-50
        }
        doc.roundedRect(x, y, slipWidth, slipHeight, 2, 2, "FD");

        // Header bar
        const headerH = slipsPerPage === 4 ? 14 : 11;
        if (printTheme === "mono") {
          doc.setFillColor(241, 245, 249);
        } else {
          doc.setFillColor(15, 23, 42); // slate-900
        }
        doc.rect(x, y, slipWidth, headerH, "F");

        // School Name & Sub
        doc.setFont("helvetica", "bold");
        doc.setFontSize(slipsPerPage === 4 ? 8.5 : 7.5);
        if (printTheme === "mono") {
          doc.setTextColor(0, 0, 0);
        } else {
          doc.setTextColor(255, 255, 255);
        }
        doc.text("EMMANUEL SECONDARY SCHOOL", x + 4, y + (slipsPerPage === 4 ? 5.5 : 4.5));

        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.5);
        if (printTheme === "mono") {
          doc.setTextColor(80, 80, 80);
        } else {
          doc.setTextColor(245, 158, 11);
        }
        doc.text("OFFICIAL RESULT ACCESS VOUCHER", x + 4, y + (slipsPerPage === 4 ? 10 : 8));

        // Session & Term badge
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        if (printTheme === "mono") {
          doc.setTextColor(0, 0, 0);
        } else {
          doc.setTextColor(255, 255, 255);
        }
        doc.text(pin.session, x + slipWidth - 4, y + (slipsPerPage === 4 ? 5.5 : 4.5), { align: "right" });
        doc.setFontSize(5.5);
        if (printTheme === "mono") {
          doc.setTextColor(60, 60, 60);
        } else {
          doc.setTextColor(52, 211, 153);
        }
        doc.text(pin.term, x + slipWidth - 4, y + (slipsPerPage === 4 ? 10 : 8), { align: "right" });

        // Candidate Details
        let currY = y + headerH + (slipsPerPage === 4 ? 7 : 5);
        const lineSpacing = slipsPerPage === 4 ? 6.5 : 4.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(slipsPerPage === 4 ? 7.5 : 6.5);
        doc.setTextColor(100, 116, 139);
        doc.text("Candidate:", x + 4, currY);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(pin.studentName, x + slipWidth - 4, currY, { align: "right" });

        currY += lineSpacing;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text("Admission No:", x + 4, currY);
        doc.setFont("courier", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(pin.studentId, x + slipWidth - 4, currY, { align: "right" });

        currY += lineSpacing;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text("Class:", x + 4, currY);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(pin.class, x + slipWidth - 4, currY, { align: "right" });

        currY += lineSpacing;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text("Serial Number:", x + 4, currY);
        doc.setFont("courier", "bold");
        doc.setTextColor(51, 65, 85);
        doc.text(pin.serialNumber, x + slipWidth - 4, currY, { align: "right" });

        // Scratch PIN Box
        currY += (slipsPerPage === 4 ? 6 : 4);
        const scratchH = slipsPerPage === 4 ? 22 : 17;
        if (printTheme === "mono") {
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(0, 0, 0);
        } else {
          doc.setFillColor(254, 243, 199); // amber-100
          doc.setDrawColor(217, 119, 6); // amber-600
        }
        doc.roundedRect(x + 4, currY, slipWidth - 8, scratchH, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        if (printTheme === "mono") {
          doc.setTextColor(0, 0, 0);
        } else {
          doc.setTextColor(146, 64, 14);
        }
        doc.text("★ SCRATCH HERE FOR RESULT PIN ★", x + (slipWidth / 2), currY + 4, { align: "center" });

        doc.setFont("courier", "bold");
        doc.setFontSize(slipsPerPage === 4 ? 12 : 10);
        doc.setTextColor(15, 23, 42);
        if (showMasked) {
          doc.text("▓▓▓▓ - ▓▓▓▓ - ▓▓▓▓", x + (slipWidth / 2), currY + (slipsPerPage === 4 ? 11 : 9.5), { align: "center" });
        } else {
          doc.text(pin.pinCode, x + (slipWidth / 2), currY + (slipsPerPage === 4 ? 11 : 9.5), { align: "center" });
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Valid for ${pin.maxUses} Result Checks • Non-Transferable`, x + (slipWidth / 2), currY + (slipsPerPage === 4 ? 17 : 14.5), { align: "center" });

        // Footer / QR Code
        currY += scratchH + (slipsPerPage === 4 ? 6 : 3);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.5);
        doc.setTextColor(71, 85, 105);
        doc.text("Portal: ess.edu.ng/result-checker", x + 4, currY);
        doc.text("Enter Admission No. & PIN to view result", x + 4, currY + 3.5);

        // QR Code embedding
        if (showQRCode && qrCodeUrls[pin.id]) {
          try {
            const qrSize = slipsPerPage === 4 ? 14 : 11;
            doc.addImage(qrCodeUrls[pin.id], "PNG", x + slipWidth - 4 - qrSize, currY - 2, qrSize, qrSize);
          } catch {
            // Ignore if image fails
          }
        }

        // Cut indicator
        doc.setFont("helvetica", "normal");
        doc.setFontSize(5);
        doc.setTextColor(148, 163, 184);
        doc.text("✂ Cut Slip along guide", x + 4, y + slipHeight - 3);

        if (includeSignatureLine) {
          doc.text("Auth. Stamp: ___________________", x + slipWidth - 4, y + slipHeight - 3, { align: "right" });
        }
      }

      const fileName = `ESS_${selectedClass.replace(/\s+/g, "_")}_PIN_Slips_${selectedSession.replace("/", "-")}.pdf`;
      doc.save(fileName);
      showNotification(`Downloaded ${fileName} successfully!`);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF. Please try printing or using the offline HTML export.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // --- DOWNLOAD CSV REGISTER ---
  const handleDownloadCsv = () => {
    if (targetPins.length === 0) {
      alert("No PIN records selected to export.");
      return;
    }

    const headers = [
      "Serial Number",
      "Result PIN",
      "Admission ID",
      "Candidate Name",
      "Class",
      "Academic Session",
      "Term Validity",
      "Max Uses",
      "Uses Remaining",
      "Status",
      "Portal URL"
    ];

    const rows = targetPins.map((p) => [
      `"${p.serialNumber}"`,
      `"${p.pinCode}"`,
      `"${p.studentId || ""}"`,
      `"${p.studentName || ""}"`,
      `"${p.class || ""}"`,
      `"${p.session}"`,
      `"${p.term}"`,
      p.maxUses,
      p.usesRemaining,
      `"${p.status}"`,
      `"https://ess.edu.ng/result-checker"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ESS_${selectedClass.replace(/\s+/g, "_")}_PIN_Slips_${selectedSession.replace("/", "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification(`Exported CSV register with ${targetPins.length} student vouchers!`);
  };

  // --- DOWNLOAD STANDALONE HTML VOUCHER PACKAGE ---
  const handleDownloadStandaloneHtml = () => {
    if (targetPins.length === 0) {
      alert("No PIN records selected.");
      return;
    }

    const cardsPerPage = slipsPerPage;
    const isMono = printTheme === "mono";

    const slipsHtml = targetPins.map((pin) => {
      const qrData = qrCodeUrls[pin.id] || "";
      return `
        <div class="slip-card">
          <div class="slip-header">
            <div class="school-brand">
              <div class="logo-box">ESS</div>
              <div>
                <div class="school-name">EMMANUEL SECONDARY SCHOOL</div>
                <div class="school-sub">OFFICIAL RESULT ACCESS VOUCHER</div>
              </div>
            </div>
            <div class="session-badge">
              <div class="session-title">${pin.session}</div>
              <div class="term-title">${pin.term}</div>
            </div>
          </div>

          <div class="candidate-info">
            <div class="info-row"><span class="info-label">Candidate:</span><span class="info-val candidate-name">${pin.studentName}</span></div>
            <div class="info-row"><span class="info-label">Admission No:</span><span class="info-val font-mono">${pin.studentId}</span></div>
            <div class="info-row"><span class="info-label">Class:</span><span class="info-val">${pin.class}</span></div>
            <div class="info-row"><span class="info-label">Serial Number:</span><span class="info-val font-mono">${pin.serialNumber}</span></div>
          </div>

          <div class="scratch-box">
            <div class="scratch-title">&#9733; SCRATCH HERE FOR RESULT PIN &#9733;</div>
            <div class="pin-digits ${showMasked ? 'masked' : ''}">
              ${showMasked ? '&#9618;&#9618;&#9618;&#9618; - &#9618;&#9618;&#9618;&#9618; - &#9618;&#9618;&#9618;&#9618;' : pin.pinCode}
            </div>
            <div class="pin-validity">Valid for ${pin.maxUses} Result Checks &bull; Authorized Candidate Only</div>
          </div>

          <div class="slip-footer">
            <div class="portal-link"><strong>Portal:</strong> ess.edu.ng/result-checker<br/>Enter Admission No. &amp; PIN to view result</div>
            ${qrData ? `<div class="qr-container"><img src="${qrData}" alt="QR" class="qr-img" /></div>` : ''}
          </div>

          ${includeSignatureLine ? `
            <div class="signature-row">
              <span>Authorized Signature &amp; Stamp: ___________________</span>
              <span>Status: ${pin.status.toUpperCase()}</span>
            </div>
          ` : ''}

          <div class="cut-indicator">&#9986; Cut along dotted border</div>
        </div>
      `;
    }).join("");

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>ESS Result PIN Slips - ${selectedClass} (${selectedSession})</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
            body { background: #f8fafc; padding: 20px; color: #0f172a; }
            .print-btn-bar { max-width: 900px; margin: 0 auto 20px auto; background: #0f172a; color: white; padding: 12px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
            .print-btn { background: #f59e0b; color: #000; border: none; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; }
            .slips-container { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .slip-card { border: 2px dashed ${isMono ? '#000' : '#d97706'}; border-radius: 12px; padding: 16px; background: ${isMono ? '#fff' : '#fffbeb'}; page-break-inside: avoid; }
            .slip-header { display: flex; justify-content: space-between; border-bottom: 2px solid ${isMono ? '#000' : '#0f172a'}; padding-bottom: 6px; }
            .school-brand { display: flex; align-items: center; gap: 8px; }
            .logo-box { width: 28px; height: 28px; background: ${isMono ? '#000' : '#f59e0b'}; color: ${isMono ? '#fff' : '#000'}; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; }
            .school-name { font-weight: 900; font-size: 11px; color: #0f172a; }
            .school-sub { font-size: 8px; font-weight: 800; color: #b45309; text-transform: uppercase; }
            .session-badge { text-align: right; }
            .session-title { font-size: 9px; font-weight: 800; font-family: monospace; color: #334155; }
            .term-title { font-size: 8px; font-weight: 800; color: #047857; text-transform: uppercase; }
            .candidate-info { margin: 10px 0; font-size: 11px; display: flex; flex-direction: column; gap: 3px; }
            .info-row { display: flex; justify-content: space-between; }
            .info-label { color: #64748b; font-size: 9px; font-weight: 600; }
            .info-val { font-weight: 700; color: #0f172a; }
            .candidate-name { font-weight: 900; }
            .font-mono { font-family: monospace; }
            .scratch-box { background: ${isMono ? '#f1f5f9' : '#fef3c7'}; border: 1.5px solid ${isMono ? '#000' : '#f59e0b'}; border-radius: 8px; padding: 8px; text-align: center; margin: 8px 0; }
            .scratch-title { font-size: 8px; font-weight: 900; color: ${isMono ? '#000' : '#92400e'}; letter-spacing: 1px; }
            .pin-digits { font-family: monospace; font-size: 16px; font-weight: 900; letter-spacing: 2px; color: #000; margin: 2px 0; }
            .pin-validity { font-size: 8px; font-weight: 600; color: #475569; }
            .slip-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #cbd5e1; padding-top: 6px; font-size: 8px; }
            .portal-link { color: #475569; line-height: 1.3; }
            .qr-container { width: 34px; height: 34px; }
            .qr-img { width: 100%; height: 100%; object-fit: contain; }
            .signature-row { display: flex; justify-content: space-between; font-size: 7.5px; color: #64748b; margin-top: 6px; border-top: 1px dotted #cbd5e1; padding-top: 4px; }
            .cut-indicator { font-size: 7px; color: #94a3b8; text-align: right; margin-top: 4px; }
            @media print {
              body { background: white; padding: 0; }
              .print-btn-bar { display: none; }
              .slips-container { max-width: 100%; gap: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="print-btn-bar">
            <span>Emmanuel Secondary School &bull; ${selectedClass} PIN Slips (${targetPins.length} students)</span>
            <button class="print-btn" onclick="window.print()">Print Slips</button>
          </div>
          <div class="slips-container">
            ${slipsHtml}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ESS_${selectedClass.replace(/\s+/g, "_")}_PIN_Slips_Offline.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification(`Saved offline HTML vouchers!`);
  };

  // --- SINGLE SLIP ACTIONS ---
  const handlePrintSingleSlip = (pin: PinRecord) => {
    printSlipsIsolated([pin]);
  };

  const handleDownloadSingleSlipPdf = (pin: PinRecord) => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [148, 105] // A6 Landscape Voucher Size
      });

      const slipWidth = 138;
      const slipHeight = 95;
      const x = 5;
      const y = 5;

      // Outer Card Box
      if (printTheme === "mono") {
        doc.setDrawColor(0, 0, 0);
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setDrawColor(245, 158, 11);
        doc.setFillColor(255, 251, 235);
      }
      doc.roundedRect(x, y, slipWidth, slipHeight, 3, 3, "FD");

      // Header
      if (printTheme === "mono") {
        doc.setFillColor(241, 245, 249);
      } else {
        doc.setFillColor(15, 23, 42);
      }
      doc.rect(x, y, slipWidth, 14, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(printTheme === "mono" ? 0 : 255, printTheme === "mono" ? 0 : 255, printTheme === "mono" ? 0 : 255);
      doc.text("EMMANUEL SECONDARY SCHOOL", x + 5, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(printTheme === "mono" ? 80 : 245, printTheme === "mono" ? 80 : 158, printTheme === "mono" ? 80 : 11);
      doc.text("OFFICIAL RESULT ACCESS VOUCHER", x + 5, y + 10.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(printTheme === "mono" ? 0 : 255, printTheme === "mono" ? 0 : 255, printTheme === "mono" ? 0 : 255);
      doc.text(`${pin.session} • ${pin.term}`, x + slipWidth - 5, y + 6, { align: "right" });

      // Student info
      let currY = y + 21;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Candidate:", x + 6, currY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(pin.studentName, x + slipWidth - 6, currY, { align: "right" });

      currY += 6;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Admission No:", x + 6, currY);
      doc.setFont("courier", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(pin.studentId, x + slipWidth - 6, currY, { align: "right" });

      currY += 6;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Class:", x + 6, currY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(pin.class, x + slipWidth - 6, currY, { align: "right" });

      currY += 6;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Serial Number:", x + 6, currY);
      doc.setFont("courier", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text(pin.serialNumber, x + slipWidth - 6, currY, { align: "right" });

      // Scratch Box
      currY += 6;
      doc.setFillColor(printTheme === "mono" ? 248 : 254, printTheme === "mono" ? 250 : 243, printTheme === "mono" ? 252 : 199);
      doc.setDrawColor(printTheme === "mono" ? 0 : 217, printTheme === "mono" ? 0 : 119, printTheme === "mono" ? 0 : 6);
      doc.roundedRect(x + 6, currY, slipWidth - 12, 18, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(printTheme === "mono" ? 0 : 146, printTheme === "mono" ? 0 : 64, printTheme === "mono" ? 0 : 14);
      doc.text("★ SCRATCH HERE FOR RESULT PIN ★", x + (slipWidth / 2), currY + 4.5, { align: "center" });

      doc.setFont("courier", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      if (showMasked) {
        doc.text("▓▓▓▓ - ▓▓▓▓ - ▓▓▓▓", x + (slipWidth / 2), currY + 11, { align: "center" });
      } else {
        doc.text(pin.pinCode, x + (slipWidth / 2), currY + 11, { align: "center" });
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(`Valid for ${pin.maxUses} Result Checks • Non-Transferable`, x + (slipWidth / 2), currY + 15.5, { align: "center" });

      // Footer
      currY += 24;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(71, 85, 105);
      doc.text("Portal: ess.edu.ng/result-checker", x + 6, currY);
      doc.text("Enter Admission No. & PIN to view result", x + 6, currY + 3.5);

      if (showQRCode && qrCodeUrls[pin.id]) {
        try {
          doc.addImage(qrCodeUrls[pin.id], "PNG", x + slipWidth - 20, currY - 2, 14, 14);
        } catch {
          // ignore
        }
      }

      const fileName = `ESS_Slip_${pin.studentName.replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName);
      showNotification(`Downloaded ${fileName}!`);
    } catch (err) {
      console.error("Failed to generate single PDF", err);
    }
  };

  const handleDownloadSingleSlipPng = async (pinId: string, studentName: string) => {
    const el = document.getElementById(`slip-card-${pinId}`);
    if (!el) return;
    try {
      showNotification(`Capturing slip image for ${studentName}...`);
      const dataUrl = await captureElementAsDataUrl(el, 3);
      triggerBrowserDownload(dataUrl, `ESS_Slip_${studentName.replace(/\s+/g, "_")}.png`);
      showNotification(`Downloaded slip image for ${studentName}!`);
    } catch (err) {
      console.error("Failed to export slip image", err);
      alert("Unable to capture image. Please try downloading as PDF.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Screen-Only Header & Controls */}
      <div className="print:hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h3 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <Printer className="w-6 h-6 text-amber-500" />
            GetClass PIN Slips
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Generate, customize, print, and download official physical scratch-card result vouchers for student distribution.
          </p>
        </div>

        {/* Primary Download & Print Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print Slips Button */}
          <button
            onClick={() => printSlipsIsolated(targetPins)}
            disabled={targetPins.length === 0}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            title="Send formatted slips to printer"
          >
            <Printer size={15} className="text-amber-400" />
            <span>Print Slips ({targetPins.length})</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={targetPins.length === 0 || isGeneratingPdf}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            title="Download multi-page PDF vouchers for printing"
          >
            <Download size={15} />
            <span>{isGeneratingPdf ? "Generating PDF..." : `Download PDF (${targetPins.length})`}</span>
          </button>

          {/* Download CSV Register */}
          <button
            onClick={handleDownloadCsv}
            disabled={targetPins.length === 0}
            className="px-3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="Download spreadsheet register of PINs"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>CSV</span>
          </button>

          {/* Standalone HTML Package */}
          <button
            onClick={handleDownloadStandaloneHtml}
            disabled={targetPins.length === 0}
            className="px-3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="Download standalone offline HTML package"
          >
            <FileText size={14} className="text-indigo-600" />
            <span>Offline HTML</span>
          </button>
        </div>
      </div>

      {/* Screen-Only Filter & Customization Toolbar */}
      <div className="print:hidden space-y-4">
        {/* Row 1: Selection Filters */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Academic Session
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              {sessions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Search Student
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Name, ID, Serial, or PIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
              />
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer py-2">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
              />
              <span>Include Only Active PINs</span>
            </label>
          </div>
        </div>

        {/* Row 2: Print & Layout Studio Options */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
              <SlidersHorizontal size={14} className="text-slate-500" />
              Print Layout:
            </span>

            {/* Slips per page */}
            <div className="flex items-center rounded-xl bg-white border border-slate-200 p-0.5">
              <button
                onClick={() => setSlipsPerPage(4)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  slipsPerPage === 4 ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                4 Per Sheet (Voucher)
              </button>
              <button
                onClick={() => setSlipsPerPage(6)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  slipsPerPage === 6 ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                6 Per Sheet (Eco)
              </button>
            </div>

            {/* Color Mode */}
            <div className="flex items-center rounded-xl bg-white border border-slate-200 p-0.5">
              <button
                onClick={() => setPrintTheme("color")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  printTheme === "color" ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                School Gold
              </button>
              <button
                onClick={() => setPrintTheme("mono")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  printTheme === "mono" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Laser B&W
              </button>
            </div>

            {/* Scratch Overlay Toggle */}
            <button
              onClick={() => setShowMasked(!showMasked)}
              className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              {showMasked ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>{showMasked ? "Show Plain PINs" : "Scratch Mask Mode"}</span>
            </button>

            {/* QR Code Toggle */}
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className={`px-3 py-1 rounded-xl border font-bold flex items-center gap-1.5 transition-colors ${
                showQRCode ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              <QrCode size={13} />
              <span>QR Verification</span>
            </button>

            {/* Signature Line */}
            <button
              onClick={() => setIncludeSignatureLine(!includeSignatureLine)}
              className={`px-3 py-1 rounded-xl border font-bold flex items-center gap-1.5 transition-colors ${
                includeSignatureLine ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Signature Line</span>
            </button>
          </div>

          {/* Selection Counter & Batch Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold flex items-center gap-1.5 transition-colors"
            >
              {allSelected ? <CheckSquare size={14} className="text-amber-600" /> : <Square size={14} />}
              <span>{allSelected ? "Deselect All" : "Select All"}</span>
            </button>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Selected: <strong className="text-slate-900">{targetPins.length}</strong> of {classPins.length}
            </span>
          </div>
        </div>
      </div>

      {/* Slips Grid (Screen & Print Preview) */}
      {classPins.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 space-y-2">
          <Printer className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-sm font-medium">
            No PIN slips found for {selectedClass} in session {selectedSession}.
          </p>
          <p className="text-xs">
            Generate PINs for this class under the "Generate Class PINs" tab first, or adjust filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="print:hidden text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              Previewing <strong>{targetPins.length}</strong> printable scratch slips for <strong>{selectedClass}</strong>. Formatted with cut-guides for standard cardstock.
            </span>
            <span className="text-[11px] text-slate-400">
              Tip: Click any slip's "Print Slip" or "Download PDF" to generate an individual student slip.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2 print:gap-4">
            {classPins.map((pin) => {
              const isSelected = selectedIds.has(pin.id);
              const qrData = qrCodeUrls[pin.id];

              return (
                <div
                  key={pin.id}
                  id={`slip-card-${pin.id}`}
                  className={`border-2 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between transition-all print:border-black print:shadow-none print:break-inside-avoid ${
                    isSelected ? "ring-2 ring-amber-400/40" : "opacity-60"
                  } ${
                    printTheme === "mono" 
                      ? "bg-white border-slate-900" 
                      : "bg-amber-50/20 border-amber-300"
                  }`}
                >
                  {/* Select Checkbox & Quick Actions (Screen only) */}
                  <div className="print:hidden absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => handlePrintSingleSlip(pin)}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 shadow-xs border border-slate-200 transition-colors"
                      title="Print this single slip"
                    >
                      <Printer size={13} />
                    </button>

                    <button
                      onClick={() => handleDownloadSingleSlipPdf(pin)}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 shadow-xs border border-slate-200 transition-colors"
                      title="Download this single slip as PDF"
                    >
                      <Download size={13} />
                    </button>

                    <button
                      onClick={() => handleDownloadSingleSlipPng(pin.id, pin.studentName)}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 shadow-xs border border-slate-200 transition-colors"
                      title="Download as PNG image"
                    >
                      <ImageIcon size={13} />
                    </button>

                    <button
                      onClick={() => togglePinSelect(pin.id)}
                      className={`p-1.5 rounded-lg border shadow-xs transition-colors ${
                        isSelected 
                          ? "bg-amber-400 border-amber-500 text-slate-950 font-bold" 
                          : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"
                      }`}
                      title={isSelected ? "Unselect slip" : "Select slip"}
                    >
                      {isSelected ? <Check size={13} /> : <Square size={13} />}
                    </button>
                  </div>

                  {/* School Header */}
                  <div className={`border-b-2 pb-2.5 flex items-start justify-between ${
                    printTheme === "mono" ? "border-slate-900" : "border-slate-900"
                  }`}>
                    <div className="flex items-center gap-2 pr-24">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        printTheme === "mono" ? "bg-slate-900 text-white" : "bg-amber-400 text-slate-950 shadow-xs"
                      }`}>
                        ESS
                      </div>
                      <div>
                        <h4 className="font-black text-xs tracking-tight text-slate-900 uppercase leading-none">
                          Emmanuel Secondary School
                        </h4>
                        <p className="text-[9px] text-amber-700 font-bold uppercase tracking-widest mt-0.5">
                          Academic Result Access Voucher
                        </p>
                      </div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] font-mono font-bold text-slate-600 block">
                        {pin.session}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 uppercase block">
                        {pin.term}
                      </span>
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="py-3 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px] font-medium">Candidate:</span>
                      <span className="font-black text-slate-900 text-xs">{pin.studentName}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px] font-medium">Admission Number:</span>
                      <span className="font-mono font-bold text-slate-900">{pin.studentId}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px] font-medium">Class:</span>
                      <span className="font-bold text-slate-800">{pin.class}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px] font-medium">Serial Number:</span>
                      <span className="font-mono text-slate-600 text-[11px]">{pin.serialNumber}</span>
                    </div>
                  </div>

                  {/* Scratch PIN Box */}
                  <div className={`my-1 p-3 border-2 border-dashed rounded-xl text-center relative ${
                    printTheme === "mono"
                      ? "bg-slate-100 border-slate-900"
                      : "bg-amber-100/60 border-amber-400"
                  }`}>
                    <span className="text-[9px] font-black uppercase tracking-widest block text-amber-900">
                      ★ SCRATCH HERE FOR RESULT PIN ★
                    </span>

                    <div className="my-1 py-1 flex items-center justify-center gap-2">
                      {showMasked ? (
                        <span className="font-mono text-sm tracking-widest text-slate-500 select-none block bg-slate-200/80 px-3 py-1 rounded">
                          ▓▓▓▓ - ▓▓▓▓ - ▓▓▓▓
                        </span>
                      ) : (
                        <span className="font-mono text-base font-black tracking-widest text-slate-950 block select-all">
                          {pin.pinCode}
                        </span>
                      )}

                      <button
                        onClick={() => handleCopyPin(pin.id, pin.pinCode, pin.serialNumber)}
                        className="print:hidden p-1 hover:bg-amber-200 rounded text-amber-900 transition-colors"
                        title="Copy PIN Code"
                      >
                        {copiedId === pin.id ? <Check size={13} className="text-emerald-700" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <span className="text-[9px] text-slate-600 font-semibold block">
                      Valid for {pin.maxUses} Result Checks &bull; Non-Transferable
                    </span>
                  </div>

                  {/* Portal Instructions & Optional QR Code */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-600">
                    <div className="leading-tight">
                      <span className="font-bold text-slate-800">Portal: ess.edu.ng/result-checker</span>
                      <span className="block text-[8px] text-slate-500">Enter Admission No. &amp; PIN to view result</span>
                    </div>

                    {showQRCode && qrData && (
                      <div className="w-8 h-8 shrink-0 ml-2" title="Scan to open Result Checker">
                        <img src={qrData} alt="Verification QR" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Signature line & Cut Marks */}
                  {includeSignatureLine && (
                    <div className="pt-1.5 text-[8px] text-slate-400 flex items-center justify-between border-t border-dashed border-slate-200 mt-1.5">
                      <span>Auth. Signature &amp; Stamp: _________________</span>
                      <span className="flex items-center gap-1 font-mono text-slate-400">
                        <Scissors size={10} /> Cut Slip
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
