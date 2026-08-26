import sys

with open("src/pages/Examinations.tsx", "r") as f:
    lines = f.readlines()

with open("/tmp/exam_patch.tsx", "r") as f:
    patch_lines = f.readlines()

# Ensure we're targeting the exact indices (601 is index 601 in 0-indexed if line 602)
# Wait, let's search for the exact string to be safe instead of hardcoded numbers.
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "{/* FEATURED: EXAMINATION QUICK ACTION COMMANDS PANEL (ALL 16 REQUESTED COMMANDS) */}" in line:
        start_idx = i
        break

for i in range(start_idx + 1, len(lines)):
    if "{/* MODAL: LIVE SCORE ENTRY */}" in line:
        pass
    if "MODAL: LIVE SCORE ENTRY" in lines[i]:
        end_idx = i - 1
        break

print(f"Start index: {start_idx}, End index: {end_idx}")

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + patch_lines + ["\n"] + lines[end_idx:]
    with open("src/pages/Examinations.tsx", "w") as f:
        f.writelines(new_lines)
    print("Patched successfully!")
else:
    print("Could not find boundaries")

