const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');

if (!code.includes('GraduationCap')) {
  code = code.replace(
    /import \{ UserCheck, BookOpen, User, CheckSquare, Download, ArrowLeft /,
    'import { UserCheck, BookOpen, User, CheckSquare, Download, ArrowLeft, GraduationCap '
  );
}

if (!code.includes('TERMS')) {
  code = code.replace(
    /import \{ useScores, gradeSystem \} from "\.\.\/data\/scoresData";/,
    'import { useScores, gradeSystem } from "../data/scoresData";\nimport { TERMS } from "../data/sessionsData";\nimport { CLASSES } from "../data/studentsData";'
  );
}

fs.writeFileSync('src/pages/Reports.tsx', code);
