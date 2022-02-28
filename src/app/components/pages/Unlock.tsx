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
import { isPopup as isPopupPrimitive } from "lib/ext/view";

import { unlockWallet } from "core/client";

import { Page } from "app/defaults";
import { currentProfileAtom } from "app/atoms";
import { openInTab } from "app/helpers";
import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import PopupLayout from "app/components/layouts/PopupLayout";
import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import IconedButton from "app/components/elements/IconedButton";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import ProfilePreview from "app/components/blocks/ProfilePreview";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";
import { ReactComponent as ChangeProfileIcon } from "app/icons/change-profile.svg";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";

const Unlock: FC = () => {
  const currentProfile = useAtomValue(currentProfileAtom);

  const isPopup = isPopupPrimitive();

  const content = (
    <>
      <div className={classNames("flex justify-center", isPopup && "mt-16")}>
        <div className="relative">
          <ChangeProfileButton
            theme={isPopup ? "small" : "large"}
            className={classNames(
              "absolute top-1/2 -translate-y-1/2",
              isPopup ? "right-[calc(100%+1rem)]" : "right-[calc(100%+4.5rem)]"
            )}
          />
          <ProfilePreview
            theme={isPopup ? "extrasmall" : "large"}
            profile={currentProfile}
          />
        </div>
      </div>
      <UnlockForm
        theme={isPopup ? "small" : "large"}
        className={isPopup ? "mt-11" : "mt-12"}
      />
    </>
  );

  return isPopup ? (
    <PopupLayout>
      {content}
      <div
        className={classNames(
          "absolute bottom-6 left-1/2 -translate-x-1/2",
          "text-xl font-black",
          "flex items-center"
        )}
      >
        <VigvamIcon className="h-[1.375rem] w-auto mr-3" />
        Vigvam
      </div>
    </PopupLayout>
  ) : (
    <BoardingPageLayout profileNav={false}>{content}</BoardingPageLayout>
  );
};

export default Unlock;

type UnlockFormProps = {
  theme?: "large" | "small";
  className?: string;
};

const UnlockForm = memo<UnlockFormProps>(({ theme = "large", className }) => {
  const passwordFieldRef = useRef<HTMLInputElement>(null);
  const [inputShowContent, setInputShowContent] = useState(false);
  const [attention, setAttention] = useState(false);

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
          className="absolute bottom-2.5 right-3"
          onClick={() => setInputShowContent(!inputShowContent)}
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
});

type ChangeProfileButtonProps = {
  theme?: "large" | "small";
  className?: string;
};

const ChangeProfileButton = memo<ChangeProfileButtonProps>(
  ({ theme = "large", className }) => {
    const handleClick = useCallback(() => {
      openInTab({ page: Page.Profiles });
    }, []);

    return (
      <button
        type="button"
        onClick={handleClick}
        className={classNames(
          "flex flex-col items-center",
          "box-border",
          theme === "large" && "w-40 px-3 py-11",
          theme === "small" && "w-[6.5rem] px-2 py-5",
          "rounded-[.625rem]",
          "transition-colors",
          "hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
          "active:bg-brand-main/[.05]",
          className
        )}
      >
        <span
          className={classNames(
            "rounded-full",
            "flex items-center justify-center",
            "bg-brand-main/10",
            theme === "large" && "w-16 h-16 mb-3",
            theme === "small" && "w-12 h-12 mb-1"
          )}
        >
          <ChangeProfileIcon
            className={classNames(
              theme === "large" && "w-6 h-6",
              theme === "small" && "w-[1.125rem] h-[1.125rem]"
            )}
          />
        </span>
        <span
          className={classNames(
            theme === "large" && "text-lg",
            theme === "small" && "text-xs",
            "font-bold text-brand-light"
          )}
        >
          Change profile
        </span>
      </button>
    );
  }
);

const AttentionModal = memo<SecondaryModalProps>(({ open, onOpenChange }) => {
  return (
    <SecondaryModal
      open={open}
      onOpenChange={onOpenChange}
      className="px-[5.25rem]"
    >
      <ul>
        <ListBlock className="mb-5">You cannot reset Application.</ListBlock>
        <ListBlock>
          To restore with Seed Phrase, or if you want to start from scratch, go
          to Profiles and Add a New Profile!
        </ListBlock>
      </ul>
      <p className="text-base text-brand-inactivelight mt-5">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
        purus sit amet luctus venenatis, lectus magna fringilla urna, porttitor
        rhoncus dolor purus non enim praesent elementum facilisis leo
      </p>
    </SecondaryModal>
  );
});

type ListBlockProps = {
  className?: string;
};

const ListBlock: FC<ListBlockProps> = ({ children, className }) => (
  <li className={classNames("relative pl-[1.375rem]", className)}>
    <span className="absolute left-0 top-2 w-2.5 h-2.5 bg-radio rounded-full" />
    <span className="text-xl font-bold">{children}</span>
  </li>
);
