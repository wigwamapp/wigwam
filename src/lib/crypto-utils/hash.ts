import { Buffer } from "buffer";
import { utils } from "ethers";

export function getPasswordHash(password: string) {
  return utils.ripemd160(utils.sha256(Buffer.from(password, "utf8"))).slice(2);
}
