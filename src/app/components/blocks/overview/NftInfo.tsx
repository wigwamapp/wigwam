import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mergeRefs } from "react-merge-refs";
import { followCursor } from "tippy.js";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { TokenStandardValue } from "fixtures/tokens";

import { AccountNFT, TokenType } from "core/types";
import { parseTokenSlug } from "core/common/tokens";
import { findToken } from "core/client";

import { tokenSlugAtom } from "app/atoms";
import {
  OverflowProvider,
  TippySingletonProvider,
  useAccountToken,
  useChainId,
  useExplorerLink,
  useLazyNetwork,
  useTokenActivitiesSync,
  useAutoRefreshNftMetadata,
  useAccounts,
  useHideToken,
} from "app/hooks";
import { Page } from "app/nav";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import IconedButton from "app/components/elements/IconedButton";
import Button from "app/components/elements/Button";
import NftAvatar from "app/components/elements/NftAvatar";
import CopiableTooltip from "app/components/elements/CopiableTooltip";
import PrettyAmount from "app/components/elements/PrettyAmount";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as SendIcon } from "app/icons/send-action.svg";
import { ReactComponent as RefreshIcon } from "app/icons/refresh.svg";
import { ReactComponent as PlayIcon } from "app/icons/media-play.svg";
import { ReactComponent as ExpandIcon } from "app/icons/media-expand.svg";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";

import TokenActivity from "./TokenActivity";
import NftOverview from "../nft/NftOverview";

const NftInfo: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom)!;

  const chainId = useChainId();
  const { currentAccount } = useAccounts();

  const currentNetwork = useLazyNetwork();
  const explorerLink = useExplorerLink(currentNetwork);

  let tokenInfo = useAccountToken(tokenSlug) as AccountNFT | undefined;

  if (tokenInfo?.tokenType !== TokenType.NFT) {
    tokenInfo = undefined;
  }

  if (process.env.RELEASE_ENV === "false") {
    // eslint-disable-next-line
    useEffect(() => {
      console.info(tokenInfo);
    }, [tokenInfo]);
  }

  useTokenActivitiesSync(
    chainId,
    currentAccount.address,
    tokenInfo && tokenSlug,
  );

  useAutoRefreshNftMetadata(tokenInfo);

  const { standard, address } = useMemo(
    () => parseTokenSlug(tokenSlug),
    [tokenSlug],
  );

  const { copy, copied } = useCopyToClipboard(address);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo(0, 0);
  }, [tokenSlug]);

  const handleHideNFT = useHideToken(tokenInfo);

  const handleMetadataRefresh = useCallback(() => {
    findToken(chainId, currentAccount.address, tokenSlug, true);
  }, [chainId, currentAccount.address, tokenSlug]);

  if (!tokenInfo) return null;

  const { name, tokenId, rawBalance, detailUrl } = tokenInfo;
  const preparedId = `#${tokenId}`;

  return (
    <OverflowProvider>
      {(ref) => (
        <ScrollAreaContainer
          ref={mergeRefs([ref, scrollAreaRef])}
          hiddenScrollbar="horizontal"
          className="ml-6 pr-5 -mr-5 flex flex-col w-full"
          viewPortClassName="pt-6 viewportBlock"
          scrollBarClassName="py-0 pt-[18.75rem]"
          type="scroll"
        >
          <div>
            <div className="flex mb-6">
              <NftPreview token={tokenInfo!} rawBalance={rawBalance} />

              <div className="flex flex-col grow min-w-0 ml-4">
                <div className="flex justify-between items-center">
                  <CopiableTooltip
                    content={preparedId}
                    textToCopy={tokenId}
                    followCursor
                    plugins={[followCursor]}
                    className={classNames(
                      "text-2xl font-bold text-left",
                      "text-brand-main",
                      "min-w-0 truncate",
                    )}
                  >
                    <>{preparedId}</>
                  </CopiableTooltip>

                  <TippySingletonProvider>
                    <div className="flex items-center ml-4">
                      {explorerLink && (
                        <IconedButton
                          aria-label="View NFT details"
                          Icon={WalletExplorerIcon}
                          className="!w-6 !h-6 min-w-[1.5rem] mr-2"
                          iconClassName="!w-[1.125rem]"
                          href={detailUrl ?? explorerLink.nft(address, tokenId)}
                        />
                      )}
                      <IconedButton
                        aria-label={
                          copied
                            ? "Copied"
                            : `Copy ${TokenStandardValue[standard]} token address`
                        }
                        Icon={copied ? SuccessIcon : CopyIcon}
                        className="!w-6 !h-6 min-w-[1.5rem] mr-2"
                        iconClassName="!w-[1.125rem]"
                        onClick={() => copy()}
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
                        onClick={() => handleHideNFT()}
                        className="!w-6 !h-6 min-w-[1.5rem]"
                        iconClassName="!w-[1.125rem]"
                      />
                    </div>
                  </TippySingletonProvider>
                </div>

                {name && (
                  <h2
                    className={classNames(
                      "text-2xl font-bold",
                      "line-clamp-3",
                      preparedId && "mt-1 mb-6",
                    )}
                  >
                    {name}
                  </h2>
                )}
                <Button
                  to={{ page: Page.Transfer, transfer: "nft" }}
                  merge={["token"]}
                  theme="secondary"
                  className="!py-2 mt-auto mr-auto"
                >
                  <SendIcon className="w-6 h-auto mr-2" />
                  Send
                </Button>
              </div>
            </div>
            <TokenActivity token={tokenInfo!} />
          </div>
        </ScrollAreaContainer>
      )}
    </OverflowProvider>
  );
};

