export function toWordlistLang(localeCode: string) {
  return localeCode.replace(/-/g, "_").toLowerCase();
}

export async function withError<T>(
  errMessage: string,
  factory: (doThrow: () => void) => Promise<T>
) {
  try {
    const doThrow = () => {
      throw new PublicError(errMessage);
    };

    return await factory(doThrow);
  } catch (err) {
    if (err instanceof PublicError) {
      throw err;
    } else {
      console.warn(errMessage, err);
      throw new PublicError(errMessage);
    }
  }
}

export class PublicError extends Error {
  name = "PublicError";
}
