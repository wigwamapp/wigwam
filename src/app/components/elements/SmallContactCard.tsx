import { FC, useMemo } from "react";
import { TReplace } from "lib/ext/i18n/react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";
import Fuse from "fuse.js";

import { ACCOUNTS_SEARCH_OPTIONS } from "app/defaults";
import { allAccountsAtom, currentAccountAtom } from "app/atoms";
import { useContacts, useContactsDialog } from "app/hooks/contacts";
import InputLabelAction from "./InputLabelAction";
import AutoIcon from "./AutoIcon";
import WalletName from "./WalletName";
import { ReactComponent as PlusIcon } from "app/icons/PlusCircle.svg";

type SmallContactCardProps = {
  address?: string;
  className?: string;
};

const SmallContactCard: FC<SmallContactCardProps> = ({
  address,
  className,
}) => {
  const { upsertContact } = useContactsDialog();
  const { contacts } = useContacts({
    search: address ?? undefined,
    limit: 1,
  });

  const { currentAccount, allAccounts } = useAtomValue(
    useMemo(
      () =>
        waitForAll({
          currentAccount: currentAccountAtom,
          allAccounts: allAccountsAtom,
        }),
      []
    )
  );

  const accounts = useMemo(
    () =>
      allAccounts.filter(({ address }) => address !== currentAccount.address),
    [allAccounts, currentAccount.address]
  );

  const fuse = useMemo(
    () => new Fuse(accounts, ACCOUNTS_SEARCH_OPTIONS),
    [accounts]
  );

  const filteredAccounts = useMemo(() => {
    if (address) {
      return fuse.search(address).map(({ item: account }) => account);
    }
    return [];
  }, [fuse, address]);

  const mergedAccounts = useMemo(
    () => [...contacts, ...filteredAccounts],
    [contacts, filteredAccounts]
  );

  if (!address) {
    return null;
  }

  const contact = mergedAccounts[0];

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
        "flex items-center",
        className
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
