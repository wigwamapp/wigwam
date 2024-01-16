import { memo, useCallback, useEffect, useMemo, useState } from "react";
import classNames from "clsx";
import { FormApi } from "final-form";
import { Field, Form } from "react-final-form";
import useForceUpdate from "use-force-update";
import { intervalToDuration } from "date-fns";
import { T } from "lib/ext/react";
import { useLazyAtomValue } from "lib/atom-utils";
import { storage } from "lib/ext/storage";

import { unlockWallet } from "core/client";
import { Setting } from "core/common";

import {
  required,
  withHumanDelay,
  focusOnErrors,
  resetFormPassword,
} from "app/utils";
import { profileBlockedUntilAtom } from "app/atoms";
import AttentionModal from "app/components/blocks/AttentionModal";
import Button from "app/components/elements/Button";
import PasswordField from "app/components/elements/PasswordField";

type PasswordFormProps = {
  theme?: "large" | "small";
  className?: string;
  autoFocus?: boolean;
  attentionModal?: boolean;
};

type FormValues = {
  password: string;
};

const PasswordForm = memo<PasswordFormProps>(
  ({ theme = "large", className, autoFocus, attentionModal = true }) => {
    const profileBlockedUntil = useLazyAtomValue(profileBlockedUntilAtom);

    const [attention, setAttention] = useState(false);

    const profileBlockedErrMsg = useMemo(
      () =>
        profileBlockedUntil && profileBlockedUntil > Date.now() ? (
          <ProfileBlockedMessage until={profileBlockedUntil} />
        ) : null,
      [profileBlockedUntil],
    );
    const profileBlocked = Boolean(profileBlockedErrMsg);

    const handleSubmit = useCallback(
      (
        { password }: FormValues,
        form: FormApi<FormValues, Partial<FormValues>>,
      ) => {
        if (profileBlocked) return;

        return withHumanDelay(async () => {
          try {
            await unlockWallet(password);
            await resetFormPassword(form);

            return;
          } catch (err: any) {
            return { password: err?.message };
          }
        });
      },
      [profileBlocked],
    );

    return (
      <Form<FormValues>
        onSubmit={handleSubmit}
        decorators={[focusOnErrors]}
        destroyOnUnregister
        render={({
          handleSubmit,
          submitting,
          modifiedSinceLastSubmit,
          form,
        }) => (
          <form
            className={classNames(
              "w-full flex flex-col items-center",
              className,
            )}
            onSubmit={handleSubmit}
          >
            <ResetWhenBlocked blocked={profileBlocked} onReset={form.reset} />

            <Field name="password" validate={required}>
              {({ input, meta }) => (
                <PasswordField
                  className="max-w-[19rem] w-full relative min-h-[6.125rem]"
                  placeholder={"*".repeat(8)}
                  label="Password"
                  error={
                    profileBlocked ||
                    (!modifiedSinceLastSubmit && meta.submitError) ||
                    (meta.submitFailed &&
                      !meta.modifiedSinceLastSubmit &&
                      meta.error)
                  }
                  disabled={profileBlocked}
                  errorMessage={
                    profileBlockedErrMsg ||
                    meta.error ||
                    (!modifiedSinceLastSubmit && meta.submitError)
                  }
                  autoFocus={autoFocus}
                  {...input}
                />
              )}
            </Field>

            <div
              className={classNames(
                "max-w-[14rem] w-full center",
                theme === "large" && "mt-2",
                theme === "small" && "mt-1.5",
              )}
            >
              <Button
                type="submit"
                className="w-full"
                loading={submitting}
                disabled={profileBlocked}
              >
                Unlock
              </Button>

              {attentionModal && (
                <button
                  type="button"
                  className={classNames(
                    "w-full text-brand-inactivelight",
                    theme === "large" && "text-sm mt-6",
                    theme === "small" && "text-xs mt-4",
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
  },
);

export default PasswordForm;

const ProfileBlockedMessage = memo(({ until }: { until: number }) => {
  // Refresh every 1 sec
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const interval = setInterval(forceUpdate, 1_000);
    return () => clearInterval(interval);
  }, [forceUpdate]);

  const blockedFor = until - Date.now();

  useEffect(() => {
    if (blockedFor < 0) {
      storage.remove(Setting.ProfileBlockedUntil).catch(console.error);
    }
  }, [blockedFor]);

  const duration = intervalToDuration({ start: 0, end: blockedFor });
  const formatted = [duration.minutes, duration.seconds]
    .map((num) => String(num!).padStart(2, "0"))
    .join(":");

  return blockedFor > 0 ? (
    <>
      {" "}
      <T i18nKey="profileBlockedFor" /> {formatted}
    </>
  ) : null;
});

const ResetWhenBlocked = ({
  blocked,
  onReset,
}: {
  blocked: boolean;
  onReset: () => void;
}) => {
  useEffect(() => {
    if (blocked) onReset();
  }, [blocked, onReset]);

  return null;
};
