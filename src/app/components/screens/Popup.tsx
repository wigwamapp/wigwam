import { FC, ReactNode, useCallback, useRef, useState, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import classNames from "clsx";
import Masonry from "lib/react-masonry/Masonry";

import { AccountAsset, AccountNFT, TokenType } from "core/types";
import * as repo from "core/repo";

import {
  LOAD_MORE_ON_TOKEN_FROM_END,
  LOAD_MORE_ON_NFT_FROM_END,
} from "app/defaults";
import {
  activeTabOriginAtom,
  getPermissionAtom,
  tokenTypeAtom,
} from "app/atoms";
import { TippySingletonProvider, useIsSyncing } from "app/hooks";
import { useTokenList } from "app/hooks/tokenList";

import { ReactComponent as HashTagIcon } from "app/icons/hashtag.svg";

import PopupLayout from "../layouts/PopupLayout";
import PreloadBaseAndSync from "../layouts/PreloadBaseAndSync";
import NetworkSelect from "../elements/NetworkSelect";
import AccountSelect from "../elements/AccountSelect";
import AssetsSwitcher from "../elements/AssetsSwitcher";
import SearchInput from "../elements/SearchInput";
import IconedButton from "../elements/IconedButton";
import ScrollAreaContainer from "../elements/ScrollAreaContainer";
import Tooltip from "../elements/Tooltip";
import ControlIcon from "../elements/ControlIcon";
import SecondaryModal, {
  SecondaryModalProps,
} from "../elements/SecondaryModal";
import InteractionWithDapp from "../blocks/popup/InteractionWithDapp";
import AssetCard from "../blocks/popup/AssetCard";
import NullState from "../blocks/tokenList/NullState";
import AddTokenBanner from "../blocks/tokenList/AddTokenBanner";
import Delay from "../blocks/tokenList/Delay";
import NftCard from "../blocks/tokenList/NftCard";

import ShareAddress from "./receiveTabs/ShareAddress";

const Popup: FC = () => (
  <PreloadAndSync>
    <PopupLayout>
      <PopupNetworkSelect />
      <AccountSelect className="mt-2" />
      <InteractionWithDapp className="mt-2" />
      <TokenExplorer />
    </PopupLayout>
  </PreloadAndSync>
);

export default Popup;

const PreloadAndSync: FC = ({ children }) => {
  const tabOrigin = useAtomValue(activeTabOriginAtom);
  const permission = useAtomValue(getPermissionAtom(tabOrigin));

  return (
    <PreloadBaseAndSync chainId={permission?.chainId}>
      {children}
    </PreloadBaseAndSync>
  );
};

const PopupNetworkSelect: FC = () => {
  const tabOrigin = useAtomValue(activeTabOriginAtom);
  const isSyncing = useIsSyncing();

  const handleChange = useCallback(
    (chainId: number) => {
      if (!tabOrigin) return;

      repo.permissions
        .where({ origin: tabOrigin })
        .modify((perm) => {
          perm.chainId = chainId;
        })
        .catch(console.error);
    },
    [tabOrigin]
  );

  return (
    <NetworkSelect
      source="popup"
      className="max-w-auto"
      currentItemClassName="!h-11 pr-3 !pl-3 !py-1.5"
      currentItemIconClassName={classNames(
        "!w-8 !h-8 !mr-3",
        isSyncing && "animate-pulse"
      )}
      contentClassName="w-[22.25rem]"
      onChange={handleChange}
    />
  );
};

const TokenExplorer: FC = () => {
  const tokenType = useAtomValue(tokenTypeAtom);

  return (
    <>
      <TokenList key={tokenType} />
    </>
  );
};

const TokenList: FC = () => {
  const [tokenType, setTokenType] = useAtom(tokenTypeAtom);
  const [receivePopupOpened, setReceivePopupOpened] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleAccountTokensReset = useCallback(() => {
    scrollAreaRef.current?.scrollTo(0, 0);
  }, []);

  const {
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
    loadMoreTriggerAssetRef,
  } = useTokenList(tokenType, handleAccountTokensReset);

  const toggleNftSwitcher = useCallback(
    (value: boolean) => {
      if (value) {
        setSearchValue(null);
        setManageModeEnabled(false);
      }

      setTokenType(value ? TokenType.NFT : TokenType.Asset);
    },
    [setSearchValue, setManageModeEnabled, setTokenType]
  );

  const handleNFTSelect = useCallback((nft: AccountNFT) => {
    console.info({ nft });
  }, []);

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
        onSelect={handleNFTSelect}
        isManageMode={manageModeEnabled}
      />
    ),
    [tokens.length, manageModeEnabled, handleNFTSelect, loadMoreTriggerAssetRef]
  );

  /**
   * Contol bar
   */
  const controlBar = useMemo(
    () => (
      <div className="flex items-center mt-5">
        <TippySingletonProvider>
          <Tooltip
            content={`Switch to ${isNftsSelected ? "assets" : "NFTs"}`}
            asChild
          >
            <span>
              <AssetsSwitcher
                theme="small"
                checked={isNftsSelected}
                onCheckedChange={toggleNftSwitcher}
              />
            </span>
          </Tooltip>

          <SearchInput
            ref={searchInputRef}
            searchValue={searchValue}
            toggleSearchValue={setSearchValue}
            className="ml-2"
            inputClassName="max-h-9 !pl-9"
            placeholder="Type to search..."
            adornmentClassName="!left-3"
          />

          {tokenIdSearchDisplayed && (
            <SearchInput
              ref={tokenIdSearchInputRef}
              searchValue={tokenIdSearchValue}
              toggleSearchValue={setTokenIdSearchValue}
              StartAdornment={HashTagIcon}
              className="ml-2 max-w-[5rem]"
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
              "ml-2 mr-2",
              manageModeEnabled && "bg-brand-main/30"
            )}
            aria-label={
              manageModeEnabled
                ? "Finish managing assets list"
                : "Manage assets list"
            }
            onClick={() => setManageModeEnabled(!manageModeEnabled)}
          />
        </TippySingletonProvider>
      </div>
    ),
    [
      isNftsSelected,
      toggleNftSwitcher,
      searchValue,
      setSearchValue,
      tokenIdSearchValue,
      setTokenIdSearchValue,
      tokenIdSearchDisplayed,
      manageModeEnabled,
      setManageModeEnabled,
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
        className="pr-3.5 -mr-3.5 mt-2"
        viewPortClassName="pb-16 rounded-t-[.625rem] viewportBlock"
        scrollBarClassName="py-0 pb-16"
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
                    ? loadMoreTriggerAssetRef
                    : null
                }
                asset={asset as AccountAsset}
                isManageMode={manageModeEnabled}
                setReceivePopupOpened={setReceivePopupOpened}
                className={classNames(i !== tokens.length - 1 && "mb-1")}
              />
            ))}

            <ReceivePopup
              open={receivePopupOpened}
              onOpenChange={setReceivePopupOpened}
            />
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

type ReceivePopupProps = Pick<SecondaryModalProps, "open" | "onOpenChange">;

const ReceivePopup: FC<ReceivePopupProps> = (props) => (
  <SecondaryModal {...props} small>
    <ShareAddress />
  </SecondaryModal>
);
