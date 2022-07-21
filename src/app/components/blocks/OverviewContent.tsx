import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "clsx";
import useForceUpdate from "use-force-update";
import { useAtom, useAtomValue } from "jotai";
import { RESET } from "jotai/utils";
import { ethers } from "ethers";
import { Masonry } from "masonic";

import {
  AccountAsset,
  TokenStandard,
  TokenStatus,
  TokenType,
  AccountToken,
} from "core/types";
import { createTokenSlug } from "core/common/tokens";
import { findToken } from "core/client";
import * as repo from "core/repo";

import { LOAD_MORE_ON_ASSET_FROM_END } from "app/defaults";
import { currentAccountAtom, tokenSlugAtom, tokenTypeAtom } from "app/atoms";
import {
  TippySingletonProvider,
  useChainId,
  useIsSyncing,
  useAllAccountTokens,
} from "app/hooks";
import { ToastOverflowProvider } from "app/hooks/toast";

import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";
import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";

import AssetsSwitcher from "../elements/AssetsSwitcher";
import IconedButton from "../elements/IconedButton";
import ScrollAreaContainer from "../elements/ScrollAreaContainer";
import SearchInput from "../elements/SearchInput";
import ControlIcon from "../elements/ControlIcon";
import AssetCard from "./overview/AssetCard";
import AssetInfo from "./overview/AssetInfo";
import NftCard from "./overview/NftCard";

const OverviewContent: FC = () => (
  <div className="flex min-h-0 grow relative overflow-hidden">
    <ToastOverflowProvider>
      <TokenExplorer />
    </ToastOverflowProvider>
  </div>
);

export default OverviewContent;

const TokenExplorer: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom);

  return (
    <>
      <AssetsList />
      {tokenSlug && <AssetInfo />}
    </>
  );
};

