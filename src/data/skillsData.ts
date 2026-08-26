import { useState, useEffect } from "react";

export type StudentSkillsRecord = Record<string, string>;

export function useSkillsDb() {
  const [skillsDb, setSkillsDb] = useState<Record<string, StudentSkillsRecord>>(() => {
    const saved = localStorage.getItem("ess_skills_db");
    if (saved) return JSON.parse(saved);
    return {
      "ESS/2026/001": { 
        "Attentiveness": "A", 
        "Attendance": "A", 
        "Punctuality": "A", 
        "Neatness": "A", 
        "Politeness": "A", 
        "Rel. With Others": "A", 
        "Curiosity": "B", 
        "Honesty": "A", 
        "Humility": "A", 
        "Tolerance": "A", 
        "Leadership": "A", 
        "Courage": "B", 
        "Handwriting": "B", 
        "Fluency": "A", 
        "Games/Sports": "A", 
        "Music Skills": "B", 
        "Construction": "B"
      }
    };
  });

  useEffect(() => {
    localStorage.setItem("ess_skills_db", JSON.stringify(skillsDb));
  }, [skillsDb]);

  return [skillsDb, setSkillsDb] as const;
}
