import {
  ChangeEvent,
  FC,
  PropsWithChildren,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import useForceUpdate from "use-force-update";
import { ethers } from "ethers";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { replaceT } from "lib/ext/i18n";
import { useI18NUpdate } from "lib/ext/i18n/react";
import { useSafeState } from "lib/react-hooks/useSafeState";

import { INITIAL_NETWORK } from "fixtures/networks";
import { AccountSource, AddAccountParams, Network } from "core/types";
import { ClientProvider } from "core/client";

import { allNetworksAtom } from "app/atoms";
import {
  TippySingletonProvider,
  useLazyAllNetworks,
  useLazyNetwork,
  useNextAccountName,
} from "app/hooks";
import { useDialog } from "app/hooks/dialog";
import { useSteps } from "app/hooks/steps";
import NetworkSelect from "app/components/elements/NetworkSelectPrimitive";
import HashPreview from "app/components/elements/HashPreview";
import AutoIcon from "app/components/elements/AutoIcon";
import Input from "app/components/elements/Input";
import Checkbox from "app/components/elements/Checkbox";
import Tooltip from "app/components/elements/Tooltip";
import TooltipIcon from "app/components/elements/TooltipIcon";
import PrettyAmount from "app/components/elements/PrettyAmount";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import { ReactComponent as EditIcon } from "app/icons/edit.svg";
import { ReactComponent as FileCheckIcon } from "app/icons/file-check.svg";

const BALANCE_CHECK = false;

type AccountsToVerifyProps = Omit<AddAccountParams, "name"> & {
  name?: string;
  isDisabled?: boolean;
  isDefaultChecked?: boolean;
  isAdded?: boolean;
  index?: string;
};

export type AccountsToAddProps = {
  accountsToVerify: AccountsToVerifyProps[];
  onContinue: (params: AddAccountParams[]) => void;
};

const AccountsToAdd: FC<AccountsToAddProps> = ({
  accountsToVerify,
  onContinue,
}) => {
  const { stateRef } = useSteps();
  const networks = useAtomValue(allNetworksAtom);
  const { getNextAccountName } = useNextAccountName();

  const derivationPath = stateRef.current.derivationPath;
  const alreadyAddedAccounts: any[] = stateRef.current.importAddresses ?? [];

  const preparedNetworks = useMemo(
    () => networks.filter(({ type }) => type === "mainnet"),
    [networks],
  );
  const allNetworks = useLazyAllNetworks() ?? preparedNetworks;
  const { alert } = useDialog();

  useI18NUpdate();
  const currentNetwork = useLazyNetwork();

  const [network, setNetwork] = useState(currentNetwork ?? INITIAL_NETWORK);
  const provider = useMemo(
    () => new ClientProvider(network.chainId),
    [network],
  );

  const onNetworkChange = useCallback(
    (chainId: number) => {
      const netw = allNetworks.find(({ chainId: chi }) => chi === chainId)!;
      setNetwork(netw);
    },
    [allNetworks],
  );

  const addressesToAddRef = useRef(
    new Set<string>(alreadyAddedAccounts.map((item) => item.address)),
  );
  const addressesNamesRef = useRef(new Map<string, string>());
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const addressesToAdd = addressesToAddRef.current;

    let inx = 0;
    accountsToVerify.forEach(({ address, name, isDefaultChecked, isAdded }) => {
      if (!addressesToAdd.has(address) && !isAdded && isDefaultChecked) {
        addressesToAdd.add(address);
      }

      const addressName = addressesNamesRef.current.get(address);
      if (!addressName) {
        addressesNamesRef.current.set(address, name ?? getNextAccountName(inx));
      }
      if (!isAdded) {
        inx += 1;
      }

      setThToggleChecked(
        addressesToAdd.size ===
          accountsToVerify.filter(({ isAdded }) => !isAdded).length,
      );
    });

    forceUpdate();
  }, [accountsToVerify, forceUpdate, getNextAccountName]);

  const toggleAddress = useCallback(
    (address: string) => {
      const addressesToAdd = addressesToAddRef.current;
      if (addressesToAdd.has(address)) {
        addressesToAdd.delete(address);
      } else {
        addressesToAdd.add(address);
      }

      setThToggleChecked(
        addressesToAdd.size ===
          accountsToVerify.filter(({ isAdded }) => !isAdded).length,
      );

      forceUpdate();
    },
    [accountsToVerify, forceUpdate],
  );

  const [thToggleChecked, setThToggleChecked] = useState(false);

  const toggleAllAddresses = useCallback(
    (remove = false) => {
      const addressesToAdd = addressesToAddRef.current;
      accountsToVerify.forEach(({ address, isDisabled }) => {
        if (!isDisabled) {
          if (remove) {
            if (addressesToAdd.has(address)) {
              addressesToAdd.delete(address);
            }
          } else {
            if (!addressesToAdd.has(address)) {
              addressesToAdd.add(address);
            }
          }
        }
      });
      setThToggleChecked((prevState) => !prevState);
      forceUpdate();
    },
    [accountsToVerify, forceUpdate],
  );

  const changeWalletName = useCallback(
    (address: string, name: string) => {
      addressesNamesRef.current.set(address, name);
      const addressesToAdd = addressesToAddRef.current;
      if (!addressesToAdd.has(address)) {
        addressesToAdd.add(address);
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleContinue = useCallback(async () => {
    try {
      if (addressesToAddRef.current.size <= 0) {
        throw new Error("You have to select at least one wallet to add.");
      }

      const addressesToAdd = Array.from(addressesToAddRef.current);

      const addAccountsParams = addressesToAdd.map((address) => {
        // eslint-disable-next-line
        const { isDefaultChecked, isDisabled, isAdded, index, ...adrs } =
          accountsToVerify.find(({ address: a }) => a === address)!; // TODO: Refactor
        const addressName = addressesNamesRef.current.get(address);

        if (!addressName) {
          throw new Error("You have to fill all the wallets' names.");
        }

        return {
          derivationPath:
            (adrs.source === AccountSource.SeedPhrase ||
              adrs.source === AccountSource.Ledger) &&
            derivationPath
              ? `${derivationPath}/${index}`
              : undefined,
          ...adrs,
          name: addressName,
        } as AddAccountParams;
      });

      onContinue(addAccountsParams);
    } catch (err: any) {
      alert({ title: "Error!", content: err.message });
    }
  }, [onContinue, accountsToVerify, derivationPath, alert]);

  const isIndexExisting = useMemo(
    () =>
      !!accountsToVerify.find(
        ({ index }) => index !== undefined && index !== null && index !== "",
      ),
    [accountsToVerify],
  );

  if (!accountsToVerify) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col w-full max-w-[45.25rem] mx-auto">
        <div className="flex mb-9">
          <h1 className="text-[2rem] font-bold mr-auto">Edit wallets</h1>
          {BALANCE_CHECK && (
            <div className="flex items-center ml-auto">
              <Tooltip
                content={
                  <p>
                    Use this network switch to preview balances of your wallets
                    to select the right one.
                    <br />
                    It only switches network for the &#34;Balance&#34; column on
                    this page.
                    <br />
                    You will be able to use these wallets with any network.
                  </p>
                }
                placement="left-start"
                size="large"
                className="mr-3"
              >
                <TooltipIcon />
              </Tooltip>
              <NetworkSelect
                networks={allNetworks}
                currentNetwork={network}
                onNetworkChange={onNetworkChange}
                withAction={false}
                source="wallet-setup-accounts"
              />
            </div>
          )}
        </div>
        <table className="text-brand-light">
          <thead>
            <tr className="border-b border-brand-main/[.07]">
              <Th className="align-middle">
                <span className="flex align-center">
                  <CheckboxPrimitive.Root
                    checked={thToggleChecked}
                    onCheckedChange={(checked) =>
                      accountsToVerify.length !== 1 &&
                      toggleAllAddresses(!checked)
                    }
                  >
                    <Checkbox
                      disabled={accountsToVerify.length === 1}
                      checked={thToggleChecked}
                    />
                  </CheckboxPrimitive.Root>
                </span>
              </Th>
              <Th />
              <Th className="!pl-7 !text-brand-light align-middle">
                <Tooltip content="You can edit the wallet’s name">
                  <span className="flex align-center font-semibold">
                    Name
                    <EditIcon className="ml-0.5" />
                  </span>
                </Tooltip>
              </Th>
              {isIndexExisting && <Th>Index</Th>}
              <Th>Address</Th>
              {BALANCE_CHECK && <Th>Balance</Th>}
            </tr>
          </thead>
          <tbody>
            <TippySingletonProvider>
              {accountsToVerify.map(
                ({ address, isDisabled, isAdded, index }, i) => {
                  const isAddedItem =
                    addressesToAddRef.current.has(address) || isAdded;
                  const addressName = replaceT(
                    addressesNamesRef.current.get(address) ??
                      getNextAccountName(i),
                  );

                  return (
                    <Account
                      key={`${network.chainId}_${address}`}
                      name={addressName}
                      index={index}
                      address={address}
                      provider={provider}
                      network={network}
                      isAdded={!!isAddedItem}
                      isAddedTag={isAdded}
                      onToggleAdd={() => toggleAddress(address)}
                      isDisabled={isDisabled}
                      isIndexExisting={isIndexExisting}
                      onChangeWalletName={(newName: string) =>
                        changeWalletName(address, newName)
                      }
                      className={
                        i === accountsToVerify.length - 1 ? "!border-none" : ""
                      }
                    />
                  );
                },
              )}
            </TippySingletonProvider>
          </tbody>
        </table>
      </div>

      <AddAccountContinueButton onContinue={handleContinue}>
        <FileCheckIcon className="h-6 w-auto mr-2" />
        Add wallets
      </AddAccountContinueButton>
    </>
  );
};

export default AccountsToAdd;

type AccountProps = {
  name: string;
  address: string;
  provider: ethers.Provider;
  index?: string;
  network: Network;
  isAdded: boolean;
  isDisabled?: boolean;
  isAddedTag?: boolean;
  isIndexExisting?: boolean;
  onToggleAdd: () => void;
  onChangeWalletName: (name: string) => void;
  className?: string;
};

const Account = memo<AccountProps>(
  ({
    name,
    index,
    address,
    provider,
    network,
    isAdded,
    isDisabled = false,
    isAddedTag = false,
    isIndexExisting = true,
    onToggleAdd,
    onChangeWalletName,
    className,
  }) => {
    const [balance, setBalance] = useSafeState<bigint | null>(null);

    useEffect(() => {
      if (!BALANCE_CHECK) return;

      provider
        .getBalance(address)
        .then((b) => setBalance(b))
        .catch(console.error);
    }, [provider, address, setBalance]);

    const baseAsset = useMemo(
      () =>
        balance !== null
          ? {
              symbol: network.nativeCurrency.symbol,
              name: network.nativeCurrency.name,
              balance,
            }
          : undefined,
      [network, balance],
    );

    return (
      <tr className={classNames("border-b border-brand-main/[.07]", className)}>
        <Td widthMaxContent className="pr-2">
          <span className="flex align-center">
            <CheckboxPrimitive.Root
              onCheckedChange={onToggleAdd}
              checked={isAdded}
              disabled={isDisabled}
            >
              <Checkbox checked={isAdded} disabled={isDisabled} />
            </CheckboxPrimitive.Root>
          </span>
        </Td>
        <Td widthMaxContent className="pl-2 pr-0">
          <AutoIcon
            seed={address}
            source="dicebear"
            type="personas"
            className={classNames(
              "h-10 w-10",
              "rounded-[.625rem]",
              "bg-black/20",
            )}
          />
        </Td>
        <Td widthMaxContent className="min-w-[16rem]">
          {!isAddedTag ? (
            <Input
              value={name}
              onChange={(evt: ChangeEvent<HTMLInputElement>) =>
                onChangeWalletName(evt.target.value)
              }
              theme="clean"
              error={!name}
              inputClassName="!font-bold min-w-[16rem]"
            />
          ) : (
            <div className="pl-4 flex items-center max-w-[16rem]">
              <span className="!font-bold min-width-0 truncate">{name}</span>
              {isAddedTag && (
                <span
                  className={classNames(
                    "py-1 px-2",
                    "rounded-md",
                    "bg-brand-main/40",
                    "border border-brand-main/50",
                    "shadow-addaccountmodal",
                    "text-xs font-medium",
                    "ml-3",
                  )}
                >
                  Added
                </span>
              )}
            </div>
          )}
        </Td>
        {isIndexExisting && <Td widthMaxContent>{index}</Td>}
        <Td widthMaxContent>
          <HashPreview hash={address} />
        </Td>
        {BALANCE_CHECK && (
          <Td className="font-bold">
            {baseAsset ? (
              <PrettyAmount
                amount={ethers.formatEther(baseAsset.balance)}
                currency={baseAsset.symbol}
                copiable={true}
                isMinified
                className="font-bold"
              />
            ) : null}
          </Td>
        )}
      </tr>
    );
  },
);

type TableDate = {
  widthMaxContent?: boolean;
  className?: string;
};

const Th: FC<PropsWithChildren<TableDate>> = ({ className, children }) => (
  <th
    className={classNames(
      "py-1.5 px-3",
      "text-sm text-left text-brand-gray font-semibold",
      className,
    )}
  >
    {children}
  </th>
);

const Td: FC<PropsWithChildren<TableDate>> = ({
  widthMaxContent,
  className,
  children,
}) => (
  <td
    className={classNames(
      "py-2.5 px-3 text-base",
      widthMaxContent && "w-[1%] whitespace-nowrap",
      className,
    )}
  >
    {children}
  </td>
);
