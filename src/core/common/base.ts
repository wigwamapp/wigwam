export function toWordlistLang(localeCode: string) {
  return localeCode.replace(/-/g, "_").toLowerCase();
}

export function withError<T>(
  errMessage: string,
  factory: (getError: () => void) => T,
): T {
  const getError = (err?: unknown) => {
    if (err instanceof PublicError) {
      return err;
    } else {
      if (process.env.NODE_ENV !== "test" && err) {
        console.warn(errMessage, err);
      }

      return new PublicError(errMessage);
    }
  };

  try {
    const result = factory(getError);

    return result instanceof Promise
      ? (result as any).catch((err: unknown) => {
          throw getError(err);
        })
      : result;
  } catch (err) {
    throw getError(err);
  }
}

export class PublicError extends Error {
  name = "PublicError";
}
