import { match } from "ts-pattern";
import { createQueue } from "lib/system/queue";
import { PorterServer, MessageContext } from "lib/ext/porter/server";
import { storage } from "lib/ext/storage";

import {
  Request,
  Response,
  EventMessage,
  MessageType,
  PorterChannel,
  WalletStatus,
  WalletRpcMsgContext,
  SelfActivityKind,
  ACCOUNT_ADDRESS,
} from "core/types";

import {
  $walletState,
  $approvals,
  $accountsState,
  ensureInited,
  withStatus,
  withVault,
  locked,
  unlocked,
  walletPortsCountUpdated,
  accountsUpdated,
  $syncStatus,
  seedPhraseAdded,
  approvalsRejected,
} from "../state";
import { Vault } from "../vault";
import { handleRpc } from "../rpc";
import { processApprove } from "../approve";
import {
  addFindTokenRequest,
  addSyncRequest,
  estimateGasPrices,
  syncTokenActivities,
  getOnRampCryptoCurrencies,
  getTokenDetailsUrl,
} from "../sync";

export function startWalletServer() {
  const walletPorter = new PorterServer<EventMessage>(PorterChannel.Wallet);

  walletPorter.onConnection(() => {
    walletPortsCountUpdated(walletPorter.portsCount);
  });

  walletPorter.onMessage<Request, Response>(handleWalletRequest);

  $walletState.watch(([walletStatus, hasSeedPhrase]) => {
    walletPorter.broadcast({
      type: MessageType.WalletStateUpdated,
      walletStatus,
      hasSeedPhrase,
    });
  });

  accountsUpdated.watch((accounts) => {
    walletPorter.broadcast({ type: MessageType.AccountsUpdated, accounts });
  });

  $accountsState.watch(({ prev, current }) => {
    if (!prev || prev.length === current.length) return;

    storage
      .put(
        ACCOUNT_ADDRESS,
        prev.length < current.length
          ? // New account added
            current[prev.length].address
          : // Account deleted
            current[0].address,
      )
      .catch(console.error);
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
}

const withQueue = createQueue();

async function handleWalletRequest(
  ctx: MessageContext<Request | EventMessage, Response>,
) {
  // console.debug("New wallet request", ctx);

  try {
    await ensureInited();

    await match(ctx.data)
      .with({ type: MessageType.GetWalletState }, async ({ type }) => {
        const [walletStatus, hasSeedPhrase] = $walletState.getState();

        ctx.reply({ type, walletStatus, hasSeedPhrase });
      })
      .with(
        { type: MessageType.SetupWallet },
        ({ type, password, accountsParams, seedPhrase }) =>
          withQueue(() =>
            withStatus(
              [WalletStatus.Welcome, WalletStatus.Locked],
              async () => {
                const vault = await Vault.setup(
                  password,
                  accountsParams,
                  seedPhrase,
                );

                const accounts = vault.getAccounts();
                const hasSeedPhrase = vault.isSeedPhraseExists();

                unlocked({ vault, accounts, hasSeedPhrase });

                ctx.reply({ type });
              },
            ),
          ),
      )
      .with({ type: MessageType.UnlockWallet }, ({ type, password }) =>
        withQueue(() =>
          withStatus(WalletStatus.Locked, async () => {
            const vault = await Vault.unlock(password);

            const accounts = vault.getAccounts();
            const hasSeedPhrase = vault.isSeedPhraseExists();

            unlocked({ vault, accounts, hasSeedPhrase });

            ctx.reply({ type });
          }),
        ),
      )
      .with({ type: MessageType.LockWallet }, ({ type }) => {
        locked();

        ctx.reply({ type });
      })
      .with(
        { type: MessageType.ChangePassword },
        ({ type, currentPassword, nextPassword }) =>
          withQueue(() =>
            withVault(async (vault) => {
              await vault.changePassword(currentPassword, nextPassword);

              ctx.reply({ type });
            }),
          ),
      )
      .with({ type: MessageType.GetAccounts }, ({ type }) =>
        withVault(async (vault) => {
          const accounts = vault.getAccounts();

          ctx.reply({ type, accounts });
        }),
      )
      .with(
        { type: MessageType.AddAccounts },
        ({ type, accountsParams, seedPhrase }) =>
          withQueue(() =>
            withVault(async (vault) => {
              await vault.addAccounts(accountsParams, seedPhrase);

              const accounts = vault.getAccounts();
              accountsUpdated(accounts);

              if (seedPhrase) {
                seedPhraseAdded();
              }

              ctx.reply({ type });
            }),
          ),
      )
      .with(
        { type: MessageType.DeleteAccounts },
        ({ type, password, accountUuids }) =>
          withQueue(() =>
            withVault(async (vault) => {
              await vault.deleteAccounts(password, accountUuids);

              const accounts = vault.getAccounts();
              accountsUpdated(accounts);

              ctx.reply({ type });
            }),
          ),
      )
      .with(
        { type: MessageType.UpdateAccountName },
        ({ type, accountUuid, name }) =>
          withQueue(() =>
            withVault(async (vault) => {
              await vault.updateAccountName(accountUuid, name);

              const accounts = vault.getAccounts();
              accountsUpdated(accounts);

              ctx.reply({ type });
            }),
          ),
      )
      .with({ type: MessageType.GetSeedPhrase }, ({ type, password }) =>
        withQueue(() =>
          withVault(async (vault) => {
            const seedPhrase = await vault.getSeedPhrase(password);

            ctx.reply({ type, seedPhrase });
          }),
        ),
      )
      .with(
        { type: MessageType.GetPrivateKey },
        ({ type, password, accountUuid }) =>
          withQueue(() =>
            withVault(async (vault) => {
              const privateKey = await vault.getPrivateKey(
                password,
                accountUuid,
              );

              ctx.reply({ type, privateKey });
            }),
          ),
      )
      .with({ type: MessageType.GetPublicKey }, ({ type, accountUuid }) =>
        withVault(async (vault) => {
          const publicKey = vault.getPublicKey(accountUuid);

          ctx.reply({ type, publicKey });
        }),
      )
      .with(
        { type: MessageType.GetNeuterExtendedKey },
        ({ type, derivationPath }) =>
          withVault(async (vault) => {
            const extendedKey = vault.getNeuterExtendedKey(derivationPath);

            ctx.reply({ type, extendedKey });
          }),
      )
      .with({ type: MessageType.GetApprovals }, ({ type }) =>
        withStatus(WalletStatus.Unlocked, () => {
          const approvals = $approvals.getState();

          ctx.reply({ type, approvals });
        }),
      )
      .with({ type: MessageType.Approve }, ({ type, approvalId, result }) =>
        withQueue(() =>
          withVault(async (vault) => {
            await processApprove(approvalId, result, vault);

            ctx.reply({ type });
          }),
        ),
      )
      .with({ type: MessageType.RejectAllApprovals }, () =>
        withStatus(WalletStatus.Unlocked, () => {
          approvalsRejected(null);
        }),
      )
      .with(
        { type: MessageType.Sync },
        ({ chainId, accountAddress, tokenType }) =>
          withStatus(WalletStatus.Unlocked, () => {
            addSyncRequest(chainId, accountAddress, tokenType);
          }),
      )
      .with(
        { type: MessageType.FindToken },
        ({ chainId, accountAddress, tokenSlug, refreshMetadata }) =>
          withStatus(WalletStatus.Unlocked, () => {
            addFindTokenRequest(
              chainId,
              accountAddress,
              tokenSlug,
              refreshMetadata,
            );
          }),
      )
      .with(
        { type: MessageType.SyncTokenActivities },
        ({ chainId, accountAddress, tokenSlug }) =>
          withStatus(WalletStatus.Unlocked, () => {
            syncTokenActivities(chainId, accountAddress, tokenSlug);
          }),
      )
      .with({ type: MessageType.GetGasPrices }, ({ type, chainId }) =>
        withStatus(WalletStatus.Unlocked, async () => {
          const gasPrices = await estimateGasPrices(chainId);

          ctx.reply({ type, gasPrices });
        }),
      )
      .with({ type: MessageType.GetOnRampCurrencies }, ({ type }) =>
        withStatus(WalletStatus.Unlocked, async () => {
          const currencies = await getOnRampCryptoCurrencies().catch(
            () => ({}),
          );

          ctx.reply({ type, currencies });
        }),
      )
      .with(
        { type: MessageType.GetTokenDetailsUrl },
        ({ type, chainId, tokenSlug }) =>
          withStatus(WalletStatus.Unlocked, async () => {
            const detailsUrl = await getTokenDetailsUrl(
              chainId,
              tokenSlug,
            ).catch(() => null);

            ctx.reply({ type, detailsUrl });
          }),
      )
      .with({ type: MessageType.GetSyncStatus }, ({ type }) =>
        withStatus(WalletStatus.Unlocked, () => {
          const status = $syncStatus.getState();

          ctx.reply({ type, status });
        }),
      )
      .with(
        { type: MessageType.SendRpc },
        ({ chainId, method, params, source }) => {
          handleRpc(
            ctx as WalletRpcMsgContext,
            source ?? UNKNOWN_SELF_SOURCE,
            chainId,
            method,
            params,
          );
        },
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
