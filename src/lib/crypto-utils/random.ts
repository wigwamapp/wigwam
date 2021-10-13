export function getRandomBytes(byteCount = 32) {
  const view = new Uint8Array(byteCount);
  crypto.getRandomValues(view);
  return view;
}
