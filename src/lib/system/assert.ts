export function assert(
  condition: any,
  msg?: string,
  ErrorClass: any = AssertionError,
): asserts condition {
  if (!condition) {
    throw new ErrorClass(msg ?? `${condition} == true`);
  }
}

export class AssertionError extends Error {
  name = "AssertionError";
}
