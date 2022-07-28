import { forwardRef, memo, useMemo, useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import classNames from "clsx";

import { AccountNFT, TokenStatus } from "core/types";

import { prepareNFTLabel } from "app/utils";
import Avatar from "app/components/elements/Avatar";
import { ReactComponent as CheckIcon } from "app/icons/terms-check.svg";

type NftCardProps = {
  nft: AccountNFT;
  isActive?: boolean;
  onAssetSelect: (asset: AccountNFT) => void;
  isManageMode: boolean;
};

const NftCard = memo(
  forwardRef<HTMLButtonElement, NftCardProps>(
    ({ nft, isActive = false, onAssetSelect, isManageMode }, ref) => {
      const [loaded, setLoaded] = useState(false);

      const { thumbnailUrl, name, tokenId, rawBalance, status } = nft;
      const disabled = status === TokenStatus.Disabled;

      const title = useMemo(() => prepareName(tokenId, name), [name, tokenId]);

      return (
        <button
          ref={ref}
          type="button"
          onClick={() => onAssetSelect(nft)}
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
            !loaded && "invisible"
          )}
        >
          <div className="relative w-full">
            <Avatar
              src={thumbnailUrl}
              alt={title.label}
              setLoadingStatus={(status) => {
                setLoaded(status !== "loading" && status !== "idle");
              }}
              className={classNames(
                "w-full h-auto !rounded-md",
                !loaded && "h-[6rem]"
              )}
              errorClassName="h-[6rem]"
            />

            {rawBalance !== "1" && (
              <span
                className={classNames(
                  "block",
                  "absolute top-1 left-1",
                  "py-px px-2.5",
                  "rounded",
                  // "bg-brand-darkblue/[.8]",
                  "bg-[#35394D]",
                  "border border-brand-main/20"
                )}
              >
                {rawBalance}
              </span>
            )}
            {isManageMode && (
              <Checkbox.Root
                className={classNames(
                  "absolute top-1 right-1",
                  "w-5 h-5 min-w-[1.25rem]",
                  "bg-[#35394D]",
                  "rounded",
                  "flex items-center justify-center",
                  !disabled && "border border-brand-main"
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
    }
  )
);

export default NftCard;

const prepareName = (id: string, name?: string) => {
  const { name: preparedName, id: preparedId } = prepareNFTLabel(id, name);

  return {
    component: (
      <h3
        className={classNames(
          "line-clamp-2 break-words mt-2",
          !preparedName ? "text-brand-main" : ""
        )}
      >
        {preparedName}
        {preparedName && preparedId ? " " : ""}
        {preparedId ? (
          <span
            className={classNames(
              "text-brand-main",
              preparedId.length > 11 ? "break-all" : "break-words"
            )}
          >
            {preparedId}
          </span>
        ) : (
          ""
        )}
      </h3>
    ),
    label: `${preparedName ?? ""}${preparedName && preparedId ? " " : ""}${
      preparedId ?? ""
    }`,
  };
};
