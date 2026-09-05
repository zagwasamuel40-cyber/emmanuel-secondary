const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');

code = code.replace('{selectedSections.staff && <StaffDatabaseReport />}', '{selectedSections.staff && <StaffDatabaseReport />}\n          {selectedSections.classes && <ClassReport />}');

fs.writeFileSync('src/pages/Reports.tsx', code);
