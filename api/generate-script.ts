import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY no está configurada en las variables de entorno." });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    const { prompt } = body || {};
    if (!prompt) {
      return res.status(400).json({ error: "El campo 'prompt' es requerido." });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const CANDIDATE_MODELS = [
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash",
      "gemini-3.8-flash",
      "gemini-flash-latest",
    ];

    let text = "";
    let lastError: any = null;
    let retryAfterSeconds = 0;

    // Pase 1: Modelo rápido gemini-3.1-flash-lite con auto-retry rápido
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: { temperature: 0.7 },
        });
        if (response && response.text) {
          text = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code;
        const msg = String(err?.message || "");
        if (attempt === 0 && (status === 503 || msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE"))) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        break;
      }
    }

    // Pase 2: Modelos de contingencia si flash-lite no respondió
    if (!text) {
      for (let i = 1; i < CANDIDATE_MODELS.length; i++) {
        const model = CANDIDATE_MODELS[i];
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { temperature: 0.7 },
          });
          if (response && response.text) {
            text = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          const msg = String(err?.message || "");
          const retryMatch = msg.match(/retry in (\d+(\.\d+)?)s/i);
          if (retryMatch) {
            retryAfterSeconds = Math.max(retryAfterSeconds, Math.ceil(parseFloat(retryMatch[1])));
          }
        }
      }
    }

    if (!text && lastError) {
      const rawMsg = String(lastError?.message || "");
      const is429 = lastError?.status === 429 || rawMsg.includes("429") || rawMsg.includes("quota") || rawMsg.includes("RESOURCE_EXHAUSTED");
      const is503 = lastError?.status === 503 || rawMsg.includes("503") || rawMsg.includes("high demand") || rawMsg.includes("UNAVAILABLE");

      let userFriendlyMsg = "Los servidores de IA están experimentando una alta demanda temporal. Por favor, reintenta en unos instantes.";
      if (is429) {
        const waitTime = retryAfterSeconds > 0 ? ` en ${retryAfterSeconds} segundos` : " en unos instantes";
        userFriendlyMsg = `Se alcanzó temporalmente el límite de consultas por minuto. Podés reintentar${waitTime}.`;
      } else if (is503) {
        userFriendlyMsg = "Los servidores de IA están con alta demanda en este momento. Hacé clic en 'Reintentar' para volver a intentarlo.";
      }

      return res.status(200).json({ 
        error: userFriendlyMsg,
        retryAfter: retryAfterSeconds > 0 ? retryAfterSeconds : (is429 ? 25 : 5),
      });
    }

    return res.status(200).json({ text: text || "Sin respuesta generada." });
  } catch (error: any) {
    console.error("Error in Vercel API /api/generate-script:", error);
    return res.status(200).json({
      error: "Los servidores de IA están experimentando alta demanda. Por favor, reintenta en unos instantes.",
      retryAfter: 10,
    });
  }
}
