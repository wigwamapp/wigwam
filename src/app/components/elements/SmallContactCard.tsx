import { FC } from "react";
import { TReplace } from "lib/ext/i18n/react";
import classNames from "clsx";

import { Account, Contact } from "core/types";

import { useContactsDialog } from "app/hooks/contacts";
import InputLabelAction from "./InputLabelAction";
import AutoIcon from "./AutoIcon";
import WalletName from "./WalletName";
import { ReactComponent as PlusIcon } from "app/icons/PlusCircle.svg";

type SmallContactCardProps = {
  contact?: Contact | Account;
  address?: string;
  className?: string;
};

const SmallContactCard: FC<SmallContactCardProps> = ({
  contact,
  address,
  className,
}) => {
  const { upsertContact } = useContactsDialog();

  if (!contact && !address) {
    return null;
  }

  if (!contact) {
    return (
      <InputLabelAction
        className={classNames("pl-2 flex items-center", className)}
        onClick={() => upsertContact({ address })}
      >
        <PlusIcon className="mr-1 w-4 h-auto" />
        Save contact
      </InputLabelAction>
    );
  }

  return (
    <span
      className={classNames(
        "py-0.5 pl-0.5 pr-3 -my-1",
        "rounded-md",
        "border border-brand-main/[.07] text-sm",
        "flex items-center"
      )}
    >
      <AutoIcon
        seed={contact.address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-6 w-6 min-w-[1.5rem] mr-2",
          "bg-black/40",
          "rounded"
        )}
      />
      {"source" in contact ? (
        <WalletName wallet={contact} className="!font-normal" />
      ) : (
        <TReplace msg={contact.name} />
      )}
    </span>
  );
};

export default SmallContactCard;
