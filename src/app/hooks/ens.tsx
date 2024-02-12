import { useMemo, useCallback } from "react";
import { useProvider } from "app/hooks";
import { AvatarResolver } from "@ensdomains/ens-avatar";
import { http } from "viem";
import { mainnet } from "viem/chains";
import { createEnsPublicClient } from "@ensdomains/ensjs";

const client = createEnsPublicClient({
  chain: mainnet,
  transport: http(),
});

const useEns = () => {
  const provider = useProvider();

  const getEnsName = useCallback(
    async (address: string) => {
      const ensNameLS = localStorage.getItem(`ENS_${address}`);
      if (ensNameLS) {
        return ensNameLS;
      } else {
        const ensName = await provider.lookupAddress(address);
        if (ensName) {
          localStorage.setItem(`ENS_${address}`, ensName);
          return ensName;
        } else {
          return null;
        }
      }
    },
    [provider],
  );

  const getAddressByEns = useCallback(async (ensName: string) => {
    const ethAddress = await client.getAddressRecord({ name: ensName });
    if (ethAddress && ethAddress.value) {
      return ethAddress.value;
    } else {
      return null;
    }
  }, []);

  const getEnsAvatar = useCallback(
    async (ensName: string) => {
      const ensAvatarLS = localStorage.getItem(`ENS_AVATAR_${ensName}`);
      if (ensAvatarLS) {
        return ensAvatarLS;
      } else {
        //@ts-expect-error: Should expect JsonRpcProvider
        const resolver = new AvatarResolver(provider);
        const imageUrl = await resolver.getAvatar(ensName, {});
        if (imageUrl) {
          localStorage.setItem(`ENS_AVATAR_${ensName}`, imageUrl);
          return imageUrl;
        } else {
          return null;
        }
      }
    },
    [provider],
  );

  return useMemo(
    () => ({
      getEnsName,
      getEnsAvatar,
      getAddressByEns,
    }),
    [getEnsName, getEnsAvatar, getAddressByEns],
  );
};

export { useEns };
