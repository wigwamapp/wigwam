import { FC, useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import { nanoid } from "nanoid";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLazyAtomValue } from "lib/atom-utils";

import { ActivityType, Permission, MetaMaskCompatibleMode } from "core/types";
import * as repo from "core/repo";
import { saveActivity } from "core/common/activity";
import { trackEvent, TEvent } from "core/client";

import {
  activeTabAtom,
  activeTabOriginAtom,
  getAllPermissionsAtom,
  getPermissionAtom,
  web3MetaMaskCompatibleAtom,
} from "app/atoms";
import { Page, SettingTab } from "app/nav";
import { useAccounts, useChainId } from "app/hooks";
import { openInTab } from "app/helpers";
import { useSetMetaMaskCompatibleMode } from "app/hooks/web3Mode";
import Tooltip from "app/components/elements/Tooltip";
import TooltipIcon from "app/components/elements/TooltipIcon";
import { ReactComponent as MetamaskIcon } from "app/icons/metamask.svg";
import { ReactComponent as MetamaskEnabledIcon } from "app/icons/metamask-enabled.svg";
import { ReactComponent as ConnectIcon } from "app/icons/connect.svg";
import { ReactComponent as ArrowRightIcon } from "app/icons/arrow-right.svg";
import Button from "app/components/elements/Button";
import Switcher from "app/components/elements/Switcher";
import Avatar from "app/components/elements/Avatar";

const InteractionWithDapp: FC<{ className?: string }> = ({ className }) => {
  const activeTab = useAtomValue(activeTabAtom);
  const tabOrigin = useAtomValue(activeTabOriginAtom);
  const purePermission = useAtomValue(getPermissionAtom(tabOrigin));
  const metamaskMode = useAtomValue(web3MetaMaskCompatibleAtom);
  const setMetamaskMode = useSetMetaMaskCompatibleMode(false);

  const chainId = useChainId();
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

  const handleToggleConnect = useCallback(async () => {
    try {
      const accountAddress = currentAccount.address;

      if (accountConnected) {
        await repo.permissions.delete(permission?.origin ?? tabOrigin!);
      } else {
        let perm: Permission | undefined;

        if (permission) {
          await repo.permissions
            .where({ origin: permission.origin })
            .modify((perm) => {
              perm.accountAddresses.push(accountAddress);
            });

          perm = {
            ...permission,
            accountAddresses: [...permission.accountAddresses, accountAddress],
          };
        } else if (tabOrigin) {
          perm = {
            id: nanoid(),
            origin: tabOrigin,
            chainId,
            accountAddresses: [accountAddress],
            timeAt: Date.now(),
          };

          await repo.permissions.put(perm);
        }

        if (activeTab && perm) {
          await saveActivity({
            id: nanoid(),
            type: ActivityType.Connection,
            source: {
              type: "page",
              url: activeTab.url!,
              permission: perm,
              tabId: activeTab.id,
              favIconUrl: activeTab.favIconUrl,
            },
            returnSelectedAccount: true,
            preferredChainId: chainId,
            accountAddress,
            timeAt: Date.now(),
            pending: 0,
          });
        }

        trackEvent(TEvent.Web3ManualConnected);
      }
    } catch (err) {
      console.error(err);
    }
  }, [
    activeTab,
    permission,
    accountConnected,
    currentAccount,
    tabOrigin,
    chainId,
  ]);

  const handleMetamaskMode = useCallback(() => {
    setMetamaskMode(
      metamaskModeEnabled
        ? MetaMaskCompatibleMode.Off
        : MetaMaskCompatibleMode.Strict,
    );

    trackEvent(TEvent.Web3SharedModeToggled, {
      mode: metamaskModeEnabled ? "disabled" : "enabled",
    });
  }, [metamaskModeEnabled, setMetamaskMode]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div
          className={classNames(
            "flex items-center cursor-pointer group",
            "max-w-[50%]",
            className,
          )}
        >
          <div
            className={classNames(
              "flex items-center",
              "min-w-0 grow",
              "text-xs leading-none",
              "border-2",
              "rounded-3xl",
              "transition-colors",
              "bg-white/[.16] group-hover:bg-white/[.32]",
              accountConnected ? "border-brand-redone" : "border-transparent",
              urlDisplayed ? " py-1 pl-1.5 pr-2" : "p-[0.375rem]",
            )}
          >
            {urlDisplayed && tabOrigin ? (
              <span className="flex items-center gap-1.5 text-xs text-white leading-4  max-w-full">
                <div className="relative">
                  {accountConnected ? (
                    <Avatar
                      src={activeTab?.favIconUrl}
                      alt={permission?.origin}
                      className={classNames(
                        "w-5 h-5 object-cover",
                        "!border-none",
                      )}
                    />
                  ) : (
                    <ConnectIcon className="w-5 h-5" />
                  )}

                  <div
                    className={classNames(
                      "absolute top-0 -right-1 border",
                      accountConnected
                        ? "bg-brand-redone"
                        : "bg-[#DFE5E0] border border-[#92BC78]",
                      "w-2 min-w-[.375rem] h-2 rounded-full",
                    )}
                  />
                </div>
                <span className="truncate min-w-0">
                  {new URL(tabOrigin).host}
                </span>
              </span>
            ) : (
              <ConnectIcon />
            )}
          </div>
          <span
            className={classNames(
              "flex items-center",
              "p-1.5",
              "border-2",
              "rounded-full",
              "transition-colors",
              "bg-white/[.16] group-hover:bg-white/[.32]",
              "ml-2",
              metamaskModeEnabled
                ? "border-brand-redone"
                : "border-transparent",
            )}
          >
            {metamaskModeEnabled ? (
              <MetamaskEnabledIcon className="w-4 min-w-4 h-auto" />
            ) : (
              <MetamaskIcon className="w-4 min-w-4 h-auto" />
            )}
          </span>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[19rem] bg-brand-darkbg border border-[#2A2D35] p-5 rounded-3xl flex flex-col w-full z-10"
          sideOffset={8}
          side="bottom"
          align="start"
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
                        "bg-brand-redone border border-[#92BC78]",
                      )}
                    />
                  ) : null}

                  <span
                    className={classNames(
                      "font-bold",
                      accountConnected ? "text-brand-redone" : "text-[#7A7E7B]",
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
                    ? "!bg-[#FE00001F] !text-brand-redtext hover:!shadow-buttondanger focus-visible:!shadow-buttondanger"
                    : "!bg-[#80EF6E1F] text-brand-redone",
                )}
                onClick={handleToggleConnect}
              >
                {accountConnected ? "Disconnect" : "Connect"}
              </Button>
            </>
          ) : null}

          <Button
            theme="secondary"
            className="mb-2 !w-full !text-xs !font-medium !py-2.5"
            innerClassName="!w-full !flex !justify-between !items-center"
            onClick={handleMetamaskMode}
          >
            <span className="flex items-center gap-2">
              Connect as MetaMask{" "}
              <Tooltip
                content={
                  <p>
                    When enabled - use the MetaMask connection button to connect
                    to dApps only if the Wigwam wallet option is unavailable on
                    the website.
                    <br />
                    Otherwise, choose only Wigwam wallet!
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
              <ConnectedAppsCount /> <ArrowRightIcon />
            </span>
          </Button>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default InteractionWithDapp;

const ConnectedAppsCount: FC = () => {
  const allPermissions = useLazyAtomValue(getAllPermissionsAtom({}));

  return <>{allPermissions?.length || ""}</>;
};
