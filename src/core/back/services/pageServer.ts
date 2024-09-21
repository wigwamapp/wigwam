import { Runtime } from "webextension-polyfill";
import { ethErrors } from "eth-rpc-errors";
import { liveQuery, Subscription } from "dexie";
import { livePromise } from "lib/system/livePromise";
import { isPhishingWebsite } from "lib/phishing-detect";
import { storage } from "lib/ext/storage";
import { PorterServer, MessageContext } from "lib/ext/porter/server";

import { INITIAL_NETWORK } from "fixtures/networks";
import { DEFAULT_WEB_METAMASK_COMPATIBLE } from "fixtures/settings";
import {
  PorterChannel,
  JsonRpcResponse,
  JsonRpcRequest,
  ActivitySource,
  Permission,
  CHAIN_ID,
  ACCOUNT_ADDRESS,
  ActivityType,
  MetaMaskCompatibleMode,
} from "core/types";
import * as repo from "core/repo";
import { Setting } from "core/common";
import {
  JSONRPC,
  WIGWAM_FAVICON,
  WIGWAM_PHISHING_WARNING,
  WIGWAM_STATE,
} from "core/common/rpc";
import { getPageOrigin, wrapPermission } from "core/common/permissions";

import {
  $accountAddresses,
  $approvals,
  $walletStatus,
  approvalResolved,
  ensureInited,
  isUnlocked,
} from "../state";
import { handleRpc } from "../rpc";

type InternalStateType = "walletStatus" | "chainId" | "accountAddress";

export function startPageServer() {
  const pagePorter = new PorterServer<any>(PorterChannel.Page);

  pagePorter.onMessage(handlePageRequest);

  const permissionSubs = new Map<Runtime.Port, Subscription>();
  const internalStateSubs = new Map<
    Runtime.Port,
    (type: InternalStateType) => void
  >();

  pagePorter.onConnection(async (action, port) => {
    if (!port.sender?.url) return;

    const { origin, hostname } = new URL(port.sender.url);
    if (!origin) return;

    checkForPhishing(hostname, () => {
      pagePorter.notify(port, {
        jsonrpc: JSONRPC,
        method: WIGWAM_PHISHING_WARNING,
      });
    });

    await ensureInited();

    if (action === "connect") {
      // Obtain current permission
      let currentPermission = await repo.permissions.get(origin);
      notifyPermission(port, currentPermission);

      // Subscribe to permission updates
      const sub = liveQuery(() => repo.permissions.get(origin)).subscribe(
        (perm) => {
          currentPermission = perm;
          notifyPermission(port, perm);
        },
      );
      permissionSubs.set(port, sub);

      // Subscribe to internal wallet state updates
      internalStateSubs.set(port, (type) => {
        const perm = currentPermission;

        switch (type) {
          case "walletStatus":
            notifyPermission(port, perm);
            resolveConnectionApproval(perm);
            break;

          case "chainId":
            if (!perm) notifyPermission(port);
            break;

          case "accountAddress":
            if (perm) notifyPermission(port, perm);
            break;
          default:
            break;
        }
      });
    } else {
      // Disconnect -> Clean up
      const permSub = permissionSubs.get(port);
      if (permSub) {
        permSub.unsubscribe();
        permissionSubs.delete(port);
      }

      internalStateSubs.delete(port);
    }
  });

  const handleInternalStateUpdated = (type: InternalStateType) => {
    for (const notify of internalStateSubs.values()) {
      notify(type);
    }
  };

  $walletStatus.watch(() => handleInternalStateUpdated("walletStatus"));
  subscribeInternalChainId(() => handleInternalStateUpdated("chainId"));
  subscribeAccountAddress(() => handleInternalStateUpdated("accountAddress"));

  const notifyPermission = async (port: Runtime.Port, perm?: Permission) => {
    let params;

    const metamaskMode = await loadMetaMaskCompatibleMode();

    if (isUnlocked() && perm) {
      const internalAccountAddress = await loadAccountAddress();

      let accountAddress;

      if (perm.accountAddresses.includes(internalAccountAddress)) {
        accountAddress = internalAccountAddress;
      } else {
        accountAddress = null;
      }

      params = {
        chainId: perm.chainId,
        accountAddress: accountAddress?.toLowerCase(),
        mmCompatible: metamaskMode,
      };
    } else {
      params = {
        chainId: perm?.chainId ?? (await loadInternalChainId()),
        accountAddress: null,
        mmCompatible: metamaskMode,
      };
    }

    pagePorter.notify(port, {
      jsonrpc: JSONRPC,
      method: WIGWAM_STATE,
      params,
    });
  };
}

