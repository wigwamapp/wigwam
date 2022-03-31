import { memo, useCallback, useState } from "react";
import classNames from "clsx";
import { Field, Form } from "react-final-form";

import { unlockWallet } from "core/client";

import NewButton from "app/components/elements/NewButton";

import { AttentionModal } from "../screens/Unlock";
import PasswordField from "../elements/PasswordField";

interface PasswordFormProps {
  theme?: "large" | "small";
  unlockCallback?: (password: string) => void;
  className?: string;
}

const PasswordForm = memo<PasswordFormProps>(
  ({ theme = "large", unlockCallback, className }) => {
    const [attention, setAttention] = useState(false);

    const handleSubmit = useCallback(
      async (values) => {
        const password = values.password;
        if (password) {
          try {
            if (unlockCallback) {
              unlockCallback(password);
            } else {
              await unlockWallet(password);
            }
          } catch (err: any) {
            alert(err?.message);
          }
        }
      },
      [unlockCallback]
    );

    return (
      <Form
        onSubmit={handleSubmit}
        render={({ handleSubmit, submitting }) => (
          <form
            className={classNames(
              "w-full flex flex-col items-center",
              className
            )}
            onSubmit={handleSubmit}
          >
            <div className="max-w-[19rem] w-full relative">
              <Field name="password">
                {({ input, meta }) => (
                  <PasswordField
                    {...input}
                    error={meta.touched && meta.error}
                    errorMessage={meta.error}
                  />
                )}
              </Field>
            </div>

            <div
              className={classNames(
                "max-w-[13.75rem] w-full center",
                theme === "large" && "mt-6",
                theme === "small" && "mt-4"
              )}
            >
              <NewButton type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Unlocking" : "Unlock"}
              </NewButton>
              <button
                className={classNames(
                  "w-full text-brand-inactivelight",
                  theme === "large" && "text-sm mt-4",
                  theme === "small" && "text-xs mt-3"
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
