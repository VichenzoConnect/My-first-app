export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'de', name: 'German' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ig', name: 'Igbo' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'ha', name: 'Hausa' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ru', name: 'Russian' }
];

export const getLanguageName = (code: string) => {
  if (code === 'auto') return 'Auto Detect';
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code;
};
