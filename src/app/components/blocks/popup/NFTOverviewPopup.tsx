import { FC, useCallback } from "react";
import { useSetAtom } from "jotai";
import classNames from "clsx";

import { AccountNFT } from "core/types";

import { chainIdAtom } from "app/atoms";
import { useChainId, useAutoRefreshNftMetadata } from "app/hooks";
import { openInTab } from "app/helpers";
import { Page } from "app/nav";
import { prepareNFTLabel } from "app/utils";

import { ReactComponent as SendIcon } from "app/icons/send-action.svg";
import { ReactComponent as ExpandIcon } from "app/icons/expand.svg";
import Button from "app/components/elements/Button";

import PopupModal, { IPopupModalProps } from "./PopupModal";
import NftOverview from "../nft/NftOverview";

type NFTOverviewPopupProps = Pick<IPopupModalProps, "open" | "onOpenChange"> & {
  token: AccountNFT | null;
};

const NFTOverviewPopup: FC<NFTOverviewPopupProps> = ({ token, ...rest }) => {
  const chainId = useChainId();
  const setInternalChainId = useSetAtom(chainIdAtom);

  useAutoRefreshNftMetadata(token ?? undefined);

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

  return (
    <PopupModal
      {...rest}
      small
      contentClassName="!pt-0"
      closeButtonClassName="!top-[1.9rem]"
      header={
        tokenInfo && (
          <h3
            className={classNames(
              "line-clamp-2 break-words mt-2",
              "text-xl text-center font-bold",
              "w-full",
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
      <div className={classNames("w-full h-[20rem]", "rounded-xl")}>
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
