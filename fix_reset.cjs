const fs = require('fs');

let file = fs.readFileSync('src/pages/public/Admissions.tsx', 'utf8');

file = file.replace(
  'setPassportPhotoFile(null);\n          }}>',
  'setPassportPhotoFile(null);\n            setFirstName("");\n            setLastName("");\n            setClassApplying("");\n            setParentPhone("");\n            setSelectedState("");\n            setSelectedLga("");\n          }}>'
);

fs.writeFileSync('src/pages/public/Admissions.tsx', file);
