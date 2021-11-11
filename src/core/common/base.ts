export function toWordlistLang(localeCode: string) {
  return localeCode.replace(/-/g, "_").toLowerCase();
}

export async function withError<T>(
  errMessage: string,
  factory: (doThrow: () => void) => Promise<T>
) {
  try {
    return await factory(() => {
      throw new PublicError(errMessage);
    });
  } catch (err) {
    const isPublic = err instanceof PublicError;
    if (!isPublic) console.error(err);
    throw isPublic ? err : new PublicError(errMessage);
  }
}

export class PublicError extends Error {
  name = "PublicError";
}
