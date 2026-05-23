import { Router, type IRouter } from "express";
import { GetPhraseOfDayResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const PHRASES = [
  {
    phrase: "Bonjour le monde",
    translation: "Hello world",
    sourceLanguage: "fr",
    targetLanguage: "en",
    pronunciationHint: "bohn-ZHOOR luh MOHND",
    funFact: "French is spoken by over 300 million people across 5 continents!",
  },
  {
    phrase: "La vida es bella",
    translation: "Life is beautiful",
    sourceLanguage: "es",
    targetLanguage: "en",
    pronunciationHint: "lah VEE-dah ehs BEH-yah",
    funFact: "Spanish is the second most spoken language in the world by native speakers.",
  },
  {
    phrase: "一期一会",
    translation: "Once in a lifetime encounter",
    sourceLanguage: "zh",
    targetLanguage: "en",
    pronunciationHint: "yī qī yī huì",
    funFact: "This Japanese (originally Chinese) phrase captures the beauty of cherishing each moment.",
  },
  {
    phrase: "Hakuna Matata",
    translation: "No worries",
    sourceLanguage: "sw",
    targetLanguage: "en",
    pronunciationHint: "hah-KOO-nah mah-TAH-tah",
    funFact: "This Swahili phrase became famous worldwide through The Lion King!",
  },
  {
    phrase: "Carpe Diem",
    translation: "Seize the day",
    sourceLanguage: "la",
    targetLanguage: "en",
    pronunciationHint: "KAR-pay DEE-em",
    funFact: "This Latin phrase from the poet Horace has inspired people for over 2,000 years.",
  },
  {
    phrase: "Amor vincit omnia",
    translation: "Love conquers all",
    sourceLanguage: "la",
    targetLanguage: "en",
    pronunciationHint: "AH-mor WIN-kit OM-nee-ah",
    funFact: "This ancient Latin phrase by Virgil still appears in art and literature worldwide.",
  },
  {
    phrase: "Ich liebe dich",
    translation: "I love you",
    sourceLanguage: "de",
    targetLanguage: "en",
    pronunciationHint: "ikh LEE-buh dikh",
    funFact: "German has over 30 different words for different kinds of love!",
  },
  {
    phrase: "Ndi onye ọchịchọ ọchịchọ",
    translation: "I am a seeker of knowledge",
    sourceLanguage: "ig",
    targetLanguage: "en",
    pronunciationHint: "n-dee ohn-yeh oh-chee-choh",
    funFact: "Igbo is spoken by over 45 million people predominantly in southeastern Nigeria.",
  },
  {
    phrase: "E jẹ ká ṣe rere",
    translation: "Let us do good",
    sourceLanguage: "yo",
    targetLanguage: "en",
    pronunciationHint: "eh jeh kah sheh reh-reh",
    funFact: "Yoruba is a tonal language — the same word can mean different things with different tones!",
  },
  {
    phrase: "Duniya ta yi kyau",
    translation: "The world is beautiful",
    sourceLanguage: "ha",
    targetLanguage: "en",
    pronunciationHint: "doo-nee-yah tah yee kyau",
    funFact: "Hausa is one of the most widely spoken languages in West Africa with over 70 million speakers.",
  },
  {
    phrase: "Ти гарний",
    translation: "You are beautiful",
    sourceLanguage: "uk",
    targetLanguage: "en",
    pronunciationHint: "tee HAR-nyy",
    funFact: "Ukrainian is one of the oldest Slavic languages with roots going back over 1,000 years.",
  },
  {
    phrase: "Мир прекрасен",
    translation: "The world is beautiful",
    sourceLanguage: "ru",
    targetLanguage: "en",
    pronunciationHint: "meer preh-KRAS-en",
    funFact: "Russian is written in the Cyrillic alphabet, which was created in the 9th century.",
  },
  {
    phrase: "आपसे मिलकर खुशी हुई",
    translation: "Nice to meet you",
    sourceLanguage: "hi",
    targetLanguage: "en",
    pronunciationHint: "aap-se mil-kar khu-shee hu-ee",
    funFact: "Hindi is written in the Devanagari script and is spoken by over 600 million people!",
  },
];

router.get("/phrase-of-day", async (req, res): Promise<void> => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const phrase = PHRASES[dayOfYear % PHRASES.length];

  res.json(GetPhraseOfDayResponse.parse(phrase));
});

export default router;
