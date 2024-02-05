import { TokenStandard } from "core/types";
import { parseTokenSlug } from "core/common/tokens";

import { getCoinGeckoPlatformIds, getCoinGeckoCoinIds } from "../dexPrices";

export const getTokenDetailsUrl = async (
  chainId: number,
  tokenSlug: string,
) => {
  try {
    const { standard, address } = parseTokenSlug(tokenSlug);

    if (standard === TokenStandard.Native) {
      const platformIds = await getCoinGeckoPlatformIds();
      const info = platformIds[chainId];

      if (info) {
        return `https://www.coingecko.com/en/coins/${info.native_coin_id}`;
      }
    } else if (standard === TokenStandard.ERC20) {
      const allCoinIds = await getCoinGeckoCoinIds();
      const tokenAddress = address.toLowerCase();

      if (allCoinIds[tokenAddress]) {
        return `https://www.coingecko.com/en/coins/${allCoinIds[tokenAddress]}`;
      } else {
        return `https://dexscreener.com/search?q=${tokenAddress}`;
      }
    }
  } catch (err) {
    console.log(err);
  }

  return null;
};
