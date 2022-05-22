import memoize from "mem";

import { getNetwork } from "core/common";

export async function getMyRandomAddress(
  accountAddress: string,
  chainId: number,
  hops = 0
): Promise<string> {
  if (process.env.VIGVAM_DEV_RANDOM_ADDRESSES === "false") {
    return accountAddress;
  }

  const net = await getNetworkMemo(chainId);
  if (net.type === "testnet") return accountAddress;

  const storageKey = `__random_address_${accountAddress}`;
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    return stored;
  }

  const addresses = [
    "0xbdfa4f4492dd7b7cf211209c4791af8d52bf5c50",
    "0x9c5083dd4838e120dbeac44c052179692aa5dac5",
    "0xc1e42f862d202b4a0ed552c1145735ee088f6ccf",
    "0x50664ede715e131f584d3e7eaabd7818bb20a068",
    "0x3ec6732676db7996c1b34e64b0503f941025cb63",
    "0x1d5e65a087ebc3d03a294412e46ce5d6882969f4",
    "0x69bab6810fa99475854bca0a3dd72ae6a0728ece",
    "0xdb9d281c3d29baa9587f5dac99dd982156913913",
    "0x108a8b7200d044bbbe95bef6f671baec5473e05f",
    "0x0b5a91adc9a867501fd814cea2caba28f9770b63",
    "0xab5801a7d398351b8be11c439e05c5b3259aec9b",
  ];
  const randomIndex = Math.floor(Math.random() * addresses.length);
  const randomAddress = addresses[randomIndex];

  if (randomAddress in localStorage) {
    if (hops > 10) return accountAddress;
    return getMyRandomAddress(accountAddress, chainId, hops + 1);
  }

  localStorage.setItem(storageKey, randomAddress);
  localStorage.setItem(randomAddress, accountAddress);

  return randomAddress;
}

const getNetworkMemo = memoize(getNetwork);
