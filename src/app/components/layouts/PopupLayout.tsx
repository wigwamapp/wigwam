import { FC, PropsWithChildren, useRef } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

import { WalletStatus } from "core/types";

import { openInTab } from "app/helpers";
import {
  getTotalAccountBalanceAtom,
  popupToolbarTabAtom,
  // updateAvailableAtom,
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
import { OverflowProvider, useAccounts } from "app/hooks";
import Button from "../elements/Button";
import { PopupToolbarTab } from "app/nav";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import Tooltip from "../elements/Tooltip";
import { getHashPreview } from "../elements/HashPreview";
import FiatAmount from "../elements/FiatAmount";
import InteractionWithDapp from "../blocks/popup/InteractionWithDapp";
import { useLazyAtomValue } from "lib/atom-utils";
import ProfileButton from "../elements/ProfileButton";

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
  // const updateAvailable = useAtomValue(updateAvailableAtom);

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
            scrollBarClassName="pt-[13.85rem] pb-[3.65rem] pl-1.5 pr-0.5 w-3"
          >
            {isUnlocked ? (
              <div
                className={classNames(
                  "p-3 pb-6",
                  "bg-gradient-to-b from-[#82B153] to-[#549BB2]",
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <InteractionWithDapp />
                  <ProfileButton size="small" hideAddress />
                </div>
                <WalletInfo />
              </div>
            ) : null}
            <main
              className={classNames(
                "relative",
                "flex-1",
                "pb-20 px-3",
                className,
                "before:absolute before:w-full before:h-5 before:rounded-t-[2rem] before:left-0",
                "before:bg-[#181A1F] before:-top-[1.250rem]",
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
  const tab = useAtomValue(popupToolbarTabAtom);

  return (
    <nav
      className={classNames(
        "fixed bottom-0 w-full",
        "px-3 py-2 bg-[#2A2D35]",
        "flex items-center justify-between gap-x-3",
      )}
    >
      <Button
        className="col-span-4 !text-sm !font-semibold !min-w-36 !max-h-10"
        theme={tab === PopupToolbarTab.Assets ? "primary" : "tertiary"}
        to={{
          tab: PopupToolbarTab.Assets,
        }}
      >
        <CoinsIcon
          className={classNames(
            "mr-2",
            tab !== PopupToolbarTab.Assets && "[&>*]:fill-white",
          )}
        />
        Assets
      </Button>
      <Button
        className="col-span-4 !text-sm !font-semibold !min-w-36 !max-h-10"
        theme={tab === PopupToolbarTab.Activity ? "primary" : "tertiary"}
        to={{
          tab: PopupToolbarTab.Activity,
        }}
      >
        <ActivityIcon
          className={classNames(
            "mr-2",
            tab === PopupToolbarTab.Activity && "[&>*]:fill-black",
          )}
        />{" "}
        Activity
      </Button>
      <Button
        theme="clean"
        className="border border-[#515561] rounded-lg col-span-1 !p-[0.625rem]"
        onClick={() => openInTab(undefined, ["token"])}
      >
        <ExpandIcon />
      </Button>
    </nav>
  );
};

const WalletInfo: FC = () => {
  const { currentAccount } = useAccounts();
  const totalBalance = useLazyAtomValue(
    getTotalAccountBalanceAtom(currentAccount.address),
  );
  const { address } = currentAccount;
  return (
    <section className="flex flex-col justify-center items-center">
      <AddressButton address={address} />
      {totalBalance ? (
        <FiatAmount
          amount={totalBalance}
          copiable
          className="mb-3 text-2xl font-bold leading-none"
        />
      ) : null}
      <div className="flex gap-9">
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
    <Button
      onClick={() => copy()}
      theme="clean"
      className="!mb-1 !p-0 flex gap-2"
    >
      <Tooltip
        content={copied ? "Copied" : "Copy Wallet Address"}
        placement="top"
      >
        <div
          className={classNames(
            "mb-1 px-3 py-1",
            "flex items-center gap-1 rounded-2xl",
            "bg-brand-main/[.15] hover:bg-brand-main/30 hover:shadow-buttonsecondary",
          )}
        >
          <span className="text-sm font-medium">{getHashPreview(address)}</span>
          {copied ? <SuccessIcon /> : <CopyIcon />}
        </div>
      </Tooltip>
    </Button>
  );
};

const DeepLinkButton: FC<{
  text: string;
  Icon: FC<{ className?: string }>;
  to: string;
}> = ({ text, to, Icon }) => {
  return (
    <Button
      theme="clean"
      className="!p-0"
      onClick={() => openInTab({ page: to }, true)}
    >
      <div className="flex flex-col items-center">
        <div className="mb-1 p-[0.625rem] bg-black rounded-full">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs">{text}</span>
      </div>
    </Button>
  );
};
