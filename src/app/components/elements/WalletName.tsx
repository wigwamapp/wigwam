import { FC, useEffect, useState } from "react";
import classNames from "clsx";
import { TReplace } from "lib/ext/i18n/react";

import { Account, AccountSource } from "core/types";
import { useEns, useRns } from "app/hooks";

import { ReactComponent as GoogleIcon } from "app/icons/google.svg";
import { ReactComponent as FacebookIcon } from "app/icons/facebook.svg";
import { ReactComponent as TwitterIcon } from "app/icons/twitter.svg";
import { ReactComponent as RedditIcon } from "app/icons/reddit.svg";
import { ReactComponent as LedgerIcon } from "app/icons/ledger.svg";
import { ReactComponent as KeyIcon } from "app/icons/lock-key.svg";
import { ReactComponent as EyeIcon } from "app/icons/opened-eye.svg";

type WalletNameProps = {
  wallet: Account | { name: string; address: string };
  theme?: "large" | "small" | "extrasmall";
  className?: string;
  iconClassName?: string;
};

const WalletName: FC<WalletNameProps> = ({
  wallet,
  theme = "large",
  className,
  iconClassName,
}) => {
  const { getEnsName } = useEns();
  const { getRnsName } = useRns();

  const [ensName, setEnsName] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnsName = async () => {
      try {
        const name =
          (await getEnsName(wallet.address)) ||
          (await getRnsName(wallet.address));
        setEnsName(name);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEnsName();
  }, [getEnsName, getRnsName, wallet.address]);

  return (
    <span
      className={classNames(
        "flex items-center",
        "min-w-0 w-full",
        "font-bold",
        theme === "large" && "leading-[1.125rem]",
        className,
      )}
    >
      {"source" in wallet ? (
        <Icon
          wallet={wallet}
          className={classNames(
            "h-auto",
            theme === "large" && "w-[1.125rem] min-w-[1.125rem] mr-1",
            theme === "small" && "w-4 min-w-[1rem] mr-0.5",
            iconClassName,
          )}
        />
      ) : null}
      <span className="truncate min-w-0">
        <TReplace msg={ensName ?? wallet.name} />
      </span>
    </span>
  );
};

export default WalletName;

const Icon: FC<{ wallet: Account; className?: string }> = ({
  wallet,
  className,
}) => {
  const Icn = getIcon(wallet);

  if (!Icn) {
    return null;
  }

  return <Icn className={className} />;
};

const getIcon = (wallet: Account) => {
  if (wallet.source === AccountSource.OpenLogin) {
    switch (wallet.social) {
      case "google":
        return GoogleIcon;
      case "facebook":
        return FacebookIcon;
      case "twitter":
        return TwitterIcon;
      case "reddit":
        return RedditIcon;
      default:
        throw new Error("Unhandled social provider");
    }
  }

  if (wallet.source === AccountSource.Ledger) {
    return LedgerIcon;
  }

  if (wallet.source === AccountSource.PrivateKey) {
    return KeyIcon;
  }

  if (wallet.source === AccountSource.Address) {
    return EyeIcon;
  }

  return null;
};
