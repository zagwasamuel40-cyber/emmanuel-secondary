import json
import random

questions = []
for i in range(1, 51):
    q_type = random.choice(["Math", "English", "Science"])
    if q_type == "Math":
        a = random.randint(10, 99)
        b = random.randint(10, 99)
        ans = a + b
        options = [str(ans), str(ans + 10), str(ans - 10), str(ans + 5)]
        random.shuffle(options)
        questions.append({
            "id": i,
            "text": f"What is {a} + {b}?",
            "options": options,
            "answer": str(ans),
            "subject": "Mathematics"
        })
    elif q_type == "English":
        words = ["apple", "run", "beautiful", "quickly"]
        types = ["noun", "verb", "adjective", "adverb"]
        idx = random.randint(0, 3)
        options = types.copy()
        random.shuffle(options)
        questions.append({
            "id": i,
            "text": f"What part of speech is the word '{words[idx]}'?",
            "options": options,
            "answer": types[idx],
            "subject": "English Language"
        })
    else:
        topics = [
            ("water", "H2O", ["CO2", "H2O", "O2", "NaCl"]),
            ("the powerhouse of the cell", "Mitochondria", ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"]),
            ("the closest planet to the sun", "Mercury", ["Venus", "Earth", "Mars", "Mercury"]),
            ("the force that pulls objects to Earth", "Gravity", ["Magnetism", "Friction", "Gravity", "Inertia"])
        ]
        topic = random.choice(topics)
        options = topic[2].copy()
        random.shuffle(options)
        questions.append({
            "id": i,
            "text": f"What is known as {topic[0]}?",
            "options": options,
            "answer": topic[1],
            "subject": "Basic Science"
        })

print(json.dumps(questions, indent=2))
