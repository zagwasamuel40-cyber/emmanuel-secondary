import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add import
old_import = 'import ResultChecker from "./pages/public/ResultChecker";'
new_import = 'import ResultChecker from "./pages/public/ResultChecker";\nimport AdmissionStatus from "./pages/public/AdmissionStatus";'
content = content.replace(old_import, new_import)

# Add route
old_route = '<Route path="/result-checker" element={<ResultChecker />} />'
new_route = '<Route path="/result-checker" element={<ResultChecker />} />\n          <Route path="/admission-status" element={<AdmissionStatus />} />'
content = content.replace(old_route, new_route)

with open("src/App.tsx", "w") as f:
    f.write(content)
