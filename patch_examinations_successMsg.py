import re

with open("src/pages/Examinations.tsx", "r") as f:
    content = f.read()

# I need to add const [successMsg, setSuccessMsg] = useState(""); in Examinations.tsx
if "const [successMsg, setSuccessMsg] = useState" not in content:
    content = content.replace(
        "const [notificationMsg, setNotificationMsg] = useState(\"\");",
        "const [notificationMsg, setNotificationMsg] = useState(\"\");\n  const [successMsg, setSuccessMsg] = useState(\"\");"
    )

with open("src/pages/Examinations.tsx", "w") as f:
    f.write(content)
