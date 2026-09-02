import { FC, memo, useCallback } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { isPopup as isPopupPrimitive } from "lib/ext/view";

import { Page } from "app/nav";
import { currentProfileAtom } from "app/atoms";
import { openInTab } from "app/helpers";
import { ReactComponent as ChangeProfileIcon } from "app/icons/change-profile.svg";
import { ReactComponent as WigwamIcon } from "app/icons/WigwamTitle.svg";

import BoardingPageLayout from "../layouts/BoardingPageLayout";
import PopupLayout from "../layouts/PopupLayout";
import ProfilePreview from "../blocks/ProfilePreview";
import PasswordForm from "../blocks/PasswordForm";

type UnlockProps = {
  isApproval?: boolean;
};

const Unlock: FC<UnlockProps> = ({ isApproval }) => {
  const currentProfile = useAtomValue(currentProfileAtom);

  const isPopup = isPopupPrimitive();

  const content = (
    <>
      <div className={classNames("flex justify-center", isPopup && "mt-12")}>
        <div className="relative">
          {!isApproval && (
            <ChangeProfileButton
              theme={isPopup ? "small" : "large"}
              className={classNames(
                "absolute top-1/2 -translate-y-1/2",
                isPopup
                  ? "right-[calc(100%+0.5rem)]"
                  : "right-[calc(100%+2.5rem)]",
              )}
            />
          )}

          <ProfilePreview
            theme={isPopup ? "extrasmall" : "large"}
            profile={currentProfile}
            className={classNames(isPopup ? "w-[8.25rem]" : "w-[16rem]")}
          />
        </div>
      </div>
      <PasswordForm
        theme={isPopup ? "small" : "large"}
        className={isPopup ? "mt-11" : "mt-12 mb-20"}
        attentionModal={!isApproval}
        autoFocus
      />
      {isPopup && (
        <div
          className={classNames(
            "fixed bottom-6 left-1/2 -translate-x-1/2",
            "bottom-4",
            "text-xl",
            "font-black",
            "flex items-center",
          )}
        >
          <WigwamIcon className={classNames("h-[1.375rem]", "w-auto mr-3")} />
        </div>
      )}
    </>
  );

  return isPopup ? (
    <PopupLayout>{content}</PopupLayout>
  ) : (
    <BoardingPageLayout header={!isApproval}>{content}</BoardingPageLayout>
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
          className,
        )}
      >
        <span
          className={classNames(
            "rounded-full",
            "flex items-center justify-center",
            "bg-brand-main/10",
            theme === "large" && "w-16 h-16 mb-3",
            theme === "small" && "w-12 h-12 mb-1",
          )}
        >
          <ChangeProfileIcon
            className={classNames(
              theme === "large" && "w-6 h-6",
              theme === "small" && "w-[1.125rem] h-[1.125rem]",
            )}
          />
        </span>
        <span
          className={classNames(
            theme === "large" && "text-lg",
            theme === "small" && "text-xs",
            "font-bold text-brand-light",
          )}
        >
          Change profile
        </span>
      </button>
    );
  },
);
