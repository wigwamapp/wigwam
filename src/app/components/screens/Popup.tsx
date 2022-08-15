import {
  FC,
  ReactNode,
  memo,
  useCallback,
  useRef,
  useState,
  useMemo,
} from "react";
import { useAtom, useAtomValue } from "jotai";
import classNames from "clsx";
import Masonry from "lib/react-masonry/Masonry";

import {
  Account,
  AccountAsset,
  AccountNFT,
  TokenStatus,
  TokenType,
} from "core/types";
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
import NoNftState from "../blocks/tokenList/NoNftState";
import NftCard from "../blocks/tokenList/NftCard";
import NFTOverviewPopup from "../blocks/popup/NFTOverviewPopup";

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
  const [tokenType, setTokenType] = useAtom(tokenTypeAtom);

  const toggleNftSwitcher = useCallback(
    (value: boolean) => {
      setTokenType(value ? TokenType.NFT : TokenType.Asset);
    },
    [setTokenType]
  );

  const isNftsSelected = tokenType === TokenType.NFT;

  return (
    <div className="flex flex-wrap mt-5 min-h-0">
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

      <TokenList key={tokenType} tokenType={tokenType} />
    </div>
  );
};

const TokenList: FC<{ tokenType: TokenType }> = ({ tokenType }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleAccountTokensReset = useCallback(() => {
    scrollAreaRef.current?.scrollTo(0, 0);
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
    searchPersist: tokenType === TokenType.NFT,
  });

  const controlBar = useMemo(
    () => (
      <>
        <TippySingletonProvider>
          <SearchInput
            ref={searchInputRef}
            searchValue={searchValue}
            toggleSearchValue={setSearchValue}
            className="ml-2 !w-auto grow max-w-[13.875rem]"
            inputClassName="max-h-[2.375rem] !pl-9"
            placeholder="Type to search..."
            adornmentClassName="!left-3"
          />

          <IconedButton
            Icon={ControlIcon}
            iconProps={{
              isActive: manageModeEnabled,
            }}
            theme="tertiary"
            className={classNames(
              "ml-2 mr-2 mt-[.4375rem]",
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

        <div
          className={classNames(
            "w-full pt-2",
            "max-h-0",
            "overflow-hidden",
            "transition-[max-height] duration-200",
            tokenIdSearchDisplayed && "max-h-[3rem]"
          )}
        >
          <SearchInput
            ref={tokenIdSearchInputRef}
            searchValue={tokenIdSearchValue}
            toggleSearchValue={setTokenIdSearchValue}
            StartAdornment={HashTagIcon}
            className="w-full"
            placeholder="Type token ID to search..."
          />
        </div>
      </>
    ),
    [
      manageModeEnabled,
      setManageModeEnabled,
      searchInputRef,
      searchValue,
      setSearchValue,
      tokenIdSearchDisplayed,
      tokenIdSearchInputRef,
      tokenIdSearchValue,
      setTokenIdSearchValue,
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
        className="pr-3.5 -mr-3.5 mt-2 w-[calc(100%+3.5rem)] h-full min-h-0"
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
          <AssetList
            tokens={tokens as AccountAsset[]}
            manageModeEnabled={manageModeEnabled}
            loadMoreTriggerRef={loadMoreTriggerRef}
          />
        ) : (
          <NftList
            tokens={tokens as AccountNFT[]}
            currentAccount={currentAccount}
            manageModeEnabled={manageModeEnabled}
            loadMoreTriggerRef={loadMoreTriggerRef}
          />
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

type AssetListProps = {
  tokens: AccountAsset[];
  manageModeEnabled: boolean;
  loadMoreTriggerRef: (node: any) => void;
};

const AssetList = memo<AssetListProps>(
  ({ tokens, manageModeEnabled, loadMoreTriggerRef }) => {
    const [receivePopupOpened, setReceivePopupOpened] = useState(false);

    return (
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
    );
  }
);

type NftListProps = {
  tokens: AccountNFT[];
  currentAccount: Account;
  manageModeEnabled: boolean;
  loadMoreTriggerRef: (node: any) => void;
};

const NftList = memo<NftListProps>(
  ({ currentAccount, tokens, manageModeEnabled, loadMoreTriggerRef }) => {
    const [nftTokenOpened, setNftTokenOpened] = useState<AccountNFT | null>(
      null
    );

    const handleNFTSelect = useCallback(
      async (token: AccountNFT) => {
        if (manageModeEnabled) {
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
          setNftTokenOpened(token);
        }
      },
      [manageModeEnabled, currentAccount.address, setNftTokenOpened]
    );

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
          onSelect={handleNFTSelect}
          isManageMode={manageModeEnabled}
        />
      ),
      [tokens.length, manageModeEnabled, handleNFTSelect, loadMoreTriggerRef]
    );

    return (
      <>
        <>
          <Masonry items={tokens} renderItem={renderNFTCard} gap="0.25rem" />

          <NFTOverviewPopup
            open={Boolean(nftTokenOpened)}
            token={nftTokenOpened}
            onOpenChange={() => setNftTokenOpened(null)}
          />
        </>
      </>
    );
  }
);

type ReceivePopupProps = Pick<SecondaryModalProps, "open" | "onOpenChange">;

const ReceivePopup: FC<ReceivePopupProps> = (props) => (
  <SecondaryModal {...props} small>
    <ShareAddress />
  </SecondaryModal>
);
