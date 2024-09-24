import {
  CSSProperties,
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
import { Command } from "cmdk";
import Fuse from "fuse.js";
import { useAtom, useSetAtom } from "jotai";
import { useVirtualizer } from "@tanstack/react-virtual";
import BigNumber from "bignumber.js";
import { useLazyAtomValue } from "lib/atom-utils";
import { wrapIpfsNetIcon } from "lib/wigwam-static";

import { Network } from "core/types";
import { EvmNetwork } from "core/common/chainList";
import { compareNetworks, setupNewNetwork } from "core/common/network";

import { NETWORK_SEARCH_OPTIONS } from "app/defaults";
import { useAccounts, useChainId, useLazyAllNetworks } from "app/hooks";
import {
  allEvmNetworksAtom,
  chainIdAtom,
  getAllNativeTokensAtom,
  testNetworksAtom,
} from "app/atoms";
import { Page } from "app/nav";
import { openInTab } from "app/helpers";
import { ReactComponent as ChevronDownIcon } from "app/icons/chevron-down-rounded.svg";
import { ReactComponent as AddIcon } from "app/icons/assets-add.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";

import FiatAmount from "../elements/FiatAmount";
import ScrollAreaContainer from "../elements/ScrollAreaContainer";
import NetworkIcon from "../elements/NetworkIcon";
import { useDialog } from "app/hooks/dialog";
import Switcher from "../elements/Switcher";
import Button from "../elements/Button";
import SecondaryModal, {
  SecondaryModalProps,
} from "../elements/SecondaryModal";
import SearchInput from "../elements/SearchInput";

type Size = "small" | "large";

const NetworksButton = ({
  children,
  size = "large",
  className,
  onChange,
}: PropsWithChildren<{
  size?: Size;
  className?: string;
  onChange?: (chainId: number) => void;
}>) => {
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <>
      <button
        type="button"
        className={classNames(
          "w-full h-full !min-w-0",
          "bg-brand-main/5 hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
          "transition-colors",
          "rounded-[.625rem]",
          "px-3 py-2",
          "flex items-center justify-between text-base font-bold",
          className,
        )}
        onClick={() => setModalOpened(true)}
      >
        {children}

        <ChevronDownIcon
          className={classNames("w-[1.125rem] h-[1.125rem]", "h-auto")}
        />
      </button>

      <NetworksModal
        key={String(modalOpened)}
        open={modalOpened}
        size={size}
        onOpenChange={setModalOpened}
        onChange={onChange}
      />
    </>
  );
};

export default NetworksButton;

const NetworksModal: FC<
  SecondaryModalProps & { size?: Size; onChange?: (chainId: number) => void }
