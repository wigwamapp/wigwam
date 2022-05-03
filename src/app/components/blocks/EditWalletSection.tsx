import { FC, memo, useCallback, useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { replaceT } from "lib/ext/i18n";
import { fromProtectedString } from "lib/crypto-utils";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { Account, AccountSource, SocialProvider } from "core/types";
import {
  deleteAccounts,
  getPrivateKey,
  getSeedPhrase,
  updateAccountName,
} from "core/client";

import {
  composeValidators,
  focusOnErrors,
  maxLength,
  minLength,
  required,
  withHumanDelay,
} from "app/utils";
import { currentAccountAtom } from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import PasswordField from "app/components/elements/PasswordField";
import AutoIcon from "app/components/elements/AutoIcon";
import SecretField from "app/components/blocks/SecretField";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as KeyIcon } from "app/icons/lock-key.svg";
import { ReactComponent as RevealIcon } from "app/icons/reveal.svg";
import { ReactComponent as GoogleIcon } from "app/icons/google.svg";
import { ReactComponent as FacebookIcon } from "app/icons/facebook.svg";
import { ReactComponent as RedditIcon } from "app/icons/reddit.svg";
import { ReactComponent as TwitterIcon } from "app/icons/twitter.svg";
import { ReactComponent as NoteIcon } from "app/icons/note.svg";
import { ReactComponent as DeleteIcon } from "app/icons/Delete.svg";
import { ReactComponent as LedgerIcon } from "app/icons/ledger.svg";

type EditWalletSectionProps = {
  account: Account;
};

const EditWalletSection: FC<EditWalletSectionProps> = ({ account }) => {
  const { confirm } = useDialog();

  const [modalState, setModalState] = useState<
    null | "delete" | "phrase" | "private-key"
  >(null);

  const handleNameUpdate = useCallback(
    async ({ name }) =>
      withHumanDelay(async () => {
        try {
          await updateAccountName(account.uuid, name);
        } catch (err: any) {
          return { name: err?.message };
        }
        return;
      }),
    [account.uuid]
  );

  const handleDeleteAccount = useCallback(() => {
    confirm({
      title: "Delete wallet account",
      content: `Are you sure you want to delete the wallet "${account.name}"?`,
    }).then((answer) => {
      if (answer) {
        setModalState("delete");
      }
    });
  }, [account.name, confirm]);

  return (
    <ScrollAreaContainer
      className="w-full min-w-[17.75rem]"
      viewPortClassName="pb-20 pt-5 pr-5 pl-6"
      scrollBarClassName="py-0 pt-5 pb-20"
    >
      <h2 className="text-2xl text-brand-light font-bold mb-6">
        {replaceT(account.name)}
      </h2>
      <AddressField address={account.address} className="mb-6" />
      <Form
        onSubmit={handleNameUpdate}
        initialValues={{ name: replaceT(account.name) }}
        decorators={[focusOnErrors]}
        render={({ handleSubmit, submitting, modifiedSinceLastSubmit }) => (
          <form
            onSubmit={handleSubmit}
            className="pb-7 border-b border-brand-main/[.07]"
          >
            <Field
              name="name"
              validate={composeValidators(
                required,
                minLength(3),
                maxLength(32)
              )}
            >
              {({ input, meta }) => (
                <Input
                  label="Wallet Name"
                  placeholder="Type wallet name"
                  error={
                    (meta.error && meta.touched) ||
                    (meta.submitError && !modifiedSinceLastSubmit)
                  }
                  errorMessage={
                    meta.error || (!modifiedSinceLastSubmit && meta.submitError)
                  }
                  inputClassName="h-11"
                  className="max-w-[23.125rem] mt-4"
                  {...input}
                />
              )}
            </Field>
            <NewButton
              type="submit"
              theme="primary"
              className="mt-4 !py-2"
              loading={submitting}
            >
              Save
            </NewButton>
          </form>
        )}
      />
      {account.source !== AccountSource.Address && (
        <WalletBlock
          Icon={KeyIcon}
          title="Private key"
          description="Vigvam lets you to explore DeFi and NFTs in safer, faster and modern way."
          className="mt-6"
        >
          <NewButton
            theme="secondary"
            className={classNames(
              "max-h-[2.625rem]",
              "flex !justify-start items-center",
              "text-left",
              "mt-2 !px-3 mr-auto"
            )}
            onClick={() => setModalState("private-key")}
          >
            <RevealIcon className="w-[1.625rem] h-auto mr-3" />
            Reveal
          </NewButton>
        </WalletBlock>
      )}
      {account.source === AccountSource.OpenLogin && (
        <WalletBlock
          Icon={getSocialIcon(account.social)}
          title={capitalizeFirstLetter(account.social)}
          description="Vigvam lets you to explore DeFi and NFTs in safer, faster and modern way."
          className="mt-6"
        >
          {account.socialName && (
            <Input
              defaultValue={account.socialName}
              label="Name"
              inputClassName="h-11"
              className="max-w-sm mt-4"
              readOnly
            />
          )}
          {account.socialEmail && (
            <Input
              defaultValue={account.socialEmail}
              label="Email"
              inputClassName="h-11"
              className="max-w-sm mt-4"
              readOnly
            />
          )}
        </WalletBlock>
      )}
      {account.source === AccountSource.SeedPhrase && (
        <WalletBlock
          Icon={NoteIcon}
          title="Secret phrase"
          description="Vigvam lets you to explore DeFi and NFTs in safer, faster and modern way."
          className="mt-6"
        >
          <>
            <NewButton
              theme="secondary"
              className={classNames(
                "max-h-[2.625rem]",
                "flex !justify-start items-center",
                "text-left",
                "mt-2 !px-3 mr-auto"
              )}
              onClick={() => setModalState("phrase")}
            >
              <RevealIcon className="w-[1.625rem] h-auto mr-3" />
              Reveal
            </NewButton>
            <Input
              defaultValue={account.derivationPath}
              label="Derivation path"
              inputClassName="h-11"
              className="max-w-sm mt-4"
              readOnly
            />
          </>
        </WalletBlock>
      )}
      {account.source === AccountSource.Ledger && (
        <WalletBlock
          Icon={LedgerIcon}
          title="Ledger"
          description="Vigvam lets you to explore DeFi and NFTs in safer, faster and modern way."
          className="mt-6"
        >
          <Input
            defaultValue={account.derivationPath}
            label="Derivation path"
            inputClassName="h-11"
            className="max-w-sm mt-4"
            readOnly
          />
        </WalletBlock>
      )}
      <NewButton
        type="button"
        theme="secondary"
        onClick={handleDeleteAccount}
        className={classNames(
          "mt-6 w-48",
          "!py-2",
          "flex items-center",
          "text-brand-light"
        )}
      >
        <DeleteIcon className="w-4 h-4 ml-1 mr-3" />
        Remove wallet
      </NewButton>
      {modalState && (
        <DeleteAccountModal
          open={true}
          cause={modalState}
          onOpenChange={() => setModalState(null)}
        />
      )}
    </ScrollAreaContainer>
  );
};

