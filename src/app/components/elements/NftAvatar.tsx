import { forwardRef } from "react";
import classNames from "clsx";

import { ReactComponent as MediaFallbackIcon } from "app/icons/media-fallback.svg";
import Avatar, { AvatarProps, LoadingStatus } from "./Avatar";

export type { LoadingStatus as AvatarLoadingStatus };

const NftAvatar = forwardRef<HTMLElement, AvatarProps>(
  ({ className, errorClassName, ...rest }, ref) => (
    <Avatar
      ref={ref}
      FallbackElement={MediaFallbackIcon}
      className={classNames("!bg-brand-darkblue/50", className)}
      errorClassName={classNames(
        "aspect-square !border-brand-main/10",
        errorClassName,
      )}
      {...rest}
    />
  ),
);

export default NftAvatar;
