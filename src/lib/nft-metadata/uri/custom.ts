import { IPFS_CLOUDFLARE_GATEWAY, IPFS_IO_GATEWAY } from "../defaults";

const WHITELIST = [
  IPFS_CLOUDFLARE_GATEWAY,
  IPFS_IO_GATEWAY,
  "https://static.debank.com",
];

export function sanitizeCustomUrl(customUrl: string) {
  if (!process.env.VIGVAM_NFT_METADATA_PROXY) {
    return customUrl;
  }

  if (WHITELIST.some((gw) => customUrl.startsWith(gw))) {
    return customUrl;
  }

  const url = new URL(process.env.VIGVAM_NFT_METADATA_PROXY);

  const { origin, pathname, search, hash } = new URL(customUrl);
  Object.assign(url, { pathname, search, hash });

  url.searchParams.set("_xurl", origin);

  return url.toString();
}
