import { utf8ToBytes, zeroBuffer } from "./bytes";
import { toProtectedString } from "./protected";

export async function toProtectedPassword(password: string) {
  const passwordBuf = utf8ToBytes(password);
  const hash = await crypto.subtle.digest({ name: "SHA-256" }, passwordBuf);

  const protectedStr = toProtectedString(hash);
  zeroBuffer(passwordBuf);
  zeroBuffer(hash);

  return protectedStr;
}
