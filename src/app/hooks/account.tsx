import { useCallback } from "react";
import { useAtomValue } from "jotai";
import { replaceT } from "lib/ext/i18n";
import { useAtomsAll, useMaybeAtomValue } from "lib/atom-utils";

import { Account, WalletStatus } from "core/types";
import {
  accountAddressAtom,
  allAccountsAtom,
  walletStateAtom,
} from "app/atoms";

export function useAccounts() {
  const [allAccounts, address] = useAtomsAll([
    allAccountsAtom,
    accountAddressAtom,
  ]);

  if (allAccounts.length === 0) {
    throw new Error("There are no accounts");
  }

  const index = address
    ? allAccounts.findIndex((acc) => acc.address === address)
    : 0;

  const currentAccount = allAccounts[index === -1 ? 0 : index];

  return { allAccounts, currentAccount };
}

export function useNextAccountName() {
  const { walletStatus } = useAtomValue(walletStateAtom);
  const isUnlocked = walletStatus === WalletStatus.Unlocked;
  const existingAccounts = useMaybeAtomValue(isUnlocked && allAccountsAtom);

  const createName = useCallback(
    (accs: Account[], name: string, index: number) => {
      if (index !== 0) {
        name = `${name}_${index}`;
      }
      if (accs.some(({ name: nme }) => replaceT(nme) === replaceT(name))) {
        return null;
      }
      return name;
    },
    [],
  );

  const getNextAccountName = useCallback(
    (indx = 0) => {
      if (existingAccounts && existingAccounts.length > 0) {
        const maybeName = `{{wallet}} ${existingAccounts.length + 1 + indx}`;
        let index = 0;
        let finalName = null;
        while (finalName === null) {
          finalName = createName(existingAccounts, maybeName, index);
          index += 1;
        }

        return finalName;
      }

      return `{{wallet}} ${indx + 1}`;
    },
    [createName, existingAccounts],
  );

  return { getNextAccountName };
}
