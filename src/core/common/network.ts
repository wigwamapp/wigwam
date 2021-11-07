import memoizeOne from "memoize-one";
import * as Global from "lib/ext/global";

import { INetwork } from "core/repo";

export const getRpcUrl = memoizeOne(
  (network: INetwork) => {
    Global.get<string>(getDefaultRpcUrlKey(network.chainId)) ??
      network.rpcUrls[0];
  },
  ([a], [b]) => a.chainId === b.chainId
);

export function setRpcUrl(chainId: number, url: string) {
  Global.put(getDefaultRpcUrlKey(chainId), url);
  getRpcUrl.clear();
}

export function getDefaultRpcUrlKey(chainId: number) {
  return `default_rpc_url_${chainId}`;
}
