import { match } from "ts-pattern";
import { PorterServer, MessageContext } from "lib/ext/porter/server";

import {
  Request,
  Response,
  EventMessage,
  MessageType,
  PorterChannel,
  WalletStatus,
} from "core/types";
import { cleanAccounts, saveAccounts } from "core/common";

import {
  $walletStatus,
  ensureInited,
  withStatus,
  withVault,
  locked,
  unlocked,
  pinged,
} from "./state";
import { Vault } from "./vault";
import { sendRpc } from "./network";

export function startServer() {
  const walletPorter = new PorterServer<EventMessage>(PorterChannel.Wallet);
  walletPorter.onMessage<Request, Response>(handleWalletRequest);

  $walletStatus.watch((status) => {
    walletPorter.broadcast({ type: MessageType.WalletStatusUpdated, status });
  });

  // const dappPorter = new PorterServer(PorterChannel.DApp);
  // dappPorter.onMessage(handleDAppRequest);
}

async function handleWalletRequest(ctx: MessageContext<Request, Response>) {
  console.debug("New wallet request", ctx);

  if (!ctx.request) return;

  pinged();

  try {
    await ensureInited();

    await match(ctx.data)
      .with({ type: MessageType.GetWalletStatus }, async ({ type }) => {
        const status = $walletStatus.getState();
        ctx.reply({ type, status });
      })
      .with(
        { type: MessageType.SetupWallet },
        ({ type, passwordHash, accounts, seedPhrase }) =>
          withStatus([WalletStatus.Welcome, WalletStatus.Locked], async () => {
            const { vault, accountAddresses } = await Vault.setup(
              passwordHash,
              accounts,
              seedPhrase
            );

            await saveAccounts(accounts, accountAddresses);
            unlocked(vault);
            ctx.reply({ type, accountAddresses });
          })
      )
      .with({ type: MessageType.UnlockWallet }, ({ type, passwordHash }) =>
        withStatus(WalletStatus.Locked, async () => {
          const vault = await Vault.unlock(passwordHash);
          unlocked(vault);
          ctx.reply({ type });
        })
      )
      .with({ type: MessageType.LockWallet }, ({ type }) => {
        locked();
        ctx.reply({ type });
      })
      .with({ type: MessageType.HasSeedPhrase }, async ({ type }) => {
        const seedPhraseExists = await Vault.hasSeedPhrase();
        ctx.reply({ type, seedPhraseExists });
      })
      .with({ type: MessageType.AddSeedPhrase }, ({ type, seedPhrase }) =>
        withVault(async (vault) => {
          await vault.addSeedPhrase(seedPhrase);
          ctx.reply({ type });
        })
      )
      .with({ type: MessageType.AddAccounts }, ({ type, accounts }) =>
        withVault(async (vault) => {
          const accountAddresses = await vault.addAccounts(accounts);
          await saveAccounts(accounts, accountAddresses);
          ctx.reply({ type, accountAddresses });
        })
      )
      .with(
        { type: MessageType.DeleteAccounts },
        ({ type, passwordHash, accountAddresses }) =>
          withStatus(WalletStatus.Unlocked, async () => {
            await Vault.deleteAccounts(passwordHash, accountAddresses);
            await cleanAccounts(accountAddresses);
            ctx.reply({ type });
          })
      )
      .with({ type: MessageType.GetSeedPhrase }, ({ type, passwordHash }) =>
        withStatus(WalletStatus.Unlocked, async () => {
          const seedPhrase = await Vault.fetchSeedPhrase(passwordHash);
          ctx.reply({ type, seedPhrase });
        })
      )
      .with(
        { type: MessageType.GetPrivateKey },
        ({ type, passwordHash, accountAddress }) =>
          withStatus(WalletStatus.Unlocked, async () => {
            const privateKey = await Vault.fetchPrivateKey(
              passwordHash,
              accountAddress
            );
            ctx.reply({ type, privateKey });
          })
      )
      .with({ type: MessageType.GetPublicKey }, ({ type, accountAddress }) =>
        withVault(async (vault) => {
          const publicKey = await vault.fetchPublicKey(accountAddress);
          ctx.reply({ type, publicKey });
        })
      )
      .with(
        { type: MessageType.GetNeuterExtendedKey },
        ({ type, derivationPath }) =>
          withVault(async (vault) => {
            const extendedKey = await vault.fetchNeuterExtendedKey(
              derivationPath
            );
            ctx.reply({ type, extendedKey });
          })
      )
      .with(
        { type: MessageType.SendRpc },
        async ({ type, chainId, method, params }) => {
          const response = await sendRpc(chainId, method, params);
          ctx.reply({ type, response });
        }
      )
      .otherwise(() => {
        throw new Error("Not Found");
      });
  } catch (err) {
    ctx.replyError(err);
  }
}
