import { FC, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { Network } from "core/types";

import { Page, SettingTab } from "app/nav";
import { useAccounts, useExplorerLink } from "app/hooks";
import IconedButton from "app/components/elements/IconedButton";
import { ReactComponent as PopoverIcon } from "app/icons/popover.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as SettingsIcon } from "app/icons/setting-general.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";

import FiatAmount from "./FiatAmount";
import Button, { ButtonProps } from "./Button";
import NetworkIcon from "./NetworkIcon";

type NetworkCardProps = {
  network: Network;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
};

const NetworkCard: FC<NetworkCardProps> = ({
  network,
  isActive = false,
  onClick,
  className,
}) => {
  const { currentAccount } = useAccounts();
  const explorerLink = useExplorerLink(network);

  const [popoverOpened, setPopoverOpened] = useState(false);

  const explorerUrl = explorerLink?.address(currentAccount.address);

  return (
    <DropdownMenu.Root
      open={popoverOpened}
      onOpenChange={setPopoverOpened}
      modal
    >
      <button
        type="button"
        onClick={onClick}
        className={classNames(
          "flex items-center w-full max-w-1/4 gap-3",
          "group",
          "px-3 py-2",
          "rounded-[.625rem]",
          "transition-colors",
          "border",
          isActive
            ? "border-brand-redone bg-brand-main/20"
            : "border-transparent bg-brand-main/5 hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
          className,
        )}
      >
        <span className="w-10 h-10 min-w-10 min-h-10">
          <NetworkIcon
            network={network}
            className="w-full h-full object-cover"
          />
        </span>
        <span className="flex flex-col justify-center items-start w-full h-full min-w-0">
          <span
            className={classNames(
              "text-base font-bold",
              "transition-colors",
              "truncate w-full text-left min-w-0",
              isActive
                ? "text-brand-light"
                : "text-brand-lightgray group-hover:text-brand-light group-focus-visible:text-brand-light",
            )}
          >
            {network.name}
          </span>
          <FiatAmount
            amount={network.balanceUSD ?? 0}
            copiable={isActive}
            asSpan
            className={classNames(
              "text-left text-sm font-bold",
              "transition-colors",
              isActive
                ? "text-brand-light"
                : "text-brand-inactivelight group-hover:text-brand-light group-focus-visible:text-brand-light",
            )}
          />
        </span>

        <DropdownMenu.Trigger asChild>
          <IconedButton
            Icon={PopoverIcon}
            theme="tertiary"
            className={classNames(
              "ml-2",
              "transition-all",
              isActive || popoverOpened
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100",
              popoverOpened && "bg-brand-main/30 shadow-buttonsecondary",
            )}
            tabIndex={-1}
            asSpan
          />
        </DropdownMenu.Trigger>
      </button>

      <DropdownMenu.Content
        className={classNames(
          "bg-brand-darkbg",
          // "backdrop-blur-[30px]",
          // IS_FIREFOX && "!bg-[#0E1314]",
          "border border-[#2A2D35]",
          "rounded-[.625rem]",
          "px-1 py-2",
          "z-[1]",
          "flex flex-col",
        )}
      >
        {explorerUrl ? (
          <PopoverButton href={explorerUrl} Icon={WalletExplorerIcon}>
            Block Explorer
          </PopoverButton>
        ) : null}
        <PopoverButton
          to={{
            page: Page.Settings,
            setting: SettingTab.Networks,
            chainid: network.chainId,
          }}
          Icon={SettingsIcon}
        >
          Settings
        </PopoverButton>
        <CopyAddressButton />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default NetworkCard;

type PopoverButton = ButtonProps & {
  Icon: FC<{ className?: string }>;
};

const PopoverButton: FC<PopoverButton> = ({
  Icon,
  children,
  className,
  ...rest
}) => (
  <Button
    theme="clean"
    className={classNames(
      "!min-w-[7.5rem] !px-2 !py-1",
      "rounded-[.5rem]",
      "text-sm font-bold text-left",
      "transition-colors",
      !rest.disabled &&
        "hover:bg-brand-main/10 focus-visible:bg-brand-main/10 hover:!opacity-100 focus-visible:!opacity-100",
      "disabled:opacity-40 disabled:cursor-default",
      className,
    )}
    innerClassName="w-full items-start"
    {...rest}
  >
    <Icon className="mr-2 w-6 h-auto" />
    {children}
  </Button>
);

const CopyAddressButton: FC = () => {
  const { currentAccount } = useAccounts();
  const { copy, copied } = useCopyToClipboard(currentAccount.address);

  return (
    <PopoverButton
      onClick={() => copy()}
      Icon={copied ? SuccessIcon : CopyIcon}
      className="!min-w-[9.75rem]"
    >
      {copied ? "Address copied" : "Copy address"}
    </PopoverButton>
  );
};
