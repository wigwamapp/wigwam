import {
  FC,
  ReactNode,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import classNames from "clsx";

import { ReactComponent as FallbackIconPrimitive } from "app/icons/Fallback.svg";

export type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

export type LoadingStatus = {
  state: ImageLoadingStatus;
  delayFinished: boolean;
};

export type AvatarProps = AvatarPrimitive.AvatarImageProps & {
  fallbackNode?: ReactNode;
  FallbackElement?: FC<{ className?: string }>;
  withBorder?: boolean;
  withBg?: boolean;
  imageClassName?: string;
  fallbackClassName?: string;
  errorClassName?: string;
  onLoadingStateChange?: (status: LoadingStatus) => void;
  delay?: number;
};

const Avatar = memo(
  forwardRef<HTMLElement, AvatarProps>(
    (
      {
        fallbackNode,
        FallbackElement = FallbackIcon,
        withBorder = true,
        withBg = true,
        className,
        imageClassName,
        fallbackClassName,
        errorClassName,
        onLoadingStateChange,
        delay = 150,
        style,
        ...rest
      },
      ref,
    ) => {
      const [loadingState, setLoadingState] =
        useState<ImageLoadingStatus>("idle");
      const [delayFinished, setDelayFinished] = useState(false);

      const notLoaded = loadingState === "idle" || loadingState === "loading";

      const handleDelayFinised = useCallback(() => {
        setDelayFinished(true);
        onLoadingStateChange?.({ state: loadingState, delayFinished: true });
      }, [setDelayFinished, onLoadingStateChange, loadingState]);

      const handleDelayFinisedRef = useRef(handleDelayFinised);
      useEffect(() => {
        handleDelayFinisedRef.current = handleDelayFinised;
      }, [handleDelayFinised]);

      useEffect(() => {
        const t = setTimeout(() => handleDelayFinisedRef.current(), delay);
        return () => clearTimeout(t);
      }, [delay]);

      const bgDisplayed = (notLoaded && delayFinished) || withBg;

      return (
        <AvatarPrimitive.Root
          ref={ref}
          className={classNames(
            "block",
            withBorder && [
              "rounded-full overflow-hidden",
              bgDisplayed && "bg-brand-main/10",
            ],
            loadingState === "error" && [
              "rounded-full bg-brand-main/10 overflow-hidden",
              !fallbackNode && "border border-brand-main/20",
              errorClassName,
            ],
            className,
          )}
          style={style}
        >
          <AvatarPrimitive.Image
            {...rest}
            onLoadingStatusChange={(state) => {
              setLoadingState(state);
              onLoadingStateChange?.({ state, delayFinished });
            }}
            className={classNames("w-full h-full object-cover", imageClassName)}
          />
          {loadingState === "error" && (
            <AvatarPrimitive.Fallback
              {...(fallbackNode
                ? {
                    asChild: true,
                  }
                : {
                    className:
                      "flex justify-center items-center h-full after:pr-full",
                  })}
            >
              {fallbackNode ?? (
                <FallbackElement
                  className={classNames(
                    "h-1/2 w-auto m-auto",
                    fallbackClassName,
                  )}
                />
              )}
            </AvatarPrimitive.Fallback>
          )}
        </AvatarPrimitive.Root>
      );
    },
  ),
);

export default Avatar;

const FallbackIcon: FC<{ className?: string }> = ({ className }) => (
  <FallbackIconPrimitive className={className} />
);
