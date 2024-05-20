import browser from "webextension-polyfill";

import { FetchedLocaleMessages, LocaleMessages, Substitutions } from "./types";
import { areLocalesEqual, processTemplate, toList } from "./helpers";
import { getSavedLocale, saveLocale } from "./persisting";

const nativeSupported = "getMessage" in browser.i18n;

let fetchedLocaleMessages: FetchedLocaleMessages = {
  target: null,
  fallback: null,
};

export async function init() {
  const refetched: FetchedLocaleMessages = {
    target: null,
    fallback: null,
  };

  const saved = await getSavedLocale();
  const native = getNativeLocale();
  const fallback = getDefaultLocale();
  const target = saved || native || fallback;

  if (!nativeSupported || (saved && !areLocalesEqual(saved, native!))) {
    const promises: Promise<void>[] = [];

    promises.push(
      fetchLocaleMessages(target).then((messages) => {
        refetched.target = messages;
      }),
    );

    if (target !== fallback) {
      promises.push(
        fetchLocaleMessages(fallback).then((messages) => {
          refetched.fallback = messages;
        }),
      );
    }

    await Promise.all(promises);
  }

  fetchedLocaleMessages = refetched;
}

export function t(messageName: string, substitutions?: Substitutions) {
  const val =
    fetchedLocaleMessages.target?.[messageName] ??
    fetchedLocaleMessages.fallback?.[messageName];

  if (!val) {
    return (
      browser.i18n.getMessage?.(messageName, substitutions) ||
      `Translated<${messageName}>`
    );
  }

  try {
    if (val.placeholders) {
      const params = toList(substitutions).reduce((prms, sub, i) => {
        const pKey = val.placeholderList?.[i] ?? i;
        return pKey ? { ...prms, [pKey]: sub } : prms;
      }, {});

      return processTemplate(val.message, params);
    }

    return val.message;
  } catch (err) {
    console.error(err);

    return `Translated<${messageName}>`;
  }
}

// TODO: Move this logic directly to replaceT function
const REPLACE_T_WHITELIST = ["{{profile}}", "{{wallet}}"];

export function replaceT(str: string) {
  return str.replace(
    /{{(.*?)}}/g,
    (substr, key) => (REPLACE_T_WHITELIST.includes(substr) && t(key)) || substr,
  );
}

export async function getLocale() {
  const saved = await getSavedLocale();
  return saved || getNativeLocale() || getDefaultLocale();
}

export function setLocale(locale: string) {
  return saveLocale(locale);
}

export function getNativeLocale(): string | undefined {
  return browser.i18n.getUILanguage?.();
}

export function getDefaultLocale(): string {
  const manifest = browser.runtime.getManifest?.();
  return manifest?.default_locale || "en";
}

export async function fetchLocaleMessages(locale: string) {
  const dirName = locale.replace("-", "_");
  const url = browser.runtime.getURL(`_locales/${dirName}/messages.json`);

  try {
    const res = await fetch(url);
    const messages: LocaleMessages = await res.json();

    appendPlaceholderLists(messages);
    return messages;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function appendPlaceholderLists(messages: LocaleMessages) {
  for (const name in messages) {
    const val = messages[name];
    if (val.placeholders) {
      val.placeholderList = [];
      for (const pKey in val.placeholders) {
        const { content } = val.placeholders[pKey] as { content: string };
        const index = +content.substring(1) - 1;
        val.placeholderList[index] = pKey;
      }
    }
  }
}
