export function fetch(key: string) {
  localStorage.getItem(key);
}

export function put(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function remove(key: string) {
  localStorage.removeItem(key);
}

export function clear() {
  localStorage.clear();
}
