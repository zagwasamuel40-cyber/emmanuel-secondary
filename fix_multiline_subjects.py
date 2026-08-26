import re

files = [
    "src/pages/Examinations.tsx"
]

for file in files:
    with open(file, "r") as f:
        content = f.read()

    # Revert SUBJECTS options that were affected
    content = re.sub(r'SUBJECTS\.filter\(s => s !== "All Subjects"\)\.map\(s => \(\s*<option key=\{s\} value=\{s\}>\{s\} Academic Session</option>\s*\)\)', r'SUBJECTS.filter(s => s !== "All Subjects").map(s => (\n                      <option key={s} value={s}>{s}</option>\n                    ))', content)

    with open(file, "w") as f:
        f.write(content)
