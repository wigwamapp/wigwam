import { memo, useRef, useState } from "react";
import classNames from "clsx";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { TReplace } from "lib/ext/i18n/react";

import { Account } from "core/types";

import { TippySingletonProvider, useToken, useLazyNetwork } from "app/hooks";

import FiatAmount from "./FiatAmount";
import PrettyAmount from "./PrettyAmount";
import AutoIcon from "./AutoIcon";
import HashPreview from "./HashPreview";
import IconedButton from "./IconedButton";
import Tooltip from "./Tooltip";
import CopiableTooltip from "./CopiableTooltip";
import TooltipIcon from "./TooltipIcon";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as ClockIcon } from "app/icons/clock.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as GasIcon } from "app/icons/gas.svg";

type LargeWalletCardProps = {
  account: Account;
  className?: string;
};

const LargeWalletCard = memo<LargeWalletCardProps>(
  ({ account: { name, address }, className }) => {
    const [copied, setCopied] = useState(false);

    const currentNetwork = useLazyNetwork();
    const nativeToken = useToken(address);
    const portfolioBalance = nativeToken?.portfolioUSD;

    const transitionRef = useRef<HTMLDivElement>(null);

    return (
      <div
        className={classNames(
          "w-[23.25rem] min-w-[23.25rem]",
          "relative",
          className
        )}
        style={{ perspective: 1000 }}
      >
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={address}
            nodeRef={transitionRef}
            timeout={150}
            classNames="card-flip"
          >
            <div
              ref={transitionRef}
              className={classNames(
                "transform-gpu transition",
                "px-4 pt-4 pb-3",
                "bg-brand-main/10",
                "rounded-[.625rem]",
                "flex flex-col",
                "relative"
              )}
              style={{ transformStyle: "preserve-3d" }}
            >
              <TippySingletonProvider>
                <div className="flex">
                  <AutoIcon
                    seed={address}
                    source="dicebear"
                    type="personas"
                    className={classNames(
                      "h-18 w-18 min-w-[4.5rem] mr-4",
                      "bg-black/40",
                      "rounded-[.625rem]"
                    )}
                  />
                  <div
                    className={classNames(
                      "flex flex-col items-start",
                      "text-base text-brand-light leading-none",
                      "w-full min-w-0"
                    )}
                  >
                    <CopiableTooltip
                      content="Copy wallet address to clipboard"
                      textToCopy={address}
                      onCopiedToggle={setCopied}
                      className={classNames(
                        "px-1 pt-1 -mx-1 -mt-1",
                        "text-left",
                        "rounded",
                        "max-w-full",
                        "transition-colors",
                        "hover:bg-brand-main/40"
                      )}
                    >
                      <>
                        <span
                          className={classNames(
                            "block",
                            "pb-0.5 block min-w-0",
                            "font-bold",
                            "overflow-ellipsis overflow-hidden whitespace-nowrap"
                          )}
                        >
                          <TReplace msg={name} />
                        </span>
                        <span className="inline-flex items-center">
                          <HashPreview
                            hash={address}
                            withTooltip={false}
                            className="text-sm font-normal leading-none mr-1"
                          />
                          {copied ? (
                            <SuccessIcon className="w-[1.3125rem] h-auto" />
                          ) : (
                            <CopyIcon className="w-[1.3125rem] h-auto" />
                          )}
                        </span>
                      </>
                    </CopiableTooltip>
                    {portfolioBalance ? (
                      <FiatAmount
                        amount={nativeToken ? portfolioBalance : null}
                        isMinified={new BigNumber(portfolioBalance).isLessThan(
                          0.01
                        )}
                        copiable
                        className="mt-auto text-xl font-bold leading-none"
                      />
                    ) : (
                      <PrettyAmount
                        amount={
                          nativeToken
                            ? ethers.utils.formatEther(nativeToken.rawBalance)
                            : null
                        }
                        currency={nativeToken?.symbol}
                        copiable
                        prefix={<GasIcon className="w-3 h-auto mr-1" />}
                        className="text-sm leading-none text-brand-inactivedark flex items-center max-h-[1rem]"
                      />
                    )}
                  </div>
                </div>
                <div className="flex mt-2">
                  <div className="flex justify-center h-6 w-18 min-w-[4.5rem] mr-4">
                    {currentNetwork?.explorerUrls && (
                      <IconedButton
                        href={`${currentNetwork.explorerUrls}/address/${address}`}
                        aria-label="View wallet in Explorer"
                        Icon={WalletExplorerIcon}
                        className="!w-6 !h-6"
                        iconClassName="!w-[1.125rem]"
                      />
                    )}
                    {currentNetwork?.explorerUrls && (
                      <IconedButton
                        href={`${currentNetwork.explorerUrls}/address/${address}`}
                        aria-label="View wallet activity"
                        Icon={ClockIcon}
                        className="!w-6 !h-6 ml-2"
                        iconClassName="!w-[1.125rem]"
                      />
                    )}
                  </div>
                  {portfolioBalance && (
                    <PrettyAmount
                      amount={
                        nativeToken
                          ? ethers.utils.formatEther(nativeToken.rawBalance)
                          : null
                      }
                      currency={nativeToken?.symbol}
                      copiable
                      prefix={<GasIcon className="w-3 h-auto mr-1" />}
                      className="text-sm leading-none text-brand-inactivedark flex items-center max-h-[1rem]"
                    />
                  )}
                </div>
                <Tooltip
                  content={
                    <>
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit
                        ut aliquam, purus sit amet luctus venenatis, lectus
                        magna fringilla urna, porttitor rhoncus dolor purus non
                        enim praesent elementum facilisis leo
                      </p>
                      <p className="mt-2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit
                        ut aliquam, purus sit amet luctus venenatis, lectus
                        magna fringilla urna, porttitor rhoncus
                      </p>
                    </>
                  }
                  placement="right"
                  size="large"
                  className="absolute right-4 bottom-3"
                >
                  <TooltipIcon theme="dark" />
                </Tooltip>
              </TippySingletonProvider>
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    );
  }
);

export default LargeWalletCard;
