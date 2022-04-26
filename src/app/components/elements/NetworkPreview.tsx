import { memo } from "react";
import classNames from "clsx";

import { useLazyNetwork } from "app/hooks";

import Avatar from "./Avatar";
import { getNetworkIconUrl } from "fixtures/networks";

export const NetworkPreview = memo<{ className?: string }>(({ className }) => {
  const network = useLazyNetwork();

  return (
    <div
      className={classNames(
        "flex items-center",
        "w-full",
        "py-2.5 px-5",
        "text-sm font-bold",
        "bg-brand-main/5",
        "rounded-[.625rem]",
        "transition-colors",
        className
      )}
    >
      <Avatar
        src={network && getNetworkIconUrl(network.chainId)}
        alt={network?.name}
        className="w-7 mr-2"
      />

      {network?.name}
    </div>
  );
});

export default NetworkPreview;
