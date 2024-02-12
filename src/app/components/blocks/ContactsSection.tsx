import {
  FC,
  forwardRef,
  HTMLAttributes,
  useCallback,
  useRef,
  useState,
} from "react";
import classNames from "clsx";

import * as Repo from "core/repo";

import { LOAD_MORE_ON_CONTACTS_FROM_END } from "app/defaults";
import { OverflowProvider } from "app/hooks";
import { useDialog } from "app/hooks/dialog";
import { useContacts, useContactsDialog } from "app/hooks/contacts";
import { ToastOverflowProvider, useToast } from "app/hooks/toast";
import SearchInput from "app/components/elements/SearchInput";
import HashPreview from "app/components/elements/HashPreview";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { ReactComponent as AddWalletIcon } from "app/icons/add-wallet.svg";
import { ReactComponent as DeleteIcon } from "app/icons/delete-medium.svg";
import { ReactComponent as EditIcon } from "app/icons/edit-medium.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";
import WalletAvatar from "../elements/WalletAvatar";

const ContactsSection: FC = () => {
  const { confirm } = useDialog();
  const { upsertContact } = useContactsDialog();
  const { updateToast } = useToast();
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const { contacts, loadMore, hasMore } = useContacts({
    search: searchValue ?? undefined,
  });

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerCardRef = useCallback(
    (node: HTMLDivElement) => {
      if (!contacts) return;

      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [hasMore, loadMore, contacts],
  );

  const handleDelete = useCallback(
    async (name: string, address: string) => {
      const response = await confirm({
        title: "Delete contact",
        content: (
          <p className="mb-4 mx-auto text-center">
            Are you sure you want to delete <b>{name}</b> contact with address{" "}
            <b>{address}</b>?
          </p>
        ),
        yesButtonText: "Delete",
      });

      if (response) {
        await Repo.contacts.delete(address);
        updateToast(`Contact "${name}" successfully deleted!`);
      }
    },
    [confirm, updateToast],
  );

  return (
    <div className="flex flex-col min-h-0 grow">
      <div className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <SearchInput
          placeholder="Type name or address to search..."
          searchValue={searchValue}
          toggleSearchValue={(value: string | null) => setSearchValue(value)}
          className="max-w-[18rem]"
        />
      </div>
      <OverflowProvider>
        {(ref) => (
          <ScrollAreaContainer
            ref={ref}
            className="pr-5 -mr-5"
            viewPortClassName="pb-5 rounded-t-[.625rem]"
            scrollBarClassName="py-0 pb-5"
          >
            <ToastOverflowProvider className="!top-0 !right-5">
              <div className="grid grid-cols-5 gap-5">
                <NewContactCard
                  onClick={() => upsertContact({ fromPage: true })}
                />
                {contacts.length === 0 ? (
                  <div
                    className={classNames(
                      "flex flex-col justify-center items-center",
                      "h-full",
                      "border border-brand-light/[.05]",
                      "rounded-[.625rem]",
                      "text-sm text-brand-placeholder",
                      "col-span-4",
                    )}
                  >
                    <NoResultsFoundIcon className="mb-4" />
                    No results found
                  </div>
                ) : (
                  contacts.map(({ name, address, addedAt }, i) => (
                    <ContactCard
                      key={address}
                      ref={
                        i ===
                        contacts.length - LOAD_MORE_ON_CONTACTS_FROM_END - 2
                          ? loadMoreTriggerCardRef
                          : null
                      }
                      name={name}
                      address={address}
                      onDelete={() => handleDelete(name, address)}
                      onEdit={() => upsertContact({ name, address, addedAt })}
                    />
                  ))
                )}
              </div>
            </ToastOverflowProvider>
          </ScrollAreaContainer>
        )}
      </OverflowProvider>
    </div>
  );
};

export default ContactsSection;

const emptyClassBg = classNames(
  "rounded bg-brand-main/10",
  "transition-colors",
  "group-hover:bg-brand-main/20 group-focus-visible:bg-brand-main/20",
);

const NewContactCard = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement>
>(({ ...rest }, ref) => (
  <button
    ref={ref}
    type="button"
    {...rest}
    className={classNames(
      "min-h-[14.375rem]",
      "flex flex-col items-center",
      "pt-8",
      "bg-brand-main/[.05] rounded-[.625rem]",
      "overflow-hidden",
      "group",
      "transition-colors",
      "group-hover:bg-brand-main/10 group-focus-visible:bg-brand-main/10",
    )}
  >
    <span
      className={classNames(
        emptyClassBg,
        "h-[4.625rem] w-[4.625rem]",
        "mb-[1.375rem]",
        "!rounded-[.625rem]",
      )}
    />
    <span className={classNames(emptyClassBg, "block w-28 h-5 mb-2")} />
    <span className={classNames(emptyClassBg, "block w-24 h-4")} />
    <span
      className={classNames(
        "w-full mt-auto py-2",
        "flex items-center justify-center",
        "bg-brand-main/[.05]",
        "transition-colors",
        "group-hover:bg-brand-main/20 group-focus-visible:bg-brand-main/20",
      )}
    >
      <AddWalletIcon className="w-6 h-auto" />
    </span>
  </button>
));

type ContactCardProps = {
  name: string;
  address: string;
  onDelete: () => void;
  onEdit: () => void;
  className?: string;
};

const ContactCard = forwardRef<HTMLDivElement, ContactCardProps>(
  ({ name, address, onDelete, onEdit }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(
          "flex flex-col items-center",
          "bg-brand-main/[.05] rounded-[.625rem]",
          "overflow-hidden",
          "min-h-[14.375rem]",
        )}
      >
        <div className="flex flex-col items-center pt-8 pb-4 px-3 w-full">
          <WalletAvatar
            seed={address}
            className={classNames(
              "h-[4.625rem] w-[4.625rem]",
              "mb-5",
              "bg-black/20",
              "rounded-[.625rem]",
            )}
          />
          <h2 className="text-base font-bold mb-1 truncate w-full text-center">
            {name}
          </h2>
          <HashPreview
            hash={address}
            className="text-sm text-brand-font font-normal"
          />
        </div>
        <div className="flex w-full">
          <ActionButton Icon={EditIcon} onClick={onEdit} />
          <span className="bg-brand-main/20 h-full w-px" />
          <ActionButton Icon={DeleteIcon} onClick={onDelete} />
        </div>
      </div>
    );
  },
);

type ActionButtonProps = {
  Icon: FC<{ className?: string }>;
} & HTMLAttributes<HTMLButtonElement>;

const ActionButton: FC<ActionButtonProps> = ({ Icon, className, ...rest }) => (
  <button
    type="button"
    className={classNames(
      "flex items-center justify-center grow",
      "py-2",
      "bg-brand-main/[.05]",
      "transition-colors",
      "hover:bg-brand-main/20 focus-visible:bg-brand-main/20",
      className,
    )}
    {...rest}
  >
    <Icon className="w-6 h-auto" />
  </button>
);
