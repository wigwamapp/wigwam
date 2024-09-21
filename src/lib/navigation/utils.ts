import type { MouseEvent } from "react";

import { Destination } from "./types";

export function toHash(
  dest: Destination,
  merge?: boolean | string[],
  currentUsp?: URLSearchParams,
) {
  dest =
    typeof dest === "function"
      ? dest(
          Object.fromEntries(
            Array.from(currentUsp ?? getHashSearchParams()).map(
              ([key, value]) => [key, deserialize(value)],
            ),
          ),
        )
      : dest;

  let usp;

  if (merge) {
    const current = currentUsp ?? getHashSearchParams();

    if (Array.isArray(merge)) {
      usp = new URLSearchParams();

      for (const key of merge) {
        const value = current.get(key);
        if (value) usp.set(key, value);
      }
    } else {
      usp = current;
    }
  } else {
    usp = new URLSearchParams();
  }

  for (const [key, value] of Object.entries(dest)) {
    usp.set(key, serialize(value));
  }

  return usp.toString();
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
  return typeof val === "string" ? val : JSON.stringify(val);
}

export function deserialize<T = any>(str: string): T {
  try {
    return JSON.parse(str);
  } catch {
    return str as any;
  }
}
