import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import { fr } from "date-fns/locale/fr";
import { it } from "date-fns/locale/it";
import { ja } from "date-fns/locale/ja";
import { ko } from "date-fns/locale/ko";
import { ru } from "date-fns/locale/ru";
import { uk } from "date-fns/locale/uk";
import { zhCN } from "date-fns/locale/zh-CN";
import { zhTW } from "date-fns/locale/zh-TW";

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
