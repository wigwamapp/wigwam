import {
  FC,
  memo,
  useRef,
  useCallback,
  FormEventHandler,
  useState,
} from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { isPopup } from "lib/ext/view";

import { unlockWallet } from "core/client";

import { Page } from "app/defaults";
import { currentProfileAtom } from "app/atoms";
import { openInTab } from "app/helpers";
import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import PopupLayout from "app/components/layouts/PopupLayout";
import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import IconedButton from "app/components/elements/IconedButton";
import ProfilePreview from "app/components/blocks/ProfilePreview";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";
import { ReactComponent as ChangeProfileIcon } from "app/icons/change-profile.svg";

const Unlock: FC = () => {
  const currentProfile = useAtomValue(currentProfileAtom);

  const content = (
    <>
      <div className="flex justify-center">
        <div className="relative">
          <ChangeProfileButton className="absolute top-1/2 -translate-y-1/2 right-[calc(100%+4.5rem)]" />
          <ProfilePreview profile={currentProfile} />
        </div>
      </div>
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
  const [inputShowContent, setInputShowContent] = useState(false);

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
      className="w-full flex flex-col items-center mt-12"
      onSubmit={handleSubmit}
    >
      <div className="max-w-[19rem] w-full relative">
        <Input
          ref={passwordFieldRef}
          type={inputShowContent ? "text" : "password"}
          placeholder="Type password"
          label="New password"
          className="w-full"
        />
        <IconedButton
          Icon={inputShowContent ? EyeIcon : OpenedEyeIcon}
          theme="tertiary"
          className="absolute bottom-2.5 right-3"
          onClick={() => setInputShowContent(!inputShowContent)}
        />
      </div>

      <div className="max-w-[13.75rem] w-full mt-6 center">
        <NewButton type="submit" className="w-full">
          Unlock
        </NewButton>
        <button className="w-full mt-4 text-sm text-brand-inactivelight">
          <u>Forgot the password?</u>
          <br />
          Want to <u>sign into another profile?</u>
        </button>
      </div>
    </form>
  );
});

type ChangeProfileButtonProps = {
  className?: string;
};

const ChangeProfileButton = memo<ChangeProfileButtonProps>(({ className }) => {
  const handleClick = useCallback(() => {
    openInTab({ page: Page.Profiles });
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classNames(
        "flex flex-col items-center",
        "box-border w-40 px-3 py-11",
        "rounded-[.625rem]",
        "transition-colors",
        "hover:bg-brand-main/10 focus:bg-brand-main/10",
        "active:bg-brand-main/[.05]",
        className
      )}
    >
      <span className="rounded-full flex items-center justify-center bg-brand-main/10 w-16 h-16 mb-3">
        <ChangeProfileIcon className="w-6 h-6" />
      </span>
      <span className="text-lg font-bold text-brand-light">Change profile</span>
    </button>
  );
});
