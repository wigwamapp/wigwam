import { Runtime } from "webextension-polyfill";
import { match } from "ts-pattern";
import { ethErrors } from "eth-rpc-errors";
import { liveQuery, Subscription } from "dexie";
import { PorterServer, MessageContext } from "lib/ext/porter/server";
import { getRandomInt } from "lib/system/randomInt";

import {
  Request,
  Response,
  EventMessage,
  MessageType,
  PorterChannel,
  WalletStatus,
  JsonRpcResponse,
  JsonRpcRequest,
  SelfActivityKind,
  ActivitySource,
  Permission,
} from "core/types";
import * as repo from "core/repo";
import { JSONRPC, VIGVAM_STATE } from "core/common/rpc";

import {
  $walletStatus,
  $approvals,
  ensureInited,
  withStatus,
  withVault,
  locked,
  unlocked,
  walletPortsCountUpdated,
  accountsUpdated,
  $syncStatus,
} from "./state";
import { Vault } from "./vault";
import { handleRpc } from "./rpc";
import { processApprove } from "./approve";
import { startApproveWindowServer } from "./approve/window";
import {
  addFindTokenRequest,
  addSyncRequest,
  getTPGasPrices,
  syncTokenActivities,
} from "./sync";

export function startServer() {
  startApproveWindowServer();

  const walletPorter = new PorterServer<EventMessage>(PorterChannel.Wallet);
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

  walletPorter.onConnection(() => {
    walletPortsCountUpdated(walletPorter.portsCount);
  });

  walletPorter.onMessage<Request, Response>(handleWalletRequest);

  $walletStatus.watch((status) => {
    walletPorter.broadcast({ type: MessageType.WalletStatusUpdated, status });
  });

  accountsUpdated.watch((accounts) => {
    walletPorter.broadcast({ type: MessageType.AccountsUpdated, accounts });
  });

  $approvals.watch((approvals) => {
    walletPorter.broadcast({
      type: MessageType.ApprovalsUpdated,
      approvals,
    });
  });

  $syncStatus.watch((status) => {
    walletPorter.broadcast({
      type: MessageType.SyncStatusUpdated,
      status,
    });
  });

  let attempts = +sessionStorage.passwordUsageAttempts || 0;

  Vault.onPasswordUsage = async (success) => {
    if (success) {
      attempts = 0;
    } else {
      attempts++;

      if (attempts > 5) {
        locked();
        await new Promise((r) => setTimeout(r, getRandomInt(2_000, 3_000)));
      }
    }

    sessionStorage.passwordUsageAttempts = attempts;
  };
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

async function handleWalletRequest(
  ctx: MessageContext<Request | EventMessage, Response>
) {
  console.debug("New wallet request", ctx);

  try {
    await ensureInited();

    await match(ctx.data)
      .with({ type: MessageType.GetWalletStatus }, async ({ type }) => {
        const status = $walletStatus.getState();

        ctx.reply({ type, status });
      })
      .with(
        { type: MessageType.SetupWallet },
        ({ type, password, accountsParams, seedPhrase }) =>
          withStatus([WalletStatus.Welcome, WalletStatus.Locked], async () => {
            const vault = await Vault.setup(
              password,
              accountsParams,
              seedPhrase
            );

            const accounts = vault.getAccounts();
            unlocked({ vault, accounts });

            ctx.reply({ type });
          })
      )
      .with({ type: MessageType.UnlockWallet }, ({ type, password }) =>
        withStatus(WalletStatus.Locked, async () => {
          const vault = await Vault.unlock(password);

          const accounts = vault.getAccounts();
          unlocked({ vault, accounts });

          ctx.reply({ type });
        })
      )
      .with({ type: MessageType.LockWallet }, ({ type }) => {
        locked();

        ctx.reply({ type });
      })
      .with(
        { type: MessageType.ChangePassword },
        ({ type, currentPassword, nextPassword }) =>
          withVault(async (vault) => {
            await vault.changePassword(currentPassword, nextPassword);

            ctx.reply({ type });
          })
      )
      .with({ type: MessageType.HasSeedPhrase }, async ({ type }) =>
        withVault(async (vault) => {
          const seedPhraseExists = vault.isSeedPhraseExists();

          ctx.reply({ type, seedPhraseExists });
        })
      )
      .with({ type: MessageType.GetAccounts }, ({ type }) =>
        withVault(async (vault) => {
          const accounts = vault.getAccounts();

          ctx.reply({ type, accounts });
        })
      )
      .with(
        { type: MessageType.AddAccounts },
        ({ type, accountsParams, seedPhrase }) =>
          withVault(async (vault) => {
            await vault.addAccounts(accountsParams, seedPhrase);

            const accounts = vault.getAccounts();
            accountsUpdated(accounts);

            ctx.reply({ type });
          })
      )
      .with(
        { type: MessageType.DeleteAccounts },
        ({ type, password, accountUuids }) =>
          withVault(async (vault) => {
            await vault.deleteAccounts(password, accountUuids);

            const accounts = vault.getAccounts();
            accountsUpdated(accounts);

            ctx.reply({ type });
          })
      )
      .with(
        { type: MessageType.UpdateAccountName },
        ({ type, accountUuid, name }) =>
          withVault(async (vault) => {
            await vault.updateAccountName(accountUuid, name);

            const accounts = vault.getAccounts();
            accountsUpdated(accounts);

            ctx.reply({ type });
          })
      )
      .with({ type: MessageType.GetSeedPhrase }, ({ type, password }) =>
        withVault(async (vault) => {
          const seedPhrase = await vault.getSeedPhrase(password);

          ctx.reply({ type, seedPhrase });
        })
      )
      .with(
        { type: MessageType.GetPrivateKey },
        ({ type, password, accountUuid }) =>
          withVault(async (vault) => {
            const privateKey = await vault.getPrivateKey(password, accountUuid);

            ctx.reply({ type, privateKey });
          })
      )
      .with({ type: MessageType.GetPublicKey }, ({ type, accountUuid }) =>
        withVault(async (vault) => {
          const publicKey = vault.getPublicKey(accountUuid);

          ctx.reply({ type, publicKey });
        })
      )
      .with(
        { type: MessageType.GetNeuterExtendedKey },
        ({ type, derivationPath }) =>
          withVault(async (vault) => {
            const extendedKey = vault.getNeuterExtendedKey(derivationPath);

            ctx.reply({ type, extendedKey });
          })
      )
      .with({ type: MessageType.GetApprovals }, ({ type }) =>
        withStatus(WalletStatus.Unlocked, () => {
          const approvals = $approvals.getState();

          ctx.reply({ type, approvals });
        })
      )
      .with({ type: MessageType.Approve }, ({ type, approvalId, result }) =>
        withVault(async (vault) => {
          await processApprove(approvalId, result, vault);

          ctx.reply({ type });
        })
      )
      .with({ type: MessageType.Sync }, ({ chainId, accountAddress }) =>
        withStatus(WalletStatus.Unlocked, () => {
          addSyncRequest(chainId, accountAddress);
        })
      )
      .with(
        { type: MessageType.FindToken },
        ({ chainId, accountAddress, tokenSlug }) =>
          withStatus(WalletStatus.Unlocked, () => {
            addFindTokenRequest(chainId, accountAddress, tokenSlug);
          })
      )
      .with(
        { type: MessageType.SyncTokenActivities },
        ({ chainId, accountAddress, tokenSlug }) =>
          withStatus(WalletStatus.Unlocked, () => {
            syncTokenActivities(chainId, accountAddress, tokenSlug);
          })
      )
      .with({ type: MessageType.GetTPGasPrices }, ({ type, chainId }) =>
        withStatus(WalletStatus.Unlocked, async () => {
          const gasPrices = await getTPGasPrices(chainId);

          ctx.reply({ type, gasPrices });
        })
      )
      .with({ type: MessageType.GetSyncStatus }, ({ type }) =>
        withStatus(WalletStatus.Unlocked, () => {
          const status = $syncStatus.getState();

          ctx.reply({ type, status });
        })
      )
      .with(
        { type: MessageType.SendRpc },
        ({ type, chainId, method, params }) => {
          handleRpc(UNKNOWN_SELF_SOURCE, chainId, method, params, (response) =>
            ctx.reply({ type, response })
          );
        }
      )
      .otherwise(() => {
        throw new Error("Not Found");
      });
  } catch (err) {
    ctx.replyError(err);
  }
}

const UNKNOWN_SELF_SOURCE = {
  type: "self",
  kind: SelfActivityKind.Unknown,
} as const;
