const fs = require('fs');
let code = fs.readFileSync('src/pages/Teachers.tsx', 'utf-8');

const regex = /\{\/\* Recent Enrolled Students Roster for Staff \*\/\}[\s\S]*?<\/Card>/;
code = code.replace(regex, '');

fs.writeFileSync('src/pages/Teachers.tsx', code);