export default EditWalletSection;

type WalletBlockProps = {
  Icon: FC<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
};

const WalletBlock: FC<WalletBlockProps> = ({
  Icon,
  title,
  description,
  children,
  className,
}) => (
  <div
    className={classNames(
      "pb-7",
      "border-b border-brand-main/[.07]",
      className
    )}
  >
    <h2 className="flex text-lg font-bold text-brand-light items-center">
      <Icon className="w-[1.125rem] h-auto mr-3" />
      {title}
    </h2>
    <p className="my-2 text-sm text-brand-font max-w-[18.75rem]">
      {description}
    </p>
    {children}
  </div>
);

const DeleteAccountModal = memo<
  SecondaryModalProps & { cause: "delete" | "phrase" | "private-key" }
>(({ cause, open, onOpenChange }) => {
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const currentAccount = useAtomValue(currentAccountAtom);
  const windowFocused = useWindowFocus();

  useEffect(() => {
    if (!windowFocused && cause !== "delete") {
      onOpenChange?.(false);
    }
  }, [cause, onOpenChange, windowFocused]);

  const handleConfirmPassword = useCallback(
    async ({ password }) =>
      withHumanDelay(async () => {
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
            try {
              await deleteAccounts(password, [currentAccount.uuid]);
              onOpenChange?.(false);
            } catch (err: any) {
              throw new Error(err?.message);
            }
          }
        } catch (err: any) {
          return { password: err?.message };
        }
        return;
      }),
    [cause, currentAccount, onOpenChange]
  );

  return (
    <SecondaryModal
      header={
        seedPhrase
          ? "Your secret phrase"
          : privateKey
          ? `Private key for wallet "${currentAccount.name}"`
          : "Type password"
      }
      open={open}
      onOpenChange={onOpenChange}
      className="px-[5.25rem]"
    >
      {seedPhrase || privateKey ? (
        <SecretField
          label={seedPhrase ? "Secret phrase" : "Private key"}
          isDownloadable={Boolean(seedPhrase)}
          value={fromProtectedString(seedPhrase ?? privateKey ?? "")}
        />
      ) : (
        <Form
          onSubmit={handleConfirmPassword}
          decorators={[focusOnErrors]}
          render={({ handleSubmit, submitting, modifiedSinceLastSubmit }) => (
            <form
              className="flex flex-col items-center"
              onSubmit={handleSubmit}
            >
              <div className="w-[20rem] relative mb-3">
                <Field name="password" validate={required}>
                  {({ input, meta }) => (
                    <PasswordField
                      className="w-full"
                      placeholder={"*".repeat(8)}
                      label="Confirm your password"
                      error={
                        (meta.touched && meta.error) ||
                        (!modifiedSinceLastSubmit && meta.submitError)
                      }
                      errorMessage={
                        meta.error ||
                        (!modifiedSinceLastSubmit && meta.submitError)
                      }
                      {...input}
                    />
                  )}
                </Field>
              </div>
              <NewButton
                type="submit"
                className="mt-6 !min-w-[14rem]"
                loading={submitting}
              >
                {cause === "delete" ? "Confirm" : "Reveal"}
              </NewButton>
            </form>
          )}
        />
      )}
    </SecondaryModal>
  );
});

type AddressFieldProps = {
  address: string;
  className?: string;
};

const AddressField: FC<AddressFieldProps> = ({ address, className }) => {
  const { copy, copied } = useCopyToClipboard(address);

  return (
    <div
      className={classNames(
        "flex",
        "bg-brand-main/[.05]",
        "max-w-[23.188rem]",
        "rounded-[0.625rem]",
        className
      )}
    >
      <AutoIcon
        seed={address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-24 w-24 min-w-[6rem] m-0.5",
          "bg-black/40",
          "rounded-l-[.5625rem]"
        )}
      />
      <div
        className={classNames(
          "flex relative",
          "text-brand-light text-sm",
          "min-w-0",
          "p-4"
        )}
      >
        <span className="w-full font-medium break-words">{address}</span>
        <NewButton
          type="button"
          theme="tertiary"
          onClick={copy}
          className={classNames(
            "absolute bottom-3 right-3",
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

const getSocialIcon = (social: SocialProvider) => {
  switch (social) {
    case "google":
      return GoogleIcon;
    case "facebook":
      return FacebookIcon;
    case "twitter":
      return TwitterIcon;
    case "reddit":
      return RedditIcon;
  }
};

const capitalizeFirstLetter = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
