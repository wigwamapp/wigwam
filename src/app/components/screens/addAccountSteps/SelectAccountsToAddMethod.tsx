import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";

import { SeedPharse, WalletStatus } from "core/types";
import {
  generatePreviewHDNodes,
  getSeedPhraseHDNode,
  toNeuterExtendedKey,
} from "core/common";
import { ClientProvider } from "core/client";

import { allNetworksAtom, walletStatusAtom } from "app/atoms";
import { AddAccountStep } from "app/nav";
import { useSteps } from "app/hooks/steps";
import { useDialog } from "app/hooks/dialog";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";

import SelectAddMethod, { MethodsProps } from "./SelectAddMethod";

const methodsInitial: MethodsProps = [
  {
    value: "auto",
    title: "Auto (Recommended)",
    description:
      "Scanning the first 20 wallets from Secret Phrase for a positive balance. For every known network (mainnet). If you have more wallets - you can also add them later.",
  },
  {
    value: "manual",
    title: "Manual",
    description:
      "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
];

const methodsExisting: MethodsProps = [
  {
    value: "create",
    title: "Create new account",
    description: "You can create a new account",
  },
  {
    value: "manual",
    title: "Manual adding account",
    description:
      "Choose which of the wallets belonging to the Secret Phrase you wish to add.",
  },
];

const SelectAccountsToAddMethod: FC = () => {
  const { navigateToStep, stateRef } = useSteps();
  const walletStatus = useAtomValue(walletStatusAtom);

  const [openedLoadingModal, setOpenedLoadingModal] = useState(false);

  const isInitial = walletStatus === WalletStatus.Welcome;

  const methods = useMemo(
    () => (isInitial ? methodsInitial : methodsExisting),
    [isInitial]
  );

  const handleContinue = useCallback(
    (method: string, derivationPath: string) => {
      stateRef.current.addAccounts = `${
        isInitial ? "initial" : "existing"
      }-${method}`;
      stateRef.current.derivationPath = derivationPath;
      stateRef.current.importAddresses = null;

      if (isInitial && method === "auto") {
        setOpenedLoadingModal(true);
        return;
      }

      navigateToStep(AddAccountStep.VerifyToAdd);
    },
    [isInitial, navigateToStep, stateRef]
  );

  return (
    <>
      <SelectAddMethod methods={methods} onContinue={handleContinue} />
      {openedLoadingModal && (
        <LoadingModal onOpenChange={() => setOpenedLoadingModal(false)} />
      )}
    </>
  );
};

export default SelectAccountsToAddMethod;

const LoadingModal: FC<SecondaryModalProps> = ({ onOpenChange, ...rest }) => {
  const { stateRef, reset, navigateToStep } = useSteps();
  const { alert } = useDialog();
  const [loadingProgress, setLoadingProgress] = useState(0);

  const seedPhrase: SeedPharse | undefined = stateRef.current.seedPhrase;
  const derivationPath = stateRef.current.derivationPath;

  const neuterExtendedKey = useMemo(() => {
    return seedPhrase && derivationPath
      ? toNeuterExtendedKey(getSeedPhraseHDNode(seedPhrase), derivationPath)
      : null;
  }, [derivationPath, seedPhrase]);

  const networks = useAtomValue(allNetworksAtom);
  const preparedNetworks = useMemo(
    () => networks.filter(({ type }) => type === "mainnet"),
    [networks]
  );

  const loadActiveWallets = useCallback(async () => {
    if (!neuterExtendedKey) {
      return null;
    }

    const wallets = generatePreviewHDNodes(neuterExtendedKey, 0, 20);

    const resultAddresses: any[] = [];

    for (const [index, network] of preparedNetworks.entries()) {
      const provider = new ClientProvider(network.chainId);

      await Promise.all(
        wallets.map(async (wallet) => {
          const balance = await provider.getBalance(wallet.address);
          if (balance.gt(0)) {
            if (
              !resultAddresses.some(
                ({ address: extAdd }) => extAdd === wallet.address
              )
            ) {
              resultAddresses.push({
                address: wallet.address,
                index: wallet.index,
                isDisabled: true,
                isDefaultChecked: true,
              });
            }
          }
        })
      );

      setLoadingProgress(((index + 1) / preparedNetworks.length) * 100);
    }

    if (resultAddresses.length > 0) {
      return resultAddresses;
    }

    const newAddress = generatePreviewHDNodes(neuterExtendedKey, 0, 1);

    return [
      {
        address: newAddress[0].address,
        index: newAddress[0].index,
        isDisabled: true,
        isDefaultChecked: true,
      },
    ];
  }, [neuterExtendedKey, preparedNetworks]);

  const logicProcess = useCallback(async () => {
    try {
      const addresses = await loadActiveWallets();
      onOpenChange?.(false);
      if (addresses) {
        stateRef.current.importAddresses = addresses;
        navigateToStep(AddAccountStep.VerifyToAdd);
      } else {
        reset();
      }
    } catch (err: any) {
      alert({
        title: "Error!",
        content: err.message,
      });
    }
  }, [alert, loadActiveWallets, navigateToStep, onOpenChange, reset, stateRef]);

  useEffect(() => {
    logicProcess();
  }, [logicProcess]);

  return (
    <SecondaryModal
      open={true}
      header="Scanning Wallets..."
      headerClassName="mb-3"
      onOpenChange={onOpenChange}
      {...rest}
    >
      <div className="text-base text-brand-font text-center w-full break-words">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam
      </div>
      <div className="relative mt-5">
        <div className="loader">
          <span className="background" />
          <span className="animated" />
        </div>
        <span
          className={classNames(
            "absolute inset-0",
            "flex items-center justify-center",
            "text-2xl font-bold"
          )}
        >
          {preparePercentString(loadingProgress)}
        </span>
      </div>
    </SecondaryModal>
  );
};

const preparePercentString = (percent: number) =>
  (percent > 9 ? percent.toFixed(0) : `0${percent.toFixed(0)}`) + "%";
