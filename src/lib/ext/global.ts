import { getItemSafe } from "./utils";
import { underProfile } from "./profile";

export interface LocalStorageEventInit {
  key?: string;
}

export function get<T = any>(key: string) {
  return getItemSafe<T>(underProfile(key));
}

export function put(key: string, value: any) {
  localStorage.setItem(underProfile(key), JSON.stringify(value));
  notifySelf(key);
}

export function remove(key: string) {
  localStorage.removeItem(underProfile(key));
}

export function clear() {
  localStorage.clear();
  notifySelf(null);
}

export function subscribe(key: string, callback: () => void) {
  const handleChange = (evt: StorageEvent | CustomEvent<string | null>) => {
    const evtKey = evt instanceof StorageEvent ? evt.key : evt.detail;
    if (evtKey === key || evtKey === null) callback();
  };

  // this only works for other documents, not the current one
  window.addEventListener("storage", handleChange);
  // this is a custom event, triggered in writeValueToLocalStorage
  window.addEventListener<any>("local-storage", handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener<any>("local-storage", handleChange);
  };
}

function notifySelf(key: string | null) {
  // We dispatch a custom event for current document
  window.dispatchEvent(
    new CustomEvent<string | null>("local-storage", { detail: key })
  );
}
