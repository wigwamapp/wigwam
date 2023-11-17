import { wrapStaticUrl } from "lib/wigwam-static";

import { IPFS_CLOUDFLARE_GATEWAY, IPFS_IO_GATEWAY } from "../defaults";

const WHITELIST = new Set([
  IPFS_CLOUDFLARE_GATEWAY,
  IPFS_IO_GATEWAY,
  "https://nftassets.covalenthq.com",
]);

export function sanitizeCustomUrl(customUrl: string) {
  const url = new URL(customUrl);

  // Whitelisted
  if (WHITELIST.has(url.origin)) return customUrl;

  if (!url.protocol.startsWith("http")) return customUrl;

  return wrapStaticUrl(customUrl);
}
