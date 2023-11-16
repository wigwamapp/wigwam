import { joinPath } from "lib/system/url";

const staticBaseUrl = process.env.WIGWAM_STATIC_CDN;

export function wrapStaticUrl(originUrl: string) {
  if (!staticBaseUrl) return originUrl;

  const url = new URL(staticBaseUrl);

  // Already wrapped
  if (new URL(originUrl).origin === url.origin) return originUrl;

  url.pathname = originUrl;

  return url.toString();
}

export function getERC20IconUrl(chainId: number, tokenAddress: string) {
  if (!staticBaseUrl) return null;

  return joinPath(staticBaseUrl, `token-icons/${chainId}/${tokenAddress}.png`);
}
