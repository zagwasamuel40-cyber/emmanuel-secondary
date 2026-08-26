import re

with open("src/pages/students/StudentSkills.tsx", "r") as f:
    content = f.read()

imports = 'import { useSkillsDb } from "../../data/skillsData";\n'

if "useSkillsDb" not in content:
    content = content.replace(
        'import { useSessions, TERMS } from "../../data/sessionsData";',
        'import { useSessions, TERMS } from "../../data/sessionsData";\n' + imports
    )

old_state = """  // mock database of skills
  const [skillsDb, setSkillsDb] = useState<Record<string, Record<string, string>>>({
    "ESS/2026/001": { "Handwriting": "A", "Sports & Games": "B", "Punctuality": "A" }
  });"""

new_state = """  const [skillsDb, setSkillsDb] = useSkillsDb();"""

content = content.replace(old_state, new_state)

with open("src/pages/students/StudentSkills.tsx", "w") as f:
    f.write(content)
