const fs = require('fs');

// Fix idx in Enrollment.tsx completely
let en = fs.readFileSync('src/pages/Enrollment.tsx', 'utf-8');
en = en.replace(/key=\{\`\$\{student\.id\}_\$\{idx\}\`\}/g, 'key={student.id}');
en = en.replace(/\{student\.id\}_\$\{idx\}/g, '{student.id}');
fs.writeFileSync('src/pages/Enrollment.tsx', en);

// Fix Reports.tsx completely
let rp = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');
if (!rp.includes('import { CLASSES }')) {
  rp = rp.replace(
    /import \{ useStudents \} from "\.\.\/data\/studentsData";/,
    'import { useStudents, CLASSES } from "../data/studentsData";'
  );
}
if (!rp.includes('import { TERMS }')) {
  rp = rp.replace(
    /import \{ useSessions \} from "\.\.\/data\/sessionsData";/,
    'import { useSessions, TERMS } from "../data/sessionsData";'
  );
}
if (!rp.includes('GraduationCap')) {
  rp = rp.replace(
    /import \{[\s\S]*?Loader2\n\} from "lucide-react";/,
    `import { 
  Printer, School, Users, FileText, DollarSign, Calendar, 
  UserCheck, BookOpen, User, CheckSquare, Download, ArrowLeft,
  Settings, Loader2, GraduationCap
} from "lucide-react";`
  );
}
rp = rp.replace(/key=\{\`\$\{s\.id\}_\$\{idx\}\`\}/g, 'key={s.id}');
rp = rp.replace(/\{s\.id\}_\$\{idx\}/g, '{s.id}');
fs.writeFileSync('src/pages/Reports.tsx', rp);

