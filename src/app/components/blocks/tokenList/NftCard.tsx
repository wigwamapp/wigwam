import { forwardRef, memo, useMemo, useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import classNames from "clsx";

import { AccountNFT, TokenStatus } from "core/types";

import { prepareNFTLabel } from "app/utils";
import NftAvatar, {
  AvatarLoadingStatus,
} from "app/components/elements/NftAvatar";
import PrettyAmount from "app/components/elements/PrettyAmount";
import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";

const INITIAL_NFT_LOADING_STATUS = {
  state: "idle" as const,
  delayFinished: false,
};

type NftCardProps = {
  nft: AccountNFT;
  isActive?: boolean;
  onSelect: (asset: AccountNFT) => void;
  isManageMode: boolean;
};

const NftCard = memo(
  forwardRef<HTMLButtonElement, NftCardProps>(
    ({ nft, isActive = false, onSelect, isManageMode }, ref) => {
      const [{ state: loadingState, delayFinished }, setLoadingStatus] =
        useState<AvatarLoadingStatus>(INITIAL_NFT_LOADING_STATUS);

      const loaded = loadingState !== "idle" && loadingState !== "loading";
      const invisible = !delayFinished && !loaded;

      const { thumbnailUrl, name, tokenId, rawBalance, status } = nft;
      const disabled = status === TokenStatus.Disabled;

      const title = useMemo(() => prepareName(tokenId, name), [name, tokenId]);

      return (
        <button
          ref={ref}
          type="button"
          onClick={() => onSelect(nft)}
          className={classNames(
            "flex flex-col",
            "pt-1 px-1 pb-2",
            "text-left text-xs font-bold",
            "rounded-[.625rem]",
            "group",
            "transition",
            (isManageMode || !isActive) &&
              "hover:bg-brand-main/10 hover:!opacity-100",
            isActive && "bg-brand-main/20",
            (disabled || rawBalance === "0") && "opacity-60",
            invisible && "invisible",
          )}
        >
          <div className="relative w-full">
            <NftAvatar
              src={thumbnailUrl}
              alt={title.label}
              delay={1_000}
              onLoadingStateChange={setLoadingStatus}
              className={classNames(
                "w-full h-auto !rounded-md",
                !loaded && "aspect-square h-[6rem]",
              )}
              errorClassName="h-[6rem]"
            />
            {rawBalance !== "1" && (
              <PrettyAmount
                amount={rawBalance}
                isMinified
                isThousandsMinified={false}
                decimals={0}
                className={classNames(
                  "block",
                  "absolute top-1 left-1",
                  "py-px px-2.5",
                  "rounded",
                  "bg-[#35494D]",
                  "border border-brand-main/20",
                )}
              />
            )}

            {isManageMode && (
              <Checkbox.Root
                className={classNames(
                  "absolute top-1 right-1",
                  "w-5 h-5 min-w-[1.25rem]",
                  "bg-[#35494D]",
                  "rounded",
                  "flex items-center justify-center",
                  !disabled && "border border-brand-main",
                )}
                checked={!disabled}
                asChild
              >
                <span>
                  <Checkbox.Indicator>
                    {!disabled && <CheckIcon />}
                  </Checkbox.Indicator>
                </span>
              </Checkbox.Root>
            )}
          </div>
          {title.component}
        </button>
      );
    },
  ),
);

export default NftCard;

const prepareName = (originId: string, originName?: string) => {
  const { name, id } = prepareNFTLabel(originId, originName);

  return {
    component: (
      <h3
        className={classNames(
          "line-clamp-2 break-words mt-2 max-w-full",
          !name ? "text-brand-main" : "",
        )}
      >
        <span
          className={classNames(
            name &&
              name.length > 25 &&
              "inline-block max-w-full min-w-0 truncate",
            name &&
              name.length > 13 &&
              !name.slice(0, 13).includes(" ") &&
              "break-all",
          )}
        >
          {name}
        </span>
        {name && id ? " " : ""}
        {id ? (
          <span
            className={classNames(
              "text-brand-main",
              id.length > 11 ? "break-all" : "break-words",
            )}
          >
            {id}
          </span>
        ) : (
          ""
        )}
      </h3>
    ),
    label: `${name ?? ""}${name && id ? " " : ""}${id ?? ""}`,
  };
};
