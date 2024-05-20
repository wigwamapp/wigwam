import { FC, useCallback } from "react";
import { useSetAtom } from "jotai";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { AccountNFT } from "core/types";
import { findToken } from "core/client";

import { chainIdAtom } from "app/atoms";
import {
  useChainId,
  useAutoRefreshNftMetadata,
  useHideToken,
  TippySingletonProvider,
  useAccounts,
  useExplorerLink,
  useLazyNetwork,
} from "app/hooks";
import { openInTab } from "app/helpers";
import { Page } from "app/nav";
import { prepareNFTLabel } from "app/utils";

import { ReactComponent as SendIcon } from "app/icons/send-action.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as RefreshIcon } from "app/icons/refresh.svg";
import { ReactComponent as ExpandIcon } from "app/icons/expand.svg";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import Button from "app/components/elements/Button";
import IconedButton from "app/components/elements/IconedButton";

import PopupModal, { IPopupModalProps } from "./PopupModal";
import NftOverview from "../nft/NftOverview";

type NFTOverviewPopupProps = Pick<IPopupModalProps, "open" | "onOpenChange"> & {
  token?: AccountNFT;
};

const NFTOverviewPopup: FC<NFTOverviewPopupProps> = ({
  token,
  onOpenChange,
  ...rest
}) => {
  const chainId = useChainId();
  const setInternalChainId = useSetAtom(chainIdAtom);
  const { currentAccount } = useAccounts();

  const currentNetwork = useLazyNetwork();
  const explorerLink = useExplorerLink(currentNetwork);

  useAutoRefreshNftMetadata(token);

  const onClose = useCallback(() => onOpenChange?.(false), [onOpenChange]);

  const handleHideToken = useHideToken(token, onClose);

  const handleMetadataRefresh = useCallback(() => {
    if (token?.tokenSlug) {
      findToken(chainId, currentAccount.address, token?.tokenSlug, true);
    }
  }, [chainId, currentAccount.address, token?.tokenSlug]);

  const openLink = useCallback(
    (to: Record<string, unknown>) => {
      setInternalChainId(chainId);
      openInTab(to);
    },
    [setInternalChainId, chainId],
  );
  const tokenInfo = token
    ? prepareNFTLabel(token?.tokenId, token?.name)
    : undefined;

  const { copy, copied } = useCopyToClipboard();

  return (
    <PopupModal
      {...rest}
      onOpenChange={onOpenChange}
      small
      contentClassName="!pt-0"
      closeButtonClassName="!top-[1.9rem]"
      header={
        tokenInfo && (
          <h3
            className={classNames(
              "line-clamp-2 break-words mt-2",
              "text-xl text-left font-bold",
              "w-full pr-6",
              !tokenInfo.name ? "text-brand-main" : "",
            )}
          >
            <span
              className={classNames(
                tokenInfo.name &&
                  tokenInfo.name.length > 13 &&
                  !tokenInfo.name.slice(0, 13).includes(" ") &&
                  "break-all",
              )}
            >
              {tokenInfo.name}
            </span>
            {tokenInfo.name && tokenInfo.id ? " " : ""}
            {tokenInfo.id ? (
              <span
                className={classNames(
                  "text-brand-main",
                  tokenInfo.id.length > 11 ? "break-all" : "break-words",
                )}
              >
                {tokenInfo.id}
              </span>
            ) : (
              ""
            )}
          </h3>
        )
      }
    >
      {token && (
        <TippySingletonProvider>
          <div className="w-full flex items-center mt-2">
            {explorerLink && (
              <IconedButton
                aria-label="View NFT details"
                Icon={WalletExplorerIcon}
                className="!w-6 !h-6 min-w-[1.5rem] mr-2"
                iconClassName="!w-[1.125rem]"
                href={
                  token.detailUrl ??
                  explorerLink.nft(token.contractAddress, token.tokenId)
                }
              />
            )}
            <IconedButton
              aria-label={copied ? "Copied" : `Copy NFT contract address`}
              Icon={copied ? SuccessIcon : CopyIcon}
              className="!w-6 !h-6 min-w-[1.5rem] mr-2"
              iconClassName="!w-[1.125rem]"
              onClick={() => copy(token.contractAddress)}
            />
            <IconedButton
              aria-label={"Refresh NFT metadata"}
              Icon={RefreshIcon}
              onClick={handleMetadataRefresh}
              className="!w-6 !h-6 min-w-[1.5rem] mr-2"
              iconClassName="!w-[1.125rem]"
            />
            <IconedButton
              aria-label="Hide token"
              Icon={EyeIcon}
              onClick={() => handleHideToken()}
              className="!w-6 !h-6 min-w-[1.5rem]"
              iconClassName="!w-[1.125rem]"
            />
          </div>
        </TippySingletonProvider>
      )}

      <div
        className={classNames(
          "w-full min-h-[10rem] max-h-[24rem] overflow-hidden",
          "rounded-xl my-4 flex items-center justify-center",
        )}
      >
        {token && (
          <NftOverview
            key={getNftOverviewKey(token)}
            token={token}
            small
            rounded
          />
        )}
      </div>

      <div className={classNames("w-full", "grid grid-cols-2 gap-3")}>
        <Button
          className="grow !py-[0.60rem] !min-w-[8rem] !rounded-lg"
          onClick={() =>
            token && openLink({ page: Page.Transfer, token: token.tokenSlug })
          }
        >
          <SendIcon className="w-6 h-auto mr-2 [&>path]:stroke-brand-dark" />
          Send
        </Button>
        <Button
          theme="secondary"
          className="grow !py-[0.63rem] !min-w-[8rem] !rounded-lg"
          onClick={() =>
            token && openLink({ page: Page.Default, token: token.tokenSlug })
          }
        >
          <ExpandIcon className="w-4 h-auto mr-2" />
          Open Full
        </Button>
      </div>
    </PopupModal>
  );
};

export default NFTOverviewPopup;

function getNftOverviewKey(token: AccountNFT) {
  return `${token.contentType}_${token.thumbnailUrl}_${token.contentUrl}`;
}
