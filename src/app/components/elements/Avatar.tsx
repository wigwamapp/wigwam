import { FC, memo, useEffect, useState } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import classNames from "clsx";

import { ReactComponent as FallbackIconPrimitive } from "app/icons/Fallback.svg";

type AvatarProps = AvatarPrimitive.AvatarImageProps & {
  FallbackElement?: FC<{ className?: string }>;
  withBorder?: boolean;
  withBg?: boolean;
  imageClassName?: string;
  fallbackClassName?: string;
};

const Avatar = memo<AvatarProps>(
  ({
    FallbackElement = FallbackIcon,
    withBorder = true,
    withBg = true,
    className,
    imageClassName,
    fallbackClassName,
    ...rest
  }) => {
    const [loadingState, setLoadingState] = useState<
      "idle" | "loading" | "loaded" | "error"
    >("idle");
    const notLoaded = loadingState === "idle" || loadingState === "loading";

    const [delayFinished, setDelayFinished] = useState(false);
    useEffect(() => {
      const t = setTimeout(() => setDelayFinished(true), 150);
      return () => clearTimeout(t);
    }, []);

    const bgDisplayed = (notLoaded && delayFinished) || withBg;

    return (
      <AvatarPrimitive.Root
        className={classNames(
          "block",
          withBorder && [
            "rounded-full overflow-hidden",
            bgDisplayed && "bg-brand-main/10",
          ],
          loadingState === "error" &&
            "rounded-full bg-brand-main/10 overflow-hidden border border-brand-main/20",
          className
        )}
      >
        <AvatarPrimitive.Image
          {...rest}
          onLoadingStatusChange={setLoadingState}
          className={imageClassName}
        />
        {loadingState === "error" && (
          <AvatarPrimitive.Fallback className="flex justify-center items-center h-full">
            <FallbackElement className={fallbackClassName} />
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
