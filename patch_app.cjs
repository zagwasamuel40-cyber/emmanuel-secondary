const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('ScrollToHash')) {
  code = code.replace(/import Home from ".\/pages\/Home";/, 'import Home from "./pages/Home";\nimport { ScrollToHash } from "./components/ScrollToHash";');
  code = code.replace(/<BrowserRouter>/, '<BrowserRouter>\n      <ScrollToHash />');
}

fs.writeFileSync('src/App.tsx', code);
