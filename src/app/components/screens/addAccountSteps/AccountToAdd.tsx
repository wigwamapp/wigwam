import {
  FC,
  memo,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEvent,
} from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import useForceUpdate from "use-force-update";
import { ethers } from "ethers";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { replaceT } from "lib/ext/i18n";
import { useI18NUpdate } from "lib/ext/i18n/react";

import { INITIAL_NETWORK } from "fixtures/networks";
import { AddHDAccountParams, AccountSource, Network } from "core/types";
import { ClientProvider } from "core/client";

import { allNetworksAtom } from "app/atoms";
import { TippySingletonProvider } from "app/hooks";
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

type AddressProps = {
  address: string;
  name?: string;
  isDisabled?: boolean;
  isDefaultChecked?: boolean;
  isAdded?: boolean;
  index: number;
};

type AccountsToAddProps = {
  addresses: AddressProps[];
  onContinue: (params: AddHDAccountParams[]) => void;
};

const rootDerivationPath = "m/44'/60'/0'/0";

const AccountsToAdd: FC<AccountsToAddProps> = ({ addresses, onContinue }) => {
  const { stateRef } = useSteps();
  const networks = useAtomValue(allNetworksAtom);

  const derivationPath = stateRef.current.derivationPath;

  const preparedNetworks = useMemo(
    () => networks.filter(({ type }) => type === "mainnet"),
    [networks]
  );
  const { alert } = useDialog();

  useI18NUpdate();

  const [network, setNetwork] = useState(INITIAL_NETWORK);
  const provider = useMemo(
    () => new ClientProvider(network.chainId),
    [network]
  );

  const onNetworkChange = useCallback(
    (chainId: number) => {
      const netw = preparedNetworks.find(
        ({ chainId: chi }) => chi === chainId
      )!;
      setNetwork(netw);
    },
    [preparedNetworks]
  );

  const addressesToAddRef = useRef(new Set<string>());
  const addressesNamesRef = useRef(new Map<string, string>());
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const addressesToAdd = addressesToAddRef.current;

    addresses.forEach(({ address, name, isDefaultChecked, isAdded }, i) => {
      if (!addressesToAdd.has(address) && !isAdded && isDefaultChecked) {
        addressesToAdd.add(address);
      }

      const addressName = addressesNamesRef.current.get(address);
      if (!addressName) {
        addressesNamesRef.current.set(address, name ?? `Wallet ${i + 1}`);
      }

      setThToggleChecked(
        addressesToAdd.size ===
          addresses.filter(({ isAdded }) => !isAdded).length
      );
    });

    forceUpdate();
  }, [addresses, forceUpdate]);

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
          addresses.filter(({ isAdded }) => !isAdded).length
      );

      forceUpdate();
    },
    [addresses, forceUpdate]
  );

  const [thToggleChecked, setThToggleChecked] = useState(false);

  const toggleAllAddresses = useCallback(
    (remove = false) => {
      const addressesToAdd = addressesToAddRef.current;
      addresses.forEach(({ address, isDisabled }) => {
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
    [addresses, forceUpdate]
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
    [forceUpdate]
  );

  const handleContinue = useCallback(async () => {
    try {
      if (addressesToAddRef.current.size <= 0) {
        throw new Error("You have to select at least one wallet to add.");
      }

      const addressesToAdd = Array.from(addressesToAddRef.current);

      const addAccountsParams: AddHDAccountParams[] = addressesToAdd.map(
        (address) => {
          const hdIndex = addresses.find(
            ({ address: a }) => a === address
          )!.index;
          const addressName = addressesNamesRef.current.get(address);

          if (!addressName) {
            throw new Error("You have to fill all the wallets' names.");
          }

          return {
            source: AccountSource.SeedPhrase,
            name: addressName ?? `Wallet ${hdIndex + 1}`,
            derivationPath: `${
              derivationPath ?? rootDerivationPath
            }/${hdIndex}`,
          };
        }
      );

      onContinue(addAccountsParams);
    } catch (err: any) {
      alert({ title: "Error!", content: err.message });
    }
  }, [onContinue, addresses, derivationPath, alert]);

  if (!addresses) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col w-full max-w-[45.25rem] mx-auto">
        <div className="flex mb-9">
          <h1 className="text-[2rem] font-bold mr-auto">Wallets to add</h1>
          <div className="flex items-center ml-auto">
            <Tooltip
              content={
                <>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
                    aliquam, purus sit amet luctus venenatis, lectus magna
                    fringilla urna, porttitor rhoncus dolor purus non enim
                    praesent elementum facilisis leo
                  </p>
                  <p className="mt-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
                    aliquam, purus sit amet luctus venenatis, lectus magna
                    fringilla urna, porttitor rhoncus
                  </p>
                </>
              }
              placement="left-start"
              size="large"
              className="mr-3"
            >
              <TooltipIcon />
            </Tooltip>
            <NetworkSelect
              networks={preparedNetworks}
              currentNetwork={network}
              onNetworkChange={onNetworkChange}
            />
          </div>
        </div>
        <table className="text-brand-light">
          <thead>
            <tr className="border-b border-brand-main/[.07]">
              <Th className="align-middle">
                <span className="flex align-center">
                  <CheckboxPrimitive.Root
                    checked={thToggleChecked}
                    onCheckedChange={(checked) =>
                      addresses.length !== 1 && toggleAllAddresses(!checked)
                    }
                  >
                    <Checkbox
                      disabled={addresses.length === 1}
                      checked={thToggleChecked}
                    />
                  </CheckboxPrimitive.Root>
                </span>
              </Th>
              <Th />
              <Th className="!pl-7 !text-brand-light align-middle">
                <Tooltip content="You can edit wallet's name">
                  <span className="flex align-center font-semibold">
                    Name
                    <EditIcon className="ml-0.5" />
                  </span>
                </Tooltip>
              </Th>
              <Th>Index</Th>
              <Th>Address</Th>
              <Th>Balance</Th>
            </tr>
          </thead>
          <tbody>
            <TippySingletonProvider>
              {addresses.map(({ address, isDisabled, isAdded, index }, i) => {
                const isAddedItem =
                  addressesToAddRef.current.has(address) || isAdded;
                const addressName = replaceT(
                  addressesNamesRef.current.get(address) ?? `Wallet ${index}`
                );

                return (
                  <Account
                    key={address}
                    name={addressName}
                    index={index}
                    address={address}
                    provider={provider}
                    network={network}
                    isAdded={!!isAddedItem}
                    isAddedTag={isAdded}
                    onToggleAdd={() => toggleAddress(address)}
                    isDisabled={isDisabled}
                    onChangeWalletName={(newName: string) =>
                      changeWalletName(address, newName)
                    }
                    className={i === addresses.length - 1 ? "!border-none" : ""}
                  />
                );
              })}
            </TippySingletonProvider>
          </tbody>
        </table>
      </div>
      <AddAccountContinueButton onContinue={handleContinue} />
    </>
  );
};

export default AccountsToAdd;

type AccountProps = {
  name: string;
  address: string;
  provider: ethers.providers.Provider;
  index: number;
  network: Network;
  isAdded: boolean;
  isDisabled?: boolean;
  isAddedTag?: boolean;
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
    onToggleAdd,
    onChangeWalletName,
    className,
  }) => {
    const [balance, setBalance] = useState<ethers.BigNumber | null>(null);

    useEffect(() => {
      let mounted = true;

      provider
        .getBalance(address)
        .then((b) => mounted && setBalance(b))
        .catch(console.error);

      return () => {
        mounted = false;
      };
    }, [provider, address, setBalance]);

    const baseAsset = useMemo(
      () =>
        balance
          ? {
              symbol: network.nativeCurrency.symbol,
              name: network.nativeCurrency.name,
              balance,
            }
          : undefined,
      [network, balance]
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
              "bg-black/20"
            )}
          />
        </Td>
        <Td widthMaxContent className="min-w-[16rem]">
          {!isDisabled ? (
            <Input
              value={name}
              onChange={(evt: ChangeEvent<HTMLInputElement>) =>
                onChangeWalletName(evt.target.value)
              }
              theme="clean"
              disabled={isDisabled}
              error={!name && !isDisabled}
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
                    "ml-3"
                  )}
                >
                  Added
                </span>
              )}
            </div>
          )}
        </Td>
        <Td widthMaxContent>{index}</Td>
        <Td widthMaxContent>
          <HashPreview hash={address} />
        </Td>
        <Td className="font-bold">
          <PrettyAmount
            amount={baseAsset ? ethers.utils.formatEther(baseAsset.balance) : 0}
            currency={
              baseAsset ? baseAsset.symbol : network.nativeCurrency.symbol
            }
            copiable={true}
            isMinified
            className="font-bold"
          />
        </Td>
      </tr>
    );
  }
);

type TableDate = {
  widthMaxContent?: boolean;
  className?: string;
};

const Th: FC<TableDate> = ({ className, children }) => (
  <th
    className={classNames(
      "py-1.5 px-3",
      "text-sm text-left text-brand-gray font-semibold",
      className
    )}
  >
    {children}
  </th>
);

const Td: FC<TableDate> = ({ widthMaxContent, className, children }) => (
  <td
    className={classNames(
      "py-2.5 px-3 text-base",
      widthMaxContent && "w-[1%] whitespace-nowrap",
      className
    )}
  >
    {children}
  </td>
);
