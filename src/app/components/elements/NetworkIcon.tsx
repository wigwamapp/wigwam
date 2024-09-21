import { ComponentProps, FC, useMemo, memo } from "react";
import { dequal } from "dequal/lite";
import { useSafeState } from "lib/react-hooks/useSafeState";
import { wrapIpfsNetIcon } from "lib/wigwam-static";

import { getNetworkIconUrl } from "fixtures/networks";
import { Network } from "core/types";
import { EvmNetwork } from "core/common/chainList";

import Avatar from "./Avatar";
import AutoIcon from "./AutoIcon";

type NetworkIconProps = Omit<ComponentProps<typeof Avatar>, "src"> & {
  network: Network | EvmNetwork;
};

const NetworkIcon: FC<NetworkIconProps> = ({ network, ...rest }) => {
  const srcs = useMemo(() => {
    if ("type" in network) {
      const icon = getNetworkIconUrl(network);
      return icon ? [icon] : [];
    }

    if (network.icon?.url?.startsWith("ipfs")) {
      return [wrapIpfsNetIcon(network.icon!.url)];
    }

    return [];
  }, [network]);

  const seed = String(network.chainId);

  return (
    <NetworkIconAvatar
      key={seed}
      srcs={srcs}
      seed={seed}
      symbol={network.name}
      {...rest}
    />
  );
};

export default NetworkIcon;

const srcCache = new Map<string, string | null>();

const NetworkIconAvatar: FC<
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
      variant="sunset"
      initialsSource={symbol?.[0] ?? "NO"}
      initialsScale={0.35}
      initialsPlaceholder
      autoColors
      className={className}
      style={style}
    />
  );

  const cached = srcCache.get(seed);
  const src = cached !== null ? (cached ?? srcs[srcIndex]) : null;

  return src ? (
    <Avatar
      src={src}
      alt={symbol}
      fallbackNode={fallback}
      withBg={false}
      withBorder={false}
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
