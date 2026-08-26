import { useState, useEffect } from "react";

export interface Question {
  id: number;
  text: string;
  options: string[];
  answer: string;
  subject: string;
}

const defaultQuestions: Record<string, Question[]> = {
  "JSS 1": [
  {
    "id": 1,
    "text": "What part of speech is the word 'run'?",
    "options": [
      "noun",
      "verb",
      "adjective",
      "adverb"
    ],
    "answer": "verb",
    "subject": "English Language"
  },
  {
    "id": 2,
    "text": "What is 80 + 70?",
    "options": [
      "160",
      "150",
      "155",
      "140"
    ],
    "answer": "150",
    "subject": "Mathematics"
  },
  {
    "id": 3,
    "text": "What is 81 + 38?",
    "options": [
      "109",
      "124",
      "129",
      "119"
    ],
    "answer": "119",
    "subject": "Mathematics"
  },
  {
    "id": 4,
    "text": "What is 44 + 57?",
    "options": [
      "101",
      "106",
      "91",
      "111"
    ],
    "answer": "101",
    "subject": "Mathematics"
  },
  {
    "id": 5,
    "text": "What is known as water?",
    "options": [
      "NaCl",
      "CO2",
      "O2",
      "H2O"
    ],
    "answer": "H2O",
    "subject": "Basic Science"
  },
  {
    "id": 6,
    "text": "What is 56 + 89?",
    "options": [
      "155",
      "150",
      "145",
      "135"
    ],
    "answer": "145",
    "subject": "Mathematics"
  },
  {
    "id": 7,
    "text": "What is 28 + 85?",
    "options": [
      "118",
      "123",
      "103",
      "113"
    ],
    "answer": "113",
    "subject": "Mathematics"
  },
  {
    "id": 8,
    "text": "What is known as the powerhouse of the cell?",
    "options": [
      "Mitochondria",
      "Ribosome",
      "Nucleus",
      "Chloroplast"
    ],
    "answer": "Mitochondria",
    "subject": "Basic Science"
  },
  {
    "id": 9,
    "text": "What is known as the force that pulls objects to Earth?",
    "options": [
      "Friction",
      "Gravity",
      "Magnetism",
      "Inertia"
    ],
    "answer": "Gravity",
    "subject": "Basic Science"
  },
  {
    "id": 10,
    "text": "What part of speech is the word 'quickly'?",
    "options": [
      "verb",
      "adjective",
      "noun",
      "adverb"
    ],
    "answer": "adverb",
    "subject": "English Language"
  },
  {
    "id": 11,
    "text": "What is 45 + 62?",
    "options": [
      "117",
      "97",
      "112",
      "107"
    ],
    "answer": "107",
    "subject": "Mathematics"
  },
  {
    "id": 12,
    "text": "What is 37 + 68?",
    "options": [
      "95",
      "115",
      "105",
      "110"
    ],
    "answer": "105",
    "subject": "Mathematics"
  },
  {
    "id": 13,
    "text": "What part of speech is the word 'run'?",
    "options": [
      "adjective",
      "adverb",
      "noun",
      "verb"
    ],
    "answer": "verb",
    "subject": "English Language"
  },
  {
    "id": 14,
    "text": "What is 10 + 75?",
    "options": [
      "85",
      "75",
      "90",
      "95"
    ],
    "answer": "85",
    "subject": "Mathematics"
  },
  {
    "id": 15,
    "text": "What is known as the powerhouse of the cell?",
    "options": [
      "Mitochondria",
      "Chloroplast",
      "Nucleus",
      "Ribosome"
    ],
    "answer": "Mitochondria",
    "subject": "Basic Science"
  },
  {
    "id": 16,
    "text": "What is known as the closest planet to the sun?",
    "options": [
      "Mercury",
      "Venus",
      "Mars",
      "Earth"
    ],
    "answer": "Mercury",
    "subject": "Basic Science"
  },
  {
    "id": 17,
    "text": "What is known as the force that pulls objects to Earth?",
    "options": [
      "Magnetism",
      "Inertia",
      "Gravity",
      "Friction"
    ],
    "answer": "Gravity",
    "subject": "Basic Science"
  },
  {
    "id": 18,
    "text": "What is 26 + 29?",
    "options": [
      "65",
      "55",
      "60",
      "45"
    ],
    "answer": "55",
    "subject": "Mathematics"
  },
  {
    "id": 19,
    "text": "What part of speech is the word 'quickly'?",
    "options": [
      "noun",
      "adverb",
      "verb",
      "adjective"
    ],
    "answer": "adverb",
    "subject": "English Language"
  },
  {
    "id": 20,
    "text": "What part of speech is the word 'run'?",
    "options": [
      "adverb",
      "verb",
      "adjective",
      "noun"
    ],
    "answer": "verb",
    "subject": "English Language"
  },
  {
    "id": 21,
    "text": "What part of speech is the word 'run'?",
    "options": [
      "verb",
      "adverb",
      "adjective",
      "noun"
    ],
    "answer": "verb",
    "subject": "English Language"
  },
  {
    "id": 22,
    "text": "What part of speech is the word 'quickly'?",
    "options": [
      "verb",
      "noun",
      "adverb",
      "adjective"
    ],
    "answer": "adverb",
    "subject": "English Language"
  },
  {
    "id": 23,
    "text": "What is known as the powerhouse of the cell?",
    "options": [
      "Ribosome",
      "Mitochondria",
      "Nucleus",
      "Chloroplast"
    ],
    "answer": "Mitochondria",
    "subject": "Basic Science"
  },
  {
    "id": 24,
    "text": "What part of speech is the word 'run'?",
    "options": [
      "noun",
      "adjective",
      "adverb",
      "verb"
    ],
    "answer": "verb",
    "subject": "English Language"
  },
  {
    "id": 25,
    "text": "What part of speech is the word 'apple'?",
    "options": [
      "adjective",
      "noun",
      "verb",
      "adverb"
    ],
    "answer": "noun",
    "subject": "English Language"
  },
  {
    "id": 26,
    "text": "What part of speech is the word 'quickly'?",
    "options": [
      "adjective",
      "verb",
      "noun",
      "adverb"
    ],
    "answer": "adverb",
    "subject": "English Language"
  },
  {
    "id": 27,
    "text": "What part of speech is the word 'beautiful'?",
    "options": [
      "verb",
      "adjective",
      "adverb",
      "noun"
    ],
    "answer": "adjective",
    "subject": "English Language"
  },
  {
    "id": 28,
    "text": "What is 37 + 89?",
    "options": [
      "136",
      "116",
      "131",
      "126"
    ],
    "answer": "126",
    "subject": "Mathematics"
  },
  {
    "id": 29,
    "text": "What part of speech is the word 'run'?",
    "options": [
      "adverb",
      "verb",
      "adjective",
      "noun"
    ],
    "answer": "verb",
    "subject": "English Language"
  },
  {
    "id": 30,
    "text": "What is known as water?",
    "options": [
      "CO2",
      "O2",
      "H2O",
      "NaCl"
    ],
    "answer": "H2O",
    "subject": "Basic Science"
  },
  {
    "id": 31,
    "text": "What part of speech is the word 'quickly'?",
    "options": [
      "verb",
      "adjective",
      "adverb",
      "noun"
    ],
    "answer": "adverb",
    "subject": "English Language"
  },
  {
    "id": 32,
    "text": "What is 62 + 72?",
    "options": [
      "144",
      "139",
      "134",
      "124"
    ],
    "answer": "134",
    "subject": "Mathematics"
  },
  {
    "id": 33,
    "text": "What is known as the closest planet to the sun?",
    "options": [
      "Mars",
      "Mercury",
      "Venus",
      "Earth"
    ],
    "answer": "Mercury",
    "subject": "Basic Science"
  },
  {
    "id": 34,
    "text": "What part of speech is the word 'beautiful'?",
    "options": [
      "verb",
      "adjective",
      "adverb",
      "noun"
    ],
    "answer": "adjective",
    "subject": "English Language"
  },
  {
    "id": 35,
    "text": "What is 44 + 91?",
    "options": [
      "135",
      "140",
      "145",
      "125"
    ],
    "answer": "135",
    "subject": "Mathematics"
  },
  {
    "id": 36,
    "text": "What is known as the closest planet to the sun?",
    "options": [
      "Mars",
      "Venus",
      "Mercury",
      "Earth"
    ],
    "answer": "Mercury",
    "subject": "Basic Science"
  },
  {
    "id": 37,
    "text": "What is known as the closest planet to the sun?",
    "options": [
      "Mercury",
      "Venus",
      "Earth",
      "Mars"
    ],
    "answer": "Mercury",
    "subject": "Basic Science"
  },
  {
    "id": 38,
    "text": "What part of speech is the word 'apple'?",
    "options": [
      "verb",
      "adverb",
      "adjective",
      "noun"
    ],
    "answer": "noun",
    "subject": "English Language"
  },
  {
    "id": 39,
    "text": "What is 89 + 51?",
    "options": [
      "150",
      "140",
      "130",
      "145"
    ],
    "answer": "140",
    "subject": "Mathematics"
  },
  {
    "id": 40,
    "text": "What part of speech is the word 'run'?",
    "options": [
      "verb",
      "noun",
      "adverb",
      "adjective"
    ],
    "answer": "verb",
    "subject": "English Language"
  },
  {
    "id": 41,
    "text": "What is known as water?",
    "options": [
      "NaCl",
      "CO2",
      "H2O",
      "O2"
    ],
    "answer": "H2O",
    "subject": "Basic Science"
  },
  {
    "id": 42,
    "text": "What part of speech is the word 'apple'?",
    "options": [
      "verb",
      "adjective",
      "adverb",
      "noun"
    ],
    "answer": "noun",
    "subject": "English Language"
  },
  {
    "id": 43,
    "text": "What is 45 + 44?",
    "options": [
      "79",
      "94",
      "89",
      "99"
    ],
    "answer": "89",
    "subject": "Mathematics"
  },
  {
    "id": 44,
    "text": "What is known as water?",
    "options": [
      "CO2",
      "NaCl",
      "O2",
      "H2O"
    ],
    "answer": "H2O",
    "subject": "Basic Science"
  },
  {
    "id": 45,
    "text": "What part of speech is the word 'beautiful'?",
    "options": [
      "noun",
      "adjective",
      "adverb",
      "verb"
    ],
    "answer": "adjective",
    "subject": "English Language"
  },
  {
    "id": 46,
    "text": "What is known as water?",
    "options": [
      "CO2",
      "H2O",
      "O2",
      "NaCl"
    ],
    "answer": "H2O",
    "subject": "Basic Science"
  },
  {
    "id": 47,
    "text": "What part of speech is the word 'beautiful'?",
    "options": [
      "adverb",
      "noun",
      "adjective",
      "verb"
    ],
    "answer": "adjective",
    "subject": "English Language"
  },
  {
    "id": 48,
    "text": "What part of speech is the word 'apple'?",
    "options": [
      "adjective",
      "noun",
      "verb",
      "adverb"
    ],
    "answer": "noun",
    "subject": "English Language"
  },
  {
    "id": 49,
    "text": "What is known as the closest planet to the sun?",
    "options": [
      "Mars",
      "Mercury",
      "Venus",
      "Earth"
    ],
    "answer": "Mercury",
    "subject": "Basic Science"
  },
  {
    "id": 50,
    "text": "What part of speech is the word 'run'?",
    "options": [
      "adverb",
      "adjective",
      "noun",
      "verb"
    ],
    "answer": "verb",
    "subject": "English Language"
  }
]
,

  "SSS 3": [
    { id: 1, text: "Calculate the derivative of x²", options: ["x", "2x", "x²", "2"], answer: "2x", subject: "Mathematics" },
    { id: 2, text: "Which chemical element has the symbol 'O'?", options: ["Osmium", "Oxygen", "Gold", "Silver"], answer: "Oxygen", subject: "Chemistry" }
  ]
};

export function useCbtQuestions() {
  const [questionsByClass, setQuestionsByClass] = useState<Record<string, Question[]>>(() => {
    const saved = localStorage.getItem("ess_cbt_questions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse CBT questions", e);
      }
    }
    return defaultQuestions;
  });

  useEffect(() => {
    localStorage.setItem("ess_cbt_questions", JSON.stringify(questionsByClass));
  }, [questionsByClass]);

  const updateQuestionsForClass = (className: string, questions: Question[]) => {
    setQuestionsByClass(prev => ({
      ...prev,
      [className]: questions
    }));
  };

  return [questionsByClass, updateQuestionsForClass] as const;
}
