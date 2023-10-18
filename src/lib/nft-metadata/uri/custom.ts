import { IPFS_CLOUDFLARE_GATEWAY, IPFS_IO_GATEWAY } from "../defaults";

const NFT_METADATA_PROXY = process.env.WIGWAM_NFT_METADATA_PROXY;
const WHITELIST = [
  IPFS_CLOUDFLARE_GATEWAY,
  IPFS_IO_GATEWAY,
  "https://static.debank.com",
];
if (NFT_METADATA_PROXY) {
  WHITELIST.push(NFT_METADATA_PROXY);
}

export function sanitizeCustomUrl(customUrl: string) {
  if (!process.env.WIGWAM_NFT_METADATA_PROXY) {
    return customUrl;
  }

  if (WHITELIST.some((gw) => customUrl.startsWith(gw))) {
    return customUrl;
  }

  const url = new URL(process.env.WIGWAM_NFT_METADATA_PROXY);

  const { protocol, origin, pathname, search, hash } = new URL(customUrl);

  if (!protocol.startsWith("http")) return customUrl;

  Object.assign(url, { pathname, search, hash });

  url.searchParams.set("_xurl", origin);

  return url.toString();
}
