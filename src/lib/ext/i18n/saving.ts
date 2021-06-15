import * as Global from "../global";

export const LOCALE_GKEY = "locale";

export function getSavedLocale() {
  return Global.get(LOCALE_GKEY);
}

export function saveLocale(locale: string) {
  return Global.put(LOCALE_GKEY, locale);
}
