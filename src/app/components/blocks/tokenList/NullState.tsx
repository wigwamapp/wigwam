import { memo } from "react";
import classNames from "clsx";

import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";

type NullStateProps = {
  searching: boolean;
  focusSearchInput: () => void;
};

const NullState = memo<NullStateProps>(({ searching, focusSearchInput }) => (
  <button
    type="button"
    className={classNames(
      "flex flex-col items-center",
      "h-full w-full py-9",
      "text-sm text-brand-placeholder text-center",
    )}
    onClick={focusSearchInput}
  >
    <NoResultsFoundIcon
      className={classNames("mb-4", searching && "animate-waving-hand")}
    />

    {searching ? (
      <>Searching...</>
    ) : (
      <div className="max-w-[16rem]">
        Can&apos;t find a token?
        <br />
        Put an address into the search line to add it to your assets list.
      </div>
    )}
  </button>
));

export default NullState;
