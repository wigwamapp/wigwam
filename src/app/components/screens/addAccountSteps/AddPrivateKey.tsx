import { FC, useCallback } from "react";
import { useAtomValue } from "jotai";
import { toProtectedString } from "lib/crypto-utils";
import { Field, Form } from "react-final-form";

import { WalletStatus } from "core/types";

import { AddAccountStep } from "app/nav";
import {
  composeValidators,
  required,
  withHumanDelay,
  focusOnErrors,
} from "app/utils";
import { walletStatusAtom } from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import { useSteps } from "app/hooks/steps";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import SeedPhraseField from "app/components/blocks/SeedPhraseField";

type FormValues = {
  seed: string;
};

const AddPrivateKey: FC = () => {
  const walletStatus = useAtomValue(walletStatusAtom);
  const { alert } = useDialog();

  const { stateRef, navigateToStep } = useSteps();

  const initialSetup = walletStatus === WalletStatus.Welcome;

  const handleContinue = useCallback(
    async (values) =>
      withHumanDelay(async () => {
        try {
          const privateKey = toProtectedString(values.seed);

          if (initialSetup) {
            stateRef.current.privateKey = privateKey;
          } else {
            // await addPrivateKey(privateKey);
          }

          navigateToStep(AddAccountStep.SelectAccountsToAddMethod);
        } catch (err: any) {
          alert(err?.message);
        }
      }),
    [initialSetup, navigateToStep, stateRef, alert]
  );

  return (
    <>
      <AddAccountHeader className="mb-8">Import Private Key</AddAccountHeader>
      <Form<FormValues>
        onSubmit={handleContinue}
        decorators={[focusOnErrors]}
        initialValues={{ seed: "" }}
        render={({ form, handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col max-w-[27.5rem] mx-auto">
              <Field
                name="seed"
                validate={composeValidators(required)}
                format={(value) =>
                  value ? value.replace(/\n/g, " ").trim() : ""
                }
                formatOnBlur
              >
                {({ input, meta }) => (
                  <SeedPhraseField
                    placeholder="Paste there your secret phrase"
                    setFromClipboard={(value) => form.change("seed", value)}
                    error={meta.touched && meta.error}
                    errorMessage={meta.error}
                    className="mt-8"
                    {...input}
                  />
                )}
              </Field>
            </div>
            <AddAccountContinueButton loading={submitting} />
          </form>
        )}
      />
    </>
  );
};

export default AddPrivateKey;
