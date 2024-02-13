import { FC, HTMLAttributes, memo, useEffect, useState } from "react";
import AutoIcon from "./AutoIcon";
import Avatar from "app/components/elements/Avatar";

import { useEns } from "app/hooks";

type WalletAvatarProps = HTMLAttributes<HTMLDivElement> & {
  seed: string;
};

const WalletAvatar: FC<WalletAvatarProps> = memo(({ seed, className }) => {
  const { getEnsName, getEnsAvatar } = useEns();

  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);

  useEffect(() => {
    const isValidEthereumAddress = (seed: string) => {
      const ethereumAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
      return ethereumAddressRegex.test(seed);
    };

    console.log("WALLET AVATAR CHANGE", seed);
    const fetchEnsName = async () => {
      try {
        const name = await getEnsName(seed);
        if (name) {
          const avatar = await getEnsAvatar(name);
          console.log(seed, avatar);
          setEnsAvatar(avatar);
        } else {
          setEnsAvatar(null);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (isValidEthereumAddress(seed)) {
      fetchEnsName();
    }
  }, [getEnsName, getEnsAvatar, seed]);

  return (
    <>
      {ensAvatar ? (
        <Avatar
          src={ensAvatar}
          className={className}
          imageClassName="rounded-md"
          alt={"ensAvatar"}
          withBorder={false}
        />
      ) : (
        <AutoIcon
          seed={seed}
          source="dicebear"
          type="personas"
          className={className}
        />
      )}
    </>
  );
});

export default WalletAvatar;
