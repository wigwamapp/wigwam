import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";

import { DEFAULT_NETWORKS } from "fixtures/networks";
import { AccountSource, SeedPharse, WalletStatus } from "core/types";
import {
  generatePreviewHDNodes,
  getSeedPhraseHDNode,
  toNeuterExtendedKey,
} from "core/common";
import { ClientProvider } from "core/client";

import { walletStatusAtom } from "app/atoms";
import { AddAccountStep } from "app/nav";
import { useSteps } from "app/hooks/steps";
import { LoadingHandler, useDialog } from "app/hooks/dialog";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";

import SelectAddMethod, { MethodsProps } from "./SelectAddMethod";
import { withHumanDelay } from "../../../utils";
import retry from "async-retry";
import Transport from "@ledgerhq/hw-transport";
import { Spinner } from "./ChooseAddAccountWay";

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
  const { waitLoading } = useDialog();

  const [openedLoadingModal, setOpenedLoadingModal] = useState(false);
  const [connectionState, setConnectionState] = useState<
    "loading" | "connectApp"
  >("loading");

  const isInitial = walletStatus === WalletStatus.Welcome;
  const isHardDevice: "ledger" | undefined = stateRef.current.hardDevice;

  const methods = useMemo(
    () => (isInitial ? methodsInitial : methodsExisting),
    [isInitial]
  );

  const transportRef = useRef<Transport>();

  const handleConnect = useCallback<LoadingHandler>(
    (onClose, args) =>
      withHumanDelay(async () => {
        const [derivationPath] = args as [string];

        try {
          let closed = false;
          let extendedKey = "";
          onClose(() => (closed = true));

          const [{ default: LedgerEth }, { LedgerTransport, getExtendedKey }] =
            await Promise.all([
              import("@ledgerhq/hw-app-eth"),
              import("lib/ledger"),
            ]);

          return await retry(
            async () => {
              await transportRef.current?.close();
              transportRef.current = await LedgerTransport.create();

              onClose(() => transportRef.current?.close());

              const { name: currentApp } = await getAppInfo(
                transportRef.current
              );
              if (closed) return false;

              if (currentApp !== "Ethereum") {
                if (currentApp !== "BOLOS") {
                  await disconnectFromConnectedApp(transportRef.current);
                  await timeout(500);
                  if (closed) return false;
                }

                setConnectionState("connectApp");
                await connectToEthereumApp(transportRef.current);
                await timeout(500);
                if (closed) return false;
              }

              const ledgerEth = new LedgerEth(transportRef.current);
              if (closed) return false;

              const { publicKey, chainCode } = await ledgerEth.getAddress(
                derivationPath,
                false,
                true
              );
              if (closed) return false;

              extendedKey = getExtendedKey(publicKey, chainCode!);
              stateRef.current.extendedKey = extendedKey;
              return true;
            },
            { retries: 5, maxTimeout: 2_000 }
          );
        } catch (err: any) {
          const msg = err?.message ?? "Unknown error";

          if (msg === "user closed popup") return false;

          throw new Error(msg);
        }
      }),
    [stateRef]
  );

  const handleContinue = useCallback(
    async (method: string, derivationPath: string) => {
      stateRef.current.addAccounts = `${
        isInitial ? "initial" : "existing"
      }-${method}`;
      stateRef.current.derivationPath = derivationPath;
      stateRef.current.importAddresses = null;

      if (isHardDevice) {
        const answer = await waitLoading({
          title: "Loading...",
          headerClassName: "mb-3",
          content: (
            <>
              <span className="mb-5">
                Please proceed connecting to the ledger.
              </span>
              {connectionState === "loading" && <Spinner />}
              {connectionState === "connectApp" &&
                "Please connect to Ethereum app"}
            </>
          ),
          loadingHandler: handleConnect,
          handlerParams: [derivationPath],
        });

        if (answer) {
          if (isInitial && method === "auto") {
            setOpenedLoadingModal(true);
            return;
          }

          navigateToStep(AddAccountStep.VerifyToAdd);
          return;
        }

        return;
      }

      if (isInitial && method === "auto") {
        setOpenedLoadingModal(true);
        return;
      }

      navigateToStep(AddAccountStep.VerifyToAdd);
    },
    [
      connectionState,
      handleConnect,
      isHardDevice,
      isInitial,
      navigateToStep,
      stateRef,
      waitLoading,
    ]
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

const preparedNetworks = DEFAULT_NETWORKS.filter(
  ({ type }) => type === "mainnet"
);

const LoadingModal: FC<SecondaryModalProps> = ({ onOpenChange, ...rest }) => {
  const { stateRef, reset, navigateToStep } = useSteps();
  const { alert } = useDialog();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const isUnmountedRef = useRef(false);

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
        derivationPath
      );
    }

    return null;
  }, [derivationPath, extendedKey, seedPhrase]);

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
          const balance = await provider
            .getBalance(wallet.address)
            .catch(() => null);

          if (balance?.gt(0)) {
            if (
              !resultAddresses.some(
                ({ address: extAdd }) => extAdd === wallet.address
              )
            ) {
              resultAddresses.push({
                source: AccountSource.SeedPhrase,
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

    const newAddress = wallets[0];

    return [
      {
        source: AccountSource.SeedPhrase,
        address: newAddress.address,
        index: newAddress.index,
        isDisabled: true,
        isDefaultChecked: true,
      },
    ];
  }, [neuterExtendedKey]);

  const logicProcess = useCallback(async () => {
    try {
      const addresses = await loadActiveWallets();
      if (!isUnmountedRef.current) {
        onOpenChange?.(false);
        if (addresses) {
          stateRef.current.importAddresses = addresses;
          navigateToStep(AddAccountStep.VerifyToAdd);
        } else {
          reset();
        }
      }
    } catch (err: any) {
      alert({
        title: "Error!",
        content: err.message,
      }).then(() => onOpenChange?.(false));
    }
  }, [alert, loadActiveWallets, navigateToStep, onOpenChange, reset, stateRef]);

  useEffect(() => {
    logicProcess();

    return () => {
      isUnmountedRef.current = true;
    };
  }, [logicProcess]);

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
        step, where you can verify all founded wallets.
      </div>
      <div className="relative mt-5 w-[7.5rem] h-[7.5rem]">
        <CircularProgress percentage={loadingProgress} />
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
        <stop offset="50%" stopColor="#FF002D" />
        <stop offset="100%" stopColor="#FF7F44" />
      </linearGradient>
    </svg>
  );
};

const preparePercentString = (percent: number) =>
  (percent > 9 ? percent.toFixed(0) : `0${percent.toFixed(0)}`) + "%";

const getAppInfo = async (
  transport: Transport
): Promise<{
  name: string;
  version: string;
  flags: number | Buffer;
}> => {
  const r = await transport.send(0xb0, 0x01, 0x00, 0x00);
  let i = 0;
  const format = r[i++];

  if (format !== 1) {
    throw new Error("getAppAndVersion: format not supported");
  }

  const nameLength = r[i++];
  const name = r.slice(i, (i += nameLength)).toString("ascii");
  const versionLength = r[i++];
  const version = r.slice(i, (i += versionLength)).toString("ascii");
  const flagLength = r[i++];
  const flags = r.slice(i, (i += flagLength));
  return {
    name,
    version,
    flags,
  };
};

const connectToEthereumApp = async (transport: Transport): Promise<void> => {
  await transport.send(
    0xe0,
    0xd8,
    0x00,
    0x00,
    Buffer.from("Ethereum", "ascii")
  );
};

const disconnectFromConnectedApp = async (
  transport: Transport
): Promise<void> => {
  await transport.send(0xb0, 0xa7, 0x00, 0x00);
};

const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
