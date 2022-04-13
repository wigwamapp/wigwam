import { memo, useCallback, useState } from "react";
import classNames from "clsx";
import { Field, Form } from "react-final-form";
import { FORM_ERROR } from "final-form";

import { unlockWallet } from "core/client";

import { required } from "app/utils";
import { AttentionModal } from "app/components/screens/Unlock";
import NewButton from "app/components/elements/NewButton";
import PasswordField from "app/components/elements/PasswordField";

type PasswordFormProps = {
  theme?: "large" | "small";
  unlockCallback?: (password: string) => void;
  className?: string;
};

const PasswordForm = memo<PasswordFormProps>(
  ({ theme = "large", unlockCallback, className }) => {
    const [attention, setAttention] = useState(false);

    const handleSubmit = useCallback(
      async ({ password }) => {
        try {
          if (unlockCallback) {
            unlockCallback(password);
          } else {
            await unlockWallet(password);
          }
        } catch (err: any) {
          return { [FORM_ERROR]: err?.message };
        }
        return;
      },
      [unlockCallback]
    );

    return (
      <Form
        onSubmit={handleSubmit}
        render={({
          handleSubmit,
          submitting,
          modifiedSinceLastSubmit,
          submitError,
        }) => (
          <form
            className={classNames(
              "w-full flex flex-col items-center",
              className
            )}
            onSubmit={handleSubmit}
          >
            <Field name="password" validate={required}>
              {({ input, meta }) => (
                <PasswordField
                  className="max-w-[19rem] w-full relative min-h-[6.125rem]"
                  placeholder="Type password"
                  label="Password"
                  error={
                    (!modifiedSinceLastSubmit && submitError) ||
                    (meta.touched && meta.error)
                  }
                  errorMessage={
                    meta.error || (!modifiedSinceLastSubmit && submitError)
                  }
                  {...input}
                />
              )}
            </Field>

            <div
              className={classNames(
                "max-w-[13.75rem] w-full center",
                theme === "large" && "mt-2",
                theme === "small" && "mt-1.5"
              )}
            >
              <NewButton type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Unlocking" : "Unlock"}
              </NewButton>
              <button
                className={classNames(
                  "w-full text-brand-inactivelight",
                  theme === "large" && "text-sm mt-6",
                  theme === "small" && "text-xs mt-4"
                )}
                onClick={() => {
                  setAttention(true);
                }}
              >
                <u>Forgot the password?</u>
                <br />
                Want to <u>sign into another profile?</u>
              </button>
            </div>
            <AttentionModal
              open={attention}
              onOpenChange={() => setAttention(false)}
            />
          </form>
        )}
      />
    );
  }
);

export default PasswordForm;
