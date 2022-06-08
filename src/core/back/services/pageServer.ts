import { Runtime } from "webextension-polyfill";
import { ethErrors } from "eth-rpc-errors";
import { liveQuery, Subscription } from "dexie";
import { PorterServer, MessageContext } from "lib/ext/porter/server";

import {
  PorterChannel,
  JsonRpcResponse,
  JsonRpcRequest,
  ActivitySource,
  Permission,
} from "core/types";
import * as repo from "core/repo";
import { JSONRPC, VIGVAM_STATE } from "core/common/rpc";

import { ensureInited } from "../state";
import { handleRpc } from "../rpc";

export function startPageServer() {
  const pagePorter = new PorterServer<any>(PorterChannel.Page);

  pagePorter.onMessage(handlePageRequest);

  const permissionSubs = new Map<Runtime.Port, Subscription>();

  pagePorter.onConnection(async (action, port) => {
    if (!port.sender?.url) return;
    const { origin } = new URL(port.sender.url);

    if (action === "connect") {
      const notifyPermission = (p?: Permission) => {
        const params = {
          chainId: p?.chainId ?? 1,
          accountAddress: p?.selectedAddress ?? null,
        };

        pagePorter.notify(port, {
          jsonrpc: JSONRPC,
          method: VIGVAM_STATE,
          params,
        });
      };

      const permission = await repo.permissions.where({ origin }).first();
      notifyPermission(permission);

      const sub = liveQuery(() =>
        repo.permissions.where({ origin }).first()
      ).subscribe(notifyPermission);

      permissionSubs.set(port, sub);
    } else {
      const sub = permissionSubs.get(port);
      if (sub) {
        sub.unsubscribe();
        permissionSubs.delete(port);
      }
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

    handleRpc(source, 1, method, (params as any[]) ?? [], (response) => {
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
