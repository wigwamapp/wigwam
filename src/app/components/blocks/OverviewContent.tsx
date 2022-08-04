import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { RESET } from "jotai/utils";
import { ethers } from "ethers";
import Masonry from "lib/react-masonry/Masonry";

import {
  AccountAsset,
  TokenStandard,
  TokenStatus,
  TokenType,
  AccountToken,
  AccountNFT,
} from "core/types";
import { createTokenSlug, detectNFTStandard } from "core/common/tokens";
import { findToken } from "core/client";
import * as repo from "core/repo";

import {
  LOAD_MORE_ON_NFT_FROM_END,
  LOAD_MORE_ON_TOKEN_FROM_END,
} from "app/defaults";
import { currentAccountAtom, tokenSlugAtom, tokenTypeAtom } from "app/atoms";
import {
  TippySingletonProvider,
  useChainId,
  useIsSyncing,
  useAllAccountTokens,
  useProvider,
} from "app/hooks";
import { ToastOverflowProvider } from "app/hooks/toast";

import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";
import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";
import { ReactComponent as HashTagIcon } from "app/icons/hashtag.svg";

import AssetsSwitcher from "../elements/AssetsSwitcher";
import IconedButton from "../elements/IconedButton";
import ScrollAreaContainer from "../elements/ScrollAreaContainer";
import SearchInput from "../elements/SearchInput";
import ControlIcon from "../elements/ControlIcon";
import AssetCard from "./overview/AssetCard";
import AssetInfo from "./overview/AssetInfo";
import NftCard from "./overview/NftCard";
import NftInfo from "./overview/NftInfo";

const OverviewContent: FC = () => (
  <div className="flex min-h-0 grow relative overflow-hidden">
    <ToastOverflowProvider>
      <TokenExplorer />
    </ToastOverflowProvider>
  </div>
);

export default OverviewContent;

const TokenExplorer: FC = () => {
  const [tokenType, setTokenType] = useAtom(tokenTypeAtom);
  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom);

  const toggleNftSwitcher = useCallback(
    (value: boolean) => {
      setTokenSlug([RESET]);
      setTokenType(value ? TokenType.NFT : TokenType.Asset);
    },
    [setTokenType, setTokenSlug]
  );

  return (
    <>
      <div
        className={classNames(
          "w-[23.25rem] min-w-[23.25rem] pr-6 mt-6",
          "border-r border-brand-main/[.07]",
          "flex flex-col"
        )}
      >
        <AssetsSwitcher
          checked={tokenType === TokenType.NFT}
          onCheckedChange={toggleNftSwitcher}
          className="mx-auto mb-3"
        />

        <TokenList key={tokenType} />
      </div>

      {tokenSlug &&
        (tokenType === TokenType.Asset ? <AssetInfo /> : <NftInfo />)}
    </>
  );
};

