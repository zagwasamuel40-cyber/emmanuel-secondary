const fs = require('fs');

// Fix Teachers.tsx
let teachersFile = fs.readFileSync('src/pages/Teachers.tsx', 'utf8');
teachersFile = teachersFile.replace(
  'import { LogOut, LayoutDashboard, Users, BookOpen, UserCheck, ShieldCheck, Mail, Phone, Calendar, Download, RefreshCw, Eye, Edit, Trash2, X, Plus, AlertCircle, FileSpreadsheet } from "lucide-react";',
  'import { LogOut, LayoutDashboard, Users, BookOpen, UserCheck, ShieldCheck, Mail, Phone, Calendar, Download, RefreshCw, Eye, Edit, Trash2, X, Plus, AlertCircle, FileSpreadsheet } from "lucide-react";\nimport { useStudents } from "../data/studentsData";'
);
teachersFile = teachersFile.replace(
  'const [students, setStudents] = useState<Student[]>(initialStudentsList);',
  'const [students, setStudents] = useStudents();'
);
fs.writeFileSync('src/pages/Teachers.tsx', teachersFile);

// Fix Dashboard.tsx
let dashFile = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
dashFile = dashFile.replace(
  'import { useSessions, TERMS } from "../data/sessionsData";',
  'import { useSessions, TERMS } from "../data/sessionsData";\nimport { useStudents } from "../data/studentsData";'
);
dashFile = dashFile.replace(
  'const [activeTab, setActiveTab] = useState("overview");',
  'const [activeTab, setActiveTab] = useState("overview");\n  const [students, setStudents] = useStudents();'
);
dashFile = dashFile.replace(/initialStudentsList/g, 'students');
fs.writeFileSync('src/pages/Dashboard.tsx', dashFile);

// Fix Examinations.tsx
let examFile = fs.readFileSync('src/pages/Examinations.tsx', 'utf8');
examFile = examFile.replace(
  'import { jsPDF } from "jspdf";',
  'import { jsPDF } from "jspdf";\nimport { useStudents } from "../data/studentsData";'
);
examFile = examFile.replace(
  'const [activeModal, setActiveModal] = useState<',
  'const [students, setStudents] = useStudents();\n  const [activeModal, setActiveModal] = useState<'
);
examFile = examFile.replace(/ALL_STUDENTS/g, 'students');
fs.writeFileSync('src/pages/Examinations.tsx', examFile);

