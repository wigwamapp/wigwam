import { memo } from "react";
import classNames from "clsx";

import { ReactComponent as MediaFallbackIcon } from "app/icons/media-fallback.svg";
import Delay from "./Delay";

type NoNftStateProps = {
  syncing: boolean;
};

const NoNftState = memo<NoNftStateProps>(({ syncing }) => (
  <div
    className={classNames(
      "flex flex-col items-center",
      "h-full w-full py-9",
      !syncing && "pt-2",
      "text-sm text-brand-placeholder text-center"
    )}
  >
    <Delay ms={500}>
      {!syncing && <MediaFallbackIcon className="w-32 h-auto" />}
      <span>{!syncing ? "There are no NFTs yet" : "Syncing..."}</span>
    </Delay>
  </div>
));

export default NoNftState;
