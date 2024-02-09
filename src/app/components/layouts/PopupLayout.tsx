import { FC, HTMLAttributes, PropsWithChildren, useRef } from "react";
import classNames from "clsx";
import { useAtom, useAtomValue } from "jotai";

import { WalletStatus } from "core/types";

import { openInTab } from "app/helpers";
import {
  getTotalAccountBalanceAtom,
  popupToolbarTabAtom,
  updateAvailableAtom,
  walletStatusAtom,
} from "app/atoms";
import ScrollTopButton from "app/components/blocks/popup/ScrollTopButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { ReactComponent as ExpandIcon } from "app/icons/expand.svg";
import { ReactComponent as ActivityIcon } from "app/icons/activity-toolbar.svg";
import { ReactComponent as CoinsIcon } from "app/icons/coins.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as SendIcon } from "app/icons/send-action.svg";
import { ReactComponent as BuyIcon } from "app/icons/buy-action.svg";
import { ReactComponent as FullScreenIcon } from "app/icons/full-screen.svg";
import { OverflowProvider, useAccounts, useActivityBadge } from "app/hooks";
import Button from "../elements/Button";
import { PopupToolbarTab } from "app/nav";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import Tooltip from "../elements/Tooltip";
import { getHashPreview } from "../elements/HashPreview";
import FiatAmount from "../elements/FiatAmount";
import InteractionWithDapp from "../blocks/popup/InteractionWithDapp";
import { useLazyAtomValue } from "lib/atom-utils";
import ProfileButton from "../elements/ProfileButton";
import PopupBgImage from "app/images/popup-bg.svg";
import RoundedButton from "../elements/RoundedButton";

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

type PopupLayoutProps = PropsWithChildren<{
  className?: string;
}>;

const PopupLayout: FC<PopupLayoutProps> = ({ className, children }) => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const walletStatus = useAtomValue(walletStatusAtom);
  const updateAvailable = useAtomValue(updateAvailableAtom);

  const isUnlocked = walletStatus === WalletStatus.Unlocked;

  return (
    <OverflowProvider>
      {(ref) => (
        <div
          ref={ref}
          className={classNames(
            "w-full",
            "h-screen",
            "flex flex-col items-stretch",
            bootAnimationDisplayed && "animate-bootfadeinfast",
          )}
          onAnimationEnd={
            bootAnimationDisplayed ? handleBootAnimationEnd : undefined
          }
        >
          <ScrollAreaContainer
            ref={scrollAreaRef}
            hiddenScrollbar="horizontal"
            className="h-full min-h-0"
            viewPortClassName="viewportBlock"
            scrollBarClassName="pt-[15.25rem] pb-[3.65rem] pl-1.5 pr-0.5 w-3"
          >
            {isUnlocked ? (
              <div className={classNames("pt-2 px-3 pb-8", "relative")}>
                <img
                  src={PopupBgImage}
                  alt="Wigwam"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="mb-2 flex items-center justify-between gap-3 relative z-10">
                  <InteractionWithDapp />
                  <ProfileButton
                    size="small"
                    hideAddress
                    className="-mr-1 max-w-[50%]"
                  />
                </div>
                <WalletInfo />
              </div>
            ) : (
              <div className="p-4">
                <RoundedButton
                  theme={isUnlocked ? "small" : "large"}
                  onClick={() => openInTab(undefined, ["token"])}
                  className={classNames(
                    "w-full",
                    !isUnlocked && "p-3.5",
                    isUnlocked && "p-3",
                  )}
                >
                  <FullScreenIcon className="mr-1" />
                  Open Full
                  {updateAvailable ? (
                    <div
                      className={classNames(
                        "w-2 h-2",
                        "bg-activity rounded-full",
                        "absolute top-2 right-2",
                      )}
                    />
                  ) : null}
                </RoundedButton>
              </div>
            )}
            <main
              className={classNames(
                "relative",
                "flex-1",
                "pb-16 px-3",
                "before:absolute before:w-full before:h-4 before:rounded-t-[2rem] before:left-0",
                "before:bg-brand-darkbg before:-top-[1rem] before:shadow-popup-bg",
                className,
              )}
            >
              {children}
            </main>
            {isUnlocked ? (
              <>
                <NavToolbar />
                <ScrollTopButton
                  scrollAreaRef={scrollAreaRef}
                  className="fixed bottom-20 right-4"
                />
              </>
            ) : null}
          </ScrollAreaContainer>
        </div>
      )}
    </OverflowProvider>
  );
};

export default PopupLayout;

