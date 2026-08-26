import re

with open("src/data/portalSettingsData.ts", "r") as f:
    content = f.read()

content = content.replace(
    'logoUrl: "https://cdn-icons-png.flaticon.com/512/2941/2941658.png"',
    'logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80"'
)

with open("src/data/portalSettingsData.ts", "w") as f:
    f.write(content)
