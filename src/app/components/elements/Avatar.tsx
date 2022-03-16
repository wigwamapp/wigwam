import { FC, memo, useState } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import classNames from "clsx";

import { ReactComponent as FallbackIconPrimitive } from "app/icons/Fallback.svg";

type AvatarProps = AvatarPrimitive.AvatarImageProps & {
  FallbackElement?: FC<{ className?: string }>;
};

const Avatar = memo<AvatarProps>(
  ({ FallbackElement = FallbackIcon, className, ...rest }) => {
    const [loadingState, setLoadingState] = useState<
      "idle" | "loading" | "loaded" | "error"
    >("idle");

    return (
      <AvatarPrimitive.Root
        className={classNames(
          "rounded-full overflow-hidden",
          "bg-brand-main/10",
          loadingState === "error" && "border border-brand-main/20",
          className
        )}
      >
        <AvatarPrimitive.Image
          {...rest}
          onLoadingStatusChange={setLoadingState}
        />
        {loadingState === "error" && (
          <AvatarPrimitive.Fallback className="flex justify-center items-center h-full">
            <FallbackElement />
          </AvatarPrimitive.Fallback>
        )}
      </AvatarPrimitive.Root>
    );
  }
);

export default Avatar;

const FallbackIcon: FC<{ className?: string }> = ({ className }) => (
  <FallbackIconPrimitive
    className={classNames("h-1/2 w-auto m-auto", className)}
  />
);
