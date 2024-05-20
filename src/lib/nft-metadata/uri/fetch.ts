import axios, { AxiosRequestConfig } from "axios";
import retry from "async-retry";
import { isValidHttpUrl } from "lib/nft-metadata/isValidHttpUrl";

import { IPFS_CLOUDFLARE_GATEWAY, IPFS_IO_GATEWAY } from "../defaults";
import { sanitizeUrl } from "../utils";

import { getIPFSUrl, isIPFS } from "./ipfs";
import { getARWeaveURI, isArweave } from "./arweave";

export function forceHttps(source: string) {
  return source.replace("http://", "https://");
}

export function parseDataUri(uri: string) {
  const commaIndex = uri.indexOf(",");
  if (commaIndex === -1) {
    return undefined;
  }

  const mimeData = uri.substr(0, commaIndex + 1).match(/^data:([^;,]+)(.+)$/);

  if (!mimeData || !mimeData[1]) {
    return undefined;
  }
  const data = uri.substr(commaIndex + 1);
  let body = data;
  if (mimeData.length > 2 && mimeData[2]?.includes("base64")) {
    body = Buffer.from(data, "base64").toString("utf-8");
  } else if (body.includes("%")) {
    try {
      body = decodeURIComponent(body);
    } catch {
      // no-op
    }
  }
  return {
    body,
    mime: mimeData[1],
  };
}

export type FetchOptions = AxiosRequestConfig;

export async function fetchWithTimeout(
  resource: string,
  options: FetchOptions = {},
) {
  const httpsUrl = forceHttps(resource);
  return axios.get(httpsUrl, {
    timeout: options.timeout,
  });
}

export async function fetchWithRetriesAndTimeout(
  resource: string,
  options: FetchOptions = {},
  maxRetries = 1,
) {
  const method = options.method || "get";

  try {
    const response = await retry(
      () =>
        axios(sanitizeUrl(resource), {
          timeout: options.timeout,
          method: method,
        }),
      { retries: maxRetries },
    );

    return response;
  } catch (err: any) {
    const errMsg = `Exhausted retries attempting to fetch ${resource} with error: ${err?.message}`;
    throw new Error(errMsg);
  }
}

export async function fetchARWeaveWithTimeout(
  uri: string,
  options: FetchOptions,
) {
  const tokenURL = getARWeaveURI(uri);
  return fetchWithRetriesAndTimeout(tokenURL, options);
}

export async function fetchIPFSWithTimeout(
  uri: string,
  options: FetchOptions,
  gateway: string,
) {
  const tokenURL = getIPFSUrl(uri, gateway);
  return fetchWithRetriesAndTimeout(tokenURL, options);
}

async function multiAttemptIPFSFetch(
  uri: string,
  options: FetchOptions,
  ipfsGateway?: string,
  ipfsFallbackGatewayUrl?: string,
) {
  if (isValidHttpUrl(uri)) {
    try {
      const resp = await fetchWithRetriesAndTimeout(uri, options);
      return resp;
    } catch (err) {
      console.warn("Failed on https fetch", err);
    }
  }

  try {
    return await fetchIPFSWithTimeout(
      uri,
      options,
      ipfsGateway || IPFS_IO_GATEWAY,
    );
  } catch (err) {
    console.warn("Failed on initial fetch", err);

    if (ipfsGateway) {
      return await fetchIPFSWithTimeout(
        uri,
        options,
        ipfsFallbackGatewayUrl || IPFS_CLOUDFLARE_GATEWAY,
      );
    } else {
      throw err;
    }
  }
}

export async function fetchURI(
  uri: string,
  options: FetchOptions,
  ipfsGateway?: string,
  ipfsFallbackGatewayUrl?: string,
) {
  if (isArweave(uri)) {
    const resp = await fetchARWeaveWithTimeout(uri, options);
    return resp?.data;
  }
  if (isIPFS(uri)) {
    const resp = await multiAttemptIPFSFetch(
      uri,
      options,
      ipfsGateway,
      ipfsFallbackGatewayUrl,
    );
    return resp?.data;
  }

  if (isValidHttpUrl(uri)) {
    const resp = await fetchWithRetriesAndTimeout(uri, options);
    return resp?.data;
  }

  const inlineJsonBody = parseDataUri(uri);
  if (inlineJsonBody && inlineJsonBody.mime.startsWith("application/json")) {
    return JSON.parse(inlineJsonBody.body);
  }

  return;
}

export async function fetchMimeType(
  uri: string,
  { timeout }: FetchOptions = {},
  defaultType?: string,
): Promise<string | undefined> {
  if (uri.startsWith("data:")) {
    const parsedUri = parseDataUri(uri);
    if (parsedUri) {
      return parsedUri.mime;
    }
    throw new Error("Cannot parse data uri");
  }
  // TODO(iain): Change include to endsWith
  if (uri.includes(".jpeg") || uri.includes(".jpg")) {
    return "image/jpeg";
  }
  if (uri.includes(".png")) {
    return "image/png";
  }
  try {
    const resp = await fetchWithRetriesAndTimeout(uri, {
      method: "HEAD",
      timeout,
    });

    return resp.headers["content-type"] || undefined;
  } catch (e: any) {
    console.warn(
      `Failed to fetch mimetype for uri: ${uri} because: ${
        e?.message || "Unknown Error occurred"
      }`,
    );
    return defaultType;
  }
}
