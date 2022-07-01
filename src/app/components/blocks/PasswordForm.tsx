import { memo, useCallback, useEffect, useRef, useState } from "react";
import classNames from "clsx";
import { Field, Form } from "react-final-form";

import { unlockWallet } from "core/client";

import { required, withHumanDelay, focusOnErrors } from "app/utils";
import AttentionModal from "app/components/blocks/AttentionModal";
import Button from "app/components/elements/Button";
import PasswordField from "app/components/elements/PasswordField";

type FormValues = {
  password: string;
};
type PasswordFormProps = {
  theme?: "large" | "small";
  unlockCallback?: (password: string) => void;
  className?: string;
  autoFocus?: boolean;
  attentionModal?: boolean;
};

const PasswordForm = memo<PasswordFormProps>(
  ({
    theme = "large",
    unlockCallback,
    className,
    autoFocus,
    attentionModal = true,
  }) => {
    const [attention, setAttention] = useState(false);

    const handleSubmit = useCallback(
      ({ password }) =>
        withHumanDelay(async () => {
          try {
            if (unlockCallback) {
              unlockCallback(password);
            } else {
              await unlockWallet(password);
            }

            return;
          } catch (err: any) {
            return { password: err?.message };
          }
        }),
      [unlockCallback]
    );

    const passwordFieldRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (autoFocus) {
        setTimeout(() => passwordFieldRef.current?.focus?.(), 20);
      }
    }, [autoFocus]);

    return (
      <Form<FormValues>
        onSubmit={handleSubmit}
        decorators={[focusOnErrors]}
        render={({ handleSubmit, submitting, modifiedSinceLastSubmit }) => (
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
                  ref={passwordFieldRef}
                  className="max-w-[19rem] w-full relative min-h-[6.125rem]"
                  placeholder={"*".repeat(8)}
                  label="Password"
                  error={
                    (!modifiedSinceLastSubmit && meta.submitError) ||
                    (meta.submitFailed &&
                      !meta.modifiedSinceLastSubmit &&
                      meta.error)
                  }
                  errorMessage={
                    meta.error || (!modifiedSinceLastSubmit && meta.submitError)
                  }
                  {...input}
                />
              )}
            </Field>

            <div
              className={classNames(
                "max-w-[14rem] w-full center",
                theme === "large" && "mt-2",
                theme === "small" && "mt-1.5"
              )}
            >
              <Button type="submit" className="w-full" loading={submitting}>
                Unlock
              </Button>

              {attentionModal && (
                <button
                  type="button"
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
                  Want to <u>sign in to another profile?</u>
                </button>
              )}
            </div>

            {attentionModal && (
              <AttentionModal
                key={String(attention)}
                open={attention}
                onOpenChange={() => setAttention(false)}
              />
            )}
          </form>
        )}
      />
    );
  }
);

export default PasswordForm;
