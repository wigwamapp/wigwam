import { Runtime } from "webextension-polyfill";
import { ethErrors } from "eth-rpc-errors";
import { liveQuery, Subscription } from "dexie";
import { livePromise } from "lib/system/livePromise";
import { storage } from "lib/ext/storage";
import { PorterServer, MessageContext } from "lib/ext/porter/server";

import { INITIAL_NETWORK } from "fixtures/networks";
import {
  PorterChannel,
  JsonRpcResponse,
  JsonRpcRequest,
  ActivitySource,
  Permission,
  CHAIN_ID,
  ACCOUNT_ADDRESS,
} from "core/types";
import * as repo from "core/repo";
import { JSONRPC, VIGVAM_STATE } from "core/common/rpc";

import { $accountAddresses, ensureInited } from "../state";
import { handleRpc } from "../rpc";

export function startPageServer() {
  const pagePorter = new PorterServer<any>(PorterChannel.Page);

  pagePorter.onMessage(handlePageRequest);

  const permissionSubs = new Map<Runtime.Port, Subscription>();
  const accountAddressSubs = new Map<Runtime.Port, () => void>();

  pagePorter.onConnection(async (action, port) => {
    if (!port.sender?.url) return;

    const { origin } = new URL(port.sender.url);
    if (!origin) return;

    await ensureInited();

    if (action === "connect") {
      const notifyPermission = async (perm?: Permission) => {
        let params;

        if (perm) {
          const internalAccountAddress = await loadAccountAddress();

          let accountAddress;

          if (perm.accountAddresses.includes(internalAccountAddress)) {
            accountAddress = internalAccountAddress;
          } else {
            const allAccountAddresses = $accountAddresses.getState();

            accountAddress =
              perm.accountAddresses.find((address) =>
                allAccountAddresses.includes(address)
              ) ?? null;
          }

          params = {
            chainId: perm.chainId,
            accountAddress,
          };
        } else {
          const internalChainId = await loadInternalChainId();

          params = {
            chainId: internalChainId,
            accountAddress: null,
          };
        }

        pagePorter.notify(port, {
          jsonrpc: JSONRPC,
          method: VIGVAM_STATE,
          params,
        });
      };

      const permission = await repo.permissions.get(origin);
      notifyPermission(permission);

      const sub = liveQuery(() => repo.permissions.get(origin)).subscribe(
        notifyPermission
      );

      permissionSubs.set(port, sub);

      accountAddressSubs.set(port, () =>
        repo.permissions
          .get(origin)
          .then((p) => p && notifyPermission(p))
          .catch(console.error)
      );
    } else {
      const permSub = permissionSubs.get(port);
      if (permSub) {
        permSub.unsubscribe();
        permissionSubs.delete(port);
      }

      accountAddressSubs.delete(port);
    }
  });

  subscribeAccountAddress(() => {
    for (const notify of accountAddressSubs.values()) {
      notify();
    }
  });
}

async function handlePageRequest(
  ctx: MessageContext<JsonRpcRequest, JsonRpcResponse>
) {
  console.debug("New page request", ctx);

  const { id, jsonrpc, method, params } = ctx.data;

  try {
    await ensureInited();

    const senderUrl = ctx.port.sender?.url;
    if (!senderUrl) {
      throw ethErrors.rpc.resourceNotFound();
    }

    const source: ActivitySource = {
      type: "page",
      url: senderUrl,
    };

    const chainId = await loadInternalChainId();

    handleRpc(source, chainId, method, (params as any[]) ?? [], (response) => {
      if ("error" in response) {
        // Send plain object, not an Error instance
        // Also remove error stack
        const { message, code, data } = response.error;
        response = {
          error: { message, code, data },
        };
      }

      ctx.reply({
        id,
        jsonrpc,
        ...response,
      });
    });
  } catch (err) {
    console.error(err);

    ctx.reply({
      id,
      jsonrpc,
      error: ethErrors.rpc.internal(),
    });
  }
}

const loadInternalChainId = livePromise(
  () => storage.fetch<number>(CHAIN_ID).catch(() => INITIAL_NETWORK.chainId),
  (callback) =>
    storage.subscribe<number>(CHAIN_ID, ({ newValue }) =>
      callback(newValue ?? INITIAL_NETWORK.chainId)
    )
);

const loadAccountAddress = livePromise(
  () => storage.fetch<string>(ACCOUNT_ADDRESS).catch(getDefaultAccountAddress),
  subscribeAccountAddress
);

function subscribeAccountAddress(callback: (address: string) => void) {
  storage.subscribe<string>(ACCOUNT_ADDRESS, ({ newValue }) =>
    callback(newValue ?? getDefaultAccountAddress())
  );
}

function getDefaultAccountAddress() {
  return $accountAddresses.getState()[0];
}
