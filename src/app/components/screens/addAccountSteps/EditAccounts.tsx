import { FC, useCallback, useEffect, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useMaybeAtomValue } from "lib/atom-utils";
import { fromProtectedString, toProtectedString } from "lib/crypto-utils";

import {
  AccountSource,
  AddAccountParams,
  SeedPharse,
  WalletStatus,
} from "core/types";
import {
  generatePreviewHDNodes,
  getSeedPhraseHDNode,
  toNeuterExtendedKey,
} from "core/common";
import { addAccounts, TEvent, trackEvent } from "core/client";

import { AddAccountStep } from "app/nav";
import {
  addAccountModalAtom,
  allAccountsAtom,
  getNeuterExtendedKeyAtom,
  walletStateAtom,
} from "app/atoms";
import { useNextAccountName } from "app/hooks";
import { useSteps } from "app/hooks/steps";
import { useDialog } from "app/hooks/dialog";

import AccountsToAdd, { AccountsToAddProps } from "./shared/AccountsToAdd";

const EditAccounts: FC = () => {
  const { walletStatus, hasSeedPhrase } = useAtomValue(walletStateAtom);

  const initialSetup = walletStatus === WalletStatus.Welcome;
  const isUnlocked = walletStatus === WalletStatus.Unlocked;

  const existingAccounts = useMaybeAtomValue(isUnlocked && allAccountsAtom);
  const setAccModalOpened = useSetAtom(addAccountModalAtom);

  const { stateRef, navigateToStep } = useSteps();

  const { extendedKey } = stateRef.current;
  const { alert } = useDialog();

  const ledgerMode = Boolean(extendedKey);

  const handleContinue = useCallback(
    async (addAccountsParams: AddAccountParams[]) => {
      try {
        if (initialSetup) {
          Object.assign(stateRef.current, { addAccountsParams });
          navigateToStep(AddAccountStep.SetupPassword);
        } else {
          await addAccounts(addAccountsParams, stateRef.current.seedPhrase);
          setAccModalOpened([false]);
        }

        const trackParams = {
          source: addAccountsParams[0].source,
          walletsAddedAmount: addAccountsParams.length,
        };

        trackEvent(TEvent.SetupWallet, trackParams);
      } catch (err: any) {
        alert({ title: "Error!", content: err.message });
      }
    },
    [alert, initialSetup, navigateToStep, setAccModalOpened, stateRef],
  );

  const isAnyLedgerAccounts = useMemo(
    () =>
      existingAccounts?.filter(({ source }) => source === AccountSource.Ledger),
    [existingAccounts],
  );

  return (hasSeedPhrase && !ledgerMode) ||
    (ledgerMode && isAnyLedgerAccounts?.length) ? (
    <VerifyAccountToAddExisting onContinue={handleContinue} />
  ) : (
    <VerifyAccountToAddInitial onContinue={handleContinue} />
  );
};

export default EditAccounts;

type VerifyAccountToAddProps = Pick<AccountsToAddProps, "onContinue">;

const VerifyAccountToAddInitial: FC<VerifyAccountToAddProps> = ({
  onContinue,
}) => {
  const { stateRef, reset } = useSteps();

  const extendedKey: string | undefined = stateRef.current.extendedKey;
  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;
  const derivationPath = stateRef.current.derivationPath;

  const neuterExtendedKey = useMemo(() => {
    if (extendedKey) {
      return extendedKey;
    }
    if (seedPhrase && derivationPath) {
      return toNeuterExtendedKey(
        getSeedPhraseHDNode(seedPhrase),
        derivationPath,
      );
    }

    return null;
  }, [extendedKey, derivationPath, seedPhrase]);

  useEffect(() => {
    if (!neuterExtendedKey) {
      reset();
    }
  }, [neuterExtendedKey, reset]);

  const addresses = useMemo(
    () =>
      neuterExtendedKey
        ? generatePreviewHDNodes(neuterExtendedKey, 0, 9).map(
            ({ address, index, publicKey }) => ({
              source: extendedKey
                ? AccountSource.Ledger
                : AccountSource.SeedPhrase,
              address,
              index: index.toString(),
              publicKey: toProtectedString(publicKey),
            }),
          )
        : null,
    [extendedKey, neuterExtendedKey],
  );

  if (!addresses) {
    return null;
  }

  return <AccountsToAdd accountsToVerify={addresses} onContinue={onContinue} />;
};

