const fs = require('fs');

let file = fs.readFileSync('src/pages/Enrollment.tsx', 'utf8');

file = file.replace(
  'import { useStudents } from "../data/studentsData";',
  'import { useStudents, useAdmissionApps } from "../data/studentsData";'
);

// We need to replace the state declaration
file = file.replace(
  'const [admissionApps, setAdmissionApps] = useState([\n    { id: "APP-2026-001", name: "John Doe", class: "JSS 1A", assignedClass: "JSS 1A", date: "2026-07-25", status: "Pending", payment: "Paid", phone: "+234 800 111 2222" },\n    { id: "APP-2026-002", name: "Jane Smith", class: "SSS 1 Science", assignedClass: "SSS 1A", date: "2026-07-26", status: "Approved", payment: "Paid", phone: "+234 800 333 4444" },\n    { id: "APP-2026-003", name: "Peter Obi", class: "JSS 2B", assignedClass: "JSS 2B", date: "2026-07-24", status: "Pending", payment: "Unpaid", phone: "+234 800 555 6666" },\n  ]);',
  'const [admissionApps, setAdmissionApps] = useAdmissionApps();'
);

fs.writeFileSync('src/pages/Enrollment.tsx', file);
