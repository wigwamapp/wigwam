import mem from "mem";

import { TokenStandard } from "core/types";
import { getNetwork, isNetworkWithEthToken } from "core/common";
import { parseTokenSlug } from "core/common/tokens";

import { getCoinGeckoPlatformIds, getCoinGeckoCoinIds } from "../dexPrices";

export const getTokenDetailsUrl = async (
  chainId: number,
  tokenSlug: string,
) => {
  try {
    const { standard, address } = parseTokenSlug(tokenSlug);

    if (standard === TokenStandard.Native) {
      const [{ platformIds, chainIds }, network] = await Promise.all([
        getCoinGeckoPlatformIds(),
        getNetworkMemo(chainId),
      ]);

      const isETHToken = isNetworkWithEthToken(network);

      const info = platformIds[chainIds[isETHToken ? 1 : chainId]];

      if (info) {
        return `https://www.coingecko.com/en/coins/${info.native_coin_id}`;
      }
    } else if (standard === TokenStandard.ERC20) {
      const allCoinIds = await getCoinGeckoCoinIds();
      const tokenAddress = address.toLowerCase();

      const coinId = allCoinIds[tokenAddress]?.[chainId];

      if (coinId) {
        return `https://www.coingecko.com/en/coins/${coinId}`;
      } else {
        return `https://dexscreener.com/search?q=${tokenAddress}`;
      }
    }
  } catch (err) {
    console.log(err);
  }

  return null;
};

const getNetworkMemo = mem(getNetwork);