const VerifyAccountToAddExisting: FC<VerifyAccountToAddProps> = ({
  onContinue,
}) => {
  const walletState = useMaybeAtomValue(walletStateAtom);
  const { reset, stateRef } = useSteps();
  const { getNextAccountName } = useNextAccountName();

  const extendedKey: string | undefined = stateRef.current.extendedKey;
  const derivationPath = stateRef.current.derivationPath;

  const rootNeuterExtendedKey = useMaybeAtomValue(
    walletState?.hasSeedPhrase && derivationPath
      ? getNeuterExtendedKeyAtom(derivationPath)
      : null,
  );

  const existingAccounts = useMaybeAtomValue(allAccountsAtom);

  const isCreatingNew = stateRef.current.addAccounts === "existing-create";

  const neuterExtendedKey = useMemo(() => {
    if (extendedKey) {
      return extendedKey;
    }
    if (rootNeuterExtendedKey) {
      return fromProtectedString(rootNeuterExtendedKey);
    }

    return null;
  }, [extendedKey, rootNeuterExtendedKey]);

  useEffect(() => {
    if (!neuterExtendedKey) {
      reset();
    }
  }, [neuterExtendedKey, reset]);

  const findFirstUnusedAccount = useCallback(
    (key: string, offset = 0, limit = 9) => {
      const newAccounts = generatePreviewHDNodes(key, offset, limit);

      if (!existingAccounts || existingAccounts.length <= 0) {
        return {
          source: extendedKey ? AccountSource.Ledger : AccountSource.SeedPhrase,
          address: newAccounts[0].address,
          index: newAccounts[0].index.toString(),
          publicKey: toProtectedString(newAccounts[0].publicKey),
        };
      }

      const filteredAccounts = newAccounts.filter(
        ({ address }) =>
          !existingAccounts.some(
            ({ address: existingAddress }) => existingAddress === address,
          ),
      );

      if (filteredAccounts.length <= 0) {
        return null;
      }

      return {
        source: extendedKey ? AccountSource.Ledger : AccountSource.SeedPhrase,
        address: filteredAccounts[0].address,
        name: getNextAccountName(),
        index: filteredAccounts[0].index.toString(),
        isDisabled: true,
        isDefaultChecked: true,
        publicKey: toProtectedString(filteredAccounts[0].publicKey),
      };
    },
    [extendedKey, getNextAccountName, existingAccounts],
  );

  const addresses = useMemo(() => {
    if (!neuterExtendedKey) {
      return null;
    }

    if (!isCreatingNew) {
      const newAccounts = generatePreviewHDNodes(
        neuterExtendedKey,
        0,
        Math.max((existingAccounts?.length ?? 0) + 2, 9),
      ).map(({ address, index, publicKey }) => ({
        source: extendedKey ? AccountSource.Ledger : AccountSource.SeedPhrase,
        address,
        index: index.toString(),
        publicKey: toProtectedString(publicKey),
      }));

      if (!existingAccounts || existingAccounts.length <= 0) {
        return newAccounts;
      }

      return newAccounts.map(({ address, index, publicKey }) => {
        const isAddressImported = existingAccounts.find(
          ({ address: existingAddress }) => {
            return existingAddress === address;
          },
        );

        return {
          source: extendedKey ? AccountSource.Ledger : AccountSource.SeedPhrase,
          address,
          index: index.toString(),
          name: isAddressImported?.name ?? undefined,
          isDisabled: isAddressImported,
          isDefaultChecked: isAddressImported,
          isAdded: isAddressImported,
          publicKey: publicKey,
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
    extendedKey,
    findFirstUnusedAccount,
    existingAccounts,
    isCreatingNew,
    neuterExtendedKey,
  ]);

  if (!addresses) {
    return null;
  }

  return <AccountsToAdd accountsToVerify={addresses} onContinue={onContinue} />;
};
