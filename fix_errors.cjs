const fs = require('fs');

// AdmissionStatus.tsx
let as = fs.readFileSync('src/pages/public/AdmissionStatus.tsx', 'utf-8');
if (!as.includes('import { useEntranceExams }')) {
  as = as.replace(
    /import \{ usePortalSettings, useAdmissionSettings \} from "\.\.\/\.\.\/data\/portalSettingsData";/,
    'import { usePortalSettings, useAdmissionSettings } from "../../data/portalSettingsData";\nimport { useEntranceExams } from "../../data/entranceExamsData";'
  );
  fs.writeFileSync('src/pages/public/AdmissionStatus.tsx', as);
}

// Reports.tsx
let rp = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');
if (!rp.includes('import { TERMS }')) {
  rp = rp.replace(
    /import \{ useScores, gradeSystem \} from "\.\.\/data\/scoresData";/,
    'import { useScores, gradeSystem } from "../data/scoresData";\nimport { TERMS } from "../data/sessionsData";\nimport { CLASSES } from "../data/studentsData";'
  );
}
if (!rp.includes('GraduationCap')) {
  rp = rp.replace(
    /import \{ UserCheck, BookOpen, User, CheckSquare, Download, ArrowLeft /,
    'import { UserCheck, BookOpen, User, CheckSquare, Download, ArrowLeft, GraduationCap '
  );
}
// Fix idx error in Reports
rp = rp.replace(/\{s\.id\}_\$\{idx\}/g, '{s.id}');
fs.writeFileSync('src/pages/Reports.tsx', rp);

// Enrollment.tsx
let en = fs.readFileSync('src/pages/Enrollment.tsx', 'utf-8');
en = en.replace(/\{student\.id\}_\$\{idx\}/g, '{student.id}');
fs.writeFileSync('src/pages/Enrollment.tsx', en);

