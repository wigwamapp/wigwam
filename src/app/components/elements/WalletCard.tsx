import { FC } from "react";
import classNames from "clsx";
import { TReplace } from "lib/ext/i18n/react";

import * as Repo from "core/repo";
import AutoIcon from "./AutoIcon";
import HashPreview from "./HashPreview";
import Balance from "./Balance";

const cardSizes = {
  detailed: 23.25,
  tiny: 16.5,
};

type WalletCardProps = {
  account: Repo.IAccount;
  type?: keyof typeof cardSizes;
  className?: string;
  onClick?: () => void;
};

const WalletCard: FC<WalletCardProps> = ({
  account: { name, address },
  type = "tiny",
  className,
  onClick,
}) => {
  const classNamesList = classNames(
    "flex",
    "bg-brand-main/5",
    "p-3",
    `max-w-[${cardSizes[type]}rem]`,
    "rounded-[.625rem]"
  );

  const content = (
    <>
      <AutoIcon
        seed={address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-14 w-14 min-w-[3.5rem]",
          "mr-3",
          "bg-black/20",
          "rounded-[.625rem]"
        )}
      />
      <span
        className={classNames(
          "flex flex-col",
          "text-base font-bold text-brand-inactivelight leading-none",
          "min-w-[0]",
          "transition-colors",
          "group-hover:text-brand-light",
          "group-focus:text-brand-light"
        )}
      >
        <h3 className="overflow-ellipsis overflow-hidden whitespace-nowrap">
          <TReplace msg={name} />
        </h3>
        <HashPreview
          hash={address}
          className="text-sm text-brand-inactivedark mt-1 font-normal leading-none"
        />
        <Balance address={address} className="mt-auto" />
      </span>
    </>
  );

  if (!!onClick) {
    return (
      <button
        type="button"
        className={classNames(
          classNamesList,
          "group",
          "cursor-pointer",
          "transition-colors",
          "hover:bg-brand-main/10 focus:bg-brand-main/10",
          className
        )}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return <div className={classNames(classNamesList, className)}>{content}</div>;
};

export default WalletCard;
