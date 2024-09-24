export function isValidHttpsUrl(uri: string) {
  try {
    const url = new URL(uri);

    return url.protocol === "https:";
  } catch {
    return false;
  }
}
