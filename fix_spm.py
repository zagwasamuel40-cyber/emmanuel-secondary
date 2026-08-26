import re

with open('src/pages/StudentPortalManager.tsx', 'r') as f:
    content = f.read()

content = content.replace('{activeTab === "features" && (\n      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">', '{activeTab === "features" && (\n      <>\n      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">')

content = content.replace('      </div>\n      )}\n\n      {activeTab === "admission" && (', '      </div>\n      </>\n      )}\n\n      {activeTab === "admission" && (')

with open('src/pages/StudentPortalManager.tsx', 'w') as f:
    f.write(content)
