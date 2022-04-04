import { FC } from "react";
import classNames from "clsx";
import { TReplace } from "lib/ext/i18n/react";

import { Account } from "core/types";

import AutoIcon from "app/components/elements/AutoIcon";
import { ReactComponent as ChevronRightIcon } from "app/icons/chevron-right.svg";
import HashPreview from "app/components/elements/HashPreview";
import Balance from "app/components/elements/Balance";

type WalletCardProps = {
  account: Account;
  active?: boolean;
  className?: string;
  onClick?: () => void;
};

const WalletCard: FC<WalletCardProps> = ({
  account: { name, address },
  active,
  className,
  onClick,
}) => {
  const classNamesList = classNames(
    "relative",
    "p-3",
    "w-[16.5rem] min-w-[16.5rem]",
    "bg-brand-main/5",
    "rounded-[.625rem]",
    "flex items-stretch",
    "text-left"
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
          "min-w-0",
          "transition-colors",
          "group-hover:text-brand-light",
          "group-focus-visible:text-brand-light"
        )}
      >
        <h3 className="overflow-ellipsis overflow-hidden whitespace-nowrap leading-[1.125rem] -mt-px">
          <TReplace msg={name} />
        </h3>
        <HashPreview
          hash={address}
          className="text-sm text-brand-inactivedark mt-0.5 font-normal leading-none"
          withTooltip={false}
        />
        <Balance address={address} className="mt-auto" />
        <ChevronRightIcon
          className={classNames(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "transition",
            "group-hover:translate-x-0 group-hover:opacity-100",
            active && "translate-x-0 opacity-100",
            !active && "-translate-x-1.5 opacity-0"
          )}
        />
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
          "hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
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
