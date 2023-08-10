import { memo } from "react";
import classNames from "clsx";

import { AccountToken } from "core/types";

import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";

type NullStateProps = {
  isNftsSelected: boolean;
  manageModeEnabled: boolean;
  tokens: AccountToken[];
  focusSearchInput: () => void;
};

const AddTokenBanner = memo<NullStateProps>(
  ({ isNftsSelected, manageModeEnabled, tokens, focusSearchInput }) => (
    <div
      className={classNames(
        "max-h-0",
        "w-full",
        "overflow-hidden",
        manageModeEnabled &&
          tokens.length > 0 &&
          "transition-[max-height] duration-200 max-h-[4.25rem]",
      )}
    >
      <div className="pb-2">
        <button
          type="button"
          className={classNames(
            "flex items-center",
            "w-full py-2 px-3",
            "bg-brand-main/5",
            "rounded-[.625rem]",
            "text-sm text-brand-inactivelight text-left",
            "cursor-pointer",
            "transition-colors",
            "hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
          )}
          onClick={focusSearchInput}
        >
          <PlusCircleIcon className="w-6 min-w-[1.5rem] h-auto mr-2 fill-brand-inactivelight" />
          To add {!isNftsSelected ? "an asset" : "an NFT"}, enter the address{" "}
          {!isNftsSelected ? "into" : "and id"}
          <br />
          {!isNftsSelected ? "" : "into "}
          the search line
        </button>
      </div>
    </div>
  ),
);

export default AddTokenBanner;
