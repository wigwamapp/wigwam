import { FC, memo, MouseEvent, useCallback } from "react";
import classNames from "clsx";
import { useLazyAtomValue } from "lib/atom-utils";

import * as repo from "core/repo";

import { getAllPermissionsAtom } from "app/atoms";

import { ReactComponent as ExternalLinkIcon } from "app/icons/external-link.svg";
import { ReactComponent as CloseIcon } from "app/icons/close.svg";
import SettingsHeader from "app/components/elements/SettingsHeader";
import Separator from "app/components/elements/Seperator";
import IconedButton from "app/components/elements/IconedButton";
import WebThreeCompatible from "app/components/blocks/WebThreeCompatible";

const Web3: FC = () => (
  <div className="flex flex-col items-start">
    <SettingsHeader className="!mb-3">Web3</SettingsHeader>

    <p className="mb-6 text-sm text-brand-font max-w-[30rem]">
      Vigvam is always available to interact with applications using its
      communication protocol `window.vigvamEthereum`. Vigvam also supports a
      common communication protocol, like MetaMask. Learn more about{" "}
      <a
        href="https://vigvamapp.medium.com/how-vigvam-wallet-may-be-connected-to-any-dapp-with-the-aid-of-metamask-b688f9757184"
        target="_blank"
        rel="nofollow noreferrer"
        className="underline"
      >
        how it works here
      </a>
      .
    </p>

    <WebThreeCompatible />

    <PermissionsList />
  </div>
);

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
    []
  );

  if (!allPermissions || allPermissions.length === 0) return null;

  return (
    <>
      <Separator className="mt-6 mb-8" />

      <SettingsHeader>Permissions</SettingsHeader>

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
              "hover:underline"
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
