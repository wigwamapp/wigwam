import { memo, useCallback } from "react";
import { Field, Form } from "react-final-form";
import { ethers } from "ethers";

import { AccountSource } from "core/types";

import { AddAccountStep } from "app/nav";
import {
  required,
  withHumanDelay,
  focusOnErrors,
  composeValidators,
  validateAddress,
} from "app/utils";
import { useSteps } from "app/hooks/steps";
import { useNextAccountName } from "app/hooks";
import AddressField from "app/components/elements/AddressField";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import AddAccountContinueButton from "app/components/blocks/AddAccountContinueButton";

type FormValues = {
  address: string;
};

const AddWatchOnlyAccount = memo(() => {
  const { stateRef, navigateToStep } = useSteps();
  const { getNextAccountName } = useNextAccountName();

  const handleContinue = useCallback(
    async ({ address }: FormValues) =>
      withHumanDelay(async () => {
        try {
          stateRef.current.importAddresses = [
            {
              name: getNextAccountName(),
              source: AccountSource.Address,
              address: ethers.getAddress(address),
              isDisabled: true,
              isDefaultChecked: true,
            },
          ];

          navigateToStep(AddAccountStep.ConfirmAccounts);

          return;
        } catch (err: any) {
          return { address: err?.message };
        }
      }),
    [navigateToStep, stateRef, getNextAccountName],
  );

  return (
    <>
      <AddAccountHeader className="mb-8">
        Add watch-only account address
      </AddAccountHeader>
      <Form<FormValues>
        onSubmit={handleContinue}
        decorators={[focusOnErrors]}
        initialValues={{ address: "" }}
        render={({ form, handleSubmit, submitting }) => (
          <form onSubmit={handleSubmit} className="pt-8">
            <div className="flex flex-col max-w-[27.5rem] mx-auto">
              <Field
                name="address"
                validate={composeValidators(required, validateAddress)}
              >
                {({ input, meta }) => (
                  <AddressField
                    label="Watch-only address"
                    setFromClipboard={(value) => form.change("address", value)}
                    error={meta.error && meta.touched}
                    errorMessage={meta.error}
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

export default AddWatchOnlyAccount;
