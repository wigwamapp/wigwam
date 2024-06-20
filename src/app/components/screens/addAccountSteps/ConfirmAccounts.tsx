import { Fragment, memo, useCallback, useEffect, useMemo } from "react";
import classNames from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { fromProtectedString, toProtectedString } from "lib/crypto-utils";
import { useMaybeAtomValue } from "lib/atom-utils";
import { TReplace, useI18NUpdate } from "lib/ext/react";
import { NETWORK_ICON_MAP } from "fixtures/networks";

import { AccountSource, AddAccountParams, WalletStatus } from "core/types";
import { TEvent, addAccounts, trackEvent } from "core/client";
import { generatePreviewHDNodes } from "core/common";

import { AddAccountStep } from "app/nav";
import { useNextAccountName } from "app/hooks";
import { useDialog } from "app/hooks/dialog";
import { useSteps } from "app/hooks/steps";

import {
  addAccountModalAtom,
  allAccountsAtom,
  getNeuterExtendedKeyAtom,
  walletStateAtom,
} from "app/atoms";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import Button from "app/components/elements/Button";
import AutoIcon from "app/components/elements/AutoIcon";
import HashPreview from "app/components/elements/HashPreview";
import Avatar from "app/components/elements/Avatar";
import { ReactComponent as FileCheckIcon } from "app/icons/file-check.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";
import { ReactComponent as ImportIcon } from "app/icons/addaccount-import.svg";
import { ReactComponent as LedgerIcon } from "app/icons/addaccount-ledger.svg";

