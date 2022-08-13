import {
  FC,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import classNames from "clsx";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import Masonry from "lib/react-masonry/Masonry";

import {
  AccountAsset,
  TokenStatus,
  TokenType,
  AccountToken,
  AccountNFT,
} from "core/types";
import * as repo from "core/repo";

import {
  LOAD_MORE_ON_NFT_FROM_END,
  LOAD_MORE_ON_TOKEN_FROM_END,
} from "app/defaults";
import { tokenSlugAtom, tokenTypeAtom } from "app/atoms";
import { TippySingletonProvider } from "app/hooks";
import { ToastOverflowProvider } from "app/hooks/toast";
import { useTokenList } from "app/hooks/tokenList";

import { ReactComponent as HashTagIcon } from "app/icons/hashtag.svg";

import AssetsSwitcher from "../elements/AssetsSwitcher";
import IconedButton from "../elements/IconedButton";
import ScrollAreaContainer from "../elements/ScrollAreaContainer";
import SearchInput from "../elements/SearchInput";
import ControlIcon from "../elements/ControlIcon";
import NullState from "../blocks/tokenList/NullState";
import AddTokenBanner from "../blocks/tokenList/AddTokenBanner";
import NoNftState from "../blocks/tokenList/NoNftState";
import NftCard from "../blocks/tokenList/NftCard";

import AssetCard from "./overview/AssetCard";
import AssetInfo from "./overview/AssetInfo";
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

  const tokenTypeChangedHereRef = useRef<boolean>(true);

  const toggleNftSwitcher = useCallback(
    (value: boolean) => {
      tokenTypeChangedHereRef.current = true;

      setTokenSlug([RESET, "replace"]);
      setTokenType(value ? TokenType.NFT : TokenType.Asset);
    },
    [setTokenType, setTokenSlug]
  );

  useEffect(() => {
    if (tokenTypeChangedHereRef.current) {
      tokenTypeChangedHereRef.current = false;
      return;
    }

    setTokenSlug([RESET, "replace"]);
  }, [tokenType, setTokenSlug]);

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

        <TokenList key={tokenType} tokenType={tokenType} />
      </div>

      {tokenSlug &&
        (tokenType === TokenType.Asset ? <AssetInfo /> : <NftInfo />)}
    </>
  );
};

const TokenList = memo<{ tokenType: TokenType }>(({ tokenType }) => {
  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom);

  const setDefaultTokenRef = useRef(!tokenSlug);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleAccountTokensReset = useCallback(() => {
    scrollAreaRef.current?.scrollTo(0, 0);

    setDefaultTokenRef.current = true;
  }, []);

  const {
    currentAccount,
    isNftsSelected,
    searchValue,
    setSearchValue,
    tokenIdSearchValue,
    setTokenIdSearchValue,
    tokenIdSearchDisplayed,
    manageModeEnabled,
    setManageModeEnabled,
    tokens,
    syncing,
    searching,
    focusSearchInput,
    searchInputRef,
    tokenIdSearchInputRef,
    loadMoreTriggerRef,
  } = useTokenList(tokenType, {
    onAccountTokensReset: handleAccountTokensReset,
  });

  // A little hack to avoid using `manageModeEnabled` dependency
  const manageModeEnabledRef = useRef<boolean>();
  if (manageModeEnabledRef.current !== manageModeEnabled) {
    manageModeEnabledRef.current = manageModeEnabled;
  }

  useEffect(() => {
    if (!tokenSlug) {
      setDefaultTokenRef.current = true;
    }
  }, [tokenSlug]);

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
      setTokenSlug([RESET, "replace"]);
    }

    setManageModeEnabled((mode) => !mode);
  }, [manageModeEnabled, setManageModeEnabled, setTokenSlug]);

  const renderNFTCard = useCallback(
    (nft: AccountNFT, i: number) => (
      <NftCard
        key={nft.tokenSlug}
        ref={
          i === tokens.length - LOAD_MORE_ON_NFT_FROM_END - 1
            ? loadMoreTriggerRef
            : null
        }
        nft={nft}
        isActive={!manageModeEnabled && tokenSlug === nft.tokenSlug}
        onSelect={handleTokenSelect}
        isManageMode={manageModeEnabled}
      />
    ),
    [
      tokens.length,
      manageModeEnabled,
      tokenSlug,
      handleTokenSelect,
      loadMoreTriggerRef,
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
      searchInputRef,
      tokenIdSearchInputRef,
    ]
  );

  let tokensBar: ReactNode = null;

  if (tokens.length === 0) {
    if (searchValue) {
      tokensBar = (
        <NullState searching={searching} focusSearchInput={focusSearchInput} />
      );
    } else if (isNftsSelected) {
      tokensBar = <NoNftState syncing={syncing} />;
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
        <AddTokenBanner
          isNftsSelected={isNftsSelected}
          manageModeEnabled={manageModeEnabled}
          tokens={tokens}
          focusSearchInput={focusSearchInput}
        />

        {!isNftsSelected ? (
          <>
            {tokens.map((asset, i) => (
              <AssetCard
                key={asset.tokenSlug}
                ref={
                  i === tokens.length - LOAD_MORE_ON_TOKEN_FROM_END - 1
                    ? loadMoreTriggerRef
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
});