const faviconCache = new Map<string, string>();

async function handlePageRequest(
  ctx: MessageContext<JsonRpcRequest, JsonRpcResponse>,
) {
  console.debug("New page request", ctx);

  const { id, jsonrpc, method, params } = ctx.data;

  if (method === WIGWAM_FAVICON) {
    if (Array.isArray(params) && typeof params[0] === "string") {
      faviconCache.set(ctx.portId, params[0]);
    }

    return;
  }

  try {
    await ensureInited();

    const senderUrl = ctx.port?.sender?.url;
    if (!senderUrl) {
      throw ethErrors.rpc.resourceNotFound();
    }

    const source: ActivitySource = {
      type: "page",
      url: senderUrl,
      tabId: ctx.port.sender?.tab?.id,
      favIconUrl:
        faviconCache.get(ctx.portId) || ctx.port.sender?.tab?.favIconUrl,
    };

    const chainId = await loadInternalChainId();

    handleRpc(ctx, source, chainId, method, (params as any[]) ?? []);
  } catch (err) {
    console.error(err);

    ctx.reply({
      id,
      jsonrpc,
      error: ethErrors.rpc.internal(),
    });
  }
}

async function resolveConnectionApproval(perm?: Permission) {
  if (!(isUnlocked() && perm && perm.accountAddresses.length > 0)) return;

  try {
    for (const approval of $approvals.getState()) {
      if (
        approval.type === ActivityType.Connection &&
        getPageOrigin(approval.source) === perm.origin
      ) {
        const result = approval.returnSelectedAccount
          ? perm.accountAddresses
          : [wrapPermission(perm)];

        approval.rpcCtx?.reply({ result });
        approvalResolved(approval.id);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

const loadMetaMaskCompatibleMode = livePromise(
  () =>
    storage
      .fetch<MetaMaskCompatibleMode>(Setting.Web3MetaMaskCompatible)
      .catch(() => DEFAULT_WEB_METAMASK_COMPATIBLE),
  (callback) =>
    storage.subscribe<MetaMaskCompatibleMode>(
      Setting.Web3MetaMaskCompatible,
      ({ newValue }) => callback(newValue ?? DEFAULT_WEB_METAMASK_COMPATIBLE),
    ),
);

const loadInternalChainId = livePromise(
  () => storage.fetch<number>(CHAIN_ID).catch(() => INITIAL_NETWORK.chainId),
  subscribeInternalChainId,
);

function subscribeInternalChainId(callback: (chainId: number) => void) {
  return storage.subscribe<number>(CHAIN_ID, ({ newValue }) =>
    callback(newValue ?? INITIAL_NETWORK.chainId),
  );
}

const loadAccountAddress = livePromise(
  () => storage.fetch<string>(ACCOUNT_ADDRESS).catch(getDefaultAccountAddress),
  subscribeAccountAddress,
);

function subscribeAccountAddress(callback: (address: string) => void) {
  return storage.subscribe<string>(ACCOUNT_ADDRESS, ({ newValue }) =>
    callback(newValue ?? getDefaultAccountAddress()),
  );
}

function getDefaultAccountAddress() {
  return $accountAddresses.getState()[0];
}

async function checkForPhishing(hostname: string, callback: () => void) {
  const phishing = await isPhishingWebsite(hostname);

  // TODO: Add checker - is user already allowed this website

  if (phishing) {
    callback();
  }
}
