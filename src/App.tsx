import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import StudentLayout from "./layouts/StudentLayout";
import Home from "./pages/Home";
import { ScrollToHash } from "./components/ScrollToHash";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Enrollment from "./pages/Enrollment";
import Teachers from "./pages/Teachers";
import Finance from "./pages/Finance";
import Academics from "./pages/Academics";
import Examinations from "./pages/Examinations";
import Settings from "./pages/Settings";
import StudentPortalManager from "./pages/StudentPortalManager";
import AdmissionsManagement from "./pages/AdmissionsManagement";
import AdmissionOfficerDashboard from "./pages/admin/AdmissionOfficerDashboard";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import About from "./pages/public/About";
import AcademicsInfo from "./pages/public/AcademicsInfo";
import Admissions from "./pages/public/Admissions";
import EntranceExam from "./pages/public/EntranceExam";
import News from "./pages/public/News";
import ResultChecker from "./pages/public/ResultChecker";
import AdmissionStatus from "./pages/public/AdmissionStatus";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentSubjects from "./pages/student/StudentSubjects";
import StudentTimetable from "./pages/student/StudentTimetable";
import StudentFees from "./pages/student/StudentFees";
import StudentProfile from "./pages/student/StudentProfile";
import StudentDigitalIDCard from "./pages/student/StudentDigitalIDCard";
import QRScannerPage from "./pages/staff/QRScannerPage";
import AttendanceDashboard from "./pages/staff/AttendanceDashboard";
import StudentIDCardCenter from "./pages/admin/StudentIDCardCenter";
import StaffQRScannerPage from "./pages/admin/StaffQRScannerPage";
import StaffAttendanceReports from "./pages/admin/StaffAttendanceReports";
import AttendanceOfficerDashboard from "./pages/staff/AttendanceOfficerDashboard";
import { AttendanceOfficerManagement } from "./pages/admin/AttendanceOfficerManagement";
import ScanAttendancePage from "./pages/staff/ScanAttendancePage";
import PermissionGuard from "./components/auth/PermissionGuard";
import AuditLogsPage from "./pages/admin/AuditLogsPage";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/academics" element={<AcademicsInfo />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/entrance-exam" element={<EntranceExam />} />
          <Route path="/news" element={<News />} />
          <Route path="/result-checker" element={<ResultChecker />} />
          <Route path="/admission-status" element={<AdmissionStatus />} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        
        {/* Admin & Staff Dashboard with Departmental RBAC Permission Guards */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />

          {/* Attendance Department */}
          <Route path="attendance-officer" element={
            <PermissionGuard requiredPermission="attendance.view" moduleName="Attendance & Gate Controller Hub">
              <AttendanceOfficerDashboard />
            </PermissionGuard>
          } />
          <Route path="attendance-officers" element={
            <PermissionGuard requiredPermission="attendance.view" moduleName="Attendance Operations">
              <AttendanceOfficerManagement />
            </PermissionGuard>
          } />
          <Route path="scan-attendance" element={
            <PermissionGuard requiredPermission="attendance.scan" moduleName="Gate Attendance Scanner">
              <ScanAttendancePage />
            </PermissionGuard>
          } />
          <Route path="qr-scanner" element={<QRScannerPage />} />
          <Route path="staff-qr-scanner" element={
            <PermissionGuard requiredPermission="attendance.scan" moduleName="Staff Gate QR Scanner">
              <StaffQRScannerPage />
            </PermissionGuard>
          } />
          <Route path="attendance" element={<AttendanceDashboard />} />
          <Route path="staff-attendance" element={
            <PermissionGuard requiredPermission="attendance.reports" moduleName="Staff Attendance Reports">
              <StaffAttendanceReports />
            </PermissionGuard>
          } />

          {/* Admissions Department */}
          <Route path="id-cards" element={
            <PermissionGuard requiredPermission="admission.view" moduleName="Student ID Card Center">
              <StudentIDCardCenter />
            </PermissionGuard>
          } />
          <Route path="admission-officer" element={
            <PermissionGuard requiredPermission="admission.view" moduleName="Admissions Directorate">
              <AdmissionOfficerDashboard />
            </PermissionGuard>
          } />
          <Route path="admissions" element={
            <PermissionGuard requiredPermission="admission.view" moduleName="Admissions Directorate">
              <AdmissionOfficerDashboard />
            </PermissionGuard>
          } />
          <Route path="admissions-legacy" element={
            <PermissionGuard requiredPermission="admission.view" moduleName="Admissions Management">
              <AdmissionsManagement />
            </PermissionGuard>
          } />

          {/* Core Staff & Academics */}
          <Route path="students" element={<Students />} />
          <Route path="enrollment" element={
            <PermissionGuard requiredPermission="staff.manage" moduleName="Enrollment Directorate">
              <Enrollment />
            </PermissionGuard>
          } />
          <Route path="teachers" element={
            <PermissionGuard requiredPermission="staff.manage" moduleName="Staff & Roles Administration">
              <Teachers />
            </PermissionGuard>
          } />

          {/* Finance & Bursary Department */}
          <Route path="finance" element={
            <PermissionGuard requiredPermission="finance.view" moduleName="Finance & Bursary Directorate">
              <Finance />
            </PermissionGuard>
          } />

          {/* Academic Affairs Department */}
          <Route path="academics" element={
            <PermissionGuard requiredPermission="academic.view" moduleName="Academic Affairs Directorate">
              <Academics />
            </PermissionGuard>
          } />

          {/* Examinations & CBT Center */}
          <Route path="examinations" element={
            <PermissionGuard requiredPermission="examination.view" moduleName="Examinations & CBT Center">
              <Examinations />
            </PermissionGuard>
          } />

          {/* Portal & Website CMS */}
          <Route path="portal-manager" element={
            <PermissionGuard requiredPermission="portal.view" moduleName="Portal & Website CMS">
              <StudentPortalManager />
            </PermissionGuard>
          } />

          {/* Compliance & Security Audit Logs */}
          <Route path="audit-logs" element={
            <PermissionGuard requiredPermission="audit.view" moduleName="System Security & Audit Trail">
              <AuditLogsPage />
            </PermissionGuard>
          } />

          {/* System Settings & User Profile */}
          <Route path="settings" element={
            <PermissionGuard requiredPermission="settings.manage" moduleName="System & School Settings">
              <Settings />
            </PermissionGuard>
          } />
          <Route path="profile" element={<Profile />} />
          <Route path="reports" element={
            <PermissionGuard requiredPermission="reports.view" moduleName="Executive Report Center">
              <Reports />
            </PermissionGuard>
          } />
        </Route>

        {/* Student Portal */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="id-card" element={<StudentDigitalIDCard />} />
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="timetable" element={<StudentTimetable />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