> = ({ onOpenChange, size = "large", onChange, ...rest }) => {
  const [testnetsVisibility, toggleTestnetsVisibility] =
    useAtom(testNetworksAtom);

  const chainId = useChainId();
  const setChainId = useSetAtom(chainIdAtom);

  const allNetworks = useLazyAllNetworks();
  const allEvmNetworksLazy = useLazyAtomValue(allEvmNetworksAtom);

  const { currentAccount } = useAccounts();
  const accountNativeTokens = useLazyAtomValue(
    getAllNativeTokensAtom(currentAccount.address),
    "off",
  );

  const { confirm, alert } = useDialog();

  const [searchValue, setSearchValue] = useState("");
  const [contentMounted, setContentMounted] = useState(false);

  const balancesMap = useMemo(
    () =>
      accountNativeTokens &&
      new Map(accountNativeTokens.map((t) => [t.chainId, t.portfolioUSD])),
    [accountNativeTokens],
  );

  const networks = useMemo(() => {
    if (!allNetworks) return [];
    if (!balancesMap?.size) return allNetworks;

    return allNetworks
      .map((net) => {
        let balanceUSD = balancesMap?.get(net.chainId);

        balanceUSD =
          balanceUSD && new BigNumber(balanceUSD).isGreaterThan(0)
            ? balanceUSD
            : undefined;

        return {
          ...net,
          balanceUSD,
        };
      })
      .sort(compareNetworks);
  }, [allNetworks, balancesMap]);

  const allRestEvmNetworks = useMemo(() => {
    if (!testnetsVisibility || !allNetworks || !allEvmNetworksLazy) return [];

    const installed = new Set(allNetworks.map((n) => n.chainId));

    return allEvmNetworksLazy.filter((n) => !installed.has(n.chainId));
  }, [testnetsVisibility, allNetworks, allEvmNetworksLazy]);

  const networkList = useMemo(
    () => [...networks, ...allRestEvmNetworks],
    [networks, allRestEvmNetworks],
  );

  const fuse = useMemo(
    () => new Fuse(networkList, NETWORK_SEARCH_OPTIONS),
    [networkList],
  );

  const filteredNetworkList = useMemo(() => {
    const sorted = searchValue
      ? fuse
          .search(searchValue)
          .map((v) => v.item)
          .sort(compareByInstalledNetworks)
      : networkList.sort(compareByInstalledNetworks);

    const current = sorted.find((n) => n.chainId === chainId);
    if (!current) return sorted;

    return [current, ...sorted.filter((n) => n.chainId !== chainId)];
  }, [networkList, fuse, searchValue, chainId]);

  const [adding, setAdding] = useState(false);

  const handleSelect = useCallback(
    async (net: Network | EvmNetwork) => {
      if (adding) return;
      setAdding(true);

      try {
        if (!("type" in net)) {
          const confirmed = await confirm({
            title: "Add Network",
            content: (
              <p className="mb-4 mx-auto text-center">
                Are you sure you want to add{" "}
                <NetworkIcon network={net} className="h-4 w-auto inline-flex" />{" "}
                <b>
                  <span>{net.name}</span>
                </b>{" "}
                network?
              </p>
            ),
            yesButtonText: "Add",
          });
          if (!confirmed) return;

          await setupNewNetwork(
            {
              chainId: `0x${net.chainId.toString(16)}`,
              chainName: net.name,
              nativeCurrency: net.nativeCurrency,
              rpcUrls: net.rpcUrls,
              blockExplorerUrls: net.explorers?.map((exp) => exp.url),
              iconUrls: net.icon && [wrapIpfsNetIcon(net.icon.url)],
            },
            net,
          );
        }

        setChainId(net.chainId);
        onChange?.(net.chainId);
        onOpenChange?.(false);
      } catch (err: any) {
        alert({
          title: "Error",
          content: `Failed to add new network. ${err?.message ?? ""}`,
        });
      } finally {
        setAdding(false);
      }
    },
    [onOpenChange, setChainId, onChange, confirm, alert, adding, setAdding],
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo(0, 0);
  }, [searchValue, testnetsVisibility]);

  const rowVirtualizer = useVirtualizer({
    enabled: contentMounted,
    count: filteredNetworkList.length,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: () => {
      try {
        const rootFontSizeStr = getComputedStyle(
          document.documentElement,
        ).fontSize;
        const fontSizePx = +rootFontSizeStr.replace("px", "");
        if (isNaN(fontSizePx)) throw null;

        return fontSizePx * 3;
      } catch {}

      return 52;
    },
    overscan: 5,
  });

  return (
    <SecondaryModal
      onOpenChange={onOpenChange}
      {...rest}
      className={classNames(
        "!p-0",
        size === "large" ? "!max-w-[27.5rem]" : "!max-w-[20.75rem]",
      )}
    >
      <Command
        label="Networks"
        className={classNames(
          "w-full flex flex-col pt-5",
          size === "large" ? "px-5" : "px-4",
        )}
        shouldFilter={false}
        loop
      >
        <div className="flex items-center text-xl font-bold gap-2 mr-auto mb-6">
          Networks
        </div>

        <div className="w-full flex items-center pb-2">
          <Command.Input
            value={searchValue}
            onValueChange={setSearchValue}
            autoFocus
            asChild
          >
            <SearchInput
              placeholder="Search network..."
              adornmentClassName={size === "small" ? "!left-2" : ""}
              inputClassName={size === "small" ? "!pl-8" : "!min-h-[2.75rem]"}
            />
          </Command.Input>

          <Switcher
            id="testNetworks"
            text="Testnets & All"
            size={size}
            checked={testnetsVisibility}
            onCheckedChange={toggleTestnetsVisibility}
            className={classNames(
              "ml-2",
              size === "large" ? "!min-w-[12rem]" : "!min-w-[9rem]",
            )}
          />
        </div>

        <Command.List>
          <Command.Group className="relative">
            <Mount onMountChange={(m) => setContentMounted(m)} />

            <ScrollAreaContainer
              ref={scrollAreaRef}
              className="w-full h-full box-content -mr-5 pr-5 grow"
              viewPortClassName="viewportBlock !h-[20rem] pt-3 pb-5"
              scrollBarClassName="pt-3 pb-5"
            >
              <Command.Empty>
                <div
                  className={classNames(
                    "w-full h-[18rem]",
                    "border border-brand-light/[.05]",
                    "rounded-[.625rem] gap-4",
                    "flex flex-col justify-center items-center",
                    "text-sm text-brand-placeholder",
                  )}
                >
                  <div
                    className={classNames(
                      "flex justify-center items-center",
                      "text-sm text-brand-placeholder",
                    )}
                  >
                    <NoResultsFoundIcon className="mr-5" />
                    No results found
                  </div>

                  <Button
                    theme="secondary"
                    onClick={() => {
                      onOpenChange?.(false);
                      openInTab({
                        page: Page.Settings,
                        setting: "networks",
                        chainid: "new",
                      });
                    }}
                  >
                    Add custom network
                  </Button>
                </div>
              </Command.Empty>

              <div
                className={classNames(
                  "w-full relative",
                  adding && "opacity-50",
                )}
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const net = filteredNetworkList[virtualItem.index];

                  return (
                    <NetworkListItem
                      key={net.chainId}
                      net={net}
                      chainId={chainId}
                      size={size}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      onSelect={handleSelect}
                    />
                  );
                })}
              </div>
            </ScrollAreaContainer>

            {adding && (
              <div className="absolute inset-0 z-50 flex items-center justify-center">
                <div className="atom-spinner w-16 h-16" />
              </div>
            )}
          </Command.Group>
        </Command.List>
      </Command>
    </SecondaryModal>
  );
};

