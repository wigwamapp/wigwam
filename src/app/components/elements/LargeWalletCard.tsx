import { memo, useRef, useState } from "react";
import classNames from "clsx";
import { CSSTransition, SwitchTransition } from "react-transition-group";

import { Account } from "core/types";

import {
  TippySingletonProvider,
  useToken,
  useLazyNetwork,
  useExplorerLink,
} from "app/hooks";
import { Page } from "app/nav";

import HashPreview from "./HashPreview";
import Balance from "./Balance";
import IconedButton from "./IconedButton";
import Tooltip from "./Tooltip";
import CopiableTooltip from "./CopiableTooltip";
import TooltipIcon from "./TooltipIcon";
import WalletName from "./WalletName";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as SettingsIcon } from "app/icons/setting-general.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as GasIcon } from "app/icons/gas.svg";
import WalletAvatar from "./WalletAvatar";

type LargeWalletCardProps = {
  account: Account;
  className?: string;
};

const LargeWalletCard = memo<LargeWalletCardProps>(({ account, className }) => {
  const { address } = account;
  const [copied, setCopied] = useState(false);

  const currentNetwork = useLazyNetwork();
  const explorerLink = useExplorerLink(currentNetwork);
  const portfolioBalance = useToken(address)?.portfolioUSD;

  const transitionRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={classNames(
        "w-[23.25rem] min-w-[23.25rem]",
        "relative",
        className,
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
              "relative",
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            <TippySingletonProvider>
              <div className="flex">
                <WalletAvatar
                  seed={address}
                  className={classNames(
                    "h-[4.5rem] w-[4.5rem] min-w-[4.5rem] mr-4",
                    "bg-black/40",
                    "rounded-[.625rem]",
                  )}
                />
                <div
                  className={classNames(
                    "flex flex-col items-start",
                    "text-base text-brand-light leading-none",
                    "w-full min-w-0",
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
                      "hover:bg-brand-main/40",
                    )}
                  >
                    <>
                      <WalletName wallet={account} className="mb-0.5" />
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
                  <Balance
                    address={address}
                    copiable
                    className="mt-auto text-xl font-bold leading-none"
                  />
                </div>
              </div>
              <div className="flex mt-2">
                <div className="flex justify-center h-6 w-18 min-w-[4.5rem] mr-4">
                  {explorerLink && (
                    <IconedButton
                      href={explorerLink.address(address)}
                      aria-label="View wallet in Explorer"
                      Icon={WalletExplorerIcon}
                      className="!w-6 !h-6 mr-2"
                      iconClassName="!w-[1.125rem]"
                    />
                  )}
                  <IconedButton
                    aria-label="Edit wallet"
                    Icon={SettingsIcon}
                    to={{ page: Page.Wallets }}
                    className="!w-6 !h-6"
                    iconClassName="!w-[1.125rem]"
                  />
                </div>
                {portfolioBalance && (
                  <Balance
                    address={address}
                    copiable
                    isNative
                    prefix={<GasIcon className="w-3 h-auto mr-1" />}
                    className="text-sm leading-none text-brand-inactivedark flex items-center max-h-[1rem]"
                  />
                )}
              </div>
              <Tooltip
                content={
                  <>
                    <p>
                      This is your currently selected wallet. All balances in
                      sections below are related to this wallet.
                    </p>

                    {portfolioBalance && (
                      <p className="mt-2">
                        The large white amount is the full balance of your
                        portfolio in the selected network, current:{" "}
                        {currentNetwork?.name}.
                      </p>
                    )}
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
});

export default LargeWalletCard;
