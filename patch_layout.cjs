const fs = require('fs');
let code = fs.readFileSync('src/layouts/DashboardLayout.tsx', 'utf-8');

// Add Printer icon import if it doesn't exist
if (!code.includes('Printer')) {
  code = code.replace(/import \{([\s\S]*?)LayoutDashboard/m, 'import { Printer, $1LayoutDashboard');
}

// Add route access
if (!code.includes("'/dashboard/reports'")) {
  code = code.replace(
    /'\/dashboard\/settings': \['Admin', 'Super Admin', 'General Admin', 'Portal Admin'\],/g,
    `'/dashboard/settings': ['Admin', 'Super Admin', 'General Admin', 'Portal Admin'],\n    '/dashboard/reports': ['Admin', 'Super Admin', 'General Admin', 'Finance/Admin Officer', 'Examination Admin', 'Academic Admin'],`
  );
}

// Add navigation
if (!code.includes("href: '/dashboard/reports'")) {
  code = code.replace(
    /\{ name: 'Portal Manager', href: '\/dashboard\/portal-manager', icon: Settings \},/g,
    `{ name: 'Portal Manager', href: '/dashboard/portal-manager', icon: Settings },\n  { name: 'Report Center', href: '/dashboard/reports', icon: Printer },`
  );
}

fs.writeFileSync('src/layouts/DashboardLayout.tsx', code);
