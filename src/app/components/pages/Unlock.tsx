import {
  FC,
  useMemo,
  memo,
  useRef,
  useCallback,
  FormEventHandler,
} from "react";
import classNames from "clsx";
import ArrowCircleRightIcon from "@heroicons/react/solid/ArrowCircleRightIcon";
import { isPopup } from "lib/ext/view";
import { getCurrentProfile } from "lib/ext/profile";

import { unlockWallet } from "core/client";

import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import PopupLayout from "app/components/layouts/PopupLayout";
import TextField from "app/components/elements/TextField";
import ProfilePreview from "app/components/blocks/ProfilePreview";

const Unlock: FC = () => {
  const currentProfile = useMemo(getCurrentProfile, []);

  const content = (
    <>
      <ProfilePreview profile={currentProfile} />
      <UnlockForm />
    </>
  );

  return isPopup() ? (
    <PopupLayout>{content}</PopupLayout>
  ) : (
    <BoardingPageLayout profileNav={false}>{content}</BoardingPageLayout>
  );
};

export default Unlock;

const UnlockForm = memo(() => {
  const passwordFieldRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (evt) => {
      evt.preventDefault();

      const password = passwordFieldRef.current?.value;
      if (password) {
        try {
          await unlockWallet(password);
        } catch (err: any) {
          alert(err?.message);
        }
      }
    },
    []
  );

  return (
    <form
      className="w-full flex flex-col items-center p-8"
      onSubmit={handleSubmit}
    >
      <TextField
        ref={passwordFieldRef}
        type="password"
        placeholder="******"
        className="mb-8 w-full max-w-sm"
      />

      <button
        className={classNames(
          "inline-flex items-center",
          "text-3xl",
          "text-gray-100",
          "transition ease-in-out duration-300",
          "animate-pulse hover:animate-none focus:animate-none"
        )}
      >
        Unlock
        <ArrowCircleRightIcon className="h-8 w-auto ml-4" />
      </button>
    </form>
  );
});
