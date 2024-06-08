import { memo, useCallback, useMemo, useState } from "react";
import { Field, Form } from "react-final-form";
import classNames from "clsx";
import { nanoid } from "nanoid";
import { useAtom } from "jotai";
import { indexerApi } from "core/common/indexerApi";

import { tgApplicationAtom } from "app/atoms";
import {
  focusOnErrors,
  composeValidators,
  maxLength,
  minLength,
  required,
} from "app/utils";
import { useDialog } from "app/hooks/dialog";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import Button from "app/components/elements/Button";
import Input from "app/components/elements/Input";
import WalletAvatar from "app/components/elements/WalletAvatar";
import { ReactComponent as SuccessGreen } from "app/icons/success-green.svg";
import drumGameLogoUrl from "app/images/drum-game.png";

type TgFormValues = {
  username: string;
};

const DrumGameTarget = memo(() => {
  const [processing, setProcessing] = useState(false);
  const [tgApplication, setTgApplication] = useAtom(tgApplicationAtom);
  const { alert } = useDialog();

  const existingApplication = useMemo(() => {
    try {
      if (tgApplication) return JSON.parse(tgApplication);
    } catch {}

    return null;
  }, [tgApplication]);

  const onSubmit = useCallback(
    async (values: TgFormValues) => {
      if (processing) return;
      setProcessing(true);

      try {
        let username = values.username;
        if (username.startsWith("@")) {
          username = username.slice(1);
        }

        const payload = {
          address: `stub__${nanoid()}`,
          username,
        };

        const res = await indexerApi.post("/activity/tgapply", payload);

        if (res.status >= 200 && res.status < 300) {
          setTgApplication(
            JSON.stringify({
              username,
            }),
          );
        }
      } catch (err: any) {
        alert({
          title: "Error!",
          content:
            err?.response?.data ||
            err?.message ||
            "Failed to apply. Please try again later.",
        });
      }

      setProcessing(false);
    },
    [alert, processing, setTgApplication],
  );

  return (
    <>
      <img
        src={drumGameLogoUrl}
        alt="Drum Game"
        className={classNames("w-[10rem] h-[10rem]", "mx-auto mb-2")}
      />

      <AddAccountHeader
        className="mb-12"
        description="To participate in our telegram promotional activities you should register your telegram handle here."
      >
        Complete Drum Game target
      </AddAccountHeader>

      <div className={classNames("w-full mx-auto max-w-[24rem] min-w-0")}>
        {existingApplication ? (
          <div
            className={classNames(
              "mb-3 p-4 w-full w-full",
              "border border-brand-main/5 rounded-[.625rem] bg-white bg-opacity-5",
            )}
          >
            <div className={classNames("flex items-stretch gap-x-4")}>
              <WalletAvatar
                seed={existingApplication?.username}
                className="h-12 w-12 min-w-12"
              />
              <div className="-mt-2 flex flex-col justify-around min-w-0">
                <div className="mt-2 text-base text-brand-light leading-4 flex flex-col gap-2">
                  <span className="text-brand-inactivelight">
                    Telegram username:
                  </span>{" "}
                  <span className="font-bold truncate">
                    @{existingApplication.username}
                  </span>
                </div>
              </div>

              <div className="flex-1" />

              <SuccessGreen className="w-8" />
            </div>
          </div>
        ) : (
          <Form<TgFormValues>
            decorators={[focusOnErrors]}
            onSubmit={onSubmit}
            render={({ handleSubmit, submitting }) => (
              <>
                <Field
                  name="username"
                  validate={composeValidators(
                    required,
                    minLength(2),
                    maxLength(128),
                  )}
                >
                  {({ input, meta }) => (
                    <Input
                      label="Telegram handle (username)"
                      placeholder="username"
                      StartAdornment={() => (
                        <div className="absolute left-3 top-0 bottom-0 flex items-center">
                          @
                        </div>
                      )}
                      error={meta.error && meta.touched}
                      errorMessage={meta.error}
                      className="mb-6"
                      inputClassName="!pl-7"
                      {...input}
                    />
                  )}
                </Field>

                <Button
                  className="w-full"
                  disabled={submitting}
                  onClick={handleSubmit}
                  loading={processing}
                >
                  Register
                </Button>
              </>
            )}
          />
        )}
      </div>
    </>
  );
});

export default DrumGameTarget;
