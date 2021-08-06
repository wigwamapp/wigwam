import { useCallback } from "react";

import * as Client from "core/client";
import { useUpdateAtom } from "jotai/utils";

import { refreshAfterAddAccountsAtom } from "app/atoms";

export function useSetupWallet() {
  const refreshAfterAddAccounts = useUpdateAtom(refreshAfterAddAccountsAtom);
  return useActionWithEffects(Client.setupWallet, refreshAfterAddAccounts);
}

export function useAddAccounts() {
  const refreshAfterAddAccounts = useUpdateAtom(refreshAfterAddAccountsAtom);
  return useActionWithEffects(Client.addAccounts, refreshAfterAddAccounts);
}

function useActionWithEffects<AA extends any[], AR>(
  action: (...args: AA) => Promise<AR>,
  ...effects: (() => void)[]
) {
  return useCallback<typeof action>(
    (...args) =>
      action(...args).then((result) => {
        for (const effect of effects) {
          try {
            effect();
          } catch (err) {
            console.error(err);
          }
        }
        return result;
      }),
    // eslint-disable-next-line
    [action, ...effects]
  );
}
