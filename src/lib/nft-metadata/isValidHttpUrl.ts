export function isValidHttpUrl(uri: string) {
  try {
    const url = new URL(uri);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