const AssetsList: FC = () => {
  const chainId = useChainId();
  const currentAccount = useAtomValue(currentAccountAtom);
  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom);
  const [tokenType, setTokenType] = useAtom(tokenTypeAtom);

  const isNftsSelected = tokenType === TokenType.NFT;

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [manageModeEnabled, setManageModeEnabled] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const setDefaultTokenRef = useRef(!tokenSlug);

  const handleAccountTokensReset = useCallback(() => {
    scrollAreaRef.current?.scrollTo(0, 0);

    setDefaultTokenRef.current = true;
  }, []);

  const { tokens, loadMore, hasMore } = useAllAccountTokens(
    tokenType,
    currentAccount.address,
    {
      withDisabled: manageModeEnabled,
      search: searchValue ?? undefined,
      onReset: handleAccountTokensReset,
    }
  );

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerAssetRef = useCallback(
    (node) => {
      if (!tokens) return;

      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [hasMore, loadMore, tokens]
  );

  // A little hack to avoid using `manageModeEnabled` dependency
  const manageModeEnabledRef = useRef<boolean>();
  if (manageModeEnabledRef.current !== manageModeEnabled) {
    manageModeEnabledRef.current = manageModeEnabled;
  }

  useEffect(() => {
    if (
      setDefaultTokenRef.current &&
      tokens.length > 0 &&
      !manageModeEnabledRef.current
    ) {
      setTokenSlug([tokens[0].tokenSlug, "replace"]);
      setDefaultTokenRef.current = false;
    }
  }, [setTokenSlug, tokens]);

  const handleAssetSelect = useCallback(
    async (token: AccountToken) => {
      if (token.tokenType === TokenType.NFT) return;

      if (manageModeEnabled) {
        if (token.status === TokenStatus.Native) return;

        try {
          await repo.accountTokens.put(
            {
              ...token,
              status:
                token.status === TokenStatus.Enabled
                  ? TokenStatus.Disabled
                  : TokenStatus.Enabled,
            },
            [token.chainId, currentAccount.address, token.tokenSlug].join("_")
          );
        } catch (e) {
          console.error(e);
        }
      } else {
        setTokenSlug([token.tokenSlug, "replace"]);
      }
    },
    [currentAccount.address, manageModeEnabled, setTokenSlug]
  );

  const toggleManageMode = useCallback(() => {
    if (!manageModeEnabled) {
      setTokenSlug([RESET]);
    }

    setManageModeEnabled((mode) => !mode);
  }, [manageModeEnabled, setManageModeEnabled, setTokenSlug]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearchInput = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.select();
    }
  }, []);

  const syncing = useIsSyncing();
  const forceUpdate = useForceUpdate();

  const searchValueIsAddress = useMemo(
    () => searchValue && ethers.utils.isAddress(searchValue),
    [searchValue]
  );

  const willSearch = Boolean(searchValueIsAddress && tokens.length === 0);
  const alreadySearchedRef = useRef(false);

  useEffect(() => {
    if (willSearch) {
      let mounted = true;

      let t = setTimeout(() => {
        const tokenSlug = createTokenSlug({
          standard: TokenStandard.ERC20,
          address: ethers.utils.getAddress(searchValue!),
          id: "0",
        });

        findToken(chainId, currentAccount.address, tokenSlug);

        t = setTimeout(() => {
          if (mounted) {
            alreadySearchedRef.current = true;
            forceUpdate();
          }
        }, 500);
      }, 500);

      return () => {
        mounted = false;
        clearTimeout(t);
        alreadySearchedRef.current = false;
      };
    }

    return;
  }, [forceUpdate, willSearch, searchValue, chainId, currentAccount.address]);

  const searching = (willSearch || syncing) && !alreadySearchedRef.current;

  const toggleNftSwitcher = useCallback(
    (value: boolean) => {
      if (value) {
        setTokenSlug([RESET]);
        setSearchValue(null);
        setManageModeEnabled(false);
      } else if (tokens.length > 0) {
        setTokenSlug([tokens[0].tokenSlug, "replace"]);
      }

      setTokenType(value ? TokenType.NFT : TokenType.Asset);
    },
    [setTokenType, setTokenSlug, tokens]
  );

  return (
    <div
      className={classNames(
        "w-[23.25rem] min-w-[23.25rem] pr-6 mt-6",
        "border-r border-brand-main/[.07]",
        "flex flex-col"
      )}
    >
      <AssetsSwitcher
        checked={isNftsSelected}
        onCheckedChange={toggleNftSwitcher}
        className="mx-auto mb-3"
      />
      <div className="flex items-center">
        <TippySingletonProvider>
          <SearchInput
            ref={searchInputRef}
            searchValue={searchValue}
            toggleSearchValue={setSearchValue}
            disabled={isNftsSelected}
          />
          <IconedButton
            Icon={ControlIcon}
            iconProps={{
              isActive: manageModeEnabled,
            }}
            theme="tertiary"
            className={classNames(
              "ml-2",
              manageModeEnabled && "bg-brand-main/30"
            )}
            aria-label={
              manageModeEnabled
                ? "Finish managing assets list"
                : "Manage assets list"
            }
            disabled={isNftsSelected}
            onClick={toggleManageMode}
          />
        </TippySingletonProvider>
      </div>
      {tokens.length <= 0 && searchValue ? (
        <button
          type="button"
          className={classNames(
            "flex flex-col items-center",
            "h-full w-full py-9",
            "text-sm text-brand-placeholder text-center"
          )}
          onClick={focusSearchInput}
        >
          <NoResultsFoundIcon
            className={classNames("mb-4", searching && "animate-waving-hand")}
          />

          {searching ? (
            <>Searching...</>
          ) : (
            <>
              Can&apos;t find a token?
              <br />
              Put an address into the search line to add it to your assets list.
            </>
          )}
        </button>
      ) : (
        <ScrollAreaContainer
          ref={scrollAreaRef}
          hiddenScrollbar="horizontal"
          className="pr-5 -mr-5 mt-4"
          viewPortClassName="pb-20 rounded-t-[.625rem] viewportBlock"
          scrollBarClassName="py-0 pb-20"
        >
          <div
            className={classNames(
              "max-h-0",
              "overflow-hidden",
              manageModeEnabled &&
                tokens.length > 0 &&
                "transition-[max-height] duration-200 max-h-[4.25rem]"
            )}
          >
            <div className="pb-2">
              <button
                type="button"
                className={classNames(
                  "flex items-center",
                  "w-full py-2 px-3",
                  "bg-brand-main/5",
                  "rounded-[.625rem]",
                  "text-sm text-brand-inactivelight text-left",
                  "cursor-pointer",
                  "transition-colors",
                  "hover:bg-brand-main/10 focus-visible:bg-brand-main/10"
                )}
                onClick={focusSearchInput}
              >
                <PlusCircleIcon className="w-6 min-w-[1.5rem] h-auto mr-2 fill-brand-inactivelight" />
                To add an asset, enter the address into
                <br />
                the search line
              </button>
            </div>
          </div>
          {!isNftsSelected ? (
            tokens.map((asset, i) => (
              <AssetCard
                key={asset.tokenSlug}
                ref={
                  i === tokens.length - LOAD_MORE_ON_ASSET_FROM_END - 1
                    ? loadMoreTriggerAssetRef
                    : null
                }
                asset={asset as AccountAsset}
                isActive={!manageModeEnabled && tokenSlug === asset.tokenSlug}
                onAssetSelect={handleAssetSelect}
                isManageMode={manageModeEnabled}
                className={classNames(i !== tokens.length - 1 && "mb-2")}
              />
            ))
          ) : (
            <MasonryContainer />
          )}
        </ScrollAreaContainer>
      )}
    </div>
  );
};

