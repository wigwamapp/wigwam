import { underProfile } from "./profile";

export function get(key: string) {
  return localStorage.getItem(underProfile(key));
}

export function put(key: string, value: string) {
  localStorage.setItem(underProfile(key), value);
}

export function remove(key: string) {
  localStorage.removeItem(underProfile(key));
}

export function clear() {
  localStorage.clear();
}
