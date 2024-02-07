import { getDexPrices, getCoinGeckoNativeTokenPrice } from "../dexPrices";

export const getTransakTokenPrice = async (
  tokenAddresses: string[],
  chainId: number,
) => {
  try {
    console.log(tokenAddresses);
    const coinGeckoPrices = await getDexPrices(tokenAddresses);
    const nativeTokenPrice = await getCoinGeckoNativeTokenPrice(chainId);
    return { ...coinGeckoPrices, nativeToken: nativeTokenPrice };
  } catch (err) {
    console.log(err);
  }

  return null;
};
