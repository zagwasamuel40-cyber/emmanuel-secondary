const fs = require('fs');
let code = fs.readFileSync('src/pages/public/AdmissionStatus.tsx', 'utf-8');

if (!code.includes('import { useEntranceExams }')) {
  code = code.replace(
    /import \{ usePortalSettings \} from "\.\.\/\.\.\/data\/portalSettingsData";/,
    'import { usePortalSettings } from "../../data/portalSettingsData";\nimport { useEntranceExams } from "../../data/entranceExamsData";'
  );
  fs.writeFileSync('src/pages/public/AdmissionStatus.tsx', code);
}
