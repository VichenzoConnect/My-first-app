import { Router, type IRouter } from "express";
import {
  TranslateBody,
  TranslateResponse,
  DetectLanguageBody,
  DetectLanguageResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const LIBRE_TRANSLATE_MIRRORS = [
  "https://translate.argosopentech.com",
  "https://libretranslate.de",
  "https://translate.terraprint.co",
];

async function fetchFromMirror(mirrorUrl: string, path: string, body: object): Promise<Response> {
  return fetch(`${mirrorUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
}

async function translateWithFallback(text: string, source: string, target: string): Promise<{ translatedText: string; detectedLanguage: string | null }> {
  const payload = {
    q: text,
    source: source === "auto" ? "auto" : source,
    target,
    format: "text",
    alternatives: 0,
  };

  for (const mirror of LIBRE_TRANSLATE_MIRRORS) {
    try {
      const res = await fetchFromMirror(mirror, "/translate", payload);
      if (res.ok) {
        const data = await res.json() as { translatedText: string; detectedLanguage?: { language: string } };
        return {
          translatedText: data.translatedText,
          detectedLanguage: data.detectedLanguage?.language ?? null,
        };
      }
    } catch {
      // Try next mirror
    }
  }

  // Fallback: return a mock that signals the API is unreachable
  return {
    translatedText: `[Translation unavailable — API unreachable. Original: "${text}"]`,
    detectedLanguage: null,
  };
}

async function detectWithFallback(text: string): Promise<{ language: string; confidence: number }> {
  const payload = { q: text };

  for (const mirror of LIBRE_TRANSLATE_MIRRORS) {
    try {
      const res = await fetchFromMirror(mirror, "/detect", payload);
      if (res.ok) {
        const data = await res.json() as Array<{ language: string; confidence: number }>;
        if (Array.isArray(data) && data.length > 0) {
          return { language: data[0].language, confidence: data[0].confidence };
        }
      }
    } catch {
      // Try next mirror
    }
  }

  return { language: "en", confidence: 0.5 };
}

router.post("/translate", async (req, res): Promise<void> => {
  const parsed = TranslateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text, source, target } = parsed.data;
  const result = await translateWithFallback(text, source, target);

  res.json(
    TranslateResponse.parse({
      translatedText: result.translatedText,
      originalText: text,
      source,
      target,
      detectedLanguage: result.detectedLanguage,
    })
  );
});

router.post("/detect", async (req, res): Promise<void> => {
  const parsed = DetectLanguageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = await detectWithFallback(parsed.data.text);
  res.json(DetectLanguageResponse.parse(result));
});

export default router;
