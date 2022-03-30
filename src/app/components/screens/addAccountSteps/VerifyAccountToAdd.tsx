import { FC, useCallback, useEffect, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useMaybeAtomValue } from "lib/atom-utils";
import { fromProtectedString } from "lib/crypto-utils";

import { SeedPharse, WalletStatus } from "core/types";
import {
  generatePreviewHDNodes,
  getSeedPhraseHDNode,
  toNeuterExtendedKey,
} from "core/common";
import { addAccounts } from "core/client";

import { AddAccountStep } from "app/nav";
import {
  hasSeedPhraseAtom,
  getNeuterExtendedKeyAtom,
  walletStatusAtom,
  allAccountsAtom,
  addAccountModalAtom,
} from "app/atoms";
import { useSteps } from "app/hooks/steps";
import { useDialog } from "app/hooks/dialog";

import AccountsToAdd from "./AccountToAdd";

const rootDerivationPath = "m/44'/60'/0'/0";

const VerifyAccountToAdd: FC = () => {
  const walletStatus = useAtomValue(walletStatusAtom);
  const initialSetup = walletStatus === WalletStatus.Welcome;

  if (initialSetup) {
    return <VerifyAccountToAddInitial />;
  }

  return <VerifyAccountToAddExisting />;
};

export default VerifyAccountToAdd;

const VerifyAccountToAddInitial: FC = () => {
  const { stateRef, reset, navigateToStep } = useSteps();
  const { alert } = useDialog();

  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;

  const neuterExtendedKey = useMemo(() => {
    return seedPhrase
      ? toNeuterExtendedKey(getSeedPhraseHDNode(seedPhrase), rootDerivationPath)
      : null;
  }, [seedPhrase]);

  useEffect(() => {
    if (!neuterExtendedKey) {
      reset();
    }
  }, [neuterExtendedKey, reset]);

  const addresses = useMemo(
    () =>
      neuterExtendedKey
        ? generatePreviewHDNodes(neuterExtendedKey).map(
            ({ address, index }) => ({
              address,
              index,
            })
          )
        : null,
    [neuterExtendedKey]
  );

  const handleContinue = useCallback(
    async (addAccountsParams) => {
      try {
        Object.assign(stateRef.current, { addAccountsParams });
        navigateToStep(AddAccountStep.SetupPassword);
      } catch (err: any) {
        alert(err.message);
      }
    },
    [alert, navigateToStep, stateRef]
  );

  if (!addresses) {
    return null;
  }

  return <AccountsToAdd addresses={addresses} onContinue={handleContinue} />;
};

const VerifyAccountToAddExisting: FC = () => {
  const hasSeedPhrase = useMaybeAtomValue(hasSeedPhraseAtom);
  const rootNeuterExtendedKey = useMaybeAtomValue(
    hasSeedPhrase && getNeuterExtendedKeyAtom(rootDerivationPath)
  );
  const importedAccounts = useMaybeAtomValue(hasSeedPhrase && allAccountsAtom);
  const setAccModalOpened = useSetAtom(addAccountModalAtom);
  const { alert } = useDialog();

  const { reset, stateRef } = useSteps();

  const isCreatingNew = stateRef.current.addAccounts === "existing-create";

  const neuterExtendedKey = useMemo(
    () => rootNeuterExtendedKey && fromProtectedString(rootNeuterExtendedKey),
    [rootNeuterExtendedKey]
  );

  useEffect(() => {
    if (!neuterExtendedKey) {
      reset();
    }
  }, [neuterExtendedKey, reset]);

  const findFirstUnusedAccount = useCallback(
    (key: string, offset = 0, limit = 9) => {
      const newAccounts = generatePreviewHDNodes(key, offset, limit);

      if (!importedAccounts || importedAccounts.length <= 0) {
        return newAccounts[0];
      }

      const filteredAccounts = newAccounts.filter(
        ({ address }) =>
          !importedAccounts.some(
            ({ address: imported }) => imported === address
          )
      );

      if (filteredAccounts.length <= 0) {
        return null;
      }

      return {
        address: filteredAccounts[0].address,
        name: `Wallet ${filteredAccounts[0].index + 1}`,
        index: filteredAccounts[0].index,
      };
    },
    [importedAccounts]
  );

  const addresses = useMemo(() => {
    if (!neuterExtendedKey) {
      return null;
    }

    if (!isCreatingNew) {
      const newAccounts = generatePreviewHDNodes(neuterExtendedKey).map(
        ({ address, index }) => ({
          address,
          index,
        })
      );

      if (!importedAccounts || importedAccounts.length <= 0) {
        return newAccounts;
      }

      return newAccounts.map(({ address, index }) => {
        const isAddressImported = importedAccounts.find(
          ({ address: imported }) => {
            return imported === address;
          }
        );

        return {
          address,
          index,
          name: isAddressImported?.name ?? undefined,
          isDisabled: isAddressImported,
          isDefaultChecked: isAddressImported,
        };
      });
    }

    let offset = 0;
    let limit = 9;
    let unusedAccount = null;
    while (unusedAccount === null) {
      unusedAccount = findFirstUnusedAccount(neuterExtendedKey, offset, limit);
      offset = limit;
      limit += 9;
    }

    return [unusedAccount];
  }, [
    findFirstUnusedAccount,
    importedAccounts,
    isCreatingNew,
    neuterExtendedKey,
  ]);

  const handleContinue = useCallback(
    async (addAccountsParams) => {
      try {
        await addAccounts(addAccountsParams);
        setAccModalOpened([false]);
      } catch (err: any) {
        alert(err.message);
      }
    },
    [alert, setAccModalOpened]
  );

  if (!addresses) {
    return null;
  }

  return <AccountsToAdd addresses={addresses} onContinue={handleContinue} />;
};
