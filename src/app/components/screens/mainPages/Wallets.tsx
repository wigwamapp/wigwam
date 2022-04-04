import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import classNames from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { waitForAll } from "jotai/utils";
import { Field, Form } from "react-final-form";
import { FORM_ERROR } from "final-form";

import { replaceT } from "lib/ext/i18n";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";
import { deleteAccounts, getSeedPhrase, updateAccountName } from "core/client";
import { composeValidators, maxLength, minLength, required } from "app/utils";

import {
  accountAddressAtom,
  allAccountsAtom,
  currentAccountAtom,
} from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import { ReactComponent as RevealIcon } from "app/icons/reveal.svg";
import SecondaryTabs from "app/components/blocks/SecondaryTabs";
import WalletCard from "app/components/elements/WalletCard";
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
import SettingsHeader from "app/components/elements/SettingsHeader";

const Wallets: FC = () => {
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [revealModalOpened, setRevealModalOpened] = useState(false);
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
          <WalletCard
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
        <AutoIcon
          seed={currentAccount.address}
          source="dicebear"
          type="personas"
          className={classNames(
            "h-14 w-14 min-w-[3.5rem]",
            "ml-3",
            "bg-black/20",
            "rounded-[.625rem]"
          )}
        />
        {/* // TODO: Address readonly */}
        <Form
          onSubmit={onNameUpdate}
          initialValues={{ name: replaceT(currentAccount.name) }}
          render={({ handleSubmit, submitting }) => (
            <form onSubmit={handleSubmit}>
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
                theme="secondary"
                className="mt-4 !py-2"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save"}
              </NewButton>
            </form>
          )}
        />
        <div className="mt-12">
          <SettingsHeader>Reveal Seed Phrase</SettingsHeader>
          <NewButton
            theme="secondary"
            className={classNames(
              "flex !justify-start items-center",
              "text-left",
              "!px-3 mr-auto"
            )}
            onClick={() => setRevealModalOpened(true)}
          >
            <RevealIcon className="w-[1.625rem] h-auto mr-3" />
            Reveal
          </NewButton>
        </div>
        <NewButton
          type="button"
          onClick={() => setDeleteModalOpened(true)}
          className="mt-12"
        >
          Delete account
        </NewButton>
        {(deleteModalOpened || revealModalOpened) && (
          <DeleteAccountModal
            open={true}
            cause={deleteModalOpened ? "delete" : "reveal"}
            onOpenChange={(value) => {
              setDeleteModalOpened(value);
              setRevealModalOpened(value);
            }}
          />
        )}
      </ScrollAreaContainer>
    </div>
  );
};

export default Wallets;

const DeleteAccountModal = memo<
  SecondaryModalProps & { cause: "delete" | "reveal" }
>(({ cause, open, onOpenChange }) => {
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
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
        const seed = await getSeedPhrase(password); // check is password correct
        if (cause === "reveal") {
          setSeedPhrase(seed.phrase);
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
      header="Reveal secret phrase"
      open={open}
      onOpenChange={onOpenChange}
      className="px-[5.25rem]"
    >
      {seedPhrase ? (
        <SeedPhraseField value={fromProtectedString(seedPhrase)} />
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
                {submitting ? "Loading" : "Reveal"}
              </NewButton>
            </form>
          )}
        />
      )}
    </SecondaryModal>
  );
});
