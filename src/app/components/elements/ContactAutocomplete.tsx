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
import { usePasteFromClipboard } from "lib/react-hooks/usePasteFromClipboard";

import { Account, Contact } from "core/types";

import {
  ACCOUNTS_SEARCH_OPTIONS,
  LOAD_MORE_ON_CONTACTS_DROPDOWN_FROM_END,
} from "app/defaults";
import { useContacts } from "app/hooks/contacts";
import { useAccounts, useEns } from "app/hooks";
import ScrollAreaContainer from "./ScrollAreaContainer";
import AddressField, { AddressFieldProps } from "./AddressField";
import WalletName from "./WalletName";
import HashPreview from "./HashPreview";
import SmallContactCard from "./SmallContactCard";
import WalletAvatar from "./WalletAvatar";

type ContactAutocompleteProps = {
  meta: FieldMetaState<any>;
  setValue: (address: string) => void;
  injected?: boolean;
} & AddressFieldProps;

const ContactAutocomplete = forwardRef<
  HTMLTextAreaElement,
  ContactAutocompleteProps
>(({ setValue, meta, value, injected = false, ...rest }, ref) => {
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

  const { paste } = usePasteFromClipboard(setValue);

  const { getAddressByEns, watchEns } = useEns();

  useEffect(() => {
    watchEns(value, setValue);
  }, [value, setValue, getAddressByEns, watchEns]);

  const pasteButton = useMemo(() => {
    return (
      <button
        className="items-center rounded-md p-[6px] cursor-pointer"
        style={{ background: "#2C3036", display: "flex" }}
        onClick={paste}
      >
        <div className="mr-[10px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="13"
            viewBox="0 0 12 13"
            fill="none"
          >
            <path
              d="M8.4 12.1602H1.2C0.537258 12.1602 0 11.6229 0 10.9602V3.76016H1.2V10.9602H8.4V12.1602ZM10.8 9.76016H3.6C2.93726 9.76016 2.4 9.2229 2.4 8.56016V1.36016C2.4 0.697414 2.93726 0.160156 3.6 0.160156H10.8C11.4627 0.160156 12 0.697414 12 1.36016V8.56016C12 9.2229 11.4627 9.76016 10.8 9.76016Z"
              fill="#F8F9FD"
            />
          </svg>
        </div>
        <span className="text-white">Paste</span>
      </button>
    );
  }, [paste]);

  return (
    <Popover.Root open={opened} modal={false} onOpenChange={() => undefined}>
      <Popover.Trigger className="w-full" asChild>
        {!injected ? (
          <AddressField
            ref={ref}
            value={value}
            {...rest}
            onKeyDown={handleKeyClick}
            setFromClipboard={setValue}
            error={opened ? undefined : rest.error}
            labelActions={!injected ? labelAction : pasteButton}
          />
        ) : value ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "10px",
                paddingTop: "3px",
              }}
            >
              <div style={{ color: "#8D9C9E" }}>Recipient</div>
              {pasteButton}
            </div>
            <div className="injectedSmallContactCardWrapper">
              <div className="injectedSmallContactCard">
                <SmallContactCard address={value as string} />
                <button className="cursor-pointer" onClick={() => setValue("")}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="19"
                    viewBox="0 0 18 19"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4.71967 5.37983C5.01256 5.08693 5.48744 5.08693 5.78033 5.37983L9 8.5995L12.2197 5.37983C12.5126 5.08693 12.9874 5.08693 13.2803 5.37983C13.5732 5.67272 13.5732 6.14759 13.2803 6.44049L10.0607 9.66016L13.2803 12.8798C13.5732 13.1727 13.5732 13.6476 13.2803 13.9405C12.9874 14.2334 12.5126 14.2334 12.2197 13.9405L9 10.7208L5.78033 13.9405C5.48744 14.2334 5.01256 14.2334 4.71967 13.9405C4.42678 13.6476 4.42678 13.1727 4.71967 12.8798L7.93934 9.66016L4.71967 6.44049C4.42678 6.14759 4.42678 5.67272 4.71967 5.37983Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <AddressField
            ref={ref}
            value={value}
            {...rest}
            onKeyDown={handleKeyClick}
            setFromClipboard={setValue}
            error={opened ? undefined : rest.error}
            labelActions={!injected ? labelAction : pasteButton}
          />
        )}
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
              "bg-brand-darkgray",
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
        <WalletAvatar
          seed={contact.address}
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
