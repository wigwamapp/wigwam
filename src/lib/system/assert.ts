export function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg ?? `${condition} == true`);
  }
}

export class AssertionError extends Error {
  name = "AssertionError";
}
