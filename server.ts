import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI API Route
  app.post("/api/generate-questions", async (req, res) => {
    try {
      const { className, subject, count, topics } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      let prompt = `Generate ${count || 10} examination questions for ${className} level students in Nigeria. Subject: ${subject || "General Knowledge"}.`;
      if (topics && topics.trim().length > 0) {
        prompt += ` Focus specifically on the following topics: ${topics}.`;
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: {
                  type: Type.STRING,
                  description: "The question text."
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 4 options for the multiple choice question."
                },
                answer: {
                  type: Type.STRING,
                  description: "The exact correct option string."
                },
                subject: {
                  type: Type.STRING,
                  description: "The subject of the question (e.g. Mathematics, English)"
                }
              },
              required: ["text", "options", "answer", "subject"]
            }
          }
        }
      });
      
      const jsonStr = response.text?.trim() || "[]";
      const questions = JSON.parse(jsonStr);
      
      res.json({ questions });
    } catch (error: any) {
      console.error("Error generating questions:", error);
      res.status(500).json({ error: error.message || "Failed to generate questions" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
