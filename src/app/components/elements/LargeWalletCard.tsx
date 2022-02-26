import { FC, useRef } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { TReplace } from "lib/ext/i18n/react";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { Account } from "core/types";

import { allNetworksAtom } from "app/atoms";
import { useLazyNetwork } from "app/hooks";
import AutoIcon from "app/components/elements/AutoIcon";
import HashPreview from "app/components/elements/HashPreview";
import Balance from "app/components/elements/Balance";
import IconedButton from "app/components/elements/IconedButton";
import Tooltip from "app/components/elements/Tooltip";
import HoverCard from "app/components/elements/HoverCard";
import TooltipIcon from "app/components/elements/TooltipIcon";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as ClockIcon } from "app/icons/clock.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";

type LargeWalletCardProps = {
  account: Account;
  className?: string;
};

const LargeWalletCard: FC<LargeWalletCardProps> = ({
  account: { name, address },
  className,
}) => {
  const fieldRef = useRef<HTMLInputElement>(null);
  const { copy, copied } = useCopyToClipboard(fieldRef);

  const networks = useAtomValue(allNetworksAtom);
  const currentNetwork = useLazyNetwork(networks[0]);

  return (
    <div
      className={classNames(
        "px-4 pt-4 pb-3",
        "w-[23.25rem] min-w-[23.25rem]",
        "bg-brand-main/10",
        "rounded-[.625rem]",
        "flex flex-col",
        "relative",
        className
      )}
    >
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
          <input ref={fieldRef} defaultValue={address} className="sr-only" />
          <Tooltip
            content={
              copied
                ? "Wallet address copied to clipboard"
                : "Copy wallet address to clipboard"
            }
            asChild
          >
            <button
              onClick={copy}
              className={classNames(
                "px-1 pt-1 -mx-1 -mt-1",
                "text-left",
                "rounded",
                "max-w-full",
                "transition-colors",
                "hover:bg-brand-main/40"
              )}
            >
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
              <span className="flex items-center">
                <HashPreview
                  hash={address}
                  withTooltip={false}
                  className="text-sm font-normal leading-none"
                />
                {copied ? (
                  <SuccessIcon className="w-[1.3125rem] ml-1" />
                ) : (
                  <CopyIcon className="w-[1.3125rem] ml-1" />
                )}
              </span>
            </button>
          </Tooltip>
          <Balance
            address={address}
            className="mt-auto text-xl font-bold leading-none"
          />
        </div>
      </div>
      <div className="flex mt-2">
        <div className="flex justify-center w-18 min-w-[4.5rem] mr-4">
          {currentNetwork.explorerUrls && (
            <IconedButton
              href={`${currentNetwork.explorerUrls}/address/${address}`}
              aria-label="View wallet transactions in explorer"
              Icon={WalletExplorerIcon}
              className="!w-6 !h-6"
              iconClassName="!w-[1.125rem]"
            />
          )}
          {currentNetwork.explorerUrls && (
            <IconedButton
              href={`${currentNetwork.explorerUrls}/address/${address}`}
              aria-label="View wallet transactions in explorer"
              Icon={ClockIcon}
              className="!w-6 !h-6 ml-2"
              iconClassName="!w-[1.125rem]"
            />
          )}
        </div>
        <span className="text-sm leading-none text-brand-inactivedark">
          $ 46,909.13
        </span>
      </div>
      <HoverCard
        content={
          <>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
              aliquam, purus sit amet luctus venenatis, lectus magna fringilla
              urna, porttitor rhoncus dolor purus non enim praesent elementum
              facilisis leo
            </p>
            <p className="mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
              aliquam, purus sit amet luctus venenatis, lectus magna fringilla
              urna, porttitor rhoncus
            </p>
          </>
        }
        side="right"
        align="end"
        className="absolute right-4 bottom-3"
      >
        <TooltipIcon theme="dark" />
      </HoverCard>
    </div>
  );
};

export default LargeWalletCard;
