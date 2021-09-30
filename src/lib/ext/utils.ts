import browser from "webextension-polyfill";

export function getMainURL(path = "") {
  return browser.runtime.getURL(`main.html${path ?? ""}`);
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
