import { FC, useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";

import { AccountSource } from "core/types";
import * as repo from "core/repo";

import {
  activeTabAtom,
  activeTabOriginAtom,
  currentAccountAtom,
  getPermissionAtom,
} from "app/atoms";
import Tooltip from "app/components/elements/Tooltip";
import Avatar from "app/components/elements/Avatar";
import TooltipIcon from "app/components/elements/TooltipIcon";

const InteractionWithDapp: FC<{ className?: string }> = ({ className }) => {
  const activeTab = useAtomValue(activeTabAtom);
  const tabOrigin = useAtomValue(activeTabOriginAtom);
  const purePermission = useAtomValue(getPermissionAtom(tabOrigin));
  const currentAccount = useAtomValue(currentAccountAtom);

  const permission =
    purePermission && purePermission.accountAddresses.length > 0
      ? purePermission
      : undefined;

  const accountConnected = useMemo(
    () =>
      permission
        ? permission.accountAddresses.includes(currentAccount.address)
        : false,
    [permission, currentAccount]
  );

  const watchOnlyAcc = currentAccount.source === AccountSource.Address;

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
    <div
      className={classNames(
        "flex items-center",
        "w-full",
        "min-h-8 py-1 px-3 pr-2",
        "text-xs leading-none",
        "border border-brand-main/[.07]",
        "rounded-[.625rem]",
        className
      )}
    >
      {permission ? (
        state === "connected" ? (
          <span
            className={classNames(
              "block",
              "w-5 h-5 mr-1.5",
              "rounded-full overflow-hidden",
              "border border-[#4F9A5E]"
            )}
          >
            <Avatar
              src={activeTab?.favIconUrl}
              alt={permission.origin}
              className={classNames(
                "w-full h-full object-cover",
                "!border-none"
              )}
            />
          </span>
        ) : (
          <Tooltip
            content={
              <p>
                Current wallet is not connected to this website.
                {!watchOnlyAcc &&
                  " To connect it - click Connect on the right."}
                <br />
                If you want to disconnect all wallets - switch to any connected
                wallet, and then click Disconnect on the right.
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
                "border border-[#BCC2DB]/[0.7]"
              )}
            >
              <Avatar
                src={activeTab?.favIconUrl}
                alt={permission.origin}
                className={classNames(
                  "w-full h-full object-cover",
                  "!border-none opacity-25"
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
                  fill="#F8F9FD"
                />
              </svg>
            </span>
          </Tooltip>
        )
      ) : (
        <Tooltip
          content={
            <p>
              Vigvam is not connected to this site. To connect to a web3 site,
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
            state !== "connected" && "text-brand-inactivedark"
          )}
        >
          {new URL(tabOrigin).host}
        </span>
      )}
      {permission && !watchOnlyAcc && (
        <button
          type="button"
          className="leading-[.875rem] px-2 py-1 -my-1 ml-auto transition-opacity hover:opacity-70"
          onClick={handlePermission}
        >
          {accountConnected ? "Disconnect" : "Connect"}
        </button>
      )}
    </div>
  );
};

export default InteractionWithDapp;
