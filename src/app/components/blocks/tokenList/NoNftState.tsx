import { memo } from "react";
import classNames from "clsx";

import Delay from "./Delay";

type NoNftStateProps = {
  syncing: boolean;
};

const NoNftState = memo<NoNftStateProps>(({ syncing }) => (
  <div
    className={classNames(
      "flex flex-col items-center",
      "h-full w-full py-9",
      "text-sm text-brand-placeholder text-center"
    )}
  >
    <Delay ms={500}>
      <span>{!syncing ? "No NFT yet" : "Syncing..."}</span>
    </Delay>
  </div>
));

export default NoNftState;
