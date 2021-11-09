import browser from "webextension-polyfill";

export const getPublicURL = browser.runtime.getURL;

export function getMainURL(path = "") {
  return getPublicURL(`main.html${path}`);
}

export function getItemSafe<T = any>(key: string, opts = { serealize: true }) {
  try {
    const value = localStorage.getItem(key);
    if (value) {
      return (opts.serealize ? JSON.parse(value) : value) as T;
    }
  } catch {}

  return null;
}
