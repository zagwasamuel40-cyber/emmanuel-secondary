const fs = require('fs');
let code = fs.readFileSync('src/data/teachersData.ts', 'utf-8');

const newTeachers = `
const initialTeachers: Teacher[] = [
  {
    id: "ADM/2026/001",
    name: "System Administrator",
    department: "Administration",
    role: "General Admin",
    status: "Active",
    email: "admin@ess.edu.ng",
    phone: "+234 800 000 0000",
    address: "Admin Block",
    subjects: [],
    assignedClasses: [],
    password: "admin123",
    systemRoles: ['Admin', 'Super Admin', 'General Admin', 'HR/Staff Admin'],
    employmentDate: '2020-01-01'
  },
  {
    id: "TCH/2026/042",
    name: "Mrs. Grace Adeyemi",
    department: "Languages",
    role: "English Teacher",
    status: "Active",
    email: "g.adeyemi@staff.ess.edu.ng",
    phone: "+234 802 345 6789",
    address: "12 Staff Quarters",
    subjects: ["English Language"],
    assignedClasses: ["JSS 1A", "JSS 1B"],
    password: "teacher123",
    systemRoles: ['Teacher'],
    employmentDate: '2022-05-10'
  },
  {
    id: "TCH/2026/001",
    name: "Dr. Samuel Okoh",
    department: "Sciences",
    role: "Senior Master & HOD Science",
    status: "Active",
    email: "s.okoh@staff.ess.edu.ng",
    phone: "+234 803 456 7890",
    address: "24 Executive Quarters, Makurdi, Benue State",
    subjects: ["Physics", "Further Mathematics"],
    assignedClasses: ["SSS 3A", "SSS 3B", "SSS 2A"],
    password: "teacher123",
    systemRoles: ['Teacher', 'Academic Admin'],
    employmentDate: '2020-01-15'
  }
];
`;

code = code.replace(/const initialTeachers: Teacher\[\] = \[\s*\{[\s\S]*?\}\s*\];/, newTeachers);
fs.writeFileSync('src/data/teachersData.ts', code);
