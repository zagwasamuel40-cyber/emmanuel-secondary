import re

with open("src/pages/Examinations.tsx", "r") as f:
    content = f.read()

# Replace hardcoded arrays with sessions
content = content.replace('["2024/2025", "2025/2026", "2026/2027"].map', 'sessions.map')

# Also, change the display label to '{s} Academic Session' inside all session maps in Examinations.tsx
# Wait, this might be tricky with regex. Let's just do it directly if we can, or just replace '<option key={s} value={s}>{s}</option>' with '<option key={s} value={s}>{s} Academic Session</option>'
content = content.replace('<option key={s} value={s}>{s}</option>', '<option key={s} value={s}>{s}</option>') # No wait, it's safer to only do it for the mapped sessions. Let's just fix the hardcoded ones.

with open("src/pages/Examinations.tsx", "w") as f:
    f.write(content)
