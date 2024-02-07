import { FC, memo, MouseEvent, useCallback } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { useLazyAtomValue } from "lib/atom-utils";

import * as repo from "core/repo";
import { MetaMaskCompatibleMode } from "core/types";

import { getAllPermissionsAtom, web3MetaMaskCompatibleAtom } from "app/atoms";
import { useSetMetaMaskCompatibleMode } from "app/hooks/web3Mode";

import { ReactComponent as ExternalLinkIcon } from "app/icons/external-link.svg";
import { ReactComponent as MetamaskIcon } from "app/icons/metamask.svg";
import { ReactComponent as MetamaskEnabledIcon } from "app/icons/metamask-enabled.svg";
import { ReactComponent as CloseIcon } from "app/icons/close.svg";
import SettingsHeader from "app/components/elements/SettingsHeader";
import Separator from "app/components/elements/Seperator";
import IconedButton from "app/components/elements/IconedButton";
import Switcher from "app/components/elements/Switcher";

const Web3: FC = () => {
  const metamaskMode = useAtomValue(web3MetaMaskCompatibleAtom);
  const setMetamaskMode = useSetMetaMaskCompatibleMode(false);

  const metamaskModeEnabled = metamaskMode === MetaMaskCompatibleMode.Strict;

  return (
    <div className="flex flex-col items-start">
      <SettingsHeader className="!mb-3">Connect as MetaMask</SettingsHeader>

      <p className="mb-6 text-sm text-brand-font max-w-[30rem]">
        When enabled - use the MetaMask connection button to connect to dApps
        only if the Wigwam wallet option is unavailable on the website.
        <br />
        Otherwise, choose only Wigwam wallet!
      </p>

      <Switcher
        id="testNetworks"
        text={
          <span className="flex items-center">
            {metamaskModeEnabled ? (
              <MetamaskEnabledIcon className="w-5 min-w-5 h-auto" />
            ) : (
              <MetamaskIcon className="w-5 min-w-5 h-auto" />
            )}
            <span className="ml-3">
              {metamaskModeEnabled ? "Enabled" : "Disabled"}
            </span>
          </span>
        }
        checked={metamaskModeEnabled}
        onCheckedChange={() =>
          setMetamaskMode(
            metamaskModeEnabled
              ? MetaMaskCompatibleMode.Off
              : MetaMaskCompatibleMode.Strict,
          )
        }
        className="min-w-[17.75rem]"
      />

      <PermissionsList />
    </div>
  );
};

export default Web3;

const PermissionsList = memo(() => {
  const allPermissions = useLazyAtomValue(getAllPermissionsAtom({}));

  const revokePermission = useCallback(
    async (origin: string, evt: MouseEvent<HTMLButtonElement>) => {
      evt.preventDefault();
      evt.stopPropagation();

      try {
        await repo.permissions.delete(origin);
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

  if (!allPermissions || allPermissions.length === 0) return null;

  return (
    <>
      <Separator className="mt-6 mb-8" />

      <SettingsHeader>Connected apps</SettingsHeader>

      <div className="w-full max-w-[25rem] flex-col">
        {allPermissions.map((perm) => (
          <a
            key={perm.id}
            href={perm.origin}
            target="_blank"
            rel="noopener noreferrer"
            className={classNames(
              "mb-4 w-full",
              "bg-brand-inactivelight/5",
              "border border-brand-inactivedark/25",
              "transition-colors",
              "hover:bg-brand-inactivelight/10",
              "rounded-lg",
              "flex items-center py-2 pl-4 pr-2",
              "text-base text-brand-light font-medium",
              "hover:underline",
            )}
          >
            <span className="min-w-0 truncate">
              {new URL(perm.origin).protocol === "https:"
                ? new URL(perm.origin).host
                : perm.origin}
            </span>
            <ExternalLinkIcon className="ml-1 w-5 min-w-[1.25rem] h-auto mr-4" />

            <IconedButton
              aria-label={`Revoke permission for ${new URL(perm.origin).host}`}
              Icon={CloseIcon}
              theme="tertiary"
              className="!w-6 !h-6 min-w-[1.5rem] ml-auto"
              iconClassName="!w-[1.125rem]"
              onClick={(evt: MouseEvent<HTMLButtonElement>) =>
                revokePermission(perm.origin, evt)
              }
            />
          </a>
        ))}
      </div>
    </>
  );
});
