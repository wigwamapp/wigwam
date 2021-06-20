export interface LocaleMeta {
  code: string;
  name: string;
  nativeName: string;
}

export const DEFAULT_LOCALES: LocaleMeta[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська мова" },
  { code: "zh-CN", name: "Chinese Simplified", nativeName: "中文(简体)" },
  { code: "zh-TW", name: "Chinese Traditional", nativeName: "中文(繁體)" },
];
