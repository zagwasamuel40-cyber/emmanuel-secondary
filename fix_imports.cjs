const fs = require('fs');

const insertImport = (path) => {
  let file = fs.readFileSync(path, 'utf8');
  file = file.replace(
    'import React, { useState } from "react";',
    'import React, { useState } from "react";\nimport { useStudents } from "../data/studentsData";'
  );
  fs.writeFileSync(path, file);
}

insertImport('src/pages/Teachers.tsx');
insertImport('src/pages/Examinations.tsx');

