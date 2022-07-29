import { forwardRef } from "react";
import classNames from "clsx";

import { ReactComponent as NftCallbackIcon } from "app/icons/nft-callback.svg";
import Avatar, { AvatarProps } from "./Avatar";

const NftAvatar = forwardRef<HTMLElement, AvatarProps>(
  ({ className, errorClassName, ...rest }, ref) => (
    <Avatar
      ref={ref}
      FallbackElement={NftCallbackIcon}
      className={classNames("!bg-brand-darkblue/50", className)}
      errorClassName={classNames("!border-brand-main/10", errorClassName)}
      {...rest}
    />
  )
);

export default NftAvatar;
