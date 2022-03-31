import { match } from "ts-pattern";
import { PorterServer, MessageContext } from "lib/ext/porter/server";
import { getRandomInt } from "lib/system/randomInt";

import {
  Request,
  Response,
  EventMessage,
  MessageType,
  PorterChannel,
  WalletStatus,
} from "core/types";

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
import { addSyncRequest } from "./sync";

export function startServer() {
  const walletPorter = new PorterServer<EventMessage>(PorterChannel.Wallet);

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
        await new Promise((r) => setTimeout(r, getRandomInt(2_000, 3_000)));
      }

      if (attempts > 3) {
        locked();
      }
    }

    sessionStorage.passwordUsageAttempts = attempts;
  };

  // const dappPorter = new PorterServer(PorterChannel.DApp);
  // dappPorter.onMessage(handleDAppRequest);
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
      .with({ type: MessageType.AddSeedPhrase }, ({ type, seedPhrase }) =>
        withVault(async (vault) => {
          await vault.addSeedPhrase(seedPhrase);

          ctx.reply({ type });
        })
      )
      .with({ type: MessageType.GetAccounts }, ({ type }) =>
        withVault(async (vault) => {
          const accounts = vault.getAccounts();

          ctx.reply({ type, accounts });
        })
      )
      .with({ type: MessageType.AddAccounts }, ({ type, accountsParams }) =>
        withVault(async (vault) => {
          await vault.addAccounts(accountsParams);

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
      .with({ type: MessageType.Approve }, ({ type, approve, approvalId }) =>
        withVault(async (vault) => {
          await processApprove(approvalId, approve, vault);

          ctx.reply({ type });
        })
      )
      .with({ type: MessageType.Sync }, ({ chainId, accountAddress }) =>
        withStatus(WalletStatus.Unlocked, () => {
          addSyncRequest({ chainId, accountAddress });
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
          handleRpc(chainId, method, params, (response) =>
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
