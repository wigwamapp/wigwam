import { storage } from "../storage";

export const LOCALE_KEY = "locale";

export function getSavedLocale() {
  return storage.fetchForce<string>(LOCALE_KEY);
}

export function saveLocale(locale: string) {
  return storage.put(LOCALE_KEY, locale);
}

export function onUpdated(callback: () => void) {
  return storage.subscribe<string>(LOCALE_KEY, callback);
}
