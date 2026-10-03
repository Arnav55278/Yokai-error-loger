import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const port = 3000;

// Parse JSON bodies up to 25MB (to handle high-res base64 images)
app.use(express.json({ limit: "25mb" }));

// Server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API endpoint for Question Vision Auto-Analyzer
app.post("/api/gemini/analyze-question", async (req, res) => {
  try {
    const { questionImage, solutionImage, model, apiKey: userProvidedApiKey } = req.body;

    if (!questionImage) {
      return res.status(400).json({ error: "questionImage is required" });
    }

    const effectiveApiKey = userProvidedApiKey?.trim() || process.env.GEMINI_API_KEY;

    if (!effectiveApiKey) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Please enter your API key in Settings (or Secrets panel).",
      });
    }

    const client = new GoogleGenAI({
      apiKey: effectiveApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Parse data URL for question image
    let qMime = "image/webp";
    let qBase64 = questionImage;
    if (questionImage.includes(";base64,")) {
      const parts = questionImage.split(";base64,");
      qMime = parts[0].replace("data:", "");
      qBase64 = parts[1];
    }

    const parts: any[] = [
      {
        inlineData: {
          mimeType: qMime,
          data: qBase64,
        },
      },
    ];

    if (solutionImage) {
      let sMime = "image/webp";
      let sBase64 = solutionImage;
      if (solutionImage.includes(";base64,")) {
        const sParts = solutionImage.split(";base64,");
        sMime = sParts[0].replace("data:", "");
        sBase64 = sParts[1];
      }
      parts.push({
        inlineData: {
          mimeType: sMime,
          data: sBase64,
        },
      });
    }

    const promptText = `
You are the elite JEE Advanced & Olympiad Academic Director. Analyze this uploaded JEE question screenshot (and optional rough work/solution image).

Carefully identify:
1. "subject": Exactly one of "Physics", "Chemistry", or "Mathematics".
2. "unit":
   - For Physics: "Mechanics", "Electrodynamics", "Optics & Waves", "Thermal Physics", or "Modern Physics".
   - For Chemistry: "Physical Chemistry", "Organic Chemistry", or "Inorganic Chemistry".
   - For Mathematics: "Calculus", "Algebra", "Coordinate Geometry", "Vectors & 3D", or "Trigonometry".
3. "chapter": Canonical JEE Advanced chapter title (e.g. "Rotational Motion", "Electrostatics", "Aldehydes, Ketones & Carboxylic Acids", "Definite Integrals", "Thermodynamics", "Capacitors", "Permutations & Combinations", etc.).
4. "subtopic": Specific micro-concept tested (e.g. "Variable Mass Moment of Inertia", "Aldol Stereochemistry & Nucleophilic Addition", "Leibnitz Rule with Floor Function", "LC Oscillations with Damping").
5. "ocrText": Clean, verbatim transcription of the entire question text, values, options (A, B, C, D) and mathematical equations so that it can be searched 1.5+ years later.
6. "keyConcept": 1-line golden formula or principle (Remember As Result - RAR), formatted with standard LaTeX syntax enclosed in $...$ or $$...$$ (e.g., "$I = \\int r^2 dm$, or $\\Delta Q = \\Delta U + W$").
7. "level": Exactly one of "JEE Main", "JEE Advanced", or "Olympiad".
8. "suggestedErrorType": One of "Conceptual Gap", "Silly / Calculation", "Formula Forgotten", "Question Misread", "Lengthy / Approach Issue", "Unattempted / Tough".
9. "suggestedTags": Array of 2 to 4 hashtag strings for cross-concept indexing (e.g. ["#Rotation+Electrostatics", "#GraphTrap", "#EnergyConservation"]).

Return strictly valid JSON conforming to the schema.
`;

    parts.push({ text: promptText });

    const selectedModel = (model && model.trim()) || "gemini-3.8-flash";

    const response = await client.models.generateContent({
      model: selectedModel,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            unit: { type: Type.STRING },
            chapter: { type: Type.STRING },
            subtopic: { type: Type.STRING },
            ocrText: { type: Type.STRING },
            keyConcept: { type: Type.STRING },
            level: { type: Type.STRING },
            suggestedErrorType: { type: Type.STRING },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "subject",
            "unit",
            "chapter",
            "subtopic",
            "ocrText",
            "keyConcept",
            "level",
            "suggestedErrorType",
            "suggestedTags",
          ],
        },
      },
    });

    const outputText = response.text?.trim() || "{}";
    const data = JSON.parse(outputText);
    return res.json(data);
  } catch (err: any) {
    console.error("Gemini Vision Analysis error:", err);
    return res.status(500).json({
      error: err.message || "Failed to analyze question with AI Vision",
    });
  }
});

