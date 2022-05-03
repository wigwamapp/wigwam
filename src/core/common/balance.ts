import { Signer } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import { ERC20__factory, ERC721__factory, ERC1155__factory } from "abi-types";

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

export async function isSmartContractAddress(
  provider: Provider,
  address: string
) {
  let contractCode;
  try {
    contractCode = await provider.getCode(address);
  } catch {
    contractCode = null;
  }

  const isContractAddress =
    contractCode && contractCode !== "0x" && contractCode !== "0x0";
  return { contractCode, isContractAddress };
}

const erc20Interface = ERC20__factory.createInterface();
const erc721Interface = ERC721__factory.createInterface();
const erc1155Interface = ERC1155__factory.createInterface();

export function parseStandardTokenTransactionData(data: string) {
  try {
    return erc20Interface.parseTransaction({ data });
  } catch {
    // ignore and next try to parse with erc721 ABI
  }

  try {
    return erc721Interface.parseTransaction({ data });
  } catch {
    // ignore and next try to parse with erc1155 ABI
  }

  try {
    return erc1155Interface.parseTransaction({ data });
  } catch {
    // ignore and return null
  }

  return null;
}
