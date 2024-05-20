export function forEachSafe<T>(
  iterable: Iterable<T>,
  handle: (value: T) => void,
) {
  for (const value of iterable) {
    try {
      handle(value);
    } catch {}
  }
}
