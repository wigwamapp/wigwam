import { enUS, es, fr, it, ja, ko, ru, uk, zhCN, zhTW } from "date-fns/locale";

export const DEFAULT_LOCALES_FOR_DATES = [
  { code: "en", locale: enUS },
  { code: "es", locale: es },
  { code: "fr", locale: fr },
  { code: "it", locale: it },
  { code: "ja", locale: ja },
  { code: "ko", locale: ko },
  { code: "uk", locale: uk },
  { code: "ru", locale: ru },
  { code: "zh-CN", locale: zhCN },
  { code: "zh-TW", locale: zhTW },
];

export const FALLBACK_LOCALES_FOR_DATES = DEFAULT_LOCALES_FOR_DATES[0];
