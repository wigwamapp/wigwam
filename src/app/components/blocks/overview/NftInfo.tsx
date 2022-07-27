import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mergeRefs } from "react-merge-refs";
import { followCursor } from "tippy.js";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Media,
  MuteButton,
  PlayButton,
  Time,
  TimeSlider,
  Video,
} from "@vidstack/player-react";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { AccountNFT, NFTContentType, TokenType } from "core/types";
import { parseTokenSlug } from "core/common/tokens";
import { findToken } from "core/client";

import { IS_FIREFOX } from "app/defaults";
import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import {
  OverflowProvider,
  TippySingletonProvider,
  useAccountToken,
  useChainId,
  useExplorerLink,
  useLazyNetwork,
  useTokenActivitiesSync,
} from "app/hooks";
import { prepareNFTLabel } from "app/utils";
import { Page } from "app/nav";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import IconedButton from "app/components/elements/IconedButton";
import Button from "app/components/elements/Button";
import Avatar from "app/components/elements/Avatar";
import CopiableTooltip from "app/components/elements/CopiableTooltip";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as RefreshIcon } from "app/icons/refresh.svg";
import { ReactComponent as PlayIcon } from "app/icons/media-play.svg";
import { ReactComponent as PauseIcon } from "app/icons/media-pause.svg";
import { ReactComponent as VolumeHighIcon } from "app/icons/media-volume-high.svg";
import { ReactComponent as VolumeMuteIcon } from "app/icons/media-volume-mute.svg";
import { ReactComponent as ExpandIcon } from "app/icons/media-expand.svg";
import { ReactComponent as ShrinkIcon } from "app/icons/media-shrink.svg";

import TokenActivity from "./TokenActivity";
import { TokenStandardValue } from "./AssetInfo";

const NftInfo: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom)!;

  const chainId = useChainId();
  const currentAccount = useAtomValue(currentAccountAtom);

  const currentNetwork = useLazyNetwork();
  const explorerLink = useExplorerLink(currentNetwork);

  let tokenInfo = useAccountToken(tokenSlug) as AccountNFT | undefined;

  if (tokenInfo?.tokenType !== TokenType.NFT) {
    tokenInfo = undefined;
  }

  useTokenActivitiesSync(
    chainId,
    currentAccount.address,
    tokenInfo && tokenSlug
  );

  const { standard, address } = useMemo(
    () => parseTokenSlug(tokenSlug),
    [tokenSlug]
  );

  const { copy, copied } = useCopyToClipboard(address);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo(0, 0);
  }, [tokenSlug]);

  const handleMetadataRefresh = useCallback(() => {
    findToken(chainId, currentAccount.address, tokenSlug, true);
  }, [chainId, currentAccount.address, tokenSlug]);

  if (!tokenInfo) return null;

  const { thumbnailUrl, name, tokenId, rawBalance, contentUrl, contentType } =
    tokenInfo;
  const { name: preparedName, id: preparedId } = prepareNFTLabel(tokenId, name);

  return (
    <OverflowProvider>
      {(ref) => (
        <ScrollAreaContainer
          ref={mergeRefs([ref, scrollAreaRef])}
          hiddenScrollbar="horizontal"
          className="ml-6 pr-5 -mr-5 flex flex-col"
          viewPortClassName="pb-20 pt-6 viewportBlock"
          scrollBarClassName="py-0 pt-[18.75rem] pb-20"
          type="scroll"
        >
          <div className="w-[31.5rem]">
            <div className="flex mb-6">
              <NftPreview
                thumbnailUrl={thumbnailUrl}
                contentUrl={contentUrl || thumbnailUrl}
                contentType={contentType}
                alt={`${preparedName ?? ""}${
                  preparedName && preparedId ? " " : ""
                }${preparedId ?? ""}`}
                rawBalance={rawBalance}
              />
              <div className="flex flex-col grow min-w-0 ml-4">
                <div className="flex justify-between items-center">
                  {preparedId && (
                    <CopiableTooltip
                      content={preparedId}
                      textToCopy={preparedId}
                      followCursor
                      plugins={[followCursor]}
                      className={classNames(
                        "text-2xl font-bold text-left",
                        "text-brand-main",
                        "min-w-0 truncate"
                      )}
                    >
                      <>{preparedId}</>
                    </CopiableTooltip>
                  )}
                  <TippySingletonProvider>
                    <div className="flex items-center ml-4">
                      <IconedButton
                        aria-label={
                          copied
                            ? "Copied"
                            : `Copy ${TokenStandardValue[standard]} token address`
                        }
                        Icon={copied ? SuccessIcon : CopyIcon}
                        className="!w-6 !h-6 min-w-[1.5rem] mr-2"
                        iconClassName="!w-[1.125rem]"
                        onClick={copy}
                      />
                      <IconedButton
                        aria-label={"Refresh NFT metadata"}
                        Icon={RefreshIcon}
                        onClick={handleMetadataRefresh}
                        className="!w-6 !h-6 min-w-[1.5rem] mr-2"
                        iconClassName="!w-[1.125rem]"
                      />
                      {explorerLink && (
                        <IconedButton
                          aria-label="View NFT in Explorer"
                          Icon={WalletExplorerIcon}
                          className="!w-6 !h-6 min-w-[1.5rem]"
                          iconClassName="!w-[1.125rem]"
                          href={explorerLink.nft(address, tokenId)}
                        />
                      )}
                    </div>
                  </TippySingletonProvider>
                </div>

                {preparedName && (
                  <h2
                    className={classNames(
                      "text-2xl font-bold",
                      "line-clamp-3",
                      preparedId && "mt-1 mb-6"
                    )}
                  >
                    {preparedName}
                  </h2>
                )}
                <Button
                  to={{ page: Page.Transfer }}
                  merge={["token"]}
                  theme="secondary"
                  className="!py-2 mt-auto mr-auto"
                >
                  <SendIcon className="w-6 h-auto mr-2" />
                  Transfer
                </Button>
              </div>
            </div>
            <TokenActivity />
          </div>
        </ScrollAreaContainer>
      )}
    </OverflowProvider>
  );
};

