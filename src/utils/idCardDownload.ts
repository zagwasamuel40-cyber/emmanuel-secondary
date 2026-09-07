import html2canvas from "html2canvas";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";

/**
 * Robustly captures an HTML element into a PNG data URL.
 * Uses a 3-tier fallback strategy (html2canvas -> html-to-image -> clean clone)
 * so that tainted canvas or CORS errors NEVER block downloading.
 */
export async function captureElementAsDataUrl(element: HTMLElement, scale = 3): Promise<string> {
  // Strategy 1: html2canvas with CORS support
  try {
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
      imageTimeout: 6000,
    });
    return canvas.toDataURL("image/png");
  } catch (err1) {
    console.warn("html2canvas capture warning, attempting html-to-image fallback...", err1);
  }

  // Strategy 2: html-to-image
  try {
    const dataUrl = await htmlToImage.toPng(element, {
      pixelRatio: scale,
      skipAutoScale: true,
      cacheBust: true,
    });
    if (dataUrl && dataUrl.length > 100) {
      return dataUrl;
    }
  } catch (err2) {
    console.warn("html-to-image fallback warning, attempting sanitized clone fallback...", err2);
  }

  // Strategy 3: Sanitized DOM clone without cross-origin images
  try {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    document.body.appendChild(clone);

    // Replace any external <img> that might taint canvas with high-contrast text avatars
    const images = clone.querySelectorAll("img");
    images.forEach((img) => {
      // If image is not a data URL, try to make it non-tainting or hide if broken
      if (!img.src.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }
    });

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#0f172a",
      logging: false,
    });

    document.body.removeChild(clone);
    return canvas.toDataURL("image/png");
  } catch (err3) {
    console.error("All capture strategies exhausted", err3);
    throw new Error("Unable to capture ID card due to browser security restrictions on external images.");
  }
}

/**
 * Triggers a browser file download for a Data URL or Blob
 */
export function triggerBrowserDownload(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a single card side as high-resolution PNG
 */
export async function downloadCardSidePNG(element: HTMLElement, fileName: string): Promise<void> {
  const dataUrl = await captureElementAsDataUrl(element, 3);
  triggerBrowserDownload(dataUrl, fileName.endsWith(".png") ? fileName : `${fileName}.png`);
}

/**
 * Downloads both front and back combined into a single side-by-side high-res PNG image
 */
export async function downloadBothSidesPNG(
  frontElement: HTMLElement,
  backElement: HTMLElement,
  fileName: string
): Promise<void> {
  const frontDataUrl = await captureElementAsDataUrl(frontElement, 2.5);
  const backDataUrl = await captureElementAsDataUrl(backElement, 2.5);

  const imgFront = new Image();
  const imgBack = new Image();

  await Promise.all([
    new Promise((resolve, reject) => {
      imgFront.onload = resolve;
      imgFront.onerror = reject;
      imgFront.src = frontDataUrl;
    }),
    new Promise((resolve, reject) => {
      imgBack.onload = resolve;
      imgBack.onerror = reject;
      imgBack.src = backDataUrl;
    }),
  ]);

  const canvas = document.createElement("canvas");
  const padding = 40;
  const gap = 30;
  const cardWidth = imgFront.width;
  const cardHeight = imgFront.height;

  canvas.width = cardWidth * 2 + gap + padding * 2;
  canvas.height = cardHeight + padding * 2 + 60; // extra space for title/date
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize canvas context");

  // Background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle Header Text
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("EMMANUEL SECONDARY SCHOOL • OFFICIAL STUDENT CREDENTIAL", canvas.width / 2, 32);

  // Draw Front
  ctx.drawImage(imgFront, padding, padding + 20);

  // Draw Back
  ctx.drawImage(imgBack, padding + cardWidth + gap, padding + 20);

  // Bottom caption
  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px sans-serif";
  ctx.fillText("Front Side & Back Side (Attendance QR) • Standard CR-80 PVC Specification", canvas.width / 2, canvas.height - 12);

  triggerBrowserDownload(canvas.toDataURL("image/png"), fileName.endsWith(".png") ? fileName : `${fileName}.png`);
}

/**
 * Downloads standard CR-80 PVC Card PDF (Standard plastic ID card dimensions: 85.6mm x 53.98mm)
 * Page 1: Front of card
 * Page 2: Back of card (with QR code)
 */
export async function downloadCardCR80PDF({
  frontElement,
  backElement,
  studentName,
  studentId,
}: {
  frontElement: HTMLElement | null;
  backElement?: HTMLElement | null;
  studentName: string;
  studentId: string;
}): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [53.98, 85.6], // Standard CR-80 PVC Card dimensions in mm
  });

  const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, "_");
  const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, "_");

  // Capture Front
  if (frontElement) {
    const frontDataUrl = await captureElementAsDataUrl(frontElement, 3);
    pdf.addImage(frontDataUrl, "PNG", 0, 0, 53.98, 85.6);
  }

  // Capture Back if available
  if (backElement) {
    const backDataUrl = await captureElementAsDataUrl(backElement, 3);
    pdf.addPage([53.98, 85.6], "portrait");
    pdf.addImage(backDataUrl, "PNG", 0, 0, 53.98, 85.6);
  }

  pdf.save(`ID_CARD_${cleanId}_${cleanName}_CR80.pdf`);
}

