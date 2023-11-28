import { wrapStaticUrl } from "lib/wigwam-static";

import { IPFS_CLOUDFLARE_GATEWAY, IPFS_IO_GATEWAY } from "../defaults";

const WHITELIST = new Set([
  IPFS_CLOUDFLARE_GATEWAY,
  IPFS_IO_GATEWAY,
  "https://nftassets.covalenthq.com",
]);

export function sanitizeCustomUrl(customUrl: string) {
  if (!customUrl.startsWith("http")) return customUrl;
  // Whitelisted
  if (WHITELIST.has(new URL(customUrl).origin)) return customUrl;

  return wrapStaticUrl(customUrl);
}
