import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { waitForAll } from "jotai/utils";
import { Field, Form } from "react-final-form";
import { FORM_ERROR } from "final-form";
import { TReplace } from "lib/ext/i18n/react";

import { replaceT } from "lib/ext/i18n";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";
import {
  deleteAccounts,
  getPrivateKey,
  getSeedPhrase,
  updateAccountName,
} from "core/client";
import { Account, AccountSource } from "core/types";
import { composeValidators, maxLength, minLength, required } from "app/utils";

import {
  accountAddressAtom,
  allAccountsAtom,
  currentAccountAtom,
} from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import { ReactComponent as KeyIcon } from "app/icons/lock-key.svg";
import { ReactComponent as NoteIcon } from "app/icons/note.svg";
import { ReactComponent as RevealIcon } from "app/icons/reveal.svg";
import { ReactComponent as ChevronRightIcon } from "app/icons/chevron-right.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as DeleteIcon } from "app/icons/Delete.svg";
import SecondaryTabs from "app/components/blocks/SecondaryTabs";
import HashPreview from "app/components/elements/HashPreview";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import AutoIcon from "app/components/elements/AutoIcon";
import NewButton from "app/components/elements/NewButton";
import Input from "app/components/elements/Input";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import PasswordField from "app/components/elements/PasswordField";
import SeedPhraseField from "app/components/blocks/SeedPhraseField";
import { fromProtectedString } from "lib/crypto-utils";
import Balance from "app/components/elements/Balance";

const Wallets: FC = () => {
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [revealPrivateOpened, setRevealPrivateOpened] = useState(false);
  const [revealPharseOpened, setRevealPhraseOpened] = useState(false);
  const setAccountAddress = useSetAtom(accountAddressAtom);
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

  const onNameUpdate = useCallback(
    (values) => {
      updateAccountName(currentAccount.uuid, values.name);
    },
    [currentAccount.uuid]
  );

  return (
    <div className="flex min-h-0 grow">
      <SecondaryTabs
        items={allAccounts.map((acc) => (
          <WalletTab
            key={acc.address}
            active={acc.address === currentAccount.address}
            className="mt-5"
            account={acc}
            onClick={() => setAccountAddress(acc.address)}
          />
        ))}
        activeRoute={currentAccount}
      />
      <ScrollAreaContainer
        className="flex flex-col items-start ml-6 w-full min-w-[17.75rem]"
        viewPortClassName="pb-20 pt-5"
        scrollBarClassName="py-0 pt-5 pb-20"
      >
        <div className="border-b border-brand-main/[.07]">
          <h2 className="text-2xl text-brand-light font-bold">
            {replaceT(currentAccount.name)}
          </h2>
          <AddressField
            address={currentAccount.address}
            className="mt-[1.625rem]"
          />
          <Form
            onSubmit={onNameUpdate}
            initialValues={{ name: replaceT(currentAccount.name) }}
            render={({ handleSubmit, submitting }) => (
              <form onSubmit={handleSubmit} className="mt-[1.625rem]">
                <Field
                  name="name"
                  validate={composeValidators(
                    required,
                    minLength(6),
                    maxLength(16)
                  )}
                >
                  {({ input, meta }) => (
                    <Input
                      label="Wallet Name"
                      placeholder="Type network name"
                      error={meta.error && meta.touched}
                      errorMessage={meta.error}
                      inputClassName="h-11"
                      className="max-w-sm mt-4"
                      {...input}
                    />
                  )}
                </Field>
                <NewButton
                  type="submit"
                  theme="primary"
                  className="my-6 !py-2"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save"}
                </NewButton>
              </form>
            )}
          />
        </div>
        <div
          className={classNames(
            "mt-6 pb-6",
            "border-b border-brand-main/[.07]"
          )}
        >
          <div className="flex text-lg font-bold text-brand-light items-center">
            <KeyIcon className="mr-3" />
            Private Key
          </div>
          <p className="py-2 text-sm text-brand-font max-w-[18.75rem]">
            Vigvam lets you to explore DeFi and NFTs in safer, faster and modern
            way.
          </p>
          <NewButton
            theme="secondary"
            className={classNames(
              "max-h-[2.625rem]",
              "flex !justify-start items-center",
              "text-left",
              "mt-2 !px-3 mr-auto"
            )}
            onClick={() => setRevealPrivateOpened(true)}
          >
            <RevealIcon className="w-[1.625rem] h-auto mr-3" />
            Reveal
          </NewButton>
        </div>
        {currentAccount.source === AccountSource.SeedPhrase && (
          <div
            className={classNames(
              "mt-6 pb-6",
              "border-b border-brand-main/[.07]"
            )}
          >
            <div className="flex text-lg font-bold text-brand-light items-center">
              <NoteIcon className="mr-3" />
              Secret phrase
            </div>
            <p className="py-2 text-sm text-brand-font max-w-[18.75rem]">
              Vigvam lets you to explore DeFi and NFTs in safer, faster and
              modern way.
            </p>
            <NewButton
              theme="secondary"
              className={classNames(
                "max-h-[2.625rem]",
                "flex !justify-start items-center",
                "text-left",
                "mt-2 !px-3 mr-auto"
              )}
              onClick={() => setRevealPhraseOpened(true)}
            >
              <RevealIcon className="w-[1.625rem] h-auto mr-3" />
              Reveal
            </NewButton>
            <Input
              defaultValue={currentAccount.derivationPath}
              label="Derivation path"
              inputClassName="h-11"
              className="max-w-sm mt-4"
              readOnly
            />
          </div>
        )}
        <NewButton
          type="button"
          theme="secondary"
          onClick={() => setDeleteModalOpened(true)}
          className={classNames(
            "mt-6 w-48",
            "flex items-center justify-between",
            "text-brand-light"
          )}
        >
          <DeleteIcon width={16} height={16} className="ml-2" />
          Delete account
        </NewButton>
        {(deleteModalOpened || revealPrivateOpened || revealPharseOpened) && (
          <DeleteAccountModal
            open={true}
            cause={
              deleteModalOpened
                ? "delete"
                : revealPharseOpened
                ? "phrase"
                : "private-key"
            }
            onOpenChange={(value) => {
              setDeleteModalOpened(value);
              setRevealPrivateOpened(value);
              setRevealPhraseOpened(value);
            }}
          />
        )}
      </ScrollAreaContainer>
    </div>
  );
};

