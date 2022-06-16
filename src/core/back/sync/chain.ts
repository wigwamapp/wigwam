import memoize from "mem";
import retry from "async-retry";
import { props } from "lib/system/promise";

import { ERC20__factory } from "abi-types";
import { parseTokenSlug } from "core/common/tokens";
import { requestBalance } from "core/common/balance";

import { getRpcProvider } from "../rpc";

export const getAccountTokenFromChain = async (
  chainId: number,
  accountAddress: string,
  tokenSlug: string
) => {
  const provider = getRpcProvider(chainId);

  const { address: tokenAddress } = parseTokenSlug(tokenSlug);
  const contract = ERC20__factory.connect(tokenAddress, provider);

  try {
    return await retry(
      () =>
        props({
          decimals: contract.decimals(),
          symbol: contract.symbol(),
          name: contract.name(),
          balance: contract.balanceOf(accountAddress),
        }),
      { retries: 3 }
    );
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getBalanceFromChain = memoize(
  async (chainId: number, tokenSlug: string, accountAddress: string) => {
    const provider = getRpcProvider(chainId);

    return requestBalance(provider, tokenSlug, accountAddress).catch(
      () => null
    );
  },
  {
    cacheKey: (args) => args.join("_"),
    maxAge: 3_000,
  }
);
