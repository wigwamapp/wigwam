import {
  ButtonHTMLAttributes,
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import { FieldMetaState } from "react-final-form";
import * as Popover from "@radix-ui/react-popover";
import Fuse from "fuse.js";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";
import mergeRefs from "react-merge-refs";
import { TReplace } from "lib/ext/i18n/react";
import { useOnScreen } from "lib/react-hooks/useOnScreen";

import { Account, Contact } from "core/types";

import {
  ACCOUNTS_SEARCH_OPTIONS,
  LOAD_MORE_ON_CONTACTS_DROPDOWN_FROM_END,
} from "app/defaults";
import { useContacts } from "app/hooks/contacts";
import { allAccountsAtom, currentAccountAtom } from "app/atoms";
import ScrollAreaContainer from "./ScrollAreaContainer";
import AddressField, { AddressFieldProps } from "./AddressField";
import InputLabelAction from "./InputLabelAction";
import AutoIcon from "./AutoIcon";
import WalletName from "./WalletName";
import HashPreview from "./HashPreview";
import { ReactComponent as PlusIcon } from "app/icons/PlusCircle.svg";

type ContactAutocompleteProps = {
  meta: FieldMetaState<any>;
  setValue: (address: string) => void;
} & AddressFieldProps;

const ContactAutocomplete = forwardRef<
  HTMLTextAreaElement,
  ContactAutocompleteProps
>(({ setValue, meta, value, ...rest }, ref) => {
  const { contacts, loadMore, hasMore } = useContacts({
    search: (value as string) ?? undefined,
    limit: 20,
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

  const [opened, setOpened] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(0);
  const [isAfterArrowClick, setIsAfterArrowClick] = useState(false);

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
    if (value) {
      return fuse.search(value as string).map(({ item: account }) => account);
    }
    return accounts;
  }, [accounts, fuse, value]);

  const mergedAccounts = useMemo(
    () => [...contacts, ...filteredAccounts],
    [contacts, filteredAccounts]
  );

  useEffect(() => {
    if (meta.active) {
      setOpened((prevState) => {
        if (!prevState) {
          setActiveSuggestion(0);
        }
        return true;
      });
    } else {
      setOpened(false);
    }
  }, [contacts, meta.active]);

  const handleKeyClick = useCallback(
    (e) => {
      if (mergedAccounts) {
        if (e.keyCode === 40) {
          setActiveSuggestion((prevState) =>
            prevState + 1 > mergedAccounts.length - 1 ? 0 : prevState + 1
          );
          setIsAfterArrowClick(true);
          e.preventDefault();
        }
        if (e.keyCode === 38) {
          setActiveSuggestion((prevState) =>
            prevState - 1 < 0 ? mergedAccounts.length - 1 : prevState - 1
          );
          setIsAfterArrowClick(true);
          e.preventDefault();
        }
        if (e.keyCode === 32 || e.keyCode === 13) {
          if (activeSuggestion !== null && mergedAccounts[activeSuggestion]) {
            setValue(mergedAccounts[activeSuggestion].address);
          }
          e.preventDefault();
        }
      }
      rest.onKeyDown?.(e);
    },
    [mergedAccounts, rest, activeSuggestion, setValue]
  );

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerAssetRef = useCallback(
    (node) => {
      if (!contacts || !hasMore) return;

      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [hasMore, loadMore, contacts]
  );

  const labelAction = useMemo(() => {
    if (!meta.error && mergedAccounts.length === 0) {
      return (
        <InputLabelAction className="pl-2 flex items-center">
          <PlusIcon className="mr-1 w-4 h-auto" />
          Save contact
        </InputLabelAction>
      );
    }
    if (mergedAccounts.length === 1 && !meta.error) {
      const contact = mergedAccounts[0];
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
    }
    return undefined;
  }, [mergedAccounts, meta.error]);

  return (
    <Popover.Root open={opened} modal={false} onOpenChange={() => undefined}>
      <Popover.Trigger className="w-full" asChild>
        <AddressField
          ref={ref}
          value={value}
          {...rest}
          onKeyDown={handleKeyClick}
          setFromClipboard={setValue}
          error={opened ? undefined : rest.error}
          labelActions={labelAction}
        />
      </Popover.Trigger>
      {mergedAccounts.length > 0 &&
        !(mergedAccounts.length === 1 && !meta.error) && (
          <Popover.Content
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            side="bottom"
            avoidCollisions={false}
            className={classNames(
              "shadow-xs",
              "focus-visible:outline-none",
              "mt-2",
              "w-full min-w-[17.75rem]",
              "rounded-[.625rem]",
              "bg-brand-dark/10",
              "backdrop-blur-[30px]",
              "border border-brand-light/5",
              "z-10",
              "w-[23.25rem]"
            )}
          >
            <ScrollAreaContainer
              className={classNames("max-h-64 pl-3 pr-4", "flex flex-col")}
              viewPortClassName="py-3 viewportBlock"
              scrollBarClassName="py-3"
            >
              <>
                {contacts.length > 0 && (
                  <DropdownHeader>Contacts</DropdownHeader>
                )}
                {contacts.map((item, index) => (
                  <ContactButton
                    key={item.address}
                    ref={
                      index ===
                      contacts.length -
                        LOAD_MORE_ON_CONTACTS_DROPDOWN_FROM_END -
                        1
                        ? loadMoreTriggerAssetRef
                        : null
                    }
                    contact={item}
                    onPointerDown={() => setValue(item.address)}
                    onMouseOver={() => {
                      setActiveSuggestion(index);
                      setIsAfterArrowClick(false);
                    }}
                    isActive={activeSuggestion === index}
                    isAfterArrowClick={isAfterArrowClick}
                  />
                ))}
                {filteredAccounts.length > 0 && (
                  <>
                    {contacts.length > 0 && (
                      <hr className="border-brand-main/[.07] my-3" />
                    )}
                    <DropdownHeader>Wallets</DropdownHeader>
                    {filteredAccounts.map((item, index) => (
                      <ContactButton
                        key={item.address}
                        contact={item}
                        onPointerDown={() => setValue(item.address)}
                        onMouseOver={() => {
                          setActiveSuggestion(contacts.length + index);
                          setIsAfterArrowClick(false);
                        }}
                        isActive={activeSuggestion === contacts.length + index}
                        isAfterArrowClick={isAfterArrowClick}
                      />
                    ))}
                  </>
                )}
              </>
            </ScrollAreaContainer>
          </Popover.Content>
        )}
    </Popover.Root>
  );
});

export default ContactAutocomplete;

type DropdownHeaderProps = {
  className?: string;
};

const DropdownHeader: FC<DropdownHeaderProps> = ({ className, children }) => (
  <span
    className={classNames("block", "text-sm font-bold", "mx-3 mb-2", className)}
  >
    {children}
  </span>
);

type ContactButtonProps = {
  contact: Contact | Account;
  isActive?: boolean;
  isAfterArrowClick?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const ContactButton = forwardRef<HTMLButtonElement, ContactButtonProps>(
  (
    {
      contact,
      isActive = false,
      isAfterArrowClick = false,
      className,
      ...rest
    },
    ref
  ) => {
    const elementRef = useRef<HTMLButtonElement>(null);
    const onScreen = useOnScreen(elementRef);

    useEffect(() => {
      if (isActive && isAfterArrowClick && !onScreen) {
        elementRef.current?.scrollIntoView();
      }
    }, [isActive, isAfterArrowClick, onScreen]);

    return (
      <button
        ref={mergeRefs([ref, elementRef])}
        type="button"
        className={classNames(
          "w-full mb-1 last:mb-0",
          "px-3 py-2",
          "rounded-[.625rem]",
          "cursor-pointer",
          "outline-none",
          "transition-colors",
          "flex items-center text-left w-full min-w-0",
          isActive && "bg-brand-main/20",
          className
        )}
        {...rest}
      >
        <AutoIcon
          seed={contact.address}
          source="dicebear"
          type="personas"
          className={classNames(
            "relative",
            "h-8 w-8 min-w-[2rem]",
            "mr-3",
            "bg-black/20",
            "rounded-[.625rem]"
          )}
        />
        <span className="flex flex-col min-w-0 flex flex-col">
          {"source" in contact ? (
            <WalletName theme="small" wallet={contact} className="mb-0.5" />
          ) : (
            <span className="truncate min-w-0 font-bold">
              <TReplace msg={contact.name} />
            </span>
          )}
          <HashPreview
            hash={contact.address}
            className={classNames(
              "text-xs text-brand-inactivedark font-normal",
              "mt-px",
              "transition-colors",
              isActive && "!text-brand-light"
            )}
            withTooltip={false}
          />
        </span>
      </button>
    );
  }
);