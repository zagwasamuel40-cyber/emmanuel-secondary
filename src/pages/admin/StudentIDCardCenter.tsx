import React, { useState, useMemo } from "react";
import { 
  CreditCard, 
  QrCode, 
  Printer, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Layers, 
  Palette, 
  ShieldAlert, 
  Eye, 
  X,
  FileSpreadsheet,
  Settings,
  Sparkles,
  Loader2,
  Users,
  GraduationCap
} from "lucide-react";
import { useStudents, CLASSES } from "../../data/studentsData";
import { useTeachers } from "../../data/teachersData";
import { 
  useIdCards, 
  useQRScanLogs,
  useIDCardDesignSettings,
  ensureStudentHasIdCard,
  ensureStaffHasIdCard,
  reissueStudentQRToken,
  setStudentCardStatus
} from "../../data/idCardAndAttendanceData";
import { 
  IDCard, 
  IDCardCustomization,
  CardTemplateTheme,
  CardOrientation 
} from "../../types/idCardAndAttendance";
import StudentIDCard from "../../components/idcard/StudentIDCard";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Label } from "@/src/components/ui";
import { jsPDF } from "jspdf";
import { captureElementAsDataUrl } from "../../utils/idCardDownload";

export default function StudentIDCardCenter() {
  const [students, setStudents] = useStudents();
  const [teachers, setTeachers] = useTeachers();
  const [idCards, setIdCards] = useIdCards();
  const [scanLogs] = useQRScanLogs();
  const [designSettings, setDesignSettings] = useIDCardDesignSettings();

  const [activeTab, setActiveTab] = useState<"directory" | "bulk" | "design" | "audit">("directory");
  const [userTypeFilter, setUserTypeFilter] = useState<"student" | "staff">("student");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  
  // Modals & previews
  const [previewStudent, setPreviewStudent] = useState<any | null>(null);
  const [reissueModalStudent, setReissueModalStudent] = useState<any | null>(null);
  const [reissueReason, setReissueReason] = useState("Lost card reported by parent/student");
  const [statusChangeStudent, setStatusChangeStudent] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Bulk generation state
  const [bulkClass, setBulkClass] = useState(CLASSES[0]);
  const [bulkSide, setBulkSide] = useState<"front" | "back">("front");
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [bulkDownloadProgress, setBulkDownloadProgress] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Ensure every active user (student/staff) has a card record
  const userCardsList = useMemo(() => {
    if (userTypeFilter === "student") {
      return students.map(student => {
        const card = idCards.find(c => c.studentId === student.id && c.userType !== 'staff') || ensureStudentHasIdCard(student);
        return {
          user: student,
          card
        };
      });
    } else {
      return teachers.map(staff => {
        const card = idCards.find(c => c.studentId === staff.id && c.userType === 'staff') || ensureStaffHasIdCard(staff);
        return {
          user: staff,
          card
        };
      });
    }
  }, [students, teachers, idCards, userTypeFilter]);

  const filteredUserCards = useMemo(() => {
    return userCardsList.filter(({ user, card }) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = filterClass === "All" || userTypeFilter === "staff" || ('class' in user && user.class === filterClass);
      const matchesStatus = filterStatus === "All" || card.cardStatus === filterStatus;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [userCardsList, searchTerm, filterClass, filterStatus, userTypeFilter]);

  // Bulk cards for selected class/group
  const bulkUsers = useMemo(() => {
    if (userTypeFilter === "staff") {
      return userCardsList;
    }
    return userCardsList.filter(({ user }) => 'class' in user && user.class === bulkClass);
  }, [userCardsList, bulkClass, userTypeFilter]);

  const handleReissueConfirm = () => {
    if (!reissueModalStudent) return;
    const isStaff = 'systemRoles' in reissueModalStudent;
    const updated = reissueStudentQRToken(reissueModalStudent.id, reissueReason, isStaff);
    if (updated) {
      showToast(`New unique QR code successfully generated & reissued for ${reissueModalStudent.name}. Old QR code has been permanently invalidated.`);
    }
    setReissueModalStudent(null);
  };

  const handleStatusChange = (status: IDCard["cardStatus"]) => {
    if (!statusChangeStudent) return;
    setStudentCardStatus(statusChangeStudent.user.id, status, `Manual update by Administrator`);
    showToast(`Card for ${statusChangeStudent.user.name} marked as ${status.toUpperCase()}.`);
    setStatusChangeStudent(null);
  };

  const handleBulkDownloadPDF = async () => {
    if (bulkUsers.length === 0) return;
    setIsBulkDownloading(true);
    setBulkDownloadProgress(`Preparing ${bulkUsers.length} cards...`);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4" // 210 x 297 mm
      });

      const cardElements = document.querySelectorAll(".bulk-card-item-card");
      if (cardElements.length === 0) {
        showToast("No cards rendered to export. Please ensure cards are loaded.");
        setIsBulkDownloading(false);
        return;
      }

      // Positions on A4 for 4 cards per page (2 columns x 2 rows, each 54mm x 85.6mm)
      const col1X = 35;
      const col2X = 120;
      const row1Y = 32;
      const row2Y = 150;
      const cardWMm = 54;
      const cardHMm = 85.6;

      const positions = [
        { x: col1X, y: row1Y },
        { x: col2X, y: row1Y },
        { x: col1X, y: row2Y },
        { x: col2X, y: row2Y },
      ];

      let currentPage = 1;

      for (let i = 0; i < cardElements.length; i++) {
        setBulkDownloadProgress(`Rendering card ${i + 1} of ${cardElements.length}...`);
        const el = cardElements[i] as HTMLElement;
        const dataUrl = await captureElementAsDataUrl(el, 2);

        if (i > 0 && i % 4 === 0) {
          pdf.addPage("a4", "portrait");
          currentPage++;
        }

        const slot = i % 4;
        const pos = positions[slot];

        // Draw header on new page
        if (slot === 0) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(13);
          pdf.setTextColor(15, 23, 42);
          pdf.text(`EMMANUEL SECONDARY SCHOOL • ${userTypeFilter === 'staff' ? 'STAFF' : bulkClass.toUpperCase()} CARDS`, 105, 15, { align: "center" });
          pdf.setFontSize(8.5);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(100, 116, 139);
          pdf.text(`Side: ${bulkSide.toUpperCase()} • Batch Printable Roster • Page ${currentPage}`, 105, 21, { align: "center" });
        }

        // Draw the card
        pdf.addImage(dataUrl, "PNG", pos.x, pos.y, cardWMm, cardHMm);

        // Draw trim cutting guide
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineDashPattern([2, 2], 0);
        pdf.setLineWidth(0.2);
        pdf.rect(pos.x - 0.5, pos.y - 0.5, cardWMm + 1, cardHMm + 1);
        pdf.setLineDashPattern([], 0);
      }

      const fileName = `ESS_${userTypeFilter === 'staff' ? 'Staff' : bulkClass.replace(/[^a-zA-Z0-9]/g, '_')}_Cards_${bulkSide.toUpperCase()}.pdf`;
      pdf.save(fileName);
      showToast(`Successfully downloaded all ${bulkUsers.length} cards for ${userTypeFilter === 'staff' ? 'Staff' : bulkClass}!`);
    } catch (err) {
      console.error("Bulk export failed", err);
      showToast("Could not complete bulk PDF export. Please try printing to PDF instead.");
    } finally {
      setIsBulkDownloading(false);
      setBulkDownloadProgress("");
    }
  };

  const handleExportScanLogsCSV = () => {
    const headers = ["Log ID", "Date", "Time", "Student Name", "Admission No", "Class", "Scanned By", "Purpose", "Status", "Device"];
    const rows = scanLogs.map(l => [
      `"${l.id}"`,
      `"${l.date}"`,
      `"${l.time}"`,
      `"${l.studentName}"`,
      `"${l.admissionNo}"`,
      `"${l.studentClass}"`,
      `"${l.scannedByStaffName}"`,
      `"${l.purpose}"`,
      `"${l.status}"`,
      `"${l.deviceInfo}"`
    ]);

    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `ESS_QR_Scan_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-xl shadow-2xl flex items-center gap-3 border border-amber-400 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="text-amber-400" size={20} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
              Administrative Control Center
            </span>
            <span className="text-xs text-slate-500 font-medium">PVC CR-80 Standard ID System</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 mt-1">
            School Digital ID Card & QR Code Center
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Issue, design, print, bulk-generate, and audit secure identity cards and encrypted QR codes for students and staff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setActiveTab("bulk")}
            variant="brand"
            className="text-xs gap-1.5 shadow-sm"
          >
            <Layers size={15} />
            Bulk Print Class Cards
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Button
          variant={activeTab === "directory" ? "brand" : "outline"}
          onClick={() => setActiveTab("directory")}
          className="text-xs font-bold gap-2"
        >
          <CreditCard size={15} />
          ID Cards Directory
        </Button>
        <Button
          variant={activeTab === "bulk" ? "brand" : "outline"}
          onClick={() => setActiveTab("bulk")}
          className="text-xs font-bold gap-2"
        >
          <Layers size={15} />
          Bulk Generate & Print
        </Button>
        <Button
          variant={activeTab === "design" ? "brand" : "outline"}
          onClick={() => setActiveTab("design")}
          className="text-xs font-bold gap-2"
        >
          <Palette size={15} />
          ID Card Design Studio
        </Button>
        <Button
          variant={activeTab === "audit" ? "brand" : "outline"}
          onClick={() => setActiveTab("audit")}
          className="text-xs font-bold gap-2"
        >
          <ShieldAlert size={15} />
          QR Scan Audit Logs ({scanLogs.length})
        </Button>
      </div>

      {/* TAB 1: ID CARDS DIRECTORY */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-1 gap-3 flex-col sm:flex-row">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Search by name or ID number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                <select
                  value={userTypeFilter}
                  onChange={(e) => {
                    setUserTypeFilter(e.target.value as "student" | "staff");
                    setFilterClass("All");
                  }}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
                >
                  <option value="student">Students</option>
                  <option value="staff">Staff Members</option>
                </select>

                {userTypeFilter === "student" && (
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
                  >
                    <option value="All">All Classes</option>
                    {CLASSES.filter(c => !c.includes("Graduated")).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
                >
                  <option value="All">All Card Statuses</option>
                  <option value="active">Active Cards</option>
                  <option value="lost">Reported Lost</option>
                  <option value="stolen">Reported Stolen</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">{userTypeFilter === 'student' ? 'Student Details' : 'Staff Details'}</th>
                    <th className="px-4 py-3.5">ID No.</th>
                    <th className="px-4 py-3.5">{userTypeFilter === 'student' ? 'Class' : 'Role'}</th>
                    <th className="px-4 py-3.5">Card Status</th>
                    <th className="px-4 py-3.5">QR Token Preview</th>
                    <th className="px-4 py-3.5">Issued / Reissued</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUserCards.map(({ user, card }) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 overflow-hidden shrink-0 border border-slate-200">
                            {user.passportUrl ? (
                              <img src={user.passportUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{user.name}</div>
                            <div className="text-[10px] text-slate-400">{user.email || `${userTypeFilter}@ess.edu.ng`}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-700">{user.id}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {userTypeFilter === 'student' ? (user as any).class : ((user as any).systemRoles?.[0] || 'Staff')}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          card.cardStatus === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          card.cardStatus === 'lost' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          card.cardStatus === 'stolen' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {card.cardStatus === 'active' && <CheckCircle2 size={11} />}
                          {card.cardStatus !== 'active' && <AlertTriangle size={11} />}
                          {card.cardStatus.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[10px] text-slate-500 max-w-[140px] truncate" title={card.qrToken}>
                        {card.qrToken}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                        <div>{card.issueDate}</div>
                        {card.reissueCount > 0 && (
                          <div className="text-[10px] text-amber-600 font-semibold">
                            Reissued {card.reissueCount}x
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewStudent({ user, card })}
                            className="h-7 text-[11px] gap-1 px-2.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold"
                            title="Download Official ID Card (PDF / PNG)"
                          >
                            <Download size={13} />
                            Download ID
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewStudent({ user, card })}
                            className="h-7 text-[11px] gap-1 px-2"
                            title="Preview ID Card"
                          >
                            <Eye size={13} />
                            View
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReissueModalStudent(user)}
                            className="h-7 text-[11px] gap-1 px-2 text-brand-600 border-brand-200 hover:bg-brand-50"
                            title="Generate/Reissue new QR code"
                          >
                            <RefreshCw size={13} />
                            Reissue QR
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setStatusChangeStudent({ user, card })}
                            className="h-7 text-[11px] gap-1 px-2 text-rose-600 border-rose-200 hover:bg-rose-50"
                            title="Manage Card Security Status"
                          >
                            <ShieldAlert size={13} />
                            Security
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: BULK GENERATE & PRINT */}
      {activeTab === "bulk" && (
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
              <div>
                <CardTitle className="text-base">Batch ID Card Generation & Print Roster</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate official identity cards for an entire classroom or staff group, ready for standard A4 or PVC card printers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-600">Select Group:</span>
                  <select
                    value={userTypeFilter}
                    onChange={(e) => {
                      setUserTypeFilter(e.target.value as "student" | "staff");
                      setBulkClass(CLASSES[0]);
                    }}
                    className="h-8 px-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-800"
                  >
                    <option value="student">Students</option>
                    <option value="staff">Staff Members</option>
                  </select>

                  {userTypeFilter === "student" && (
                    <select
                      value={bulkClass}
                      onChange={(e) => setBulkClass(e.target.value)}
                      className="h-8 px-3 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 ml-1"
                    >
                      {CLASSES.filter(c => !c.includes("Graduated")).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setBulkSide("front")}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                      bulkSide === "front" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Front Sides
                  </button>
                  <button
                    onClick={() => setBulkSide("back")}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                      bulkSide === "back" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Back Sides (QR)
                  </button>
                </div>

                <Button 
                  onClick={handleBulkDownloadPDF}
                  disabled={isBulkDownloading || bulkUsers.length === 0}
                  variant="outline" 
                  className="gap-1.5 shadow-sm text-xs border-brand-300 text-brand-700 hover:bg-brand-50 font-bold"
                >
                  {isBulkDownloading ? <Loader2 size={14} className="animate-spin text-brand-600" /> : <Download size={14} />}
                  <span>{isBulkDownloading ? (bulkDownloadProgress || "Generating...") : `Download All ${bulkUsers.length} Cards (PDF)`}</span>
                </Button>

                <Button 
                  onClick={() => window.print()}
                  variant="brand" 
                  className="gap-2 shadow-sm text-xs"
                  disabled={bulkUsers.length === 0}
                >
                  <Printer size={15} />
                  Print All {bulkUsers.length} Cards
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {bulkUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center print:grid-cols-2 print:gap-4">
                  {bulkUsers.map(({ user, card }) => (
                    <div key={user.id} className="flex flex-col items-center">
                      <div className="bulk-card-item-card">
                        <StudentIDCard
                          student={user}
                          cardInfo={card}
                          customization={designSettings}
                          defaultSide={bulkSide}
                          showActions={false}
                        />
                      </div>
                      <div className="text-center mt-2 text-xs font-semibold text-slate-600 print:hidden">
                        {user.name} ({user.id})
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  {userTypeFilter === 'student' ? `No students found in class ${bulkClass}. Select another class above.` : 'No staff members found.'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: DESIGN STUDIO */}
      {activeTab === "design" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls on Left (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette size={18} className="text-brand-600" />
                  ID Card Branding & Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">School Name on ID Card</Label>
                    <Input 
                      value={designSettings.schoolName}
                      onChange={(e) => setDesignSettings({ ...designSettings, schoolName: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">School Motto</Label>
                    <Input 
                      value={designSettings.schoolMotto}
                      onChange={(e) => setDesignSettings({ ...designSettings, schoolMotto: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">School Logo URL</Label>
                  <Input 
                    value={designSettings.logoUrl}
                    onChange={(e) => setDesignSettings({ ...designSettings, logoUrl: e.target.value })}
                    className="text-xs"
                  />
                </div>

                {/* Template Themes */}
                <div className="space-y-2">
                  <Label className="text-xs">Color Scheme Theme</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'classic_navy', label: 'Classic Navy & Gold', bg: 'bg-slate-900 border-amber-400' },
                      { id: 'modern_emerald', label: 'Modern Emerald', bg: 'bg-emerald-950 border-emerald-400' },
                      { id: 'executive_gold', label: 'Executive Gold', bg: 'bg-stone-900 border-yellow-400' },
                      { id: 'tech_slate', label: 'Tech Slate & Cyan', bg: 'bg-slate-950 border-cyan-400' },
                    ].map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setDesignSettings({ ...designSettings, templateStyle: theme.id as CardTemplateTheme })}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          designSettings.templateStyle === theme.id 
                            ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-md' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-full h-6 rounded-lg ${theme.bg} border mb-2`} />
                        <span className="text-xs font-bold text-slate-800">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Feature Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Label className="text-xs font-bold text-slate-700">Security & Information Modules</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <input 
                        type="checkbox"
                        checked={designSettings.showChipGraphic}
                        onChange={(e) => setDesignSettings({ ...designSettings, showChipGraphic: e.target.checked })}
                        className="rounded text-brand-600"
                      />
                      <span className="font-semibold text-slate-800">Gold Smart Chip Simulation</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <input 
                        type="checkbox"
                        checked={designSettings.showWatermark}
                        onChange={(e) => setDesignSettings({ ...designSettings, showWatermark: e.target.checked })}
                        className="rounded text-brand-600"
                      />
                      <span className="font-semibold text-slate-800">Guilloche Security Watermark</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <input 
                        type="checkbox"
                        checked={designSettings.showEmergencyContact}
                        onChange={(e) => setDesignSettings({ ...designSettings, showEmergencyContact: e.target.checked })}
                        className="rounded text-brand-600"
                      />
                      <span className="font-semibold text-slate-800">Emergency Parent Phone</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <input 
                        type="checkbox"
                        checked={designSettings.showBloodGroup}
                        onChange={(e) => setDesignSettings({ ...designSettings, showBloodGroup: e.target.checked })}
                        className="rounded text-brand-600"
                      />
                      <span className="font-semibold text-slate-800">Blood Group Identifier</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs">Card Back Terms & Disclaimer</Label>
                  <textarea
                    rows={2}
                    value={designSettings.customFooterNote}
                    onChange={(e) => setDesignSettings({ ...designSettings, customFooterNote: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <Button 
                  onClick={() => showToast("ID Card Design settings saved successfully!")}
                  variant="brand"
                  className="w-full"
                >
                  Save ID Card Design Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview on Right (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-6 w-full flex flex-col items-center space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Sparkles size={14} className="text-amber-500" />
                Live Card Mockup Preview
              </div>
              <StudentIDCard
                student={students[0]}
                cardInfo={idCards[0]}
                customization={designSettings}
                showActions={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCAN AUDIT LOGS */}
      {activeTab === "audit" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert size={18} className="text-brand-600" />
                QR Code Scanning Audit Trail & NDPR Security Logs
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Full chronological log of every student QR code scanned by staff members, timestamps, and outcomes.
              </p>
            </div>
            <Button 
              onClick={handleExportScanLogsCSV}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
            >
              <Download size={14} />
              Export Audit Trail (CSV)
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Admission No.</th>
                  <th className="px-4 py-3.5">Scanned By Staff</th>
                  <th className="px-4 py-3.5">Scan Purpose</th>
                  <th className="px-4 py-3.5">Security Result</th>
                  <th className="px-4 py-3.5">Terminal / Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scanLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-mono text-slate-600">{log.timestamp}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{log.studentName}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{log.admissionNo}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{log.scannedByStaffName}</td>
                    <td className="px-4 py-3.5 text-slate-600">{log.purpose}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                        log.status === 'Card Deactivated' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[10px] font-mono">{log.deviceInfo}</td>
                  </tr>
                ))}
                {scanLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No scan events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* SINGLE ID CARD PREVIEW MODAL */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 max-w-md w-full relative">
            <button 
              onClick={() => setPreviewStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              ID Card Preview • {previewStudent.user.name}
            </h3>
            <StudentIDCard
              student={previewStudent.user}
              cardInfo={previewStudent.card}
              customization={designSettings}
              showActions={true}
            />
          </div>
        </div>
      )}

      {/* REISSUE QR CODE CONFIRMATION MODAL */}
      {reissueModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 max-w-md w-full">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <RefreshCw size={24} />
              <h3 className="text-base font-bold text-slate-900">Reissue QR Code</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Generating a new QR code for <strong>{reissueModalStudent.name} ({reissueModalStudent.id})</strong> will immediately and permanently invalidate the previous QR code. Any old physical cards or copies will fail scan verification.
            </p>

            <div className="space-y-2 mb-4">
              <Label className="text-xs">Reason for Reissuance:</Label>
              <select
                value={reissueReason}
                onChange={(e) => setReissueReason(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium"
              >
                <option value="Lost card reported by parent/student">Lost card reported by holder/parent</option>
                <option value="Stolen card reported">Stolen card reported</option>
                <option value="Damaged physical card replacement">Damaged physical card replacement</option>
                <option value="Annual session renewal">Annual session renewal</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button 
                onClick={() => setReissueModalStudent(null)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReissueConfirm}
                variant="brand"
                size="sm"
              >
                Confirm & Reissue QR
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY STATUS MODAL (Lost / Stolen / Reactivate) */}
      {statusChangeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 max-w-md w-full">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <ShieldAlert size={24} />
              <h3 className="text-base font-bold text-slate-900">Card Security Status</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Update the security status of the ID card for <strong>{statusChangeStudent.user.name}</strong>. If flagged as Lost or Stolen, all gate and portal scans will alert security immediately.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant="outline"
                onClick={() => handleStatusChange("active")}
                className="text-emerald-700 hover:bg-emerald-50 border-emerald-200 text-xs"
              >
                Mark as Active
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange("lost")}
                className="text-amber-700 hover:bg-amber-50 border-amber-200 text-xs"
              >
                Report Lost
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange("stolen")}
                className="text-rose-700 hover:bg-rose-50 border-rose-200 text-xs"
              >
                Report Stolen
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange("deactivated")}
                className="text-slate-700 hover:bg-slate-100 border-slate-200 text-xs"
              >
                Deactivate Card
              </Button>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStatusChangeStudent(null)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
