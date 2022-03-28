import { FC, useCallback, useEffect, useMemo } from "react";
import { useAtomValue } from "jotai";
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
} from "app/atoms";
import { useSteps } from "app/hooks/steps";

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
        ? generatePreviewHDNodes(neuterExtendedKey).map(({ address }) => ({
            address,
          }))
        : null,
    [neuterExtendedKey]
  );

  const handleContinue = useCallback(
    async (addAccountsParams) => {
      try {
        Object.assign(stateRef.current, { addAccountsParams });
        navigateToStep(AddAccountStep.SetupPassword);
      } catch (err) {
        console.error(err);
      }
    },
    [navigateToStep, stateRef]
  );

  if (!addresses) {
    return null;
  }

  return <AccountsToAdd addresses={addresses} onContinue={handleContinue} />;
};

// Temporary
const isOneOnly = true; // TODO: Replace with context from prev step

const VerifyAccountToAddExisting: FC = () => {
  const hasSeedPhrase = useMaybeAtomValue(hasSeedPhraseAtom);
  const rootNeuterExtendedKey = useMaybeAtomValue(
    hasSeedPhrase && getNeuterExtendedKeyAtom(rootDerivationPath)
  );
  const importedAccounts = useMaybeAtomValue(hasSeedPhrase && allAccountsAtom);

  const { reset } = useSteps();

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
      };
    },
    [importedAccounts]
  );

  const addresses = useMemo(() => {
    if (!neuterExtendedKey) {
      return null;
    }

    if (!isOneOnly) {
      const newAccounts = generatePreviewHDNodes(neuterExtendedKey).map(
        ({ address }) => ({
          address,
        })
      );

      if (!importedAccounts || importedAccounts.length <= 0) {
        return newAccounts;
      }

      return newAccounts.map(({ address }) => {
        const isAddressImported = importedAccounts.find(
          ({ address: imported }) => {
            return imported === address;
          }
        );

        return {
          address,
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
  }, [findFirstUnusedAccount, importedAccounts, neuterExtendedKey]);

  const handleContinue = useCallback(async (addAccountsParams) => {
    try {
      console.log("addAccountsParams", addAccountsParams);
      await addAccounts(addAccountsParams);
    } catch (err) {
      console.error(err);
    }
  }, []);

  if (!addresses) {
    return null;
  }

  return <AccountsToAdd addresses={addresses} onContinue={handleContinue} />;
};
