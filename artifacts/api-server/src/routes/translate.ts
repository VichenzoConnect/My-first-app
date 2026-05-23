import { Router, type IRouter } from "express";
import {
  TranslateBody,
  TranslateResponse,
  DetectLanguageBody,
  DetectLanguageResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

const LIBRE_MIRRORS = [
  "https://translate.argosopentech.com",
  "https://translate.fedilab.app",
  "https://translate.terraprint.co",
];

const LANG_NAME_MAP: Record<string, string> = {
  en: "English", fr: "French", es: "Spanish", pt: "Portuguese",
  de: "German", ar: "Arabic", zh: "Chinese", hi: "Hindi",
  ig: "Igbo", yo: "Yoruba", ha: "Hausa", uk: "Ukrainian", ru: "Russian",
};

async function translateMyMemory(
  text: string,
  source: string,
  target: string
): Promise<{ translatedText: string; detectedLanguage: string | null } | null> {
  try {
    const langpair = source === "auto" ? `autodetect|${target}` : `${source}|${target}`;
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json() as {
      responseStatus: number;
      responseData: { translatedText: string; detectedLanguage?: string };
    };
    if (data.responseStatus !== 200) return null;
    const translated = data.responseData?.translatedText;
    if (!translated) return null;
    return {
      translatedText: translated,
      detectedLanguage: source === "auto" ? (data.responseData.detectedLanguage ?? null) : null,
    };
  } catch {
    return null;
  }
}

async function translateLibre(
  text: string,
  source: string,
  target: string
): Promise<{ translatedText: string; detectedLanguage: string | null } | null> {
  const payload = { q: text, source: source === "auto" ? "auto" : source, target, format: "text" };
  for (const mirror of LIBRE_MIRRORS) {
    try {
      const res = await fetch(`${mirror}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(7000),
      });
      if (!res.ok) continue;
      const data = await res.json() as {
        translatedText: string;
        detectedLanguage?: { language: string };
      };
      if (!data.translatedText) continue;
      return {
        translatedText: data.translatedText,
        detectedLanguage: data.detectedLanguage?.language ?? null,
      };
    } catch {
      // try next
    }
  }
  return null;
}

async function translateWithFallback(
  text: string,
  source: string,
  target: string
): Promise<{ translatedText: string; detectedLanguage: string | null }> {
  let resolvedSource = source;
  let detectedLanguage: string | null = null;

  // When auto-detect is requested, detect the language first then translate
  if (source === "auto") {
    const detected = await detectLanguage(text);
    detectedLanguage = detected.language;
    resolvedSource = detected.language;
    // If detected is same as target, translate to English instead
    if (resolvedSource === target) {
      resolvedSource = target === "en" ? "fr" : "en";
    }
  }

  const myMemoryResult = await translateMyMemory(text, resolvedSource, target);
  if (myMemoryResult) {
    return { ...myMemoryResult, detectedLanguage };
  }

  const libreResult = await translateLibre(text, resolvedSource, target);
  if (libreResult) {
    return { ...libreResult, detectedLanguage };
  }

  const sourceName = LANG_NAME_MAP[resolvedSource] ?? resolvedSource;
  const targetName = LANG_NAME_MAP[target] ?? target;
  return {
    translatedText: `[Could not translate from ${sourceName} to ${targetName} — translation service temporarily unavailable. Please try again.]`,
    detectedLanguage,
  };
}

async function detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
  try {
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=autodetect|en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json() as { responseStatus: number; detectedLanguage?: string };
      if (data.responseStatus === 200 && data.detectedLanguage) {
        const lang = data.detectedLanguage.split("-")[0].toLowerCase();
        return { language: lang, confidence: 0.85 };
      }
    }
  } catch {
    // fallback below
  }

  for (const mirror of LIBRE_MIRRORS) {
    try {
      const res = await fetch(`${mirror}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text }),
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const data = await res.json() as Array<{ language: string; confidence: number }>;
      if (Array.isArray(data) && data.length > 0) {
        return { language: data[0].language, confidence: data[0].confidence };
      }
    } catch {
      // try next
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
  req.log.info({ source, target, textLen: text.length }, "Translation request");

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

  const result = await detectLanguage(parsed.data.text);
  res.json(DetectLanguageResponse.parse(result));
});

export default router;
