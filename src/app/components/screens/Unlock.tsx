import { FC, memo, useCallback, useState } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import * as Accordion from "@radix-ui/react-accordion";
import { isPopup as isPopupPrimitive } from "lib/ext/view";
import { Link } from "lib/navigation";

import { Page } from "app/nav";
import { currentProfileAtom } from "app/atoms";
import { openInTab } from "app/helpers";
import { ReactComponent as ChangeProfileIcon } from "app/icons/change-profile.svg";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";

import BoardingPageLayout from "../layouts/BoardingPageLayout";
import PopupLayout from "../layouts/PopupLayout";
import ProfilePreview from "../blocks/ProfilePreview";
import PasswordForm from "../blocks/PasswordForm";
import SecondaryModal, {
  SecondaryModalProps,
} from "../elements/SecondaryModal";

const Unlock: FC = () => {
  const currentProfile = useAtomValue(currentProfileAtom);

  const isPopup = isPopupPrimitive();

  const content = (
    <>
      <div className={classNames("flex justify-center", isPopup && "mt-12")}>
        <div className="relative">
          <ChangeProfileButton
            theme={isPopup ? "small" : "large"}
            className={classNames(
              "absolute top-1/2 -translate-y-1/2",
              isPopup
                ? "right-[calc(100%+0.5rem)]"
                : "right-[calc(100%+2.5rem)]"
            )}
          />
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
        autoFocus
      />
      {isPopup && (
        <div
          className={classNames(
            "fixed bottom-6 left-1/2 -translate-x-1/2",
            "bottom-4",
            "text-xl",
            "font-black",
            "flex items-center"
          )}
        >
          <VigvamIcon className={classNames("h-[1.375rem]", "w-auto mr-3")} />
          Vigvam
        </div>
      )}
    </>
  );

  return isPopup ? (
    <PopupLayout>{content}</PopupLayout>
  ) : (
    <BoardingPageLayout>{content}</BoardingPageLayout>
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
    const [accordionValue, setAccordionValue] = useState(
      AttentionContent[0].value
    );

    const isPopup = isPopupPrimitive();

    return (
      <SecondaryModal
        open={open}
        onOpenChange={onOpenChange}
        className={classNames(
          isPopup ? "px-6" : "px-[4rem]",
          isPopup ? "py-6" : "py-[3rem]",
          isPopup && "max-w-[92vw] max-h-[70vh]",
          "prose prose-invert",
          isPopup && "prose-sm",
          "!block"
        )}
      >
        <Accordion.Root
          type="single"
          value={accordionValue}
          onValueChange={setAccordionValue}
          className={classNames(
            isPopup ? "min-h-[21.5rem]" : "min-h-[18.5rem]"
          )}
        >
          {AttentionContent.map(({ value, header, content }) => (
            <Accordion.Item key={value} value={value}>
              <Accordion.Header>
                <Accordion.Trigger>
                  <HeadingDot active={value === accordionValue}>
                    {header}
                  </HeadingDot>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="leading-6">
                {content}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </SecondaryModal>
    );
  }
);

const HeadingDot: FC<{ active?: boolean }> = ({ children, active }) => (
  <span className="flex items-center font-bold hover:underline">
    <span className="mr-3 w-2.5 h-2.5 bg-radio rounded-full relative">
      {!active && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-brand-darklight rounded-full" />
        </span>
      )}
    </span>

    <span>{children}</span>
  </span>
);

const AttentionContent = [
  {
    value: "pass",
    header: "Forgot the password",
    content: (
      <>
        <p className="mb-2">
          It is impossible to recover the current profile password. Because
          Vigvam is <strong>non-custodial</strong> software. Only user knows his
          password.
        </p>

        <p className="mt-2">
          To access the same wallets -{" "}
          <Link to={{ page: Page.Profiles }}>add a new profile</Link>, and
          restore this wallets. If you used the <strong>Secret Phrase</strong>{" "}
          to add them, <strong>use the same one again</strong>.
        </p>
      </>
    ),
  },
  {
    value: "seed",
    header: "Import Secret Phrase",
    content: (
      <p>
        To restore wallets with the Secret Phrase, or if you want to start from
        scratch - <Link to={{ page: Page.Profiles }}>add a new profile</Link>{" "}
        and use this pharse to add new wallets.
      </p>
    ),
  },
  {
    value: "reset",
    header: "Reset the app",
    content: (
      <p>
        Vigvam does not have a built-in function to reset the application. We
        recommend using <Link to={{ page: Page.Profiles }}>profiles</Link>, but
        if you still want to reset - just reinstall the application (all
        profiles will be erased).
      </p>
    ),
  },
];
