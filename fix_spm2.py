import re

with open('src/pages/StudentPortalManager.tsx', 'r') as f:
    content = f.read()

content = content.replace('      </div>\n      </>\n      )}\n\n      {activeTab === "admission"', '      </>\n      )}\n\n      {activeTab === "admission"')

with open('src/pages/StudentPortalManager.tsx', 'w') as f:
    f.write(content)
