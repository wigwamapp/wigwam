import { Destination } from "./types";

export function toHash(dest: Destination) {
  dest =
    typeof dest === "function"
      ? dest(
          Object.fromEntries(
            Array.from(getHashSearchParams()).map(([key, value]) => [
              key,
              deserialize(value),
            ])
          )
        )
      : dest;

  return new URLSearchParams(
    Object.entries(dest).map(([key, value]) => [key, serialize(value)])
  ).toString();
}

export function toURL(hash: string) {
  const { pathname, search } = location;
  return `${pathname}${search}${hash && `#${hash}`}`;
}

export function getHashSearchParams() {
  return new URLSearchParams(location.hash.slice(1));
}

export function isModifiedEvent(event: MouseEvent) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export function serialize<T>(val: T) {
  return JSON.stringify(val);
}

export function deserialize<T = any>(str: string): T {
  return JSON.parse(str);
}