// Multi-tier AI Hint & JEE Advanced Coach Generator
app.post("/api/gemini/generate-hint", async (req, res) => {
  try {
    const { questionImage, ocrText, subtopic, chapter, tier, apiKey: userProvidedApiKey, model } = req.body;
    const effectiveApiKey = userProvidedApiKey?.trim() || process.env.GEMINI_API_KEY;

    if (!effectiveApiKey) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Please enter your API key in Settings.",
      });
    }

    const client = new GoogleGenAI({
      apiKey: effectiveApiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });

    const parts: any[] = [];
    if (questionImage) {
      let qMime = "image/webp";
      let qBase64 = questionImage;
      if (questionImage.includes(";base64,")) {
        const p = questionImage.split(";base64,");
        qMime = p[0].replace("data:", "");
        qBase64 = p[1];
      }
      parts.push({
        inlineData: { mimeType: qMime, data: qBase64 },
      });
    }

    let tierInstruction = "";
    if (tier === 1) {
      tierInstruction = "Provide TIER 1: MICRO-HINT ONLY. Give a 1-2 sentence guiding nudge or initial frame of reference. DO NOT give away the final answer or full derivation. Point out which physical law or algebraic observation opens the problem.";
    } else if (tier === 2) {
      tierInstruction = "Provide TIER 2: EXAMINER'S TRAP & CORE THEOREM. Highlight the common mistake or negative sign / boundary trap. State the exact formula (RAR) in standard LaTeX syntax ($...$).";
    } else {
      tierInstruction = "Provide TIER 3: COMPLETE MASTERCLASS SOLUTION. Give step-by-step mathematical derivation using LaTeX formulas. Provide an elegant shortcut or dimensional check method if applicable.";
    }

    const promptText = `
You are an elite JEE Advanced Master Faculty.
Chapter: ${chapter || "Unknown"}
Subtopic: ${subtopic || "Unknown"}
Transcribed OCR: ${ocrText || "See attached image"}

Task:
${tierInstruction}

Keep the tone encouraging, concise, and academically rigorous for a Top 100 JEE Advanced aspirant. Render all equations in LaTeX syntax with $ or $$.
`;
    parts.push({ text: promptText });

    const selectedModel = (model && model.trim()) || "gemini-3.8-flash";
    const response = await client.models.generateContent({
      model: selectedModel,
      contents: { parts },
    });

    return res.json({
      success: true,
      hint: response.text?.trim() || "No hint generated.",
      tier,
      model: selectedModel,
    });
  } catch (err: any) {
    console.error("Gemini hint error:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate hint",
    });
  }
});

// Test API Key & Custom Model Endpoint
app.post("/api/gemini/test-key", async (req, res) => {
  try {
    const { apiKey: customKey, model } = req.body;
    const effectiveKey = customKey?.trim() || process.env.GEMINI_API_KEY;
    if (!effectiveKey) {
      return res.status(400).json({ error: "No API key provided or found on server." });
    }

    const testClient = new GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });

    const selectedModel = model?.trim() || "gemini-3.8-flash";
    const testRes = await testClient.models.generateContent({
      model: selectedModel,
      contents: "Reply with the single word: OK",
    });

    return res.json({
      success: true,
      model: selectedModel,
      reply: testRes.text?.trim() || "OK",
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || "Invalid API key or model name.",
    });
  }
});

// App status endpoint
app.get("/api/status", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(process.cwd(), "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`ApexVault Server running at http://localhost:${port}`);
  });
}

startServer();
