import { memo, useCallback } from "react";
import { toProtectedString } from "lib/crypto-utils";
import { Field, Form } from "react-final-form";
import { ethers } from "ethers";

import { AccountSource } from "core/types";
import { validatePrivateKey, add0x } from "core/common";

import { AddAccountStep } from "app/nav";
import { useNextAccountName } from "app/hooks";
import { required, withHumanDelay, focusOnErrors } from "app/utils";
import { formatPrivateKey } from "app/utils/format";
import { useSteps } from "app/hooks/steps";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";
import SecretField from "app/components/blocks/SecretField";

type FormValues = {
  privateKey: string;
};

const ImportPrivateKey = memo(() => {
  const { stateRef, navigateToStep } = useSteps();
  const { getNextAccountName } = useNextAccountName();

  const handleContinue = useCallback(
    async ({ privateKey }: FormValues) =>
      withHumanDelay(async () => {
        try {
          validatePrivateKey(privateKey);

          const address = ethers.computeAddress(add0x(privateKey));
          stateRef.current.importAddresses = [
            {
              name: getNextAccountName(),
              source: AccountSource.PrivateKey,
              address,
              isDisabled: true,
              isDefaultChecked: true,
              privateKey: toProtectedString(add0x(privateKey)),
            },
          ];

          navigateToStep(AddAccountStep.ConfirmAccounts);

          return;
        } catch (err: any) {
          return { privateKey: err?.message };
        }
      }),
    [navigateToStep, stateRef, getNextAccountName],
  );

  return (
    <>
      <AddAccountHeader className="mb-8">Import Private Key</AddAccountHeader>
      <Form<FormValues>
        onSubmit={handleContinue}
        decorators={[focusOnErrors]}
        initialValues={{ privateKey: "" }}
        render={({ form, handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit} className="pt-8">
            <div className="flex flex-col max-w-[27.5rem] mx-auto">
              <Field
                name="privateKey"
                validate={required}
                format={formatPrivateKey}
                formatOnBlur
              >
                {({ input, meta }) => (
                  <SecretField
                    placeholder="Paste your private key here"
                    setFromClipboard={(value) =>
                      form.change("privateKey", value)
                    }
                    error={(meta.touched && meta.error) || meta.submitError}
                    errorMessage={meta.error || meta.submitError}
                    label="Private key"
                    {...input}
                  />
                )}
              </Field>
            </div>

            <AddAccountContinueButton loading={submitting}>
              Import key
            </AddAccountContinueButton>
          </form>
        )}
      />
    </>
  );
});

export default ImportPrivateKey;
