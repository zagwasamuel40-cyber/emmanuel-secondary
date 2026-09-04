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
import Profile from "./pages/Profile";
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
        
        {/* Admin Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="admissions" element={<AdmissionsManagement />} />
          <Route path="students" element={<Students />} />
          <Route path="enrollment" element={<Enrollment />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="finance" element={<Finance />} />
          <Route path="academics" element={<Academics />} />
          <Route path="examinations" element={<Examinations />} />
          <Route path="portal-manager" element={<StudentPortalManager />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Student Portal */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="timetable" element={<StudentTimetable />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