export default NftInfo;

type NftPreviewProps = {
  token: AccountNFT;
  rawBalance: string;
};

const NftPreview: FC<NftPreviewProps> = ({ token, rawBalance }) => {
  const [modalOpened, setModalOpened] = useState(false);

  const overviewable = Boolean(token.contentUrl || token.thumbnailUrl);
  const playable = Boolean(
    token.contentType === "video_url" || token.contentType === "audio_url",
  );

  const handleModalOpen = useCallback(
    () => overviewable && setModalOpened(true),
    [overviewable],
  );

  const handleModalClose = useCallback(() => {
    setModalOpened(false);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={handleModalOpen}
        className={classNames(
          "relative",
          "group",
          overviewable ? "cursor-zoom-in" : "cursor-default",
        )}
      >
        <NftAvatar
          src={token.thumbnailUrl}
          alt={token.name}
          className={classNames(
            "w-[13rem] min-w-[13rem] h-[13rem]",
            "!rounded-[.625rem]",
          )}
        />

        {rawBalance !== "1" && (
          <PrettyAmount
            amount={rawBalance}
            isMinified
            isThousandsMinified={false}
            decimals={0}
            className={classNames(
              "block",
              "absolute top-2 left-2",
              "py-0.5 px-4",
              "rounded",
              "text-sm font-bold",
              "bg-brand-darkblue/[.8]",
              "backdrop-blur-[8px]",
              "border border-brand-main/20",
              "color-brand-light",
            )}
          />
        )}

        {overviewable && (
          <>
            {playable && (
              <span
                className={classNames(
                  controlClassName,
                  "!p-2.5",
                  "!bg-brand-darkblue/[.6]",
                  "group-hover:!bg-brand-darkblue/[.8]",
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                )}
              >
                <PlayIcon className="w-6 h-auto" />
              </span>
            )}

            <span
              className={classNames(
                "w-[1.625rem] h-[1.625rem] !rounded-md",
                controlClassName,
                "!bg-brand-darkblue/[.8]",
                "opacity-0",
                "group-hover:opacity-100",
                "absolute top-2 right-2",
              )}
            >
              <ExpandIcon className="w-4 min-w-[1rem] h-auto" />
            </span>
          </>
        )}
      </button>

      {overviewable && modalOpened && (
        <div
          className={classNames("fixed inset-0 z-[999999999999]")}
          role="button"
          tabIndex={0}
          onClick={handleModalClose}
          onKeyDown={handleModalClose}
        >
          <NftOverview
            token={token}
            className="p-8 bg-[#0E1314]/[.98] cursor-zoom-out"
          />
        </div>
      )}
    </>
  );
};

const controlClassName = classNames(
  "rounded-[.625rem]",
  "bg-brand-darkblue/[.4]",
  "backdrop-blur-[8px]",
  "border border-brand-main/20",
  "transition",
  "p-2",
  "flex items-center justify-center",
  "hover:bg-brand-darkblue/[.6]",
);
