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
import { saveAccounts } from "core/common";

import {
  $walletStatus,
  ensureInited,
  withStatus,
  withVault,
  locked,
  unlocked,
} from "./state";
import { Vault } from "./vault";

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

  try {
    await ensureInited();

    await match(ctx.data)
      .with({ type: MessageType.GetWalletStatus }, async ({ type }) => {
        const status = $walletStatus.getState();
        ctx.reply({ type, status });
      })
      .with(
        { type: MessageType.SetupWallet },
        ({ type, password, accounts, seedPhrase }) =>
          withStatus([WalletStatus.Welcome, WalletStatus.Locked], async () => {
            const { vault, accountAddresses } = await Vault.setup(
              password,
              accounts,
              seedPhrase
            );

            await saveAccounts(accounts, accountAddresses);
            unlocked(vault);
            ctx.reply({ type, accountAddresses });
          })
      )
      .with({ type: MessageType.UnlockWallet }, ({ type, password }) =>
        withStatus(WalletStatus.Locked, async () => {
          const vault = await Vault.unlock(password);
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
          ctx.reply({ type, accountAddresses });
        })
      )
      .with(
        { type: MessageType.DeleteAccounts },
        ({ type, password, accountAddresses }) =>
          withStatus(WalletStatus.Unlocked, async () => {
            await Vault.deleteAccounts(password, accountAddresses);
            ctx.reply({ type });
          })
      )
      .with({ type: MessageType.GetSeedPhrase }, ({ type, password }) =>
        withStatus(WalletStatus.Unlocked, async () => {
          const seedPhrase = await Vault.fetchSeedPhrase(password);
          ctx.reply({ type, seedPhrase });
        })
      )
      .with(
        { type: MessageType.GetPrivateKey },
        ({ type, password, accountAddress }) =>
          withStatus(WalletStatus.Unlocked, async () => {
            const privateKey = await Vault.fetchPrivateKey(
              password,
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
      .run();
  } catch (err) {
    ctx.replyError(err);
  }
}
