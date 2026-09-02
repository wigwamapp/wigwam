import axios from "axios";
import browser from "webextension-polyfill";

/**
 * Public WalletConnect account data api (backed by Zerion).
 * Key-less for us, but every request must carry a project id.
 * @see https://docs.reown.com/cloud/blockchain-api
 */
const WC_API_URL = "https://rpc.walletconnect.org/v1";
const WC_PROJECT_ID = process.env.WIGWAM_WC_PROJECT_ID;
const SDK_VERSION = "4.1.9";
/**
 * Only the presence of `Origin` is checked, never its value, so the extension
 * origin of the running build is the most honest thing to send.
 */
const WC_ORIGIN = getExtensionOrigin() ?? "";

function getExtensionOrigin() {
  try {
    return browser.runtime.getURL("").replace(/\/$/, "") || null;
  } catch {
    return null;
  }
}

export const wcApi = axios.create({
  baseURL: WC_API_URL,
  timeout: 60_000,
  headers: {
    "x-sdk-version": SDK_VERSION,
    // `Origin` is a forbidden header name, so a browser drops this and decides
    // for itself. Set anyway: it costs nothing where it is ignored and unlocks
    // the balance endpoint where it is not. See `fetchWcAccountBalance`.
    Origin: WC_ORIGIN,
  },
});

/** Without a project id the api answers 401, so callers can skip early */
export function isWcApiEnabled() {
  return Boolean(WC_PROJECT_ID);
}

export function toWcChainId(chainId: number) {
  return `eip155:${chainId}`;
}

export async function fetchWcAccountHistory(
  address: string,
  { chainId, cursor }: { chainId?: number; cursor?: string } = {},
): Promise<WcHistoryPage> {
  const { data } = await wcApi.get<WcHistoryPage>(
    `/account/${address}/history`,
    {
      params: {
        projectId: WC_PROJECT_ID,
        currency: "usd",
        ...(chainId ? { chainId: toWcChainId(chainId) } : null),
        // Opaque base64 of [minedAt, id] of the last item of the previous page
        ...(cursor ? { cursor } : null),
      },
    },
  );

  return { data: data?.data ?? [], next: data?.next ?? null };
}

/**
 * Fungible balances of an account on a single chain.
 *
 * Two undocumented requirements, both degrade silently instead of erroring:
 * - `chainId` is mandatory, without it the provider answers 503
 * - an `Origin` header must be present, without it the answer is an empty
 *   list. Only its presence is checked, any value passes.
 *
 * Chrome MV3 is the catch: for a GET covered by `host_permissions` it strips
 * `Origin` and adds none of its own, and `declarativeNetRequest` may not set
 * it either. So an extension build can get an empty list here even though the
 * account holds funds. Callers must treat `[]` as "no data", never as
 * "no balance", and keep a fallback source.
 */
export async function fetchWcAccountBalance(
  address: string,
  chainId: number,
  { forceUpdate }: { forceUpdate?: boolean } = {},
): Promise<WcBalance[]> {
  const { data } = await wcApi.get<WcBalanceResponse>(
    `/account/${address}/balance`,
    {
      params: {
        projectId: WC_PROJECT_ID,
        currency: "usd",
        chainId: toWcChainId(chainId),
        ...(forceUpdate ? { forceUpdate: "true" } : null),
        sv: SDK_VERSION,
      },
    },
  );

  return data?.balances ?? [];
}

export type WcHistoryPage = {
  data: WcHistoryItem[];
  /** Cursor for the next page, `null` when the history is exhausted */
  next: string | null;
};

export type WcHistoryItem = {
  id: string;
  metadata: {
    operationType: "receive" | "send" | "execute" | (string & {});
    hash: string;
    /** ISO timestamp */
    minedAt: string;
    sentFrom: string;
    sentTo: string;
    status: "confirmed" | (string & {});
    nonce: number;
    application: { name: string; iconUrl?: string } | null;
    /** CAIP-2, e.g. `eip155:1` */
    chain: string;
  };
  transfers: WcTransfer[] | null;
};

export type WcTransfer = {
  /**
   * Carries no contract address, only display data.
   * @see the note in `activities/wc.ts` on why that limits matching
   */
  fungible_info: {
    name: string;
    symbol: string;
    icon?: { url: string };
  } | null;
  nft_info: { name: string; flags?: { is_spam?: boolean } } | null;
  direction: "in" | "out";
  /** Decimal string, already divided by the token decimals */
  quantity: { numeric: string };
  value: number | null;
  price: number | null;
};

export type WcBalanceResponse = { balances?: WcBalance[] };

export type WcBalance = {
  name: string;
  symbol: string;
  /** CAIP-2, e.g. `eip155:1` */
  chainId: string;
  /** CAIP-10, absent for the native coin — that is how it is recognised */
  address?: string;
  value?: number;
  price?: number;
  quantity: { decimals: string; numeric: string };
  iconUrl?: string;
};

/** `eip155:1:0xabc...` -> `0xabc...` */
export function parseWcAssetAddress(caip10: string | undefined) {
  if (!caip10) return null;

  const address = caip10.slice(caip10.lastIndexOf(":") + 1);

  return /^0x[0-9a-fA-F]{40}$/.test(address) ? address : null;
}