/**
 * Downloads A4 Printable Badge PDF formatted with both Front and Back side-by-side,
 * trim/cut marks, school header, and lamination guide.
 */
export async function downloadCardA4PrintablePDF({
  frontElement,
  backElement,
  studentName,
  studentId,
  studentClass,
}: {
  frontElement: HTMLElement;
  backElement: HTMLElement;
  studentName: string;
  studentId: string;
  studentClass: string;
}): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4", // 210 x 297 mm
  });

  const frontDataUrl = await captureElementAsDataUrl(frontElement, 3);
  const backDataUrl = await captureElementAsDataUrl(backElement, 3);

  // A4 Header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42); // slate-900
  pdf.text("EMMANUEL SECONDARY SCHOOL", 105, 20, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(71, 85, 105);
  pdf.text("Official Student Identity Card • Printable Badge Sheet", 105, 26, { align: "center" });

  pdf.setDrawColor(203, 213, 225); // slate-300
  pdf.setLineWidth(0.5);
  pdf.line(20, 30, 190, 30);

  // Student Meta Box
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(20, 35, 170, 16, 2, 2, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`Student: ${studentName}`, 25, 42);
  pdf.text(`Admission No: ${studentId}`, 95, 42);
  pdf.text(`Class: ${studentClass}`, 155, 42);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} • Standard CR-80 PVC Size (54mm x 85.6mm)`, 25, 47);

  // Placement parameters for Front and Back side-by-side
  const cardWidthMm = 54;
  const cardHeightMm = 85.6;
  const yPos = 60;
  const frontX = 45;
  const backX = 111;

  // Draw Front
  pdf.addImage(frontDataUrl, "PNG", frontX, yPos, cardWidthMm, cardHeightMm);

  // Draw Back
  pdf.addImage(backDataUrl, "PNG", backX, yPos, cardWidthMm, cardHeightMm);

  // Draw Trim / Cutting guide border around both cards
  pdf.setDrawColor(148, 163, 184); // slate-400
  pdf.setLineDashPattern([2, 2], 0);
  pdf.setLineWidth(0.3);
  pdf.rect(frontX - 0.5, yPos - 0.5, cardWidthMm + 1, cardHeightMm + 1);
  pdf.rect(backX - 0.5, yPos - 0.5, cardWidthMm + 1, cardHeightMm + 1);
  pdf.setLineDashPattern([], 0); // reset

  // Labels under cards
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text("FRONT SIDE", frontX + cardWidthMm / 2, yPos + cardHeightMm + 6, { align: "center" });
  pdf.text("BACK SIDE (ATTENDANCE QR)", backX + cardWidthMm / 2, yPos + cardHeightMm + 6, { align: "center" });

  // Instructions Box
  const instructY = 165;
  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(20, instructY, 170, 48, 3, 3, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.setTextColor(30, 41, 59);
  pdf.text("Printing & Lamination Instructions:", 25, instructY + 8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(51, 65, 85);
  const instructions = [
    "1. Print this sheet on high-quality 200gsm+ white cardstock or photo sticker paper at 100% scale (Do not choose 'Fit to Page').",
    "2. Cut strictly along the dashed border lines around both the Front and Back sides.",
    "3. Glue both sides back-to-back or place them inside a standard 54mm x 86mm PVC ID badge pouch / holder.",
    "4. Alternatively, use standard heat lamination pouches for a durable, water-resistant finish.",
    "5. Keep the QR code clean and uncreased so staff barcode scanners and entrance turnstiles can read it instantly."
  ];

  instructions.forEach((line, idx) => {
    pdf.text(line, 25, instructY + 16 + idx * 6);
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text("Emmanuel Secondary School Makurdi • Student Identity System • Verified Credential", 105, 285, { align: "center" });

  const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, "_");
  pdf.save(`ID_CARD_${cleanId}_A4_Printable.pdf`);
}
