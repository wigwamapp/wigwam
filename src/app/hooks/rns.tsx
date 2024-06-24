import { useMemo, useCallback } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { AddressZero } from "@ethersproject/constants";
import { namehash } from "@ethersproject/hash";

const ONE_DAY = 24 * 60 * 60 * 1000;

const ROOTSTOCK_RPC_NODE = "https://public-node.rsk.co";

// REF: https://developers.rsk.co/rif/rns/architecture/registry/
const RNS_REGISTRY_ADDRESS = "0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5";

const stripHexPrefix = (hex: string): string => hex.slice(2);

const RNS_REGISTRY_ABI = [
  "function resolver(bytes32 node) public view returns (address)",
];

const RNS_ADDR_RESOLVER_ABI = [
  "function addr(bytes32 node) public view returns (address)",
];

const RNS_NAME_RESOLVER_ABI = [
  "function name(bytes32 node) external view returns (string)",
];

const RNSProvider = new JsonRpcProvider(ROOTSTOCK_RPC_NODE);
const rnsRegistryContract = new Contract(
  RNS_REGISTRY_ADDRESS,
  RNS_REGISTRY_ABI,
  RNSProvider,
);

const resolveRnsName = async (name: string): Promise<string | null> => {
  const nameHash = namehash(name);
  const resolverAddress = await rnsRegistryContract.resolver(nameHash);

  if (resolverAddress === AddressZero) {
    return null;
  }

  const addrResolverContract = new Contract(
    resolverAddress,
    RNS_ADDR_RESOLVER_ABI,
    RNSProvider,
  );

  const address = await addrResolverContract.addr(nameHash);

  if (address === undefined || address === null) {
    return null;
  }

  return address.toLowerCase();
};

const lookupAddress = async (address: string): Promise<string | null> => {
  const reverseRecordHash = namehash(`${stripHexPrefix(address)}.addr.reverse`);

  const resolverAddress = await rnsRegistryContract.resolver(reverseRecordHash);

  if (resolverAddress === AddressZero) {
    return null;
  }

  const nameResolverContract = new Contract(
    resolverAddress,
    RNS_NAME_RESOLVER_ABI,
    RNSProvider,
  );

  const name = await nameResolverContract.name(reverseRecordHash);

  if (name === undefined) {
    return null;
  }

  return name;
};

const useRns = () => {
  const getRnsName = useCallback(async (address: string) => {
    const rnsNameLS = localStorage.getItem(`RNS_${address}`);
    const parsedData = rnsNameLS ? JSON.parse(rnsNameLS) : null;
    if (parsedData && parsedData.expirationTimestamp > Date.now()) {
      return parsedData.ensName;
    } else {
      const rnsName = await lookupAddress(address);

      if (rnsName) {
        const data = {
          rnsName,
          expirationTimestamp: Date.now() + ONE_DAY,
        };
        localStorage.setItem(`RNS_${address}`, JSON.stringify(data));
        return rnsName;
      } else {
        return null;
      }
    }
  }, []);

  const getAddressByRns = useCallback(async (rnsName: string) => {
    const address = await resolveRnsName(rnsName);

    if (address) {
      return address;
    } else {
      return null;
    }
  }, []);

  const watchRns = useCallback(
    async (value: any, cb: (address: string) => void) => {
      const ethereumAddressOrRNSRegex =
        /^(0x[a-fA-F0-9]{40})|([a-zA-Z0-9-]+\.rsk)$/;
      if (value && typeof value == "string") {
        const isValid = ethereumAddressOrRNSRegex.test(value);
        if (isValid && value.includes(".rsk")) {
          const response = await getAddressByRns(value);
          if (response) {
            cb(response);
          }
        }
      }
    },
    [getAddressByRns],
  );

  return useMemo(
    () => ({
      getRnsName,
      getAddressByRns,
      watchRns,
    }),
    [getRnsName, getAddressByRns, watchRns],
  );
};

export { useRns };