const NavToolbar: FC = () => {
  const [tab, setTab] = useAtom(popupToolbarTabAtom);
  const activityBadgeDisplayed = useActivityBadge();

  return (
    <nav
      className={classNames(
        "fixed bottom-0 w-full",
        "px-3 py-2 bg-[#2A2D35]",
        "flex items-center justify-between gap-x-3",
        "shadow-popup-nav",
      )}
    >
      <NavToolbarButton
        Icon={CoinsIcon}
        label="Assets"
        isActive={tab === PopupToolbarTab.Assets}
        onClick={() => setTab(PopupToolbarTab.Assets)}
      />
      <NavToolbarButton
        Icon={ActivityIcon}
        label="Activity"
        isActive={tab === PopupToolbarTab.Activity}
        onClick={() => setTab(PopupToolbarTab.Activity)}
        badge={activityBadgeDisplayed}
      />
      <Button
        theme="tertiary"
        className="border border-[#515561] rounded-lg col-span-1 !p-[0.625rem] !min-w-0"
        onClick={() => openInTab(undefined, ["token"])}
      >
        <ExpandIcon />
      </Button>
    </nav>
  );
};

type NavToolbarButtonProps = HTMLAttributes<HTMLButtonElement> & {
  Icon: FC<{ className?: string }>;
  label: string;
  isActive?: boolean;
  badge?: boolean;
};

const NavToolbarButton: FC<NavToolbarButtonProps> = ({
  Icon,
  label,
  isActive = false,
  badge,
  ...rest
}) => (
  <button
    className={classNames(
      "appearance-none",
      "col-span-4 !text-sm !min-w-36 !max-h-10",
      "transition",
      "flex items-center justify-center",
      "text-sm font-bold",
      "rounded-[.375rem]",
      "h-full py-3 px-4",
      badge && !isActive ? "styled-label--pending" : "",
      isActive
        ? "bg-brand-redone text-brand-darkaccent bg-opacity hover:bg-opacity-100 hover:shadow-buttonaccent focus-visible:bg-opacity-100 focus-visible:shadow-buttonaccent active:bg-opacity-70 active:shadow-none"
        : "hover:bg-brand-main hover:bg-opacity-[.15] hover:shadow-buttonsecondary focus-visible:bg-brand-main focus-visible:bg-opacity-[.15] focus-visible:shadow-buttonsecondary active:bg-brand-main active:text-brand-light/60 active:bg-opacity-10 active:shadow-none",
    )}
    {...rest}
  >
    <Icon
      className={classNames(
        "mr-2",
        "transition-all",
        badge && !isActive ? "styled-icon--pending" : "",
        isActive ? "styled-icon-popup--active" : "styled-icon-popup",
      )}
    />
    {label}
  </button>
);

const WalletInfo: FC = () => {
  const { currentAccount } = useAccounts();
  const totalBalance = useLazyAtomValue(
    getTotalAccountBalanceAtom(currentAccount.address),
    "off",
  );

  const { address } = currentAccount;
  return (
    <section className="flex flex-col justify-center items-center relative z-10">
      <AddressButton address={address} />

      <FiatAmount
        amount={totalBalance ?? "0"}
        copiable
        className={classNames(
          "mt-3 mb-5 text-[2rem] tracking-wide font-bold leading-none",
          !totalBalance && "invisible",
        )}
      />

      <div className="flex gap-8">
        <DeepLinkButton text="Send" to="transfer" Icon={SendIcon} />
        <DeepLinkButton text="Buy" to="receive" Icon={BuyIcon} />
        <DeepLinkButton text="Swap" to="swap" Icon={SwapIcon} />
      </div>
    </section>
  );
};

const AddressButton: FC<{ address: string }> = ({ address }) => {
  const { copy, copied } = useCopyToClipboard(address);

  return (
    <Tooltip
      content={copied ? "Copied" : "Copy Wallet Address"}
      placement="top"
      asChild
    >
      <button
        type="button"
        onClick={() => copy()}
        className={classNames(
          "px-2.5 py-1",
          "rounded-2xl",
          "transition-colors",
          "bg-white/[.16] hover:bg-white/[.32] focus-visible:bg-white/[.32]",
          "flex items-center gap-1",
        )}
      >
        <span className="text-sm font-medium">{getHashPreview(address)}</span>
        {copied ? (
          <SuccessIcon className="w-5 h-5" />
        ) : (
          <CopyIcon className="w-5 h-5" />
        )}
      </button>
    </Tooltip>
  );
};

const DeepLinkButton: FC<{
  text: string;
  Icon: FC<{ className?: string }>;
  to: string;
}> = ({ text, to, Icon }) => {
  return (
    <button
      type="button"
      className="flex flex-col items-center relative z-10 group"
      onClick={() => openInTab({ page: to }, true)}
    >
      <div className="mb-1 p-2.5 bg-brand-darkbg rounded-full transition-colors group-hover:bg-[#373B45] group-focus-visible:bg-[#373B45]">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium">{text}</span>
    </button>
  );
};
