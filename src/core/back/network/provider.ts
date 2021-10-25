import { providers as multicallProviders } from "@0xsequence/multicall";
import { providers } from "ethers";
import memoizeOne from "memoize-one";
import { assert } from "lib/system/assert";

import * as Repo from "core/repo";

export async function performRpc(chainId: number, method: string, params: any) {
  const { plainProvider, multicallProvider } = await getProvider(chainId);

  switch (method) {
    case "getBalance":
      return multicallProvider.getBalance(params.address, params.blockTag);

    case "getCode":
      return multicallProvider.getCode(params.address, params.blockTag);

    case "call":
      return multicallProvider.call(params.transaction, params.blockTag);

    default:
      return plainProvider.perform(method, params);
  }
}

const getProvider = memoizeOne(async (chainId: number) => {
  const network = await Repo.networks.get(chainId);
  assert(network);

  const plainProvider = new NetworkProvider(network);
  const multicallProvider = new multicallProviders.MulticallProvider(
    plainProvider
  );

  return { plainProvider, multicallProvider };
});

class NetworkProvider extends providers.JsonRpcProvider {
  constructor({ chainId, name, rpcURLs }: Repo.INetwork) {
    super(rpcURLs[0], { chainId, name });
  }

  async detectNetwork() {
    return this.network;
  }
}
