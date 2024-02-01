import {
  FC,
  PropsWithChildren,
  // Suspense,
  useEffect,
  useRef,
} from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

// import { WalletStatus } from "core/types";

import { openInTab } from "app/helpers";
import {
  popupToolbarTabAtom,
  // updateAvailableAtom,
  // walletStatusAtom,
} from "app/atoms";
// import ActivityBar from "app/components/blocks/ActivityBar";
import ScrollTopButton from "app/components/blocks/popup/ScrollTopButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
// import RoundedButton from "app/components/elements/RoundedButton";
// import LockProfileButton from "app/components/elements/LockProfileButton";
// import { ReactComponent as FullScreenIcon } from "app/icons/full-screen.svg";
import { ReactComponent as ExpandIcon } from "app/icons/expand.svg";
import { ReactComponent as ChatIcon } from "app/icons/chat.svg";
import { ReactComponent as CoinsIcon } from "app/icons/coins.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as SendIcon } from "app/icons/send-action.svg";
import { ReactComponent as BuyIcon } from "app/icons/buy-action.svg";
import { OverflowProvider } from "app/hooks";
import Button from "../elements/Button";
import { PopupToolbarTab } from "app/nav";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import Tooltip from "../elements/Tooltip";

let bootAnimationDisplayed = true;
const handleBootAnimationEnd = () => {
  bootAnimationDisplayed = false;
};

type PopupLayoutProps = PropsWithChildren<{
  className?: string;
}>;

const PopupLayout: FC<PopupLayoutProps> = ({ className, children }) => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // const walletStatus = useAtomValue(walletStatusAtom);
  // const updateAvailable = useAtomValue(updateAvailableAtom);

  // const isUnlocked = walletStatus === WalletStatus.Unlocked;

  useEffect(() => {
    const gradient = generateContrastGradient();
    const r = document.getElementById("wallet");
    if (r) {
      r.style.backgroundImage = gradient;
    }
  }, []);

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
            scrollBarClassName="pt-[13rem] pb-[4.75rem] pl-1.5 pr-0.5 w-3"
          >
            <div className="p-3 pb-6" id="wallet">
              <div className="mb-3 flex items-center justify-between">
                <ConnectionStatus />
                <p className="text-sm font-semibold">Wallet 1</p>
              </div>
              <WalletInfo />
            </div>
            <main
              className={classNames(
                "relative",
                "flex-1",
                "pt-3 pb-20 px-3",
                "overflow-hidden",
                "flex flex-col",
                "rounded-t-2xl",
                className,
              )}
            >
              {children}
            </main>
            <NavToolbar />
            <ScrollTopButton
              scrollAreaRef={scrollAreaRef}
              className="fixed bottom-14 right-3"
            />
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
        "p-3 flex items-center justify-between bg-[#2A2D35]",
      )}
    >
      <Button
        theme={tab === PopupToolbarTab.Assets ? "primary" : "clean"}
        to={{
          tab: PopupToolbarTab.Assets,
        }}
      >
        <CoinsIcon className="mr-1" />
        Assets
      </Button>
      <Button
        theme={tab === PopupToolbarTab.Activity ? "primary" : "clean"}
        to={{
          tab: PopupToolbarTab.Activity,
        }}
      >
        <ChatIcon className="mr-1" /> Activity
      </Button>
      <Button
        theme="clean"
        className="border border-[#515561] rounded-lg"
        onClick={() => openInTab(undefined, ["token"])}
      >
        <ExpandIcon />
      </Button>
    </nav>
  );
};

const ConnectionStatus = () => {
  return (
    <span
      className={classNames(
        "text-brand-redtwo font-bold text-xs relative ml-2",
        "before:absolute before:-left-3 before:top-1 before:h-2 before:w-2 before:rounded-full before:bg-brand-redtwo",
      )}
    >
      Connected
    </span>
  );
};

const WalletInfo: FC = () => {
  return (
    <section className="flex flex-col justify-center items-center">
      <div className="flex items-center gap-2">
        <AddressButton address="0x3a78o...b3440" />
      </div>
      <p className="mb-3 text-2xl font-bold">$28,983.94</p>
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
    <Button onClick={() => copy()} theme="clean" className="!p-0 flex gap-2">
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
          <span className="text-sm font-medium">{address}</span>
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
        <div className="mb-1 p-3 bg-black rounded-full">
          <Icon className="w-5 h-5" />
        </div>
        <span>{text}</span>
      </div>
    </Button>
  );
};

function generateContrastGradient() {
  // Устанавливаем фиксированную насыщенность
  const saturation = 50;

  // Случайные оттенки для двух цветов
  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + Math.floor(Math.random() * 180) + 90) % 360;
  // Гарантируем, что цвета разные

  // Светлоты для контраста с белым и черным текстом
  const lightness1 = 40; // Темнее для белого текста
  const lightness2 = 60; // Светлее для черного текста

  // CSS строки для градиента
  const color1 = `hsl(${hue1}, ${saturation}%, ${lightness1}%)`;
  const color2 = `hsl(${hue2}, ${saturation}%, ${lightness2}%)`;

  return `linear-gradient(to bottom, ${color1}, ${color2})`;
}
