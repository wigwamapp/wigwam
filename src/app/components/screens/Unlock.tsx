import { FC, memo, useCallback } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { isPopup as isPopupPrimitive } from "lib/ext/view";

import { Page } from "app/nav";
import { currentProfileAtom } from "app/atoms";
import { openInTab } from "app/helpers";
import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import PopupLayout from "app/components/layouts/PopupLayout";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import ProfilePreview from "app/components/blocks/ProfilePreview";
import { ReactComponent as ChangeProfileIcon } from "app/icons/change-profile.svg";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";
import PasswordForm from "../blocks/PasswordForm";

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
      <PasswordForm
        theme={isPopup ? "small" : "large"}
        className={isPopup ? "mt-11" : "mt-12 mb-20"}
      />
      <div
        className={classNames(
          "fixed bottom-6 left-1/2 -translate-x-1/2",
          isPopup ? "text-xl" : "text-2xl",
          "font-black",
          "flex items-center"
        )}
      >
        <VigvamIcon
          className={classNames(
            isPopup ? "h-[1.375rem]" : "h-[2rem]",
            "w-auto mr-3"
          )}
        />
        Vigvam
      </div>
    </>
  );

  return isPopup ? (
    <PopupLayout>{content}</PopupLayout>
  ) : (
    <BoardingPageLayout profileNav={false}>{content}</BoardingPageLayout>
  );
};

export default Unlock;

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

export const AttentionModal = memo<SecondaryModalProps>(
  ({ open, onOpenChange }) => {
    return (
      <SecondaryModal
        open={open}
        onOpenChange={onOpenChange}
        className="px-[5.25rem]"
      >
        <ul>
          <ListBlock className="mb-5">You cannot reset Application.</ListBlock>
          <ListBlock>
            To restore with Seed Phrase, or if you want to start from scratch,
            go to Profiles and Add a New Profile!
          </ListBlock>
        </ul>
        <p className="text-base text-brand-inactivelight mt-5">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
          purus sit amet luctus venenatis, lectus magna fringilla urna,
          porttitor rhoncus dolor purus non enim praesent elementum facilisis
          leo
        </p>
      </SecondaryModal>
    );
  }
);

type ListBlockProps = {
  className?: string;
};

const ListBlock: FC<ListBlockProps> = ({ children, className }) => (
  <li className={classNames("relative pl-[1.375rem]", className)}>
    <span className="absolute left-0 top-2 w-2.5 h-2.5 bg-radio rounded-full" />
    <span className="text-xl font-bold">{children}</span>
  </li>
);
