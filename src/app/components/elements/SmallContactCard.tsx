import { FC, useMemo } from "react";
import { TReplace } from "lib/ext/i18n/react";
import classNames from "clsx";
import { useLazyAtomValue } from "lib/atom-utils";

import { allAccountsAtom } from "app/atoms";
import { useContacts, useContactsDialog } from "app/hooks/contacts";
import { ReactComponent as PlusIcon } from "app/icons/PlusCircle.svg";

import InputLabelAction from "./InputLabelAction";
import WalletName from "./WalletName";
import HashPreview from "./HashPreview";
import IconedButton from "./IconedButton";
import WalletAvatar from "./WalletAvatar";

type SmallContactCardProps = {
  address?: string;
  isAddable?: boolean;
  addButton?: boolean;
  extended?: boolean;
  isSmall?: boolean;
  className?: string;
};

const SmallContactCard: FC<SmallContactCardProps> = ({
  address,
  isAddable = true,
  addButton = true,
  extended = false,
  isSmall = false,
  className,
}) => {
  const allAccounts = useLazyAtomValue(allAccountsAtom);

  const { upsertContact } = useContactsDialog();
  const { contacts } = useContacts({
    search: address ?? undefined,
    limit: 1,
  });

  const accounts = useMemo(
    () =>
      (allAccounts ?? []).filter(
        ({ address: accAddress }) => accAddress === address,
      ),
    [allAccounts, address],
  );

  const mergedAccounts = useMemo(
    () => [...contacts, ...accounts],
    [contacts, accounts],
  );

  if (!address) {
    return null;
  }

  const contact = mergedAccounts[0];

  if (!contact) {
    if (!isAddable) {
      return null;
    }

    if (extended) {
      return (
        <span className={classNames("flex items-center", className)}>
          <HashPreview hash={address} />
          {addButton && (
            <IconedButton
              Icon={PlusIcon}
              onClick={() => upsertContact({ address })}
              className="ml-2"
            />
          )}
        </span>
      );
    }

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
        "pr-3 -my-1",
        "rounded-md",
        "border border-brand-main/[.07]",
        !isSmall && "py-0.5 pl-0.5 text-sm",
        isSmall && "py-[0.1875rem] pl-[0.1875rem] text-xs",
        "flex items-center",
        className,
      )}
    >
      <WalletAvatar
        seed={contact.address}
        className={classNames(
          !isSmall && "h-6 w-6 min-w-[1.5rem] mr-2",
          isSmall && "h-4 w-4 min-w-[1rem] mr-1",
          "bg-black/40",
          "rounded",
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
