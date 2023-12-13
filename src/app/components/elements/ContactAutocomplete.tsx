import {
  ButtonHTMLAttributes,
  FC,
  PropsWithChildren,
  KeyboardEventHandler,
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
import { mergeRefs } from "react-merge-refs";
import { TReplace } from "lib/ext/i18n/react";
import { useOnScreen } from "lib/react-hooks/useOnScreen";

import { Account, Contact } from "core/types";

import {
  ACCOUNTS_SEARCH_OPTIONS,
  IS_FIREFOX,
  LOAD_MORE_ON_CONTACTS_DROPDOWN_FROM_END,
} from "app/defaults";
import { useContacts } from "app/hooks/contacts";
import { useAccounts } from "app/hooks";
import ScrollAreaContainer from "./ScrollAreaContainer";
import AddressField, { AddressFieldProps } from "./AddressField";
import AutoIcon from "./AutoIcon";
import WalletName from "./WalletName";
import HashPreview from "./HashPreview";
import SmallContactCard from "./SmallContactCard";

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

  const { currentAccount, allAccounts } = useAccounts();

  const [opened, setOpened] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(0);
  const [isAfterArrowClick, setIsAfterArrowClick] = useState(false);

  const accounts = useMemo(
    () =>
      allAccounts.filter(({ address }) => address !== currentAccount.address),
    [allAccounts, currentAccount.address],
  );

  const fuse = useMemo(
    () => new Fuse(accounts, ACCOUNTS_SEARCH_OPTIONS),
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    if (value) {
      return fuse.search(value as string).map(({ item: account }) => account);
    }
    return accounts;
  }, [accounts, fuse, value]);

  const mergedAccounts = useMemo(
    () => [...contacts, ...filteredAccounts],
    [contacts, filteredAccounts],
  );

  useEffect(() => {
    if (meta.active) {
      setTimeout(() => {
        setOpened((prevState) => {
          if (!prevState) {
            setActiveSuggestion(0);
          }
          return true;
        });
      }, 50);
    } else {
      setOpened(false);
    }
  }, [contacts, meta.active]);

  const handleKeyClick = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
    (e) => {
      if (mergedAccounts) {
        if (e.keyCode === 40) {
          setActiveSuggestion((prevState) =>
            prevState + 1 > mergedAccounts.length - 1 ? 0 : prevState + 1,
          );
          setIsAfterArrowClick(true);
          e.preventDefault();
        }
        if (e.keyCode === 38) {
          setActiveSuggestion((prevState) =>
            prevState - 1 < 0 ? mergedAccounts.length - 1 : prevState - 1,
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
    [mergedAccounts, rest, activeSuggestion, setValue],
  );

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerRef = useCallback(
    (node: HTMLButtonElement) => {
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
    [hasMore, loadMore, contacts],
  );

  const labelAction = useMemo(() => {
    if (
      !meta.error &&
      mergedAccounts.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.address === value.address),
      ).length <= 1
    ) {
      return <SmallContactCard address={value as string} />;
    }
    return undefined;
  }, [mergedAccounts, meta.error, value]);

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
        !(
          mergedAccounts.filter(
            (value, index, self) =>
              index === self.findIndex((t) => t.address === value.address),
          ).length === 1 && !meta.error
        ) && (
          <Popover.Content
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            side="bottom"
            align="start"
            avoidCollisions={false}
            style={{
              width: "var(--radix-popover-trigger-width)",
            }}
            className={classNames(
              "shadow-xs",
              "focus-visible:outline-none",
              "mt-2",
              "w-full min-w-[17.75rem]",
              "rounded-[.625rem]",
              "bg-brand-dark/10",
              "backdrop-blur-[30px]",
              IS_FIREFOX && "!bg-[#0E1314]",
              "border border-brand-light/5",
              "z-10",
              "w-[23.25rem]",
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
                        ? loadMoreTriggerRef
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

type DropdownHeaderProps = PropsWithChildren<{
  className?: string;
}>;

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
    ref,
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
          "w-full",
          "px-3 py-2",
          "rounded-[.625rem]",
          "cursor-pointer",
          "outline-none",
          "transition-colors",
          "flex items-center text-left w-full min-w-0",
          isActive && "bg-brand-main/20",
          className,
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
            "rounded-[.625rem]",
          )}
        />
        <span className="flex flex-col min-w-0">
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
              isActive && "!text-brand-light",
            )}
            withTooltip={false}
          />
        </span>
      </button>
    );
  },
);
