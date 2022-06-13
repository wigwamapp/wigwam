import { enUS, es, fr, it, ja, ko, uk, ru, zhCN, zhTW } from "date-fns/locale";

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
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "zh-CN", name: "Chinese Simplified", nativeName: "中文(简体)" },
  { code: "zh-TW", name: "Chinese Traditional", nativeName: "中文(繁體)" },
];

export const FALLBACK_LOCALE = DEFAULT_LOCALES[0];

type SeparatorType = "." | "," | " ";

export interface LocaleSeparators {
  code: string;
  thousands: SeparatorType;
  decimals: SeparatorType;
}

export const DEFAULT_LOCALES_SEPARATORS: LocaleSeparators[] = [
  { code: "en", thousands: ",", decimals: "." },
  { code: "es", thousands: ".", decimals: "," },
  { code: "fr", thousands: " ", decimals: "," },
  { code: "it", thousands: ".", decimals: "," },
  { code: "ja", thousands: ",", decimals: "." },
  { code: "ko", thousands: ",", decimals: "." },
  { code: "ru", thousands: " ", decimals: "," },
  { code: "uk", thousands: " ", decimals: "," },
  { code: "zh-CN", thousands: ",", decimals: "." },
  { code: "zh-TW", thousands: ",", decimals: "." },
];

export const FALLBACK_LOCALE_SEPARATORS = DEFAULT_LOCALES_SEPARATORS[0];

export const DEFAULT_LOCALES_FOR_DATES = [
  { code: "en", locale: enUS, format: "dd MMM, yyyy" },
  { code: "es", locale: es, format: "dd/mm/yyyy" },
  { code: "fr", locale: fr, format: "dd/mm/yyyy" },
  { code: "it", locale: it, format: "dd/mm/yyyy" },
  { code: "ja", locale: ja, format: "yyyy-m-d" }, //yyyy年mm月dd日
  { code: "ko", locale: ko, format: "yyyy-m-d" },
  { code: "uk", locale: uk, format: "dd.mm.yyyy" },
  { code: "ru", locale: ru, format: "dd.mm.yyyy" },
  { code: "zh-CN", locale: zhCN, format: "yyyy-m-d" },
  { code: "zh-TW", locale: zhTW, format: "yyyy-m-d" },
];

export const FALLBACK_LOCALES_FOR_DATES = DEFAULT_LOCALES_FOR_DATES[0];
