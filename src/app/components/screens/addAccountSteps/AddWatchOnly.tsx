import { FC, useCallback } from "react";
import { Field, Form } from "react-final-form";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";

import { useDialog } from "app/hooks/dialog";
import {
  composeValidators,
  focusOnErrors,
  required,
  validateAddress,
  withHumanDelay,
} from "app/utils";
import { useSteps } from "app/hooks/steps";
import { AddAccountStep } from "app/nav";

import AddressField from "app/components/elements/AddressField";
import NewButton from "app/components/elements/NewButton";

type FormValues = { address: string };

const AddWatchOnly: FC = () => {
  const { alert } = useDialog();

  const { stateRef, navigateToStep } = useSteps();

  const handleSubmit = useCallback(
    async ({ address }) =>
      withHumanDelay(async () => {
        try {
          if (!address) {
            throw new Error("Not a valid address");
          }

          validateAddress(address);

          stateRef.current.address = address;

          navigateToStep(AddAccountStep.SetupPassword);
        } catch (err: any) {
          alert({ title: "Error!", content: err.message });
        }
      }),
    [alert, navigateToStep, stateRef]
  );
  return (
    <Form<FormValues>
      onSubmit={handleSubmit}
      decorators={[focusOnErrors]}
      render={({ form, handleSubmit, submitting }) => (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col min-w-[24rem] mx-auto"
        >
          <Field
            name="address"
            validate={composeValidators(required, validateAddress)}
          >
            {({ input, meta }) => (
              <AddressField
                setFromClipboard={(value) => form.change("address", value)}
                error={meta.error && meta.touched}
                errorMessage={meta.error}
                className="mt-5"
                {...input}
              />
            )}
          </Field>
          <NewButton
            type="submit"
            className="flex items-center min-w-[13.75rem] mt-8 mx-auto"
            loading={submitting}
          >
            <SendIcon className="mr-2" />
            Next
          </NewButton>
        </form>
      )}
    />
  );
};

export default AddWatchOnly;
