import { match } from "ts-pattern";
import { IntercomServer, MessageContext } from "lib/ext/intercom/server";
import {
  Request,
  Response,
  EventMessage,
  MessageType,
  IntercomTarget,
} from "core/types";
import {
  ensureInited,
  getStatus,
  withNotReady,
  withUnlocked,
  onStatusChanged,
} from "./state";
import { Vault } from "./vault";

export function startServer() {
  const walletIntercom = new IntercomServer<EventMessage>(
    IntercomTarget.Wallet
  );
  walletIntercom.onMessage<Request, Response>(handleWalletRequest);

  onStatusChanged((status) => {
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
        const status = getStatus();
        ctx.reply({ type, status });
      })
      .with(
        { type: MessageType.SetupWallet },
        ({ type, password, accountParams, seedPhrase }) =>
          withNotReady(async (state) => {
            const { vault, accountAddress } = await Vault.setup(
              password,
              accountParams,
              seedPhrase
            );
            state.unlock(vault);
            ctx.reply({ type, accountAddress });
          })
      )
      .with({ type: MessageType.UnlockWallet }, ({ type, password }) =>
        withNotReady(async (state) => {
          const vault = await Vault.unlock(password);
          state.unlock(vault);
          ctx.reply({ type });
        })
      )
      .with({ type: MessageType.LockWallet }, ({ type }) =>
        withUnlocked(async (state) => {
          state.lock();
          ctx.reply({ type });
        })
      )
      .run();
  } catch (err) {
    ctx.replyError(err);
  }
}