export default Wallets;

const DeleteAccountModal = memo<
  SecondaryModalProps & { cause: "delete" | "phrase" | "private-key" }
>(({ cause, open, onOpenChange }) => {
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const currentAccount = useAtomValue(currentAccountAtom);
  const windowFocused = useWindowFocus();
  const { confirm } = useDialog();

  useEffect(() => {
    if (!windowFocused) {
      onOpenChange?.(false);
    }
  }, [onOpenChange, windowFocused]);

  const handleConfirmPassword = useCallback(
    async ({ password }) => {
      try {
        if (cause !== "delete") {
          if (cause === "phrase") {
            const seed = await getSeedPhrase(password); // check is password correct
            setSeedPhrase(seed.phrase);
          } else {
            const key = await getPrivateKey(password, currentAccount.uuid);
            setPrivateKey(key);
          }
        } else {
          confirm({
            title: "Delete wallet account",
            content: `Are you sure you want to delete the ${currentAccount.name} account?`,
          }).then((answer) => {
            if (answer) {
              deleteAccounts(password, [currentAccount.uuid]);
            }
            onOpenChange?.(false);
          });
        }
      } catch (err: any) {
        return { [FORM_ERROR]: err?.message };
      }
      return;
    },
    [cause, currentAccount, onOpenChange, confirm]
  );

  return (
    <SecondaryModal
      header="Type password"
      open={open}
      onOpenChange={onOpenChange}
      className="px-[5.25rem]"
    >
      {seedPhrase || privateKey ? (
        <SeedPhraseField
          label={seedPhrase ? "Secret phrase" : "Private key"}
          value={fromProtectedString(seedPhrase ?? privateKey ?? "")}
        />
      ) : (
        <Form
          initialValues={{ terms: "false" }}
          onSubmit={handleConfirmPassword}
          render={({
            handleSubmit,
            submitting,
            modifiedSinceLastSubmit,
            submitError,
          }) => (
            <form
              className="flex flex-col items-center"
              onSubmit={handleSubmit}
            >
              <div className="w-[20rem] relative mb-3">
                <Field name="password" validate={required}>
                  {({ input, meta }) => (
                    <PasswordField
                      className="w-full"
                      placeholder="Type password"
                      label="Confirm your password"
                      error={
                        (meta.touched && meta.error) ||
                        (!modifiedSinceLastSubmit && submitError)
                      }
                      errorMessage={
                        meta.error || (!modifiedSinceLastSubmit && submitError)
                      }
                      {...input}
                    />
                  )}
                </Field>
              </div>
              <NewButton
                type="submit"
                className="mt-6 !min-w-[14rem]"
                disabled={submitting}
              >
                {submitting
                  ? "Loading"
                  : cause === "delete"
                  ? "Confirm"
                  : "Reveal"}
              </NewButton>
            </form>
          )}
        />
      )}
    </SecondaryModal>
  );
});

type WalletTabProps = {
  account: Account;
  active?: boolean;
  className?: string;
  onClick: () => void;
};

const WalletTab: FC<WalletTabProps> = ({
  active,
  account: { name, address },
  className,
  onClick,
}) => {
  const classNamesList = classNames(
    "relative group",
    "p-3",
    "w-[17.8rem] min-w-[16.5rem]",
    active && "bg-brand-main/10",
    "hover:bg-brand-main/5",
    "rounded-[.625rem]",
    "flex items-stretch",
    "text-left"
  );

  return (
    <button className={classNames(classNamesList, className)} onClick={onClick}>
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
          "text-base font-bold text-brand-light leading-none",
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
    </button>
  );
};

type AddressFieldProps = {
  address: string;
  className?: string;
};

const AddressField: FC<AddressFieldProps> = ({ address, className }) => {
  const fieldRef = useRef<HTMLSpanElement>(null);
  const { copy, copied } = useCopyToClipboard(fieldRef);

  return (
    <div
      className={classNames(
        "flex",
        "bg-brand-main/[.05]",
        "max-w-[23.188rem] min-h-[6.25rem]",
        className
      )}
    >
      <AutoIcon
        seed={address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-24 w-24",
          "m-[0.125rem]",
          "bg-black/20",
          "rounded-[.625rem]"
        )}
      />
      <div
        className={classNames(
          "flex relative",
          "max-w-[16.875rem]",
          "text-ellipsis",
          "text-brand-light text-sm"
        )}
      >
        <span ref={fieldRef} className="w-full p-4 break-words">
          {address}
        </span>
        <NewButton
          type="button"
          theme="tertiary"
          onClick={copy}
          className={classNames(
            "absolute bottom-[1.125rem] right-3",
            "text-sm text-brand-light",
            "!p-0 !pr-1 !min-w-0",
            "!font-normal",
            "cursor-copy",
            "items-center"
          )}
        >
          {copied ? (
            <>
              <SuccessIcon className="mr-1" />
              Copied
            </>
          ) : (
            <>
              <CopyIcon className="mr-1" />
              Copy
            </>
          )}
        </NewButton>
      </div>
    </div>
  );
};