const NetworkListItem = memo(
  ({
    net,
    chainId,
    size,
    style,
    onSelect,
  }: {
    net: Network | EvmNetwork;
    chainId: number;
    size: Size;
    style: CSSProperties;
    onSelect?: (net: Network | EvmNetwork) => void;
  }) => {
    return (
      <Command.Item
        value={String(net.chainId)}
        keywords={[
          net.nativeCurrency.name,
          net.nativeCurrency.symbol,
          net.name,
        ]}
        className={classNames(
          "group",
          "w-full",
          "flex items-center",
          "min-w-0",
          size === "large" ? "p-3" : "px-3 py-2",
          "border border-transparent",
          "rounded-lg",
          "aria-selected:bg-brand-main/10",
          chainId === net.chainId && "!border-brand-redone",
          "aria-selected:cursor-pointer",
        )}
        style={style}
        onSelect={() => onSelect?.(net)}
      >
        <NetworkIcon network={net} className="w-6 h-6 min-w-[1.5rem] mr-3" />

        <span
          className={classNames(
            "min-w-0 truncate",
            "text-base font-bold text-brand-lightgray",
          )}
        >
          {net.name}
        </span>

        {"type" in net ? (
          <>
            {net.balanceUSD && (
              <FiatAmount
                amount={net.balanceUSD}
                copiable={false}
                className={classNames(
                  "text-base font-bold text-brand-lightgray ml-auto",
                )}
              />
            )}
          </>
        ) : (
          <>
            <span
              className={classNames(
                "ml-auto",
                "hidden group-aria-selected:inline-flex items-center",
                "text-sm font-bold text-brand-lightgray",
              )}
            >
              <AddIcon className="h-4 w-auto mr-2" />
              Add
            </span>
          </>
        )}
      </Command.Item>
    );
  },
);

function compareByInstalledNetworks(
  a: Network | EvmNetwork,
  b: Network | EvmNetwork,
) {
  if ("type" in a && !("type" in b)) return -1;
  if ("type" in b && !("type" in a)) return 1;

  if ("type" in a && "type" in b) return compareNetworks(a, b);

  return 0;
}

const Mount: FC<{ onMountChange: (mounted: boolean) => void }> = ({
  onMountChange,
}) => {
  useEffect(() => {
    onMountChange(true);
    return () => onMountChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
