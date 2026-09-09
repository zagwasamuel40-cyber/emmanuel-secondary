import { jsPDF } from "jspdf";
import { ExamQuestion } from "../data/admissionsAndExamData";

export interface ExamExportMeta {
  schoolName?: string;
  examTitle: string;
  subject: string;
  targetClass: string;
  examDate?: string;
  durationMinutes?: number | string;
  instructions?: string;
  academicSession?: string;
}

// -----------------------------------------------------------------------------
// 1. PDF EXPORTER (Question Paper & Answer Key)
// -----------------------------------------------------------------------------
export function exportExamToPDF(
  questions: ExamQuestion[],
  meta: ExamExportMeta,
  isAnswerKey = false
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const schoolName = meta.schoolName || "EMMANUEL SECONDARY SCHOOL, MAKURDI";
  const session = meta.academicSession || "2026/2027 ACADEMIC SESSION";

  // Helper for adding headers
  const renderHeader = (isFirstPage: boolean) => {
    // School Crest Placeholder Badge
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, isFirstPage ? 32 : 12, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");

    if (isFirstPage) {
      doc.setFontSize(13);
      doc.text(schoolName, pageWidth / 2, y + 8, { align: "center" });

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("DIRECTORATE OF ADMISSIONS & ENTRANCE EXAMINATIONS", pageWidth / 2, y + 13, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const titleText = isAnswerKey
        ? `CONFIDENTIAL ANSWER KEY & MARKING SCHEME • ${meta.subject.toUpperCase()}`
        : `${meta.examTitle.toUpperCase()} • ${session}`;
      doc.text(titleText, pageWidth / 2, y + 19, { align: "center" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Class: ${meta.targetClass}   |   Subject: ${meta.subject}   |   Duration: ${meta.durationMinutes || 60} Mins   |   Date: ${meta.examDate || new Date().toISOString().split("T")[0]}`,
        pageWidth / 2,
        y + 26,
        { align: "center" }
      );
      y += 36;

      // Candidate Information Header (Only on student paper)
      if (!isAnswerKey) {
        doc.setDrawColor(203, 213, 225); // slate-300
        doc.setFillColor(248, 250, 252); // slate-50
        doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "FD");

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("CANDIDATE NAME: ________________________________________________", margin + 4, y + 6);
        doc.text("APPLICATION / REG NO: __________________________", margin + 4, y + 12);
        doc.text("EXAM DESK / HALL: ____________________", margin + contentWidth - 60, y + 6);
        doc.text("SIGNATURE: __________________________", margin + contentWidth - 60, y + 12);
        y += 22;

        // Instructions block
        doc.setFillColor(254, 243, 199); // amber-100
        doc.setDrawColor(245, 158, 11); // amber-500
        doc.roundedRect(margin, y, contentWidth, 13, 1.5, 1.5, "FD");

        doc.setTextColor(146, 64, 14); // amber-800
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text("EXAMINATION INSTRUCTIONS:", margin + 4, y + 4.5);
        doc.setFont("helvetica", "normal");
        const defaultInst =
          meta.instructions ||
          "1. Answer ALL questions. Each question carries equal marks. 2. Choose the single best option from choices provided. 3. No mobile phones, programmable calculators, or electronic cheat aids permitted.";
        const splitInst = doc.splitTextToSize(defaultInst, contentWidth - 8);
        doc.text(splitInst, margin + 4, y + 8.5);
        y += 17;
      } else {
        // Warning box for answer key
        doc.setFillColor(254, 226, 226); // rose-100
        doc.setDrawColor(239, 68, 68); // rose-500
        doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, "FD");
        doc.setTextColor(153, 27, 27);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("STRICTLY CONFIDENTIAL: FOR ADMISSION OFFICER & EXAMINERS USE ONLY.", margin + 4, y + 6.5);
        y += 14;
      }
    } else {
      doc.setFontSize(8);
      doc.text(
        `${schoolName} • ${meta.subject} • ${isAnswerKey ? "ANSWER KEY" : "QUESTION PAPER"} (Page ${doc.getNumberOfPages()})`,
        pageWidth / 2,
        y + 7.5,
        { align: "center" }
      );
      y += 16;
    }
  };

  renderHeader(true);

  if (!isAnswerKey) {
    // ----------------- QUESTION PAPER BODY -----------------
    questions.forEach((q, idx) => {
      // Estimate height needed
      const questionText = `${idx + 1}.  ${q.question}`;
      const splitQuestion = doc.splitTextToSize(questionText, contentWidth - 6);
      const questionHeight = splitQuestion.length * 4.5 + 4;
      const optionsHeight = (q.options?.length || 0) * 4.5 + 6;
      const totalBlockHeight = questionHeight + optionsHeight;

      if (y + totalBlockHeight > pageHeight - 16) {
        doc.addPage();
        y = 14;
        renderHeader(false);
      }

      // Question text box
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(splitQuestion, margin + 2, y + 4);
      y += questionHeight;

      // Marks badge
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);

      // Render options (A, B, C, D)
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);

      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          const optText = `[ ${letter} ]   ${opt}`;
          const splitOpt = doc.splitTextToSize(optText, contentWidth - 10);
          doc.text(splitOpt, margin + 8, y + 2);
          y += splitOpt.length * 4.2;
        });
      }

      y += 3; // spacing between questions
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y, margin + contentWidth, y);
      y += 3;
    });
  } else {
    // ----------------- ANSWER KEY TABLE BODY -----------------
    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 7, "S");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("Q#", margin + 3, y + 4.8);
    doc.text("CORRECT ANSWER", margin + 14, y + 4.8);
    doc.text("EXPLANATION / WORKING SOLUTION", margin + 80, y + 4.8);
    doc.text("MARKS", margin + contentWidth - 14, y + 4.8);
    y += 8;

    questions.forEach((q, idx) => {
      // Find option letter
      let letter = "A";
      const optIdx = q.options?.findIndex(
        o => o.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
      );
      if (optIdx !== undefined && optIdx >= 0) {
        letter = String.fromCharCode(65 + optIdx);
      }

      const answerFull = `${letter}. ${q.correctAnswer}`;
      const splitAnswer = doc.splitTextToSize(answerFull, 60);
      const explanationText = q.explanation || "Direct curriculum answer.";
      const splitExp = doc.splitTextToSize(explanationText, contentWidth - 102);

      const rowHeight = Math.max(splitAnswer.length, splitExp.length) * 4.2 + 5;

      if (y + rowHeight > pageHeight - 16) {
        doc.addPage();
        y = 14;
        renderHeader(false);

        // Re-render subheader
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentWidth, 7, "F");
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text("Q#", margin + 3, y + 4.8);
        doc.text("CORRECT ANSWER", margin + 14, y + 4.8);
        doc.text("EXPLANATION / WORKING SOLUTION", margin + 80, y + 4.8);
        doc.text("MARKS", margin + contentWidth - 14, y + 4.8);
        y += 8;
      }

      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, rowHeight, "S");

      // Column 1: Q#
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(String(idx + 1), margin + 3, y + 5);

      // Column 2: Correct Answer
      doc.setTextColor(16, 122, 59); // emerald-700
      doc.text(splitAnswer, margin + 14, y + 5);

      // Column 3: Explanation
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(splitExp, margin + 80, y + 5);

      // Column 4: Marks
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(`${q.marks || 2}m`, margin + contentWidth - 12, y + 5);

      y += rowHeight;
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Emmanuel Secondary School, Makurdi • Official Entrance Examination System • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  const cleanFilename = `${meta.subject}_${meta.targetClass}_${isAnswerKey ? "ANSWER_KEY" : "EXAM_PAPER"}`.replace(
    /\s+/g,
    "_"
  );
  doc.save(`${cleanFilename}.pdf`);
}

// -----------------------------------------------------------------------------
// 2. MICROSOFT WORD (.DOC / .DOCX) EXPORTER
// -----------------------------------------------------------------------------
export function exportExamToWord(
  questions: ExamQuestion[],
  meta: ExamExportMeta,
  isAnswerKey = false
): void {
  const schoolName = meta.schoolName || "Emmanuel Secondary School, Makurdi";
  const session = meta.academicSession || "2026/2027 Academic Session";

  let bodyContent = "";

  if (!isAnswerKey) {
    bodyContent = `
      <div style="border: 2px solid #334155; padding: 12px; margin-bottom: 20px; background-color: #f8fafc; font-size: 10pt;">
        <table style="width: 100%; border: none;">
          <tr>
            <td style="width: 60%; padding: 4px;"><strong>CANDIDATE NAME:</strong> ___________________________________</td>
            <td style="width: 40%; padding: 4px;"><strong>DATE:</strong> ____________________</td>
          </tr>
          <tr>
            <td style="padding: 4px;"><strong>APPLICATION / REG NO:</strong> ________________________________</td>
            <td style="padding: 4px;"><strong>DESK / SEAT NO:</strong> _______________</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 10px; margin-bottom: 24px; font-size: 9pt; color: #92400e;">
        <strong>GENERAL INSTRUCTIONS:</strong><br/>
        ${
          meta.instructions ||
          "1. Answer ALL questions. 2. Shade or select the option that best answers the question. 3. Erasures must be made clearly. 4. Strict examination silence must be observed."
        }
      </div>

      <h3 style="color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 4px; font-size: 12pt;">QUESTIONS</h3>

      ${questions
        .map((q, idx) => {
          const optsHtml = (q.options || [])
            .map(
              (opt, optIdx) => `
              <div style="margin-left: 20px; margin-top: 4px; font-size: 10.5pt;">
                <strong>[ ${String.fromCharCode(65 + optIdx)} ]</strong> &nbsp; ${opt}
              </div>`
            )
            .join("");

          return `
            <div style="margin-bottom: 20px; page-break-inside: avoid;">
              <p style="font-size: 11pt; font-weight: bold; color: #0f172a; margin-bottom: 6px;">
                ${idx + 1}. &nbsp; ${q.question} <span style="font-size: 9pt; color: #64748b; font-weight: normal;">(${q.marks || 2} Marks)</span>
              </p>
              ${optsHtml}
            </div>
          `;
        })
        .join("")}
    `;
  } else {
    bodyContent = `
      <div style="background-color: #fee2e2; border: 1px solid #ef4444; padding: 10px; margin-bottom: 20px; font-size: 10pt; color: #991b1b; font-weight: bold;">
        CONFIDENTIAL EXAMINATION MARKING GUIDE & ANSWER KEY • FOR ADMISSION OFFICERS & EXAMINERS ONLY
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 15px;">
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff; text-align: left;">
            <th style="padding: 8px; border: 1px solid #cbd5e1; width: 60px;">Q #</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; width: 200px;">Correct Answer</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1;">Working Solution / Explanation</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; width: 80px;">Marks</th>
          </tr>
        </thead>
        <tbody>
          ${questions
            .map((q, idx) => {
              const optIdx = q.options?.findIndex(
                o => o.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
              );
              const letter = optIdx !== undefined && optIdx >= 0 ? String.fromCharCode(65 + optIdx) : "•";

              return `
                <tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${idx + 1}</td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; color: #047857; font-weight: bold;">
                    [ ${letter} ] ${q.correctAnswer}
                  </td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; color: #334155;">
                    ${q.explanation || "Standard curriculum solution."}
                  </td>
                  <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${q.marks || 2}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    `;
  }

  const htmlDocument = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${meta.examTitle}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 40px; color: #1e293b; }
        h1 { font-size: 18pt; margin: 0; text-align: center; color: #0f172a; text-transform: uppercase; }
        h2 { font-size: 12pt; margin: 5px 0 15px 0; text-align: center; color: #475569; }
        .meta-bar { text-align: center; font-size: 10pt; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
      </style>
    </head>
    <body>
      <h1>${schoolName}</h1>
      <h2>OFFICE OF THE ADMISSION DIRECTORATE • ENTRANCE EXAMINATION</h2>
      <div class="meta-bar">
        SUBJECT: ${meta.subject.toUpperCase()} &nbsp;&nbsp;|&nbsp;&nbsp;
        CLASS: ${meta.targetClass} &nbsp;&nbsp;|&nbsp;&nbsp;
        DURATION: ${meta.durationMinutes || 60} MINUTES &nbsp;&nbsp;|&nbsp;&nbsp;
        DATE: ${meta.examDate || new Date().toISOString().split("T")[0]}
      </div>
      ${bodyContent}
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", htmlDocument], {
    type: "application/msword"
  });

  const cleanFilename = `${meta.subject}_${meta.targetClass}_${isAnswerKey ? "ANSWER_KEY" : "EXAM_PAPER"}`.replace(
    /\s+/g,
    "_"
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${cleanFilename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// -----------------------------------------------------------------------------
// 3. CSV / EXCEL EXPORTER
// -----------------------------------------------------------------------------
export function exportExamToCSV(
  questions: ExamQuestion[],
  meta: ExamExportMeta,
  isAnswerKey = false
): void {
  let rows: string[][] = [];

  if (!isAnswerKey) {
    rows.push([
      "Question Number",
      "Subject",
      "Target Class",
      "Question Text",
      "Option A",
      "Option B",
      "Option C",
      "Option D",
      "Marks"
    ]);

    questions.forEach((q, idx) => {
      const opts = q.options || [];
      rows.push([
        String(idx + 1),
        q.subject || meta.subject,
        meta.targetClass,
        `"${(q.question || "").replace(/"/g, '""')}"`,
        `"${(opts[0] || "").replace(/"/g, '""')}"`,
        `"${(opts[1] || "").replace(/"/g, '""')}"`,
        `"${(opts[2] || "").replace(/"/g, '""')}"`,
        `"${(opts[3] || "").replace(/"/g, '""')}"`,
        String(q.marks || 2)
      ]);
    });
  } else {
    rows.push([
      "Question Number",
      "Subject",
      "Target Class",
      "Question Text",
      "Correct Answer Letter",
      "Correct Answer Text",
      "Option A",
      "Option B",
      "Option C",
      "Option D",
      "Solution / Explanation",
      "Marks"
    ]);

    questions.forEach((q, idx) => {
      const opts = q.options || [];
      const optIdx = opts.findIndex(
        o => o.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
      );
      const letter = optIdx >= 0 ? String.fromCharCode(65 + optIdx) : "N/A";

      rows.push([
        String(idx + 1),
        q.subject || meta.subject,
        meta.targetClass,
        `"${(q.question || "").replace(/"/g, '""')}"`,
        letter,
        `"${(q.correctAnswer || "").replace(/"/g, '""')}"`,
        `"${(opts[0] || "").replace(/"/g, '""')}"`,
        `"${(opts[1] || "").replace(/"/g, '""')}"`,
        `"${(opts[2] || "").replace(/"/g, '""')}"`,
        `"${(opts[3] || "").replace(/"/g, '""')}"`,
        `"${(q.explanation || "").replace(/"/g, '""')}"`,
        String(q.marks || 2)
      ]);
    });
  }

  const csvString = rows.map(r => r.join(",")).join("\r\n");
  const blob = new Blob(["\ufeff", csvString], { type: "text/csv;charset=utf-8;" });

  const cleanFilename = `${meta.subject}_${meta.targetClass}_${isAnswerKey ? "ANSWER_KEY" : "EXAM_PAPER"}`.replace(
    /\s+/g,
    "_"
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${cleanFilename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportExamToExcel(
  questions: ExamQuestion[],
  meta: ExamExportMeta,
  isAnswerKey = false
): void {
  // Generates spreadsheet format
  exportExamToCSV(questions, meta, isAnswerKey);
}