const ConfirmAccounts = memo<{
  addMore?: boolean;
  onLedgerOpened?: () => void;
}>(({ addMore, onLedgerOpened }) => {
  const { walletStatus, hasSeedPhrase } = useAtomValue(walletStateAtom);

  const setAccModalOpened = useSetAtom(addAccountModalAtom);

  const { stateRef, navigateToStep, reset } = useSteps();
  const { alert } = useDialog();

  useI18NUpdate();

  const initialSetup = walletStatus === WalletStatus.Welcome;
  const isUnlocked = walletStatus === WalletStatus.Unlocked;
  const derivationPath = stateRef.current.derivationPath || "m/44'/60'/0'/0";

  const rootNeuterExtendedKey = useMaybeAtomValue(
    hasSeedPhrase && derivationPath
      ? getNeuterExtendedKeyAtom(derivationPath)
      : null,
  );
  const existingAccounts = useMaybeAtomValue(isUnlocked && allAccountsAtom);
  const { getNextAccountName } = useNextAccountName();

  const findFirstUnusedAccount = useCallback(() => {
    if (!rootNeuterExtendedKey) return null;

    const extendedKey = fromProtectedString(rootNeuterExtendedKey);
    const allAccounts = generatePreviewHDNodes(extendedKey, 0, 30);

    for (const acc of allAccounts) {
      if (
        existingAccounts &&
        existingAccounts.some((a) => a.address === acc.address)
      ) {
        continue;
      }

      return {
        source: AccountSource.SeedPhrase,
        address: acc.address,
        name: getNextAccountName(),
        index: acc.index.toString(),
        isDisabled: false,
        isDefaultChecked: true,
        publicKey: toProtectedString(acc.publicKey),
      };
    }

    return null;
  }, [rootNeuterExtendedKey, existingAccounts, getNextAccountName]);

  const accountsToAdd = useMemo(() => {
    const accounts: any[] = (
      (stateRef.current.importAddresses as any[]) ?? []
    ).filter((acc) => acc.isDefaultChecked);

    if (!accounts.length && addMore) {
      const acc = findFirstUnusedAccount();
      if (acc) accounts.push(acc);
    }

    return accounts;
  }, [stateRef, addMore, findFirstUnusedAccount]);

  const oneSimpleAccount = ![
    AccountSource.SeedPhrase,
    AccountSource.Ledger,
  ].includes(accountsToAdd?.[0]?.source);

  useEffect(() => {
    if (!accountsToAdd.length) {
      reset();
    }
  }, [accountsToAdd, reset]);

  const handleContinue = useCallback(async () => {
    try {
      const addAccountsParams: AddAccountParams[] = accountsToAdd.map((acc) => {
        // eslint-disable-next-line
        const { isDefaultChecked, isDisabled, isAdded, index, ...base } = acc;

        return {
          ...base,
          derivationPath:
            (base.source === AccountSource.SeedPhrase ||
              base.source === AccountSource.Ledger) &&
            derivationPath
              ? `${derivationPath}/${index}`
              : undefined,
        };
      });

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
  }, [
    accountsToAdd,
    derivationPath,
    alert,
    initialSetup,
    navigateToStep,
    setAccModalOpened,
    stateRef,
  ]);

  const handleEditWallets = useCallback(() => {
    if (addMore) {
      stateRef.current.importAddresses = accountsToAdd;
      stateRef.current.derivationPath = derivationPath;
    }

    navigateToStep(AddAccountStep.EditAccounts);
  }, [addMore, stateRef, navigateToStep, accountsToAdd, derivationPath]);

  return (
    <>
      <AddAccountHeader
        className="mb-12"
        description={
          !addMore ? (
            <>
              {accountsToAdd[0]?.networks?.length > 0 ? (
                <>
                  Wigwam detected {accountsToAdd.length}{" "}
                  {accountsToAdd.length === 1 ? "wallet" : "wallets"} with
                  positive balances.
                </>
              ) : (
                <>This is the default wallet based on Secret Phrase.</>
              )}
              <br />
              You can add more wallets at any time later.
            </>
          ) : (
            <>
              Your new wallet was created with a Secret Phrase.
              <br />
              Confirm to add it, or choose another option like Ledger or Private
              Key.
            </>
          )
        }
      >
        {!addMore ? "Your wallets" : "Add more wallets"}
      </AddAccountHeader>

      <div className="relative w-full mx-auto max-w-md">
        <div
          className={classNames(
            "relative w-full",
            "rounded-xl",
            "bg-white bg-opacity-5",
            "p-3",
          )}
        >
          {accountsToAdd.length > 0 ? (
            accountsToAdd.map((item, i, arr) => {
              const last = i === arr.length - 1;

              const baseNetworkImages: string[] = [];
              let restNetworksCount = 0;

              for (const chainId of item.networks ?? []) {
                if (baseNetworkImages.length < 3) {
                  const src = NETWORK_ICON_MAP.get(chainId);

                  if (src) {
                    baseNetworkImages.push(src);
                    continue;
                  }
                }

                restNetworksCount++;
              }

              return (
                <Fragment key={i}>
                  <div
                    className={classNames(
                      "w-full p-1",
                      "flex items-stretch",
                      "rounded-lg",
                    )}
                  >
                    <AutoIcon
                      seed={item.address}
                      source="dicebear"
                      type="personas"
                      className={classNames(
                        "h-[3rem] w-[3rem] min-w-[3rem]",
                        "bg-black/40",
                        "rounded-[.5rem]",
                      )}
                    />

                    <div
                      className={classNames(
                        "pl-4",
                        "flex flex-col items-start justify-around",
                        "text-base text-brand-light",
                        "w-full min-w-0",
                      )}
                    >
                      <span
                        className={classNames(
                          "flex items-center",
                          "min-w-0 w-full",
                          "font-bold",
                        )}
                      >
                        <span className="truncate min-w-0">
                          <TReplace msg={item.name ?? ""} />
                        </span>
                      </span>

                      <HashPreview
                        hash={item.address}
                        className="text-brand-inactivelight"
                      />
                    </div>

                    {baseNetworkImages.length > 0 && (
                      <>
                        <div className="flex-1" />

                        <div className="flex items-center">
                          {baseNetworkImages.map((src, j) => (
                            <Avatar
                              key={j}
                              src={src}
                              withBg={false}
                              className="h-8 w-8 -ml-3"
                            />
                          ))}

                          {restNetworksCount > 0 ? (
                            <div className="ml-1 text-base font-medium text-brand-inactivelight">
                              +{restNetworksCount}
                            </div>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>

                  {!last && (
                    <div
                      key={i}
                      className="h-px w-full bg-brand-main/[.07] my-3"
                    />
                  )}
                </Fragment>
              );
            })
          ) : (
            <p className="p-2 text-sm text-center text-brand-lightgray">
              You have reached the maximum number of wallets - <b>30</b>.
              <br />
              Use another profile to increase their total number.
            </p>
          )}
        </div>

        {!oneSimpleAccount && (
          <div className="mt-5 w-full flex flex-col items-center justify-center">
            <Button
              theme="tertiary"
              onClick={handleEditWallets}
              className={classNames(
                "text-sm text-brand-light",
                "!py-1 !px-2 !min-w-0",
                "!font-normal",
                "items-center",
                "opacity-50 hover:opacity-90 focus:opacity-90",
              )}
            >
              Edit wallets
            </Button>
          </div>
        )}
      </div>

      {addMore && (
        <div className="mt-8 w-full mx-auto max-w-md flex items-stretch flex-wrap">
          {[
            {
              Icon: ImportIcon,
              children: "Import",
              action: () => {
                navigateToStep(AddAccountStep.ImportPrivateKey);
              },
            },
            "space" as const,
            {
              Icon: LedgerIcon,
              children: "Ledger",
              action: () => {
                onLedgerOpened?.();
              },
            },
            ...(process.env.NODE_ENV === "development"
              ? [
                  "space" as const,
                  {
                    Icon: OpenedEyeIcon,
                    children: "Watch only",
                    action: () => {
                      navigateToStep(AddAccountStep.AddWatchOnlyAccount);
                    },
                  },
                ]
              : []),
          ].map((item, i) => {
            if (item === "space") {
              return <div key={i} className="flex-1" />;
            }

            const { Icon, children, action } = item;

            return (
              <Button
                key={i}
                theme="secondary"
                className={classNames(
                  "w-[calc(50%-0.5rem)]",
                  "!py-2 !px-4",
                  "!justify-start",
                  "opacity-75 hover:opacity-100 focus:opacity-100",
                  i > 3 && "mt-2",
                )}
                onClick={action}
              >
                <Icon className="h-8 w-auto mr-4" />
                {children}
              </Button>
            );
          })}
        </div>
      )}

      <AddAccountContinueButton onContinue={handleContinue}>
        <FileCheckIcon className="h-6 w-auto mr-2" />
        Add wallets
      </AddAccountContinueButton>
      {/* <Button
        theme="clean"
        className="absolute right-8 bottom-5 z-20 font-semibold"
        onClick={handleSupport}
      >
        <SupportIcon className="mr-2" />
        Support
      </Button> */}
    </>
  );
});

export default ConfirmAccounts;
