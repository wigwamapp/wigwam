import { match } from "ts-pattern";
import { IntercomServer, MessageContext } from "lib/ext/intercom/server";
import {
  Request,
  Response,
  EventMessage,
  MessageType,
  IntercomTarget,
  WalletStatus,
} from "core/types";
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
  const walletIntercom = new IntercomServer<EventMessage>(
    IntercomTarget.Wallet
  );
  walletIntercom.onMessage<Request, Response>(handleWalletRequest);

  $walletStatus.watch((status) => {
    walletIntercom.broadcast({ type: MessageType.WalletStatusUpdated, status });
  });

  // const dappIntercom = new IntercomServer(IntercomTarget.DApp);
  // dappIntercom.onMessage(handleDAppRequest);
}

async function handleWalletRequest(ctx: MessageContext<Request, Response>) {
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
        ({ type, password, accountParams, seedPhrase }) =>
          withStatus([WalletStatus.Welcome, WalletStatus.Locked], async () => {
            const { vault, accountAddress } = await Vault.setup(
              password,
              accountParams,
              seedPhrase
            );
            unlocked(vault);
            ctx.reply({ type, accountAddress });
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
      .with({ type: MessageType.AddAccount }, ({ type, params }) =>
        withVault(async (vault) => {
          const accountAddress = await vault.addAccount(params);
          ctx.reply({ type, accountAddress });
        })
      )
      .with(
        { type: MessageType.DeleteAccount },
        ({ type, password, accountAddress }) =>
          withStatus(WalletStatus.Ready, async () => {
            await Vault.deleteAccount(password, accountAddress);
            ctx.reply({ type });
          })
      )
      .with({ type: MessageType.GetSeedPhrase }, ({ type, password }) =>
        withStatus(WalletStatus.Ready, async () => {
          const seedPhrase = await Vault.fetchSeedPhrase(password);
          ctx.reply({ type, seedPhrase });
        })
      )
      .with(
        { type: MessageType.GetPrivateKey },
        ({ type, password, accountAddress }) =>
          withStatus(WalletStatus.Ready, async () => {
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
      .run();
  } catch (err) {
    ctx.replyError(err);
  }
}
