import { Signer } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import { ERC20__factory } from "abi-types";

import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "./tokens";

export async function requestBalance(
  provider: Provider | Signer,
  tokenSlug: string,
  accountAddress: string
) {
  if (tokenSlug === NATIVE_TOKEN_SLUG) {
    return await provider.getBalance(accountAddress);
  } else {
    const { address } = parseTokenSlug(tokenSlug);
    const contract = ERC20__factory.connect(address, provider);

    return await contract.balanceOf(accountAddress);
  }
}
