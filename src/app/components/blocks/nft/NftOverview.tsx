import {
  memo,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import { useDebouncedCallback } from "use-debounce";
import { useImageOrVideoSize } from "lib/react-hooks/useImageOrVideoSize";

import { AccountNFT } from "core/types";

import { ReactComponent as MediaFallbackIcon } from "app/icons/media-fallback.svg";

type NftOverviewProps = {
  token: AccountNFT;
  small?: boolean;
  rounded?: boolean;
  className?: string;
};

const NftOverview = memo<NftOverviewProps>(
  ({ token, small, rounded, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgOrVideoRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const contentSize = useImageOrVideoSize(imgOrVideoRef);

    const [fitContentBy, setFitContentBy] = useState<"width" | "height">();
    const [errored, setErrored] = useState(false);

    const estimateSizes = useCallback(() => {
      const container = containerRef.current;

      if (!container?.offsetWidth || !contentSize) return;

      const containerRatio = container.offsetWidth / container.offsetHeight;
      const contentRatio = contentSize[0] / contentSize[1];

      setFitContentBy(containerRatio > contentRatio ? "height" : "width");
    }, [setFitContentBy, contentSize]);

    const estimateSizesDebounced = useDebouncedCallback(estimateSizes, 200);

    useEffect(() => {
      window.addEventListener("resize", estimateSizesDebounced);
      return () => window.removeEventListener("resize", estimateSizesDebounced);
    }, [estimateSizesDebounced]);

    useEffect(estimateSizes, [estimateSizes]);

    useEffect(() => {
      const handleKeyPress = (evt: KeyboardEvent) => {
        if (evt.key !== " " && evt.code !== "Space") return;

        const media = audioRef.current ?? imgOrVideoRef.current;

        if (media && "play" in media) {
          if (media.paused) {
            media.play();
          } else {
            media.pause();
          }
        }
      };

      document.addEventListener("keypress", handleKeyPress);
      return () => document.removeEventListener("keypress", handleKeyPress);
    }, []);

    const contentClassName = classNames(
      !fitContentBy && "invisible",
      rounded && "rounded-xl",
      fitContentBy === "height" && "h-full w-auto",
      fitContentBy === "width" && "w-full h-auto",
    );

    const handleContentError = useCallback(
      () => setErrored(true),
      [setErrored],
    );

    const withErrorFallback = useCallback(
      (node: ReactNode) =>
        errored ? <MediaFallbackIcon className="h-full w-auto" /> : node,
      [errored],
    );

    let contentNode: ReactNode;

    switch (token.contentType) {
      case "video_url":
        contentNode = withErrorFallback(
          <video
            ref={imgOrVideoRef as RefObject<HTMLVideoElement>}
            src={token.contentUrl ?? ""}
            className={contentClassName}
            onError={handleContentError}
            autoPlay
            controls
          >
            <track kind="captions" />
          </video>,
        );
        break;

      case "audio_url":
        contentNode = (
          <div
            className={classNames(
              !errored ? contentClassName : "h-full",
              !small && "relative",
            )}
          >
            {withErrorFallback(
              <img
                ref={imgOrVideoRef as RefObject<HTMLImageElement>}
                src={token.thumbnailUrl ?? ""}
                alt={token.name}
                className={contentClassName}
                onError={handleContentError}
              />,
            )}

            <div className={classNames("absolute", "bottom-2 left-2 right-2")}>
              <audio
                ref={audioRef}
                src={token.contentUrl ?? ""}
                onError={handleContentError}
                className="w-full"
                id="nft-overview-content"
                autoPlay
                controls
              >
                <track kind="captions" />
              </audio>
            </div>
          </div>
        );
        break;

      default:
        contentNode = withErrorFallback(
          <img
            ref={imgOrVideoRef as RefObject<HTMLImageElement>}
            src={token.contentUrl || token.thumbnailUrl || ""}
            alt={token.name}
            className={contentClassName}
            onError={handleContentError}
          />,
        );
    }

    return (
      <div
        ref={containerRef}
        className={classNames(
          "w-full h-full",
          "flex items-center justify-center",
          "relative",
          className,
        )}
      >
        {contentNode}

        {!fitContentBy && !errored && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="atom-spinner w-16 h-16" />
          </div>
        )}
      </div>
    );
  },
);

export default NftOverview;
