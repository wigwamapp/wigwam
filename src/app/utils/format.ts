export function formatSeedPhrase(value?: string) {
  return replaceSpacesWith(value, " ").trim();
}

export function formatPrivateKey(value?: string) {
  return replaceSpacesWith(value).trim();
}

function replaceSpacesWith(value?: string, replaceWith = "") {
  return value
    ? value.replace(/\s\s+/g, replaceWith).replace(/\n/g, replaceWith)
    : "";
}
