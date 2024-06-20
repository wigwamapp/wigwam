import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import { useMaybeAtomValue } from "lib/atom-utils";
import { toProtectedString } from "lib/crypto-utils";
import { withTimeout } from "lib/system/withTimeout";

import { DEFAULT_NETWORKS } from "fixtures/networks";
import { AccountSource, SeedPharse, WalletStatus } from "core/types";
import {
  generatePreviewHDNodes,
  getSeedPhraseHDNode,
  toNeuterExtendedKey,
} from "core/common";
import { ClientProvider } from "core/client";

import { allAccountsAtom, walletStateAtom } from "app/atoms";
import { AddAccountStep } from "app/nav";
import { useNextAccountName } from "app/hooks";
import { useSteps } from "app/hooks/steps";
import { useDialog } from "app/hooks/dialog";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";

const preparedNetworks = DEFAULT_NETWORKS.filter(
  ({ type }) => type === "mainnet",
);

const ScanAccountsModal: FC<SecondaryModalProps> = ({
  onOpenChange,
  ...rest
}) => {
  const { stateRef, reset, navigateToStep } = useSteps();
  const { alert } = useDialog();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isUnmountedRef = useRef(false);
  const { walletStatus } = useAtomValue(walletStateAtom);
  const isUnlocked = walletStatus === WalletStatus.Unlocked;
  const existingAccounts = useMaybeAtomValue(isUnlocked && allAccountsAtom);
  const { getNextAccountName } = useNextAccountName();

  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;
  const extendedKey: string | undefined = stateRef.current.extendedKey;
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
  }, [derivationPath, extendedKey, seedPhrase]);

  const findFirstUnusedAccount = useCallback(
    (key: string, offset = 0, limit = 9) => {
      const newAccounts = generatePreviewHDNodes(key, offset, limit);

      if (!existingAccounts || existingAccounts.length <= 0) {
        return {
          source: extendedKey ? AccountSource.Ledger : AccountSource.SeedPhrase,
          address: newAccounts[0].address,
          name: getNextAccountName(),
          index: newAccounts[0].index.toString(),
          publicKey: toProtectedString(newAccounts[0].publicKey),
          isDisabled: false,
          isDefaultChecked: true,
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

  const loadActiveWallets = useCallback(async () => {
    if (!neuterExtendedKey) {
      return null;
    }

    const wallets = generatePreviewHDNodes(neuterExtendedKey, 0, 20);

    const resultAddresses: any[] = [];

    for (const [index, network] of preparedNetworks.entries()) {
      if (isUnmountedRef.current) {
        break;
      }

      const provider = new ClientProvider(network.chainId);

      await Promise.all(
        wallets.map(async (wallet) => {
          const existing = existingAccounts?.find(
            ({ address: existingAddress }) =>
              existingAddress === wallet.address,
          );
          if (existing) return;

          const balance = await withTimeout(3_000, () =>
            provider.getBalance(wallet.address),
          ).catch(() => null);
          if (!balance) return;

          const alreadyInResult = resultAddresses.find(
            ({ address: alreadyAddedAddress }) =>
              alreadyAddedAddress === wallet.address,
          );

          if (alreadyInResult) {
            if (!alreadyInResult.networks) alreadyInResult.networks = [];
            alreadyInResult.networks.push(network.chainId);
          } else {
            resultAddresses.push({
              source: extendedKey
                ? AccountSource.Ledger
                : AccountSource.SeedPhrase,
              address: wallet.address,
              index: wallet.index,
              isDisabled: false,
              isDefaultChecked: true,
              publicKey: toProtectedString(wallet.publicKey),
              networks: [network.chainId],
            });
          }
        }),
      );

      setLoadingProgress(((index + 1) / preparedNetworks.length) * 100);
    }

    if (resultAddresses.length > 0) {
      return resultAddresses.map((base, i) => ({
        ...base,
        name: getNextAccountName(i),
      }));
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
    neuterExtendedKey,
    getNextAccountName,
  ]);

  const logicProcess = useCallback(async () => {
    try {
      const addresses = await loadActiveWallets();

      onOpenChange?.(false);
      if (addresses) {
        stateRef.current.importAddresses = addresses;
        navigateToStep(AddAccountStep.ConfirmAccounts);
      } else {
        reset();
      }
    } catch (err: any) {
      alert({
        title: "Error!",
        content: err.message,
      }).then(() => onOpenChange?.(false));
    }
  }, [alert, loadActiveWallets, navigateToStep, onOpenChange, reset, stateRef]);

  // little hack to avoid rerender
  const logicProcessRef = useRef(logicProcess);

  useEffect(() => {
    logicProcessRef.current();

    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  return (
    <SecondaryModal
      open={true}
      header="Scanning wallets..."
      onOpenChange={onOpenChange}
      disabledClickOutside
      headerClassName="mb-3"
      {...rest}
    >
      <div className="text-base text-brand-font text-center w-full break-words">
        When the scanning process is done, you will be redirected to the next
        step, where you can verify all wallets that were found.
      </div>
      <div className="relative mt-5 w-[7.5rem] h-[7.5rem]">
        <CircularProgress percentage={loadingProgress} />
        <span
          className={classNames(
            "absolute inset-0",
            "flex items-center justify-center",
            "text-2xl font-bold",
          )}
        >
          {preparePercentString(loadingProgress)}
        </span>
      </div>
    </SecondaryModal>
  );
};

export default ScanAccountsModal;

const CircularProgress: FC<{ percentage: number }> = ({ percentage }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(percentage);
  }, [percentage]);

  const size = 120;
  const strokeWidth = 12;

  const viewBox = `0 0 ${size} ${size}`;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const dash = (progress * circumference) / 100;

  return (
    <svg width="100%" height="100%" viewBox={viewBox}>
      <circle
        fill="none"
        stroke="rgba(204, 214, 255, 0.15)"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={`${strokeWidth}px`}
      />
      <circle
        fill="none"
        stroke="url(#loaderLinearColors)"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={`${strokeWidth}px`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        strokeDasharray={[dash, circumference - dash] as any}
        strokeLinecap="round"
        style={{ transition: "all 0.5s" }}
      />
      <linearGradient id="loaderLinearColors" x1="0" y1="0" x2="1" y2="1">
        <stop offset="50%" stopColor="#80EF6E" />
        <stop offset="100%" stopColor="#80EF6E" />
      </linearGradient>
    </svg>
  );
};

const preparePercentString = (percent: number) =>
  (percent > 9 ? percent.toFixed(0) : `0${percent.toFixed(0)}`) + "%";
