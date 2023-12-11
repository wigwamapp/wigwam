import { ComponentProps, FC, useMemo, memo } from "react";
import { dequal } from "dequal/lite";
import { useSafeState } from "lib/react-hooks/useSafeState";

import { getAssetLogoUrls } from "fixtures/networks";
import { Asset } from "core/types";

import Avatar from "./Avatar";
import AutoIcon from "./AutoIcon";

type AssetLogoProps = Omit<ComponentProps<typeof Avatar>, "src"> & {
  asset: Pick<Asset, "chainId" | "tokenSlug" | "symbol" | "logoUrl">;
};

const AssetLogo: FC<AssetLogoProps> = ({ asset, ...rest }) => {
  const srcs = useMemo(() => getAssetLogoUrls(asset), [asset]);
  const seed = `${asset.chainId}_${asset.tokenSlug}`;

  return (
    <AssetLogoAvatar
      key={seed}
      srcs={srcs}
      seed={seed}
      symbol={asset.symbol}
      {...rest}
    />
  );
};

export default AssetLogo;

const srcCache = new Map<string, string | null>();

const AssetLogoAvatar: FC<
  Omit<ComponentProps<typeof Avatar>, "src"> & {
    srcs: string[];
    seed: string;
    symbol: string;
  }
> = memo(({ srcs, seed, symbol, className, style, ...rest }) => {
  const [srcIndex, setSrcIndex] = useSafeState(0);

  const fallback = (
    <AutoIcon
      seed={seed}
      source="boring"
      variant="ring"
      initialsSource={symbol?.[0] ?? "NO"}
      initialsScale={0.35}
      initialsPlaceholder
      autoColors
      className={className}
      style={style}
    />
  );

  const cached = srcCache.get(seed);
  const src = cached !== null ? cached ?? srcs[srcIndex] : null;

  return src ? (
    <Avatar
      src={src}
      fallbackNode={fallback}
      withBg={false}
      onLoadingStateChange={({ state }) => {
        if (state === "error") {
          setSrcIndex((i) => (srcs[i + 1] ? i + 1 : -1));
          if (!srcs[srcIndex + 1]) srcCache.set(seed, null);
        }

        if (state === "loaded" && !srcCache.has(seed)) {
          srcCache.set(seed, srcs[srcIndex]);
        }
      }}
      className={className}
      style={style}
      {...rest}
    />
  ) : (
    fallback
  );
}, dequal);
