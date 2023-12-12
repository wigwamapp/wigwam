import { FC, useCallback, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";

import * as repo from "core/repo";
import { MetaMaskCompatibleMode } from "core/types/shared";

import {
  activeTabAtom,
  activeTabOriginAtom,
  getPermissionAtom,
  web3MetaMaskCompatibleAtom,
} from "app/atoms";
import { useAccounts } from "app/hooks";
import WebThreeCompatible from "app/components/blocks/WebThreeCompatible";
import Tooltip from "app/components/elements/Tooltip";
import Avatar from "app/components/elements/Avatar";
import TooltipIcon from "app/components/elements/TooltipIcon";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import { ReactComponent as MetamaskIcon } from "app/icons/metamask.svg";

const InteractionWithDapp: FC<{ className?: string }> = ({ className }) => {
  const activeTab = useAtomValue(activeTabAtom);
  const tabOrigin = useAtomValue(activeTabOriginAtom);
  const purePermission = useAtomValue(getPermissionAtom(tabOrigin));
  const metamaskMode = useAtomValue(web3MetaMaskCompatibleAtom);

  const { currentAccount } = useAccounts();

  const [web3DialogOpened, setWeb3DialogOpened] = useState(false);

  const metamaskModeEnabled = metamaskMode !== MetaMaskCompatibleMode.Off;

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

  const reallyConnectible = useMemo(() => {
    if (!activeTab?.url) return false;

    const { protocol, pathname } = new URL(activeTab.url);

    for (const type of [/\.xml$/u, /\.pdf$/u]) {
      if (type.test(pathname)) {
        return false;
      }
    }

    return protocol.startsWith("http") || protocol.startsWith("file");
  }, [activeTab]);

  const state = useMemo(() => {
    if (!permission) return "disconnected";
    if (accountConnected) return "connected";
    return "connectible";
  }, [permission, accountConnected]);

  const handlePermission = useCallback(async () => {
    if (!permission) return;

    try {
      if (accountConnected) {
        await repo.permissions.delete(permission.origin);
      } else {
        await repo.permissions
          .where({ origin: permission.origin })
          .modify((perm) => {
            perm.accountAddresses.push(currentAccount.address);
          });
      }
    } catch (err) {
      console.error(err);
    }
  }, [permission, accountConnected, currentAccount]);

  if (!reallyConnectible) return null;

  return (
    <div className={classNames("flex items-center w-full", className)}>
      <div
        className={classNames(
          "flex items-center",
          "min-w-0 grow",
          "min-h-8 py-1 px-3 pr-2",
          "text-xs leading-none",
          "border border-brand-main/[.07]",
          "rounded-[.625rem]",
        )}
      >
        {permission ? (
          state === "connected" ? (
            <span
              className={classNames(
                "block",
                "w-5 h-5 min-w-[1.25rem] mr-1.5",
                "rounded-full overflow-hidden",
                "border border-[#4F9A5E]",
              )}
            >
              <Avatar
                src={activeTab?.favIconUrl}
                alt={permission.origin}
                className={classNames(
                  "w-full h-full object-cover",
                  "!border-none",
                )}
              />
            </span>
          ) : (
            <Tooltip
              content={
                <p>
                  Current wallet is not connected to this website. To connect it
                  - click{" "}
                  {metamaskMode === MetaMaskCompatibleMode.Strict
                    ? ""
                    : "the icon on the right to enable MetaMask compatible mode then click "}
                  the Connect button.
                  <br />
                  If you want to disconnect all wallets - switch to any
                  connected wallet, and then click the Disconnect button on the
                  right.
                </p>
              }
              placement="bottom-end"
              size="large"
              interactive={false}
            >
              <span
                className={classNames(
                  "block relative",
                  "w-5 h-5 mr-1.5",
                  "rounded-full overflow-hidden",
                  "border border-[#BCC3C4]/[0.7]",
                )}
              >
                <Avatar
                  src={activeTab?.favIconUrl}
                  alt={permission.origin}
                  className={classNames(
                    "w-full h-full object-cover",
                    "!border-none opacity-25",
                  )}
                />

                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute top-0 left-0 w-4.5 h-4.5"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 11V8.99L11.02 8.991L11.01 13H12.02V15H9.00001V11H8ZM9.00001 7.019V5H11.02V7.019H9.00001Z"
                    fill="#F8FCFD"
                  />
                </svg>
              </span>
            </Tooltip>
          )
        ) : (
          <Tooltip
            content={
              <p>
                Wigwam is not connected to this site. To connect to a web3 site,
                find and click the Connect button.
              </p>
            }
            placement="bottom-end"
            size="large"
            interactive={false}
          >
            <TooltipIcon
              theme="dark"
              className="w-5 h-5 mr-1.5 border border-brand-main/[.07]"
            />
          </Tooltip>
        )}
        {tabOrigin && (
          <span
            className={classNames(
              "truncate leading-4",
              state !== "connected" && "text-brand-inactivedark",
            )}
          >
            {new URL(tabOrigin).host}
          </span>
        )}

        <span className="flex-1" />

        {permission && (metamaskModeEnabled || accountConnected) && (
          <button
            type="button"
            className="leading-[.875rem] px-2 py-1 -my-1 ml-auto transition-opacity hover:opacity-70"
            onClick={handlePermission}
          >
            {accountConnected ? "Disconnect" : "Connect"}
          </button>
        )}
      </div>
      <Tooltip
        content={
          !metamaskModeEnabled && accountConnected ? (
            <>
              <p>
                Current wallet is connected to this website but you disabled
                MetaMask compatible mode.
              </p>
              <p>
                If you want to enable it back click the icon.
                <br />
                If you want to disconnect all wallets - click the Disconnect
                button on the left.
              </p>
            </>
          ) : (
            <p>
              MetaMask compatible mode is {metamaskMode}. To change its state,
              click this icon.
            </p>
          )
        }
        size="large"
        placement="bottom-end"
        asChild
      >
        <button
          type="button"
          onClick={() => setWeb3DialogOpened(true)}
          className={classNames(
            "flex items-center",
            "min-h-8 py-1 px-2.5",
            "border border-brand-main/[.07]",
            "rounded-[.625rem]",
            "ml-2",
          )}
        >
          <MetamaskIcon
            className={classNames(
              "w-[1.125rem] min-w-[1.125rem] h-auto transition-opacity",
              metamaskModeEnabled ? "opacity-80" : "opacity-60",
            )}
          />
          <div
            className={classNames(
              "w-1.5 min-w-[.375rem] h-1.5 rounded-full ml-2 transition",
              metamaskModeEnabled ? "bg-brand-greenobject" : "bg-brand-main/60",
            )}
          />
        </button>
      </Tooltip>
      <Web3CompatibleModeDialog
        open={web3DialogOpened}
        onOpenChange={setWeb3DialogOpened}
      />
    </div>
  );
};

const Web3CompatibleModeDialog: FC<SecondaryModalProps> = ({
  header = "MetaMask compatible mode",
  small = true,
  ...rest
}) => {
  return (
    <SecondaryModal header={header} small={small} {...rest}>
      <WebThreeCompatible small />
    </SecondaryModal>
  );
};

export default InteractionWithDapp;
