import {
  FC,
  ReactNode,
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useState,
  useMemo,
  useEffect,
  PropsWithChildren,
} from "react";
import { useAtom, useAtomValue } from "jotai";
import classNames from "clsx";
import { match, P } from "ts-pattern";
import { PopupToolbarTab } from "app/nav";
import { ReactComponent as AddIcon } from "app/icons/PlusCircle.svg";
import { ReactComponent as AddInputIcon } from "app/icons/add.svg";
import { ReactComponent as SearchIcon } from "app/icons/search-input.svg";
import { ReactComponent as BackIcon } from "app/icons/arrow-left.svg";
import Masonry from "lib/react-masonry/Masonry";
import { useAtomsAll } from "lib/atom-utils";

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
  popupToolbarTabAtom,
  tokenTypeAtom,
  web3MetaMaskCompatibleAtom,
} from "app/atoms";
import { useIsSyncing } from "app/hooks";
import { useTokenList } from "app/hooks/tokenList";

import PopupLayout from "../layouts/PopupLayout";
import PreloadBaseAndSync from "../layouts/PreloadBaseAndSync";
import NetworkSelect from "../elements/NetworkSelect";
// import AccountSelect from "../elements/AccountSelect";
import AssetsSwitcher from "../elements/AssetsSwitcher";
import SearchInput from "../elements/SearchInput";
import ControlIcon from "../elements/ControlIcon";
import SecondaryModal, {
  SecondaryModalProps,
} from "../elements/SecondaryModal";
// import InteractionWithDapp from "../blocks/popup/InteractionWithDapp";
import AssetCard from "../blocks/popup/AssetCard";
import NullState from "../blocks/tokenList/NullState";
import NoNftState from "../blocks/tokenList/NoNftState";
import NftCard from "../blocks/tokenList/NftCard";
import NFTOverviewPopup from "../blocks/popup/NFTOverviewPopup";

import ShareAddress from "./receiveTabs/ShareAddress";
import { Redirect } from "lib/navigation";
import Button from "../elements/Button";
import ActivitiesList from "../blocks/activity/ActivitiesList";

const Popup: FC = () => {
  const tab = useAtomValue(popupToolbarTabAtom);
  return (
    <PreloadAndSync>
      <PopupLayout>{matchPopupTabs(tab) as unknown as ReactNode}</PopupLayout>
    </PreloadAndSync>
  );
};

export default Popup;

const Assets: FC = () => (
  <>
    <PopupNetworkSelect />
    {/* <AccountSelect className="mt-2" /> */}
    {/* <InteractionWithDapp className="mt-2" /> */}
    <TokenExplorer />
  </>
);

