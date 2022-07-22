import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mergeRefs } from "react-merge-refs";
import { followCursor } from "tippy.js";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { AccountNFT, NFTContentType } from "core/types";
import { parseTokenSlug } from "core/common/tokens";

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
import { ReactComponent as BuyIcon } from "app/icons/buy.svg";
import { ReactComponent as ExpandIcon } from "app/icons/expand.svg";
import { ReactComponent as ShrinkIcon } from "app/icons/shrink.svg";

import TokenActivity from "./TokenActivity";
import { TokenStandardValue } from "./AssetInfo";

const NftInfo: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom)!;

  const chainId = useChainId();
  const currentAccount = useAtomValue(currentAccountAtom);

  const currentNetwork = useLazyNetwork();
  const explorerLink = useExplorerLink(currentNetwork);
  const tokenInfo = useAccountToken(tokenSlug) as AccountNFT | undefined;

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

  if (!tokenInfo) return null;

  const { thumbnailUrl, name, tokenId, rawBalance, detailUrl, contentType } =
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
                detailUrl={detailUrl}
                contentType={contentType}
                alt={`${preparedName ?? ""}${
                  preparedName && preparedId ? " " : ""
                }${preparedId ?? ""}`}
                rawBalance={rawBalance}
              />
              <div className="flex flex-col justify-between grow min-w-0 ml-4">
                <div className="flex items-start">
                  <div className="flex flex-col">
                    {preparedName && (
                      <h2
                        className={classNames(
                          "text-2xl font-bold",
                          "line-clamp-2",
                          "mr-4"
                        )}
                      >
                        {preparedName}
                      </h2>
                    )}
                    {preparedId && (
                      <CopiableTooltip
                        content={preparedId}
                        textToCopy={preparedId}
                        followCursor
                        plugins={[followCursor]}
                        className={classNames(
                          "text-2xl font-bold text-left",
                          "text-brand-main",
                          "min-w-0 truncate",
                          preparedName ? "mt-1" : ""
                        )}
                      >
                        <>{preparedId}</>
                      </CopiableTooltip>
                    )}
                  </div>
                  <TippySingletonProvider>
                    <div className="ml-auto flex items-center mt-1">
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
                      {explorerLink && (
                        <IconedButton
                          aria-label="View asset in Explorer"
                          Icon={WalletExplorerIcon}
                          className="!w-6 !h-6 min-w-[1.5rem]"
                          iconClassName="!w-[1.125rem]"
                          href={explorerLink.address(address)}
                        />
                      )}
                    </div>
                  </TippySingletonProvider>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Button
                    to={{ page: Page.Transfer }}
                    merge={["token"]}
                    theme="secondary"
                    className="grow !py-2 !min-w-0"
                  >
                    <SendIcon className="w-6 h-auto mr-2" />
                    Transfer
                  </Button>
                  <Button
                    theme="secondary"
                    className="grow !py-2 !min-w-0"
                    disabled
                    title="Coming soon"
                  >
                    <BuyIcon className="w-6 h-auto mr-2" />
                    Sell
                  </Button>
                </div>
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
  detailUrl?: string;
  contentType?: NFTContentType;
  alt: string;
  rawBalance: string;
};

const NftPreview: FC<NftPreviewProps> = ({
  thumbnailUrl,
  detailUrl,
  contentType,
  alt,
  rawBalance,
}) => {
  const [modalOpened, setModalOpened] = useState(false);
  const [hideAnimation, setHideAnimation] = useState(false);

  const handleModalOpen = useCallback(
    () => detailUrl && setModalOpened(true),
    [detailUrl]
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
          detailUrl ? "cursor-zoom-in" : "cursor-default"
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
              "border border-brand-main/20"
            )}
          >
            {rawBalance}
          </span>
        )}
        {detailUrl && (
          <ShrinkExpandButton
            Icon={ExpandIcon}
            className={classNames(
              "opacity-0",
              "group-hover:opacity-100",
              "absolute top-2 right-2"
            )}
          />
        )}
      </button>
      {detailUrl && modalOpened && (
        <button
          type="button"
          className={classNames(
            "fixed inset-0 z-[999999999999]",
            "bg-[#07081B]/[.98]",
            "flex justify-center items-center",
            "cursor-zoom-out",
            modalOpened && "animate-modalcontent",
            hideAnimation && "animate-modalcontentOut"
          )}
          onClick={handleModalClose}
        >
          <div
            className={classNames(
              "relative",
              "h-full w-auto max-h-[80%] max-w-[80%]",
              hideAnimation && "animate-modalcontentinnerOut"
            )}
          >
            {contentType === "image_url" && detailUrl && (
              <img
                src={detailUrl}
                alt={alt}
                className="h-full w-auto rounded-2xl"
              />
            )}

            <ShrinkExpandButton
              Icon={ShrinkIcon}
              size="large"
              className="absolute top-3 right-3"
            />
          </div>
        </button>
      )}
    </>
  );
};

type ShrinkExpandButtonProps = { className?: string };

const ShrinkExpandButton: FC<
  {
    Icon: FC<ShrinkExpandButtonProps>;
    size?: "small" | "large";
  } & ShrinkExpandButtonProps
> = ({ Icon, size = "small", className }) => (
  <span
    className={classNames(
      size === "small" && "w-[1.625rem] h-[1.625rem] rounded-md",
      size === "large" && "w-[2.5rem] h-[2.5rem] rounded-xl",
      "flex justify-center items-center",
      "bg-brand-darkblue/[.4]",
      "backdrop-blur-[8px]",
      "border border-brand-main/20",
      "transition",
      "hover:bg-brand-darkblue/[.6]",
      className
    )}
  >
    <Icon
      className={classNames(
        size === "small" && "w-4",
        size === "large" && "w-6",
        "h-auto"
      )}
    />
  </span>
);
