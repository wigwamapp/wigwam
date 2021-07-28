export function toWordlistLang(localeCode: string) {
  return localeCode.replace(/-/g, "_").toLowerCase();
}

export function formatURL(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

export async function withError<T>(
  errMessage: string,
  factory: (doThrow: () => void) => Promise<T>
) {
  try {
    return await factory(() => {
      throw new Error("<stub>");
    });
  } catch (err) {
    throw err instanceof PublicError ? err : new PublicError(errMessage);
  }
}

export class PublicError extends Error {
  name = "PublicError";
}
