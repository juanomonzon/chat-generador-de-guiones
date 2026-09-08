import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to get Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no está configurada en las variables de entorno.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API routes FIRST
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Candidate models ordered by stability and speed
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

interface GenerateResult {
  text?: string;
  error?: string;
  retryAfter?: number;
}

async function generateWithFallback(ai: GoogleGenAI, prompt: string): Promise<GenerateResult> {
  let lastError: any = null;
  let retryAfterSeconds = 0;

  // Intento 1: Modelo principal gemini-3.1-flash-lite con auto-retry rápido en caso de pico 503
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      console.log(`[Gemini API] Intentando generar con 'gemini-3.1-flash-lite' (pase ${attempt + 1}/2)...`);
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        console.log(`[Gemini API] Éxito con 'gemini-3.1-flash-lite'.`);
        return { text: response.text };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code;
      const msg = String(err?.message || "");
      console.warn(`[Gemini API] Pase ${attempt + 1} con 'gemini-3.1-flash-lite' falló (${status}):`, msg.slice(0, 100));

      // Si es un pico transitorio 503 en flash-lite, aguardar 800ms antes del segundo intento
      if (attempt === 0 && (status === 503 || msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE"))) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        continue;
      }
      break;
    }
  }

  // Intento con modelos alternativos si flash-lite sigue con fallas
  for (let i = 1; i < CANDIDATE_MODELS.length; i++) {
    const model = CANDIDATE_MODELS[i];
    try {
      console.log(`[Gemini API] Intentando fallback con '${model}'...`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        console.log(`[Gemini API] Éxito con '${model}'.`);
        return { text: response.text };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code;
      const msg = String(err?.message || "");
      console.warn(`[Gemini API] Fallback '${model}' falló (${status}):`, msg.slice(0, 100));

      // Intentar extraer segundos si vino con rate limit (429)
      const retryMatch = msg.match(/retry in (\d+(\.\d+)?)s/i);
      if (retryMatch) {
        retryAfterSeconds = Math.max(retryAfterSeconds, Math.ceil(parseFloat(retryMatch[1])));
      }
    }
  }

  // Extracción de mensaje amigable y limpio en español (sin URLs ni errores internos de Google)
  const rawMsg = String(lastError?.message || "");
  const is429 = lastError?.status === 429 || rawMsg.includes("429") || rawMsg.includes("quota") || rawMsg.includes("RESOURCE_EXHAUSTED");
  const is503 = lastError?.status === 503 || rawMsg.includes("503") || rawMsg.includes("high demand") || rawMsg.includes("UNAVAILABLE");

  let friendlyMessage = "Los servidores de IA están experimentando alta demanda momentánea. Por favor, hacé clic en 'Reintentar'.";
  if (is429) {
    const waitTime = retryAfterSeconds > 0 ? ` en ${retryAfterSeconds} segundos` : " en unos instantes";
    friendlyMessage = `Se alcanzó temporalmente el límite de solicitudes por minuto. Podés reintentar${waitTime}.`;
  } else if (is503) {
    friendlyMessage = "Los servidores de IA están con alta demanda en este momento. Hacé clic en 'Reintentar' para volver a intentarlo.";
  }

  return {
    error: friendlyMessage,
    retryAfter: retryAfterSeconds > 0 ? retryAfterSeconds : (is429 ? 25 : 5),
  };
}

app.post("/api/generate-script", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "El campo 'prompt' es requerido." });
    }

    const ai = getGeminiClient();
    const result = await generateWithFallback(ai, prompt);

    return res.status(200).json(result);
  } catch (error: any) {
    console.warn("Retornando aviso controlado de error al frontend:", error?.message || error);
    return res.status(200).json({
      error: "Los servidores de IA están experimentando alta demanda temporal. Por favor, hacé clic en 'Reintentar'.",
      retryAfter: 10,
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Radar Cultural server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
