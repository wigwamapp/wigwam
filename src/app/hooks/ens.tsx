import { useMemo, useCallback } from "react";
import { getClientProvider } from "core/client";
import { AvatarResolver } from "@ensdomains/ens-avatar";

const ONE_DAY = 24 * 60 * 60 * 1000;

const toDataURL = async (url: string) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    );

const useEns = () => {
  const provider = getClientProvider(1);

  const getEnsName = useCallback(
    async (address: string) => {
      const ensNameLS = localStorage.getItem(`ENS_${address}`);
      const parsedData = ensNameLS ? JSON.parse(ensNameLS) : null;
      if (parsedData && parsedData.expirationTimestamp > Date.now()) {
        return parsedData.ensName;
      } else {
        const ensName = await provider.lookupAddress(address);

        if (ensName) {
          const data = {
            ensName,
            expirationTimestamp: Date.now() + ONE_DAY,
          };
          localStorage.setItem(`ENS_${address}`, JSON.stringify(data));
          return ensName;
        } else {
          return null;
        }
      }
    },
    [provider],
  );

  const getAddressByEns = useCallback(
    async (ensName: string) => {
      const address = await provider.resolveName(ensName);
      if (address) {
        return address;
      } else {
        return null;
      }
    },
    [provider],
  );

  const getEnsAvatar = useCallback(
    async (ensName: string) => {
      const ensAvatarLS = localStorage.getItem(`ENS_AVATAR_${ensName}`);
      const parsedData = ensAvatarLS ? JSON.parse(ensAvatarLS) : null;
      if (parsedData && parsedData.expirationTimestamp > Date.now()) {
        return parsedData.imageUrl;
      } else {
        //@ts-expect-error: Should expect JsonRpcProvider
        const resolver = new AvatarResolver(provider);
        const imageUrl = await resolver.getAvatar(ensName, {});

        if (imageUrl) {
          const imageDataUrl = await toDataURL(imageUrl);

          const data = {
            imageUrl: imageDataUrl,
            expirationTimestamp: Date.now() + ONE_DAY,
          };

          localStorage.setItem(`ENS_AVATAR_${ensName}`, JSON.stringify(data));

          return imageDataUrl;
        } else {
          return null;
        }
      }
    },
    [provider],
  );

  const watchEns = useCallback(
    async (value: any, cb: (address: string) => void) => {
      const ethereumAddressOrENSRegex =
        /^(0x[a-fA-F0-9]{40})|([a-zA-Z0-9-]+\.eth)$/;
      if (value && typeof value == "string") {
        const isValid = ethereumAddressOrENSRegex.test(value);
        if (isValid && value.includes(".eth")) {
          const response = await getAddressByEns(value);
          if (response) {
            cb(response);
          }
        }
      }
    },
    [getAddressByEns],
  );

  return useMemo(
    () => ({
      getEnsName,
      getEnsAvatar,
      getAddressByEns,
      watchEns,
    }),
    [getEnsName, getEnsAvatar, getAddressByEns, watchEns],
  );
};

export { useEns };
