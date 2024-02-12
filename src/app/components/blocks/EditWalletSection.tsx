import {
  FC,
  memo,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { FormApi } from "final-form";
import { Field, Form } from "react-final-form";
import classNames from "clsx";
import { replaceT } from "lib/ext/i18n";
import { fromProtectedString } from "lib/crypto-utils";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { TReplace } from "lib/ext/i18n/react";

import { Account, AccountSource, SeedPharse, SocialProvider } from "core/types";
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
  resetFormPassword,
  withHumanDelay,
} from "app/utils";
import { useDialog } from "app/hooks/dialog";
import { ToastOverflowProvider, useToast } from "app/hooks/toast";
import Input from "app/components/elements/Input";
import Button from "app/components/elements/Button";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import PasswordField from "app/components/elements/PasswordField";
import SecretField from "app/components/blocks/SecretField";
import SeedPhraseWords from "app/components/blocks/SeedPhraseWords";
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
import WalletAvatar from "../elements/WalletAvatar";

type EditWalletSectionProps = {
  account: Account;
};

const EditWalletSection: FC<EditWalletSectionProps> = ({ account }) => {
  const { confirm } = useDialog();
  const { updateToast } = useToast();

  const [modalState, setModalState] = useState<
    null | "delete" | "phrase" | "private-key"
  >(null);

  const handleNameUpdate = useCallback(
    async ({ name }: { name: string }) =>
      withHumanDelay(async () => {
        try {
          await updateAccountName(account.uuid, name);
          updateToast(
            <>
              Wallet {`"`}
              <TReplace msg={name} />
              {`"`} successfully updated!
            </>,
          );
        } catch (err: any) {
          return { name: err?.message };
        }
        return;
      }),
    [account.uuid, updateToast],
  );

  const handleDeleteAccount = useCallback(() => {
    confirm({
      title: "Delete wallet",
      content: `Are you sure you want to delete "${replaceT(account.name)}"?`,
    }).then((answer) => {
      if (answer) {
        setModalState("delete");
      }
    });
  }, [account.name, confirm]);

  return (
    <ScrollAreaContainer
      className="w-full min-w-[17.75rem]"
      viewPortClassName="pb-5 pt-5 pr-5 pl-6"
      scrollBarClassName="py-0 pt-5 pb-5"
    >
      <ToastOverflowProvider>
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
                  maxLength(32),
                )}
              >
                {({ input, meta }) => (
                  <Input
                    label="Wallet name"
                    placeholder="Type wallet name"
                    error={
                      (meta.error && meta.touched) ||
                      (meta.submitError && !modifiedSinceLastSubmit)
                    }
                    errorMessage={
                      meta.error ||
                      (!modifiedSinceLastSubmit && meta.submitError)
                    }
                    inputClassName="h-11"
                    className="max-w-[23.125rem] mt-4"
                    {...input}
                  />
                )}
              </Field>
              <Button
                type="submit"
                theme="primary"
                className="mt-4 !py-2"
                loading={submitting}
              >
                Save
              </Button>
            </form>
          )}
        />
        {account.source !== AccountSource.Address &&
          account.source !== AccountSource.Ledger && (
            <WalletBlock
              Icon={KeyIcon}
              title="Private key"
              description="Export the private key of this wallet."
              className="mt-6"
            >
              <Button
                theme="secondary"
                className={classNames(
                  "max-h-[2.625rem]",
                  "flex !justify-start items-center",
                  "text-left",
                  "mt-2 !px-3 min-w-[12rem] mr-auto",
                )}
                onClick={() => setModalState("private-key")}
              >
                <RevealIcon className="w-[1.625rem] h-auto mr-3" />
                Reveal key
              </Button>
            </WalletBlock>
          )}
        {account.source === AccountSource.OpenLogin && (
          <WalletBlock
            Icon={getSocialIcon(account.social)}
            title={capitalizeFirstLetter(account.social)}
            description={
              <>
                This wallet is linked to a{" "}
                {capitalizeFirstLetter(account.social)} account. Powered by{" "}
                <a
                  href="https://openlogin.com/"
                  target="_blank"
                  rel="nofollow noreferrer"
                  className="underline"
                >
                  OpenLogin
                </a>
                .
              </>
            }
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
            description={
              <>
                This wallet is created with a Secret Phrase. It is the same for
                all wallets that were created with it in this profile. The only
                difference is the derivation path.
              </>
            }
            className="mt-6"
          >
            <>
              <Button
                theme="secondary"
                className={classNames(
                  "max-h-[2.625rem]",
                  "flex !justify-start items-center",
                  "text-left",
                  "mt-2 !px-3 min-w-[12rem] mr-auto",
                )}
                onClick={() => setModalState("phrase")}
              >
                <RevealIcon className="w-[1.625rem] h-auto mr-3" />
                Reveal phrase
              </Button>
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
            description="This wallet connected with an external Ledger hardware device."
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
        <Button
          theme="secondary"
          onClick={handleDeleteAccount}
          className={classNames(
            "mt-6 mb-8 w-48",
            "!py-2",
            "flex items-center",
            "text-brand-light",
          )}
        >
          <DeleteIcon className="w-4 h-4 ml-1 mr-3" />
          Remove wallet
        </Button>
        {modalState && (
          <SensetiveActionModal
            key={modalState}
            account={account}
            open={true}
            cause={modalState}
            onOpenChange={() => setModalState(null)}
          />
        )}
      </ToastOverflowProvider>
    </ScrollAreaContainer>
  );
};

