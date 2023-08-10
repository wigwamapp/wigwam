// A wrapper over native `localStorage`
// Supports reactivity(subscribe to changes) between different views

export interface LocalStorageEventInit {
  key?: string;
}

export function get(key: string) {
  return localStorage.getItem(key);
}

export function put(key: string, value: string) {
  localStorage.setItem(key, value);
  notifySelf(key);
}

export function remove(key: string) {
  localStorage.removeItem(key);
  notifySelf(key);
}

export function clear() {
  localStorage.clear();
  notifySelf(null);
}

export function subscribe(
  key: string,
  callback: () => void,
  opts?: AddEventListenerOptions,
) {
  const handleChange = (evt: StorageEvent | CustomEvent<string | null>) => {
    const evtKey = evt instanceof StorageEvent ? evt.key : evt.detail;
    if (evtKey === key || evtKey === null) callback();
  };

  // this only works for other documents, not the current one
  window.addEventListener("storage", handleChange, opts);
  // this is a custom event, triggered in writeValueToLocalStorage
  window.addEventListener<any>("local-storage", handleChange, opts);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener<any>("local-storage", handleChange);
  };
}

function notifySelf(key: string | null) {
  // We dispatch a custom event for current document
  window.dispatchEvent(
    new CustomEvent<string | null>("local-storage", { detail: key }),
  );
}