const TokenList: FC = () => {
  const chainId = useChainId();
  const provider = useProvider();
  const currentAccount = useAtomValue(currentAccountAtom);
  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom);
  const tokenType = useAtomValue(tokenTypeAtom);

  const isNftsSelected = tokenType === TokenType.NFT;

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [tokenIdSearchValue, setTokenIdSearchValue] = useState<string | null>(
    null
  );
  const [manageModeEnabled, setManageModeEnabled] = useState(false);

  const combinedSearchValue = useMemo(() => {
    if (!searchValue) return undefined;
    if (!tokenIdSearchValue) return searchValue;

    return `${searchValue}:${tokenIdSearchValue}`;
  }, [searchValue, tokenIdSearchValue]);

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
      withDisabled:
        manageModeEnabled || Boolean(isNftsSelected && combinedSearchValue),
      search: combinedSearchValue,
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

  const handleTokenSelect = useCallback(
    async (token: AccountToken) => {
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
  const tokenIdSearchInputRef = useRef<HTMLInputElement>(null);

  const focusSearchInput = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.select();
    }
  }, []);

  const syncing = useIsSyncing();

  const searchValueIsAddress = useMemo(
    () => searchValue && ethers.utils.isAddress(searchValue),
    [searchValue]
  );

  const tokenIdSearchDisplayed = Boolean(
    isNftsSelected && searchValueIsAddress
  );
  const willSearch = Boolean(
    searchValueIsAddress &&
      tokens.length === 0 &&
      (tokenIdSearchDisplayed ? tokenIdSearchValue : true)
  );

  useEffect(() => {
    if (!tokenIdSearchDisplayed) {
      setTokenIdSearchValue(null);
    }
  }, [tokenIdSearchDisplayed, setTokenIdSearchValue]);

  useEffect(() => {
    if (willSearch) {
      const t = setTimeout(async () => {
        const tokenAddress = ethers.utils.getAddress(searchValue!);

        let tokenSlug: string;

        if (isNftsSelected) {
          if (!tokenIdSearchValue) return;

          try {
            const tokenId =
              ethers.BigNumber.from(tokenIdSearchValue).toString();
            const tokenStandard = await detectNFTStandard(
              provider,
              tokenAddress,
              tokenId
            );

            tokenSlug = createTokenSlug({
              standard: tokenStandard,
              address: tokenAddress,
              id: tokenId,
            });
          } catch (err) {
            console.warn(err);
            return;
          }
        } else {
          tokenSlug = createTokenSlug({
            standard: TokenStandard.ERC20,
            address: ethers.utils.getAddress(searchValue!),
            id: "0",
          });
        }

        findToken(chainId, currentAccount.address, tokenSlug);
      }, 300);

      return () => clearTimeout(t);
    }

    return;
  }, [
    chainId,
    provider,
    currentAccount.address,
    willSearch,
    isNftsSelected,
    searchValue,
    tokenIdSearchValue,
  ]);

  const searching = willSearch && syncing;

  const renderNFTCard = useCallback(
    (nft: AccountNFT, i: number) => (
      <NftCard
        key={nft.tokenSlug}
        ref={
          i === tokens.length - LOAD_MORE_ON_NFT_FROM_END - 1
            ? loadMoreTriggerAssetRef
            : null
        }
        nft={nft}
        isActive={!manageModeEnabled && tokenSlug === nft.tokenSlug}
        onAssetSelect={handleTokenSelect}
        isManageMode={manageModeEnabled}
      />
    ),
    [
      tokens.length,
      manageModeEnabled,
      tokenSlug,
      handleTokenSelect,
      loadMoreTriggerAssetRef,
    ]
  );

  /**
   * Contol bar
   */
  const controlBar = useMemo(
    () => (
      <div className="flex items-center">
        <TippySingletonProvider>
          <SearchInput
            ref={searchInputRef}
            searchValue={searchValue}
            toggleSearchValue={setSearchValue}
          />

          {tokenIdSearchDisplayed && (
            <SearchInput
              ref={tokenIdSearchInputRef}
              searchValue={tokenIdSearchValue}
              toggleSearchValue={setTokenIdSearchValue}
              StartAdornment={HashTagIcon}
              className="ml-2 max-w-[8rem]"
              placeholder="Token ID..."
            />
          )}

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
            onClick={toggleManageMode}
          />
        </TippySingletonProvider>
      </div>
    ),
    [
      searchValue,
      setSearchValue,
      tokenIdSearchValue,
      setTokenIdSearchValue,
      tokenIdSearchDisplayed,
      manageModeEnabled,
      toggleManageMode,
    ]
  );

  let tokensBar: ReactNode = null;

  if (tokens.length === 0) {
    if (searchValue) {
      tokensBar = (
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
            <div className="max-w-[16rem]">
              Can&apos;t find a token?
              <br />
              Put an address into the search line to add it to your assets list.
            </div>
          )}
        </button>
      );
    } else if (isNftsSelected) {
      tokensBar = (
        <div
          className={classNames(
            "flex flex-col items-center",
            "h-full w-full py-9",
            "text-sm text-brand-placeholder text-center"
          )}
        >
          <Delay ms={500}>
            <span>{!syncing ? "No NFT yet" : "Syncing..."}</span>
          </Delay>
        </div>
      );
    }
  } else {
    tokensBar = (
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
              To add {!isNftsSelected ? "an asset" : "an NFT"}, enter the
              address {!isNftsSelected ? "into" : "and id"}
              <br />
              {!isNftsSelected ? "" : "into "}
              the search line
            </button>
          </div>
        </div>
        {!isNftsSelected ? (
          <>
            {tokens.map((asset, i) => (
              <AssetCard
                key={asset.tokenSlug}
                ref={
                  i === tokens.length - LOAD_MORE_ON_TOKEN_FROM_END - 1
                    ? loadMoreTriggerAssetRef
                    : null
                }
                asset={asset as AccountAsset}
                isActive={!manageModeEnabled && tokenSlug === asset.tokenSlug}
                onAssetSelect={handleTokenSelect}
                isManageMode={manageModeEnabled}
                className={classNames(i !== tokens.length - 1 && "mb-2")}
              />
            ))}
          </>
        ) : (
          <Masonry items={tokens} renderItem={renderNFTCard} gap="0.25rem" />
        )}
      </ScrollAreaContainer>
    );
  }

  return (
    <>
      {controlBar}
      {tokensBar}
    </>
  );
};

const Delay: FC<{ ms: number }> = ({ ms, children }) => {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDelayed(true), ms);
    return () => clearTimeout(t);
  }, [ms, setDelayed]);

  return delayed ? <>{children}</> : null;
};
