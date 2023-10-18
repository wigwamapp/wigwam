import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import { useOnScreen } from "lib/react-hooks/useOnScreen";

import { IS_FIREFOX } from "app/defaults";
import { onboardingPopupAtom } from "app/atoms";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import Button from "app/components/elements/Button";
import OnboardingOneImage from "app/images/onboarding-1.png";
import OnboardingTwoImage from "app/images/onboarding-2.png";
import OnboardingThreeImage from "app/images/onboarding-3.png";
import OnboardingFourImage from "app/images/onboarding-4.png";
import OnboardingFiveImage from "app/images/onboarding-5.png";
import OnboardingSixImage from "app/images/onboarding-6.png";
import OnboardingSevenImage from "app/images/onboarding-7.png";
import { ReactComponent as ArrowIcon } from "app/icons/arrow-left-long.svg";

const OnboardingPopup: FC = () => {
  const visible = useAtomValue(onboardingPopupAtom);

  return visible ? <OnboardingPopupContent /> : null;
};

export default OnboardingPopup;

const OnboardingPopupContent: FC = () => {
  const setVisible = useSetAtom(onboardingPopupAtom);
  const [isReady, setIsReady] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomElementRef = useRef<HTMLSpanElement>(null);

  const scrolledBottom = useOnScreen(bottomElementRef);

  useEffect(() => {
    if (scrolledBottom) {
      setIsReady(true);
    }
  }, [setIsReady, scrolledBottom]);

  const handleButtonClick = useCallback(() => {
    if (isReady) {
      setVisible(false);
    } else {
      const html = document.querySelector("html")!;
      const fontSize = parseFloat(
        window.getComputedStyle(html, null).getPropertyValue("font-size"),
      );

      scrollAreaRef.current?.scrollTo({
        behavior: "smooth",
        top:
          (scrollAreaRef.current?.scrollTop || 0) +
          html.offsetHeight -
          6 * fontSize,
        left: 0,
      });
    }
  }, [isReady, setVisible]);

  return (
    <div className="fixed inset-0 z-[999999999999] bg-[#07081B]/[.98] flex flex-col">
      <ScrollAreaContainer
        ref={scrollAreaRef}
        className={classNames("w-full flex flex-col")}
        viewPortClassName="pb-[12.5rem] rounded-t-[.625rem]"
        scrollBarClassName="pt-2 pb-[6.5rem]"
      >
        <div className="w-full max-w-[56.25rem] pt-[6.5rem] flex flex-col mx-auto">
          <h1 className="text-center text-[2.5rem] mb-4 font-bold">
            Welcome to Vigvam Beta testing 🏕
          </h1>
          <p className="text-center text-lg">
            This release is offering you to try the core functionality of the
            application and even more!
            <br />
            Right now with Vigvam you can:
          </p>
          <Wrapper className="mt-[6.875rem]">
            <Item>
              Create an unlimited amount of wallets with Secret Phrase, Ledger
              Nano device, and social media
            </Item>
            <img
              src={OnboardingOneImage}
              className="w-[26.625rem] h-auto ml-[6.5rem]"
              alt="Create an unlimited amount of wallets with Secret Phrase, Ledger Nano device, and social media"
            />
          </Wrapper>
          <Wrapper className="mt-[5.875rem]">
            <img
              src={OnboardingTwoImage}
              className="w-[21.625rem] h-auto mr-[5.625rem]"
              alt="Send and receive tokens to any of the networks that are already pre-installed in Vigvam. As well as add any EVM-compatible network"
            />
            <Item>
              Send and receive tokens to any of the networks that are already
              pre-installed in Vigvam. As well as add any EVM-compatible network
            </Item>
          </Wrapper>
          <Wrapper className="mt-[6.625rem]">
            <Item>
              View your gas and ERC20 tokens balances, along with detailed
              information about them, including transaction history
            </Item>
            <img
              src={OnboardingThreeImage}
              className="w-[28.25rem] h-auto ml-[4.875rem]"
              alt="View your gas and ERC20 tokens balances, along with detailed information about them, including transaction history"
            />
          </Wrapper>
          <Wrapper className="mt-[7.25rem]">
            <img
              src={OnboardingFourImage}
              className="w-[23.375rem] h-auto mr-[3.75rem]"
              alt={`Connect and fully interact with decentralized applications using the "Connect a Wallet" or "Connect MetaMask" button`}
            />
            <Item>
              Connect and fully interact with decentralized applications using
              the &quot;Connect a Wallet&quot; or &quot;Connect MetaMask&quot;
              button
            </Item>
          </Wrapper>
          <Wrapper>
            <Item>Create an unlimited number of profiles!</Item>
            <img
              src={OnboardingFiveImage}
              className="w-[21.5rem] h-auto ml-[4.875rem]"
              alt="Create an unlimited number of profiles!"
            />
          </Wrapper>
          <Wrapper>
            <img
              src={OnboardingSixImage}
              className="w-[23.25rem] h-auto mr-[4rem]"
              alt="Manage NFTs most conveniently: synchronization of all tokens from the start, instant auto-add after getting new ones, quick search and the ability to add a token, token preview with any content type, NFT transaction history."
            />
            <Item>
              Manage NFTs most conveniently: synchronization of all tokens from
              the start, instant auto-add after getting new ones, quick search
              and the ability to add a token, token preview with any content
              type (image/video/audio), NFT transaction history.
            </Item>
          </Wrapper>
          <Wrapper className="mt-[3.75rem]">
            <Item>
              To help us test the product and get NFT Vigvam Pro, check out the{" "}
              <Link href="https://wigwamapp.medium.com/private-beta-learn-about-our-wallet-via-testing-and-earn-a-valuable-nft-wigwam-pro-4058fa702d09">
                Beta Testing Workflow
              </Link>
              . Then fill in the{" "}
              <Link href="https://forms.gle/bE5mmn4SGbCmGWG46">
                Feedback Form
              </Link>{" "}
              to leave your feedback or bug report. Also, we suggest you learn{" "}
              <Link href="https://wigwamapp.medium.com/nft-wigwam-pro-why-do-you-need-this-nft-and-how-to-get-it-for-free-dd7125715f43">
                Information about NFT Vigvam Pro and participation rules
              </Link>
              .
            </Item>
            <img
              src={OnboardingSevenImage}
              className="w-[23.5rem] h-auto ml-[3.75rem]"
              alt="To help us test the product and get NFT Vigvam Pro, check out the Beta Testing Workflow. Then fill in the Feedback Form to leave your feedback or bug report. Also, we suggest you learn Information about NFT Vigvam Pro and participation rules."
            />
          </Wrapper>
          <span ref={bottomElementRef} className="invisible" />
        </div>
      </ScrollAreaContainer>
      <div
        className={classNames(
          "z-20",
          "absolute bottom-0 left-1/2 -translate-x-1/2",
          "w-full h-24",
          "flex justify-center items-center",
          "mx-auto",
          "bg-brand-dark/20",
          "backdrop-blur-[10px]",
          IS_FIREFOX && "!bg-addaccountcontinue",
          "before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2",
          "before:w-full before:max-w-[56.25rem] before:h-px",
          "before:bg-brand-main/[.07]",
        )}
      >
        <Button
          type="button"
          className="!min-w-[14rem] group"
          onClick={handleButtonClick}
        >
          {isReady ? (
            "Let's start!"
          ) : (
            <span className="flex items-center">
              Next
              <ArrowIcon className="ml-2 rotate-180 w-6 h-auto transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

const Wrapper: FC<PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => (
  <div
    className={classNames(
      "flex items-center w-full text-brand-light",
      className,
    )}
  >
    {children}
  </div>
);

const Item: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex">
    <span className="block w-2 min-w-[.5rem] mt-2.5 h-2 rounded-full bg-buttonaccent mr-2" />
    <p className="text-xl	font-bold">{children}</p>
  </div>
);

type LinkProps = PropsWithChildren<{
  href: string;
}>;

const Link: FC<LinkProps> = ({ href, children }) => (
  <a
    href={href}
    className="text-brand-font transition-colors hover:text-brand-light"
  >
    {children}
  </a>
);
