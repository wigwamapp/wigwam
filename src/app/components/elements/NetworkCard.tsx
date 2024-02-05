import { FC, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { Network } from "core/types";

import { getNetworkIconUrl } from "fixtures/networks";
import { Page, SettingTab } from "app/nav";
import { useAccounts } from "app/hooks";
import IconedButton from "app/components/elements/IconedButton";
import { ReactComponent as PopoverIcon } from "app/icons/popover.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as SettingsIcon } from "app/icons/setting-general.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";

import FiatAmount from "./FiatAmount";
import Button, { ButtonProps } from "./Button";

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
  const [popoverOpened, setPopoverOpened] = useState(false);

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
          "px-4 py-3",
          "rounded-[.625rem]",
          "transition-colors",
          "border",
          isActive
            ? "border-brand-redone bg-brand-main/20"
            : "border-transparent bg-brand-main/5 hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
          className,
        )}
      >
        <span className="w-11 h-11 min-w-11 min-h-11">
          <img
            src={getNetworkIconUrl(network)}
            alt={network.name}
            className="w-full h-full object-cover"
          />
        </span>
        <span className="flex flex-col justify-between items-start gap-1 w-full h-full min-w-0">
          <span
            className={classNames(
              "text-base font-bold text-brand-inactivelight",
              "transition-colors",
              "truncate w-full text-left min-w-0",
              isActive
                ? "text-brand-light"
                : "group-hover:text-brand-light group-focus-visible:text-brand-light",
            )}
          >
            {network.name}
          </span>
          <FiatAmount
            amount={network.balanceUSD ?? 0}
            copiable={true}
            className={classNames(
              "text-left text-sm",
              "transition-colors",
              isActive ? "text-brand-light" : "text-brand-inactivedark",
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
        {network.explorerUrls?.length ? (
          <PopoverButton
            href={network.explorerUrls[0]}
            Icon={WalletExplorerIcon}
          >
            Block Explorer
          </PopoverButton>
        ) : null}
        <PopoverButton
          to={{ page: Page.Settings, setting: SettingTab.Networks }}
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
