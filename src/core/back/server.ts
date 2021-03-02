import { match } from "ts-pattern";
import { IntercomServer } from "lib/ext/intercom/server";
import { Request, Response, MessageType } from "core/types";
import { getStatus, withNotReady, withUnlocked } from "./state";
import { Vault } from "./vault";

const intercom = new IntercomServer<Request, Response>();

intercom.onMessage(async (ctx) => {
  try {
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
    if (ctx.request) {
      ctx.replyError(err);
    }
  }
});