const PreloadAndSync: FC<PropsWithChildren> = ({ children }) => {
  const tabOrigin = useAtomValue(activeTabOriginAtom);
  const [permission] = useAtomsAll([
    getPermissionAtom(tabOrigin),
    web3MetaMaskCompatibleAtom,
  ]);

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
    [tabOrigin],
  );

  return (
    <NetworkSelect
      source="popup"
      className="max-w-auto"
      currentItemClassName="!h-11 pr-3 !pl-3 !py-7"
      currentItemIconClassName={classNames(
        "!w-8 !h-8",
        isSyncing && "animate-pulse",
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
    [setTokenType],
  );

  return (
    <div className="flex flex-wrap mt-2 min-h-0">
      <TokenList
        key={tokenType}
        tokenType={tokenType}
        toggleNftSwitcher={toggleNftSwitcher}
      />
    </div>
  );
};

const TokenManagement: FC<{
  flow: ManagementFlow;
  tokenType: TokenType;
  inputValue: string | null;
  inputRef: React.RefObject<HTMLInputElement>;
  setFlow: Dispatch<SetStateAction<ManagementFlow>>;
  setInputValue: Dispatch<SetStateAction<string | null>>;
  setManageMode: Dispatch<SetStateAction<boolean>>;
  setAddMode: Dispatch<SetStateAction<boolean>>;
}> = ({
  flow,
  setFlow,
  tokenType,
  inputRef,
  inputValue,
  setInputValue,
  setManageMode,
  setAddMode,
}) => {
  const handleChangeFlow = useCallback(
    (selectedFlow: ManagementFlow) => {
      if (flow !== "unset") {
        setFlow("unset");
        setInputValue(null);
        setManageMode(false);
        setAddMode(false);
      } else {
        setFlow(selectedFlow);

        switch (selectedFlow) {
          case "search": {
            console.log("search");
            break;
          }
          case "manage": {
            setManageMode(true);
            break;
          }
          case "add": {
            setAddMode(true);
            setManageMode(true);
            break;
          }
        }
      }
    },
    [flow, setFlow, setInputValue, setManageMode, setAddMode],
  );

  const input = useMemo(() => {
    let args: { placeholder: string; Icon?: FC } = {
      placeholder: "",
    };
    const tokenTypeName =
      tokenType === TokenType.Asset ? "Token address" : "NFT";

    switch (flow) {
      case "add": {
        args = {
          placeholder: `Add ${tokenTypeName}`,
          Icon: AddInputIcon,
        };
        break;
      }
      case "search": {
        args = {
          placeholder: "Search",
        };
        break;
      }
      case "manage": {
        args = {
          placeholder: "Search to manage",
        };
        break;
      }
      default:
        return args;
    }

    return args;
  }, [flow, tokenType]);

  useEffect(() => {
    if (flow !== "unset" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [flow, inputRef]);

  return (
    <div className={classNames("flex gap-2", flow !== "unset" && "w-full")}>
      {flow === "unset" ? (
        <>
          <ManageButton
            Icon={SearchIcon}
            onClick={() => handleChangeFlow("search")}
          />
          <ManageButton
            Icon={ControlIcon}
            onClick={() => handleChangeFlow("manage")}
          />
          <ManageButton
            Icon={AddIcon}
            onClick={() => handleChangeFlow("add")}
          />
        </>
      ) : (
        <>
          <ManageButton
            Icon={BackIcon}
            onClick={() => handleChangeFlow("unset")}
            className="!shrink-0"
          />
          <SearchInput
            ref={inputRef}
            searchValue={inputValue}
            toggleSearchValue={setInputValue}
            StartAdornment={input.Icon}
            inputClassName="!pl-9 !max-h-none"
            placeholder={input.placeholder}
            className="!group-focus:stroke-white"
            adornmentClassName={classNames(
              "!left-3",
              flow === "add" && "!left-4 !w-3 !h-3 [&>*]:fill-[#6A7185]",
            )}
          />
        </>
      )}
    </div>
  );
};

const ManageButton: FC<{
  onClick: () => void;
  Icon: FC<{
    className?: string;
  }>;
  className?: string;
}> = ({ Icon, onClick, className }) => {
  return (
    <Button
      className={classNames("!p-3 bg-[#2A2D35] hover:bg-[#373B45]", className)}
      theme="clean"
      onClick={onClick}
    >
      <Icon className="p-0 h-5 w-5 fill-white" />
    </Button>
  );
};

interface TokenListProps {
  tokenType: any;
  toggleNftSwitcher: (value: boolean) => void;
}
type ManagementFlow = "search" | "manage" | "add" | "unset";

const TokenList: FC<TokenListProps> = ({ tokenType, toggleNftSwitcher }) => {
  const [flow, setFlow] = useState<ManagementFlow>("unset");

  const {
    searchValue,
    setSearchValue,
    searchInputRef,
    tokens,
    loadMoreTriggerRef,
    manageModeEnabled,
    setManageModeEnabled,
    setAddMode,
    focusSearchInput,
    currentAccount,
    isNftsSelected,
    syncing,
    searching,
  } = useTokenList(tokenType, {
    searchPersist: tokenType === TokenType.NFT,
  });

  const tokensBar = useMemo(() => {
    if (tokens.length === 0) {
      if (searchValue) {
        return (
          <NullState
            searching={searching}
            focusSearchInput={focusSearchInput}
          />
        );
      } else if (isNftsSelected) {
        return <NoNftState syncing={syncing} />;
      }
    } else {
      return !isNftsSelected ? (
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
      );
    }

    return null;
  }, [
    currentAccount,
    focusSearchInput,
    isNftsSelected,
    loadMoreTriggerRef,
    manageModeEnabled,
    searchValue,
    searching,
    syncing,
    tokens,
  ]);

  return (
    <>
      <div className="pb-3 flex items-center justify-between w-full">
        {flow === "unset" ? (
          <AssetsSwitcher
            theme="medium"
            customLabels={["Tokens", "NFT"]}
            checked={isNftsSelected}
            onCheckedChange={toggleNftSwitcher}
          />
        ) : null}
        <TokenManagement
          flow={flow}
          setFlow={setFlow}
          inputRef={searchInputRef}
          inputValue={searchValue}
          setInputValue={setSearchValue}
          tokenType={tokenType}
          setManageMode={setManageModeEnabled}
          setAddMode={setAddMode}
        />
      </div>
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
            className={classNames(i !== tokens.length - 1 && "mb-1")}
          />
        ))}

        <ReceivePopup
          open={receivePopupOpened}
          onOpenChange={setReceivePopupOpened}
        />
      </>
    );
  },
);

type NftListProps = {
  tokens: AccountNFT[];
  currentAccount: Account;
  manageModeEnabled: boolean;
  loadMoreTriggerRef: (node: any) => void;
};

const NftList = memo<NftListProps>(
  ({ currentAccount, tokens, manageModeEnabled, loadMoreTriggerRef }) => {
    const [nftToken, setNftToken] = useState<AccountNFT | null>(null);

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
              [token.chainId, currentAccount.address, token.tokenSlug].join(
                "_",
              ),
            );
          } catch (e) {
            console.error(e);
          }
        } else {
          setNftToken(token);
        }
      },
      [manageModeEnabled, currentAccount.address, setNftToken],
    );

    useEffect(() => {
      setNftToken((current) => {
        if (!current) return current;

        const updated = tokens.find((t) => t.tokenSlug === current.tokenSlug);

        return updated ?? current;
      });
    }, [tokens, setNftToken]);

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
      [tokens.length, manageModeEnabled, handleNFTSelect, loadMoreTriggerRef],
    );

    return (
      <>
        <Masonry items={tokens} renderItem={renderNFTCard} gap="0.25rem" />

        <NFTOverviewPopup
          open={Boolean(nftToken)}
          token={nftToken}
          onOpenChange={() => setNftToken(null)}
        />
      </>
    );
  },
);

type ReceivePopupProps = Pick<SecondaryModalProps, "open" | "onOpenChange">;

const ReceivePopup: FC<ReceivePopupProps> = (props) => (
  <SecondaryModal {...props} small>
    <ShareAddress />
  </SecondaryModal>
);

const matchPopupTabs = (tab: PopupToolbarTab) => {
  return match<PopupToolbarTab, ReactNode>(tab)
    .with(PopupToolbarTab.Assets, () => <Assets />)
    .with(PopupToolbarTab.Activity, () => <ActivitiesList />)
    .with(P.any, () => <Assets />)
    .otherwise(() => <Redirect to={{ tab: PopupToolbarTab.Assets }} />);
};
