export function formatSeedPhrase(value?: string) {
  return replaceSpacesWith(value, " ");
}

export function formatPrivateKey(value?: string) {
  return replaceSpacesWith(value);
}

function replaceSpacesWith(value?: string, replaceWith = "") {
  return value
    ? value.replace(/\s\s+/g, replaceWith).replace(/\n/g, replaceWith)
    : "";
}
