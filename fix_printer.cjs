const fs = require('fs');
let code = fs.readFileSync('src/layouts/DashboardLayout.tsx', 'utf-8');

code = code.replace(/import \{ Printer,  Outlet,/, 'import { Outlet,');
code = code.replace(/import \{ \n  LayoutDashboard,/, 'import { Printer, \n  LayoutDashboard,');

fs.writeFileSync('src/layouts/DashboardLayout.tsx', code);