export default NftInfo;

type NftPreviewProps = {
  thumbnailUrl?: string;
  contentUrl?: string;
  contentType?: NFTContentType;
  alt: string;
  rawBalance: string;
};

const NftPreview: FC<NftPreviewProps> = ({
  thumbnailUrl,
  contentUrl,
  contentType,
  alt,
  rawBalance,
}) => {
  const [modalOpened, setModalOpened] = useState(false);
  const [hideAnimation, setHideAnimation] = useState(false);

  const handleModalOpen = useCallback(
    () => contentUrl && setModalOpened(true),
    [contentUrl]
  );

  const handleModalClose = useCallback(() => {
    setHideAnimation(true);

    const t = setTimeout(() => {
      setModalOpened(false);
      setHideAnimation(false);
    }, 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={handleModalOpen}
        className={classNames(
          "relative",
          "group",
          contentUrl ? "cursor-zoom-in" : "cursor-default"
        )}
      >
        <Avatar
          src={thumbnailUrl}
          alt={alt}
          className="w-[13rem] min-w-[13rem] h-[13rem] !rounded-[.625rem]"
        />
        {rawBalance !== "1" && (
          <span
            className={classNames(
              "block",
              "absolute top-2 left-2",
              "py-0.5 px-4",
              "rounded",
              "text-sm font-bold",
              "bg-brand-darkblue/[.8]",
              "backdrop-blur-[8px]",
              "border border-brand-main/20",
              "color-brand-light"
            )}
          >
            {rawBalance}
          </span>
        )}
        {contentType !== "image_url" && (
          <span
            className={classNames(
              // !rounded-md
              controlClassName,
              "!p-2.5",
              "!bg-brand-darkblue/[.6]",
              "group-hover:!bg-brand-darkblue/[.8]",
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            )}
          >
            <PlayIcon className="w-6 h-auto" />
          </span>
        )}
        {contentUrl && (
          <span
            className={classNames(
              "w-[1.625rem] h-[1.625rem] !rounded-md",
              controlClassName,
              "!bg-brand-darkblue/[.8]",
              "opacity-0",
              "group-hover:opacity-100",
              "absolute top-2 right-2"
            )}
          >
            <ExpandIcon className="w-4 min-w-[1rem] h-auto" />
          </span>
        )}
      </button>
      {contentUrl && (
        <Dialog.Root open={modalOpened} onOpenChange={handleModalClose}>
          <Dialog.Trigger />
          <Dialog.Portal
            className={classNames(
              modalOpened && "animate-modalcontent",
              hideAnimation && "animate-modalcontentOut"
            )}
          >
            <Dialog.Overlay
              className={classNames(
                "fixed inset-0 z-[999999999999]",
                "flex justify-center items-center",
                "bg-[#07081B]/[.98]",
                "cursor-zoom-out"
              )}
            >
              <Dialog.Content
                className={classNames(
                  "relative",
                  "h-full max-h-[80%] max-w-[80%]",
                  hideAnimation && "animate-modalcontentinnerOut",
                  contentType === "image_url"
                    ? "cursor-zoom-out"
                    : "cursor-default",
                  contentType === "image_url" ? "w-auto" : "w-full"
                )}
                onClick={() =>
                  contentType === "image_url" ? handleModalClose() : null
                }
              >
                {contentType === "image_url" && (
                  <>
                    <img
                      src={contentUrl}
                      alt={alt}
                      className="h-full w-auto rounded-2xl"
                    />
                    <span
                      className={classNames(
                        controlClassName,
                        "absolute top-3 right-3"
                      )}
                    >
                      <ShrinkIcon className="w-6 h-auto" />
                    </span>
                  </>
                )}
                {contentType === "video_url" && (
                  <MediaPlayer
                    thumbnailUrl={thumbnailUrl}
                    contentUrl={contentUrl}
                    onClose={handleModalClose}
                  />
                )}
              </Dialog.Content>
            </Dialog.Overlay>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </>
  );
};

const MediaPlayer: FC<{
  thumbnailUrl?: string;
  contentUrl: string;
  onClose?: () => void;
}> = ({ thumbnailUrl, contentUrl, onClose }) => (
  <Media className="h-full w-auto rounded-2xl overflow-hidden">
    <Video poster={thumbnailUrl}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        poster={thumbnailUrl}
        src={contentUrl}
        preload="none"
        data-video="0"
      />
    </Video>
    <button
      type="button"
      onClick={onClose}
      className={classNames(controlClassName, "absolute top-3 right-3")}
    >
      <ShrinkIcon className="w-6 h-auto" />
    </button>
    <div className="absolute left-0 right-0 bottom-0 p-3 flex flex-col">
      <TimeSlider className="h-4">
        <div
          className={classNames(
            "w-full h-1",
            "bg-brand-main/40",
            !IS_FIREFOX && "backdrop-blur-[10px]",
            "absolute top-1/2 left-0 -translate-y-1/2",
            "rounded-[.625rem]",
            "z-[0]",
            "cursor-pointer"
          )}
        />
        <div
          className={classNames(
            "w-full h-1",
            "bg-brand-light",
            "absolute top-1/2 left-0",
            "origin-left -translate-y-1/2",
            "w-[var(--vds-fill-percent)] will-change-[width]",
            "rounded-[.625rem]",
            "z-[1]",
            "cursor-pointer"
          )}
        />
        <div
          className={classNames(
            "absolute top-0 left-[var(--vds-fill-percent)]",
            "w-4 h-full",
            "z-[2]",
            "will-change-[left] -translate-x-1/2 -translate-y-1/2"
          )}
        >
          <div
            className={classNames(
              "absolute top-1/2 left-0",
              "w-4 h-4",
              "border border-brand-darkblue/[.4]",
              "rounded-full",
              "bg-brand-light",
              "cursor-pointer"
            )}
          />
        </div>
      </TimeSlider>
      <div className="mt-2 flex w-full">
        <PlayButton className={controlClassName}>
          <PlayIcon className="w-6 h-auto media-paused:block hidden" />
          <PauseIcon className="w-6 h-auto media-paused:hidden block" />
        </PlayButton>
        <div
          className={classNames(
            controlClassName,
            "ml-2 !px-3",
            "text-sm font-bold",
            "hover:!bg-brand-darkblue/[.4]"
          )}
        >
          <div className="flex items-center tabular-nums">
            <Time type="current" />
            <span className="mx-0.5">/</span>
            <Time type="duration" />
          </div>
        </div>
        <MuteButton className={classNames(controlClassName, "ml-auto")}>
          <VolumeHighIcon className="w-6 h-auto media-muted:hidden block" />
          <VolumeMuteIcon className="w-6 h-auto media-muted:block hidden" />
        </MuteButton>
      </div>
    </div>
  </Media>
);

const controlClassName = classNames(
  "rounded-[.625rem]",
  "bg-brand-darkblue/[.4]",
  "backdrop-blur-[8px]",
  "border border-brand-main/20",
  "transition",
  "p-2",
  "flex items-center justify-center",
  "hover:bg-brand-darkblue/[.6]"
);
