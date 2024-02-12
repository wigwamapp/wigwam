import { FC, HTMLAttributes, memo, useRef, useEffect, useState } from "react";
import classNames from "clsx";
import AutoIcon from "./AutoIcon";
import Avatar from "app/components/elements/Avatar";

import { useEns } from "app/hooks";

type WalletAvatarProps = HTMLAttributes<HTMLDivElement> & {
  seed: string;
};

const WalletAvatar: FC<WalletAvatarProps> = memo(({ seed, className }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  console.log("WALLET AVATAR");

  const { getEnsName, getEnsAvatar } = useEns();

  const [ensAvatar, setEnsAvatar] = useState<string | null>(null);

  useEffect(() => {
    const isValidEthereumAddress = (seed: string) => {
      const ethereumAddressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
      return ethereumAddressRegex.test(seed);
    };

    console.log("fetchEnsName");
    console.log(seed);

    const fetchEnsName = async () => {
      try {
        const name = await getEnsName(seed);
        if (name) {
          const avatar = await getEnsAvatar(name);
          console.log(avatar);
          setEnsAvatar(avatar);
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
    <div
      ref={rootRef}
      className={classNames(
        "inline-flex items-center justify-center relative",
        "overflow-hidden",
        className,
      )}
    >
      {ensAvatar ? (
        <Avatar src={ensAvatar} alt={"ensAvatar"} withBorder={false} />
      ) : (
        <AutoIcon
          seed={seed}
          source="dicebear"
          type="personas"
          className={classNames(
            "h-24 w-24 min-w-[6rem] m-0.5",
            "bg-black/40",
            "rounded-l-[.5625rem]",
          )}
        />
      )}
    </div>
  );
});

export default WalletAvatar;
