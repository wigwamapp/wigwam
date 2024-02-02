import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MetaMaskCompatibleMode } from "core/types/shared";

import {
  activeTabAtom,
  activeTabOriginAtom,
  getPermissionAtom,
  web3MetaMaskCompatibleAtom,
} from "app/atoms";
import { useAccounts } from "app/hooks";
import { openInTab } from "app/helpers";
import { useSetMetaMaskCompatibleMode } from "app/hooks/web3Mode";
import Tooltip from "app/components/elements/Tooltip";
import TooltipIcon from "app/components/elements/TooltipIcon";
import { ReactComponent as MetamaskIcon } from "app/icons/metamask.svg";
import { ReactComponent as MetamaskEnabledIcon } from "app/icons/metamask-enabled.svg";
import { ReactComponent as ConnectIcon } from "app/icons/connect.svg";
import { ReactComponent as CircleIcon } from "app/icons/circle.svg";
import { ReactComponent as ArrowRightIcon } from "app/icons/arrow-right.svg";
import Button from "app/components/elements/Button";
import Switcher from "app/components/elements/Switcher";
import { Page, SettingTab } from "app/nav";

const InteractionWithDapp: FC<{ className?: string }> = ({ className }) => {
  const activeTab = useAtomValue(activeTabAtom);
  const tabOrigin = useAtomValue(activeTabOriginAtom);
  const purePermission = useAtomValue(getPermissionAtom(tabOrigin));
  const metamaskMode = useAtomValue(web3MetaMaskCompatibleAtom);
  const setMetamaskMode = useSetMetaMaskCompatibleMode(false);

  const { currentAccount } = useAccounts();

  const metamaskModeEnabled = metamaskMode === MetaMaskCompatibleMode.Strict;

  const permission =
    purePermission && purePermission.accountAddresses.length > 0
      ? purePermission
      : undefined;

  const accountConnected = useMemo(
    () =>
      permission
        ? permission.accountAddresses.includes(currentAccount.address)
        : false,
    [permission, currentAccount],
  );

  const reallyConnectable = useMemo(() => {
    if (!activeTab?.url) return false;

    const { protocol, pathname } = new URL(activeTab.url);

    for (const type of [/\.xml$/u, /\.pdf$/u]) {
      if (type.test(pathname)) {
        return false;
      }
    }

    return protocol.startsWith("http") || protocol.startsWith("file");
  }, [activeTab]);

  const urlDisplayed = useMemo(
    () => typeof tabOrigin === "string" && reallyConnectable,
    [tabOrigin, reallyConnectable],
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div
          className={classNames(
            "flex items-center cursor-pointer group",
            className,
          )}
        >
          <div
            className={classNames(
              "flex items-center",
              "min-w-0 grow",
              "min-h-8",
              "text-xs leading-none",
              "border-2",
              "rounded-3xl",
              "bg-[#FFFFFF29] group-hover:bg-[#FFFFFF29]/20",
              accountConnected ? "border-[#80EF6E]" : "border-transparent",
              urlDisplayed ? " py-1 px-3 pr-2" : "p-[0.375rem]",
            )}
          >
            {urlDisplayed && tabOrigin ? (
              <span className="flex items-center gap-1 truncate leading-4">
                <div className="relative">
                  <CircleIcon />
                  <div
                    className={classNames(
                      "absolute top-0 -right-1 border",
                      accountConnected ? "bg-[#92BC78]" : "border-[#80EF6E]",
                      "w-2 min-w-[.375rem] h-2 rounded-full",
                      accountConnected ? "bg-[#80EF6E]" : "bg-white",
                    )}
                  />
                </div>{" "}
                {new URL(tabOrigin).host}
              </span>
            ) : (
              <ConnectIcon />
            )}
          </div>
          <span
            className={classNames(
              "flex items-center",
              "min-h-8 p-1",
              "border-2",
              "rounded-3xl",
              "bg-[#FFFFFF29] group-hover:bg-[#FFFFFF29]/20",
              "ml-2",
              metamaskModeEnabled ? "border-[#80EF6E]" : "border-transparent",
            )}
          >
            {metamaskModeEnabled ? (
              <MetamaskEnabledIcon />
            ) : (
              <MetamaskIcon className="w-5 min-w-5 h-auto" />
            )}
          </span>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[19rem] ml-6 bg-[#2A2D35] p-5 rounded-3xl flex flex-col w-full z-10"
          sideOffset={8}
        >
          {urlDisplayed ? (
            <>
              <div className="mb-4 w-full flex justify-between items-center">
                {tabOrigin && (
                  <span className="flex gap-1 items-center truncate leading-4">
                    <ConnectIcon />
                    {new URL(tabOrigin).host}
                  </span>
                )}
                <div className="flex gap-1 items-center">
                  {accountConnected ? (
                    <div
                      className={classNames(
                        "w-2 min-w-[.375rem] h-2 rounded-full ml-2",
                        "bg-[#80EF6E] border border-[#92BC78]",
                      )}
                    />
                  ) : null}

                  <span
                    className={classNames(
                      "font-bold",
                      accountConnected ? "text-[#80EF6E]" : "text-[#7A7E7B]",
                    )}
                  >
                    {accountConnected ? "Connected" : "Unconnected"}
                  </span>
                </div>
              </div>
              <Button
                className={classNames(
                  "mb-4",
                  "!text-xs !font-medium",
                  accountConnected
                    ? "!bg-[#FE00001F] text-[#DD0000]"
                    : "!bg-[#80EF6E1F] text-brand-redone",
                )}
              >
                {accountConnected ? "Disconnect" : "Connect"}
              </Button>
            </>
          ) : null}

          <Button
            theme="secondary"
            className="mb-2 !w-full !text-xs !font-medium"
            innerClassName="!w-full !flex !justify-between !items-center"
            onClick={() =>
              setMetamaskMode(
                metamaskModeEnabled
                  ? MetaMaskCompatibleMode.Off
                  : MetaMaskCompatibleMode.Strict,
              )
            }
          >
            <span className="flex items-center gap-2">
              Connect as MetaMask{" "}
              <Tooltip
                content={
                  <p>
                    Use this mode to connect to dApps via the Metamask
                    connection button.
                  </p>
                }
                placement="bottom-end"
                size="large"
                interactive={false}
              >
                <TooltipIcon theme="dark" className="w-5 h-5" />
              </Tooltip>
            </span>
            <Switcher
              checked={metamaskModeEnabled}
              className="!min-w-[2rem]"
              buttonClassName="!bg-transparent !p-0 !min-h-4 !max-h-4"
            />
          </Button>
          <Button
            theme="secondary"
            className="!w-full !text-xs !font-medium"
            innerClassName="!w-full !flex !justify-between"
            onClick={() =>
              openInTab({ page: Page.Settings, setting: SettingTab.Web3 })
            }
          >
            <span>Connected apps</span>
            <span className="flex items-center gap-1 text-[#93ACAF]">
              4 <ArrowRightIcon />
            </span>
          </Button>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default InteractionWithDapp;