const MasonryContainer: FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  return isMounted ? (
    <Masonry
      columnCount={3}
      columnGutter={4}
      items={NFTS_LIST}
      render={NftCard}
    />
  ) : null;
};

const NFTS_LIST = [
  {
    img: "https://img.seadn.io/files/bdbc9c2f75ea6a97eedda80b760d79f6.png?fit=max",
    name: "YOLO HOLIDAY",
    id: "9876",
    count: 1,
  },
  {
    img: "https://img.rarible.com/prod/image/upload/t_image_big/prod-itemImages/0x223e16c52436cab2ca9fe37087c79986a288fffa:7626/7fc04ccb",
    name: "Phoebe Heyerdahl",
    id: "667",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/1a29a9205147354184d0deed2e02efdd.png?fit=max",
    name: "Running Moon",
    id: "450",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/9edb664cbd1ed85cb8f039b3384f9255.jpg?fit=max",
    id: "65452",
    count: 1,
  },
  {
    img: "https://img.rarible.com/prod/image/upload/t_image_big/prod-itemImages/0xefbe1c8168f6d8d0e48e3455dcff032a1200635a:59320152187372283102792859480996134837988272352105376460684031696141809614881/f00b1607",
    name: "Xanalla",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/f3ac0dc3af54f15b1434ad98d5172190.jpg?fit=max",
    id: "51472",
    count: 1,
  },
  {
    img: "https://img.rarible.com/prod/image/upload/t_image_big/prod-itemImages/0x223e16c52436cab2ca9fe37087c79986a288fffa:3610/ee6d8de3",
    name: "Lil Deville",
    id: "726",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/a0c8175f5ffa74006ec0fbff8f09a8a3.png?fit=max",
    name: "Running Moon",
    id: "281",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/9cb068afcbf2b9b56e27bfac14cf33a8.png?fit=max",
    name: "CryptoCities",
    id: "041",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/48b4bd2c10413cabb29bdb046de296bc.png?fit=max",
    name: "CyberKong",
    id: "840",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/d5567147379b8ff5f914fd6bc4cfd371.jpg?fit=max",
    id: "78351",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/37bc954ad4a48ef80649e25862ad8a7b.png?fit=max",
    name: "Running Moon",
    id: "287",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/feb325c4e9d8e73110ba8826e0dbbcdc.png?fit=max",
    id: "17802",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/407fac2f75454c7b72b3f7cb528f6070.png?fit=max",
    name: "Super Cool World",
    id: "1118",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/60bdf35e0d34c786de2089d2f5061162.jpg?fit=max",
    id: "85913",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/8a512e6435c57561abbc7a60976de667.png?fit=max",
    name: "Running Moon",
    id: "323",
    count: 1,
  },
  {
    img: "https://img.seadn.io/files/08c928e09375bba4c2af67aab268dcad.png?fit=max",
    name: "YOLO HOLIDAY",
    id: "4745",
    count: 1,
  },
];
