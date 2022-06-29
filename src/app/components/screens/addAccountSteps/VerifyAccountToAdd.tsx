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
import { addAccounts } from "core/client";

import { AddAccountStep } from "app/nav";
import {
  addAccountModalAtom,
  allAccountsAtom,
  getNeuterExtendedKeyAtom,
  hasSeedPhraseAtom,
  walletStatusAtom,
} from "app/atoms";
import { useNextAccountName } from "app/hooks";
import { useSteps } from "app/hooks/steps";
import { useDialog } from "app/hooks/dialog";

import AccountsToAdd, { AccountsToAddProps } from "./AccountToAdd";

const VerifyAccountToAdd: FC = () => {
  const walletStatus = useAtomValue(walletStatusAtom);
  const hasSeedPhrase = useAtomValue(hasSeedPhraseAtom);

  const initialSetup = walletStatus === WalletStatus.Welcome;
  const isUnlocked = walletStatus === WalletStatus.Unlocked;

  const importedAccounts = useMaybeAtomValue(isUnlocked && allAccountsAtom);
  const setAccModalOpened = useSetAtom(addAccountModalAtom);

  const { stateRef, navigateToStep } = useSteps();

  const { importAddresses: addresses, hardDevice } = stateRef.current;
  const { alert, confirm } = useDialog();

  const handleContinue = useCallback(
    async (addAccountsParams) => {
      try {
        if (
          (addAccountsParams as AddAccountParams[]).some(
            (acc) => acc.source === AccountSource.OpenLogin
          )
        ) {
          const confirmed = await confirm({
            title: (
              <>
                Creating a wallet
                <br />
                <span className="text-[0.75em]">from a social account</span>
              </>
            ),
            content: (
              <div className="text-left">
                <p>
                  By clicking &#34;Confirm&#34; you assume all risks associated
                  with creating a wallet using a social account.
                </p>

                <ul className="mt-2 list-disc list-outside text-sm">
                  <li className="mb-1">
                    If you lost access to your social account - you can&#34;t
                    restore the linked wallet again using the same way. You can
                    prevent this by exporting a private key (on the
                    &#34;Wallets&#34; page) after creating a wallet.
                  </li>
                  <li className="mb-1">
                    If someone else gets access to your social account, they can
                    get full access to the linked wallet.
                  </li>
                  <li className="mb-1">
                    If you connect the same social account to a malicious
                    website, it has potentially more opportunities to access the
                    linked wallet.
                  </li>
                </ul>
              </div>
            ),
            yesButtonText: "Confirm",
          });

          if (!confirmed) return;
        }

        if (initialSetup) {
          Object.assign(stateRef.current, { addAccountsParams });
          navigateToStep(AddAccountStep.SetupPassword);
        } else {
          await addAccounts(addAccountsParams, stateRef.current.seedPhrase);
          setAccModalOpened([false]);
        }
      } catch (err: any) {
        alert({ title: "Error!", content: err.message });
      }
    },
    [alert, confirm, initialSetup, navigateToStep, setAccModalOpened, stateRef]
  );

  const isAnyLedgerAccounts = useMemo(
    () =>
      importedAccounts?.filter(({ source }) => source === AccountSource.Ledger),
    [importedAccounts]
  );

  if (addresses && addresses.length > 0) {
    return (
      <AccountsToAdd accountsToVerify={addresses} onContinue={handleContinue} />
    );
  }

  if (
    (hasSeedPhrase && hardDevice !== "ledger") ||
    (hardDevice === "ledger" &&
      isAnyLedgerAccounts &&
      isAnyLedgerAccounts.length > 0)
  ) {
    return <VerifyAccountToAddExisting onContinue={handleContinue} />;
  }

  return <VerifyAccountToAddInitial onContinue={handleContinue} />;
};

export default VerifyAccountToAdd;

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
        derivationPath
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
        ? generatePreviewHDNodes(neuterExtendedKey).map(
            ({ address, index, publicKey }) => ({
              source: extendedKey
                ? AccountSource.Ledger
                : AccountSource.SeedPhrase,
              address,
              index: index.toString(),
              publicKey: toProtectedString(publicKey),
            })
          )
        : null,
    [extendedKey, neuterExtendedKey]
  );

  if (!addresses) {
    return null;
  }

  return <AccountsToAdd accountsToVerify={addresses} onContinue={onContinue} />;
};

const VerifyAccountToAddExisting: FC<VerifyAccountToAddProps> = ({
  onContinue,
}) => {
  const hasSeedPhrase = useMaybeAtomValue(hasSeedPhraseAtom);
  const { reset, stateRef } = useSteps();
  const { getNextAccountName } = useNextAccountName();

  const extendedKey: string | undefined = stateRef.current.extendedKey;
  const derivationPath = stateRef.current.derivationPath;

  const rootNeuterExtendedKey = useMaybeAtomValue(
    hasSeedPhrase && derivationPath
      ? getNeuterExtendedKeyAtom(derivationPath)
      : null
  );

  const importedAccounts = useMaybeAtomValue(allAccountsAtom);

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

      if (!importedAccounts || importedAccounts.length <= 0) {
        return {
          source: extendedKey ? AccountSource.Ledger : AccountSource.SeedPhrase,
          address: newAccounts[0].address,
          index: newAccounts[0].index.toString(),
          publicKey: toProtectedString(newAccounts[0].publicKey),
        };
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
        source: extendedKey ? AccountSource.Ledger : AccountSource.SeedPhrase,
        address: filteredAccounts[0].address,
        name: getNextAccountName(),
        index: filteredAccounts[0].index.toString(),
        isDisabled: true,
        isDefaultChecked: true,
        publicKey: toProtectedString(filteredAccounts[0].publicKey),
      };
    },
    [extendedKey, getNextAccountName, importedAccounts]
  );

  const addresses = useMemo(() => {
    if (!neuterExtendedKey) {
      return null;
    }

    if (!isCreatingNew) {
      const newAccounts = generatePreviewHDNodes(neuterExtendedKey).map(
        ({ address, index, publicKey }) => ({
          source: extendedKey ? AccountSource.Ledger : AccountSource.SeedPhrase,
          address,
          index: index.toString(),
          publicKey: toProtectedString(publicKey),
        })
      );

      if (!importedAccounts || importedAccounts.length <= 0) {
        return newAccounts;
      }

      return newAccounts.map(({ address, index, publicKey }) => {
        const isAddressImported = importedAccounts.find(
          ({ address: imported }) => {
            return imported === address;
          }
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
    importedAccounts,
    isCreatingNew,
    neuterExtendedKey,
  ]);

  if (!addresses) {
    return null;
  }

  return <AccountsToAdd accountsToVerify={addresses} onContinue={onContinue} />;
};
