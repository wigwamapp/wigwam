import axios from "axios";
import { getAddress } from "ethers";
import { createERC20TokenSlug, NATIVE_TOKEN_SLUG } from "core/common/tokens";
import { withOfflineCache } from "lib/ext/offlineCache";

const ONE_DAY = 24 * 60 * 60_000;
const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

const onRampApi = axios.create({
  baseURL: process.env.WIGWAM_ON_RAMP_API_URL!,
  timeout: 90_000,
});

export const getOnRampCryptoCurrencies = withOfflineCache(
  async () => {
    const onRampCurrencies: Record<string, string> = {};
    const {
      data: { response: tokens },
    } = await onRampApi.get("/currencies/crypto-currencies");
    console.log(tokens);

    for (const { network, uniqueId, address } of tokens) {
      // * filter tokens
      if (
        // * empty token
        (!address && !network.chainId) ||
        // * non-evm token
        (address !== NATIVE_TOKEN_ADDRESS && !network.chainId)
      ) {
        continue;
      }
      const slug =
        address === NATIVE_TOKEN_ADDRESS || !address
          ? NATIVE_TOKEN_SLUG
          : createERC20TokenSlug(getAddress(address));
      const coinId = `${network.chainId}_${slug}`;
      onRampCurrencies[coinId] = uniqueId;
    }

    return onRampCurrencies;
  },
  {
    key: "onRamp_crypto_currencies",
    hotMaxAge: 5_000,
    coldMaxAge: ONE_DAY,
  },
);
