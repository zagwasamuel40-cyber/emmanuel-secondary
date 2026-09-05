const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('import Reports from "./pages/Reports";')) {
  code = code.replace(
    /import Profile from "\.\/pages\/Profile";/,
    `import Profile from "./pages/Profile";\nimport Reports from "./pages/Reports";`
  );
}

if (!code.includes('<Route path="reports" element={<Reports />} />')) {
  code = code.replace(
    /<Route path="profile" element={<Profile \/>} \/>/,
    `<Route path="profile" element={<Profile />} />\n          <Route path="reports" element={<Reports />} />`
  );
}

fs.writeFileSync('src/App.tsx', code);
