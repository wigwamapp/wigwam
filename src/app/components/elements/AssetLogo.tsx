import {
  ComponentProps,
  FC,
  useMemo,
  memo,
  ReactNode,
  CSSProperties,
} from "react";
import { dequal } from "dequal/lite";
import { useSafeState } from "lib/react-hooks/useSafeState";
import { useLazyAtomValue } from "lib/atom-utils";

import { getAssetLogoUrls } from "fixtures/networks";
import { Asset } from "core/types";
import { NATIVE_TOKEN_SLUG } from "core/common";

import { getNetworkAtom } from "app/atoms";

import Avatar from "./Avatar";
import AutoIcon from "./AutoIcon";
import NetworkIcon from "./NetworkIcon";

type AssetLogoProps = Omit<ComponentProps<typeof Avatar>, "src"> & {
  asset: Pick<Asset, "chainId" | "tokenSlug" | "symbol" | "logoUrl">;
};

const AssetLogo: FC<AssetLogoProps> = ({ asset, ...rest }) => {
  const srcs = useMemo(() => getAssetLogoUrls(asset), [asset]);
  const seed = `${asset.chainId}_${asset.tokenSlug}`;
  const isNative = asset.tokenSlug === NATIVE_TOKEN_SLUG;

  return (
    <AssetLogoAvatar
      key={seed}
      srcs={srcs}
      seed={seed}
      symbol={asset.symbol}
      chainId={asset.chainId}
      isNative={isNative}
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
    chainId: number;
    isNative: boolean;
  }
> = memo(
  ({ srcs, seed, symbol, chainId, isNative, className, style, ...rest }) => {
    const [srcIndex, setSrcIndex] = useSafeState(0);

    const autoFallback = (
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

    const fallback = isNative ? (
      <TokenNetIcon
        chainId={symbol !== "ETH" ? chainId : 1}
        fallback={autoFallback}
        className={className}
        style={style}
      />
    ) : (
      autoFallback
    );

    const cached = srcCache.get(seed);
    const src = cached !== null ? (cached ?? srcs[srcIndex]) : null;

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
  },
  dequal,
);

const TokenNetIcon = ({
  chainId,
  fallback,
  ...rest
}: {
  chainId: number;
  fallback: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => {
  const network = useLazyAtomValue(getNetworkAtom(chainId), "off");

  return network ? (
    <NetworkIcon network={network} withBorder {...rest} />
  ) : (
    fallback
  );
};
