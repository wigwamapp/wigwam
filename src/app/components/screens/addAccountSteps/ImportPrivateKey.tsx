import { memo, useCallback } from "react";
import { toProtectedString } from "lib/crypto-utils";
import { Field, Form } from "react-final-form";
import { ethers } from "ethers";

import { AccountSource } from "core/types";
import { validatePrivateKey } from "core/common";

import { AddAccountStep } from "app/nav";
import {
  composeValidators,
  required,
  withHumanDelay,
  focusOnErrors,
} from "app/utils";
import { useSteps } from "app/hooks/steps";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import SecretField from "app/components/blocks/SecretField";

type FormValues = {
  privateKey: string;
};

const ImportPrivateKey = memo(() => {
  const { stateRef, navigateToStep } = useSteps();

  const handleContinue = useCallback(
    async ({ privateKey }: FormValues) =>
      withHumanDelay(async () => {
        try {
          validatePrivateKey(privateKey);

          const generatedWallet = new ethers.Wallet(privateKey);
          stateRef.current.importAddresses = [
            {
              source: AccountSource.PrivateKey,
              address: generatedWallet.address,
              isDisabled: true,
              isDefaultChecked: true,
              privateKey: toProtectedString(`0x${privateKey}`),
            },
          ];

          navigateToStep(AddAccountStep.VerifyToAdd);

          return;
        } catch (err: any) {
          return { privateKey: err?.message };
        }
      }),
    [navigateToStep, stateRef]
  );

  return (
    <>
      <AddAccountHeader className="mb-8">
        Import existing Private Key
      </AddAccountHeader>
      <Form<FormValues>
        onSubmit={handleContinue}
        decorators={[focusOnErrors]}
        initialValues={{ privateKey: "" }}
        render={({ form, handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit} className="pt-8">
            <div className="flex flex-col max-w-[27.5rem] mx-auto">
              <Field
                name="privateKey"
                validate={composeValidators(required)}
                format={(value) =>
                  value ? value.replace(/\n/g, " ").trim() : ""
                }
                formatOnBlur
              >
                {({ input, meta }) => (
                  <SecretField
                    placeholder="Paste there your private key"
                    setFromClipboard={(value) =>
                      form.change("privateKey", value)
                    }
                    error={meta.touched && meta.error}
                    errorMessage={meta.error}
                    label="Private key"
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
});

export default ImportPrivateKey;