export default EditWalletSection;

type WalletBlockProps = PropsWithChildren<{
  Icon: FC<{ className?: string }>;
  title: string;
  description: ReactNode;
  className?: string;
}>;

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
      className,
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

type FormValues = {
  password: string;
};

const SensetiveActionModal = memo<
  SecondaryModalProps & {
    account: Account;
    cause: "delete" | "phrase" | "private-key";
  }
>(({ account, cause, open, onOpenChange }) => {
  const [seedPhrase, setSeedPhrase] = useState<SeedPharse | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const windowFocused = useWindowFocus();
  const { updateToast } = useToast();

  useEffect(() => {
    if (!windowFocused && cause !== "delete") {
      onOpenChange?.(false);
    }
  }, [cause, onOpenChange, windowFocused]);

  const handleConfirmPassword = useCallback(
    async (
      { password }: FormValues,
      form: FormApi<FormValues, Partial<FormValues>>,
    ) =>
      withHumanDelay(async () => {
        try {
          if (cause !== "delete") {
            if (cause === "phrase") {
              const seedPhrase = await getSeedPhrase(password); // check is password correct
              await resetFormPassword(form);

              setSeedPhrase(seedPhrase);
            } else {
              const key = await getPrivateKey(password, account.uuid);
              await resetFormPassword(form);

              setPrivateKey(key);
            }
          } else {
            await deleteAccounts(password, [account.uuid]);
            await resetFormPassword(form);

            updateToast(
              <>
                Wallet {`"`}
                <TReplace msg={account.name} />
                {`"`} successfully deleted!
              </>,
            );
            onOpenChange?.(false);
          }

          return;
        } catch (err: any) {
          return { password: err?.message };
        }
      }),
    [cause, account.uuid, account.name, updateToast, onOpenChange],
  );

  return (
    <SecondaryModal
      header={
        seedPhrase ? (
          "Your Secret Phrase"
        ) : privateKey ? (
          <>
            Private key for &#34;
            <TReplace msg={account.name} />
            &#34;
          </>
        ) : (
          "Type password"
        )
      }
      open={open}
      onOpenChange={onOpenChange}
      className="px-[5.25rem]"
    >
      {seedPhrase || privateKey ? (
        <>
          {seedPhrase ? (
            <SeedPhraseWords seedPhrase={seedPhrase} />
          ) : (
            <SecretField
              label="Private key"
              value={fromProtectedString(privateKey!)}
            />
          )}

          <div
            className={classNames(
              "mt-4 w-full max-w-[27.5rem]",
              "flex items-center",
              "p-4",
              "bg-brand-redobject/[.05]",
              "border border-brand-redobject/[.8]",
              "rounded-[.625rem]",
              "text-sm",
            )}
          >
            <span>
              <strong>DO NOT share</strong> this set of{" "}
              {seedPhrase ? "words" : "chars"} with anyone! It can be used to
              steal{" "}
              {seedPhrase
                ? "all wallets belonging to this phrase"
                : "this wallet"}
              .
            </span>
          </div>
        </>
      ) : (
        <Form
          onSubmit={handleConfirmPassword}
          decorators={[focusOnErrors]}
          destroyOnUnregister
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
                      autoFocus
                      {...input}
                    />
                  )}
                </Field>
              </div>
              <Button
                type="submit"
                className="mt-6 !min-w-[14rem]"
                loading={submitting}
              >
                {cause === "delete"
                  ? "Confirm"
                  : `Reveal ${cause === "phrase" ? "phrase" : "key"}`}
              </Button>
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
        className,
      )}
    >
      <WalletAvatar
        seed={address}
        className={classNames(
          "h-24 w-24 min-w-[6rem] m-0.5",
          "bg-black/40",
          "rounded-l-[.5625rem]",
        )}
      />
      <div
        className={classNames(
          "flex relative",
          "text-brand-light text-sm",
          "min-w-0",
          "p-4",
        )}
      >
        <span className="w-full font-medium break-words">{address}</span>
        <Button
          theme="tertiary"
          onClick={() => copy()}
          className={classNames(
            "absolute bottom-3 right-3",
            "text-sm text-brand-light",
            "!p-0 !pr-1 !min-w-0",
            "!font-normal",
            "items-center",
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
        </Button>
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
    default:
      throw new Error("Unhandled social icon type");
  }
};

const capitalizeFirstLetter = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
