import { FormEventHandler, memo, useCallback, useRef, useState } from "react";
import classNames from "clsx";

import { unlockWallet } from "core/client";

import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";
import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import IconedButton from "app/components/elements/IconedButton";
import { AttentionModal } from "../pages/Unlock";

interface PasswordFormProps {
  theme?: "large" | "small";
  unlockCallback?: (password: string) => void;
  className?: string;
}
const PasswordForm = memo<PasswordFormProps>(
  ({ theme = "large", unlockCallback, className }) => {
    const passwordFieldRef = useRef<HTMLInputElement>(null);
    const [inputShowContent, setInputShowContent] = useState(false);
    const [attention, setAttention] = useState(false);

    const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
      async (evt) => {
        evt.preventDefault();

        const password = passwordFieldRef.current?.value;
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
      <form
        className={classNames("w-full flex flex-col items-center", className)}
        onSubmit={handleSubmit}
      >
        <div className="max-w-[19rem] w-full relative">
          <Input
            ref={passwordFieldRef}
            type={inputShowContent ? "text" : "password"}
            placeholder="Type password"
            label="Password"
            className="w-full"
          />
          <IconedButton
            Icon={inputShowContent ? EyeIcon : OpenedEyeIcon}
            aria-label={`${inputShowContent ? "Hide" : "Show"} password`}
            theme="tertiary"
            onClick={() => setInputShowContent(!inputShowContent)}
            tabIndex={-1}
            className="absolute bottom-2.5 right-3"
          />
        </div>

        <div
          className={classNames(
            "max-w-[13.75rem] w-full center",
            theme === "large" && "mt-6",
            theme === "small" && "mt-4"
          )}
        >
          <NewButton type="submit" className="w-full">
            Unlock
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
    );
  }
);

export default PasswordForm;
